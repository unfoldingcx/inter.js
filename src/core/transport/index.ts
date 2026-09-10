/**
 * Transport selection.
 *
 * The right HTTP stack depends on the runtime: Node cannot do mTLS through
 * `fetch`, Bun and Deno can. {@link createTransport} picks automatically, and
 * you can always override it with `transport` on the client.
 */

import type { Transport, TransportOptions } from "./types.ts";
import { createBunTransport, createDenoTransport, createPlainFetchTransport } from "./fetch.ts";
import { createNodeTransport } from "./node.ts";

export type {
  Transport,
  TransportOptions,
  TransportRequest,
  TransportResponse,
  TransportErrorKind,
} from "./types.ts";
export { TransportError } from "./types.ts";
export { createNodeTransport } from "./node.ts";
export { createBunTransport, createDenoTransport, createPlainFetchTransport } from "./fetch.ts";

/** Which JavaScript runtime the SDK is executing on. */
export type Runtime = "bun" | "deno" | "node" | "unknown";

/** Detects the current runtime. */
export function detectRuntime(): Runtime {
  const g = globalThis as { Bun?: unknown; Deno?: unknown; process?: { versions?: { node?: string } } };
  if (g.Bun) return "bun";
  if (g.Deno) return "deno";
  if (g.process?.versions?.node) return "node";
  return "unknown";
}

/**
 * Builds the best transport for the current runtime.
 *
 * | Runtime | Transport | mTLS |
 * | --- | --- | --- |
 * | Bun | `fetch` with the `tls` option | yes |
 * | Deno | `fetch` with `Deno.createHttpClient` | yes |
 * | Node | `node:https` with a keep-alive agent | yes |
 * | other | plain `fetch` | only if terminated upstream |
 */
export async function createTransport(options: TransportOptions = {}): Promise<Transport> {
  switch (detectRuntime()) {
    case "bun":
      return createBunTransport(options);
    case "deno":
      return createDenoTransport(options);
    case "node":
      return await createNodeTransport(options);
    default:
      return createPlainFetchTransport(options);
  }
}
