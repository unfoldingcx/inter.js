/**
 * BR Code — the EMV® QR payload behind every Pix QR code.
 *
 * A BR Code is a flat TLV string: two-digit id, two-digit length, then the
 * value, with templates nesting the same structure. The last field is always a
 * CRC-16 over everything that precedes it.
 *
 * These helpers let you read what a customer pasted, and build a static code
 * without calling the API — handy for printed material and for tests.
 *
 * @see https://www.bcb.gov.br/estabilidadefinanceira/pix (Manual de Padrões)
 */

/** One decoded field. Templates carry their parsed children. */
export interface BrCodeField {
  /** Two-digit field id, e.g. `"26"`. */
  id: string;
  /** Raw value as it appears in the payload. */
  value: string;
  /** Parsed children, for template fields such as `26` and `62`. */
  children?: BrCodeField[];
}

/** Everything {@link parseBrCode} could work out about a payload. */
export interface BrCode {
  /** Every top-level field, in order. */
  fields: BrCodeField[];
  /** `true` when the trailing CRC matches the payload. */
  valid: boolean;
  /** The CRC found in the payload. */
  crc?: string;
  /** The CRC computed over the payload. */
  expectedCrc?: string;
  /** `true` for a one-shot code tied to a specific charge (field `01` = `12`). */
  dynamic: boolean;
  /** The Pix key, for a static code. */
  chave?: string;
  /** The URL the code resolves to, for a dynamic code. */
  url?: string;
  /** Free-text note attached to the key. */
  infoAdicional?: string;
  /** Amount as it appears in the payload, e.g. `"2.00"`. */
  valor?: string;
  /** Currency code. `986` is BRL. */
  moeda?: string;
  /** Country code, normally `BR`. */
  pais?: string;
  /** Receiver's name. */
  nomeRecebedor?: string;
  /** Receiver's city. */
  cidadeRecebedor?: string;
  /** Reference label, which for Pix is the `txid`. */
  txid?: string;
}

/** Well-known BR Code field ids. */
export const BR_CODE_IDS = {
  payloadFormatIndicator: "00",
  pointOfInitiationMethod: "01",
  merchantAccountInformation: "26",
  merchantCategoryCode: "52",
  transactionCurrency: "53",
  transactionAmount: "54",
  countryCode: "58",
  merchantName: "59",
  merchantCity: "60",
  postalCode: "61",
  additionalDataFieldTemplate: "62",
  crc: "63",
} as const;

/** The GUI that marks a merchant-account template as Pix. */
export const PIX_GUI = "br.gov.bcb.pix";

/**
 * CRC-16/CCITT-FALSE: polynomial `0x1021`, initial value `0xFFFF`, no
 * reflection and no final XOR. This is the variant the Pix manual specifies.
 *
 * @returns Four upper-case hex digits.
 */
export function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Ids whose values are themselves TLV sequences. */
const TEMPLATE_IDS = new Set([
  "26", "27", "28", "29", "30", "31", "32", "33", "34", "35",
  "36", "37", "38", "39", "40", "41", "42", "43", "44", "45",
  "46", "47", "48", "49", "50", "51", "62", "64", "80", "81", "82",
]);

/** Splits a TLV string into fields, recursing into templates. */
function readFields(payload: string, depth = 0): BrCodeField[] {
  const fields: BrCodeField[] = [];
  let cursor = 0;
  while (cursor + 4 <= payload.length) {
    const id = payload.slice(cursor, cursor + 2);
    const length = Number(payload.slice(cursor + 2, cursor + 4));
    if (!/^\d{2}$/.test(id) || !Number.isInteger(length)) break;
    const value = payload.slice(cursor + 4, cursor + 4 + length);
    if (value.length < length) break;
    const field: BrCodeField = { id, value };
    if (depth < 3 && TEMPLATE_IDS.has(id)) {
      const children = readFields(value, depth + 1);
      if (children.length) field.children = children;
    }
    fields.push(field);
    cursor += 4 + length;
  }
  return fields;
}

const findField = (fields: BrCodeField[] | undefined, id: string): BrCodeField | undefined =>
  fields?.find((f) => f.id === id);

