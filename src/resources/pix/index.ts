/**
 * API Pix — `/pix/v2`.
 *
 * The receiving side of Pix: charges you issue, money that arrives, refunds you
 * send back, and the webhooks that tell you about all of it. Sending money out
 * of the account lives at `inter.banking.pixPagamento` instead.
 *
 * ```ts
 * const cob = await inter.pix.cob.create({
 *   chave: "pix@empresa.com.br",
 *   valor: { original: "50.00" },
 *   calendario: { expiracao: 3600 },
 * });
 * // Render cob.pixCopiaECola as a QR code, or link to cob.loc.location.
 * ```
 *
 * @see https://developers.inter.co/references/pix
 */

import { Resource } from "../../core/resource.ts";
import type { ResourceTransport } from "../../core/resource.ts";
import { PixCobResource } from "./cob.ts";
import { PixCobvResource } from "./cobv.ts";
import { PixLocResource } from "./loc.ts";
import { PixLoteCobvResource } from "./lotecobv.ts";
import { PixReceivedResource } from "./pix.ts";
import { PixWebhookResource } from "./webhook.ts";

export { PixCobResource } from "./cob.ts";
export { PixCobvResource } from "./cobv.ts";
export { PixLocResource } from "./loc.ts";
export { PixLoteCobvResource } from "./lotecobv.ts";
export { PixReceivedResource } from "./pix.ts";
export { PixWebhookResource } from "./webhook.ts";
export type { PixCobListQuery } from "./cob.ts";
export type { PixCobvListQuery } from "./cobv.ts";
export type { PixLocListQuery } from "./loc.ts";
export type { PixLoteCobvListQuery } from "./lotecobv.ts";
export type { PixListQuery } from "./pix.ts";
export type { PixCallbackQuery } from "./webhook.ts";

/** `/pix/v2` — Pix charges, received payments, refunds and webhooks. */
export class PixResource extends Resource {
  /** Immediate charges (`cob`), which expire after a number of seconds. */
  readonly cob: PixCobResource;
  /** Charges with a due date (`cobv`), supporting fine, interest and discount. */
  readonly cobv: PixCobvResource;
  /** Batches of due-date charges (`lotecobv`). */
  readonly loteCobv: PixLoteCobvResource;
  /** Payload locations (`loc`) backing QR codes. */
  readonly loc: PixLocResource;
  /** Pix received into the account, and refunds. */
  readonly received: PixReceivedResource;
  /** Webhook registration and callback history, per Pix key. */
  readonly webhook: PixWebhookResource;

  constructor(client: ResourceTransport) {
    super(client);
    this.cob = new PixCobResource(client);
    this.cobv = new PixCobvResource(client);
    this.loteCobv = new PixLoteCobvResource(client);
    this.loc = new PixLocResource(client);
    this.received = new PixReceivedResource(client);
    this.webhook = new PixWebhookResource(client);
  }
}
