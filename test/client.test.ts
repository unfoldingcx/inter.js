import { describe, expect, test } from "bun:test";
import {
  InterAuthenticationError,
  InterClient,
  InterNotFoundError,
  InterPermissionError,
  InterRateLimitError,
  InterValidationError,
  isInterAPIError,
} from "../src/index.ts";
import { MockTransport } from "../src/testing.ts";

/** A client wired to a mock transport, with the token endpoint already stubbed. */
function makeClient(configure: (t: MockTransport) => void, options = {}) {
  const transport = new MockTransport().withToken("tok-123", "extrato.read boleto-cobranca.read");
  configure(transport);
  const inter = new InterClient({
    clientId: "client-id",
    clientSecret: "client-secret",
    transport,
    rateLimit: false,
    ...options,
  });
  return { inter, transport };
}

describe("authorization", () => {
  test("mints a token and sends it as a bearer header", async () => {
    const { inter, transport } = makeClient((t) => t.onGet("/banking/v2/saldo", { body: { disponivel: 1234.56 } }));

    const saldo = await inter.banking.saldo();

    expect(saldo.disponivel).toBe(1234.56);
    const tokenRequest = transport.requestsFor("/oauth/v2/token")[0]!;
    expect(tokenRequest.body).toContain("grant_type=client_credentials");
    expect(tokenRequest.body).toContain("client_id=client-id");
    expect(new URLSearchParams(tokenRequest.body!).get("scope")).toBe("extrato.read");
    expect(transport.requestsFor("/banking/v2/saldo")[0]!.headers.authorization).toBe("Bearer tok-123");
  });

  test("reuses one token across calls", async () => {
    const { inter, transport } = makeClient((t) =>
      t.onGet("/banking/v2/saldo", { body: { disponivel: 1 } }).onGet("/banking/v2/extrato", { body: { transacoes: [] } }),
    );

    await inter.banking.saldo();
    await inter.banking.extrato({ dataInicio: "2026-01-01", dataFim: "2026-01-31" });

    expect(transport.requestsFor("/oauth/v2/token")).toHaveLength(1);
  });

  test("widens the token when a call needs a scope the cached one lacks", async () => {
    const { inter, transport } = makeClient((t) =>
      t.onGet("/banking/v2/saldo", { body: {} }).onGet("/cobranca/v3/cobrancas", { body: { cobrancas: [] } }),
    );

    await inter.banking.saldo();
    await inter.cobranca.list({ dataInicial: "2026-01-01", dataFinal: "2026-01-31" });

    const tokenRequests = transport.requestsFor("/oauth/v2/token");
    expect(tokenRequests).toHaveLength(2);
    expect(new URLSearchParams(tokenRequests[0]!.body!).get("scope")).toBe("extrato.read");
    // The second token covers both scopes, so no further mint is needed.
    expect(new URLSearchParams(tokenRequests[1]!.body!).get("scope")).toBe("boleto-cobranca.read extrato.read");
  });

  test("shares a single token request between concurrent callers", async () => {
    const { inter, transport } = makeClient((t) => t.onGet("/banking/v2/saldo", { body: { disponivel: 1 } }));

    await Promise.all([inter.banking.saldo(), inter.banking.saldo(), inter.banking.saldo()]);

    expect(transport.requestsFor("/oauth/v2/token")).toHaveLength(1);
  });

  test("refreshes once when the API answers 401", async () => {
    let calls = 0;
    const { inter, transport } = makeClient((t) =>
      t.onGet("/banking/v2/saldo", () => {
        calls++;
        return calls === 1 ? { status: 401, body: { title: "expirado" } } : { body: { disponivel: 9 } };
      }),
    );

    expect((await inter.banking.saldo()).disponivel).toBe(9);
    expect(transport.requestsFor("/oauth/v2/token")).toHaveLength(2);
  });

  test("explains a failed token request in terms of integration scopes", async () => {
    const transport = new MockTransport().onPost("/oauth/v2/token", {
      status: 400,
      body: { title: "invalid_scope" },
    });
    const inter = new InterClient({ clientId: "a", clientSecret: "b", transport, rateLimit: false, retry: false });

    await expect(inter.banking.saldo()).rejects.toThrow(/Internet Banking/);
  });
});

