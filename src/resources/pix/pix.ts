/**
 * Received Pix and refunds.
 *
 * A received Pix is identified by its end-to-end id (`e2eId`), a 32-character
 * code assigned by the Banco Central that follows the transaction across every
 * institution involved. Refunds hang off that id, and each refund needs an
 * identifier of your own so the request is idempotent.
 *
 * @see https://developers.inter.co/references/pix#tag/Pix
 */

import { PIX_ENDPOINTS } from "../../generated/endpoints.ts";
import type { Devolucao, DevolucaoSolicitada, GetPixQuery, Pix, PixConsultados } from "../../generated/pix.ts";
import { INTER_BASE_PATHS } from "../../config.ts";
import { pixPage, Paginator } from "../../core/pagination.ts";
import type { PaginateOptions } from "../../core/pagination.ts";
import { Resource, requestOverrides } from "../../core/resource.ts";
import type { RequestOptions } from "../../core/resource.ts";
import { formatDateTime } from "../../utils/date.ts";
import type { DateInput } from "../../utils/date.ts";

const API = "pix";
const BASE = INTER_BASE_PATHS.pix;

/** Filters for {@link PixReceivedResource.list}. */
export interface PixListQuery extends Omit<GetPixQuery, "inicio" | "fim"> {
  inicio: DateInput;
  fim: DateInput;
}

/** `/pix/v2/pix` — Pix received into the account, and refunds. */
export class PixReceivedResource extends Resource {
  /**
   * Retrieves one received Pix by its end-to-end id.
   *
   * @param e2eId 32 characters, e.g. `E0000000020210101120000000000001`.
   */
  async get(e2eId: string, options?: RequestOptions): Promise<Pix> {
    return await this.client.call<Pix>({
      endpoint: PIX_ENDPOINTS.getPixByE2eId,
      api: API,
      basePath: BASE,
      pathParams: { e2eId },
      ...requestOverrides(options),
    });
  }

  /**
   * Searches received Pix in a window.
   *
   * `txIdPresente` narrows to Pix paid against one of your charges;
   * `devolucaoPresente` narrows to those with refunds attached.
   */
  async list(query: PixListQuery, options?: RequestOptions): Promise<PixConsultados> {
    return await this.client.call<PixConsultados>({
      endpoint: PIX_ENDPOINTS.getPix,
      api: API,
      basePath: BASE,
      query: { ...query, inicio: formatDateTime(query.inicio), fim: formatDateTime(query.fim) },
      ...requestOverrides(options),
    });
  }

  /**
   * Iterates every received Pix in the window.
   *
   * @example
   * ```ts
   * for await (const pix of inter.pix.received.listPaginated({
   *   inicio: "2026-01-01T00:00:00Z",
   *   fim: "2026-01-31T23:59:59Z",
   * })) {
   *   console.log(pix.endToEndId, pix.valor, pix.txid);
   * }
   * ```
   */
  listPaginated(query: PixListQuery, options?: RequestOptions & PaginateOptions): Paginator<Pix> {
    return new Paginator<Pix>(async (page, signal) => {
      const body = await this.list(
        { ...query, "paginacao.paginaAtual": page },
        { ...options, signal: signal ?? options?.signal },
      );
      return pixPage(body, (body.pix ?? []) as Pix[], page);
    }, options);
  }

  /**
   * Requests a full or partial refund of a received Pix.
   *
   * @param e2eId End-to-end id of the original Pix.
   * @param id Your identifier for this refund, 1–35 characters of `[a-zA-Z0-9]`.
   *   Reusing it returns the existing refund instead of creating another.
   * @param body At minimum `{ valor }`, formatted as `"0.00"`.
   *
   * @example
   * ```ts
   * await inter.pix.received.refund(e2eId, `REF${orderId}`, { valor: "7.89" });
   * ```
   */
  async refund(e2eId: string, id: string, body: DevolucaoSolicitada, options?: RequestOptions): Promise<Devolucao> {
    return await this.client.call<Devolucao>({
      endpoint: PIX_ENDPOINTS.putPixByE2eIdDevolucaoById,
      api: API,
      basePath: BASE,
      pathParams: { e2eId, id },
      body,
      ...requestOverrides(options),
    });
  }

  /** Retrieves a refund and its settlement status. */
  async getRefund(e2eId: string, id: string, options?: RequestOptions): Promise<Devolucao> {
    return await this.client.call<Devolucao>({
      endpoint: PIX_ENDPOINTS.getPixByE2eIdDevolucaoById,
      api: API,
      basePath: BASE,
      pathParams: { e2eId, id },
      ...requestOverrides(options),
    });
  }
}