/**
 * Decodes a BR Code and checks its CRC.
 *
 * @example
 * ```ts
 * const code = parseBrCode(cob.pixCopiaECola);
 * if (!code.valid) throw new Error("QR code is corrupt");
 * console.log(code.dynamic ? code.url : code.chave, code.valor);
 * ```
 */
export function parseBrCode(payload: string): BrCode {
  const text = payload.trim();
  const fields = readFields(text);

  const crcField = findField(fields, BR_CODE_IDS.crc);
  const crcIndex = text.lastIndexOf("6304");
  const expectedCrc = crcIndex === -1 ? undefined : crc16(text.slice(0, crcIndex + 4));
  const crc = crcField?.value?.toUpperCase();

  const merchant = findField(fields, BR_CODE_IDS.merchantAccountInformation);
  const additional = findField(fields, BR_CODE_IDS.additionalDataFieldTemplate);

  const chave = findField(merchant?.children, "01")?.value;
  const url = findField(merchant?.children, "25")?.value;

  return {
    fields,
    valid: Boolean(crc && expectedCrc && crc === expectedCrc),
    crc,
    expectedCrc,
    dynamic: findField(fields, BR_CODE_IDS.pointOfInitiationMethod)?.value === "12",
    chave,
    url,
    infoAdicional: findField(merchant?.children, "02")?.value,
    valor: findField(fields, BR_CODE_IDS.transactionAmount)?.value,
    moeda: findField(fields, BR_CODE_IDS.transactionCurrency)?.value,
    pais: findField(fields, BR_CODE_IDS.countryCode)?.value,
    nomeRecebedor: findField(fields, BR_CODE_IDS.merchantName)?.value,
    cidadeRecebedor: findField(fields, BR_CODE_IDS.merchantCity)?.value,
    txid: findField(additional?.children, "05")?.value,
  };
}

/** `true` when the payload's trailing CRC matches its contents. */
export function isValidBrCode(payload: string): boolean {
  return parseBrCode(payload).valid;
}

/** Fields accepted by {@link buildBrCode}. */
export interface BuildBrCodeOptions {
  /** The Pix key money should go to. */
  chave: string;
  /** Receiver's name, up to 25 characters. */
  nome: string;
  /** Receiver's city, up to 15 characters. */
  cidade: string;
  /** Amount as `"0.00"`. Omit to let the payer choose. */
  valor?: string | number;
  /** Reference label. Use `"***"` for a static code with no reference. @default "***" */
  txid?: string;
  /** Free-text note shown to the payer. */
  infoAdicional?: string;
  /** Receiver's postal code. */
  cep?: string;
  /** Merchant category code. @default "0000" */
  mcc?: string;
}

function tlv(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

/**
 * Builds a **static** BR Code — one that can be paid any number of times.
 *
 * Dynamic codes must come from the API, because they reference a charge that
 * only Inter can create. Use `inter.pix.cob.create()` for those and read
 * `pixCopiaECola` off the response.
 *
 * @example
 * ```ts
 * const payload = buildBrCode({
 *   chave: "pix@empresa.com.br",
 *   nome: "EMPRESA EXEMPLO",
 *   cidade: "BELO HORIZONTE",
 *   valor: "50.00",
 * });
 * ```
 */
export function buildBrCode(options: BuildBrCodeOptions): string {
  const merchant =
    tlv("00", PIX_GUI) + tlv("01", options.chave) + (options.infoAdicional ? tlv("02", options.infoAdicional) : "");

  const amount =
    options.valor === undefined
      ? ""
      : tlv("54", typeof options.valor === "number" ? options.valor.toFixed(2) : options.valor);

  const payload =
    tlv("00", "01") +
    tlv("26", merchant) +
    tlv("52", options.mcc ?? "0000") +
    tlv("53", "986") +
    amount +
    tlv("58", "BR") +
    tlv("59", sanitize(options.nome, 25)) +
    tlv("60", sanitize(options.cidade, 15)) +
    (options.cep ? tlv("61", options.cep.replace(/\D+/g, "")) : "") +
    tlv("62", tlv("05", options.txid ?? "***"));

  const withCrcTag = `${payload}6304`;
  return withCrcTag + crc16(withCrcTag);
}

/** Upper-cases, strips accents and truncates, matching the Pix manual's rules. */
function sanitize(value: string, maxLength: number): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 .,'-]/g, "")
    .trim()
    .slice(0, maxLength);
}