describe("error mapping", () => {
  const cases: [number, unknown, new (...args: never[]) => Error][] = [
    [400, { title: "Requisição inválida" }, InterValidationError],
    [401, {}, InterAuthenticationError],
    [403, {}, InterPermissionError],
    [404, {}, InterNotFoundError],
    [429, {}, InterRateLimitError],
  ];

  for (const [status, body, expected] of cases) {
    test(`maps ${status} to ${expected.name}`, async () => {
      const { inter } = makeClient((t) => t.onGet("/banking/v2/saldo", { status, body }), { retry: false });
      await expect(inter.banking.saldo()).rejects.toBeInstanceOf(expected);
    });
  }

  test("surfaces RFC 7807 violations in the message and on the error", async () => {
    const { inter } = makeClient(
      (t) =>
        t.onPost("/cobranca/v3/cobrancas", {
          status: 400,
          body: {
            type: "https://pix.bcb.gov.br/api/v2/error/CobOperacaoInvalida",
            title: "Requisição inválida",
            detail: "O campo valorNominal é obrigatório",
            violacoes: [{ propriedade: "valorNominal", razao: "não pode ser nulo" }],
          },
        }),
      { retry: false },
    );

    try {
      await inter.cobranca.issue({} as never);
      throw new Error("should have thrown");
    } catch (err) {
      expect(isInterAPIError(err)).toBe(true);
      if (!isInterAPIError(err)) return;
      expect(err.status).toBe(400);
      expect(err.violations[0]?.propriedade).toBe("valorNominal");
      expect(err.message).toContain("valorNominal: não pode ser nulo");
      expect(err.message).toContain("O campo valorNominal é obrigatório");
      expect(err.context.method).toBe("POST");
    }
  });

  test("names the scope the endpoint needed on a 403", async () => {
    const { inter } = makeClient((t) => t.onGet("/banking/v2/saldo", { status: 403, body: {} }), { retry: false });
    try {
      await inter.banking.saldo();
    } catch (err) {
      expect((err as InterPermissionError).requiredScope).toBe("extrato.read");
    }
  });
});

describe("retries", () => {
  test("retries a GET after a 503 and reports the attempt count", async () => {
    let calls = 0;
    const { inter } = makeClient(
      (t) =>
        t.onGet("/banking/v2/saldo", () => {
          calls++;
          return calls < 3 ? { status: 503, body: {} } : { body: { disponivel: 7 } };
        }),
      { retry: { minDelayMs: 1, maxRetries: 3 } },
    );

    expect((await inter.banking.saldo()).disponivel).toBe(7);
    expect(calls).toBe(3);
  });

  test("does not replay a POST without an idempotency key", async () => {
    let calls = 0;
    const { inter } = makeClient(
      (t) =>
        t.onPost("/banking/v2/pagamento", () => {
          calls++;
          return { status: 503, body: {} };
        }),
      { retry: { minDelayMs: 1, maxRetries: 3 } },
    );

    await expect(
      inter.banking.pagamentos.payBoleto({ codBarraLinhaDigitavel: "x", valorPagar: 1 } as never),
    ).rejects.toThrow();
    expect(calls).toBe(1);
  });

  test("replays a POST that carries an idempotency key", async () => {
    let calls = 0;
    const { inter, transport } = makeClient(
      (t) =>
        t.onPost("/banking/v2/pagamento", () => {
          calls++;
          return calls < 2 ? { status: 503, body: {} } : { body: { codigoTransacao: "abc" } };
        }),
      { retry: { minDelayMs: 1, maxRetries: 3 } },
    );

    await inter.banking.pagamentos.payBoleto({ codBarraLinhaDigitavel: "x", valorPagar: 1 } as never, {
      idempotencyKey: "key-1",
    });

    expect(calls).toBe(2);
    expect(transport.requestsFor("/banking/v2/pagamento")[0]!.headers["x-id-idempotente"]).toBe("key-1");
  });

  test("honours Retry-After on a 429", async () => {
    let calls = 0;
    const started = Date.now();
    const { inter } = makeClient(
      (t) =>
        t.onGet("/banking/v2/saldo", () => {
          calls++;
          return calls === 1 ? { status: 429, headers: { "retry-after": "0" }, body: {} } : { body: { disponivel: 1 } };
        }),
      { retry: { minDelayMs: 5_000, maxRetries: 1 } },
    );

    await inter.banking.saldo();
    // The header said zero seconds, so the 5s backoff must not have been used.
    expect(Date.now() - started).toBeLessThan(1_000);
  });

  test("gives up after maxRetries", async () => {
    let calls = 0;
    const { inter } = makeClient(
      (t) =>
        t.onGet("/banking/v2/saldo", () => {
          calls++;
          return { status: 500, body: {} };
        }),
      { retry: { minDelayMs: 1, maxRetries: 2 } },
    );

    await expect(inter.banking.saldo()).rejects.toThrow();
    expect(calls).toBe(3);
  });
});

