/**
 * Recurrence payload locations — `locrec`.
 *
 * The `locrec` is to a recurrence what `loc` is to a charge: the URL a QR code
 * resolves to. Detaching the recurrence lets a printed code be reused.
 *
 * @see https://developers.inter.co/references/pix-automatico#tag/LocRec
 */

import { PIX_AUTOMATICO_ENDPOINTS } from "../../generated/endpoints.ts";
import type {
  FindAllLocrecQuery,
  PayloadLocationRecCompleta,
  PayloadLocationRecConsultadas,
  PayloadLocationRecGerada,
  PayloadLocationRecSolicitada,
} from "../../generated/pix-automatico.ts";
import { INTER_BASE_PATHS } from "../../config.ts";
import { pixPage, Paginator } from "../../core/pagination.ts";
import type { PaginateOptions } from "../../core/pagination.ts";
import { Resource, requestOverrides } from "../../core/resource.ts";
import type { RequestOptions } from "../../core/resource.ts";
import { formatDateTime } from "../../utils/date.ts";
import type { DateInput } from "../../utils/date.ts";

const API = "pixAutomatico";
const BASE = INTER_BASE_PATHS.pixAutomatico;

/** Filters for {@link PixAutomaticoLocRecResource.list}. */
export interface LocRecListQuery extends Omit<FindAllLocrecQuery, "inicio" | "fim"> {
  inicio: DateInput;
  fim: DateInput;
}

/** `/pix/v2/locrec` — payload locations for recurrence QR codes. */
export class PixAutomaticoLocRecResource extends Resource {
  /** Creates a recurrence location. */
  async create(body?: PayloadLocationRecSolicitada, options?: RequestOptions): Promise<PayloadLocationRecGerada> {
    return await this.client.call<PayloadLocationRecGerada>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.addLocrec,
      api: API,
      basePath: BASE,
      body,
      ...requestOverrides(options),
    });
  }

  /** Retrieves one recurrence location. */
  async get(id: string | number, options?: RequestOptions): Promise<PayloadLocationRecCompleta> {
    return await this.client.call<PayloadLocationRecCompleta>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.findLocrecById,
      api: API,
      basePath: BASE,
      pathParams: { id },
      ...requestOverrides(options),
    });
  }

  /** Searches recurrence locations in a window. */
  async list(query: LocRecListQuery, options?: RequestOptions): Promise<PayloadLocationRecConsultadas> {
    return await this.client.call<PayloadLocationRecConsultadas>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.findAllLocrec,
      api: API,
      basePath: BASE,
      query: { ...query, inicio: formatDateTime(query.inicio), fim: formatDateTime(query.fim) },
      ...requestOverrides(options),
    });
  }

  /** Iterates every recurrence location in the window. */
  listPaginated(
    query: LocRecListQuery,
    options?: RequestOptions & PaginateOptions,
  ): Paginator<PayloadLocationRecCompleta> {
    return new Paginator<PayloadLocationRecCompleta>(async (page, signal) => {
      const body = await this.list(
        { ...query, "paginacao.paginaAtual": page },
        { ...options, signal: signal ?? options?.signal },
      );
      return pixPage(body, body.loc ?? [], page);
    }, options);
  }

  /** Detaches the recurrence currently bound to a location. */
  async unlinkRec(id: string | number, options?: RequestOptions): Promise<PayloadLocationRecCompleta> {
    return await this.client.call<PayloadLocationRecCompleta>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.deleteLocrec,
      api: API,
      basePath: BASE,
      pathParams: { id },
      ...requestOverrides(options),
    });
  }
}
