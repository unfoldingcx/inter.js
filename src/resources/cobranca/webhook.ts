/**
 * Cobrança webhook management.
 *
 * One webhook URL per integration (per current account, when the integration
 * covers several). Inter posts a callback whenever a boleto is paid, cancelled
 * or expires. The endpoint must be HTTPS with TLS 1.2 or newer and must validate
 * Inter's client certificate — see `verifyWebhookRequest` in `inter.js/webhooks`.
 *
 * @see https://developers.inter.co/references/cobranca-bolepix#tag/Webhook
 */

import { COBRANCA_ENDPOINTS } from "../../generated/endpoints.ts";
import type {
  CallbackAttemptPage,
  CallbackAttemptPageItem,
  CallbacksFilterQuery,
  RetryCallbackResponse,
  RetryCallbacksRequestBody,
  WebhookCompleto,
} from "../../generated/cobranca.ts";
import { INTER_BASE_PATHS } from "../../config.ts";
import { Resource, requestOverrides } from "../../core/resource.ts";
import type { RequestOptions } from "../../core/resource.ts";
import { flatPage, Paginator } from "../../core/pagination.ts";
import type { PaginateOptions } from "../../core/pagination.ts";
import { formatDateTime } from "../../utils/date.ts";
import type { DateInput } from "../../utils/date.ts";

const API = "cobranca";
const BASE = INTER_BASE_PATHS.cobranca;

/** Window and filters for a callback history query. */
export interface CobrancaCallbackQuery extends Omit<CallbacksFilterQuery, "dataHoraInicio" | "dataHoraFim"> {
  /** Start of the window. */
  dataHoraInicio: DateInput;
  /** End of the window. */
  dataHoraFim: DateInput;
}

/** `PUT|GET|DELETE /cobranca/v3/cobrancas/webhook` and the callback history. */
export class CobrancaWebhookResource extends Resource {
  /**
   * Registers or replaces the webhook URL.
   *
   * @param url HTTPS endpoint that will receive the callbacks.
   */
  async set(url: string, options?: RequestOptions): Promise<void> {
    await this.client.call<void>({
      endpoint: COBRANCA_ENDPOINTS.webhookPut,
      api: API,
      basePath: BASE,
      body: { webhookUrl: url },
      responseType: "none",
      ...requestOverrides(options),
    });
  }

  /** Returns the currently registered webhook, or `undefined` when none is set. */
  async get(options?: RequestOptions): Promise<WebhookCompleto | undefined> {
    return await this.client.call<WebhookCompleto | undefined>({
      endpoint: COBRANCA_ENDPOINTS.webhookGet,
      api: API,
      basePath: BASE,
      ...requestOverrides(options),
    });
  }

  /** Removes the registered webhook. Callbacks stop immediately. */
  async delete(options?: RequestOptions): Promise<void> {
    await this.client.call<void>({
      endpoint: COBRANCA_ENDPOINTS.webhookDelete,
      api: API,
      basePath: BASE,
      responseType: "none",
      ...requestOverrides(options),
    });
  }

  /**
   * Lists callback delivery attempts, so you can reconcile anything your
   * endpoint missed while it was down.
   */
  async callbacks(query: CobrancaCallbackQuery, options?: RequestOptions): Promise<CallbackAttemptPage> {
    return await this.client.call<CallbackAttemptPage>({
      endpoint: COBRANCA_ENDPOINTS.callbacksFilter,
      api: API,
      basePath: BASE,
      query: {
        ...query,
        dataHoraInicio: formatDateTime(query.dataHoraInicio),
        dataHoraFim: formatDateTime(query.dataHoraFim),
      },
      ...requestOverrides(options),
    });
  }

  /** Iterates every callback attempt in the window, one page at a time. */
  callbacksPaginated(
    query: CobrancaCallbackQuery,
    options?: RequestOptions & PaginateOptions,
  ): Paginator<CallbackAttemptPageItem> {
    return new Paginator<CallbackAttemptPageItem>(async (page, signal) => {
      const body = await this.callbacks({ ...query, pagina: page }, { ...options, signal: signal ?? options?.signal });
      return flatPage(body, body.data ?? [], page);
    }, options);
  }

  /**
   * Asks Inter to deliver a set of callbacks again.
   *
   * Use it after fixing an outage: pick the failed attempts out of
   * {@link callbacks} and replay them instead of reconciling by hand.
   */
  async retryCallbacks(body: RetryCallbacksRequestBody, options?: RequestOptions): Promise<RetryCallbackResponse> {
    return await this.client.call<RetryCallbackResponse>({
      endpoint: COBRANCA_ENDPOINTS.retryCallback,
      api: API,
      basePath: BASE,
      body,
      ...requestOverrides(options),
    });
  }
}
