/**
 * Recurrences — `rec`.
 *
 * A recurrence is the mandate: it describes what will be collected, how often,
 * and from whom. Creating one puts it in `CRIADA`; the payer then approves it in
 * their own bank, which moves it to `APROVADA`. Only then can charges be
 * collected against it.
 *
 * @see https://developers.inter.co/references/pix-automatico#tag/Rec
 */

import { PIX_AUTOMATICO_ENDPOINTS } from "../../generated/endpoints.ts";
import type {
  ChangeStatusRec,
  RecCompleta,
  RecGerada,
  RecGetQuery,
  RecRevisada,
  RecSolicitada,
  RecsConsultadas,
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

/** Filters for {@link PixAutomaticoRecResource.list}. */
export interface RecListQuery extends Omit<RecGetQuery, "inicio" | "fim"> {
  inicio: DateInput;
  fim: DateInput;
}

/** `/pix/v2/rec` — recurrence mandates. */
export class PixAutomaticoRecResource extends Resource {
  /**
   * Creates a recurrence.
   *
   * It starts in `CRIADA` and only becomes collectable once the payer approves
   * it. Watch the `rec` webhook, or poll {@link get}, for the transition.
   */
  async create(body: RecSolicitada, options?: RequestOptions): Promise<RecGerada> {
    return await this.client.call<RecGerada>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.recPost,
      api: API,
      basePath: BASE,
      body,
      ...requestOverrides(options),
    });
  }

  /** Retrieves one recurrence. `txid` narrows to a specific linked charge. */
  async get(idRec: string, options?: RequestOptions & { txid?: string }): Promise<RecCompleta> {
    return await this.client.call<RecCompleta>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.recIdRecGet,
      api: API,
      basePath: BASE,
      pathParams: { idRec },
      query: { txid: options?.txid },
      ...requestOverrides(options),
    });
  }

  /**
   * Revises or cancels a recurrence.
   *
   * Set `status: "CANCELADA"` inside the body to end the mandate; see
   * {@link cancel} for the shorthand.
   */
  async update(idRec: string, body: RecRevisada, options?: RequestOptions): Promise<RecGerada> {
    return await this.client.call<RecGerada>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.recIdRecPatch,
      api: API,
      basePath: BASE,
      pathParams: { idRec },
      body,
      ...requestOverrides(options),
    });
  }

  /** Cancels a recurrence, ending the mandate. */
  async cancel(idRec: string, options?: RequestOptions): Promise<RecGerada> {
    return await this.update(idRec, { status: "CANCELADA" } as RecRevisada, options);
  }

  /** Searches recurrences created in a window. */
  async list(query: RecListQuery, options?: RequestOptions): Promise<RecsConsultadas> {
    return await this.client.call<RecsConsultadas>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.recGet,
      api: API,
      basePath: BASE,
      query: { ...query, inicio: formatDateTime(query.inicio), fim: formatDateTime(query.fim) },
      ...requestOverrides(options),
    });
  }

  /** Iterates every recurrence in the window. */
  listPaginated(query: RecListQuery, options?: RequestOptions & PaginateOptions): Paginator<RecCompleta> {
    return new Paginator<RecCompleta>(async (page, signal) => {
      const body = await this.list(
        { ...query, "paginacao.paginaAtual": page },
        { ...options, signal: signal ?? options?.signal },
      );
      return pixPage(body, (body.recs ?? []) as RecCompleta[], page);
    }, options);
  }

  /**
   * Forces a recurrence into a given status without the payer acting.
   * **Sandbox only** — this is how you simulate the approval step in tests.
   */
  async simulateStatusChange(idRec: string, body: ChangeStatusRec, options?: RequestOptions): Promise<void> {
    await this.client.call<void>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.changeStatusRec,
      api: API,
      basePath: BASE,
      pathParams: { idRec },
      body,
      responseType: "none",
      ...requestOverrides(options),
    });
  }
}
