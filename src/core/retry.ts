/**
 * Retry policy.
 *
 * Defaults are conservative: transient transport failures, `429`, and `5xx`
 * other than `501` are retried, and bodies are only replayed for requests that
 * are safe to repeat. A `POST` is replayed only when it carries an idempotency
 * key, so a payment is never issued twice because of a timeout.
 */

import { InterAbortError, InterConnectionError, InterTimeoutError } from "./errors.ts";
import { TransportError } from "./transport/types.ts";

/** Everything the policy needs to judge one attempt. */
export interface RetryContext {
  /** 1 for the first attempt. */
  attempt: number;
  /** Uppercase HTTP method. */
  method: string;
  /** Status code, when a response came back. */
  status?: number;
  /** Transport failure, when no response came back. */
  error?: unknown;
  /** `true` when replaying the request cannot cause a duplicate side effect. */
  idempotent: boolean;
}

/** Tunables for {@link defaultRetryPolicy}. */
export interface RetryOptions {
  /**
   * Extra attempts after the first one. `0` disables retrying.
   *
   * @default 2
   */
  maxRetries?: number;
  /**
   * Base delay for the exponential backoff, in milliseconds.
   *
   * @default 500
   */
  minDelayMs?: number;
  /**
   * Ceiling for a single backoff wait, in milliseconds.
   *
   * @default 20000
   */
  maxDelayMs?: number;
  /**
   * Honour the `Retry-After` header on `429` and `503`.
   *
   * @default true
   */
  respectRetryAfter?: boolean;
  /**
   * Replay non-idempotent requests (`POST` without an idempotency key).
   * Leave this off unless you know duplicates are harmless.
   *
   * @default false
   */
  retryNonIdempotent?: boolean;
  /**
   * Overrides the built-in decision. Return `true` to retry, `false` to give up,
   * or `undefined` to defer to the default rules.
   */
  shouldRetry?: (context: RetryContext) => boolean | undefined;
}

/** A resolved retry policy. */
export interface RetryPolicy {
  /** Extra attempts allowed after the first. */
  readonly maxRetries: number;
  /** Decides whether another attempt should be made. */
  shouldRetry(context: RetryContext): boolean;
  /** How long to wait before the next attempt, in milliseconds. */
  delay(context: RetryContext & { retryAfterSeconds?: number }): number;
}

/** Status codes that are worth another attempt. */
const RETRYABLE_STATUS = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

/** Methods that are safe to replay by definition. */
const IDEMPOTENT_METHODS = new Set(["GET", "HEAD", "OPTIONS", "PUT", "DELETE"]);

/** `true` when the verb alone makes a request safe to repeat. */
export function isIdempotentMethod(method: string): boolean {
  return IDEMPOTENT_METHODS.has(method.toUpperCase());
}

/** Builds a retry policy from user options. */
export function defaultRetryPolicy(options: RetryOptions = {}): RetryPolicy {
  const maxRetries = options.maxRetries ?? 2;
  const minDelayMs = options.minDelayMs ?? 500;
  const maxDelayMs = options.maxDelayMs ?? 20_000;
  const respectRetryAfter = options.respectRetryAfter !== false;
  const retryNonIdempotent = options.retryNonIdempotent === true;

  return {
    maxRetries,

    shouldRetry(context: RetryContext): boolean {
      const override = options.shouldRetry?.(context);
      if (override !== undefined) return override;
      if (context.attempt > maxRetries) return false;
      if (!context.idempotent && !retryNonIdempotent) return false;

      if (context.error !== undefined) {
        // Only failures that never reached a response are worth repeating. An
        // authentication or configuration error will fail exactly the same way.
        if (context.error instanceof TransportError) return context.error.kind !== "abort";
        if (context.error instanceof InterAbortError) return false;
        return context.error instanceof InterConnectionError || context.error instanceof InterTimeoutError;
      }
      return context.status !== undefined && RETRYABLE_STATUS.has(context.status);
    },

    delay(context): number {
      if (respectRetryAfter && context.retryAfterSeconds !== undefined) {
        return Math.min(Math.max(context.retryAfterSeconds, 0) * 1000, maxDelayMs);
      }
      // Exponential backoff with full jitter: spreads a thundering herd across
      // the whole window instead of synchronising every client on the same tick.
      const ceiling = Math.min(minDelayMs * 2 ** (context.attempt - 1), maxDelayMs);
      return Math.round(Math.random() * ceiling);
    },
  };
}

/**
 * Parses a `Retry-After` header into seconds.
 *
 * Accepts both forms allowed by RFC 9110: a delay in seconds, and an HTTP date.
 */
export function parseRetryAfter(value: string | undefined, now: number = Date.now()): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(seconds, 0);
  const date = Date.parse(value);
  if (Number.isNaN(date)) return undefined;
  return Math.max((date - now) / 1000, 0);
}

/** Resolves after `ms`, rejecting early if `signal` aborts. */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = (): void => {
      clearTimeout(timer);
      reject(signal?.reason instanceof Error ? signal.reason : new Error("aborted"));
    };
    if (signal) {
      if (signal.aborted) {
        clearTimeout(timer);
        onAbort();
        return;
      }
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}
