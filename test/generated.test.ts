/**
 * Guards on the generated layer. These catch drift the moment Inter changes its
 * API reference and someone re-runs `bun run generate`.
 */
import { describe, expect, test } from "bun:test";
import { INTER_ENDPOINTS, INTER_SCOPES, isKnownScope } from "../src/index.ts";
import type { EndpointMeta } from "../src/index.ts";
import { INTER_BASE_PATHS } from "../src/config.ts";

const all: [string, string, EndpointMeta][] = Object.entries(INTER_ENDPOINTS).flatMap(([api, endpoints]) =>
  Object.entries(endpoints as Record<string, EndpointMeta>).map(([key, meta]) => [api, key, meta] as [string, string, EndpointMeta]),
);

describe("endpoint metadata", () => {
  test("covers every API", () => {
    expect(Object.keys(INTER_ENDPOINTS).sort()).toEqual(["banking", "cobranca", "pix", "pixAutomatico", "token"]);
    expect(all.length).toBeGreaterThan(85);
  });

  test("every path is a clean template", () => {
    for (const [api, key, meta] of all) {
      const label = `${api}.${key}`;
      expect(meta.path, label).toMatch(/^\/[^\s]*$/);
      expect(meta.path, label).not.toContain(" ");
      // Braces must be balanced, or URL building would leave a literal `{...}`.
      expect((meta.path.match(/\{/g) ?? []).length, label).toBe((meta.path.match(/\}/g) ?? []).length);
    }
  });

  test("every method is a verb the transport understands", () => {
    for (const [api, key, meta] of all) {
      expect(["GET", "POST", "PUT", "PATCH", "DELETE"], `${api}.${key}`).toContain(meta.method);
    }
  });

  test("every scope is one the SDK documents", () => {
    for (const [api, key, meta] of all) {
      if (!meta.scope) continue;
      expect(isKnownScope(meta.scope), `${api}.${key} declares unknown scope ${meta.scope}`).toBe(true);
    }
  });

  test("only the token endpoint is unauthenticated", () => {
    for (const [api, key, meta] of all) {
      if (api === "token") continue;
      expect(meta.scope, `${api}.${key} has no scope`).toBeDefined();
    }
  });

  test("rate limits are positive when documented", () => {
    for (const [api, key, meta] of all) {
      for (const value of [meta.rateLimit?.producao, meta.rateLimit?.sandbox]) {
        if (value === undefined) continue;
        expect(value, `${api}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  test("no two operations in one API share a route", () => {
    for (const [api, endpoints] of Object.entries(INTER_ENDPOINTS)) {
      const routes = Object.values(endpoints as Record<string, EndpointMeta>).map((m) => `${m.method} ${m.path}`);
      expect(new Set(routes).size, `${api} has duplicate routes`).toBe(routes.length);
    }
  });

  test("base paths match the documented versions", () => {
    expect(INTER_BASE_PATHS).toEqual({
      oauth: "/oauth/v2",
      cobranca: "/cobranca/v3",
      banking: "/banking/v2",
      pix: "/pix/v2",
      pixAutomatico: "/pix/v2",
    });
  });

  test("the scope list has no duplicates and is well-formed", () => {
    expect(new Set(INTER_SCOPES).size).toBe(INTER_SCOPES.length);
    for (const scope of INTER_SCOPES) expect(scope).toMatch(/^[a-z][a-z0-9-]*\.(read|write)$/);
  });

  test("known endpoints still exist under the names the resources use", () => {
    // A rename in Inter's spec would otherwise surface as a runtime failure.
    expect(INTER_ENDPOINTS.cobranca.emitirCobrancaAsync.path).toBe("/cobrancas");
    expect(INTER_ENDPOINTS.banking.saldo.scope).toBe("extrato.read");
    expect(INTER_ENDPOINTS.pix.postCob.method).toBe("POST");
    expect(INTER_ENDPOINTS.pixAutomatico.recPost.path).toBe("/rec");
    expect(INTER_ENDPOINTS.token.token.path).toBe("/token");
  });
});
