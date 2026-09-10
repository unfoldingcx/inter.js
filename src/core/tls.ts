/**
 * Client-certificate (mTLS) material.
 *
 * Every call to Banco Inter's partner APIs runs over a mutually authenticated
 * TLS connection. Internet Banking hands you two files when you activate an
 * integration — a certificate (`.crt`) and its private key (`.key`) — and the
 * SDK presents them on every connection.
 *
 * The certificate is valid for one year in production and 30 days in the
 * sandbox. {@link inspectCertificate} reads the expiry so the client can warn
 * you before calls start failing.
 *
 * @see https://developers.inter.co/docs/introducao/autenticacao-mtls
 */

import { InterCertificateError } from "./errors.ts";

/** Raw certificate material: a PEM/DER buffer, a PEM string, or a file path. */
export type CertificateSource = string | Uint8Array | ArrayBuffer;

/** mTLS material as accepted in {@link InterClientOptions}. */
export interface TLSOptions {
  /**
   * The `.crt` file Inter generated for the integration. Accepts a filesystem
   * path, a PEM string (`-----BEGIN CERTIFICATE-----…`), or raw bytes.
   */
  certificate?: CertificateSource;
  /** The matching `.key` file. Same accepted forms as {@link certificate}. */
  privateKey?: CertificateSource;
  /**
   * A PKCS#12 bundle instead of a separate certificate and key — the format
   * Inter's Java and C# SDKs use. Accepts a path or raw bytes.
   *
   * ```sh
   * openssl pkcs12 -export -out inter.pfx -inkey inter.key -in inter.crt -aes256
   * ```
   */
  pfx?: CertificateSource;
  /** Passphrase protecting {@link privateKey} or {@link pfx}. */
  passphrase?: string;
  /**
   * Extra certificate authorities to trust when verifying Inter's server
   * certificate. Rarely needed; useful behind a TLS-inspecting proxy.
   */
  ca?: CertificateSource | CertificateSource[];
  /**
   * Set to `false` only to debug a broken corporate proxy. Turning off peer
   * verification removes the guarantee that you are talking to Banco Inter.
   *
   * @default true
   */
  rejectUnauthorized?: boolean;
}

/** mTLS material resolved to bytes, ready to hand to a TLS stack. */
export interface ResolvedTLS {
  cert?: Buffer;
  key?: Buffer;
  pfx?: Buffer;
  passphrase?: string;
  ca?: Buffer[];
  rejectUnauthorized: boolean;
}

const PEM_MARKER = "-----BEGIN";

function toBuffer(value: Uint8Array | ArrayBuffer | string): Buffer {
  if (typeof value === "string") return Buffer.from(value, "utf8");
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
}

/** Reads a file with whichever API the current runtime provides. */
async function readFileBytes(path: string): Promise<Buffer> {
  // Bun's file reader avoids pulling `node:fs` into edge/browser bundles.
  const bun = (globalThis as { Bun?: { file(p: string): { arrayBuffer(): Promise<ArrayBuffer> } } }).Bun;
  if (bun) return Buffer.from(await bun.file(path).arrayBuffer());
  const { readFile } = await import("node:fs/promises");
  return await readFile(path);
}

/**
 * Resolves one source to bytes.
 *
 * Strings that look like PEM are used verbatim; anything else is treated as a
 * filesystem path.
 */
async function resolveSource(source: CertificateSource, label: string): Promise<Buffer> {
  if (typeof source !== "string") return toBuffer(source);
  if (source.includes(PEM_MARKER)) return Buffer.from(source, "utf8");
  if (!source.trim()) throw new InterCertificateError(`${label} is an empty string`);
  try {
    return await readFileBytes(source);
  } catch (cause) {
    throw new InterCertificateError(
      `could not read ${label} from "${source}". Pass a readable file path, a PEM string, or raw bytes.`,
      { cause },
    );
  }
}

/**
 * Loads the configured mTLS material.
 *
 * @throws {InterCertificateError} when nothing was configured, only half of a
 * certificate/key pair was given, or a file could not be read.
 */
export async function resolveTLS(options: TLSOptions): Promise<ResolvedTLS> {
  const rejectUnauthorized = options.rejectUnauthorized !== false;

  const hasPair = Boolean(options.certificate) || Boolean(options.privateKey);
  const hasPfx = Boolean(options.pfx);

  if (!hasPair && !hasPfx) {
    throw new InterCertificateError(
      "no client certificate configured. Pass `certificate` + `privateKey` (the .crt and .key " +
        "downloaded from Internet Banking) or `pfx`, or set INTER_CERTIFICATE and INTER_PRIVATE_KEY.",
    );
  }
  if (hasPair && hasPfx) {
    throw new InterCertificateError("pass either `certificate` + `privateKey` or `pfx`, not both");
  }
  if (hasPair && !(options.certificate && options.privateKey)) {
    throw new InterCertificateError(
      options.certificate ? "`privateKey` is missing (the .key file)" : "`certificate` is missing (the .crt file)",
    );
  }

  const ca = options.ca === undefined ? undefined : Array.isArray(options.ca) ? options.ca : [options.ca];

  const resolved: ResolvedTLS = { rejectUnauthorized };
  if (options.passphrase) resolved.passphrase = options.passphrase;
  if (hasPfx) resolved.pfx = await resolveSource(options.pfx!, "pfx");
  else {
    resolved.cert = await resolveSource(options.certificate!, "certificate");
    resolved.key = await resolveSource(options.privateKey!, "privateKey");
  }
  if (ca) resolved.ca = await Promise.all(ca.map((c, i) => resolveSource(c, `ca[${i}]`)));

  return resolved;
}

