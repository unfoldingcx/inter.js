/**
 * Payload locations — `loc`.
 *
 * A location is the URL a Pix QR code points at. Creating a charge creates one
 * implicitly, but you can also mint locations up front — useful for printing
 * static QR codes whose charge is decided later, and for detaching a charge from
 * a location so the same printed code can be reused.
 *
 * @see https://developers.inter.co/references/pix#tag/Payload-Location
 */

import { PIX_ENDPOINTS } from "../../generated/endpoints.ts";
import type {
  GetLocQuery,
  PayloadLocation,
  PayloadLocationCompleta,
  PayloadLocationConsultadas,
  PayloadLocationSolicitada,
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

/** Filters for {@link PixLocResource.list}. */
export interface PixLocListQuery extends Omit<GetLocQuery, "inicio" | "fim"> {
  inicio: DateInput;
  fim: DateInput;
}

/** `/pix/v2/loc` — payload locations backing Pix QR codes. */
export class PixLocResource extends Resource {
  /**
   * Creates a location.
   *
   * @param tipoCob `cob` for an immediate charge, `cobv` for one with a due date.
   */
  async create(body: PayloadLocationSolicitada, options?: RequestOptions): Promise<PayloadLocation> {
    return await this.client.call<PayloadLocation>({
      endpoint: PIX_ENDPOINTS.postLoc,
      api: API,
      basePath: BASE,
      body,
      ...requestOverrides(options),
    });
  }

  /** Retrieves one location. */
  async get(id: string | number, options?: RequestOptions): Promise<PayloadLocationCompleta> {
    return await this.client.call<PayloadLocationCompleta>({
      endpoint: PIX_ENDPOINTS.getLocById,
      api: API,
      basePath: BASE,
      pathParams: { id },
      ...requestOverrides(options),
    });
  }

  /** Searches locations created in a window. */
  async list(query: PixLocListQuery, options?: RequestOptions): Promise<PayloadLocationConsultadas> {
    return await this.client.call<PayloadLocationConsultadas>({
      endpoint: PIX_ENDPOINTS.getLoc,
      api: API,
      basePath: BASE,
      query: { ...query, inicio: formatDateTime(query.inicio), fim: formatDateTime(query.fim) },
      ...requestOverrides(options),
    });
  }

  /** Iterates every location in the window. */
  listPaginated(query: PixLocListQuery, options?: RequestOptions & PaginateOptions): Paginator<PayloadLocationCompleta> {
    return new Paginator<PayloadLocationCompleta>(async (page, signal) => {
      const body = await this.list(
        { ...query, "paginacao.paginaAtual": page },
        { ...options, signal: signal ?? options?.signal },
      );
      return pixPage(body, body.loc ?? [], page);
    }, options);
  }

  /**
   * Detaches the charge currently bound to a location.
   *
   * The location keeps working; the QR code simply stops resolving to that
   * charge, which is how a static printed code gets reused.
   */
  async unlinkTxid(id: string | number, options?: RequestOptions): Promise<PayloadLocation> {
    return await this.client.call<PayloadLocation>({
      endpoint: PIX_ENDPOINTS.deleteLocByIdTxid,
      api: API,
      basePath: BASE,
      pathParams: { id },
      ...requestOverrides(options),
    });
  }
}
