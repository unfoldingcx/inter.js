/**
 * `InterClient` — the entry point.
 *
 * ```ts
 * import { InterClient } from "inter.js";
 *
 * const inter = new InterClient({
 *   clientId: process.env.INTER_CLIENT_ID,
 *   clientSecret: process.env.INTER_CLIENT_SECRET,
 *   certificate: "./certs/inter.crt",
 *   privateKey: "./certs/inter.key",
 *   environment: "production",
 * });
 *
 * const saldo = await inter.banking.saldo();
 * ```
 *
 * Setup is lazy: certificates are read and validated on the first call, or
 * eagerly when you `await inter.ready()`.
 */

import { TOKEN_ENDPOINTS } from "./generated/endpoints.ts";
import { TokenManager } from "./core/auth.ts";
import type { TokenRecord } from "./core/auth.ts";
import { InterConfigurationError } from "./core/errors.ts";
import { HttpClient, toInterTransportError } from "./core/http.ts";
import type { CallOptions, InterResult } from "./core/http.ts";
import { consoleLogger, silentLogger } from "./core/logger.ts";
import type { Logger } from "./core/logger.ts";
import { createRateLimiter, noopRateLimiter } from "./core/rate-limit.ts";
import type { RateLimiter } from "./core/rate-limit.ts";
import type { ResourceTransport } from "./core/resource.ts";
import { defaultRetryPolicy } from "./core/retry.ts";
import { inspectCertificate, resolveTLS } from "./core/tls.ts";
import type { CertificateInfo, ResolvedTLS } from "./core/tls.ts";
import { createTransport, detectRuntime } from "./core/transport/index.ts";
import type { Transport } from "./core/transport/types.ts";
import { INTER_BASE_PATHS, resolveConfig } from "./config.ts";
import type { InterClientOptions, InterEnvironment, ResolvedConfig } from "./config.ts";
import { VERSION } from "./version.ts";

import { BankingResource } from "./resources/banking/index.ts";
import { CobrancaResource } from "./resources/cobranca/index.ts";
import { PixResource } from "./resources/pix/index.ts";
import { PixAutomaticoResource } from "./resources/pix-automatico/index.ts";

/** Internals shared between a client and the accounts derived from it. */
interface SharedRuntime {
  config: ResolvedConfig;
  logger: Logger;
  rateLimiter: RateLimiter;
  transport: Transport;
  tokens: TokenManager;
  tls?: ResolvedTLS;
  certificate?: CertificateInfo;
  ownsTransport: boolean;
}

/** A typed client for Banco Inter's partner APIs. */
export class InterClient implements ResourceTransport {
  /** Cobrança (Boleto com Pix): issue, edit, cancel and settle boletos. */
  readonly cobranca: CobrancaResource;
  /** Banking: balance, statements, payments and outbound Pix. */
  readonly banking: BankingResource;
  /** Pix: charges you receive, refunds and Pix webhooks. */
  readonly pix: PixResource;
  /** Pix Automático: recurrences and recurring charges. */
  readonly pixAutomatico: PixAutomaticoResource;

  private readonly options: InterClientOptions;
  private readonly config: ResolvedConfig;
  private readonly logger: Logger;
  private readonly contaCorrente: string | undefined;
  private shared: SharedRuntime | undefined;
  private setup: Promise<SharedRuntime> | undefined;
  private http: HttpClient | undefined;
  private closed = false;

  constructor(options: InterClientOptions = {}) {
    this.options = options;
    this.config = resolveConfig(options);
    this.logger = options.logger ?? (options.logLevel ? consoleLogger(options.logLevel) : silentLogger);
    this.contaCorrente = this.config.contaCorrente;

    this.cobranca = new CobrancaResource(this);
    this.banking = new BankingResource(this);
    this.pix = new PixResource(this);
    this.pixAutomatico = new PixAutomaticoResource(this);
  }

  /**
   * Builds a client entirely from environment variables.
   *
   * Reads `INTER_CLIENT_ID`, `INTER_CLIENT_SECRET`, `INTER_CERTIFICATE`,
   * `INTER_PRIVATE_KEY`, `INTER_PFX`, `INTER_PASSPHRASE`, `INTER_ENVIRONMENT`,
   * `INTER_CONTA_CORRENTE` and `INTER_BASE_URL`.
   */
  static fromEnv(overrides: InterClientOptions = {}): InterClient {
    return new InterClient(overrides);
  }

