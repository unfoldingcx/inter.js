/**
 * The request pipeline.
 *
 * One place where every call is assembled, authorised, paced, retried, decoded
 * and turned into either a typed result or a typed error. Resource classes are
 * thin wrappers that describe *what* to call; this module decides *how*.
 */

import type { EndpointMeta } from "../generated/endpoints.ts";
import { createAPIError, InterAbortError, InterConnectionError, InterError, InterTimeoutError } from "./errors.ts";
import type { InterErrorContext } from "./errors.ts";
import { parseProblem } from "./problem.ts";
import type { Problema } from "./problem.ts";
import type { Logger } from "./logger.ts";
import { redact } from "./logger.ts";
import type { RateLimiter } from "./rate-limit.ts";
import type { RetryPolicy } from "./retry.ts";
import { isIdempotentMethod, parseRetryAfter, sleep } from "./retry.ts";
import type { Transport, TransportResponse } from "./transport/types.ts";
import { TransportError } from "./transport/types.ts";
import type { TokenManager } from "./auth.ts";

/** How the response body should be decoded. */
export type ResponseType = "json" | "text" | "bytes" | "none";

/** A fully described API call. */
export interface CallOptions<T = unknown> {
  /** Metadata for the operation, straight from the generated table. */
  endpoint: EndpointMeta;
  /** Which API this belongs to; used for rate-limit bookkeeping and logs. */
  api: string;
  /** Base path prefixed to `endpoint.path`, e.g. `/cobranca/v3`. */
  basePath: string;
  /** Values for the `{placeholders}` in `endpoint.path`. */
  pathParams?: Record<string, string | number>;
  /** Query string values. `undefined` and `null` entries are dropped. */
  query?: Record<string, unknown>;
  /** Request body. Objects are JSON-encoded; strings are sent verbatim. */
  body?: unknown;
  /** Content type for a string body. @default "application/json" */
  contentType?: string;
  /** Extra headers, merged last. */
  headers?: Record<string, string>;
  /** Cancels the call, retries included. */
  signal?: AbortSignal;
  /** Overrides the client's per-attempt timeout. */
  timeoutMs?: number;
  /** Value for `x-id-idempotente`. Also makes a `POST` safe to retry. */
  idempotencyKey?: string;
  /** Overrides the client's `x-conta-corrente` for this call. */
  contaCorrente?: string;
  /** @default "json" */
  responseType?: ResponseType;
  /** Skip the `Authorization` header. Only the token endpoint does this. */
  skipAuth?: boolean;
  /** Post-processes the decoded body. */
  transform?: (body: unknown, response: InterResponse) => T;
}

/** Everything the SDK knows about a completed exchange. */
export interface InterResponse {
  /** HTTP status code. */
  status: number;
  /** Lower-cased response headers. */
  headers: Readonly<Record<string, string>>;
  /** Value of `x-request-id` / `x-correlation-id`, when present. */
  requestId?: string;
  /** Total attempts made, including the successful one. */
  attempts: number;
  /** Wall-clock duration of the whole call, retries included, in milliseconds. */
  durationMs: number;
  /** Raw response bytes. */
  raw: Uint8Array;
}

/** A decoded result paired with its transport metadata. */
export interface InterResult<T> {
  data: T;
  response: InterResponse;
}

/** Observability callbacks. Every hook may be async; failures inside are swallowed. */
export interface InterHooks {
  /** Fires just before each attempt leaves the process. */
  onRequest?: (event: {
    api: string;
    method: string;
    url: string;
    attempt: number;
    headers: Record<string, string>;
    body?: unknown;
  }) => void | Promise<void>;
  /** Fires after each attempt receives a response, successful or not. */
  onResponse?: (event: {
    api: string;
    method: string;
    url: string;
    attempt: number;
    status: number;
    durationMs: number;
    requestId?: string;
  }) => void | Promise<void>;
  /** Fires before each retry wait. */
  onRetry?: (event: {
    api: string;
    method: string;
    url: string;
    attempt: number;
    delayMs: number;
    status?: number;
    error?: unknown;
  }) => void | Promise<void>;
  /** Fires once per call, when it ultimately fails. */
  onError?: (event: { api: string; method: string; url: string; attempts: number; error: unknown }) => void | Promise<void>;
}

