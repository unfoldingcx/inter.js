/**
 * Recurrence confirmation requests — `solicrec`.
 *
 * A `solicrec` is how you ask a payer to authorise a recurrence: it produces a
 * QR code or link the payer opens in their own bank to approve the mandate.
 *
 * @see https://developers.inter.co/references/pix-automatico#tag/SolicRec
 */

import { PIX_AUTOMATICO_ENDPOINTS } from "../../generated/endpoints.ts";
import type {
  ChangeStatusSolicRec,
  SolicRecCompleta,
  SolicRecRevisada,
  SolicRecSolicitada,
} from "../../generated/pix-automatico.ts";
import { INTER_BASE_PATHS } from "../../config.ts";
import { Resource, requestOverrides } from "../../core/resource.ts";
import type { RequestOptions } from "../../core/resource.ts";

const API = "pixAutomatico";
const BASE = INTER_BASE_PATHS.pixAutomatico;

/** `/pix/v2/solicrec` — recurrence confirmation requests. */
export class PixAutomaticoSolicRecResource extends Resource {
  /** Creates a confirmation request for a recurrence. */
  async create(body: SolicRecSolicitada, options?: RequestOptions): Promise<SolicRecCompleta> {
    return await this.client.call<SolicRecCompleta>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.postSolicRec,
      api: API,
      basePath: BASE,
      body,
      ...requestOverrides(options),
    });
  }

  /** Retrieves a confirmation request and its status. */
  async get(idSolicRec: string, options?: RequestOptions): Promise<SolicRecCompleta> {
    return await this.client.call<SolicRecCompleta>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.getSolicRec,
      api: API,
      basePath: BASE,
      pathParams: { idSolicRec },
      ...requestOverrides(options),
    });
  }

  /** Revises a confirmation request. */
  async update(idSolicRec: string, body: SolicRecRevisada, options?: RequestOptions): Promise<SolicRecCompleta> {
    return await this.client.call<SolicRecCompleta>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.patchSolicRec,
      api: API,
      basePath: BASE,
      pathParams: { idSolicRec },
      body,
      ...requestOverrides(options),
    });
  }

  /**
   * Forces a confirmation request into a given status. **Sandbox only** — use it
   * to simulate the payer approving or rejecting.
   */
  async simulateStatusChange(idRec: string, body: ChangeStatusSolicRec, options?: RequestOptions): Promise<void> {
    await this.client.call<void>({
      endpoint: PIX_AUTOMATICO_ENDPOINTS.changeStatusSolicRec,
      api: API,
      basePath: BASE,
      pathParams: { idRec },
      body,
      responseType: "none",
      ...requestOverrides(options),
    });
  }
}
