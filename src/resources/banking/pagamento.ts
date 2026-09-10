/**
 * Payments out of the account: boletos, DARF and batches.
 *
 * Every payment can be scheduled by setting `dataPagamento` to a future date;
 * a scheduled payment can be cancelled with {@link BankingPagamentoResource.cancelSchedule}
 * until it settles.
 *
 * @see https://developers.inter.co/references/banking#tag/Pagamento
 */

import { BANKING_ENDPOINTS } from "../../generated/endpoints.ts";
import type {
  BuscarInformacoesPagamentoDarfQuery,
  BuscarInformacoesPagamentosQuery,
  DarfRequest,
  DarfResponse,
  EfetuarPagamento,
  EfetuarPagamentoResponse,
  InformacoesPagamento,
  InformacoesPagamentoDarf,
  ObterLoteResponse,
  PagarLoteRequest,
  PagarLoteResponse,
} from "../../generated/banking.ts";
import { INTER_BASE_PATHS } from "../../config.ts";
import { Resource, requestOverrides } from "../../core/resource.ts";
import type { RequestOptions } from "../../core/resource.ts";
import { formatDateOptional } from "../../utils/date.ts";
import type { DateInput } from "../../utils/date.ts";

const API = "banking";
const BASE = INTER_BASE_PATHS.banking;

/** Filters for {@link BankingPagamentoResource.list}. */
export interface PagamentoListQuery extends Omit<BuscarInformacoesPagamentosQuery, "dataInicio" | "dataFim"> {
  dataInicio?: DateInput;
  dataFim?: DateInput;
}

/** Filters for {@link BankingPagamentoResource.listDarf}. */
export interface DarfListQuery extends Omit<BuscarInformacoesPagamentoDarfQuery, "dataInicio" | "dataFim"> {
  dataInicio?: DateInput;
  dataFim?: DateInput;
}

/** `/banking/v2/pagamento` — outbound boleto, DARF and batch payments. */
export class BankingPagamentoResource extends Resource {
  /**
   * Pays or schedules a boleto from its barcode or linha digitável.
   *
   * Pass an `idempotencyKey` so a network retry can never pay the same boleto
   * twice — without one, the SDK refuses to replay the request at all.
   *
   * @example
   * ```ts
   * await inter.banking.pagamentos.payBoleto(
   *   {
   *     codBarraLinhaDigitavel: "34191790010104351004791020150008291070026000",
   *     valorPagar: 65.33,
   *     dataVencimento: "2026-10-31",
   *   },
   *   { idempotencyKey: crypto.randomUUID() },
   * );
   * ```
   */
  async payBoleto(body: EfetuarPagamento, options?: RequestOptions): Promise<EfetuarPagamentoResponse> {
    return await this.client.call<EfetuarPagamentoResponse>({
      endpoint: BANKING_ENDPOINTS.pagarBoleto,
      api: API,
      basePath: BASE,
      body,
      ...requestOverrides(options),
    });
  }

  /** Searches boleto payments. Dates apply to whichever field `filtrarDataPor` names. */
  async list(query: PagamentoListQuery = {}, options?: RequestOptions): Promise<InformacoesPagamento[]> {
    return await this.client.call<InformacoesPagamento[]>({
      endpoint: BANKING_ENDPOINTS.buscarInformacoesPagamentos,
      api: API,
      basePath: BASE,
      query: {
        ...query,
        dataInicio: formatDateOptional(query.dataInicio),
        dataFim: formatDateOptional(query.dataFim),
      },
      ...requestOverrides(options),
    });
  }

  /**
   * Pays or schedules a DARF — the federal tax collection form.
   *
   * `periodoApuracao` is the assessment period, `dataVencimento` the statutory
   * due date, and `valorPrincipal` excludes fine and interest, which go in
   * `valorMulta` and `valorJuros`.
   */
  async payDarf(body: DarfRequest, options?: RequestOptions): Promise<DarfResponse> {
    return await this.client.call<DarfResponse>({
      endpoint: BANKING_ENDPOINTS.pagamentosDarf,
      api: API,
      basePath: BASE,
      body,
      ...requestOverrides(options),
    });
  }

  /** Searches DARF payments by payment date, request code or revenue code. */
  async listDarf(query: DarfListQuery = {}, options?: RequestOptions): Promise<InformacoesPagamentoDarf[]> {
    return await this.client.call<InformacoesPagamentoDarf[]>({
      endpoint: BANKING_ENDPOINTS.buscarInformacoesPagamentoDarf,
      api: API,
      basePath: BASE,
      query: {
        ...query,
        dataInicio: formatDateOptional(query.dataInicio),
        dataFim: formatDateOptional(query.dataFim),
      },
      ...requestOverrides(options),
    });
  }

  /**
   * Submits a batch of payments, mixing boletos and DARFs.
   *
   * The batch is accepted asynchronously (`202`); poll {@link getBatch} with the
   * returned `idLote` to see each payment's outcome.
   */
  async payBatch(body: PagarLoteRequest, options?: RequestOptions): Promise<PagarLoteResponse> {
    return await this.client.call<PagarLoteResponse>({
      endpoint: BANKING_ENDPOINTS.pagamentosLote,
      api: API,
      basePath: BASE,
      body,
      ...requestOverrides(options),
    });
  }

  /** Retrieves a batch and the status of every payment inside it. */
  async getBatch(idLote: string, options?: RequestOptions): Promise<ObterLoteResponse> {
    return await this.client.call<ObterLoteResponse>({
      endpoint: BANKING_ENDPOINTS.buscarInformacoesPagamentoLote,
      api: API,
      basePath: BASE,
      pathParams: { idLote },
      ...requestOverrides(options),
    });
  }

  /**
   * Cancels a scheduled payment that has not settled yet.
   *
   * @param codigoTransacao The `codigoTransacao` returned when the payment was created.
   */
  async cancelSchedule(codigoTransacao: string, options?: RequestOptions): Promise<void> {
    await this.client.call<void>({
      endpoint: BANKING_ENDPOINTS.cancelarAgendamentoBoleto,
      api: API,
      basePath: BASE,
      pathParams: { codigoTransacao },
      responseType: "none",
      ...requestOverrides(options),
    });
  }
}
