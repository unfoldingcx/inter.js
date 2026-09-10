/**
 * Money.
 *
 * Inter is inconsistent about representation: the Pix APIs use decimal strings
 * matching `\d{1,10}\.\d{2}`, while Cobrança and Banking use JSON numbers. These
 * helpers convert between the two without letting binary floating point round a
 * centavo away.
 */

/** A monetary value in any of the forms the APIs accept. */
export type AmountInput = number | string;

/**
 * Converts an amount to the decimal string the Pix APIs require.
 *
 * @throws {TypeError} for values that are not finite, are negative, or exceed
 * the ten integer digits the Pix schema allows.
 *
 * @example toPixAmount(149.9)   // => "149.90"
 * @example toPixAmount("1234")  // => "1234.00"
 */
export function toPixAmount(value: AmountInput): string {
  const cents = toCents(value);
  const text = String(cents).padStart(3, "0");
  const reais = text.slice(0, -2);
  const centavos = text.slice(-2);
  if (reais.length > 10) throw new TypeError(`amount ${value} exceeds the ten integer digits Pix allows`);
  return `${reais}.${centavos}`;
}

/**
 * Converts an amount to an integer number of centavos.
 *
 * Strings are parsed digit by digit, so `"0.07"` is exactly 7 and never 6.
 *
 * @throws {TypeError} for values that are not finite or are negative.
 */
export function toCents(value: AmountInput): number {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError(`amount must be a finite number, got ${value}`);
    if (value < 0) throw new TypeError(`amount must not be negative, got ${value}`);
    // Rounding at the half-cent keeps 1.005 from becoming 1.00 on some inputs.
    return Math.round((value + Number.EPSILON) * 100);
  }

  const text = value.trim().replace(/\s|R\$/gi, "");
  const match = text.match(/^(-?)(\d+)(?:[.,](\d{1,2}))?$/);
  if (!match) throw new TypeError(`"${value}" is not a valid amount`);
  if (match[1]) throw new TypeError(`amount must not be negative, got ${value}`);

  const centavos = (match[3] ?? "").padEnd(2, "0");
  return Number(match[2]) * 100 + Number(centavos);
}

/** Converts an integer number of centavos back to reais. */
export function fromCents(cents: number): number {
  if (!Number.isInteger(cents)) throw new TypeError(`centavos must be an integer, got ${cents}`);
  return cents / 100;
}

/**
 * Parses any accepted amount into a number of reais.
 *
 * @example parseAmount("1.234,56") // => 1234.56
 */
export function parseAmount(value: AmountInput): number {
  if (typeof value === "number") return value;
  const text = value.trim().replace(/\s|R\$/gi, "");
  // Brazilian formatting uses `.` for thousands and `,` for decimals.
  const normalized = /,\d{1,2}$/.test(text) ? text.replace(/\./g, "").replace(",", ".") : text.replace(/,/g, "");
  return fromCents(toCents(normalized));
}

/**
 * Formats an amount as Brazilian currency.
 *
 * @example formatBRL(1234.5) // => "R$ 1.234,50"
 */
export function formatBRL(value: AmountInput): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseAmount(value));
}

/** Adds amounts in centavos, so no rounding error accumulates. */
export function sumAmounts(...values: AmountInput[]): number {
  return fromCents(values.reduce<number>((total, value) => total + toCents(value), 0));
}
