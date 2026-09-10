/**
 * Pix charges with a due date — `cobv`.
 *
 * Unlike an immediate charge, a `cobv` has a calendar due date and stays payable
 * for `validadeAposVencimento` days past it. It also supports fine, interest,
 * discount and rebate, which makes it the Pix equivalent of a boleto.
 *
 * A `cobv` always requires a `txid` you choose — there is no server-generated
 * variant.
 *
 * @see https://developers.inter.co/references/pix#tag/CobV
 */

import { PIX_ENDPOINTS } from "../../generated/endpoints.ts";
import type {
  CobVCompleta,
  CobVGerada,
  CobVRevisada,
  CobVSolicitada,
  CobsVConsultadas,
  GetCobvQuery,
  PagarCobrancaPix,
  PagarCobrancaPixResponse,
} from "../../generated/pix.ts";
import { INTER_BASE_PATHS } from "../../config.ts";
import { pixPage, Paginator } from "../../core/pagination.ts";
import type { PaginateOptions } from "../../core/pagination.ts";
import { Resource, requestOverrides } from "../../core/resource.ts";
import type { RequestOptions } from "../../core/resource.ts";
import { formatDateTime } from "../../utils/date.ts";
import type { DateInput } from "../../utils/date.ts";

const API = "pix";
const BASE = INTER_BASE_PATHS.pix;

/** Filters for {@link PixCobvResource.list}. */
export interface PixCobvListQuery extends Omit<GetCobvQuery, "inicio" | "fim"> {
  inicio: DateInput;
  fim: DateInput;
}

/** `/pix/v2/cobv` — Pix charges with a due date. */
export class PixCobvResource extends Resource {
  /**
   * Creates or replaces a due-date charge under a `txid` you choose.
   *
   * @example
   * ```ts
   * await inter.pix.cobv.create("PEDIDO2026000000000000001001", {
   *   chave: "pix@empresa.com.br",
   *   calendario: { dataDeVencimento: "2026-10-30", validadeAposVencimento: 30 },
   *   valor: { original: "137.00", multa: { modalidade: 2, valorPerc: "2.00" } },
   *   devedor: { cpf: "12345678909", nome: "Maria Souza" },
   * });
   * ```
   */
  async create(txid: string, body: CobVSolicitada, options?: RequestOptions): Promise<CobVGerada> {
    return await this.client.call<CobVGerada>({
      endpoint: PIX_ENDPOINTS.putCobvByTxid,
      api: API,
      basePath: BASE,
      pathParams: { txid },
      body,
      ...requestOverrides(options),
    });
  }

  /** Retrieves a due-date charge. */
  async get(txid: string, options?: RequestOptions & { revisao?: number }): Promise<CobVCompleta> {
    return await this.client.call<CobVCompleta>({
      endpoint: PIX_ENDPOINTS.getCobvByTxid,
      api: API,
      basePath: BASE,
      pathParams: { txid },
      query: { revisao: options?.revisao },
      ...requestOverrides(options),
    });
  }

  /** Revises a due-date charge. Each accepted revision increments `revisao`. */
  async update(txid: string, body: CobVRevisada, options?: RequestOptions): Promise<CobVGerada> {
    return await this.client.call<CobVGerada>({
      endpoint: PIX_ENDPOINTS.patchCobvByTxid,
      api: API,
      basePath: BASE,
      pathParams: { txid },
      body,
      ...requestOverrides(options),
    });
  }

  /** Cancels a due-date charge so it can no longer be paid. */
  async cancel(txid: string, options?: RequestOptions): Promise<CobVGerada> {
    return await this.update(txid, { status: "REMOVIDA_PELO_USUARIO_RECEBEDOR" }, options);
  }

  /** Searches due-date charges in a window. `loteCobVId` narrows to one batch. */
  async list(query: PixCobvListQuery, options?: RequestOptions): Promise<CobsVConsultadas> {
    return await this.client.call<CobsVConsultadas>({
      endpoint: PIX_ENDPOINTS.getCobv,
      api: API,
      basePath: BASE,
      query: { ...query, inicio: formatDateTime(query.inicio), fim: formatDateTime(query.fim) },
      ...requestOverrides(options),
    });
  }

  /** Iterates every due-date charge in the window. */
  listPaginated(query: PixCobvListQuery, options?: RequestOptions & PaginateOptions): Paginator<CobVCompleta> {
    return new Paginator<CobVCompleta>(async (page, signal) => {
      const body = await this.list(
        { ...query, "paginacao.paginaAtual": page },
        { ...options, signal: signal ?? options?.signal },
      );
      return pixPage(body, body.cobs ?? [], page);
    }, options);
  }

  /** Simulates a payer settling the charge. **Sandbox only.** */
  async simulatePayment(
    txid: string,
    body: PagarCobrancaPix,
    options?: RequestOptions,
  ): Promise<PagarCobrancaPixResponse> {
    return await this.client.call<PagarCobrancaPixResponse>({
      endpoint: PIX_ENDPOINTS.postCobvPagarByTxid,
      api: API,
      basePath: BASE,
      pathParams: { txid },
      body,
      ...requestOverrides(options),
    });
  }
}
