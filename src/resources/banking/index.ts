/**
 * API Banking — `/banking/v2`.
 *
 * Everything you do *with* the account rather than *to* a receivable: balance,
 * statements, outbound payments (boleto, DARF, batches) and outbound Pix.
 *
 * Note the split with {@link PixResource}: `inter.banking.pixPagamento` **sends**
 * money out of the account, while `inter.pix` manages charges you **receive**.
 *
 * ```ts
 * const { disponivel } = await inter.banking.saldo();
 * const extrato = await inter.banking.extrato({ dataInicio: "2026-01-01", dataFim: "2026-01-31" });
 * ```
 *
 * @see https://developers.inter.co/references/banking
 */

import { BANKING_ENDPOINTS } from "../../generated/endpoints.ts";
import type {
  ListaTransacoes,
  ListaTransacoesCompletaPadrao,
  ListaTransacoesCompletaScroll,
  PdfModel,
  Saldo,
  TransacaoCompleta,
} from "../../generated/banking.ts";
import { INTER_BASE_PATHS } from "../../config.ts";
import { InterError } from "../../core/errors.ts";
import { flatPage, Paginator } from "../../core/pagination.ts";
import type { PaginateOptions } from "../../core/pagination.ts";
import { Resource, requestOverrides } from "../../core/resource.ts";
import type { RequestOptions, ResourceTransport } from "../../core/resource.ts";
import { formatDate, formatDateOptional } from "../../utils/date.ts";
import type { DateInput } from "../../utils/date.ts";
import { fromBase64 } from "../../utils/encoding.ts";
import { BankingPagamentoResource } from "./pagamento.ts";
import { BankingPixPagamentoResource } from "./pix-pagamento.ts";
import { BankingWebhookResource } from "./webhook.ts";

const API = "banking";
const BASE = INTER_BASE_PATHS.banking;

/** Window for a statement query. */
export interface ExtratoQuery {
  /** First day included, `YYYY-MM-DD` or a `Date`. */
  dataInicio: DateInput;
  /** Last day included. The window may not exceed 90 days. */
  dataFim: DateInput;
}

/** Filters for the enriched statement. */
export interface ExtratoCompletoQuery extends ExtratoQuery {
  /** Zero-based page index. Ignored in scroll mode. */
  pagina?: number;
  /** Transactions per page. @default 50 */
  tamanhoPagina?: number;
  /** `D` for debits (money out), `C` for credits (money in). */
  tipoOperacao?: "D" | "C";
  /** Narrows to a single transaction type, e.g. `PIX`. */
  tipoTransacao?: string;
}

/** Statement page in the default, page-number mode. */
export type ExtratoCompletoPage = ListaTransacoesCompletaPadrao;
/** Statement page in scroll mode, for very large result sets. */
export type ExtratoCompletoScrollPage = ListaTransacoesCompletaScroll;

export { BankingPagamentoResource } from "./pagamento.ts";
export { BankingPixPagamentoResource } from "./pix-pagamento.ts";
export { BankingWebhookResource } from "./webhook.ts";
export type { BankingCallbackQuery, BankingWebhookType } from "./webhook.ts";
export type { PagamentoListQuery, DarfListQuery } from "./pagamento.ts";

/** `/banking/v2` — balance, statements, payments and outbound Pix. */
export class BankingResource extends Resource {
  /** Payments out of the account: barcode/linha digitável, DARF and batches. */
  readonly pagamentos: BankingPagamentoResource;
  /** Outbound Pix transfers. */
  readonly pixPagamento: BankingPixPagamentoResource;
  /** Webhooks for `pix-pagamento` and `boleto-pagamento` events. */
  readonly webhooks: BankingWebhookResource;

  constructor(client: ResourceTransport) {
    super(client);
    this.pagamentos = new BankingPagamentoResource(client);
    this.pixPagamento = new BankingPixPagamentoResource(client);
    this.webhooks = new BankingWebhookResource(client);
  }

  /**
   * Current balance, or the closing balance on a given date.
   *
   * @param dataSaldo Position date. Omit for the live balance.
   */
  async saldo(dataSaldo?: DateInput, options?: RequestOptions): Promise<Saldo> {
    return await this.client.call<Saldo>({
      endpoint: BANKING_ENDPOINTS.saldo,
      api: API,
      basePath: BASE,
      query: { dataSaldo: formatDateOptional(dataSaldo) },
      ...requestOverrides(options),
    });
  }

