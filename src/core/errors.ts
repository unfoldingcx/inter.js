/**
 * Error hierarchy for the Banco Inter SDK.
 *
 * Every failure raised by the client is an {@link InterError}, so a single
 * `catch (err) { if (err instanceof InterError) ... }` covers the whole surface.
 * Failures that came back from the API are {@link InterAPIError}s and carry the
 * parsed RFC 7807 problem document, including Inter's `violacoes` array.
 */

import type { Problema, Violacao } from "./problem.ts";

/** Where a failure happened, useful for logs and bug reports. */
export interface InterErrorContext {
  /** HTTP method of the offending request, when there was one. */
  readonly method?: string;
  /** Absolute URL of the offending request, with query string. */
  readonly url?: string;
  /** HTTP status code, when a response was received. */
  readonly status?: number;
  /** Value of the response's `x-request-id` / `x-correlation-id` header, if present. */
  readonly requestId?: string;
  /** How many attempts were made in total (1 means "no retries"). */
  readonly attempts?: number;
  /** Wall-clock duration of the last attempt, in milliseconds. */
  readonly durationMs?: number;
  /** Raw response body, as text, truncated to a sane length. */
  readonly body?: string;
  /** Response headers, lower-cased. */
  readonly headers?: Readonly<Record<string, string>>;
}

/** Base class for everything this SDK throws. */
export class InterError extends Error {
  override readonly name: string = "InterError";
  /** Request/response context, when the failure is tied to an HTTP call. */
  readonly context: InterErrorContext;

  constructor(message: string, options?: { cause?: unknown; context?: InterErrorContext }) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.context = options?.context ?? {};
    // Keeps `instanceof` working when the output is transpiled down to ES5.
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /** A compact, log-friendly representation. Never includes credentials. */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      ...this.context,
    };
  }
}

/**
 * The SDK was configured incorrectly: missing credentials, an unreadable
 * certificate, contradictory options. Thrown before any network call happens.
 */
export class InterConfigurationError extends InterError {
  override readonly name: string = "InterConfigurationError";
}

/** The client certificate or private key could not be loaded or is unusable. */
export class InterCertificateError extends InterConfigurationError {
  override readonly name = "InterCertificateError";
}

/** The request never produced a response: DNS, TCP, TLS or socket failure. */
export class InterConnectionError extends InterError {
  override readonly name = "InterConnectionError";
}

/** The request exceeded the configured timeout. */
export class InterTimeoutError extends InterError {
  override readonly name = "InterTimeoutError";
  /** The timeout that elapsed, in milliseconds. */
  readonly timeoutMs: number;

  constructor(message: string, timeoutMs: number, options?: { cause?: unknown; context?: InterErrorContext }) {
    super(message, options);
    this.timeoutMs = timeoutMs;
  }
}

/** The caller aborted the request through its `AbortSignal`. */
export class InterAbortError extends InterError {
  override readonly name = "InterAbortError";
}

/** Base class for any non-2xx response returned by Banco Inter. */
export class InterAPIError extends InterError {
  override readonly name: string = "InterAPIError";
  /** HTTP status code. */
  readonly status: number;
  /** Parsed RFC 7807 problem document, when the body was one. */
  readonly problem?: Problema;

  constructor(message: string, status: number, options?: { problem?: Problema; cause?: unknown; context?: InterErrorContext }) {
    super(message, options);
    this.status = status;
    this.problem = options?.problem;
  }

  /** Inter's field-level validation failures, when the body carried any. */
  get violations(): readonly Violacao[] {
    return this.problem?.violacoes ?? [];
  }

  /** The problem document's `title`, falling back to the HTTP status text. */
  get title(): string | undefined {
    return this.problem?.title;
  }

  /** The problem document's `detail`. */
  get detail(): string | undefined {
    return this.problem?.detail;
  }

  override toJSON(): Record<string, unknown> {
    return { ...super.toJSON(), status: this.status, problem: this.problem };
  }
}

/**
 * `401 Unauthorized`. Most often the token was generated with credentials that
 * do not match the mTLS certificate presented on the connection, or it expired.
 */
export class InterAuthenticationError extends InterAPIError {
  override readonly name = "InterAuthenticationError";
}

/**
 * `403 Forbidden`. The call is authenticated but not authorised — usually the
 * token is missing the scope the endpoint requires, or the integration does not
 * have that permission enabled in Internet Banking.
 */
export class InterPermissionError extends InterAPIError {
  override readonly name = "InterPermissionError";
  /** The scope this SDK expected the token to carry, when known. */
  readonly requiredScope?: string;

