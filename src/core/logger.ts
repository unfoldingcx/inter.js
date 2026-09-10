/**
 * Logging and redaction.
 *
 * The SDK never logs on its own unless you give it a logger. When you do, every
 * value that flows through {@link redact} is scrubbed first: bearer tokens,
 * client secrets, private keys, CPF/CNPJ, Pix keys and account numbers.
 */

/** Severity levels, ordered from most to least verbose. */
export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_WEIGHT: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

/** Anything that can receive the SDK's structured log records. */
export interface Logger {
  debug(message: string, fields?: Record<string, unknown>): void;
  info(message: string, fields?: Record<string, unknown>): void;
  warn(message: string, fields?: Record<string, unknown>): void;
  error(message: string, fields?: Record<string, unknown>): void;
}

/** Discards everything. The default. */
export const silentLogger: Logger = {
  debug() {},
  info() {},
  warn() {},
  error() {},
};

/**
 * A logger that writes single-line JSON to `console`, at or above `level`.
 *
 * @example
 * const inter = new InterClient({ ..., logger: consoleLogger("debug") });
 */
export function consoleLogger(level: LogLevel = "info"): Logger {
  const min = LEVEL_WEIGHT[level];
  const emit = (lvl: LogLevel, message: string, fields?: Record<string, unknown>): void => {
    if (LEVEL_WEIGHT[lvl] < min) return;
    const record = { level: lvl, source: "inter.js", time: new Date().toISOString(), message, ...redact(fields ?? {}) };
    const line = JSON.stringify(record);
    if (lvl === "error") console.error(line);
    else if (lvl === "warn") console.warn(line);
    else console.log(line);
  };
  return {
    debug: (m, f) => emit("debug", m, f),
    info: (m, f) => emit("info", m, f),
    warn: (m, f) => emit("warn", m, f),
    error: (m, f) => emit("error", m, f),
  };
}

/** Wraps a logger so records below `level` are dropped. */
export function withLevel(logger: Logger, level: LogLevel): Logger {
  const min = LEVEL_WEIGHT[level];
  const gate =
    (lvl: LogLevel, fn: Logger[LogLevel]): Logger[LogLevel] =>
    (message, fields) => {
      if (LEVEL_WEIGHT[lvl] >= min) fn.call(logger, message, fields);
    };
  return {
    debug: gate("debug", logger.debug),
    info: gate("info", logger.info),
    warn: gate("warn", logger.warn),
    error: gate("error", logger.error),
  };
}

/** Placeholder substituted for any redacted value. */
export const REDACTED = "[redacted]";

/** Header names whose values are always replaced wholesale. */
const SECRET_HEADERS = new Set(["authorization", "proxy-authorization", "cookie", "set-cookie", "x-api-key"]);

/** Object keys whose values are always replaced wholesale. */
const SECRET_KEYS = new Set([
  "access_token",
  "accesstoken",
  "authorization",
  "cert",
  "certificate",
  "client_secret",
  "clientsecret",
  "id_token",
  "key",
  "passphrase",
  "password",
  "pfx",
  "privatekey",
  "private_key",
  "refresh_token",
  "secret",
  "senha",
  "token",
]);

/** Object keys whose values are partially masked so they stay correlatable. */
const PARTIAL_KEYS = new Set([
  "chave",
  "cnpj",
  "cnpjcpf",
  "conta",
  "contacorrente",
  "cpf",
  "cpfcnpj",
  "email",
  "telefone",
  "x-conta-corrente",
]);

/**
 * Recursively scrubs secrets from a value so it is safe to log.
 *
 * Whole-value redaction applies to credentials; identifiers such as CPF, CNPJ
 * and Pix keys are masked down to their last four characters so log lines remain
 * useful for correlation without carrying personal data.
 */
export function redact<T>(value: T, seen = new WeakSet<object>()): T {
  if (value == null || typeof value !== "object") return value;
  if (seen.has(value as object)) return "[circular]" as unknown as T;
  seen.add(value as object);

  if (Array.isArray(value)) return value.map((v) => redact(v, seen)) as unknown as T;
  if (value instanceof Date || value instanceof Error) return value;

  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    const lower = key.toLowerCase();
    if (SECRET_KEYS.has(lower) || SECRET_HEADERS.has(lower)) out[key] = REDACTED;
    else if (PARTIAL_KEYS.has(lower) && typeof raw === "string") out[key] = mask(raw);
    else out[key] = redact(raw, seen);
  }
  return out as unknown as T;
}

/**
 * Masks all but the last four characters of a string.
 *
 * @example mask("12345678909") // => "*******8909"
 */
export function mask(value: string, keep = 4): string {
  if (!value) return value;
  if (value.length <= keep) return "*".repeat(value.length);
  return "*".repeat(value.length - keep) + value.slice(-keep);
}

/** Masks a bearer token down to a short, stable fingerprint. */
export function maskToken(token: string): string {
  if (token.length <= 12) return REDACTED;
  return `${token.slice(0, 4)}…${token.slice(-4)} (${token.length} chars)`;
}
