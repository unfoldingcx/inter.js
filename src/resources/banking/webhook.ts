/**
 * Banking webhooks.
 *
 * Two independent webhooks, one per event family:
 *
 * | Type | Fires when |
 * | --- | --- |
 * | `pix-pagamento` | an outbound Pix changes status |
 * | `boleto-pagamento` | a boleto payment settles or fails |
 *
 * @see https://developers.inter.co/references/banking#tag/Webhook
 */

import { BANKING_ENDPOINTS } from "../../generated/endpoints.ts";
import type {
  CallbackAttemptPage,
  CallbackAttemptPageItem,
  CallbacksFilterQuery,
  RetryCallbackResponse,
  RetryCallbacksRequestBody,
  TipoWebhookEnum,
  WebhookModel,
} from "../../generated/banking.ts";
import { INTER_BASE_PATHS } from "../../config.ts";
import { flatPage, Paginator } from "../../core/pagination.ts";
import type { PaginateOptions } from "../../core/pagination.ts";
import { Resource, requestOverrides } from "../../core/resource.ts";
import type { RequestOptions } from "../../core/resource.ts";
import { formatDateTime } from "../../utils/date.ts";
import type { DateInput } from "../../utils/date.ts";

const API = "banking";
const BASE = INTER_BASE_PATHS.banking;

/** Which family of banking events a webhook covers. */
export type BankingWebhookType = TipoWebhookEnum;

/** Window and filters for a banking callback history query. */
export interface BankingCallbackQuery extends Omit<CallbacksFilterQuery, "dataHoraInicio" | "dataHoraFim"> {
  dataHoraInicio: DateInput;
  dataHoraFim: DateInput;
}

/** `/banking/v2/webhooks/{tipoWebhook}` — registration and callback history. */
export class BankingWebhookResource extends Resource {
  /** Registers or replaces the webhook URL for one event family. */
  async set(tipoWebhook: BankingWebhookType, url: string, options?: RequestOptions): Promise<void> {
    await this.client.call<void>({
      endpoint: BANKING_ENDPOINTS.putWebhookBanking,
      api: API,
      basePath: BASE,
      pathParams: { tipoWebhook },
      body: { webhookUrl: url },
      responseType: "none",
      ...requestOverrides(options),
    });
  }

  /** Returns the webhook registered for one event family. */
  async get(tipoWebhook: BankingWebhookType, options?: RequestOptions): Promise<WebhookModel | undefined> {
    return await this.client.call<WebhookModel | undefined>({
      endpoint: BANKING_ENDPOINTS.getWebhookBanking,
      api: API,
      basePath: BASE,
      pathParams: { tipoWebhook },
      ...requestOverrides(options),
    });
  }

  /** Removes the webhook for one event family. */
  async delete(tipoWebhook: BankingWebhookType, options?: RequestOptions): Promise<void> {
    await this.client.call<void>({
      endpoint: BANKING_ENDPOINTS.deleteWebhookBanking,
      api: API,
      basePath: BASE,
      pathParams: { tipoWebhook },
      responseType: "none",
      ...requestOverrides(options),
    });
  }

  /** Lists callback delivery attempts for one event family. */
  async callbacks(
    tipoWebhook: BankingWebhookType,
    query: BankingCallbackQuery,
    options?: RequestOptions,
  ): Promise<CallbackAttemptPage> {
    return await this.client.call<CallbackAttemptPage>({
      endpoint: BANKING_ENDPOINTS.callbacksFilter,
      api: API,
      basePath: BASE,
      pathParams: { tipoWebhook },
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
    tipoWebhook: BankingWebhookType,
    query: BankingCallbackQuery,
    options?: RequestOptions & PaginateOptions,
  ): Paginator<CallbackAttemptPageItem> {
    return new Paginator<CallbackAttemptPageItem>(async (page, signal) => {
      const body = await this.callbacks(
        tipoWebhook,
        { ...query, pagina: page },
        { ...options, signal: signal ?? options?.signal },
      );
      return flatPage(body, body.data ?? [], page);
    }, options);
  }

  /** Asks Inter to deliver a set of callbacks again. */
  async retryCallbacks(
    tipoWebhook: BankingWebhookType,
    body: RetryCallbacksRequestBody,
    options?: RequestOptions,
  ): Promise<RetryCallbackResponse> {
    return await this.client.call<RetryCallbackResponse>({
      endpoint: BANKING_ENDPOINTS.retryCallback,
      api: API,
      basePath: BASE,
      pathParams: { tipoWebhook },
      body,
      ...requestOverrides(options),
    });
  }
}
