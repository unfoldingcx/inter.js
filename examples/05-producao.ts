/**
 * The settings a production deployment actually wants: a shared token cache, a
 * little rate-limit headroom, tracing hooks and startup validation.
 *
 *   bun run examples/05-producao.ts
 */
import { InterClient, consoleLogger } from "../src/index.ts";
import type { TokenRecord, TokenStore } from "../src/index.ts";

/**
 * Back the token cache with Redis so every replica shares one token. Without
 * this, the token endpoint's five-calls-per-minute budget is divided by your
 * replica count rather than shared.
 */
function redisTokenStore(redis: {
  get(k: string): Promise<string | null>;
  set(k: string, v: string, mode: "EX", ttl: number): Promise<unknown>;
  del(k: string): Promise<unknown>;
}): TokenStore {
  return {
    async get(key) {
      const raw = await redis.get(`inter:token:${key}`);
      return raw ? (JSON.parse(raw) as TokenRecord) : undefined;
    },
    async set(key, record) {
      const ttl = Math.max(1, Math.floor((record.expiresAt - Date.now()) / 1000));
      await redis.set(`inter:token:${key}`, JSON.stringify(record), "EX", ttl);
    },
    async delete(key) {
      await redis.del(`inter:token:${key}`);
    },
  };
}

const inter = new InterClient({
  environment: "production",

  // Credentials and certificate come from the environment or a secrets manager.
  // Passing PEM strings avoids writing private keys to the filesystem.
  clientId: process.env.INTER_CLIENT_ID,
  clientSecret: process.env.INTER_CLIENT_SECRET,
  certificate: process.env.INTER_CERTIFICATE_PEM ?? "./certs/inter.crt",
  privateKey: process.env.INTER_PRIVATE_KEY_PEM ?? "./certs/inter.key",

  // Leave a fifth of every endpoint's budget for other processes on the same
  // integration.
  rateLimit: { factor: 0.8 },

  retry: { maxRetries: 4, minDelayMs: 250, maxDelayMs: 10_000 },
  timeout: 20_000,

  // tokenStore: redisTokenStore(redis),

  logger: consoleLogger("info"),
  hooks: {
    onRequest: ({ method, url, attempt }) => {
      if (attempt > 1) console.warn(`retrying ${method} ${url} (attempt ${attempt})`);
    },
    onResponse: ({ status, durationMs, requestId }) => {
      // metrics.histogram("inter.request.duration", durationMs, { status });
      void status;
      void durationMs;
      void requestId;
    },
    onError: ({ url, attempts, error }) => {
      console.error(`inter call failed after ${attempts} attempt(s): ${url}`, error);
    },
  },
});

// Turn a bad certificate into a boot failure rather than a failed payment at
// 3am. The client also warns through the logger when expiry is near.
await inter.ready();
console.log(`ready — certificate expires ${inter.certificate?.notAfter.toISOString().slice(0, 10)}`);

// One integration, several current accounts: derived clients share this one's
// connection pool, token cache and rate-limit state.
const contas = (process.env.INTER_CONTAS ?? "").split(",").filter(Boolean);
for (const conta of contas) {
  const scoped = inter.withAccount(conta);
  const saldo = await scoped.banking.saldo();
  console.log(conta, saldo.disponivel);
}

void redisTokenStore;
await inter.close();
