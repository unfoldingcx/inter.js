/**
 * API Cobrança (Boleto com Pix) — `/cobranca/v3`.
 *
 * A "cobrança" is a single receivable that the payer can settle either as a
 * boleto (barcode / linha digitável) or as a Pix QR code. Issuing is
 * asynchronous: the API returns a `codigoSolicitacao` immediately and the boleto
 * and QR code appear a moment later, once `situacao` leaves `EM_PROCESSAMENTO`.
 *
 * ```ts
 * const { codigoSolicitacao } = await inter.cobranca.issue({
 *   seuNumero: "PED-1001",
 *   valorNominal: 149.9,
 *   dataVencimento: "2026-10-11",
 *   numDiasAgenda: 30,
 *   pagador: {
 *     cpfCnpj: "12345678909",
 *     tipoPessoa: "FISICA",
 *     nome: "Maria Souza",
 *     endereco: "Rua São Paulo, 100",
 *     bairro: "Centro",
 *     cidade: "Belo Horizonte",
 *     uf: "MG",
 *     cep: "30170000",
 *   },
 * });
 *
 * const cobranca = await inter.cobranca.waitUntilIssued(codigoSolicitacao);
 * console.log(cobranca.boleto?.linhaDigitavel, cobranca.pix?.pixCopiaECola);
 * ```
 *
 * @see https://developers.inter.co/references/cobranca-bolepix
 */

import { COBRANCA_ENDPOINTS } from "../../generated/endpoints.ts";
import type {
  CobrancaDetalhadaResponseBody,
  CobrancaResponse,
  CobrancasResponse,
  ConsultarSumarioQuery,
  EmitirCobrancaAsyncResponse,
  EmitirCobrancaRequestBody,
  GetStatusUpdateResponseBody,
  ItemSumarioCobrancas,
  PagamentoCobrancaRequestBody,
  PdfResponse,
  PesquisaCobrancaQuery,
  UpdateCobrancaRequestBody,
  UpdateCobrancaResponseBody,
} from "../../generated/cobranca.ts";
import { INTER_BASE_PATHS } from "../../config.ts";
import { InterError, InterNotFoundError } from "../../core/errors.ts";
import { flatPage, Paginator } from "../../core/pagination.ts";
import type { PaginateOptions } from "../../core/pagination.ts";
import { Resource, requestOverrides } from "../../core/resource.ts";
import type { RequestOptions, ResourceTransport } from "../../core/resource.ts";
import { formatDate } from "../../utils/date.ts";
import type { DateInput } from "../../utils/date.ts";
import { fromBase64 } from "../../utils/encoding.ts";
import { CobrancaWebhookResource } from "./webhook.ts";

const API = "cobranca";
const BASE = INTER_BASE_PATHS.cobranca;

/** Filters for {@link CobrancaResource.list}. Dates accept `string | Date`. */
export interface CobrancaListQuery extends Omit<PesquisaCobrancaQuery, "dataInicial" | "dataFinal"> {
  /** Start of the window, inclusive. */
  dataInicial: DateInput;
  /** End of the window, inclusive. */
  dataFinal: DateInput;
}

/** Filters for {@link CobrancaResource.summary}. */
export interface CobrancaSummaryQuery extends Omit<ConsultarSumarioQuery, "dataInicial" | "dataFinal"> {
  dataInicial: DateInput;
  dataFinal: DateInput;
}

/** Options for {@link CobrancaResource.waitUntilIssued}. */
export interface WaitUntilIssuedOptions extends RequestOptions {
  /**
   * Give up after this long, in milliseconds.
   *
   * @default 30000
   */
  timeoutMs?: number;
  /**
   * Delay between polls, in milliseconds.
   *
   * @default 1000
   */
  intervalMs?: number;
}

export { CobrancaWebhookResource } from "./webhook.ts";
export type { CobrancaCallbackQuery } from "./webhook.ts";

/** `/cobranca/v3` — boletos with an attached Pix QR code. */
export class CobrancaResource extends Resource {
  /** Webhook registration and callback history for this API. */
  readonly webhook: CobrancaWebhookResource;

  constructor(client: ResourceTransport) {
    super(client);
    this.webhook = new CobrancaWebhookResource(client);
  }

