/**
 * Transport backed by `node:https`.
 *
 * Node's global `fetch` cannot present a client certificate, so mTLS on Node
 * goes through `https.request` with an agent carrying the certificate. The agent
 * is created once per client and keeps sockets alive across calls.
 */

import type { Transport, TransportOptions, TransportRequest, TransportResponse } from "./types.ts";
import { TransportError } from "./types.ts";

type NodeAgent = import("node:https").Agent;

/** Creates a transport that speaks HTTPS through Node's core modules. */
export async function createNodeTransport(options: TransportOptions = {}): Promise<Transport> {
  const https = await import("node:https");
  const http = await import("node:http");

  const tls = options.tls;
  const agent: NodeAgent = new https.Agent({
    keepAlive: options.keepAlive !== false,
    keepAliveMsecs: 30_000,
    maxSockets: options.maxSockets ?? 64,
    maxFreeSockets: 8,
    ...(tls?.cert ? { cert: tls.cert } : {}),
    ...(tls?.key ? { key: tls.key } : {}),
    ...(tls?.pfx ? { pfx: tls.pfx } : {}),
    ...(tls?.passphrase ? { passphrase: tls.passphrase } : {}),
    ...(tls?.ca ? { ca: tls.ca } : {}),
    ...(tls ? { rejectUnauthorized: tls.rejectUnauthorized } : {}),
    // Inter requires TLS 1.2 or newer.
    minVersion: "TLSv1.2",
  });

  return {
    name: "node:https",

    request(request: TransportRequest): Promise<TransportResponse> {
      return new Promise<TransportResponse>((resolve, reject) => {
        const url = new URL(request.url);
        const secure = url.protocol === "https:";
        const driver = secure ? https : http;

        let settled = false;
        let deadline: ReturnType<typeof setTimeout> | undefined;
        const finish = (fn: () => void): void => {
          if (settled) return;
          settled = true;
          cleanup();
          fn();
        };

        const req = driver.request(
          {
            protocol: url.protocol,
            hostname: url.hostname,
            port: url.port || (secure ? 443 : 80),
            path: url.pathname + url.search,
            method: request.method,
            headers: request.headers,
            agent: secure ? agent : undefined,
          },
          (res) => {
            const chunks: Buffer[] = [];
            res.on("data", (chunk: Buffer) => chunks.push(chunk));
            res.on("error", (err) => finish(() => reject(toTransportError(err))));
            res.on("end", () =>
              finish(() =>
                resolve({
                  status: res.statusCode ?? 0,
                  statusText: res.statusMessage ?? "",
                  headers: normalizeHeaders(res.headers),
                  body: new Uint8Array(Buffer.concat(chunks)),
                }),
              ),
            );
          },
        );

        // Registered before anything can fail: a destroyed request emits its
        // error asynchronously, and an unhandled 'error' event takes the
        // process down. Once `settled` is true these are swallowed on purpose —
        // the caller already has a result.
        req.on("error", (err) => finish(() => reject(toTransportError(err))));

        const onAbort = (): void => {
          req.destroy(new TransportError("abort", "request aborted by caller"));
        };
        const cleanup = (): void => {
          request.signal?.removeEventListener("abort", onAbort);
          if (deadline) clearTimeout(deadline);
        };

        if (request.signal) {
          if (request.signal.aborted) {
            onAbort();
            return;
          }
          request.signal.addEventListener("abort", onAbort, { once: true });
        }

        if (request.timeoutMs && request.timeoutMs > 0) {
          // A hard deadline for the whole exchange. `req.setTimeout` only covers
          // socket inactivity, which a slow-but-trickling response never trips.
          deadline = setTimeout(() => {
            req.destroy(new TransportError("timeout", `request timed out after ${request.timeoutMs}ms`));
          }, request.timeoutMs);
          deadline.unref?.();
        }

        if (request.body !== undefined) {
          req.end(typeof request.body === "string" ? Buffer.from(request.body, "utf8") : Buffer.from(request.body));
        } else {
          req.end();
        }
      });
    },

    close(): void {
      agent.destroy();
    },
  };
}

function normalizeHeaders(raw: Record<string, string | string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue;
    out[key.toLowerCase()] = Array.isArray(value) ? value.join(", ") : value;
  }
  return out;
}

function toTransportError(err: unknown): TransportError {
  if (err instanceof TransportError) return err;
  const code = (err as { code?: string } | undefined)?.code;
  const message = err instanceof Error ? err.message : String(err);
  if (code === "ETIMEDOUT" || code === "ESOCKETTIMEDOUT") {
    return new TransportError("timeout", message, { cause: err, code });
  }
  if (code === "ABORT_ERR" || (err as { name?: string } | undefined)?.name === "AbortError") {
    return new TransportError("abort", message, { cause: err, code });
  }
  return new TransportError("connection", message, { cause: err, code });
}
