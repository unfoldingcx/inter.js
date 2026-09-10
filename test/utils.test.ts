import { describe, expect, test } from "bun:test";
import {
  barcodeToLinhaDigitavel,
  buildBrCode,
  crc16,
  dateToFator,
  fatorToDate,
  formatBRL,
  formatCpfCnpj,
  formatDate,
  formatDateTime,
  formatLinhaDigitavel,
  isValidBoleto,
  isValidBrCode,
  isValidCNPJ,
  isValidCPF,
  isValidPixKey,
  linhaDigitavelToBarcode,
  parseAmount,
  parseBoleto,
  parseBrCode,
  parsePixKey,
  sumAmounts,
  toCents,
  toPixAmount,
} from "../src/utils/index.ts";

describe("CPF", () => {
  test("accepts valid numbers, formatted or bare", () => {
    expect(isValidCPF("529.982.247-25")).toBe(true);
    expect(isValidCPF("52998224725")).toBe(true);
    expect(isValidCPF("12345678909")).toBe(true);
  });

  test("rejects bad check digits and repeated digits", () => {
    expect(isValidCPF("52998224724")).toBe(false);
    expect(isValidCPF("11111111111")).toBe(false);
    expect(isValidCPF("000.000.000-00")).toBe(false);
    expect(isValidCPF("123")).toBe(false);
  });
});

describe("CNPJ", () => {
  test("accepts valid numeric identifiers", () => {
    expect(isValidCNPJ("11.222.333/0001-81")).toBe(true);
    expect(isValidCNPJ("90403518000169")).toBe(true);
  });

  test("accepts the alphanumeric form", () => {
    // Receita Federal's published example for the alphanumeric CNPJ.
    expect(isValidCNPJ("12ABC34501DE35")).toBe(true);
    expect(isValidCNPJ("12ABC34501DE36")).toBe(false);
  });

  test("rejects bad check digits and repeated characters", () => {
    expect(isValidCNPJ("11222333000182")).toBe(false);
    expect(isValidCNPJ("11111111111111")).toBe(false);
  });

  test("formats by length", () => {
    expect(formatCpfCnpj("52998224725")).toBe("529.982.247-25");
    expect(formatCpfCnpj("11222333000181")).toBe("11.222.333/0001-81");
  });
});

describe("Pix keys", () => {
  test("classifies every key type", () => {
    expect(parsePixKey("114bc975-663f-4a28-9338-4d925c09a52c")?.type).toBe("EVP");
    expect(parsePixKey("pix@empresa.com.br")?.type).toBe("EMAIL");
    expect(parsePixKey("529.982.247-25")?.type).toBe("CPF");
    expect(parsePixKey("11222333000181")?.type).toBe("CNPJ");
    expect(parsePixKey("(31) 99999-9999")?.type).toBe("TELEFONE");
  });

  test("normalises phones to E.164", () => {
    expect(parsePixKey("(31) 99999-9999")?.value).toBe("+5531999999999");
    expect(parsePixKey("+55 31 99999-9999")?.value).toBe("+5531999999999");
  });

  test("flags malformed keys", () => {
    expect(isValidPixKey("not-an-email@")).toBe(false);
    expect(isValidPixKey("")).toBe(false);
  });
});

describe("BR Code", () => {
  const real =
    "00020101021226930014BR.GOV.BCB.PIX2571spi-qrcode-h.bancointer.com.br/pj-h/v2/86ab9a7694d74b938489d21394bbef1452040000530398654042.005802BR5901*6013BELO HORIZONT61083019013162070503***63047AAA";

  test("matches the CRC-16/CCITT-FALSE check value", () => {
    expect(crc16("123456789")).toBe("29B1");
  });

  test("validates a payload produced by Banco Inter", () => {
    const code = parseBrCode(real);
    expect(code.valid).toBe(true);
    expect(code.dynamic).toBe(true);
    expect(code.valor).toBe("2.00");
    expect(code.url).toContain("bancointer.com.br");
  });

  test("detects a corrupted payload", () => {
    expect(isValidBrCode(`${real.slice(0, -1)}0`)).toBe(false);
  });

  test("builds a static code that round-trips", () => {
    const payload = buildBrCode({
      chave: "pix@empresa.com.br",
      nome: "Empresa Exemplo Ltda",
      cidade: "São Paulo",
      valor: 50,
      txid: "PEDIDO1001",
    });
    const parsed = parseBrCode(payload);
    expect(parsed.valid).toBe(true);
    expect(parsed.chave).toBe("pix@empresa.com.br");
    expect(parsed.valor).toBe("50.00");
    expect(parsed.txid).toBe("PEDIDO1001");
    expect(parsed.cidadeRecebedor).toBe("SAO PAULO");
    expect(parsed.dynamic).toBe(false);
  });
});

