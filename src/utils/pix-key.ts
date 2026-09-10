/**
 * Pix keys.
 *
 * A Pix key is one of five things, and which one it is decides how it must be
 * formatted on the wire. Phones need an E.164 `+55` prefix; CPF and CNPJ must be
 * bare digits; random keys are lower-case UUIDs.
 */

import { isValidCNPJ, isValidCPF, onlyDigits } from "./documents.ts";

/** The five kinds of Pix key. */
export type PixKeyType = "CPF" | "CNPJ" | "EMAIL" | "TELEFONE" | "EVP";

/** What {@link parsePixKey} determined about a key. */
export interface PixKeyInfo {
  /** Which kind of key it is. */
  type: PixKeyType;
  /** The key formatted the way Inter expects it on the wire. */
  value: string;
  /** `true` when the key is well-formed, including check digits for CPF/CNPJ. */
  valid: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Works out what kind of Pix key a string is and normalises it.
 *
 * Returns `undefined` when the input does not look like any kind of key.
 *
 * @example
 * parsePixKey("(31) 99999-9999")
 * // => { type: "TELEFONE", value: "+5531999999999", valid: true }
 *
 * @example
 * parsePixKey("529.982.247-25")
 * // => { type: "CPF", value: "52998224725", valid: true }
 */
export function parsePixKey(input: string): PixKeyInfo | undefined {
  const raw = input.trim();
  if (!raw) return undefined;

  if (UUID_RE.test(raw)) return { type: "EVP", value: raw.toLowerCase(), valid: true };
  if (raw.includes("@")) return { type: "EMAIL", value: raw.toLowerCase(), valid: EMAIL_RE.test(raw) && raw.length <= 77 };

  const digits = onlyDigits(raw);

  // Anything explicitly international, or a Brazilian number with its country
  // code already attached, is a phone rather than a document.
  if (raw.startsWith("+") || (digits.length >= 12 && digits.startsWith("55"))) {
    const value = raw.startsWith("+") ? `+${digits}` : `+${digits}`;
    return { type: "TELEFONE", value, valid: /^\+55\d{10,11}$/.test(value) };
  }

  if (digits.length === 11 && isValidCPF(digits)) return { type: "CPF", value: digits, valid: true };
  if (digits.length === 14) return { type: "CNPJ", value: digits, valid: isValidCNPJ(digits) };
  if (digits.length === 10 || digits.length === 11) {
    // A ten or eleven digit number that is not a valid CPF is a local phone.
    const value = `+55${digits}`;
    return { type: "TELEFONE", value, valid: /^\+55\d{10,11}$/.test(value) };
  }
  if (digits.length === 11) return { type: "CPF", value: digits, valid: false };

  return undefined;
}

/**
 * Normalises a Pix key into the form Inter expects.
 *
 * @throws {TypeError} when the value is not a recognisable key.
 */
export function normalizePixKey(input: string): string {
  const parsed = parsePixKey(input);
  if (!parsed) throw new TypeError(`"${input}" is not a recognisable Pix key`);
  return parsed.value;
}

/** `true` when the value is a well-formed Pix key of any kind. */
export function isValidPixKey(input: string): boolean {
  return parsePixKey(input)?.valid ?? false;
}
