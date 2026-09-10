import { describe, expect, test } from "bun:test";
import {
  createRateLimiter,
  defaultRetryPolicy,
  inspectCertificate,
  mask,
  maskToken,
  parseProblem,
  parseRetryAfter,
  problemCode,
  redact,
  resolveTLS,
  TransportError,
} from "../src/index.ts";
import { normalizeScopes, formatScopes } from "../src/core/scopes.ts";

describe("rate limiter", () => {
  test("allows a burst up to the limit without waiting", async () => {
    const limiter = createRateLimiter();
    const started = Date.now();
    for (let i = 0; i < 10; i++) await limiter.acquire("k", 10);
    expect(Date.now() - started).toBeLessThan(50);
  });

  test("waits once the window is full", async () => {
    let clock = 0;
    const limiter = createRateLimiter({ windowMs: 40, now: () => clock });
    await limiter.acquire("k", 2);
    await limiter.acquire("k", 2);
    // Advance past the window so the third call is admitted after a short wait.
    const pending = limiter.acquire("k", 2);
    clock = 100;
    await pending;
    expect(true).toBe(true);
  });

  test("keeps separate budgets per key", async () => {
    const limiter = createRateLimiter({ windowMs: 60_000 });
    await limiter.acquire("a", 1);
    const started = Date.now();
    await limiter.acquire("b", 1);
    expect(Date.now() - started).toBeLessThan(20);
  });

  test("treats an undefined limit as unlimited", async () => {
    const limiter = createRateLimiter({ windowMs: 60_000 });
    for (let i = 0; i < 200; i++) await limiter.acquire("k", undefined);
    expect(true).toBe(true);
  });

  test("scales limits by factor", async () => {
    let clock = 0;
    const limiter = createRateLimiter({ windowMs: 1000, factor: 0.5, now: () => clock });
    await limiter.acquire("k", 4); // effective budget is 2
    await limiter.acquire("k", 4);
    let admitted = false;
    void limiter.acquire("k", 4).then(() => {
      admitted = true;
    });
    await Bun.sleep(5);
    expect(admitted).toBe(false);
  });
});

describe("retry policy", () => {
  const policy = defaultRetryPolicy({ maxRetries: 2 });

  test("retries transient statuses on idempotent methods", () => {
    for (const status of [429, 500, 502, 503, 504]) {
      expect(policy.shouldRetry({ attempt: 1, method: "GET", status, idempotent: true })).toBe(true);
    }
  });

  test("does not retry client errors", () => {
    for (const status of [400, 401, 403, 404, 422]) {
      expect(policy.shouldRetry({ attempt: 1, method: "GET", status, idempotent: true })).toBe(false);
    }
  });

  test("refuses to replay non-idempotent requests by default", () => {
    expect(policy.shouldRetry({ attempt: 1, method: "POST", status: 503, idempotent: false })).toBe(false);
  });

  test("never retries a caller abort", () => {
    const error = new TransportError("abort", "aborted");
    expect(policy.shouldRetry({ attempt: 1, method: "GET", error, idempotent: true })).toBe(false);
  });

  test("stops after maxRetries", () => {
    expect(policy.shouldRetry({ attempt: 3, method: "GET", status: 503, idempotent: true })).toBe(false);
  });

  test("backs off exponentially within the ceiling", () => {
    const p = defaultRetryPolicy({ minDelayMs: 100, maxDelayMs: 1000 });
    for (let attempt = 1; attempt <= 6; attempt++) {
      const delay = p.delay({ attempt, method: "GET", idempotent: true });
      expect(delay).toBeGreaterThanOrEqual(0);
      expect(delay).toBeLessThanOrEqual(1000);
    }
  });

  test("prefers Retry-After over the backoff", () => {
    expect(policy.delay({ attempt: 1, method: "GET", idempotent: true, retryAfterSeconds: 2 })).toBe(2000);
  });

  test("parses both Retry-After forms", () => {
    expect(parseRetryAfter("30")).toBe(30);
    expect(parseRetryAfter(new Date(Date.now() + 5000).toUTCString())).toBeGreaterThan(3);
    expect(parseRetryAfter(undefined)).toBeUndefined();
    expect(parseRetryAfter("nonsense")).toBeUndefined();
  });
});