describe("boleto", () => {
  // FEBRABAN's canonical worked example.
  const barcode = "00193373700000001000500940144816060680935031";
  const linha = "00190500954014481606906809350314337370000000100";

  test("converts a barcode to its linha digitável", () => {
    expect(barcodeToLinhaDigitavel(barcode)).toBe(linha);
  });

  test("converts back", () => {
    expect(linhaDigitavelToBarcode(linha)).toBe(barcode);
  });

  test("reads amount, bank and due date", () => {
    const info = parseBoleto(linha);
    expect(info.valid).toBe(true);
    expect(info.tipo).toBe("COBRANCA");
    expect(info.valor).toBe(1);
    expect(info.banco).toBe("001");
    // Factor 3737 is 2007-12-31; anchor the reference so the wrapped counter
    // resolves to the original cycle rather than a later repeat.
    expect(parseBoleto(linha, new Date("2008-01-01")).vencimento?.toISOString().slice(0, 10)).toBe("2007-12-31");
  });

  test("rejects a tampered check digit", () => {
    expect(isValidBoleto(`${barcode.slice(0, 4)}9${barcode.slice(5)}`)).toBe(false);
  });

  test("handles utility slips in both check-digit modes", () => {
    for (const [idValor, expectedValor] of [
      ["6", 1234.56],
      ["8", 1234.56],
    ] as const) {
      const body = `81${idValor}0000012345${"6".repeat(30)}`;
      const dv = idValor === "6" ? mod10Of(body) : mod11Of(body);
      const code = `${body.slice(0, 3)}${dv}${body.slice(3)}`;
      const info = parseBoleto(barcodeToLinhaDigitavel(code));
      expect(info.tipo).toBe("ARRECADACAO");
      expect(info.valid).toBe(true);
      expect(info.valor).toBe(expectedValor);
    }
  });

  test("formats a linha digitável the way it is printed", () => {
    expect(formatLinhaDigitavel(linha)).toBe("00190.50095 40144.816069 06809.350314 3 37370000000100");
  });

  test("round-trips the due-date factor across the 2025 counter restart", () => {
    for (const iso of ["2000-07-03", "2024-06-01", "2025-02-21", "2026-03-15", "2031-12-31"]) {
      const date = new Date(`${iso}T00:00:00Z`);
      const fator = dateToFator(date);
      expect(fator).toMatch(/^\d{4}$/);
      expect(Number(fator)).toBeGreaterThanOrEqual(1000);
      expect(fatorToDate(fator, date)?.toISOString().slice(0, 10)).toBe(iso);
    }
  });

  test("uses factor 1000 for 2000-07-03, the documented anchor", () => {
    expect(dateToFator(new Date("2000-07-03T00:00:00Z"))).toBe("1000");
    expect(fatorToDate("9999", new Date("2025-02-21T00:00:00Z"))?.toISOString().slice(0, 10)).toBe("2025-02-21");
  });
});

// Local helpers so the boleto test does not depend on export ordering.
function mod10Of(digits: string): number {
  let sum = 0;
  let weight = 2;
  for (let i = digits.length - 1; i >= 0; i--) {
    const product = Number(digits[i]) * weight;
    sum += product > 9 ? product - 9 : product;
    weight = weight === 2 ? 1 : 2;
  }
  return sum % 10 === 0 ? 0 : 10 - (sum % 10);
}

function mod11Of(digits: string): number {
  let sum = 0;
  let weight = 2;
  for (let i = digits.length - 1; i >= 0; i--) {
    sum += Number(digits[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  const digit = 11 - (sum % 11);
  return digit === 10 || digit === 11 ? 0 : digit;
}

describe("money", () => {
  test("formats amounts the way Pix requires", () => {
    expect(toPixAmount(149.9)).toBe("149.90");
    expect(toPixAmount("1234")).toBe("1234.00");
    expect(toPixAmount(0)).toBe("0.00");
    expect(toPixAmount(0.07)).toBe("0.07");
  });

  test("avoids binary floating point drift", () => {
    expect(toCents("0.07")).toBe(7);
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(sumAmounts(0.1, 0.2)).toBe(0.3);
  });

  test("parses Brazilian formatting", () => {
    expect(parseAmount("1.234,56")).toBe(1234.56);
    expect(parseAmount("R$ 99,90")).toBe(99.9);
  });

  test("rejects negative and non-finite amounts", () => {
    expect(() => toPixAmount(-1)).toThrow();
    expect(() => toPixAmount(Number.NaN)).toThrow();
    expect(() => toPixAmount("abc")).toThrow();
  });

  test("formats as Brazilian currency", () => {
    expect(formatBRL(1234.5).replace(/ /g, " ")).toBe("R$ 1.234,50");
  });
});

describe("dates", () => {
  test("formats to the two shapes Inter accepts", () => {
    expect(formatDate(new Date("2026-03-15T12:00:00Z"))).toBe("2026-03-15");
    expect(formatDate("2026-03-15")).toBe("2026-03-15");
    expect(formatDateTime("2026-03-15")).toBe("2026-03-15T00:00:00.000Z");
    expect(formatDateTime(new Date("2026-03-15T12:00:00Z"))).toBe("2026-03-15T12:00:00.000Z");
  });

  test("rejects unparseable input", () => {
    expect(() => formatDate("not a date")).toThrow();
  });
});