/** Wiring the executor needs. */
export interface HttpClientOptions {
  baseUrl: string;
  transport: Transport;
  tokens?: TokenManager;
  retry: RetryPolicy;
  rateLimiter: RateLimiter;
  environment: "producao" | "sandbox";
  logger: Logger;
  hooks?: InterHooks;
  userAgent: string;
  timeoutMs: number;
  contaCorrente?: string;
  defaultHeaders?: Record<string, string>;
  /** Emit request and response bodies at debug level. Off by default: they contain PII. */
  debugBodies?: boolean;
}

/** Runs API calls end to end. */
export class HttpClient {
  constructor(private readonly options: HttpClientOptions) {}

  /** The transport in use, exposed for `close()`. */
  get transport(): Transport {
    return this.options.transport;
  }

  /** Executes one call and returns the decoded body. */
  async call<T>(options: CallOptions<T>): Promise<T> {
    return (await this.callWithResponse<T>(options)).data;
  }

  /** Executes one call and returns the decoded body plus transport metadata. */
  async callWithResponse<T>(options: CallOptions<T>): Promise<InterResult<T>> {
    const method = options.endpoint.method;
    const url = this.buildUrl(options);
    const { body, contentType } = encodeBody(options);
    const started = Date.now();

    const idempotent = isIdempotentMethod(method) || Boolean(options.idempotencyKey);
    const rateKey = `${options.api}:${method} ${options.endpoint.path}`;
    const limit = options.endpoint.rateLimit?.[this.options.environment];

    let attempt = 0;
    let authRefreshed = false;

    try {
      for (;;) {
          attempt++;
          if (options.signal?.aborted) throw new InterAbortError("request aborted by caller", { context: { method, url } });
          await this.options.rateLimiter.acquire(rateKey, limit, options.signal);

        const attemptStarted = Date.now();

        let response: TransportResponse;
        try {
          // Header building mints the access token when one is needed, so it
          // belongs inside the try: a socket failure while fetching a token is
          // every bit as transient as one while making the call itself.
          const headers = await this.buildHeaders(options, contentType);

          await this.fire(() =>
            this.options.hooks?.onRequest?.({
              api: options.api,
              method,
              url,
              attempt,
              headers,
              body: this.options.debugBodies ? options.body : undefined,
            }),
          );
          this.options.logger.debug("inter: request", {
            api: options.api,
            method,
            url,
            attempt,
            ...(this.options.debugBodies ? { headers: redact(headers), body: redact(options.body) } : {}),
          });

          response = await this.options.transport.request({
            method,
            url,
            headers,
            body,
            signal: options.signal,
            timeoutMs: options.timeoutMs ?? this.options.timeoutMs,
          });
        } catch (err) {
          const context: RetryDecision = { attempt, method, idempotent, error: err };
          if (this.options.retry.shouldRetry(context)) {
            await this.waitBeforeRetry(options, url, context, undefined);
            continue;
          }
          const failure = toInterTransportError(err, { method, url, attempts: attempt });
          await this.fire(() => this.options.hooks?.onError?.({ api: options.api, method, url, attempts: attempt, error: failure }));
          throw failure;
        }

        const durationMs = Date.now() - attemptStarted;
        const requestId = response.headers["x-request-id"] ?? response.headers["x-correlation-id"];

        await this.fire(() =>
          this.options.hooks?.onResponse?.({ api: options.api, method, url, attempt, status: response.status, durationMs, requestId }),
        );
        this.options.logger.debug("inter: response", {
          api: options.api,
          method,
          url,
          attempt,
          status: response.status,
          durationMs,
          requestId,
        });

        if (response.status >= 200 && response.status < 300) {
          const meta: InterResponse = {
            status: response.status,
            headers: response.headers,
            requestId,
            attempts: attempt,
            durationMs: Date.now() - started,
            raw: response.body,
          };
          const decoded = decodeBody(response, options.responseType ?? "json");
          const data = (options.transform ? options.transform(decoded, meta) : decoded) as T;
          return { data, response: meta };
        }

        // The token expired or was revoked mid-flight: drop it and try once more
        // with a freshly minted one before surfacing the failure.
        if (response.status === 401 && !options.skipAuth && !authRefreshed && this.options.tokens) {
          authRefreshed = true;
          this.options.logger.debug("inter: 401 received, refreshing token", { api: options.api, url });
          await this.options.tokens.invalidate(options.endpoint.scope);
          continue;
        }

        const decision: RetryDecision = { attempt, method, idempotent, status: response.status };
        const retryAfterSeconds = parseRetryAfter(response.headers["retry-after"]);
        if (this.options.retry.shouldRetry(decision)) {
          await this.waitBeforeRetry(options, url, decision, retryAfterSeconds);
          continue;
        }

        const failure = this.toApiFailure(options, response, {
          method,
          url,
          attempts: attempt,
          durationMs: Date.now() - started,
          requestId,
          retryAfterSeconds,
        });
        await this.fire(() => this.options.hooks?.onError?.({ api: options.api, method, url, attempts: attempt, error: failure }));
        throw failure;
      }
    } catch (err) {
      // Aborts arrive as a DOMException from the signal, or as whatever the
      // rate limiter or backoff sleep rejected with. Normalise them so callers
      // only ever see the SDK's own error types.
      if (isAbortLike(err, options.signal)) {
        const failure = err instanceof InterAbortError ? err : new InterAbortError("request aborted by caller", { cause: err, context: { method, url, attempts: attempt } });
        await this.fire(() => this.options.hooks?.onError?.({ api: options.api, method, url, attempts: attempt, error: failure }));
        throw failure;
      }
      throw err;
    }
  }

