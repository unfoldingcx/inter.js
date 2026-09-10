/**
 * Client-side rate limiting.
 *
 * Every Inter endpoint publishes a per-minute call budget, and the SDK ships
 * those numbers in `src/generated/endpoints.ts`. Rather than discovering the
 * limit by collecting `429`s, the client paces itself: a request that would
 * exceed the documented budget waits for the window to open.
 *
 * The window is a sliding log, not a fixed bucket, so a burst up to the limit is
 * allowed and the next call waits exactly until the oldest one ages out.
 */

/** Queues requests so a per-minute budget is never exceeded. */
export interface RateLimiter {
  /**
   * Waits until one call against `key` is permitted.
   *
   * @param key Identifier for the budget, typically `"pix:GET /cob"`.
   * @param limit Calls allowed per {@link windowMs}. `undefined` means unlimited.
   * @param signal Cancels the wait.
   */
  acquire(key: string, limit: number | undefined, signal?: AbortSignal): Promise<void>;
  /** Forgets all recorded history. */
  reset(): void;
}

/** Options for {@link createRateLimiter}. */
export interface RateLimiterOptions {
  /**
   * Width of the sliding window, in milliseconds.
   *
   * @default 60000
   */
  windowMs?: number;
  /**
   * Scales every documented limit. Use a value below `1` to leave headroom for
   * other processes sharing the same integration — `0.8` uses 80% of the budget.
   *
   * @default 1
   */
  factor?: number;
  /** Clock source, injectable for tests. */
  now?: () => number;
}

/** A sliding-window limiter that holds its state in memory. */
export function createRateLimiter(options: RateLimiterOptions = {}): RateLimiter {
  const windowMs = options.windowMs ?? 60_000;
  const factor = options.factor ?? 1;
  const now = options.now ?? (() => Date.now());

  /** Timestamps of recent calls, oldest first, one array per key. */
  const history = new Map<string, number[]>();

  return {
    async acquire(key: string, limit: number | undefined, signal?: AbortSignal): Promise<void> {
      if (!limit || limit <= 0) return;
      const effective = Math.max(1, Math.floor(limit * factor));

      for (;;) {
        signal?.throwIfAborted();

        const current = now();
        const cutoff = current - windowMs;
        let entries = history.get(key);
        if (!entries) {
          entries = [];
          history.set(key, entries);
        }
        while (entries.length && entries[0]! <= cutoff) entries.shift();

        if (entries.length < effective) {
          entries.push(current);
          return;
        }

        // Wait just past the moment the oldest call leaves the window.
        const waitMs = entries[0]! + windowMs - current + 1;
        await delay(waitMs, signal);
      }
    },

    reset(): void {
      history.clear();
    },
  };
}

/** A limiter that never waits. */
export const noopRateLimiter: RateLimiter = {
  async acquire(): Promise<void> {},
  reset(): void {},
};

function delay(ms: number, signal?: AbortSignal): Promise<void> {
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
