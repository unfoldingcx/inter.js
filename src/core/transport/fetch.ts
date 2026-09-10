/**
 * Transports built on the platform `fetch`.
 *
 * Bun and Deno can both present a client certificate through `fetch`, so they
 * share this implementation and differ only in how the TLS material is attached.
 * The plain variant is what you get when mTLS is terminated somewhere else, such
 * as a sidecar proxy, or when you supply your own `undici` dispatcher.
 */

import type { Transport, TransportOptions, TransportRequest, TransportResponse } from "./types.ts";
import { TransportError } from "./types.ts";

/** Builds the per-request extras a specific runtime needs for mTLS. */
type TlsExtras = () => Record<string, unknown>;

function createFetchTransport(name: string, options: TransportOptions, tlsExtras: TlsExtras): Transport {
  const doFetch = options.fetch ?? globalThis.fetch;
  if (typeof doFetch !== "function") {
    throw new TransportError("connection", "no global fetch available; pass `fetch` or a custom transport");
  }
  const extras = tlsExtras();

  return {
    name,

    async request(request: TransportRequest): Promise<TransportResponse> {
      const controller = new AbortController();
      const signals: AbortSignal[] = [controller.signal];
      if (request.signal) signals.push(request.signal);

      let timer: ReturnType<typeof setTimeout> | undefined;
      let timedOut = false;
      if (request.timeoutMs && request.timeoutMs > 0) {
        timer = setTimeout(() => {
          timedOut = true;
          controller.abort();
        }, request.timeoutMs);
      }

      try {
        const response = await doFetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body as unknown as RequestInit["body"],
          signal: signals.length === 1 ? signals[0] : AbortSignal.any(signals),
          redirect: "follow",
          ...options.fetchOptions,
          ...extras,
        } as RequestInit);

        const body = new Uint8Array(await response.arrayBuffer());
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headers[key.toLowerCase()] = value;
        });

        return { status: response.status, statusText: response.statusText, headers, body };
      } catch (err) {
        if (timedOut) {
          throw new TransportError("timeout", `request timed out after ${request.timeoutMs}ms`, { cause: err });
        }
        if (request.signal?.aborted) {
          throw new TransportError("abort", "request aborted by caller", { cause: err });
        }
        const code = (err as { code?: string; cause?: { code?: string } }).code ?? (err as { cause?: { code?: string } }).cause?.code;
        throw new TransportError("connection", err instanceof Error ? err.message : String(err), { cause: err, code });
      } finally {
        if (timer) clearTimeout(timer);
      }
    },
  };
}

/**
 * Transport for Bun, which accepts client certificates through `fetch`'s
 * non-standard `tls` option.
 */
export function createBunTransport(options: TransportOptions = {}): Transport {
  return createFetchTransport("bun:fetch", options, () => {
    const tls = options.tls;
    if (!tls) return {};
    return {
      tls: {
        ...(tls.cert ? { cert: tls.cert } : {}),
        ...(tls.key ? { key: tls.key } : {}),
        ...(tls.pfx ? { pfx: tls.pfx } : {}),
        ...(tls.passphrase ? { passphrase: tls.passphrase } : {}),
        ...(tls.ca ? { ca: tls.ca } : {}),
        rejectUnauthorized: tls.rejectUnauthorized,
      },
    };
  });
}

/**
 * Transport for Deno, which takes client certificates through
 * `Deno.createHttpClient` and a per-request `client`.
 */
export function createDenoTransport(options: TransportOptions = {}): Transport {
  interface DenoGlobal {
    createHttpClient(opts: Record<string, unknown>): unknown;
  }
  const deno = (globalThis as { Deno?: DenoGlobal }).Deno;

  let client: unknown;
  if (deno && options.tls) {
    const tls = options.tls;
    client = deno.createHttpClient({
      ...(tls.cert ? { cert: new TextDecoder().decode(tls.cert) } : {}),
      ...(tls.key ? { key: new TextDecoder().decode(tls.key) } : {}),
      ...(tls.ca ? { caCerts: tls.ca.map((c) => new TextDecoder().decode(c)) } : {}),
    });
  }

  const transport = createFetchTransport("deno:fetch", options, () => (client ? { client } : {}));
  return {
    ...transport,
    close(): void {
      (client as { close?: () => void } | undefined)?.close?.();
    },
  };
}

/**
 * Transport that uses `fetch` as-is.
 *
 * Use it when the mTLS handshake happens outside the process, or pass
 * `fetchOptions: { dispatcher }` on Node to supply an `undici` agent that
 * carries the certificate.
 */
export function createPlainFetchTransport(options: TransportOptions = {}): Transport {
  return createFetchTransport("fetch", options, () => ({}));
}
