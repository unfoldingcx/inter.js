/**
 * End-to-end coverage against a local server that behaves the way Banco Inter
 * does: it demands a client certificate, issues OAuth tokens and answers the
 * real endpoint paths. Nothing here touches the network.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import https from "node:https";
import type { AddressInfo } from "node:net";
import { InterClient, InterConnectionError, InterValidationError } from "../src/index.ts";
import { createWebhookServer, parseWebhook } from "../src/webhooks/index.ts";
import type { ParsedWebhook } from "../src/webhooks/index.ts";
import { CA_CERT, CLIENT_CERT, CLIENT_KEY, SERVER_CERT, SERVER_KEY, UNTRUSTED_CERT, UNTRUSTED_KEY } from "./fixtures/mtls.ts";

interface SeenRequest {
  method: string;
  path: string;
  headers: Record<string, string | string[] | undefined>;
  body: string;
  clientCN?: string;
}

let server: https.Server;
let baseUrl: string;
const seen: SeenRequest[] = [];

beforeAll(async () => {
  server = https.createServer(
    { cert: SERVER_CERT, key: SERVER_KEY, ca: CA_CERT, requestCert: true, rejectUnauthorized: true },
    (req, res) => {
      const chunks: Buffer[] = [];
      req.on("data", (c: Buffer) => chunks.push(c));
      req.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf8");
        const url = new URL(req.url ?? "/", "https://localhost");
        // Bun's node:https shim does not expose getPeerCertificate; the fact
        // that the connection was accepted at all already proves the client
        // certificate passed, because the listener sets rejectUnauthorized.
        const socket = req.socket as unknown as { getPeerCertificate?: () => { subject?: { CN?: string } } };
        const peer = socket.getPeerCertificate?.();
        seen.push({ method: req.method ?? "", path: url.pathname, headers: req.headers, body, clientCN: peer?.subject?.CN });

        const send = (status: number, payload: unknown): void => {
          res.writeHead(status, { "content-type": "application/json", "x-request-id": "req-integration" });
          res.end(JSON.stringify(payload));
        };

        if (url.pathname === "/oauth/v2/token") {
          const scope = new URLSearchParams(body).get("scope") ?? "";
          return send(200, { access_token: "integration-token", token_type: "Bearer", expires_in: 3600, scope });
        }
        if (url.pathname === "/banking/v2/saldo") {
          return send(200, { disponivel: 4242.42, dataReferencia: "2026-03-15" });
        }
        if (url.pathname === "/pix/v2/cob" && req.method === "POST") {
          const parsed = JSON.parse(body) as { valor?: { original?: string } };
          if (!parsed.valor?.original) {
            return send(400, {
              type: "https://pix.bcb.gov.br/api/v2/error/CobOperacaoInvalida",
              title: "Requisição inválida",
              violacoes: [{ propriedade: "valor.original", razao: "campo obrigatório" }],
            });
          }
          return send(201, { txid: "TX123", pixCopiaECola: "0002...", valor: parsed.valor, status: "ATIVA" });
        }
        return send(404, { title: "não encontrado" });
      });
    },
  );

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `https://localhost:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

function client(overrides = {}) {
  return new InterClient({
    clientId: "integration-id",
    clientSecret: "integration-secret",
    certificate: CLIENT_CERT,
    privateKey: CLIENT_KEY,
    ca: CA_CERT,
    baseUrl,
    rateLimit: false,
    ...overrides,
  });
}

describe("mTLS against a live server", () => {
  test("presents the client certificate and completes a real call", async () => {
    const inter = client();
    const saldo = await inter.banking.saldo();

    expect(saldo.disponivel).toBe(4242.42);
    const call = seen.find((r) => r.path === "/banking/v2/saldo")!;
    // Only asserted where the runtime exposes the peer certificate.
    if (call.clientCN !== undefined) expect(call.clientCN).toBe("inter-integration-client");
    expect(call.headers.authorization).toBe("Bearer integration-token");

    const token = seen.find((r) => r.path === "/oauth/v2/token")!;
    expect(new URLSearchParams(token.body).get("scope")).toBe("extrato.read");
    await inter.close();
  });

  test("round-trips a JSON body and returns the parsed response", async () => {
    const inter = client();
    const cob = await inter.pix.cob.create({ chave: "pix@example.com", valor: { original: "10.00" }, calendario: { expiracao: 3600 } });

    expect(cob.txid).toBe("TX123");
    const call = seen.filter((r) => r.path === "/pix/v2/cob").at(-1)!;
    expect(JSON.parse(call.body)).toMatchObject({ chave: "pix@example.com" });
    await inter.close();
  });

  test("turns an RFC 7807 rejection into a typed error", async () => {
    const inter = client({ retry: false });
    try {
      await inter.pix.cob.create({ chave: "k" } as never);
      throw new Error("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(InterValidationError);
      const problem = err as InterValidationError;
      expect(problem.status).toBe(400);
      expect(problem.violations[0]?.propriedade).toBe("valor.original");
      expect(problem.context.requestId).toBe("req-integration");
    }
    await inter.close();
  });

  test("fails clearly when the certificate is not the one the server trusts", async () => {
    const inter = client({ certificate: UNTRUSTED_CERT, privateKey: UNTRUSTED_KEY, retry: false });
    await expect(inter.banking.saldo()).rejects.toBeInstanceOf(InterConnectionError);
    await inter.close();
  });

  test("reports the certificate's validity window", async () => {
    const inter = client();
    await inter.ready();
    expect(inter.certificate?.expired).toBe(false);
    expect(inter.certificate?.daysUntilExpiry).toBeGreaterThan(3000);
    await inter.close();
  });
});

describe("webhook listener", () => {
  test("accepts a callback signed by the trusted CA and rejects one that is not", async () => {
    const received: ParsedWebhook[] = [];
    const listener = await createWebhookServer({
      certificate: SERVER_CERT,
      privateKey: SERVER_KEY,
      interCA: CA_CERT,
      port: 0,
      host: "127.0.0.1",
      route: { "/webhooks/pix": "pix" },
      onEvent: (event) => {
        received.push(event);
      },
    });

    const payload = JSON.stringify({ pix: [{ endToEndId: "E2E-1", valor: "10.00", txid: "TX1" }] });

    const post = (cert: string, key: string): Promise<{ status: number; body: string }> =>
      new Promise((resolve, reject) => {
        const req = https.request(
          {
            hostname: "localhost",
            port: listener.port,
            path: "/webhooks/pix",
            method: "POST",
            cert,
            key,
            ca: CA_CERT,
            headers: { "content-type": "application/json" },
          },
          (res) => {
            const chunks: Buffer[] = [];
            res.on("data", (c: Buffer) => chunks.push(c));
            res.on("end", () => resolve({ status: res.statusCode ?? 0, body: Buffer.concat(chunks).toString() }));
          },
        );
        req.on("error", reject);
        req.end(payload);
      });

    const ok = await post(CLIENT_CERT, CLIENT_KEY);
    expect(ok.status).toBe(200);
    expect(received).toHaveLength(1);
    expect(received[0]!.events[0]).toMatchObject({ endToEndId: "E2E-1" });

    const impostor = await post(UNTRUSTED_CERT, UNTRUSTED_KEY);
    expect(impostor.status).toBe(401);
    expect(impostor.body).toContain("client certificate");
    expect(received).toHaveLength(1);

    await listener.close();
  });

  test("answers 404 for an unmapped path", async () => {
    const listener = await createWebhookServer({
      certificate: SERVER_CERT,
      privateKey: SERVER_KEY,
      interCA: CA_CERT,
      port: 0,
      host: "127.0.0.1",
      route: { "/webhooks/pix": "pix" },
      onEvent: () => {},
    });

    const status = await new Promise<number>((resolve, reject) => {
      const req = https.request(
        {
          hostname: "localhost",
          port: listener.port,
          path: "/nope",
          method: "POST",
          cert: CLIENT_CERT,
          key: CLIENT_KEY,
          ca: CA_CERT,
        },
        (res) => resolve(res.statusCode ?? 0),
      );
      req.on("error", reject);
      req.end("{}");
    });

    expect(status).toBe(404);
    await listener.close();
  });

  test("parses what the listener would receive without running a server", () => {
    const parsed = parseWebhook("pix", '{"pix":[{"endToEndId":"E1"}]}');
    expect(parsed.events).toHaveLength(1);
  });
});
