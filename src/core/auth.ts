/**
 * OAuth 2.0 client-credentials flow.
 *
 * Banco Inter issues bearer tokens from `POST /oauth/v2/token` over the same
 * mutually authenticated connection the APIs use. A token lasts one hour and the
 * token endpoint itself is capped at five calls per minute, so the SDK caches
 * aggressively and never lets two concurrent callers mint the same token twice.
 *
 * Scopes are the interesting part. A token may only carry scopes the integration
 * was granted in Internet Banking, and asking for one it does not have fails the
 * whole request. The default strategy therefore starts from nothing and widens
 * the token as calls demand new scopes.
 *
 * @see https://developers.inter.co/references/token
 */

import { InterAuthenticationError, InterConfigurationError, createAPIError } from "./errors.ts";
import { parseProblem } from "./problem.ts";
import { formatScopes, normalizeScopes } from "./scopes.ts";
import type { Logger } from "./logger.ts";
import { maskToken } from "./logger.ts";

/** A cached access token. */
export interface TokenRecord {
  /** The bearer token itself. */
  accessToken: string;
  /** Token type as returned by the server, normally `Bearer`. */
  tokenType: string;
  /** Scopes the server actually granted, sorted. */
  scopes: string[];
  /** Absolute expiry, in milliseconds since the epoch. */
  expiresAt: number;
}

/**
 * Where tokens are kept.
 *
 * The default store lives in memory, which is right for a single process. In a
 * cluster, back it with Redis so every instance shares one token and the
 * five-calls-per-minute budget on the token endpoint is not multiplied by your
 * replica count.
 *
 * @example
 * ```ts
 * const store: TokenStore = {
 *   async get(key) {
 *     const raw = await redis.get(`inter:${key}`);
 *     return raw ? JSON.parse(raw) : undefined;
 *   },
 *   async set(key, record) {
 *     const ttl = Math.max(1, Math.floor((record.expiresAt - Date.now()) / 1000));
 *     await redis.set(`inter:${key}`, JSON.stringify(record), "EX", ttl);
 *   },
 *   async delete(key) { await redis.del(`inter:${key}`); },
 * };
 * ```
 */
export interface TokenStore {
  get(key: string): Promise<TokenRecord | undefined> | TokenRecord | undefined;
  set(key: string, record: TokenRecord): Promise<void> | void;
  delete(key: string): Promise<void> | void;
}

/** How the SDK decides which scopes to put on a token. */
export type ScopeStrategy =
  /**
   * Start empty and widen. The first call needing `pix.read` mints a token for
   * `pix.read`; a later call needing `pix.write` mints one for both. Converges
   * after a few calls and never asks for a scope you do not use.
   */
  | "auto"
  /** Always request exactly the scopes configured on the client. */
  | "fixed"
  /** One token per required scope. Maximum isolation, more token calls. */
  | "per-request";

/** Options for {@link TokenManager}. */
export interface TokenManagerOptions {
  /** `clientId` from the integration's credentials. */
  clientId: string;
  /** `clientSecret` from the integration's credentials. */
  clientSecret: string;
  /** Absolute URL of the token endpoint. */
  tokenUrl: string;
  /** Performs the token request. Supplied by the client so mTLS and retries apply. */
  requestToken: (body: string, signal?: AbortSignal) => Promise<{ status: number; headers: Record<string, string>; body: Uint8Array }>;
  /** Scopes to request under the `fixed` strategy, and the seed set for `auto`. */
  scopes?: readonly string[];
  /** @default "auto" */
  strategy?: ScopeStrategy;
  /** Cache backend. @default in-memory */
  store?: TokenStore;
  /**
   * Refresh this many milliseconds before the server-declared expiry, so a token
   * never expires mid-flight.
   *
   * @default 60000
   */
  expirySkewMs?: number;
  /** Namespace for cache keys, so several integrations can share one store. */
  cacheNamespace?: string;
  logger?: Logger;
}