  /**
   * Issues a cobrança.
   *
   * The call returns as soon as the request is accepted; the boleto and Pix
   * payloads are produced asynchronously. Use {@link waitUntilIssued} when you
   * need the linha digitável or the QR code right away.
   *
   * `seuNumero` is your own identifier and must be unique per account — reuse it
   * as the idempotency anchor in your own system.
   */
  async issue(body: EmitirCobrancaRequestBody, options?: RequestOptions): Promise<EmitirCobrancaAsyncResponse> {
    return await this.client.call<EmitirCobrancaAsyncResponse>({
      endpoint: COBRANCA_ENDPOINTS.emitirCobrancaAsync,
      api: API,
      basePath: BASE,
      body,
      ...requestOverrides(options),
    });
  }

  /** Retrieves one cobrança, including its boleto and Pix payloads. */
  async get(codigoSolicitacao: string, options?: RequestOptions): Promise<CobrancaDetalhadaResponseBody> {
    return await this.client.call<CobrancaDetalhadaResponseBody>({
      endpoint: COBRANCA_ENDPOINTS.recuperarCobrancaDetalhada,
      api: API,
      basePath: BASE,
      pathParams: { codigoSolicitacao },
      ...requestOverrides(options),
    });
  }

  /** Like {@link get}, but returns `undefined` instead of throwing on `404`. */
  async find(codigoSolicitacao: string, options?: RequestOptions): Promise<CobrancaDetalhadaResponseBody | undefined> {
    try {
      return await this.get(codigoSolicitacao, options);
    } catch (err) {
      if (err instanceof InterNotFoundError) return undefined;
      throw err;
    }
  }