  // -- internals ------------------------------------------------------------

  private buildUrl(options: CallOptions<unknown>): string {
    let path = options.endpoint.path;
    for (const [key, value] of Object.entries(options.pathParams ?? {})) {
      const encoded = encodeURIComponent(String(value));
      const next = path.replace(`{${key}}`, encoded);
      if (next === path) {
        throw new InterError(`path parameter "${key}" does not appear in "${options.endpoint.path}"`);
      }
      path = next;
    }
    const missing = path.match(/\{([^}]+)\}/);
    if (missing) throw new InterError(`missing path parameter "${missing[1]}" for ${options.endpoint.path}`);

    const query = buildQuery(options.query);
    return `${this.options.baseUrl}${options.basePath}${path}${query}`;
  }

  private async buildHeaders(options: CallOptions<unknown>, contentType: string | undefined): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      accept: "application/json",
      "user-agent": this.options.userAgent,
      ...lowerKeys(this.options.defaultHeaders),
    };
    if (contentType) headers["content-type"] = contentType;

    if (!options.skipAuth && this.options.tokens) {
      headers.authorization = await this.options.tokens.authorizationHeader(options.endpoint.scope, options.signal);
    }

    const conta = options.contaCorrente ?? this.options.contaCorrente;
    if (conta) headers["x-conta-corrente"] = conta;
    if (options.idempotencyKey) headers["x-id-idempotente"] = options.idempotencyKey;

    return { ...headers, ...lowerKeys(options.headers) };
  }

  private async waitBeforeRetry(
    options: CallOptions<unknown>,
    url: string,
    decision: RetryDecision,
    retryAfterSeconds: number | undefined,
  ): Promise<void> {
    const delayMs = this.options.retry.delay({ ...decision, retryAfterSeconds });
    await this.fire(() =>
      this.options.hooks?.onRetry?.({
        api: options.api,
        method: decision.method,
        url,
        attempt: decision.attempt,
        delayMs,
        status: decision.status,
        error: decision.error,
      }),
    );
    this.options.logger.warn("inter: retrying request", {
      api: options.api,
      method: decision.method,
      url,
      attempt: decision.attempt,
      delayMs,
      status: decision.status,
      error: decision.error instanceof Error ? decision.error.message : undefined,
    });
    await sleep(delayMs, options.signal);
  }

  private toApiFailure(
    options: CallOptions<unknown>,
    response: TransportResponse,
    context: InterErrorContext & { retryAfterSeconds?: number },
  ): InterError {
    const text = safeDecode(response.body);
    let problem: Problema | undefined;
    try {
      problem = parseProblem(text ? JSON.parse(text) : undefined);
    } catch {
      problem = undefined;
    }
    return createAPIError(response.status, problem, {
      ...context,
      status: response.status,
      headers: response.headers,
      body: truncate(text),
      requiredScope: options.endpoint.scope,
    });
  }

  private async fire(run: () => void | Promise<void> | undefined): Promise<void> {
    try {
      await run();
    } catch (err) {
      this.options.logger.warn("inter: hook threw", { error: err instanceof Error ? err.message : String(err) });
    }
  }
}

interface RetryDecision {
  attempt: number;
  method: string;
  idempotent: boolean;
  status?: number;
  error?: unknown;
}

// ---------------------------------------------------------------------------
// failure mapping
// ---------------------------------------------------------------------------

/** `true` when a thrown value represents the caller cancelling the request. */
function isAbortLike(err: unknown, signal: AbortSignal | undefined): boolean {
  if (err instanceof InterAbortError) return true;
  if (err instanceof TransportError) return err.kind === "abort";
  if ((err as { name?: string })?.name === "AbortError") return true;
  return signal?.aborted === true && !(err instanceof InterError);
}