/** An in-memory {@link TokenStore}. */
export function createMemoryTokenStore(): TokenStore {
  const map = new Map<string, TokenRecord>();
  return {
    get: (key) => map.get(key),
    set: (key, record) => void map.set(key, record),
    delete: (key) => void map.delete(key),
  };
}

/** Mints, caches and refreshes access tokens. */
export class TokenManager {
  private readonly options: Required<Pick<TokenManagerOptions, "strategy" | "expirySkewMs" | "cacheNamespace">> &
    TokenManagerOptions;
  private readonly store: TokenStore;
  /** Scopes requested so far, used by the `auto` strategy. */
  private readonly known = new Set<string>();
  /** De-duplicates concurrent mints for the same cache key. */
  private readonly inFlight = new Map<string, Promise<TokenRecord>>();

  constructor(options: TokenManagerOptions) {
    if (!options.clientId) throw new InterConfigurationError("`clientId` is required");
    if (!options.clientSecret) throw new InterConfigurationError("`clientSecret` is required");

    // Defaults must come last: the incoming object carries explicit `undefined`
    // values for options the caller left unset, and those would otherwise win.
    this.options = {
      ...options,
      strategy: options.strategy ?? "auto",
      expirySkewMs: options.expirySkewMs ?? 60_000,
      cacheNamespace: options.cacheNamespace ?? options.clientId,
    };
    this.store = options.store ?? createMemoryTokenStore();
    for (const scope of normalizeScopes(options.scopes ?? [])) this.known.add(scope);
  }

  /** Scopes the next token will carry, given everything requested so far. */
  get plannedScopes(): string[] {
    return [...this.known].sort();
  }

  /**
   * Returns a valid bearer token covering `requiredScope`.
   *
   * Concurrent callers that need the same scope set share a single token
   * request. A cached token is reused until it is within the expiry skew.
   */
  async getToken(requiredScope?: string, signal?: AbortSignal): Promise<TokenRecord> {
    const scopes = this.resolveScopes(requiredScope);
    const key = this.cacheKey(scopes);

    const cached = await this.store.get(key);
    if (cached && this.isFresh(cached) && covers(cached.scopes, scopes)) return cached;

    const pending = this.inFlight.get(key);
    if (pending) return await pending;

    const promise = this.mint(scopes, key, signal).finally(() => this.inFlight.delete(key));
    this.inFlight.set(key, promise);
    return await promise;
  }

  /** Returns the `Authorization` header value for `requiredScope`. */
  async authorizationHeader(requiredScope?: string, signal?: AbortSignal): Promise<string> {
    const token = await this.getToken(requiredScope, signal);
    const type = token.tokenType && token.tokenType.toLowerCase() !== "bearer" ? token.tokenType : "Bearer";
    return `${type} ${token.accessToken}`;
  }

  /**
   * Drops the cached token covering `requiredScope`, forcing a fresh mint.
   * Called automatically when the API answers `401`.
   */
  async invalidate(requiredScope?: string): Promise<void> {
    await this.store.delete(this.cacheKey(this.resolveScopes(requiredScope)));
  }

  /** Drops every token this manager has cached, for all scope sets. */
  async invalidateAll(): Promise<void> {
    const strategies: string[][] = [this.plannedScopes];
    for (const scope of this.known) strategies.push([scope]);
    await Promise.all(strategies.map((scopes) => this.store.delete(this.cacheKey(scopes))));
  }

  // -- internals ------------------------------------------------------------

  private resolveScopes(requiredScope?: string): string[] {
    switch (this.options.strategy) {
      case "fixed":
        return normalizeScopes(this.options.scopes ?? []);
      case "per-request":
        return requiredScope ? [requiredScope] : normalizeScopes(this.options.scopes ?? []);
      default: {
        if (requiredScope) this.known.add(requiredScope);
        return this.plannedScopes;
      }
    }
  }

