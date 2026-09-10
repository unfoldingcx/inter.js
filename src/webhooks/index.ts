/**
 * Receiving Banco Inter callbacks.
 *
 * Inter does not sign callbacks with an HMAC. Authentication is **mutual TLS in
 * the other direction**: Inter presents a client certificate issued by its own
 * CA, and your server proves the caller is really Inter by verifying that
 * certificate against the `ca.crt` you download from Internet Banking
 * (`Minhas integrações > Certificado Webhook`).
 *
 * That means the security decision happens at the TLS layer, before any code in
 * this module runs. {@link createWebhookServer} wires it up for you; if you
 * terminate TLS elsewhere, make sure the terminator is configured to require and
 * verify the client certificate, then use {@link parseWebhook} on the body.
 *
 * ```ts
 * import { createWebhookServer, parseWebhook } from "inter.js/webhooks";
 *
 * const server = await createWebhookServer({
 *   certificate: "./server.crt",
 *   privateKey: "./server.key",
 *   interCA: "./ca.crt",
 *   async onEvent(event) {
 *     if (event.source === "cobranca") {
 *       console.log(event.events[0].codigoSolicitacao, event.events[0].situacao);
 *     }
 *   },
 *   route: { "/webhooks/cobranca": "cobranca", "/webhooks/pix": "pix" },
 * });
 * ```
 *
 * @see https://developers.inter.co/docs/webhooks/o-que-e-webhooks
 */

import { InterWebhookError } from "../core/errors.ts";
import type { CertificateSource } from "../core/tls.ts";
import type { InterWebhookSource, ParsedWebhook } from "./types.ts";
import { isInterWebhookIp } from "./ip.ts";

export type {
  BankingBoletoPagamentoWebhookEvent,
  BankingPixPagamentoWebhookEvent,
  CobrancaWebhookEvent,
  CobRWebhookEvent,
  InterWebhookEvent,
  InterWebhookEventMap,
  InterWebhookSource,
  ParsedWebhook,
  ParsedWebhookOf,
  PixWebhookEvent,
  RecWebhookEvent,
} from "./types.ts";
export { INTER_WEBHOOK_IP_RANGES, ipInCidr, isInterWebhookIp } from "./ip.ts";

/**
 * Parses a callback body into typed events.
 *
 * Pass the source that matches the URL Inter posted to. The Pix webhook batches
 * several payments into a `pix` array; the others send one event per request.
 * Either way you get an array.
 *
 * @throws {InterWebhookError} when the body is not JSON or does not match the
 * shape the named source produces.
 *
 * @example
 * ```ts
 * const { events } = parseWebhook("pix", await request.text());
 * for (const pix of events) console.log(pix.endToEndId, pix.valor);
 * ```
 */
export function parseWebhook<S extends InterWebhookSource>(
  source: S,
  body: string | Uint8Array | unknown,
): Extract<ParsedWebhook, { source: S }> {
  let payload: unknown = body;

  if (body instanceof Uint8Array) payload = new TextDecoder().decode(body);
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch (cause) {
      throw new InterWebhookError(`webhook body for "${source}" is not valid JSON`, { cause });
    }
  }
  if (payload === null || typeof payload !== "object") {
    throw new InterWebhookError(`webhook body for "${source}" is not a JSON object`);
  }

  const events = extractEvents(source, payload);
  if (!events.length) {
    throw new InterWebhookError(
      `webhook body for "${source}" carried no recognisable events. ` +
        "Check that the URL Inter posted to matches the source you passed.",
    );
  }

  // `Extract` distributes over a union `S`, so a caller passing a specific
  // source gets that source's payload type and a caller passing the whole union
  // gets the discriminated union back.
  return { source, events, raw: payload } as unknown as Extract<ParsedWebhook, { source: S }>;
}