/**
 * Converts a transport-level failure into the matching SDK error.
 *
 * Used by the request pipeline and by the token requester, so a socket failure
 * looks the same whether it happened while minting a token or while making the
 * call the token was for.
 */
export function toInterTransportError(err: unknown, context: InterErrorContext): InterError {
  if (err instanceof InterError) return err;
  if (err instanceof TransportError) {
    if (err.kind === "timeout") return new InterTimeoutError(err.message, context.durationMs ?? 0, { cause: err, context });
    if (err.kind === "abort") return new InterAbortError(err.message, { cause: err, context });
    return new InterConnectionError(describeConnectionFailure(err), { cause: err, context });
  }
  if ((err as { name?: string })?.name === "AbortError") {
    return new InterAbortError("request aborted by caller", { cause: err, context });
  }
  const code = (err as { code?: string; cause?: { code?: string } })?.code ?? (err as { cause?: { code?: string } })?.cause?.code;
  if (code) {
    return new InterConnectionError(describeConnectionFailure(new TransportError("connection", String((err as Error).message ?? err), { code })), {
      cause: err,
      context,
    });
  }
  return new InterConnectionError(err instanceof Error ? err.message : String(err), { cause: err, context });
}

// ---------------------------------------------------------------------------
// encoding helpers
// ---------------------------------------------------------------------------

function encodeBody(options: CallOptions<unknown>): { body?: string | Uint8Array; contentType?: string } {
  if (options.body === undefined || options.body === null) return {};
  if (typeof options.body === "string") return { body: options.body, contentType: options.contentType ?? "application/json" };
  if (options.body instanceof Uint8Array) return { body: options.body, contentType: options.contentType ?? "application/octet-stream" };
  return { body: JSON.stringify(options.body), contentType: options.contentType ?? "application/json" };
}

/**
 * Serialises query parameters.
 *
 * Dotted names such as `paginacao.itensPorPagina` are passed through unchanged
 * because that is the literal parameter name Inter expects. `Date` values become
 * ISO 8601 strings; arrays repeat the key; `undefined` and `null` are dropped.
 */
export function buildQuery(query: Record<string, unknown> | undefined): string {
  if (!query) return "";
  const parts: string[] = [];
  const push = (key: string, value: unknown): void => {
    if (value === undefined || value === null) return;
    const encoded =
      value instanceof Date ? value.toISOString() : typeof value === "boolean" ? String(value) : String(value);
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(encoded)}`);
  };
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) for (const item of value) push(key, item);
    else push(key, value);
  }
  return parts.length ? `?${parts.join("&")}` : "";
}

function decodeBody(response: TransportResponse, type: ResponseType): unknown {
  if (type === "none") return undefined;
  if (type === "bytes") return response.body;
  const text = safeDecode(response.body);
  if (type === "text") return text;
  if (!text.trim()) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    // A 2xx that is not JSON: hand back the text rather than failing the call.
    return text;
  }
}

function safeDecode(bytes: Uint8Array): string {
  try {
    return new TextDecoder().decode(bytes);
  } catch {
    return "";
  }
}

function lowerKeys(headers: Record<string, string> | undefined): Record<string, string> {
  if (!headers) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) out[key.toLowerCase()] = value;
  return out;
}

function truncate(text: string, max = 4000): string {
  return text.length > max ? `${text.slice(0, max)}… (${text.length} bytes)` : text;
}

/** Turns common TLS and socket error codes into something actionable. */
function describeConnectionFailure(err: TransportError): string {
  switch (err.code) {
    case "CERT_HAS_EXPIRED":
      return "the client certificate has expired. Renew the integration in Internet Banking (Integrar > Minhas integrações > Renovar) and install the new .crt and .key.";
    case "EPROTO":
    case "ERR_SSL_TLSV13_ALERT_CERTIFICATE_REQUIRED":
    case "ERR_SSL_SSLV3_ALERT_HANDSHAKE_FAILURE":
      return `TLS handshake failed (${err.code}). Banco Inter requires a client certificate on every connection; check that \`certificate\` and \`privateKey\` point at the files downloaded for this integration.`;
    case "ENOTFOUND":
    case "EAI_AGAIN":
      return `could not resolve the API host (${err.code}). Check network access and any proxy configuration.`;
    case "ECONNREFUSED":
    case "ECONNRESET":
      return `the connection was closed before a response arrived (${err.code}).`;
    default:
      return err.message;
  }
}