describe("request shaping", () => {
  test("formats dates and forwards filters as query parameters", async () => {
    const { inter, transport } = makeClient((t) => t.onGet("/cobranca/v3/cobrancas", { body: { cobrancas: [] } }));

    await inter.cobranca.list({
      dataInicial: new Date("2026-01-01T10:00:00Z"),
      dataFinal: "2026-01-31",
      situacao: "A_RECEBER",
    });

    const { query } = transport.requestsFor("/cobranca/v3/cobrancas")[0]!;
    expect(query.dataInicial).toBe("2026-01-01");
    expect(query.dataFinal).toBe("2026-01-31");
    expect(query.situacao).toBe("A_RECEBER");
  });

  test("substitutes path parameters and encodes them", async () => {
    const { inter, transport } = makeClient((t) => t.onGet(/\/pix\/v2\/cob\//, { body: { txid: "a b" } }));

    await inter.pix.cob.get("a b");

    expect(transport.lastRequest!.path).toBe("/pix/v2/cob/a%20b");
  });

  test("sends x-conta-corrente from the client and lets a call override it", async () => {
    const { inter, transport } = makeClient((t) => t.onGet("/banking/v2/saldo", { body: {} }), {
      contaCorrente: "1234567",
    });

    await inter.banking.saldo();
    await inter.banking.saldo(undefined, { contaCorrente: "7654321" });

    const requests = transport.requestsFor("/banking/v2/saldo");
    expect(requests[0]!.headers["x-conta-corrente"]).toBe("1234567");
    expect(requests[1]!.headers["x-conta-corrente"]).toBe("7654321");
  });

  test("withAccount binds a different account without re-authenticating", async () => {
    const { inter, transport } = makeClient((t) => t.onGet("/banking/v2/saldo", { body: {} }), {
      contaCorrente: "1111111",
    });

    await inter.banking.saldo();
    await inter.withAccount("2222222").banking.saldo();

    const requests = transport.requestsFor("/banking/v2/saldo");
    expect(requests[1]!.headers["x-conta-corrente"]).toBe("2222222");
    expect(transport.requestsFor("/oauth/v2/token")).toHaveLength(1);
  });

  test("auto-generates an idempotency key for outbound Pix", async () => {
    const { inter, transport } = makeClient((t) => t.onPost("/banking/v2/pix", { body: { codigoSolicitacao: "x" } }));

    await inter.banking.pixPagamento.send({ valor: 1, destinatario: { tipo: "CHAVE", chave: "k" } } as never);

    expect(transport.lastRequest!.headers["x-id-idempotente"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  test("sends a User-Agent that identifies the SDK", async () => {
    const { inter, transport } = makeClient((t) => t.onGet("/banking/v2/saldo", { body: {} }));
    await inter.banking.saldo();
    expect(transport.lastRequest!.headers["user-agent"]).toMatch(/^inter\.js\/\d+\.\d+\.\d+ \(/);
  });
});

describe("responses", () => {
  test("decodes a base64 PDF into bytes", async () => {
    const pdf = "JVBERi0xLjQK"; // "%PDF-1.4\n"
    const { inter } = makeClient((t) => t.onGet(/\/pdf$/, { body: { pdf } }));

    const bytes = await inter.cobranca.pdf("a4c6f0ed-d5ee-4ef7-a6eb-6b4149477adf");

    expect(new TextDecoder().decode(bytes)).toBe("%PDF-1.4\n");
  });

  test("treats 204 as an empty result", async () => {
    const { inter } = makeClient((t) => t.onDelete("/cobranca/v3/cobrancas/webhook", { status: 204 }));
    await expect(inter.cobranca.webhook.delete()).resolves.toBeUndefined();
  });

  test("find() returns undefined instead of throwing on 404", async () => {
    const { inter } = makeClient((t) => t.onGet(/\/cobrancas\//, { status: 404, body: {} }), { retry: false });
    await expect(inter.cobranca.find("missing")).resolves.toBeUndefined();
  });
});

describe("environments", () => {
  test("defaults to production", () => {
    const inter = new InterClient({ clientId: "a", clientSecret: "b", transport: new MockTransport() });
    expect(inter.environment).toBe("production");
    expect(inter.baseUrl).toBe("https://cdpj.partners.bancointer.com.br");
  });

  test("targets the sandbox host when asked", () => {
    const inter = new InterClient({
      clientId: "a",
      clientSecret: "b",
      environment: "sandbox",
      transport: new MockTransport(),
    });
    expect(inter.baseUrl).toBe("https://cdpj-sandbox.partners.uatinter.co");
  });

  test("requires credentials", () => {
    expect(() => new InterClient({ clientSecret: "b" })).toThrow(/clientId/);
  });
});

describe("cancellation", () => {
  test("throws InterAbortError when the signal is already aborted", async () => {
    const { inter } = makeClient((t) => t.onGet("/banking/v2/saldo", { body: {} }));
    const controller = new AbortController();
    controller.abort();

    await expect(inter.banking.saldo(undefined, { signal: controller.signal })).rejects.toMatchObject({
      name: "InterAbortError",
    });
  });

  test("throws InterAbortError when the signal fires mid-flight", async () => {
    const controller = new AbortController();
    const { inter } = makeClient((t) =>
      t.onGet("/banking/v2/saldo", async () => {
        controller.abort();
        await Bun.sleep(5);
        throw Object.assign(new Error("aborted"), { name: "AbortError" });
      }),
    );

    await expect(inter.banking.saldo(undefined, { signal: controller.signal })).rejects.toMatchObject({
      name: "InterAbortError",
    });
  });

  test("reports the abort through the onError hook exactly once", async () => {
    const errors: unknown[] = [];
    const controller = new AbortController();
    controller.abort();
    const { inter } = makeClient((t) => t.onGet("/banking/v2/saldo", { body: {} }), {
      hooks: { onError: ({ error }: { error: unknown }) => void errors.push(error) },
    });

    await expect(inter.banking.saldo(undefined, { signal: controller.signal })).rejects.toThrow();
    expect(errors).toHaveLength(1);
    expect((errors[0] as Error).name).toBe("InterAbortError");
  });

  test("refreshes the token on a 401 that arrives after an earlier retry", async () => {
    let calls = 0;
    const { inter, transport } = makeClient(
      (t) =>
        t.onGet("/banking/v2/saldo", () => {
          calls++;
          if (calls === 1) return { status: 503, body: {} };
          if (calls === 2) return { status: 401, body: {} };
          return { body: { disponivel: 3 } };
        }),
      { retry: { minDelayMs: 1, maxRetries: 3 } },
    );

    expect((await inter.banking.saldo()).disponivel).toBe(3);
    expect(calls).toBe(3);
    expect(transport.requestsFor("/oauth/v2/token")).toHaveLength(2);
  });
});