  /** The environment this client talks to. */
  get environment(): InterEnvironment {
    return this.config.environment;
  }

  /** The resolved API host. */
  get baseUrl(): string {
    return this.config.baseUrl;
  }

  /** The account sent as `x-conta-corrente`, when one is configured. */
  get account(): string | undefined {
    return this.contaCorrente;
  }

  /**
   * Eagerly loads the certificate, builds the transport and validates the
   * configuration. Calling this at boot turns a misconfiguration into a startup
   * failure instead of a surprise on the first payment.
   */
  async ready(): Promise<void> {
    await this.ensureReady();
  }

  /**
   * The client certificate's validity window, once {@link ready} has run.
   *
   * `undefined` when a PKCS#12 bundle is in use — the SDK does not decrypt those
   * to read the expiry — or when the certificate could not be parsed.
   */
  get certificate(): CertificateInfo | undefined {
    return this.shared?.certificate;
  }

  /**
   * Returns a client bound to a different account, sharing this one's transport,
   * token cache and rate-limit state.
   *
   * Use it when an integration is linked to several current accounts.
   *
   * @example
   * ```ts
   * const matriz = inter.withAccount("1234567");
   * const filial = inter.withAccount("7654321");
   * ```
   */
  withAccount(contaCorrente: string): InterClient {
    const derived = new InterClient({ ...this.options, contaCorrente });
    // Share the expensive parts: one TLS handshake pool, one token per scope set.
    derived.setup = this.ensureReady().then((shared) => {
      derived.shared = { ...shared, ownsTransport: false };
      return derived.shared;
    });
    return derived;
  }

  /**
   * Returns a valid access token, minting one if needed.
   *
   * You rarely need this — every resource method authorises itself. It is here
   * for debugging and for calling endpoints this SDK does not wrap yet.
   */
  async getAccessToken(scope?: string, signal?: AbortSignal): Promise<TokenRecord> {
    const shared = await this.ensureReady();
    return await shared.tokens.getToken(scope, signal);
  }

  /** Drops cached tokens so the next call mints a fresh one. */
  async invalidateToken(scope?: string): Promise<void> {
    const shared = await this.ensureReady();
    if (scope) await shared.tokens.invalidate(scope);
    else await shared.tokens.invalidateAll();
  }

  /**
   * Escape hatch for endpoints this SDK does not wrap.
   *
   * Everything the pipeline provides still applies: mTLS, token minting, rate
   * limiting, retries and typed errors.
   *
   * @example
   * ```ts
   * const data = await inter.request<{ saldoDisponivel: number }>({
   *   endpoint: { method: "GET", path: "/saldo", scope: "extrato.read" },
   *   api: "banking",
   *   basePath: "/banking/v2",
   * });
   * ```
   */
  async request<T = unknown>(options: CallOptions<T>): Promise<T> {
    return await this.call(options);
  }

  /** @internal Used by resource classes. */
  async call<T>(options: CallOptions<T>): Promise<T> {
    return (await this.callWithResponse(options)).data;
  }

  /** @internal Used by resource classes. */
  async callWithResponse<T>(options: CallOptions<T>): Promise<InterResult<T>> {
    if (this.closed) throw new InterConfigurationError("this InterClient has been closed");
    await this.ensureReady();
    return await this.http!.callWithResponse(options);
  }

  /**
   * Releases sockets held by the transport.
   *
   * Optional in a long-lived server; useful in short-lived scripts and tests so
   * the process can exit promptly.
   */
  async close(): Promise<void> {
    this.closed = true;
    const shared = this.shared;
    if (shared?.ownsTransport) await shared.transport.close?.();
  }

  // -- internals ------------------------------------------------------------

  private async ensureReady(): Promise<SharedRuntime> {
    if (this.shared && this.http) return this.shared;
    this.setup ??= this.initialise();
    const shared = await this.setup;
    this.shared = shared;
    this.http ??= this.buildHttp(shared);
    return shared;
  }

