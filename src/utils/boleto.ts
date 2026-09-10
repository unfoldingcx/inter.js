/**
 * Boleto barcodes and linhas digitáveis.
 *
 * Two families exist and they use different rules:
 *
 * | Family | Barcode | Linha digitável | Starts with |
 * | --- | --- | --- | --- |
 * | Bank slip (cobrança) | 44 digits | 47 digits | a bank code, never `8` |
 * | Utility / tax (arrecadação) | 44 digits | 48 digits | `8` |
 *
 * `inter.banking.pagamentos.payBoleto()` accepts either representation, so the
 * point of these helpers is to validate before you spend a call, and to read the
 * amount and due date out of what a customer pasted.
 *
 * @see FEBRABAN, Layout Padrão de Código de Barras
 */

import { onlyDigits } from "./documents.ts";

/** Which boleto family a document belongs to. */
export type BoletoTipo = "COBRANCA" | "ARRECADACAO";

/** What {@link parseBoleto} could read out of a document. */
export interface BoletoInfo {
  /** Which family it belongs to. */
  tipo: BoletoTipo;
  /** The 44-digit barcode. */
  codigoBarras: string;
  /** The 47- or 48-digit linha digitável. */
  linhaDigitavel: string;
  /** `true` when every check digit matches. */
  valid: boolean;
  /** Amount in reais, when the document carries one. `0` means "amount not fixed". */
  valor?: number;
  /** Due date, when the document carries one. Bank slips only. */
  vencimento?: Date;
  /** Issuing bank's three-digit code. Bank slips only. */
  banco?: string;
  /** Currency code. `9` is BRL. Bank slips only. */
  moeda?: string;
  /** The bank-specific 25-digit segment. Bank slips only. */
  campoLivre?: string;
  /** Why validation failed, when it did. */
  error?: string;
}

/**
 * Day zero of the "fator de vencimento" counter, per FEBRABAN: factor `0` is
 * 1997-10-07, so factor `1000` is 2000-07-03 and factor `9999` is 2025-02-21.
 */
const FATOR_BASE = Date.UTC(1997, 9, 7);

/** One day, in milliseconds. */
const DAY_MS = 86_400_000;

/**
 * The counter only has four digits. It ran out on 2025-02-21 at `9999` and
 * restarted at `1000` the next day, so factors repeat every 9000 days.
 */
const FATOR_CYCLE = 9000;
const FATOR_MIN = 1000;
const FATOR_MAX = 9999;

