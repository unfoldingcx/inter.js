/**
 * Recurring charges — `cobr`.
 *
 * One instalment collected under an approved recurrence. Each `cobr` names its
 * parent `idRec` and a settlement date; the payer's bank debits automatically on
 * that date. When a debit fails, {@link PixAutomaticoCobrResource.retry} asks for
 * another attempt on a later date.
 *
 * @see https://developers.inter.co/references/pix-automatico#tag/CobR
 */

import { PIX_AUTOMATICO_ENDPOINTS } from "../../generated/endpoints.ts";
import type {
  ChangeStatusCobr,
  CobRCompleta,
  CobRGerada,
  CobRRevisada,
  CobRSolicitada,
  CobrGetQuery,
  CobsRConsultadas,
  MakePaymentCobr,
  MakePaymentCobrResponse,
} from "../../generated/pix-automatico.ts";
import { INTER_BASE_PATHS } from "../../config.ts";
import { pixPage, Paginator } from "../../core/pagination.ts";
import type { PaginateOptions } from "../../core/pagination.ts";
import { Resource, requestOverrides } from "../../core/resource.ts";
import type { RequestOptions } from "../../core/resource.ts";
import { formatDate, formatDateTime } from "../../utils/date.ts";
import type { DateInput } from "../../utils/date.ts";

const API = "pixAutomatico";
const BASE = INTER_BASE_PATHS.pixAutomatico;

/** Filters for {@link PixAutomaticoCobrResource.list}. */
export interface CobrListQuery extends Omit<CobrGetQuery, "inicio" | "fim"> {
  inicio: DateInput;
  fim: DateInput;
}

/** `/pix/v2/cobr` — recurring charges. */
export class PixAutomaticoCobrResource extends Resource {
  /** Creates a recurring charge and lets Inter generate the `txid`. */
  async create(body: CobRSolicitada, options?: RequestOptions): Promise<CobRGerada> {
    return await this.client.call<CobRGerada>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.cobrPost,
      api: API,
      basePath: BASE,
      body,
      ...requestOverrides(options),
    });
  }

  /**
   * Creates a recurring charge under a `txid` you choose.
   *
   * Replaying the same identifier is safe, which makes this the right choice
   * when the charge maps to an invoice in your own system.
   */
  async createWithTxid(txid: string, body: CobRSolicitada, options?: RequestOptions): Promise<CobRGerada> {
    return await this.client.call<CobRGerada>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.cobrTxidPut,
      api: API,
      basePath: BASE,
      pathParams: { txid },
      body,
      ...requestOverrides(options),
    });
  }

  /** Retrieves a recurring charge, including its settlement attempts. */
  async get(txid: string, options?: RequestOptions): Promise<CobRCompleta> {
    return await this.client.call<CobRCompleta>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.cobrTxidGet,
      api: API,
      basePath: BASE,
      pathParams: { txid },
      ...requestOverrides(options),
    });
  }

  /** Revises a recurring charge. Set `status: "CANCELADA"` to cancel it. */
  async update(txid: string, body: CobRRevisada, options?: RequestOptions): Promise<CobRGerada> {
    return await this.client.call<CobRGerada>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.cobrTxidPatch,
      api: API,
      basePath: BASE,
      pathParams: { txid },
      body,
      ...requestOverrides(options),
    });
  }

  /** Cancels a recurring charge before it settles. */
  async cancel(txid: string, options?: RequestOptions): Promise<CobRGerada> {
    return await this.update(txid, { status: "CANCELADA" }, options);
  }

  /**
   * Schedules another settlement attempt for a charge whose debit failed.
   *
   * @param data New settlement date, `YYYY-MM-DD` or a `Date`.
   */
  async retry(txid: string, data: DateInput, options?: RequestOptions): Promise<CobRCompleta> {
    return await this.client.call<CobRCompleta>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.cobrTxidRetentativaDataPost,
      api: API,
      basePath: BASE,
      pathParams: { txid, data: formatDate(data) },
      ...requestOverrides(options),
    });
  }

  /** Searches recurring charges in a window. `idRec` narrows to one recurrence. */
  async list(query: CobrListQuery, options?: RequestOptions): Promise<CobsRConsultadas> {
    return await this.client.call<CobsRConsultadas>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.cobrGet,
      api: API,
      basePath: BASE,
      query: { ...query, inicio: formatDateTime(query.inicio), fim: formatDateTime(query.fim) },
      ...requestOverrides(options),
    });
  }

  /** Iterates every recurring charge in the window. */
  listPaginated(query: CobrListQuery, options?: RequestOptions & PaginateOptions): Paginator<CobRCompleta> {
    return new Paginator<CobRCompleta>(async (page, signal) => {
      const body = await this.list(
        { ...query, "paginacao.paginaAtual": page },
        { ...options, signal: signal ?? options?.signal },
      );
      return pixPage(body, body.cobsr ?? [], page);
    }, options);
  }

  /** Simulates settlement of a recurring charge. **Sandbox only.** */
  async simulatePayment(body: MakePaymentCobr, options?: RequestOptions): Promise<MakePaymentCobrResponse> {
    return await this.client.call<MakePaymentCobrResponse>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.makePaymentCobr,
      api: API,
      basePath: BASE,
      body,
      ...requestOverrides(options),
    });
  }

  /** Forces a recurring charge into a given status. **Sandbox only.** */
  async simulateStatusChange(txId: string, body: ChangeStatusCobr, options?: RequestOptions): Promise<void> {
    await this.client.call<void>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.changeStatusCobr,
      api: API,
      basePath: BASE,
      pathParams: { txId },
      body,
      responseType: "none",
      ...requestOverrides(options),
    });
  }
}