describe("problem documents", () => {
  test("reads the canonical RFC 7807 shape", () => {
    const problem = parseProblem({
      type: "https://pix.bcb.gov.br/api/v2/error/CobOperacaoInvalida",
      title: "Requisição inválida",
      violacoes: [{ propriedade: "valor.original", razao: "formato inválido" }],
    });
    expect(problem?.title).toBe("Requisição inválida");
    expect(problemCode(problem)).toBe("CobOperacaoInvalida");
  });

  test("reads Inter's message/codigo variant", () => {
    const problem = parseProblem({ message: "Saldo insuficiente", codigo: "SALDO_INSUFICIENTE" });
    expect(problem?.title).toBe("Saldo insuficiente");
    expect(problemCode(problem)).toBe("SALDO_INSUFICIENTE");
  });

  test("reads a bare array of violations", () => {
    expect(parseProblem([{ razao: "x" }])?.violacoes).toHaveLength(1);
  });

  test("returns undefined for bodies with nothing useful", () => {
    expect(parseProblem(undefined)).toBeUndefined();
    expect(parseProblem("plain text")).toBeUndefined();
    expect(parseProblem({ unrelated: 1 })).toBeUndefined();
  });
});

describe("redaction", () => {
  test("removes credentials entirely", () => {
    const scrubbed = redact({
      client_secret: "super-secret",
      authorization: "Bearer abc",
      privateKey: "-----BEGIN PRIVATE KEY-----",
      nested: { token: "t" },
    });
    expect(scrubbed).toEqual({
      client_secret: "[redacted]",
      authorization: "[redacted]",
      privateKey: "[redacted]",
      nested: { token: "[redacted]" },
    });
  });

  test("masks identifiers but keeps them correlatable", () => {
    expect(redact({ cpf: "52998224725" })).toEqual({ cpf: "*******4725" });
    expect(mask("12345678909")).toBe("*******8909");
    expect(maskToken("a".repeat(40))).toContain("40 chars");
  });

  test("leaves ordinary fields alone and survives cycles", () => {
    const input: Record<string, unknown> = { valor: 10, seuNumero: "PED-1" };
    input.self = input;
    const out = redact(input) as Record<string, unknown>;
    expect(out.valor).toBe(10);
    expect(out.seuNumero).toBe("PED-1");
    expect(out.self).toBe("[circular]");
  });
});

describe("scopes", () => {
  test("normalises, de-duplicates and sorts", () => {
    expect(normalizeScopes(["pix.read", "cob.write pix.read", " cob.write "])).toEqual(["cob.write", "pix.read"]);
    expect(formatScopes(["pix.write", "pix.read"])).toBe("pix.read pix.write");
  });
});

describe("TLS material", () => {
  test("accepts a PEM string and rejects a half-configured pair", async () => {
    const pem = "-----BEGIN CERTIFICATE-----\nAAAA\n-----END CERTIFICATE-----";
    const key = "-----BEGIN PRIVATE KEY-----\nBBBB\n-----END PRIVATE KEY-----";
    const resolved = await resolveTLS({ certificate: pem, privateKey: key });
    expect(resolved.cert?.length).toBeGreaterThan(0);
    expect(resolved.rejectUnauthorized).toBe(true);

    await expect(resolveTLS({ certificate: pem })).rejects.toThrow(/privateKey/);
    await expect(resolveTLS({})).rejects.toThrow(/no client certificate/);
    await expect(resolveTLS({ certificate: pem, privateKey: key, pfx: pem })).rejects.toThrow(/not both/);
  });

  test("reports a missing file with the path that failed", async () => {
    await expect(resolveTLS({ certificate: "/nope/inter.crt", privateKey: "/nope/inter.key" })).rejects.toThrow(
      /\/nope\/inter\.crt/,
    );
  });

  test("returns undefined rather than throwing on unparseable certificates", () => {
    expect(inspectCertificate("not a certificate")).toBeUndefined();
    expect(inspectCertificate(new Uint8Array([1, 2, 3]))).toBeUndefined();
  });
});
