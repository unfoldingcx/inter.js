/**
 * Brazilian taxpayer identifiers: CPF and CNPJ.
 *
 * Inter's APIs always want them stripped to digits, and reject a value whose
 * check digits do not match. Validating locally turns a `400` round trip into an
 * immediate, specific error.
 *
 * CNPJ support covers both the classic numeric form and the alphanumeric form
 * introduced by Receita Federal, where the first twelve characters may be
 * letters or digits and only the two check digits stay numeric.
 */

/** What kind of taxpayer an identifier belongs to. */
export type TipoPessoa = "FISICA" | "JURIDICA";

/** Removes formatting, keeping digits only. */
export function onlyDigits(value: string): string {
  return value.replace(/\D+/g, "");
}

/** Removes formatting, keeping digits and upper-case letters (alphanumeric CNPJ). */
export function onlyAlphanumeric(value: string): string {
  return value.toUpperCase().replace(/[^0-9A-Z]+/g, "");
}

/**
 * Validates a CPF.
 *
 * Accepts formatted or bare input. Rejects the eleven all-same-digit strings,
 * which pass the arithmetic but are not issued.
 *
 * @example isValidCPF("529.982.247-25") // => true
 */
export function isValidCPF(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  for (const [length, weightStart] of [
    [9, 10],
    [10, 11],
  ] as const) {
    let sum = 0;
    for (let i = 0; i < length; i++) sum += Number(cpf[i]) * (weightStart - i);
    const remainder = (sum * 10) % 11;
    const digit = remainder === 10 || remainder === 11 ? 0 : remainder;
    if (digit !== Number(cpf[length])) return false;
  }
  return true;
}

const CNPJ_WEIGHTS_FIRST = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_WEIGHTS_SECOND = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

/**
 * Validates a CNPJ, numeric or alphanumeric.
 *
 * The alphanumeric variant keeps the same mod-11 arithmetic; each of the first
 * twelve characters contributes its ASCII code minus 48, so `"0"` is 0 and
 * `"A"` is 17.
 *
 * @example isValidCNPJ("11.222.333/0001-81") // => true
 */
export function isValidCNPJ(value: string): boolean {
  const cnpj = onlyAlphanumeric(value);
  if (cnpj.length !== 14) return false;
  if (!/^[0-9A-Z]{12}\d{2}$/.test(cnpj)) return false;
  if (/^(.)\1{13}$/.test(cnpj)) return false;

  const codes = [...cnpj.slice(0, 12)].map((c) => c.charCodeAt(0) - 48);

  const checkDigit = (values: number[], weights: number[]): number => {
    const sum = values.reduce((acc, v, i) => acc + v * weights[i]!, 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const first = checkDigit(codes, CNPJ_WEIGHTS_FIRST);
  if (first !== Number(cnpj[12])) return false;

  const second = checkDigit([...codes, first], CNPJ_WEIGHTS_SECOND);
  return second === Number(cnpj[13]);
}

/**
 * Validates a CPF or CNPJ, deciding which by length.
 *
 * @example isValidCpfCnpj("11222333000181") // => true
 */
export function isValidCpfCnpj(value: string): boolean {
  const cleaned = onlyAlphanumeric(value);
  if (cleaned.length === 11) return isValidCPF(cleaned);
  if (cleaned.length === 14) return isValidCNPJ(cleaned);
  return false;
}

/** Returns whether an identifier belongs to an individual or a company. */
export function tipoPessoa(value: string): TipoPessoa | undefined {
  const cleaned = onlyAlphanumeric(value);
  if (cleaned.length === 11) return "FISICA";
  if (cleaned.length === 14) return "JURIDICA";
  return undefined;
}

/** Formats a CPF as `000.000.000-00`. Returns the input unchanged if it is not 11 digits. */
export function formatCPF(value: string): string {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return value;
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

/** Formats a CNPJ as `00.000.000/0000-00`. Returns the input unchanged if it is not 14 characters. */
export function formatCNPJ(value: string): string {
  const cnpj = onlyAlphanumeric(value);
  if (cnpj.length !== 14) return value;
  return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`;
}

/** Formats a CPF or CNPJ, choosing the mask by length. */
export function formatCpfCnpj(value: string): string {
  const cleaned = onlyAlphanumeric(value);
  if (cleaned.length === 11) return formatCPF(cleaned);
  if (cleaned.length === 14) return formatCNPJ(cleaned);
  return value;
}
