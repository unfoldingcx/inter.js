/**
 * Pix Automático webhooks.
 *
 * Two separate registrations, one per object:
 *
 * | Webhook | Fires when |
 * | --- | --- |
 * | `rec` | a recurrence is approved, rejected, cancelled or expires |
 * | `cobr` | a recurring charge settles, fails or is cancelled |
 *
 * Unlike the Pix webhook, these are registered per integration rather than per
 * Pix key, so there is no key in the path.
 *
 * @see https://developers.inter.co/references/pix-automatico#tag/Webhook
 */

import { PIX_AUTOMATICO_ENDPOINTS } from "../../generated/endpoints.ts";
import type {
  WebhookCobRCompleto,
  WebhookCobRSolicitado,
  WebhookRecCompleto,
  WebhookRecSolicitado,
} from "../../generated/pix-automatico.ts";
import { INTER_BASE_PATHS } from "../../config.ts";
import { Resource, requestOverrides } from "../../core/resource.ts";
import type { RequestOptions } from "../../core/resource.ts";

const API = "pixAutomatico";
const BASE = INTER_BASE_PATHS.pixAutomatico;

/** `/pix/v2/webhookrec` and `/pix/v2/webhookcobr`. */
export class PixAutomaticoWebhookResource extends Resource {
  /** Registers or replaces the callback URL for recurrence events. */
  async setRec(url: string, options?: RequestOptions): Promise<void> {
    await this.client.call<void>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.addWebhookrec,
      api: API,
      basePath: BASE,
      body: { webhookUrl: url } satisfies WebhookRecSolicitado,
      responseType: "none",
      ...requestOverrides(options),
    });
  }

  /** Returns the recurrence webhook. */
  async getRec(options?: RequestOptions): Promise<WebhookRecCompleto | undefined> {
    return await this.client.call<WebhookRecCompleto | undefined>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.findWebhookrec,
      api: API,
      basePath: BASE,
      ...requestOverrides(options),
    });
  }

  /** Removes the recurrence webhook. */
  async deleteRec(options?: RequestOptions): Promise<void> {
    await this.client.call<void>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.deleteWebhookrec,
      api: API,
      basePath: BASE,
      responseType: "none",
      ...requestOverrides(options),
    });
  }

  /** Registers or replaces the callback URL for recurring-charge events. */
  async setCobr(url: string, options?: RequestOptions): Promise<void> {
    await this.client.call<void>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.addWebhookCobr,
      api: API,
      basePath: BASE,
      body: { webhookUrl: url } satisfies WebhookCobRSolicitado,
      responseType: "none",
      ...requestOverrides(options),
    });
  }

  /** Returns the recurring-charge webhook. */
  async getCobr(options?: RequestOptions): Promise<WebhookCobRCompleto | undefined> {
    return await this.client.call<WebhookCobRCompleto | undefined>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.findWebhookCobr,
      api: API,
      basePath: BASE,
      ...requestOverrides(options),
    });
  }

  /** Removes the recurring-charge webhook. */
  async deleteCobr(options?: RequestOptions): Promise<void> {
    await this.client.call<void>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.deleteWebhookCobr,
      api: API,
      basePath: BASE,
      responseType: "none",
      ...requestOverrides(options),
    });
  }
}