/** Modulo-10 check digit, weights alternating 2 and 1 from the right. */
export function mod10(digits: string): number {
  let sum = 0;
  let weight = 2;
  for (let i = digits.length - 1; i >= 0; i--) {
    const product = Number(digits[i]) * weight;
    sum += product > 9 ? product - 9 : product;
    weight = weight === 2 ? 1 : 2;
  }
  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Modulo-11 check digit for a barcode's general check position.
 *
 * Weights cycle 2..9 from the right; a remainder of 0, 1 or 10 maps to `1`.
 */
export function mod11Barcode(digits: string): number {
  let sum = 0;
  let weight = 2;
  for (let i = digits.length - 1; i >= 0; i--) {
    sum += Number(digits[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  const remainder = 11 - (sum % 11);
  return remainder === 0 || remainder === 10 || remainder === 11 ? 1 : remainder;
}

/**
 * Modulo-11 check digit as used by arrecadação blocks.
 *
 * Same weight cycle, but a remainder of 10 maps to `0` and 11 maps to `0`.
 */
export function mod11Arrecadacao(digits: string): number {
  let sum = 0;
  let weight = 2;
  for (let i = digits.length - 1; i >= 0; i--) {
    sum += Number(digits[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  const remainder = sum % 11;
  const digit = 11 - remainder;
  return digit === 10 || digit === 11 ? 0 : digit;
}

/**
 * Converts a "fator de vencimento" into a date.
 *
 * The four-digit counter wrapped on 2025-02-22, so a factor maps to more than
 * one calendar date. The candidate nearest `reference` wins, which resolves
 * correctly for any boleto whose due date is within a decade of today.
 *
 * @param fator The four-digit factor from barcode positions 6-9.
 * @param reference Date used to disambiguate cycles. Defaults to now.
 * @returns The due date, or `undefined` when the factor is `0000` (no due date).
 */
export function fatorToDate(fator: string, reference: Date = new Date()): Date | undefined {
  const value = Number(fator);
  if (!Number.isInteger(value) || value === 0) return undefined;

  let best: Date | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let cycle = 0; cycle <= 3; cycle++) {
    const candidate = new Date(FATOR_BASE + (value + cycle * FATOR_CYCLE) * DAY_MS);
    const distance = Math.abs(candidate.getTime() - reference.getTime());
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }
  return best;
}

/**
 * Converts a date into its four-digit "fator de vencimento", folding the value
 * back into the 1000-9999 range the way FEBRABAN's restart requires.
 */
export function dateToFator(date: Date): string {
  const days = Math.round((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - FATOR_BASE) / DAY_MS);
  if (days <= 0) return "0000";
  let fator = days;
  while (fator > FATOR_MAX) fator -= FATOR_CYCLE;
  if (fator < FATOR_MIN) fator += FATOR_CYCLE;
  return String(fator).padStart(4, "0");
}

/**
 * Converts a bank-slip barcode (44 digits) into its linha digitável (47 digits).
 */
export function barcodeToLinhaDigitavel(barcode: string): string {
  const code = onlyDigits(barcode);
  if (code.length !== 44) throw new TypeError(`a barcode must have 44 digits, got ${code.length}`);

  if (code.startsWith("8")) {
    // Arrecadação: four blocks of eleven digits, each with its own check digit.
    const useMod10 = code[2] === "6" || code[2] === "7";
    let out = "";
    for (let i = 0; i < 4; i++) {
      const block = code.slice(i * 11, i * 11 + 11);
      out += block + (useMod10 ? mod10(block) : mod11Arrecadacao(block));
    }
    return out;
  }

  const banco = code.slice(0, 3);
  const moeda = code.slice(3, 4);
  const dvGeral = code.slice(4, 5);
  const fatorValor = code.slice(5, 19);
  const campoLivre = code.slice(19, 44);

  const campo1 = banco + moeda + campoLivre.slice(0, 5);
  const campo2 = campoLivre.slice(5, 15);
  const campo3 = campoLivre.slice(15, 25);

  return campo1 + mod10(campo1) + campo2 + mod10(campo2) + campo3 + mod10(campo3) + dvGeral + fatorValor;
}

/**
 * Converts a linha digitável (47 or 48 digits) back into its 44-digit barcode.
 */
export function linhaDigitavelToBarcode(linha: string): string {
  const digits = onlyDigits(linha);

  if (digits.length === 48) {
    // Arrecadação: drop the check digit at the end of each twelve-digit block.
    let out = "";
    for (let i = 0; i < 4; i++) out += digits.slice(i * 12, i * 12 + 11);
    return out;
  }

  if (digits.length !== 47) {
    throw new TypeError(`a linha digitável must have 47 or 48 digits, got ${digits.length}`);
  }

  const banco = digits.slice(0, 3);
  const moeda = digits.slice(3, 4);
  const campoLivre = digits.slice(4, 9) + digits.slice(10, 20) + digits.slice(21, 31);
  const dvGeral = digits.slice(32, 33);
  const fatorValor = digits.slice(33, 47);

  return banco + moeda + dvGeral + fatorValor + campoLivre;
}

/**
 * Reads a boleto in either representation and checks every digit.
 *
 * @example
 * ```ts
 * const boleto = parseBoleto("00190500954014481606906809350314337370000000100");
 * if (!boleto.valid) throw new Error(boleto.error);
 * console.log(boleto.valor, boleto.vencimento);
 * ```
 *
 * @param input A barcode (44 digits) or linha digitável (47 or 48 digits).
 * @param reference Disambiguates the wrapped due-date counter. Defaults to now.
 */
export function parseBoleto(input: string, reference?: Date): BoletoInfo {
  const digits = onlyDigits(input);

  let codigoBarras: string;
  try {
    codigoBarras = digits.length === 44 ? digits : linhaDigitavelToBarcode(digits);
  } catch (err) {
    return {
      tipo: digits.startsWith("8") ? "ARRECADACAO" : "COBRANCA",
      codigoBarras: digits,
      linhaDigitavel: digits,
      valid: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  const tipo: BoletoTipo = codigoBarras.startsWith("8") ? "ARRECADACAO" : "COBRANCA";
  const linhaDigitavel = digits.length === 44 ? barcodeToLinhaDigitavel(codigoBarras) : digits;

  if (tipo === "ARRECADACAO") {
    const useMod10 = codigoBarras[2] === "6" || codigoBarras[2] === "7";
    const body = codigoBarras.slice(0, 3) + codigoBarras.slice(4);
    const expected = useMod10 ? mod10(body) : mod11Arrecadacao(body);
    const valid = expected === Number(codigoBarras[3]);
    const valorRaw = Number(codigoBarras.slice(4, 15));
    return {
      tipo,
      codigoBarras,
      linhaDigitavel,
      valid,
      valor: valorRaw / 100,
      error: valid ? undefined : "the barcode's check digit does not match its contents",
    };
  }

  const dvGeral = Number(codigoBarras[4]);
  const body = codigoBarras.slice(0, 4) + codigoBarras.slice(5);
  const expected = mod11Barcode(body);
  const valid = expected === dvGeral;
  const valorRaw = Number(codigoBarras.slice(9, 19));

  return {
    tipo,
    codigoBarras,
    linhaDigitavel,
    valid,
    banco: codigoBarras.slice(0, 3),
    moeda: codigoBarras.slice(3, 4),
    campoLivre: codigoBarras.slice(19, 44),
    valor: valorRaw / 100,
    vencimento: fatorToDate(codigoBarras.slice(5, 9), reference),
    error: valid ? undefined : `check digit ${dvGeral} does not match the computed ${expected}`,
  };
}

/** `true` when every check digit in the document matches. */
export function isValidBoleto(input: string): boolean {
  return parseBoleto(input).valid;
}

/** Formats a linha digitável with the separators printed on a boleto. */
export function formatLinhaDigitavel(linha: string): string {
  const d = onlyDigits(linha);
  if (d.length === 47) {
    return `${d.slice(0, 5)}.${d.slice(5, 10)} ${d.slice(10, 15)}.${d.slice(15, 21)} ${d.slice(21, 26)}.${d.slice(26, 32)} ${d.slice(32, 33)} ${d.slice(33)}`;
  }
  if (d.length === 48) {
    return `${d.slice(0, 12)} ${d.slice(12, 24)} ${d.slice(24, 36)} ${d.slice(36, 48)}`;
  }
  return linha;
}
