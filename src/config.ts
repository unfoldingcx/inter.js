/**
 * Client configuration: option types, defaults and environment resolution.
 */

import { InterConfigurationError } from "./core/errors.ts";
import type { Logger, LogLevel } from "./core/logger.ts";
import type { InterHooks } from "./core/http.ts";
import type { RetryOptions } from "./core/retry.ts";
import type { RateLimiterOptions } from "./core/rate-limit.ts";
import type { ScopeStrategy, TokenStore } from "./core/auth.ts";
import type { InterScope } from "./core/scopes.ts";
import type { CertificateSource } from "./core/tls.ts";
import type { Transport } from "./core/transport/types.ts";

/** Which Banco Inter environment to talk to. */
export type InterEnvironment = "production" | "sandbox";

/** Host for each environment. */
export const INTER_BASE_URLS: Record<InterEnvironment, string> = {
  production: "https://cdpj.partners.bancointer.com.br",
  sandbox: "https://cdpj-sandbox.partners.uatinter.co",
};

/** Base paths of the individual APIs, relative to the environment host. */
export const INTER_BASE_PATHS = {
  oauth: "/oauth/v2",
  cobranca: "/cobranca/v3",
  banking: "/banking/v2",
  pix: "/pix/v2",
  pixAutomatico: "/pix/v2",
} as const;

/** Everything you can hand to `new InterClient(...)`. */
export interface InterClientOptions {
  // -- credentials ---------------------------------------------------------

  /**
   * `clientId` shown in Internet Banking under `Integrar > Minhas integrações`.
   * Falls back to `INTER_CLIENT_ID`.
   */
  clientId?: string;
  /**
   * `clientSecret` shown once when the integration's key and certificate are
   * downloaded. Falls back to `INTER_CLIENT_SECRET`.
   */
  clientSecret?: string;

  // -- mTLS ----------------------------------------------------------------

  /**
   * The integration's `.crt`. A file path, a PEM string, or raw bytes.
   * Falls back to `INTER_CERTIFICATE`.
   */
  certificate?: CertificateSource;
  /**
   * The integration's `.key`. Same accepted forms as {@link certificate}.
   * Falls back to `INTER_PRIVATE_KEY`.
   */
  privateKey?: CertificateSource;
  /** A PKCS#12 bundle instead of a separate certificate and key. */
  pfx?: CertificateSource;
  /** Passphrase for {@link privateKey} or {@link pfx}. */
  passphrase?: string;
  /** Extra certificate authorities to trust for Inter's server certificate. */
  ca?: CertificateSource | CertificateSource[];
  /**
   * Disable server certificate verification. Debugging aid only — it removes the
   * guarantee that you are talking to Banco Inter.
   *
   * @default true
   */
  rejectUnauthorized?: boolean;

  // -- targeting -----------------------------------------------------------

  /**
   * Which environment to call. The sandbox only runs 08:00–20:00 BRT on weekdays.
   * Falls back to `INTER_ENVIRONMENT`.
   *
   * @default "production"
   */
  environment?: InterEnvironment;
  /** Overrides the host entirely. Useful for a recording proxy or a mock server. */
  baseUrl?: string;
  /**
   * Account number sent as `x-conta-corrente`. Required when the integration is
   * linked to more than one account. Falls back to `INTER_CONTA_CORRENTE`.
   */
  contaCorrente?: string;

  // -- authorization -------------------------------------------------------

  /**
   * Scopes to request. With the default `"auto"` strategy this is a seed set and
   * the client widens the token as calls need more; with `"fixed"` it is the
   * exact set every token carries.
   */
  scopes?: readonly InterScope[];
  /** @default "auto" */
  scopeStrategy?: ScopeStrategy;
  /**
   * Where access tokens are cached. Defaults to an in-process map. Point this at
   * Redis when several instances share one integration, so the token endpoint's
   * five-calls-per-minute budget is not multiplied by your replica count.
   */
  tokenStore?: TokenStore;
  /**
   * Renew a token this many milliseconds before it expires.
   *
   * @default 60000
   */
  tokenExpirySkewMs?: number;

  // -- behaviour -----------------------------------------------------------

