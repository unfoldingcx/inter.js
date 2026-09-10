import { describe, expect, test } from "bun:test";
import {
  INTER_WEBHOOK_IP_RANGES,
  ipInCidr,
  isInterWebhookIp,
  parseWebhook,
  verifyWebhookRequest,
} from "../src/webhooks/index.ts";
import { InterWebhookError } from "../src/core/errors.ts";

describe("parseWebhook", () => {
  test("reads a Cobrança callback", () => {
    const body = {
      codigoSolicitacao: "a4c6f0ed-d5ee-4ef7-a6eb-6b4149477adf",
      seuNumero: "PED-1001",
      situacao: "RECEBIDO",
      dataHoraSituacao: "2026-03-15T10:00:00Z",
      valorTotalRecebido: "149.90",
    };
    const parsed = parseWebhook("cobranca", JSON.stringify(body));
    expect(parsed.source).toBe("cobranca");
    expect(parsed.events).toHaveLength(1);
    expect(parsed.events[0]!.situacao).toBe("RECEBIDO");
  });

  test("unwraps the Pix batch envelope", () => {
    const body = { pix: [{ endToEndId: "E1", valor: "10.00" }, { endToEndId: "E2", valor: "20.00" }] };
    const parsed = parseWebhook("pix", body);
    expect(parsed.events.map((e) => e.endToEndId)).toEqual(["E1", "E2"]);
  });

  test("accepts a single Pix object, which the URL validator sends", () => {
    expect(parseWebhook("pix", { endToEndId: "E1", valor: "1.00" }).events).toHaveLength(1);
  });

  test("reads banking callbacks for both event families", () => {
    expect(parseWebhook("banking.pix-pagamento", { codigoSolicitacao: "x", status: "PAGO" }).events).toHaveLength(1);
    expect(parseWebhook("banking.boleto-pagamento", { codigoTransacao: "y", status: "REALIZADO" }).events).toHaveLength(1);
  });

  test("reads Pix Automático callbacks", () => {
    expect(parseWebhook("pix-automatico.rec", { idRec: "RR1", status: "APROVADA" }).events[0]!.idRec).toBe("RR1");
    expect(parseWebhook("pix-automatico.cobr", { txid: "T1", idRec: "RR1", status: "CONCLUIDA" }).events).toHaveLength(1);
  });

  test("accepts bytes as well as text", () => {
    const bytes = new TextEncoder().encode(JSON.stringify({ endToEndId: "E9" }));
    expect(parseWebhook("pix", bytes).events[0]!.endToEndId).toBe("E9");
  });

  test("rejects malformed bodies with an actionable message", () => {
    expect(() => parseWebhook("pix", "{not json")).toThrow(InterWebhookError);
    expect(() => parseWebhook("pix", "[]")).toThrow(/no recognisable events/);
    expect(() => parseWebhook("cobranca", { unrelated: true })).toThrow(/no recognisable events/);
  });
});

describe("source addresses", () => {
  test("matches inside a published range", () => {
    expect(ipInCidr("136.226.48.7", "136.226.48.0/23")).toBe(true);
    expect(ipInCidr("136.226.49.255", "136.226.48.0/23")).toBe(true);
    expect(ipInCidr("136.226.50.1", "136.226.48.0/23")).toBe(false);
  });

  test("handles single-host entries and IPv4-mapped IPv6", () => {
    expect(ipInCidr("54.232.234.54", "54.232.234.54/32")).toBe(true);
    expect(isInterWebhookIp("::ffff:54.232.234.54")).toBe(true);
  });

  test("rejects addresses outside every range", () => {
    expect(isInterWebhookIp("8.8.8.8")).toBe(false);
    expect(isInterWebhookIp("not-an-ip")).toBe(false);
  });

  test("ships a non-empty published list", () => {
    expect(INTER_WEBHOOK_IP_RANGES.length).toBeGreaterThan(20);
  });
});

describe("verifyWebhookRequest", () => {
  test("accepts a TLS-authenticated caller", () => {
    expect(() => verifyWebhookRequest({ clientCertificateAuthorized: true })).not.toThrow();
  });

  test("rejects a caller without an authorised certificate", () => {
    expect(() => verifyWebhookRequest({ clientCertificateAuthorized: false })).toThrow(/client certificate/);
    expect(() => verifyWebhookRequest({})).toThrow(/client certificate/);
  });

  test("can be relaxed when a proxy terminates TLS", () => {
    expect(() => verifyWebhookRequest({}, { requireClientCertificate: false })).not.toThrow();
  });

  test("optionally enforces the published address list", () => {
    const input = { clientCertificateAuthorized: true, remoteAddress: "8.8.8.8" };
    expect(() => verifyWebhookRequest(input, { requireKnownIp: true })).toThrow(/published Inter range/);
    expect(() =>
      verifyWebhookRequest({ ...input, remoteAddress: "136.226.48.7" }, { requireKnownIp: true }),
    ).not.toThrow();
  });
});
