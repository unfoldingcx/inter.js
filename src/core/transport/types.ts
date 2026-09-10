/**
 * The transport contract.
 *
 * Everything above this layer speaks {@link TransportRequest} /
 * {@link TransportResponse}; everything below it deals with a specific runtime's
 * HTTP stack. Supplying your own {@link Transport} is the supported way to route
 * traffic through a proxy, replay fixtures in tests, or plug in a custom
 * `undici` dispatcher.
 */

import type { ResolvedTLS } from "../tls.ts";

/** A single outbound HTTP request. */
export interface TransportRequest {
  /** Uppercase HTTP verb. */
  method: string;
  /** Absolute URL, query string included. */
  url: string;
  /** Request headers. Keys are already lower-cased. */
  headers: Record<string, string>;
  /** Encoded request body, if any. */
  body?: string | Uint8Array;
  /** Caller-supplied cancellation signal. */
  signal?: AbortSignal;
  /** Hard deadline for this attempt, in milliseconds. */
  timeoutMs?: number;
}

/** A single inbound HTTP response, fully buffered. */
export interface TransportResponse {
  /** HTTP status code. */
  status: number;
  /** HTTP reason phrase, when the runtime exposes one. */
  statusText: string;
  /** Response headers with lower-cased keys. Repeated headers are joined with `, `. */
  headers: Record<string, string>;
  /** Response body as bytes. Decode with {@link TextDecoder} or hand to `Buffer`. */
  body: Uint8Array;
}

/** An HTTP stack the client can drive. */
export interface Transport {
  /** Short identifier used in logs, e.g. `"node:https"`. */
  readonly name: string;
  /** Performs one request. Must reject with a {@link TransportError} on failure. */
  request(request: TransportRequest): Promise<TransportResponse>;
  /** Releases sockets and other resources. Called by `InterClient#close()`. */
  close?(): void | Promise<void>;
}

/** Options a transport factory receives. */
export interface TransportOptions {
  /** Resolved mTLS material, or `undefined` when TLS is terminated upstream. */
  tls?: ResolvedTLS;
  /** Keep sockets alive between requests. */
  keepAlive?: boolean;
  /** Maximum idle sockets to retain per origin. */
  maxSockets?: number;
  /** `fetch` implementation to use, for transports built on it. */
  fetch?: typeof globalThis.fetch;
  /** Extra per-request options merged into `fetch`, e.g. an `undici` dispatcher. */
  fetchOptions?: Record<string, unknown>;
}

/** Why a transport-level failure happened. */
export type TransportErrorKind = "timeout" | "abort" | "connection";

/** A failure that happened before a complete response was received. */
export class TransportError extends Error {
  override readonly name = "TransportError";
  readonly kind: TransportErrorKind;
  /** OS/library error code, e.g. `ECONNRESET` or `CERT_HAS_EXPIRED`. */
  readonly code?: string;

  constructor(kind: TransportErrorKind, message: string, options?: { cause?: unknown; code?: string }) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.kind = kind;
    this.code = options?.code;
  }
}
