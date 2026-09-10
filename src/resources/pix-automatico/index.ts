/**
 * API Pix Automático — `/pix/v2`.
 *
 * Recurring Pix: the payer authorises a mandate once, and the receiver can then
 * collect on a schedule without the payer acting again. Introduced by the Banco
 * Central and available only to CNPJs with at least six months of activity.
 *
 * Three objects, in the order you use them:
 *
 * | Object | What it is |
 * | --- | --- |
 * | `rec` | the recurrence: the mandate the payer authorises |
 * | `solicrec` | a request asking the payer to confirm a recurrence |
 * | `cobr` | one recurring charge collected under an approved `rec` |
 *
 * ```ts
 * const rec = await inter.pixAutomatico.rec.create({ ... });
 * // Payer approves in their bank app; rec.status becomes "APROVADA".
 * const cobr = await inter.pixAutomatico.cobr.create({ idRec: rec.idRec, ... });
 * ```
 *
 * @see https://developers.inter.co/references/pix-automatico
 */

import { Resource } from "../../core/resource.ts";
import type { ResourceTransport } from "../../core/resource.ts";
import { PixAutomaticoRecResource } from "./rec.ts";
import { PixAutomaticoSolicRecResource } from "./solicrec.ts";
import { PixAutomaticoCobrResource } from "./cobr.ts";
import { PixAutomaticoLocRecResource } from "./locrec.ts";
import { PixAutomaticoWebhookResource } from "./webhook.ts";

export { PixAutomaticoRecResource } from "./rec.ts";
export { PixAutomaticoSolicRecResource } from "./solicrec.ts";
export { PixAutomaticoCobrResource } from "./cobr.ts";
export { PixAutomaticoLocRecResource } from "./locrec.ts";
export { PixAutomaticoWebhookResource } from "./webhook.ts";
export type { RecListQuery } from "./rec.ts";
export type { CobrListQuery } from "./cobr.ts";
export type { LocRecListQuery } from "./locrec.ts";

/** `/pix/v2` — recurrences, recurring charges and their webhooks. */
export class PixAutomaticoResource extends Resource {
  /** Recurrences (`rec`): the mandate a payer authorises. */
  readonly rec: PixAutomaticoRecResource;
  /** Confirmation requests (`solicrec`) sent to a payer. */
  readonly solicRec: PixAutomaticoSolicRecResource;
  /** Recurring charges (`cobr`) collected under an approved recurrence. */
  readonly cobr: PixAutomaticoCobrResource;
  /** Payload locations for recurrence QR codes (`locrec`). */
  readonly locRec: PixAutomaticoLocRecResource;
  /** Webhooks for recurrence and recurring-charge events. */
  readonly webhooks: PixAutomaticoWebhookResource;

  constructor(client: ResourceTransport) {
    super(client);
    this.rec = new PixAutomaticoRecResource(client);
    this.solicRec = new PixAutomaticoSolicRecResource(client);
    this.cobr = new PixAutomaticoCobrResource(client);
    this.locRec = new PixAutomaticoLocRecResource(client);
    this.webhooks = new PixAutomaticoWebhookResource(client);
  }
}
