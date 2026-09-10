/**
 * Brazilian banking helpers that need no network access.
 *
 * Importable on their own — `import { isValidCPF } from "inter.js/utils"` — so a
 * form validator can use them without pulling in the client.
 */

export {
  formatCNPJ,
  formatCPF,
  formatCpfCnpj,
  isValidCNPJ,
  isValidCPF,
  isValidCpfCnpj,
  onlyAlphanumeric,
  onlyDigits,
  tipoPessoa,
} from "./documents.ts";
export type { TipoPessoa } from "./documents.ts";

export { isValidPixKey, normalizePixKey, parsePixKey } from "./pix-key.ts";
export type { PixKeyInfo, PixKeyType } from "./pix-key.ts";

export { BR_CODE_IDS, buildBrCode, crc16, isValidBrCode, parseBrCode, PIX_GUI } from "./brcode.ts";
export type { BrCode, BrCodeField, BuildBrCodeOptions } from "./brcode.ts";

export {
  barcodeToLinhaDigitavel,
  dateToFator,
  fatorToDate,
  formatLinhaDigitavel,
  isValidBoleto,
  linhaDigitavelToBarcode,
  mod10,
  mod11Arrecadacao,
  mod11Barcode,
  parseBoleto,
} from "./boleto.ts";
export type { BoletoInfo, BoletoTipo } from "./boleto.ts";

export { formatBRL, fromCents, parseAmount, sumAmounts, toCents, toPixAmount } from "./money.ts";
export type { AmountInput } from "./money.ts";

export { addDays, formatDate, formatDateOptional, formatDateTime, formatDateTimeOptional } from "./date.ts";
export type { DateInput } from "./date.ts";

export { decodeUtf8, encodeUtf8, fromBase64, toBase64 } from "./encoding.ts";
export { isUUID, randomUUID } from "./uuid.ts";
