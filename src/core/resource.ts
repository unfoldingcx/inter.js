/**
 * Base class for the resource namespaces hanging off `InterClient`.
 */

import type { CallOptions, InterResult } from "./http.ts";

/** The subset of the client a resource needs. */
export interface ResourceTransport {
  /** Executes a call and returns the decoded body. */
  call<T>(options: CallOptions<T>): Promise<T>;
  /** Executes a call and returns the decoded body plus transport metadata. */
  callWithResponse<T>(options: CallOptions<T>): Promise<InterResult<T>>;
}

/** Common plumbing for every resource namespace. */
export abstract class Resource {
  constructor(protected readonly client: ResourceTransport) {}
}

/** Per-call knobs every resource method accepts. */
export interface RequestOptions {
  /** Cancels the call, retries included. */
  signal?: AbortSignal;
  /** Overrides the client's per-attempt timeout, in milliseconds. */
  timeout?: number;
  /** Overrides the client's `x-conta-corrente` for this call. */
  contaCorrente?: string;
  /** Extra headers for this call. */
  headers?: Record<string, string>;
  /**
   * Value for `x-id-idempotente`. Supplying one also makes the `POST` safe to
   * retry, so a network blip cannot produce a duplicate side effect.
   */
  idempotencyKey?: string;
}

/** The call fields {@link requestOverrides} produces. Generic-free, so it spreads into any `CallOptions<T>`. */
export type CallOverrides = Pick<
  CallOptions<never>,
  "signal" | "timeoutMs" | "contaCorrente" | "headers" | "idempotencyKey"
>;

/** Spreads {@link RequestOptions} into the fields {@link CallOptions} expects. */
export function requestOverrides(options: RequestOptions | undefined): CallOverrides {
  if (!options) return {};
  return {
    signal: options.signal,
    timeoutMs: options.timeout,
    contaCorrente: options.contaCorrente,
    headers: options.headers,
    idempotencyKey: options.idempotencyKey,
  };
}
