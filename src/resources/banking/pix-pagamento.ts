/**
 * Outbound Pix.
 *
 * This is money leaving the account. Charges you *receive* live under
 * `inter.pix` instead.
 *
 * A destination is one of three shapes, discriminated by `tipo`:
 *
 * | `tipo` | What you supply |
 * | --- | --- |
 * | `CHAVE` | a Pix key (CPF/CNPJ, e-mail, phone or EVP) |
 * | `PIX_COPIA_E_COLA` | a BR Code payload copied from a QR code |
 * | `DADOS_BANCARIOS` | bank, branch, account and holder details |
 *
 * @see https://developers.inter.co/references/banking#tag/Pix-Pagamento
 */

import { BANKING_ENDPOINTS } from "../../generated/endpoints.ts";
import type { ConsultaPixAsyncResponse, PagamentoPixRequestBody, PagamentoPixResponse } from "../../generated/banking.ts";
import { INTER_BASE_PATHS } from "../../config.ts";
import { Resource, requestOverrides } from "../../core/resource.ts";
import type { RequestOptions } from "../../core/resource.ts";
import { randomUUID } from "../../utils/uuid.ts";

const API = "banking";
const BASE = INTER_BASE_PATHS.banking;

/** Extra options for {@link BankingPixPagamentoResource.send}. */
export interface SendPixOptions extends RequestOptions {
  /**
   * Generate an `x-id-idempotente` when the caller does not supply one.
   *
   * On by default: a Pix transfer is irreversible, and an auto-generated key
   * means a socket timeout cannot turn into a second transfer.
   *
   * @default true
   */
  autoIdempotencyKey?: boolean;
}

/** `/banking/v2/pix` — send Pix payments and check their status. */
export class BankingPixPagamentoResource extends Resource {
  /**
   * Sends or schedules a Pix payment.
   *
   * Settlement is asynchronous. The response carries a `codigoSolicitacao` and
   * an initial status; follow it with {@link get} or register the
   * `pix-pagamento` webhook to be told when it lands.
   *
   * @example
   * ```ts
   * const pix = await inter.banking.pixPagamento.send({
   *   valor: 1.23,
   *   descricao: "Reembolso pedido 1001",
   *   destinatario: { tipo: "CHAVE", chave: "maria@example.com" },
   * });
   * ```
   */
  async send(body: PagamentoPixRequestBody, options?: SendPixOptions): Promise<PagamentoPixResponse> {
    const overrides = requestOverrides(options);
    const idempotencyKey =
      options?.idempotencyKey ?? (options?.autoIdempotencyKey === false ? undefined : randomUUID());

    return await this.client.call<PagamentoPixResponse>({
      endpoint: BANKING_ENDPOINTS.realizarPagamentoPix,
      api: API,
      basePath: BASE,
      body,
      ...overrides,
      idempotencyKey,
    });
  }

  /**
   * Retrieves a Pix payment and its full status history.
   *
   * @param codigoSolicitacao The identifier returned by {@link send}.
   */
  async get(codigoSolicitacao: string, options?: RequestOptions): Promise<ConsultaPixAsyncResponse> {
    return await this.client.call<ConsultaPixAsyncResponse>({
      endpoint: BANKING_ENDPOINTS.consultarPagamentoPix,
      api: API,
      basePath: BASE,
      pathParams: { codigoSolicitacao },
      ...requestOverrides(options),
    });
  }
}
