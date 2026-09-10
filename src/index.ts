/**
 * inter.js — a TypeScript SDK for Banco Inter's partner APIs.
 *
 * ```ts
 * import { InterClient } from "inter.js";
 *
 * const inter = new InterClient({
 *   clientId: process.env.INTER_CLIENT_ID,
 *   clientSecret: process.env.INTER_CLIENT_SECRET,
 *   certificate: "./certs/inter.crt",
 *   privateKey: "./certs/inter.key",
 * });
 *
 * const { disponivel } = await inter.banking.saldo();
 * ```
 *
 * Four APIs are covered, each on its own namespace:
 *
 * | Namespace | API | What it does |
 * | --- | --- | --- |
 * | `inter.cobranca` | Cobrança v3 | boletos with an attached Pix QR code |
 * | `inter.banking` | Banking v2 | balance, statements, payments, outbound Pix |
 * | `inter.pix` | Pix v2 | charges you receive, refunds, Pix webhooks |
 * | `inter.pixAutomatico` | Pix Automático | recurring mandates and charges |
 *
 * @see https://developers.inter.co
 */

// -- client -----------------------------------------------------------------

export { InterClient } from "./client.ts";
export { INTER_BASE_PATHS, INTER_BASE_URLS, resolveConfig } from "./config.ts";
export type { InterClientOptions, InterEnvironment, ResolvedConfig } from "./config.ts";
export { VERSION } from "./version.ts";

// -- errors -----------------------------------------------------------------

export {
  createAPIError,
  InterAbortError,
  InterAPIError,
  InterAuthenticationError,
  InterCertificateError,
  InterConfigurationError,
  InterConflictError,
  InterConnectionError,
  InterError,
  InterNotFoundError,
  InterPermissionError,
  InterRateLimitError,
  InterServerError,
  InterServiceUnavailableError,
  InterTimeoutError,
  InterValidationError,
  InterWebhookError,
  isInterAPIError,
  isInterError,
} from "./core/errors.ts";
export type { InterErrorContext } from "./core/errors.ts";
export { parseProblem, problemCode } from "./core/problem.ts";
export type { Problema, Violacao } from "./core/problem.ts";

// -- authorization ----------------------------------------------------------

export { createMemoryTokenStore, TokenManager } from "./core/auth.ts";
export type { ScopeStrategy, TokenManagerOptions, TokenRecord, TokenStore } from "./core/auth.ts";
export {
  BANKING_SCOPES,
  COBRANCA_SCOPES,
  formatScopes,
  INTER_SCOPES,
  isKnownScope,
  normalizeScopes,
  PIX_AUTOMATICO_SCOPES,
  PIX_SCOPES,
} from "./core/scopes.ts";
export type { InterScope } from "./core/scopes.ts";

// -- behaviour --------------------------------------------------------------

export { defaultRetryPolicy, isIdempotentMethod, parseRetryAfter } from "./core/retry.ts";
export type { RetryContext, RetryOptions, RetryPolicy } from "./core/retry.ts";
export { createRateLimiter, noopRateLimiter } from "./core/rate-limit.ts";
export type { RateLimiter, RateLimiterOptions } from "./core/rate-limit.ts";
export { flatPage, Paginator, pixPage } from "./core/pagination.ts";
export type { Page, PageFetcher, PaginateOptions } from "./core/pagination.ts";
export { consoleLogger, mask, maskToken, redact, REDACTED, silentLogger, withLevel } from "./core/logger.ts";
export type { Logger, LogLevel } from "./core/logger.ts";
export type { CallOptions, InterHooks, InterResponse, InterResult, ResponseType } from "./core/http.ts";
export type { RequestOptions, ResourceTransport } from "./core/resource.ts";

// -- transport & TLS --------------------------------------------------------

export {
  createBunTransport,
  createDenoTransport,
  createNodeTransport,
  createPlainFetchTransport,
  createTransport,
  detectRuntime,
  TransportError,
} from "./core/transport/index.ts";
export type { Runtime, Transport, TransportOptions, TransportRequest, TransportResponse } from "./core/transport/index.ts";
export { inspectCertificate, resolveTLS } from "./core/tls.ts";
export type { CertificateInfo, CertificateSource, ResolvedTLS, TLSOptions } from "./core/tls.ts";

// -- resources --------------------------------------------------------------

export { CobrancaResource, CobrancaWebhookResource } from "./resources/cobranca/index.ts";
export type { CobrancaCallbackQuery, CobrancaListQuery, CobrancaSummaryQuery, WaitUntilIssuedOptions } from "./resources/cobranca/index.ts";
export {
  BankingPagamentoResource,
  BankingPixPagamentoResource,
  BankingResource,
  BankingWebhookResource,
} from "./resources/banking/index.ts";
export type {
  BankingCallbackQuery,
  BankingWebhookType,
  DarfListQuery,
  ExtratoCompletoPage,
  ExtratoCompletoQuery,
  ExtratoCompletoScrollPage,
  ExtratoQuery,
  PagamentoListQuery,
} from "./resources/banking/index.ts";
export {
  PixCobResource,
  PixCobvResource,
  PixLocResource,
  PixLoteCobvResource,
  PixReceivedResource,
  PixResource,
  PixWebhookResource,
} from "./resources/pix/index.ts";
export type {
  PixCallbackQuery,
  PixCobListQuery,
  PixCobvListQuery,
  PixListQuery,
  PixLocListQuery,
  PixLoteCobvListQuery,
} from "./resources/pix/index.ts";
export {
  PixAutomaticoCobrResource,
  PixAutomaticoLocRecResource,
  PixAutomaticoRecResource,
  PixAutomaticoResource,
  PixAutomaticoSolicRecResource,
  PixAutomaticoWebhookResource,
} from "./resources/pix-automatico/index.ts";
export type { CobrListQuery, LocRecListQuery, RecListQuery } from "./resources/pix-automatico/index.ts";

// -- endpoint metadata ------------------------------------------------------

export {
  BANKING_ENDPOINTS,
  COBRANCA_ENDPOINTS,
  INTER_ENDPOINTS,
  PIX_AUTOMATICO_ENDPOINTS,
  PIX_ENDPOINTS,
  TOKEN_ENDPOINTS,
} from "./generated/endpoints.ts";
export type { EndpointMeta, EndpointRateLimit } from "./generated/endpoints.ts";

// -- wire types -------------------------------------------------------------

/**
 * Request and response types for every endpoint, namespaced per API.
 *
 * ```ts
 * import type { Cobranca, Pix } from "inter.js";
 *
 * function render(cob: Pix.CobGerada) { ... }
 * const body: Cobranca.EmitirCobrancaRequestBody = { ... };
 * ```
 */
export type { Banking, Cobranca, Pix, PixAutomatico, Token } from "./generated/index.ts";

// -- helpers ----------------------------------------------------------------

export * from "./utils/index.ts";
