/**
 * OAuth 2.0 scopes accepted by Banco Inter's authorization server.
 *
 * A token may only carry scopes that were granted to the integration in Internet
 * Banking (`Integrar > Nova integração`). Asking for a scope the integration does
 * not have makes the token request fail, so the client requests the narrowest set
 * that covers the calls you actually make.
 *
 * @see https://developers.inter.co/references/token
 */

/** Cobrança (Boleto com Pix) — issue, cancel, query and webhook management. */
export const COBRANCA_SCOPES = ["boleto-cobranca.read", "boleto-cobranca.write"] as const;

/** Banking — balance, statements, payments (barcode, DARF, batch), Pix payments. */
export const BANKING_SCOPES = [
  "extrato.read",
  "pagamento-boleto.read",
  "pagamento-boleto.write",
  "pagamento-darf.read",
  "pagamento-darf.write",
  "pagamento-lote.read",
  "pagamento-lote.write",
  "pagamento-pix.read",
  "pagamento-pix.write",
  "webhook-banking.read",
  "webhook-banking.write",
] as const;

/** Pix — immediate charges, due-date charges, batches, locations, refunds, webhooks. */
export const PIX_SCOPES = [
  "cob.read",
  "cob.write",
  "cobv.read",
  "cobv.write",
  "lotecobv.read",
  "lotecobv.write",
  "payloadlocation.read",
  "payloadlocation.write",
  "pix.read",
  "pix.write",
  "webhook.read",
  "webhook.write",
] as const;

/** Pix Automático — recurrences, recurrence requests, recurring charges, webhooks. */
export const PIX_AUTOMATICO_SCOPES = [
  "cobr.read",
  "cobr.write",
  "payloadlocationrec.read",
  "payloadlocationrec.write",
  "rec.read",
  "rec.write",
  "solicrec.read",
  "solicrec.write",
  "webhookcobr.read",
  "webhookcobr.write",
  "webhookrec.read",
  "webhookrec.write",
] as const;

/** Every scope this SDK knows about. */
export const INTER_SCOPES = [
  ...COBRANCA_SCOPES,
  ...BANKING_SCOPES,
  ...PIX_SCOPES,
  ...PIX_AUTOMATICO_SCOPES,
] as const;

/**
 * A scope string understood by the SDK.
 *
 * Unknown scopes are still accepted at runtime — Inter adds new ones over time —
 * but the known list gives editor completion for the common case.
 */
export type InterScope = (typeof INTER_SCOPES)[number] | (string & {});

/** `true` when `value` is a scope this SDK ships metadata for. */
export function isKnownScope(value: string): boolean {
  return (INTER_SCOPES as readonly string[]).includes(value);
}

/**
 * Normalises a scope list: trims, drops blanks and duplicates, and sorts so that
 * the same logical set always produces the same cache key.
 */
export function normalizeScopes(scopes: Iterable<string>): string[] {
  const set = new Set<string>();
  for (const raw of scopes) {
    for (const part of String(raw).split(/\s+/)) {
      const scope = part.trim();
      if (scope) set.add(scope);
    }
  }
  return [...set].sort();
}

/** Renders a scope list the way the token endpoint expects it: space separated. */
export function formatScopes(scopes: Iterable<string>): string {
  return normalizeScopes(scopes).join(" ");
}