  /**
   * The simple statement: one flat list of transactions, no pagination.
   *
   * The window may not exceed 90 days. For richer detail — counterparty, Pix
   * end-to-end id, boleto data — use {@link extratoCompleto}.
   */
  async extrato(query: ExtratoQuery, options?: RequestOptions): Promise<ListaTransacoes> {
    return await this.client.call<ListaTransacoes>({
      endpoint: BANKING_ENDPOINTS.extrato,
      api: API,
      basePath: BASE,
      query: { dataInicio: formatDate(query.dataInicio), dataFim: formatDate(query.dataFim) },
      ...requestOverrides(options),
    });
  }

  /**
   * The enriched statement, page by page.
   *
   * Each transaction carries a `detalhes` object whose shape depends on
   * `tipoTransacao` — narrow on that field to get the specific detail type.
   */
  async extratoCompleto(query: ExtratoCompletoQuery, options?: RequestOptions): Promise<ExtratoCompletoPage> {
    return await this.client.call<ExtratoCompletoPage>({
      endpoint: BANKING_ENDPOINTS.extratoComplete,
      api: API,
      basePath: BASE,
      query: {
        ...query,
        dataInicio: formatDate(query.dataInicio),
        dataFim: formatDate(query.dataFim),
      },
      ...requestOverrides(options),
    });
  }

  /**
   * Iterates the enriched statement, fetching pages as you consume them.
   *
   * @example
   * ```ts
   * for await (const t of inter.banking.extratoCompletoPaginated({
   *   dataInicio: "2026-01-01",
   *   dataFim: "2026-01-31",
   *   tipoOperacao: "C",
   * })) {
   *   console.log(t.dataInclusao, t.valor, t.tipoTransacao);
   * }
   * ```
   */
  extratoCompletoPaginated(
    query: ExtratoCompletoQuery,
    options?: RequestOptions & PaginateOptions,
  ): Paginator<TransacaoCompleta> {
    return new Paginator<TransacaoCompleta>(async (page, signal) => {
      const body = await this.extratoCompleto({ ...query, pagina: page }, { ...options, signal: signal ?? options?.signal });
      return flatPage(body, body.transacoes ?? [], page);
    }, options);
  }

  /**
   * Iterates the enriched statement in scroll mode, which Inter recommends for
   * very large result sets.
   *
   * Scroll mode trades random access for throughput: pages arrive in order and
   * the cursor expires a few minutes after the last read.
   */
  async *extratoCompletoScroll(
    query: ExtratoCompletoQuery,
    options?: RequestOptions,
  ): AsyncGenerator<TransacaoCompleta, void, undefined> {
    let scrollId: string | undefined;
    for (;;) {
      options?.signal?.throwIfAborted();
      const body = await this.client.call<ExtratoCompletoScrollPage>({
        endpoint: BANKING_ENDPOINTS.extratoComplete,
        api: API,
        basePath: BASE,
        query: {
          ...query,
          pagina: undefined,
          dataInicio: formatDate(query.dataInicio),
          dataFim: formatDate(query.dataFim),
          scrollEnabled: "true",
          scrollId,
        },
        ...requestOverrides(options),
      });

      for (const transacao of body.transacoes ?? []) yield transacao;
      if (!body.hasMore || !body.scrollId) return;
      scrollId = body.scrollId;
    }
  }

  /**
   * Downloads the statement as PDF bytes.
   *
   * @example
   * ```ts
   * await Bun.write("extrato.pdf", await inter.banking.extratoPdf({
   *   dataInicio: "2026-01-01",
   *   dataFim: "2026-01-31",
   * }));
   * ```
   */
  async extratoPdf(query: ExtratoQuery, options?: RequestOptions): Promise<Uint8Array> {
    const body = await this.client.call<PdfModel>({
      endpoint: BANKING_ENDPOINTS.extratoExport,
      api: API,
      basePath: BASE,
      query: { dataInicio: formatDate(query.dataInicio), dataFim: formatDate(query.dataFim) },
      ...requestOverrides(options),
    });
    if (!body?.pdf) throw new InterError("no PDF returned for the requested statement window");
    return fromBase64(body.pdf);
  }
}
