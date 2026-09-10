/**
 * Typed webhook payloads.
 *
 * Inter posts a different body shape to each webhook, and the shapes are not
 * self-describing — nothing in the JSON says which API sent it. You know because
 * of the URL you registered, so the SDK asks you to name the source when parsing.
 */

import type { CallbackCobranca } from "../generated/cobranca.ts";
import type { CallbackPagamentoBoletoModel, CallbackPixPagamentoModel } from "../generated/banking.ts";
import type { PixCallback } from "../generated/pix.ts";
import type { CobRNotification, RecNotification } from "../generated/pix-automatico.ts";

/** Which webhook a callback came from. */
export type InterWebhookSource =
  /** `PUT /cobranca/v3/cobrancas/webhook` — a boleto changed status. */
  | "cobranca"
  /** `PUT /banking/v2/webhooks/pix-pagamento` — an outbound Pix changed status. */
  | "banking.pix-pagamento"
  /** `PUT /banking/v2/webhooks/boleto-pagamento` — a boleto payment settled or failed. */
  | "banking.boleto-pagamento"
  /** `PUT /pix/v2/webhook/{chave}` — Pix received. */
  | "pix"
  /** `PUT /pix/v2/webhookrec` — a recurrence changed status. */
  | "pix-automatico.rec"
  /** `PUT /pix/v2/webhookcobr` — a recurring charge changed status. */
  | "pix-automatico.cobr";

/** A boleto changed status. */
export type CobrancaWebhookEvent = CallbackCobranca;
/** An outbound Pix changed status. */
export type BankingPixPagamentoWebhookEvent = CallbackPixPagamentoModel;
/** A boleto payment settled or failed. */
export type BankingBoletoPagamentoWebhookEvent = CallbackPagamentoBoletoModel;
/** One received Pix. */
export type PixWebhookEvent = PixCallback;
/** A recurrence changed status. */
export type RecWebhookEvent = RecNotification;
/** A recurring charge changed status. */
export type CobRWebhookEvent = CobRNotification;

/** Maps a source to the event type it delivers. */
export interface InterWebhookEventMap {
  cobranca: CobrancaWebhookEvent;
  "banking.pix-pagamento": BankingPixPagamentoWebhookEvent;
  "banking.boleto-pagamento": BankingBoletoPagamentoWebhookEvent;
  pix: PixWebhookEvent;
  "pix-automatico.rec": RecWebhookEvent;
  "pix-automatico.cobr": CobRWebhookEvent;
}

/** The event type a given source delivers. */
export type InterWebhookEvent<S extends InterWebhookSource = InterWebhookSource> = InterWebhookEventMap[S];

/** A parsed callback from one specific webhook. */
export interface ParsedWebhookOf<S extends InterWebhookSource> {
  /** Which webhook this came from. */
  source: S;
  /**
   * The events in the callback.
   *
   * Inter batches Pix callbacks under a `pix` array and sends the other kinds
   * one at a time; this is always an array so you can treat both the same way.
   */
  events: InterWebhookEventMap[S][];
  /** The decoded body exactly as it arrived. */
  raw: unknown;
}

/**
 * A parsed callback from any webhook.
 *
 * Discriminated on `source`, so switching on it narrows `events` to the right
 * payload type:
 *
 * ```ts
 * function handle({ source, events }: ParsedWebhook) {
 *   switch (source) {
 *     case "cobranca":
 *       events[0]?.situacao;   // CallbackCobranca
 *       break;
 *     case "pix":
 *       events[0]?.endToEndId; // PixCallback
 *       break;
 *   }
 * }
 * ```
 */
export type ParsedWebhook = { [S in InterWebhookSource]: ParsedWebhookOf<S> }[InterWebhookSource];
