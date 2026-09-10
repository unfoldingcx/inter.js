// ---------------------------------------------------------------------------
// Autenticacao OAuth
// Generated from specs/token.json by scripts/generate.ts - do not edit.
// Base path: /oauth/v2
// ---------------------------------------------------------------------------

export interface TokenResponse {
  /** Token gerado para ser utilizado nas requisições do Inter via Bearer. */
  access_token?: string;
  /** Tipo do token gerado. */
  token_type?: string;
  /** Tempo de uso do token até expirar. */
  expires_in?: number;
  /** Para qual escopo foi gerado o token. */
  scope?: string;
}

export interface TokenRequest {
  /** Client Id obtido no detalhe da tela de aplicações no IB */
  client_id: string;
  /** Client Secret obtido no detalhe da tela de aplicações no IB */
  client_secret: string;
  /**
   * GrantType que utilizamos, o default é (client_credentials)
   *
   * Default: `"client_credentials"`
   */
  grant_type: string;
  /**
   * Escopos cadastrados na tela de aplicações.
   *
   * **Onde encontrar os escopos:**
   *
   * Você encontra os escopos necessários para acesso na documentação
   * específica de cada endpoint.
   *
   * **Exemplo:**
   *
   * O endpoint para Consultar extrato requer o escopo `extrato.read`,
   * conforme indicado na imagem abaixo, retirada da documentação:
   *
   * **Múltiplos escopos:**
   *
   * É possível solicitar múltiplos escopos simultaneamente, enviando-os
   * em sequência separados por espaço.
   *
   * **Exemplo:**
   *
   * Para gerar um token com permissões de consulta para extrato, cobrança
   * e Pix, utilize:
   *
   * extrato.read boleto-cobranca.read pix.read
   *
   * @example "extrato.read"
   */
  scope: string;
}