  constructor(
    message: string,
    status: number,
    options?: { problem?: Problema; requiredScope?: string; cause?: unknown; context?: InterErrorContext },
  ) {
    super(message, status, options);
    this.requiredScope = options?.requiredScope;
  }
}

/** `400` / `422`. The request was rejected; check {@link InterAPIError.violations}. */
export class InterValidationError extends InterAPIError {
  override readonly name = "InterValidationError";
}

/** `404 Not Found`. */
export class InterNotFoundError extends InterAPIError {
  override readonly name = "InterNotFoundError";
}

/** `409 Conflict`. */
export class InterConflictError extends InterAPIError {
  override readonly name = "InterConflictError";
}

/**
 * `429 Too Many Requests`. Every Inter endpoint has a per-minute call budget;
 * see `endpoint.rateLimit` in the generated metadata for the documented values.
 */
export class InterRateLimitError extends InterAPIError {
  override readonly name = "InterRateLimitError";
  /** Seconds the server asked us to wait, parsed from `Retry-After`. */
  readonly retryAfterSeconds?: number;

  constructor(
    message: string,
    status: number,
    options?: { problem?: Problema; retryAfterSeconds?: number; cause?: unknown; context?: InterErrorContext },
  ) {
    super(message, status, options);
    this.retryAfterSeconds = options?.retryAfterSeconds;
  }
}

/** `5xx`. Something failed on Inter's side. */
export class InterServerError extends InterAPIError {
  override readonly name: string = "InterServerError";
}

/**
 * `503 Service Unavailable`. The service is down or outside its operating
 * window — the sandbox, for instance, only runs 08:00–20:00 BRT on weekdays.
 */
export class InterServiceUnavailableError extends InterServerError {
  override readonly name = "InterServiceUnavailableError";
}

/** A webhook callback failed verification and must not be trusted. */
export class InterWebhookError extends InterError {
  override readonly name = "InterWebhookError";
}

/**
 * Builds the most specific error class for a response.
 *
 * @param status HTTP status code.
 * @param problem Parsed problem document, if the body was JSON.
 * @param context Request/response context to attach.
 */
export function createAPIError(
  status: number,
  problem: Problema | undefined,
  context: InterErrorContext & { requiredScope?: string; retryAfterSeconds?: number },
): InterAPIError {
  const { requiredScope, retryAfterSeconds, ...rest } = context;
  const message = describe(status, problem, rest);
  const base = { problem, context: rest };

  if (status === 401) return new InterAuthenticationError(message, status, base);
  if (status === 403) return new InterPermissionError(message, status, { ...base, requiredScope });
  if (status === 404 || status === 410) return new InterNotFoundError(message, status, base);
  if (status === 409) return new InterConflictError(message, status, base);
  if (status === 429) return new InterRateLimitError(message, status, { ...base, retryAfterSeconds });
  if (status === 400 || status === 422 || status === 406) return new InterValidationError(message, status, base);
  if (status === 503) return new InterServiceUnavailableError(message, status, base);
  if (status >= 500) return new InterServerError(message, status, base);
  return new InterAPIError(message, status, base);
}

/** Renders a one-line, human-readable summary of a failed call. */
function describe(status: number, problem: Problema | undefined, context: InterErrorContext): string {
  const where = context.method && context.url ? `${context.method} ${stripQuery(context.url)}` : "request";
  const parts: string[] = [`Banco Inter returned ${status} for ${where}`];

  const headline = problem?.detail || problem?.title;
  if (headline) parts.push(headline);

  const violations = problem?.violacoes ?? [];
  if (violations.length) {
    const rendered = violations
      .slice(0, 3)
      .map((v) => [v.propriedade, v.razao].filter(Boolean).join(": ") || v.valor)
      .filter(Boolean)
      .join("; ");
    if (rendered) parts.push(violations.length > 3 ? `${rendered} (+${violations.length - 3} more)` : rendered);
  }

  if (context.requestId) parts.push(`request-id ${context.requestId}`);
  return parts.join(" — ");
}

function stripQuery(url: string): string {
  const q = url.indexOf("?");
  return q === -1 ? url : url.slice(0, q);
}

/** `true` when the value is any error produced by this SDK. */
export function isInterError(value: unknown): value is InterError {
  return value instanceof InterError;
}

/** `true` when the value is a non-2xx response from the API. */
export function isInterAPIError(value: unknown): value is InterAPIError {
  return value instanceof InterAPIError;
}
