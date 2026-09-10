/**
 * Binary and text encoding helpers that work the same on Node, Bun, Deno and
 * the browser.
 */

/** Decodes a base64 string into bytes. */
export function fromBase64(value: string): Uint8Array {
  const normalized = value.replace(/\s+/g, "");
  const g = globalThis as { Buffer?: { from(s: string, enc: string): Uint8Array }; atob?: (s: string) => string };
  if (g.Buffer) return new Uint8Array(g.Buffer.from(normalized, "base64"));
  if (g.atob) {
    const binary = g.atob(normalized);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
  }
  throw new Error("no base64 decoder available in this runtime");
}

/** Encodes bytes as base64. */
export function toBase64(bytes: Uint8Array): string {
  const g = globalThis as { Buffer?: { from(b: Uint8Array): { toString(enc: string): string } }; btoa?: (s: string) => string };
  if (g.Buffer) return g.Buffer.from(bytes).toString("base64");
  if (g.btoa) {
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return g.btoa(binary);
  }
  throw new Error("no base64 encoder available in this runtime");
}

/** Decodes UTF-8 bytes into a string. */
export function decodeUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

/** Encodes a string as UTF-8 bytes. */
export function encodeUtf8(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}