  private cacheKey(scopes: string[]): string {
    return `${this.options.cacheNamespace}|${scopes.join(" ")}`;
  }

  private isFresh(record: TokenRecord): boolean {
    return record.expiresAt - this.options.expirySkewMs > Date.now();
  }

  private async mint(scopes: string[], key: string, signal?: AbortSignal): Promise<TokenRecord> {
    if (!scopes.length) {
      throw new InterConfigurationError(
        "no OAuth scope to request. Either call an endpoint that declares one, or set `scopes` on the client.",
      );
    }

    const form = new URLSearchParams({
      client_id: this.options.clientId,
      client_secret: this.options.clientSecret,
      grant_type: "client_credentials",
      scope: formatScopes(scopes),
    });

    this.options.logger?.debug("inter: requesting access token", { scopes, url: this.options.tokenUrl });

    const started = Date.now();
    const response = await this.options.requestToken(form.toString(), signal);
    const text = new TextDecoder().decode(response.body);

    if (response.status < 200 || response.status >= 300) {
      throw this.tokenError(response.status, text, response.headers, scopes);
    }

    let payload: { access_token?: string; token_type?: string; expires_in?: number | string; scope?: string };
    try {
      payload = JSON.parse(text) as typeof payload;
    } catch (cause) {
      throw new InterAuthenticationError("token endpoint returned a non-JSON body", response.status, {
        cause,
        context: { url: this.options.tokenUrl, method: "POST", status: response.status, body: truncate(text) },
      });
    }

    if (!payload.access_token) {
      throw new InterAuthenticationError("token endpoint returned no access_token", response.status, {
        context: { url: this.options.tokenUrl, method: "POST", status: response.status, body: truncate(text) },
      });
    }

    const expiresInSeconds = Number(payload.expires_in ?? 3600);
    const granted = normalizeScopes(payload.scope ? payload.scope.split(" ") : scopes);

    const record: TokenRecord = {
      accessToken: payload.access_token,
      tokenType: payload.token_type ?? "Bearer",
      scopes: granted,
      expiresAt: started + (Number.isFinite(expiresInSeconds) ? expiresInSeconds : 3600) * 1000,
    };

    const missing = scopes.filter((s) => !granted.includes(s));
    if (missing.length) {
      this.options.logger?.warn("inter: token granted fewer scopes than requested", { requested: scopes, granted, missing });
    }

    this.options.logger?.debug("inter: access token issued", {
      token: maskToken(record.accessToken),
      scopes: granted,
      expiresIn: Math.round((record.expiresAt - Date.now()) / 1000),
    });

    await this.store.set(key, record);
    return record;
  }

  private tokenError(status: number, text: string, headers: Record<string, string>, scopes: string[]): Error {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = undefined;
    }
    const problem = parseProblem(parsed);
    const context = {
      method: "POST",
      url: this.options.tokenUrl,
      status,
      headers,
      body: truncate(text),
      requestId: headers["x-request-id"] ?? headers["x-correlation-id"],
    };

    const hint =
      status === 400 || status === 403
        ? " Check that every requested scope was enabled for this integration in Internet Banking " +
          `(Integrar > Minhas integrações). Requested: ${scopes.join(" ")}.`
        : status === 401
          ? " The client credentials must belong to the same integration as the mTLS certificate presented on this connection."
          : "";

    const error = createAPIError(status, problem, context);
    if (hint) {
      return new (error.constructor as new (m: string, s: number, o?: object) => typeof error)(error.message + hint, status, {
        problem,
        context,
      });
    }
    return error;
  }
}

/** `true` when `granted` includes every scope in `needed`. */
function covers(granted: readonly string[], needed: readonly string[]): boolean {
  const set = new Set(granted);
  return needed.every((scope) => set.has(scope));
}

function truncate(text: string, max = 2000): string {
  return text.length > max ? `${text.slice(0, max)}… (${text.length} bytes)` : text;
}
