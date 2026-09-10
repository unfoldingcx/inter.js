/**
 * Immediate Pix charges — `cob`.
 *
 * A `cob` is a charge that expires after `calendario.expiracao` seconds (86 400
 * by default). Creating one gives you back a BR Code in `pixCopiaECola` and a
 * `location` you can render as a QR code.
 *
 * `txid` is your identifier for the charge: 26–35 characters, `[a-zA-Z0-9]`,
 * unique per receiving CPF/CNPJ. {@link PixCobResource.create} lets Inter mint
 * one; {@link PixCobResource.createWithTxid} uses yours, which makes the call
 * naturally idempotent.
 *
 * @see https://developers.inter.co/references/pix#tag/Cob
 */

import { PIX_ENDPOINTS } from "../../generated/endpoints.ts";
import type {
  CobCompleta,
  CobGerada,
  CobRevisada,
  CobSolicitada,
  CobsConsultadas,
  GetCobQuery,
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

/** Filters for {@link PixCobResource.list}. */
export interface PixCobListQuery extends Omit<GetCobQuery, "inicio" | "fim"> {
  /** Start of the window. */
  inicio: DateInput;
  /** End of the window. */
  fim: DateInput;
}

/** `/pix/v2/cob` — immediate Pix charges. */
export class PixCobResource extends Resource {
  /**
   * Creates an immediate charge and lets Inter generate the `txid`.
   *
   * @example
   * ```ts
   * const cob = await inter.pix.cob.create({
   *   chave: "pix@empresa.com.br",
   *   valor: { original: "149.90" },
   *   calendario: { expiracao: 3600 },
   *   devedor: { cpf: "12345678909", nome: "Maria Souza" },
   *   solicitacaoPagador: "Pedido 1001",
   * });
   * console.log(cob.pixCopiaECola);
   * ```
   */
  async create(body: CobSolicitada, options?: RequestOptions): Promise<CobGerada> {
    return await this.client.call<CobGerada>({
      endpoint: PIX_ENDPOINTS.postCob,
      api: API,
      basePath: BASE,
      body,
      ...requestOverrides(options),
    });
  }

  /**
   * Creates an immediate charge under a `txid` you choose.
   *
   * Because the identifier comes from you, replaying the call is safe: Inter
   * returns the existing charge instead of creating a second one. Prefer this
   * over {@link create} when the charge maps to an order in your own system.
   *
   * @param txid 26–35 characters matching `[a-zA-Z0-9]`.
   */
  async createWithTxid(txid: string, body: CobSolicitada, options?: RequestOptions): Promise<CobGerada> {
    return await this.client.call<CobGerada>({
      endpoint: PIX_ENDPOINTS.putCobByTxid,
      api: API,
      basePath: BASE,
      pathParams: { txid },
      body,
      ...requestOverrides(options),
    });
  }

  /** Retrieves a charge, including any Pix already paid against it. */
  async get(txid: string, options?: RequestOptions & { revisao?: number }): Promise<CobCompleta> {
    return await this.client.call<CobCompleta>({
      endpoint: PIX_ENDPOINTS.getCobByTxid,
      api: API,
      basePath: BASE,
      pathParams: { txid },
      query: { revisao: options?.revisao },
      ...requestOverrides(options),
    });
  }

  /**
   * Revises a charge. Every accepted revision increments `revisao` by one.
   *
   * Set `status: "REMOVIDA_PELO_USUARIO_RECEBEDOR"` to cancel — see {@link cancel}.
   */
  async update(txid: string, body: CobRevisada, options?: RequestOptions): Promise<CobGerada> {
    return await this.client.call<CobGerada>({
      endpoint: PIX_ENDPOINTS.patchCobByTxid,
      api: API,
      basePath: BASE,
      pathParams: { txid },
      body,
      ...requestOverrides(options),
    });
  }

  /**
   * Cancels a charge so it can no longer be paid.
   *
   * Shorthand for {@link update} with `status: "REMOVIDA_PELO_USUARIO_RECEBEDOR"`.
   */
  async cancel(txid: string, options?: RequestOptions): Promise<CobGerada> {
    return await this.update(txid, { status: "REMOVIDA_PELO_USUARIO_RECEBEDOR" }, options);
  }

  /** Searches charges created inside a time window. */
  async list(query: PixCobListQuery, options?: RequestOptions): Promise<CobsConsultadas> {
    return await this.client.call<CobsConsultadas>({
      endpoint: PIX_ENDPOINTS.getCob,
      api: API,
      basePath: BASE,
      query: { ...query, inicio: formatDateTime(query.inicio), fim: formatDateTime(query.fim) },
      ...requestOverrides(options),
    });
  }

  /** Iterates every charge in the window, fetching pages as you go. */
  listPaginated(query: PixCobListQuery, options?: RequestOptions & PaginateOptions): Paginator<CobCompleta> {
    return new Paginator<CobCompleta>(async (page, signal) => {
      const body = await this.list(
        { ...query, "paginacao.paginaAtual": page },
        { ...options, signal: signal ?? options?.signal },
      );
      return pixPage(body, body.cobs ?? [], page);
    }, options);
  }

  /**
   * Simulates a payer settling the charge. **Sandbox only.**
   */
  async simulatePayment(
    txid: string,
    body: PagarCobrancaPix,
    options?: RequestOptions,
  ): Promise<PagarCobrancaPixResponse> {
    return await this.client.call<PagarCobrancaPixResponse>({
      endpoint: PIX_ENDPOINTS.postCobPagarByTxid,
      api: API,
      basePath: BASE,
      pathParams: { txid },
      body,
      ...requestOverrides(options),
    });
  }
}