  /**
   * Polls until the cobrança leaves `EM_PROCESSAMENTO`, then returns it.
   *
   * Issuing is asynchronous, so this is the natural companion to {@link issue}
   * when you need to hand a linha digitável or QR code to the payer immediately.
   *
   * @throws {InterError} when the deadline passes before the cobrança is ready.
   */
  async waitUntilIssued(
    codigoSolicitacao: string,
    options: WaitUntilIssuedOptions = {},
  ): Promise<CobrancaDetalhadaResponseBody> {
    const deadline = Date.now() + (options.timeoutMs ?? 30_000);
    const intervalMs = options.intervalMs ?? 1_000;

    for (;;) {
      const cobranca = await this.get(codigoSolicitacao, options);
      if (cobranca.cobranca?.situacao !== "EM_PROCESSAMENTO") return cobranca;

      if (Date.now() + intervalMs > deadline) {
        throw new InterError(
          `cobrança ${codigoSolicitacao} was still EM_PROCESSAMENTO after ${options.timeoutMs ?? 30_000}ms. ` +
            "Issuing is asynchronous; retry `get()` shortly or wait for the webhook callback.",
        );
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      options.signal?.throwIfAborted();
    }
  }

  /**
   * Searches cobranças in a date window.
   *
   * `filtrarDataPor` decides which date the window applies to — issue date, due
   * date or payment date. It defaults to `VENCIMENTO`.
   */
  async list(query: CobrancaListQuery, options?: RequestOptions): Promise<CobrancasResponse> {
    return await this.client.call<CobrancasResponse>({
      endpoint: COBRANCA_ENDPOINTS.pesquisaCobranca,
      api: API,
      basePath: BASE,
      query: {
        ...query,
        dataInicial: formatDate(query.dataInicial),
        dataFinal: formatDate(query.dataFinal),
      },
      ...requestOverrides(options),
    });
  }

  /**
   * Iterates every cobrança in the window, fetching pages as you go.
   *
   * @example
   * ```ts
   * for await (const item of inter.cobranca.listPaginated({
   *   dataInicial: "2026-01-01",
   *   dataFinal: "2026-01-31",
   *   situacao: "A_RECEBER",
   * })) {
   *   console.log(item.cobranca.seuNumero, item.cobranca.valorNominal);
   * }
   * ```
   */
  listPaginated(query: CobrancaListQuery, options?: RequestOptions & PaginateOptions): Paginator<CobrancaResponse> {
    return new Paginator<CobrancaResponse>(async (page, signal) => {
      const body = await this.list(
        { ...query, "paginacao.paginaAtual": page },
        { ...options, signal: signal ?? options?.signal },
      );
      return flatPage(body, body.cobrancas ?? [], page);
    }, options);
  }

  /**
   * Edits an open cobrança: due date, amount, discount, fine or interest.
   *
   * Editing is asynchronous too. The response carries a `codigoEdicao` you can
   * follow with {@link getEditStatus}.
   */
  async update(
    codigoSolicitacao: string,
    body: UpdateCobrancaRequestBody,
    options?: RequestOptions,
  ): Promise<UpdateCobrancaResponseBody> {
    return await this.client.call<UpdateCobrancaResponseBody>({
      endpoint: COBRANCA_ENDPOINTS.editarCobranca,
      api: API,
      basePath: BASE,
      pathParams: { codigoSolicitacao },
      body,
      ...requestOverrides(options),
    });
  }

  /** Checks how an edit submitted through {@link update} is progressing. */
  async getEditStatus(codigoEdicao: string, options?: RequestOptions): Promise<GetStatusUpdateResponseBody> {
    return await this.client.call<GetStatusUpdateResponseBody>({
      endpoint: COBRANCA_ENDPOINTS.consultarAtualizacaoCobranca,
      api: API,
      basePath: BASE,
      pathParams: { codigoEdicao },
      ...requestOverrides(options),
    });
  }

  /**
   * Cancels a cobrança that has not been paid.
   *
   * @param motivoCancelamento Free text stored with the cancellation.
   */
  async cancel(codigoSolicitacao: string, motivoCancelamento: string, options?: RequestOptions): Promise<void> {
    await this.client.call<void>({
      endpoint: COBRANCA_ENDPOINTS.cancelarCobranca,
      api: API,
      basePath: BASE,
      pathParams: { codigoSolicitacao },
      body: { motivoCancelamento },
      responseType: "none",
      ...requestOverrides(options),
    });
  }

  /**
   * Downloads the boleto as PDF bytes, ready to write to disk or stream to a
   * browser.
   *
   * @example
   * ```ts
   * await Bun.write("boleto.pdf", await inter.cobranca.pdf(codigoSolicitacao));
   * ```
   */
  async pdf(codigoSolicitacao: string, options?: RequestOptions): Promise<Uint8Array> {
    const base64 = await this.pdfBase64(codigoSolicitacao, options);
    return fromBase64(base64);
  }

  /** The same PDF, left as the base64 string the API returns. */
  async pdfBase64(codigoSolicitacao: string, options?: RequestOptions): Promise<string> {
    const body = await this.client.call<PdfResponse>({
      endpoint: COBRANCA_ENDPOINTS.obterPdfCobranca,
      api: API,
      basePath: BASE,
      pathParams: { codigoSolicitacao },
      ...requestOverrides(options),
    });
    if (!body?.pdf) throw new InterError(`no PDF returned for cobrança ${codigoSolicitacao}`);
    return body.pdf;
  }

  /**
   * Totals cobranças by status over a date window — how much is outstanding,
   * received, overdue or cancelled.
   */
  async summary(query: CobrancaSummaryQuery, options?: RequestOptions): Promise<ItemSumarioCobrancas[]> {
    return await this.client.call<ItemSumarioCobrancas[]>({
      endpoint: COBRANCA_ENDPOINTS.consultarSumario,
      api: API,
      basePath: BASE,
      query: {
        ...query,
        dataInicial: formatDate(query.dataInicial),
        dataFinal: formatDate(query.dataFinal),
      },
      ...requestOverrides(options),
    });
  }

  /**
   * Simulates payment of a cobrança. **Sandbox only** — the endpoint does not
   * exist in production.
   */
  async simulatePayment(
    codigoSolicitacao: string,
    body: PagamentoCobrancaRequestBody,
    options?: RequestOptions,
  ): Promise<void> {
    await this.client.call<void>({
      endpoint: COBRANCA_ENDPOINTS.pagarCobranca,
      api: API,
      basePath: BASE,
      pathParams: { codigoSolicitacao },
      body,
      responseType: "none",
      ...requestOverrides(options),
    });
  }
}