// ---------------------------------------------------------------------------
// X.509 inspection
// ---------------------------------------------------------------------------

/** What {@link inspectCertificate} could read out of a certificate. */
export interface CertificateInfo {
  /** Start of the validity window. */
  notBefore: Date;
  /** End of the validity window — after this, every call fails at the TLS handshake. */
  notAfter: Date;
  /** Whole days left until expiry; negative once expired. */
  daysUntilExpiry: number;
  /** `true` when `notAfter` is already in the past. */
  expired: boolean;
  /** Serial number in hex, useful when comparing against Internet Banking. */
  serialNumber?: string;
}

interface DerNode {
  tag: number;
  start: number;
  end: number;
  contentStart: number;
  contentEnd: number;
}

function readNode(bytes: Uint8Array, offset: number): DerNode {
  const tag = bytes[offset]!;
  let cursor = offset + 1;
  const first = bytes[cursor++]!;
  let length: number;
  if (first < 0x80) {
    length = first;
  } else {
    const count = first & 0x7f;
    if (count === 0 || count > 4) throw new Error("unsupported DER length");
    length = 0;
    for (let i = 0; i < count; i++) length = (length << 8) | bytes[cursor++]!;
  }
  return { tag, start: offset, end: cursor + length, contentStart: cursor, contentEnd: cursor + length };
}

function children(bytes: Uint8Array, node: DerNode): DerNode[] {
  const out: DerNode[] = [];
  let offset = node.contentStart;
  while (offset < node.contentEnd) {
    const child = readNode(bytes, offset);
    out.push(child);
    offset = child.end;
  }
  return out;
}

const TAG_SEQUENCE = 0x30;
const TAG_INTEGER = 0x02;
const TAG_UTC_TIME = 0x17;
const TAG_GENERALIZED_TIME = 0x18;

function parseAsn1Time(bytes: Uint8Array, node: DerNode): Date {
  const text = new TextDecoder().decode(bytes.subarray(node.contentStart, node.contentEnd));
  const m =
    node.tag === TAG_UTC_TIME
      ? text.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?Z$/)
      : text.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?(?:\.\d+)?Z$/);
  if (!m) throw new Error(`unrecognised ASN.1 time "${text}"`);
  const yearRaw = Number(m[1]);
  const year = node.tag === TAG_UTC_TIME ? (yearRaw < 50 ? 2000 + yearRaw : 1900 + yearRaw) : yearRaw;
  return new Date(Date.UTC(year, Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6] ?? 0)));
}

/** Extracts the first `CERTIFICATE` block from a PEM bundle, or `null` for DER input. */
function pemToDer(input: Uint8Array): Uint8Array | null {
  const text = new TextDecoder().decode(input.subarray(0, Math.min(input.length, 1 << 20)));
  const match = text.match(/-----BEGIN CERTIFICATE-----([\s\S]*?)-----END CERTIFICATE-----/);
  if (!match) return null;
  return Uint8Array.from(Buffer.from(match[1]!.replace(/\s+/g, ""), "base64"));
}

/**
 * Reads the validity window out of an X.509 certificate.
 *
 * Handles PEM and DER input, and PEM bundles containing a chain (the first
 * `CERTIFICATE` block wins, which is the leaf in Inter's downloads). Returns
 * `undefined` rather than throwing when the input cannot be parsed — expiry
 * warnings are a convenience, never a reason to fail a request.
 */
export function inspectCertificate(certificate: Uint8Array | string, now: Date = new Date()): CertificateInfo | undefined {
  try {
    const raw = typeof certificate === "string" ? new TextEncoder().encode(certificate) : certificate;
    const der = raw[0] === TAG_SEQUENCE ? raw : pemToDer(raw);
    if (!der) return undefined;

    const root = readNode(der, 0);
    const tbs = children(der, root)[0];
    if (!tbs) return undefined;

    const tbsChildren = children(der, tbs);

    const validity = tbsChildren.find((node) => {
      if (node.tag !== TAG_SEQUENCE) return false;
      const kids = children(der, node);
      return kids.length === 2 && kids.every((k) => k.tag === TAG_UTC_TIME || k.tag === TAG_GENERALIZED_TIME);
    });
    if (!validity) return undefined;

    const [notBeforeNode, notAfterNode] = children(der, validity);
    const notBefore = parseAsn1Time(der, notBeforeNode!);
    const notAfter = parseAsn1Time(der, notAfterNode!);

    const serialNode = tbsChildren.find((n) => n.tag === TAG_INTEGER);
    const serialNumber = serialNode
      ? Buffer.from(der.subarray(serialNode.contentStart, serialNode.contentEnd)).toString("hex")
      : undefined;

    const msPerDay = 86_400_000;
    const daysUntilExpiry = Math.floor((notAfter.getTime() - now.getTime()) / msPerDay);

    return { notBefore, notAfter, daysUntilExpiry, expired: notAfter.getTime() <= now.getTime(), serialNumber };
  } catch {
    return undefined;
  }
}