  private async initialise(): Promise<SharedRuntime> {
    const config = this.config;

    let tls: ResolvedTLS | undefined;
    let certificate: CertificateInfo | undefined;

    const suppliedTransport = config.transport;
    const needsTls = !suppliedTransport || Boolean(config.certificate ?? config.privateKey ?? config.pfx);

    if (needsTls) {
      tls = await resolveTLS({
        certificate: config.certificate,
        privateKey: config.privateKey,
        pfx: config.pfx,
        passphrase: config.passphrase,
        ca: config.ca,
        rejectUnauthorized: config.rejectUnauthorized,
      });
      if (tls.cert) {
        certificate = inspectCertificate(tls.cert);
        this.warnAboutCertificate(certificate);
      }
    }

    const transport = suppliedTransport ?? (await createTransport({
      tls,
      keepAlive: config.keepAlive,
      maxSockets: config.maxSockets,
      fetch: config.fetch,
      fetchOptions: config.fetchOptions,
    }));

    const rateLimiter = config.rateLimit === false ? noopRateLimiter : createRateLimiter(config.rateLimit ?? {});

    const tokens = new TokenManager({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      tokenUrl: `${config.baseUrl}${INTER_BASE_PATHS.oauth}${TOKEN_ENDPOINTS.token.path}`,
      scopes: config.scopes,
      strategy: config.scopeStrategy,
      store: config.tokenStore,
      expirySkewMs: config.tokenExpirySkewMs,
      cacheNamespace: `${config.environment}:${config.clientId}`,
      logger: this.logger,
      requestToken: async (body, signal) => {
        const tokenUrl = `${config.baseUrl}${INTER_BASE_PATHS.oauth}${TOKEN_ENDPOINTS.token.path}`;
        const budget = TOKEN_ENDPOINTS.token.rateLimit[config.environment === "sandbox" ? "sandbox" : "producao"];
        await rateLimiter.acquire("oauth:POST /token", budget, signal);
        try {
          return await transport.request({
            method: "POST",
            url: tokenUrl,
            headers: {
              "content-type": "application/x-www-form-urlencoded",
              accept: "application/json",
              "user-agent": this.userAgent(),
            },
            body,
            signal,
            timeoutMs: config.timeout,
          });
        } catch (err) {
          // Without this the raw TransportError would escape the SDK's error
          // hierarchy, since token minting bypasses the request pipeline.
          throw toInterTransportError(err, { method: "POST", url: tokenUrl });
        }
      },
    });

    this.logger.debug("inter: client initialised", {
      environment: config.environment,
      baseUrl: config.baseUrl,
      transport: transport.name,
      runtime: detectRuntime(),
      certificateExpiresAt: certificate?.notAfter?.toISOString(),
    });

    return { config, logger: this.logger, rateLimiter, transport, tokens, tls, certificate, ownsTransport: !suppliedTransport };
  }

  private buildHttp(shared: SharedRuntime): HttpClient {
    const config = shared.config;
    return new HttpClient({
      baseUrl: config.baseUrl,
      transport: shared.transport,
      tokens: shared.tokens,
      retry: defaultRetryPolicy(config.retry === false ? { maxRetries: 0 } : (config.retry ?? {})),
      rateLimiter: shared.rateLimiter,
      environment: config.environment === "sandbox" ? "sandbox" : "producao",
      logger: shared.logger,
      hooks: config.hooks,
      userAgent: this.userAgent(),
      timeoutMs: config.timeout,
      contaCorrente: this.contaCorrente,
      defaultHeaders: config.headers,
      debugBodies: config.debugBodies,
    });
  }

  private userAgent(): string {
    return this.config.userAgent ?? `inter.js/${VERSION} (${detectRuntime()})`;
  }

  private warnAboutCertificate(info: CertificateInfo | undefined): void {
    const threshold = this.config.certificateExpiryWarningDays;
    if (!info || threshold <= 0) return;

    if (info.expired) {
      this.logger.error("inter: the client certificate has expired", {
        notAfter: info.notAfter.toISOString(),
        hint: "Renew the integration in Internet Banking (Integrar > Minhas integrações > Renovar).",
      });
      return;
    }
    if (info.daysUntilExpiry <= threshold) {
      this.logger.warn("inter: the client certificate expires soon", {
        notAfter: info.notAfter.toISOString(),
        daysUntilExpiry: info.daysUntilExpiry,
        hint: "Renewal opens 90 days before expiry in Internet Banking (Integrar > Minhas integrações).",
      });
    }
  }
}
