/**
 * Pix webhooks.
 *
 * Registration is per Pix key: each key you receive on can point at its own
 * callback URL. Inter posts `{ pix: [...] }` batches to that URL whenever money
 * arrives.
 *
 * @see https://developers.inter.co/references/pix#tag/Webhook
 */

import { PIX_ENDPOINTS } from "../../generated/endpoints.ts";
import type {
  CallbackAttemptPage,
  CallbackAttemptPageItem,
  CallbacksFilterQuery,
  RetryCallbackResponse,
  RetryCallbacksRequestBody,
  WebhookCompleto,
} from "../../generated/pix.ts";
import { INTER_BASE_PATHS } from "../../config.ts";
import { flatPage, Paginator } from "../../core/pagination.ts";
import type { PaginateOptions } from "../../core/pagination.ts";
import { Resource, requestOverrides } from "../../core/resource.ts";
import type { RequestOptions } from "../../core/resource.ts";
import { formatDateTime } from "../../utils/date.ts";
import type { DateInput } from "../../utils/date.ts";

const API = "pix";
const BASE = INTER_BASE_PATHS.pix;

/** Window and filters for a Pix callback history query. */
export interface PixCallbackQuery extends Omit<CallbacksFilterQuery, "dataHoraInicio" | "dataHoraFim"> {
  dataHoraInicio: DateInput;
  dataHoraFim: DateInput;
}

/** `/pix/v2/webhook/{chave}` — registration and callback history. */
export class PixWebhookResource extends Resource {
  /**
   * Registers or replaces the callback URL for one Pix key.
   *
   * @param chave The Pix key that will receive payments.
   * @param url HTTPS endpoint that will receive the callbacks.
   */
  async set(chave: string, url: string, options?: RequestOptions): Promise<void> {
    await this.client.call<void>({
      endpoint: PIX_ENDPOINTS.webhookPut,
      api: API,
      basePath: BASE,
      pathParams: { chave },
      body: { webhookUrl: url },
      responseType: "none",
      ...requestOverrides(options),
    });
  }

  /** Returns the webhook registered for one Pix key. */
  async get(chave: string, options?: RequestOptions): Promise<WebhookCompleto | undefined> {
    return await this.client.call<WebhookCompleto | undefined>({
      endpoint: PIX_ENDPOINTS.webhookGet,
      api: API,
      basePath: BASE,
      pathParams: { chave },
      ...requestOverrides(options),
    });
  }

  /** Removes the webhook for one Pix key. */
  async delete(chave: string, options?: RequestOptions): Promise<void> {
    await this.client.call<void>({
      endpoint: PIX_ENDPOINTS.webhookDelete,
      api: API,
      basePath: BASE,
      pathParams: { chave },
      responseType: "none",
      ...requestOverrides(options),
    });
  }

  /** Lists callback delivery attempts, optionally narrowed to one `txid`. */
  async callbacks(query: PixCallbackQuery, options?: RequestOptions): Promise<CallbackAttemptPage> {
    return await this.client.call<CallbackAttemptPage>({
      endpoint: PIX_ENDPOINTS.callbacksFilter,
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

  /** Iterates every callback attempt in the window. */
  callbacksPaginated(
    query: PixCallbackQuery,
    options?: RequestOptions & PaginateOptions,
  ): Paginator<CallbackAttemptPageItem> {
    return new Paginator<CallbackAttemptPageItem>(async (page, signal) => {
      const body = await this.callbacks({ ...query, pagina: page }, { ...options, signal: signal ?? options?.signal });
      return flatPage(body, body.data ?? [], page);
    }, options);
  }

  /** Asks Inter to deliver a set of callbacks again. */
  async retryCallbacks(body: RetryCallbacksRequestBody, options?: RequestOptions): Promise<RetryCallbackResponse> {
    return await this.client.call<RetryCallbackResponse>({
      endpoint: PIX_ENDPOINTS.retryCallback,
      api: API,
      basePath: BASE,
      body,
      ...requestOverrides(options),
    });
  }
}
