/**
 * Test doubles.
 *
 * ```ts
 * import { InterClient } from "inter.js";
 * import { MockTransport } from "inter.js/testing";
 *
 * const transport = new MockTransport()
 *   .onPost("/oauth/v2/token", { access_token: "t", token_type: "Bearer", expires_in: 3600, scope: "extrato.read" })
 *   .onGet("/banking/v2/saldo", { disponivel: 1234.56 });
 *
 * const inter = new InterClient({ clientId: "id", clientSecret: "secret", transport });
 *
 * expect(await inter.banking.saldo()).toEqual({ disponivel: 1234.56 });
 * expect(transport.requests.at(-1)?.headers.authorization).toBe("Bearer t");
 * ```
 *
 * Because it replaces the transport, `MockTransport` needs no certificate: the
 * client skips loading TLS material when a transport is supplied and no
 * certificate options are set.
 */

import type { Transport, TransportRequest, TransportResponse } from "./core/transport/types.ts";
import { TransportError } from "./core/transport/types.ts";

/** How a mocked route answers. */
export type MockResponder =
  | { status?: number; headers?: Record<string, string>; body?: unknown }
  | ((request: RecordedRequest) => { status?: number; headers?: Record<string, string>; body?: unknown } | Promise<{ status?: number; headers?: Record<string, string>; body?: unknown }>);

/** A request the mock saw, with its body already decoded. */
export interface RecordedRequest {
  method: string;
  /** Absolute URL, query string included. */
  url: string;
  /** Path only, without the origin or query string. */
  path: string;
  /** Query parameters, flattened. */
  query: Record<string, string>;
  headers: Record<string, string>;
  /** Body as text, when one was sent. */
  body?: string;
  /** Body parsed as JSON, when it parsed. */
  json?: unknown;
}

interface Route {
  method: string;
  match: (request: RecordedRequest) => boolean;
  responder: MockResponder;
  /** Answer at most this many times; `undefined` means always. */
  times?: number;
  used: number;
  description: string;
}

/**
 * A {@link Transport} that answers from a routing table instead of the network.
 *
 * Routes are matched in registration order. The first route whose method and
 * path match, and which still has uses left, wins.
 */
export class MockTransport implements Transport {
  readonly name = "mock";
  /** Every request the mock has seen, oldest first. */
  readonly requests: RecordedRequest[] = [];

  private readonly routes: Route[] = [];
  private fallback: MockResponder | undefined;

  /** Registers a route for any method. `path` may be a string prefix or a RegExp. */
  on(method: string, path: string | RegExp, responder: MockResponder, options?: { times?: number }): this {
    this.routes.push({
      method: method.toUpperCase(),
      match: (request) => (typeof path === "string" ? request.path === path || request.path.startsWith(path) : path.test(request.path)),
      responder,
      times: options?.times,
      used: 0,
      description: `${method.toUpperCase()} ${String(path)}`,
    });
    return this;
  }

  /** Registers a `GET` route. */
  onGet(path: string | RegExp, responder: MockResponder, options?: { times?: number }): this {
    return this.on("GET", path, responder, options);
  }
  /** Registers a `POST` route. */
  onPost(path: string | RegExp, responder: MockResponder, options?: { times?: number }): this {
    return this.on("POST", path, responder, options);
  }
  /** Registers a `PUT` route. */
  onPut(path: string | RegExp, responder: MockResponder, options?: { times?: number }): this {
    return this.on("PUT", path, responder, options);
  }
  /** Registers a `PATCH` route. */
  onPatch(path: string | RegExp, responder: MockResponder, options?: { times?: number }): this {
    return this.on("PATCH", path, responder, options);
  }
  /** Registers a `DELETE` route. */
  onDelete(path: string | RegExp, responder: MockResponder, options?: { times?: number }): this {
    return this.on("DELETE", path, responder, options);
  }

  /**
   * Answers a valid OAuth token for any token request.
   *
   * Every client call needs one, so this is almost always the first line of a test.
   */
  withToken(accessToken = "test-token", scope = ""): this {
    return this.onPost("/oauth/v2/token", () => ({
      body: { access_token: accessToken, token_type: "Bearer", expires_in: 3600, scope },
    }));
  }

  /** Sets the response used when no route matches. Without it, unmatched requests throw. */
  onAnythingElse(responder: MockResponder): this {
    this.fallback = responder;
    return this;
  }

  /** Makes the next matching request fail at the transport layer. */
  failNext(kind: "timeout" | "connection" = "connection", message = "simulated network failure"): this {
    this.routes.unshift({
      method: "*",
      match: () => true,
      responder: () => {
        throw new TransportError(kind, message);
      },
      times: 1,
      used: 0,
      description: `fail ${kind}`,
    });
    return this;
  }

  /** Forgets recorded requests and route usage counts. */
  reset(): void {
    this.requests.length = 0;
    for (const route of this.routes) route.used = 0;
  }

  /** Requests recorded for one path, in order. */
  requestsFor(path: string | RegExp): RecordedRequest[] {
    return this.requests.filter((r) => (typeof path === "string" ? r.path === path : path.test(r.path)));
  }

  /** The most recent request, if any. */
  get lastRequest(): RecordedRequest | undefined {
    return this.requests.at(-1);
  }

  async request(request: TransportRequest): Promise<TransportResponse> {
    const url = new URL(request.url);
    const bodyText =
      request.body === undefined ? undefined : typeof request.body === "string" ? request.body : new TextDecoder().decode(request.body);

    let json: unknown;
    if (bodyText) {
      try {
        json = JSON.parse(bodyText);
      } catch {
        json = undefined;
      }
    }

    const recorded: RecordedRequest = {
      method: request.method,
      url: request.url,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      headers: request.headers,
      body: bodyText,
      json,
    };
    this.requests.push(recorded);

    const route = this.routes.find(
      (r) => (r.method === "*" || r.method === request.method) && (r.times === undefined || r.used < r.times) && r.match(recorded),
    );

    const responder = route?.responder ?? this.fallback;
    if (!responder) {
      throw new TransportError(
        "connection",
        `MockTransport has no route for ${request.method} ${url.pathname}. ` +
          `Registered: ${this.routes.map((r) => r.description).join(", ") || "(none)"}`,
      );
    }
    if (route) route.used++;

    const result = typeof responder === "function" ? await responder(recorded) : responder;
    const status = result.status ?? 200;
    const payload = result.body === undefined ? "" : typeof result.body === "string" ? result.body : JSON.stringify(result.body);

    return {
      status,
      statusText: status === 200 ? "OK" : "",
      headers: { "content-type": "application/json", ...lower(result.headers) },
      body: new TextEncoder().encode(payload),
    };
  }
}

function lower(headers: Record<string, string> | undefined): Record<string, string> {
  if (!headers) return {};
  return Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
}
