/**
 * Batches of due-date Pix charges — `lotecobv`.
 *
 * A batch creates or revises many `cobv` charges in one call. Processing is
 * asynchronous: the API answers `202` and each charge lands in `EM_PROCESSAMENTO`,
 * then `CRIADA` or `NEGADA`. {@link PixLoteCobvResource.listBySituation} filters
 * by that outcome, which is how you find the ones that failed.
 *
 * @see https://developers.inter.co/references/pix#tag/LoteCobV
 */

import { PIX_ENDPOINTS } from "../../generated/endpoints.ts";
import type {
  LoteCobVConsultado,
  LoteCobVRevisada,
  LoteCobVSolicitado,
  LotecobvGetQuery,
  LotesCobVConsultados,
  SituacaoCobranca,
  SummaryLoteCobV,
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

/** Filters for {@link PixLoteCobvResource.list}. */
export interface PixLoteCobvListQuery extends Omit<LotecobvGetQuery, "inicio" | "fim"> {
  inicio: DateInput;
  fim: DateInput;
}

/** `/pix/v2/lotecobv` — batches of due-date charges. */
export class PixLoteCobvResource extends Resource {
  /**
   * Creates or replaces a batch.
   *
   * Replaying the same `id` replaces the batch rather than adding a second one,
   * so the call is idempotent as long as you keep the identifier stable.
   */
  async create(id: string | number, body: LoteCobVSolicitado, options?: RequestOptions): Promise<void> {
    await this.client.call<void>({
      endpoint: PIX_ENDPOINTS.lotecobvIdPut,
      api: API,
      basePath: BASE,
      pathParams: { id },
      body,
      responseType: "none",
      ...requestOverrides(options),
    });
  }

  /** Revises specific charges inside an existing batch. */
  async update(id: string | number, body: LoteCobVRevisada, options?: RequestOptions): Promise<void> {
    await this.client.call<void>({
      endpoint: PIX_ENDPOINTS.lotecobvIdPatch,
      api: API,
      basePath: BASE,
      pathParams: { id },
      body,
      responseType: "none",
      ...requestOverrides(options),
    });
  }

  /** Retrieves a batch and every charge in it. */
  async get(id: string | number, options?: RequestOptions): Promise<LoteCobVConsultado> {
    return await this.client.call<LoteCobVConsultado>({
      endpoint: PIX_ENDPOINTS.lotecobvIdGet,
      api: API,
      basePath: BASE,
      pathParams: { id },
      ...requestOverrides(options),
    });
  }

  /** Counts and totals the charges in a batch by status. */
  async summary(id: string | number, options?: RequestOptions): Promise<SummaryLoteCobV> {
    return await this.client.call<SummaryLoteCobV>({
      endpoint: PIX_ENDPOINTS.lotecobvIdSumarioGet,
      api: API,
      basePath: BASE,
      pathParams: { id },
      ...requestOverrides(options),
    });
  }

  /**
   * Returns only the charges in a batch that reached a given status.
   *
   * @param situacao `EM_PROCESSAMENTO`, `CRIADA` or `NEGADA`.
   */
  async listBySituation(
    id: string | number,
    situacao: SituacaoCobranca,
    options?: RequestOptions,
  ): Promise<LoteCobVConsultado> {
    return await this.client.call<LoteCobVConsultado>({
      endpoint: PIX_ENDPOINTS.lotecobvIdSituacaoSituacaoGet,
      api: API,
      basePath: BASE,
      pathParams: { id, situacao },
      ...requestOverrides(options),
    });
  }

  /** Searches batches created in a window. */
  async list(query: PixLoteCobvListQuery, options?: RequestOptions): Promise<LotesCobVConsultados> {
    return await this.client.call<LotesCobVConsultados>({
      endpoint: PIX_ENDPOINTS.lotecobvGet,
      api: API,
      basePath: BASE,
      query: { ...query, inicio: formatDateTime(query.inicio), fim: formatDateTime(query.fim) },
      ...requestOverrides(options),
    });
  }

  /** Iterates every batch in the window. */
  listPaginated(query: PixLoteCobvListQuery, options?: RequestOptions & PaginateOptions): Paginator<LoteCobVConsultado> {
    return new Paginator<LoteCobVConsultado>(async (page, signal) => {
      const body = await this.list(
        { ...query, "paginacao.paginaAtual": page },
        { ...options, signal: signal ?? options?.signal },
      );
      return pixPage(body, (body.lotes ?? []) as LoteCobVConsultado[], page);
    }, options);
  }
}