function extractEvents(source: InterWebhookSource, payload: object): unknown[] {
  const record = payload as Record<string, unknown>;

  // The Pix webhook batches: { pix: [ ... ] }. A single object is also accepted
  // because Inter's own webhook validator sends one that way.
  if (source === "pix") {
    if (Array.isArray(record.pix)) return record.pix;
    return record.endToEndId || record.txid ? [record] : [];
  }

  if (Array.isArray(record.pix) && source.startsWith("pix-automatico")) {
    // Recurrence callbacks carry their own fields plus an optional `pix` array;
    // the event is the object itself, not the nested payments.
    return [record];
  }

  const required: Record<InterWebhookSource, string[]> = {
    cobranca: ["codigoSolicitacao", "situacao"],
    "banking.pix-pagamento": ["codigoSolicitacao", "status"],
    "banking.boleto-pagamento": ["codigoTransacao", "status"],
    pix: ["endToEndId"],
    "pix-automatico.rec": ["idRec"],
    "pix-automatico.cobr": ["txid"],
  };

  const keys = required[source];
  if (keys.some((key) => key in record)) return [record];
  // Some deployments wrap a single event in an array.
  if (Array.isArray(record)) return record;
  return [];
}

/** What {@link verifyWebhookRequest} needs in order to decide. */
export interface WebhookVerificationInput {
  /** Whether the TLS layer authorised the peer certificate. */
  clientCertificateAuthorized?: boolean;
  /** Subject or issuer text from the peer certificate, for logging. */
  clientCertificateSubject?: string;
  /** Remote address of the caller. */
  remoteAddress?: string;
}

/** Options for {@link verifyWebhookRequest}. */
export interface WebhookVerificationOptions {
  /**
   * Require the TLS layer to report an authorised client certificate.
   *
   * @default true
   */
  requireClientCertificate?: boolean;
  /**
   * Also require the caller's address to be one Inter publishes.
   *
   * Off by default: the list changes, and behind a proxy the address you see is
   * often the proxy's. Turn it on when you read the real client address.
   *
   * @default false
   */
  requireKnownIp?: boolean;
  /** Overrides the published address list. */
  ipRanges?: readonly string[];
}

/**
 * Checks that a callback really came from Banco Inter.
 *
 * The meaningful signal is `clientCertificateAuthorized`, which your TLS
 * terminator produces — on Node, `socket.authorized` after `requestCert: true`
 * with Inter's `ca.crt` as the trust anchor.
 *
 * @throws {InterWebhookError} when the request cannot be attributed to Inter.
 */
export function verifyWebhookRequest(
  input: WebhookVerificationInput,
  options: WebhookVerificationOptions = {},
): void {
  if (options.requireClientCertificate !== false && input.clientCertificateAuthorized !== true) {
    throw new InterWebhookError(
      "callback was not authenticated by a client certificate. Configure the HTTPS listener with " +
        "`requestCert: true` and Inter's ca.crt as the trust anchor, or set requireClientCertificate: false " +
        "if TLS is terminated by a proxy that already does this.",
    );
  }
  if (options.requireKnownIp) {
    const address = input.remoteAddress;
    if (!address || !isInterWebhookIp(address, options.ipRanges)) {
      throw new InterWebhookError(`callback came from ${address ?? "an unknown address"}, which is not a published Inter range`);
    }
  }
}

// ---------------------------------------------------------------------------
// a ready-made listener
// ---------------------------------------------------------------------------

/** Options for {@link createWebhookServer}. */
export interface WebhookServerOptions {
  /** Your server's TLS certificate. A path, a PEM string, or bytes. */
  certificate: CertificateSource;
  /** Your server's private key. */
  privateKey: CertificateSource;
  /** Passphrase for {@link privateKey}. */
  passphrase?: string;
  /**
   * Inter's `ca.crt`, downloaded from Internet Banking under
   * `Minhas integrações > Certificado Webhook`. Callbacks are rejected unless
   * they present a certificate this CA issued.
   */
  interCA: CertificateSource;
  /** Port to listen on. @default 8443 */
  port?: number;
  /** Interface to bind. @default "0.0.0.0" */
  host?: string;
  /**
   * Maps request paths to webhook sources.
   *
   * @example { "/webhooks/cobranca": "cobranca", "/webhooks/pix": "pix" }
   */
  route: Record<string, InterWebhookSource>;
  /**
   * Handles one parsed callback.
   *
   * Return (or resolve) to acknowledge with `200`. Throw to answer `500`, which
   * makes Inter retry later — do that only when the failure is transient, since
   * a permanent error means the callback is retried until it ages out.
   */
  onEvent: (event: ParsedWebhook, context: WebhookRequestContext) => void | Promise<void>;
  /** Also require the caller's address to be a published Inter range. */
  requireKnownIp?: boolean;
  /** Maximum accepted body size, in bytes. @default 1048576 */
  maxBodyBytes?: number;
  /** Called when a callback is rejected or handling throws. */
  onError?: (error: unknown, context: WebhookRequestContext) => void;
}