  /**
   * Per-attempt timeout, in milliseconds.
   *
   * @default 30000
   */
  timeout?: number;
  /** Retry policy, or `false` to fail on the first error. */
  retry?: RetryOptions | false;
  /**
   * Client-side pacing against the documented per-endpoint budgets, or `false`
   * to send as fast as you like and handle `429` yourself.
   */
  rateLimit?: RateLimiterOptions | false;
  /**
   * Warn when the client certificate is within this many days of expiring.
   * Set to `0` to disable. Production certificates last a year, sandbox ones 30 days.
   *
   * @default 30
   */
  certificateExpiryWarningDays?: number;

  // -- observability -------------------------------------------------------

  /** Where the SDK writes structured logs. Silent unless you provide one. */
  logger?: Logger;
  /** Convenience: installs {@link consoleLogger} at this level when no `logger` is given. */
  logLevel?: LogLevel;
  /** Lifecycle callbacks for tracing and metrics. */
  hooks?: InterHooks;
  /**
   * Include request and response bodies in debug logs. Off by default because
   * those bodies carry CPF, CNPJ, names and amounts.
   *
   * @default false
   */
  debugBodies?: boolean;

  // -- transport -----------------------------------------------------------

  /** Replaces the runtime-selected HTTP stack. */
  transport?: Transport;
  /** `fetch` implementation for the fetch-based transports. */
  fetch?: typeof globalThis.fetch;
  /** Extra `fetch` options, e.g. `{ dispatcher }` to supply an `undici` agent. */
  fetchOptions?: Record<string, unknown>;
  /** Reuse sockets between requests. @default true */
  keepAlive?: boolean;
  /** Maximum concurrent sockets per origin. @default 64 */
  maxSockets?: number;
  /** Headers added to every request. */
  headers?: Record<string, string>;
  /** Overrides the `User-Agent`. */
  userAgent?: string;
}

/** Configuration after defaults and environment variables are applied. */
export interface ResolvedConfig extends InterClientOptions {
  clientId: string;
  clientSecret: string;
  environment: InterEnvironment;
  baseUrl: string;
  timeout: number;
  certificateExpiryWarningDays: number;
}

type EnvSource = Record<string, string | undefined>;

/** Reads the process environment on whichever runtime is hosting us. */
export function readEnv(): EnvSource {
  const g = globalThis as { process?: { env?: EnvSource }; Deno?: { env?: { toObject(): EnvSource } } };
  if (g.process?.env) return g.process.env;
  try {
    return g.Deno?.env?.toObject() ?? {};
  } catch {
    return {};
  }
}

/** Applies environment variables and defaults, and validates what is required. */
export function resolveConfig(options: InterClientOptions = {}, env: EnvSource = readEnv()): ResolvedConfig {
  const clientId = options.clientId ?? env.INTER_CLIENT_ID;
  const clientSecret = options.clientSecret ?? env.INTER_CLIENT_SECRET;

  if (!clientId) {
    throw new InterConfigurationError("`clientId` is required. Pass it directly or set INTER_CLIENT_ID.");
  }
  if (!clientSecret) {
    throw new InterConfigurationError("`clientSecret` is required. Pass it directly or set INTER_CLIENT_SECRET.");
  }

  const envName = (options.environment ?? env.INTER_ENVIRONMENT ?? "production").toLowerCase();
  const environment: InterEnvironment =
    envName === "sandbox" || envName === "homologacao" || envName === "homologação" ? "sandbox" : "production";

  if (options.environment && !["production", "sandbox"].includes(options.environment)) {
    throw new InterConfigurationError(`unknown environment "${options.environment}". Use "production" or "sandbox".`);
  }

  const baseUrl = (options.baseUrl ?? env.INTER_BASE_URL ?? INTER_BASE_URLS[environment]).replace(/\/+$/, "");

  return {
    ...options,
    clientId,
    clientSecret,
    certificate: options.certificate ?? env.INTER_CERTIFICATE,
    privateKey: options.privateKey ?? env.INTER_PRIVATE_KEY,
    pfx: options.pfx ?? env.INTER_PFX,
    passphrase: options.passphrase ?? env.INTER_PASSPHRASE,
    contaCorrente: options.contaCorrente ?? env.INTER_CONTA_CORRENTE,
    environment,
    baseUrl,
    timeout: options.timeout ?? 30_000,
    certificateExpiryWarningDays: options.certificateExpiryWarningDays ?? 30,
  };
}