/** What the listener knows about one inbound callback. */
export interface WebhookRequestContext {
  /** Request path, e.g. `/webhooks/pix`. */
  path: string;
  /** Caller's address. */
  remoteAddress?: string;
  /** Whether TLS authorised the peer certificate. */
  clientCertificateAuthorized: boolean;
  /** Subject line of the peer certificate, when one was presented. */
  clientCertificateSubject?: string;
}

/** A running webhook listener. */
export interface WebhookServer {
  /** The port actually bound, useful when `port: 0` was requested. */
  port: number;
  /** Stops accepting connections and resolves once the listener is closed. */
  close(): Promise<void>;
}

/**
 * Starts an HTTPS listener that only accepts callbacks Inter's CA vouches for.
 *
 * Node-only: it uses `node:https` so it can require and verify a client
 * certificate, which the Fetch-style server APIs do not expose. Everything else
 * in this module is runtime-agnostic.
 */
export async function createWebhookServer(options: WebhookServerOptions): Promise<WebhookServer> {
  const https = await import("node:https");
  const { resolveTLS } = await import("../core/tls.ts");

  const tls = await resolveTLS({
    certificate: options.certificate,
    privateKey: options.privateKey,
    passphrase: options.passphrase,
    ca: options.interCA,
  });

  const maxBodyBytes = options.maxBodyBytes ?? 1_048_576;

  const server = https.createServer(
    {
      cert: tls.cert,
      key: tls.key,
      passphrase: tls.passphrase,
      ca: tls.ca,
      // Ask for a client certificate but let the request through so we can
      // answer 401 with a useful message instead of dropping the connection.
      requestCert: true,
      rejectUnauthorized: false,
      minVersion: "TLSv1.2",
    },
    (req, res) => {
      const path = (req.url ?? "/").split("?")[0]!;
      const socket = req.socket as unknown as { authorized?: boolean; getPeerCertificate?: () => { subject?: Record<string, string> } };
      const peer = socket.getPeerCertificate?.();
      const context: WebhookRequestContext = {
        path,
        remoteAddress: req.socket.remoteAddress ?? undefined,
        clientCertificateAuthorized: socket.authorized === true,
        clientCertificateSubject: peer?.subject ? Object.entries(peer.subject).map(([k, v]) => `${k}=${v}`).join(",") : undefined,
      };

      const fail = (status: number, message: string, error?: unknown): void => {
        options.onError?.(error ?? new InterWebhookError(message), context);
        res.writeHead(status, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: message }));
      };

      if (req.method !== "POST") return fail(405, "callbacks must use POST");

      const source = options.route[path];
      if (!source) return fail(404, `no webhook registered for ${path}`);

      try {
        verifyWebhookRequest(
          {
            clientCertificateAuthorized: context.clientCertificateAuthorized,
            clientCertificateSubject: context.clientCertificateSubject,
            remoteAddress: context.remoteAddress,
          },
          { requireKnownIp: options.requireKnownIp },
        );
      } catch (err) {
        return fail(401, err instanceof Error ? err.message : "unauthenticated callback", err);
      }

      const chunks: Buffer[] = [];
      let size = 0;
      let aborted = false;

      req.on("data", (chunk: Buffer) => {
        size += chunk.length;
        if (size > maxBodyBytes) {
          aborted = true;
          fail(413, `callback body exceeded ${maxBodyBytes} bytes`);
          req.destroy();
          return;
        }
        chunks.push(chunk);
      });

      req.on("end", () => {
        if (aborted) return;
        void (async () => {
          try {
            const parsed = parseWebhook(source, Buffer.concat(chunks).toString("utf8"));
            await options.onEvent(parsed, context);
            res.writeHead(200, { "content-type": "application/json" });
            res.end('{"received":true}');
          } catch (err) {
            const status = err instanceof InterWebhookError ? 400 : 500;
            fail(status, err instanceof Error ? err.message : "callback handling failed", err);
          }
        })();
      });
    },
  );

  const port = options.port ?? 8443;
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, options.host ?? "0.0.0.0", () => {
      server.removeListener("error", reject);
      resolve();
    });
  });

  const address = server.address();
  return {
    port: typeof address === "object" && address ? address.port : port,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}
