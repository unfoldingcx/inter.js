// ---------------------------------------------------------------------------
// API Cobranca (Boleto com Pix)
// Generated from specs/cobranca.json by scripts/generate.ts - do not edit.
// Base path: /cobranca/v3
// ---------------------------------------------------------------------------

/** Cobranças Consultadas */
export interface CobrancasResponse {
  /**
   * Quantidade total de páginas disponíveis para consulta.
   *
   * Range: 1..∞
   *
   * @example 1
   */
  totalPaginas?: number;
  /**
   * Quantidade total de itens disponíveis de acordo com os parâmetros informados.
   *
   * Format: `int32`
   * Range: 0..∞
   */
  totalElementos?: number;
  /**
   * Quantidade de registros por página, configurado na requisição.
   *
   * Range: 1..∞
   *
   * @example 20
   */
  tamanhoPagina?: number;
  /**
   * Primeira página
   *
   * @example true
   */
  primeiraPagina?: boolean;
  /**
   * Última página
   *
   * @example true
   */
  ultimaPagina?: boolean;
  /**
   * Quantidade de registros retornado na página atual.
   *
   * Range: 1..∞
   */
  numeroDeElementos?: number;
  /** Lista de Cobranças consultadas */
  cobrancas: CobrancaResponse[];
}

/** Cobrança */
export interface CobrancaResponse {
  cobranca: Cobranca;
  /**
   * Objeto com os dados da Cobrança gerada para pagamento via código de barras/linha digitável.
   *
   * Caso a cobrança esteja com a situação EM_PROCESSAMENTO, essa propriedade poderá não ser retornada.
   */
  boleto?: BoletoCobranca;
  /**
   * Objeto com os dados da Cobrança gerada para pagamento via QRCode.
   *
   * **Caso não seja possível gerar o Pix no momento, essa propriedade não será retornada.**
   */
  pix?: PixCobranca;
}

/** OpenAPI schema: `cobranca` */
export interface Cobranca {
  /**
   * Identificador único de uma cobrança
   *
   * Format: `UUID`
   */
  codigoSolicitacao?: string;
  /** Codigo da cobrança (seu número) */
  seuNumero?: string;
  /** Possíveis situações de uma cobranca. */
  situacao: SituacaoCobrancaEnum;
  /**
   * Data que a situação da cobrança sofreu alteração.
   *
   * Format: `date`
   */
  dataSituacao?: string;
  /**
   * Data e hora em que a cobrança foi emitida.
   *
   * Format: `date`
   */
  dataEmissao?: string;
  /**
   * Data de vencimento da cobrança
   *
   * Format: `date`
   */
  dataVencimento?: string;
  /**
   * Valor original da cobrança.
   *
   * Pattern: `^\\d{1,10}\\.\\d{2}$`
   */
  valorNominal: string;
  /**
   * Valor total recebido
   *
   * Pattern: `^\d{1,10}\.\d{2}$`
   */
  valorTotalRecebido?: string;
  /** Origem do recebimento da cobrança */
  origemRecebimento?: OrigemRecebimentoEnum;
  /** Tipo de cobrança */
  tipoCobranca?: "SIMPLES" | "PARCELADO" | "RECORRENTE";
  pagador: PagadorCobranca;
}

/** OpenAPI schema: `pagadorCobranca` */
export interface PagadorCobranca {
  /** Nome do pagador */
  nome: string;
  /** Cpf/Cnpj da pessoa pagadora */
  cpfCnpj: string;
}

/**
 * Objeto com os dados da Cobrança gerada para pagamento via código de barras/linha digitável.
 *
 * Caso a cobrança esteja com a situação EM_PROCESSAMENTO, essa propriedade poderá não ser retornada.
 *
 * OpenAPI schema: `boletoCobranca`
 */
export interface BoletoCobranca {
  /**
   * Caso a cobrança esteja com a situação EM_PROCESSAMENTO, esse campo poderá não ser retornada.
   *
   * Length: 0..11
   */
  nossoNumero?: string;
  /**
   * Linha digitável da cobrança
   *
   * Length: 47..47
   */
  linhaDigitavel: string;
  /**
   * Código de barras do boleto da cobrança
   *
   * Length: 44..44
   */
  codigoBarras: string;
}

/**
 * Objeto com os dados da Cobrança gerada para pagamento via QRCode.
 *
 * **Caso não seja possível gerar o Pix no momento, essa propriedade não será retornada.**
 *
 * OpenAPI schema: `pixCobranca`
 */
export interface PixCobranca {
  /** QRCode de cobrança para pagamento */
  pixCopiaECola: string;
  /**
   * Txid da Cobrança PIX gerada
   *
   * Pattern: `^[a-zA-Z0-9]{26,35}$`
   */
  txid: string;
}

export interface EmitirCobrancaRequestBody {
  /**
   * Campo Seu Número do título
   *
   * Length: 0..15
   *
   * @example "123456"
   */
  seuNumero: string;
  /**
   * Valor Nominal do título
   *
   * Range: 2.5..99999999.99
   */
  valorNominal: number;
  /**
   * Data de vencimento do título
   *
   * Formato aceito: YYYY-MM-DD
   *
   * Format: `date`
   *
   * @example "2018-07-27"
   */
  dataVencimento: string;
  /**
   * Número de dias corridos após o vencimento para o cancelamento efetivo automático da cobrança. (de 0 até 60)
   *
   * Format: `int32`
   * Range: 0..60
   * Default: `0`
   */
  numDiasAgenda: number;
  pagador: Pagador;
  /** Informações do desconto a ser aplicado. */
  desconto?: DescontoTaxa | DescontoValor;
  /** Informações da multa a ser cobrada. */
  multa?: MultaTaxa | MultaValor;
  /** Informações da mora a ser cobrada. */
  mora?: MoraTaxa | MoraValor;
  mensagem?: Mensagem;
  beneficiarioFinal?: BeneficiarioBase;
  /**
   * Lista com as formas de recebimento de uma cobrança, separadas por vírgula.
   *
   * Se não for informado, será criada a cobrança com o boleto e, caso haja uma chave registrada no Inter, o PIX cobrança com vencimento.
   * Também é possível gerar uma cobrança sem forma de pagamento, informando o valor SEM_FORMA_PAGAMENTO, dessa forma nenhum pagamento será atrelado à cobrança e a baixa não será realizada de forma automática, sendo necessário marcar como recebido manualmente.
   *
   * Atualmente não é possível informar somente **PIX** como forma de recebimento. Para uma cobrança de pix com vencimento deverá ser utilizada a [API PIX](/references/pix#tag/Cobranca-com-Vencimento/paths/~1cobv~1%7Btxid%7D/put).
   *
   * Default: `["BOLETO","PIX"]`
   */
  formasRecebimento?: FormaRecebimentoEnum[];
  /** Nota fiscal atrelada à cobrança realizada */
  notaFiscal?: NotaFiscal;
}

export interface CancelarCobrancaRequestBody {
  /**
   * Motivo pelo qual a cobrança está sendo cancelada
   *
   * Length: 0..50
   */
  motivoCancelamento: string;
}

/** Webhook */
export interface WebhookSolicitado {
  /**
   * URL de configuração do webhook. Deve iniciar obrigatoriamente com **https://**
   *
   * Format: `uri`
   * Pattern: `^https://[^\s]*$`
   *
   * @example "https://boleto.example.com/api/webhook/"
   */
  webhookUrl: string;
}

export interface CobrancaDetalhadaResponseBody {
  cobranca: {
    /** Identificador único da cobranca. */
    codigoSolicitacao: string;
    /** Seu Número. */
    seuNumero: string;
    /**
     * Data de emissao da cobrança
     *
     * Format: `date`
     */
    dataEmissao: string;
    /**
     * Data de vencimento da cobrança
     *
     * Format: `date`
     */
    dataVencimento: string;
    /**
     * Valor Nominal da cobrança
     *
     * @example 1234
     */
    valorNominal: number;
    /** Tipos de cobranças existentes. */
    tipoCobranca: TipoCobrancaEnum;
    /** Possíveis situações de uma cobranca. */
    situacao: SituacaoCobrancaEnum;
    /**
     * Data que a situação da cobrança sofreu alteração.
     *
     * Format: `date`
     */
    dataSituacao?: string;
    /**
     * Valor total recebido, no caso da cobrança ter sido paga.
     *
     * Pattern: `^\\d{1,10}\\.\\d{2}$`
     */
    valorTotalRecebido?: string;
    /** Origem do recebimento da cobrança */
    origemRecebimento?: OrigemRecebimentoEnum;
    /** Motivo do Cancelamento. */
    motivoCancelamento?: string;
    /**
     * Cobrança está arquivada ou não
     *
     * @example true
     */
    arquivada?: boolean;
    /** Length: 0..3 */
    descontos?: DescontoResponse[];
    multa?: MultaMoraResponse;
    mora?: MultaMoraResponse;
    pagador?: Pagador;
  };
  /**
   * Objeto com os dados da Cobrança gerada para pagamento via código de barras/linha digitável.
   *
   * Caso a cobrança esteja com a situação EM_PROCESSAMENTO, essa propriedade poderá não ser retornada.
   */
  boleto?: {
    /**
     * Nosso Número, atribuído automaticamente ao longo da inclusão do título.
     *
     * Caso a cobrança esteja com a situação EM_PROCESSAMENTO, essa campo poderá não ser retornada.
     *
     * Length: 0..11
     */
    nossoNumero?: string;
    /**
     * Dígitos que compõem o código de barras do boleto (44 posições preenchidas)
     *
     * Length: 44..44
     */
    codigoBarras: string;
    /**
     * Dígitos que compõem a linha digitável do boleto, sem formatação (47 posições preenchidas)
     *
     * Length: 47..47
     */
    linhaDigitavel: string;
  };
  /**
   * Objeto com os dados da Cobrança gerada para pagamento via QRCode.
   *
   * **Caso não seja possível gerar o Pix no momento, essa propriedade não será retornada.**
   */
  pix?: {
    /**
     * Txid da Cobrança PIX gerada
     *
     * Pattern: `^[a-zA-Z0-9]{26,35}$`
     */
    txid: string;
    /** QRCode de cobrança para pagamento */
    pixCopiaECola: string;
  };
  /**
   * Nota fiscal relacionada à cobrança.
   *
   * **Essa propriedade só será retornada caso a nota fiscal tenha sido especificada no momento do cadastro da cobrança.**
   */
  notaFiscal?: NotaFiscalResponse;
}

/** Webhook */
export interface WebhookCompleto {
  /**
   * Format: `uri`
   *
   * @example "https://boleto.example.com/api/webhook/"
   */
  webhookUrl: string;
  /**
   * Data e hora em que o webhook foi cadastrado. Respeita RFC 3339.
   *
   * Format: `date-time`
   * Read-only: returned by the API, never sent.
   */
  criacao: string;
  /**
   * Data e hora em que o webhook foi atualizado. Respeita RFC 3339.
   *
   * Format: `date-time`
   * Read-only: returned by the API, never sent.
   */
  atualizacao?: string;
}

export interface CallbackAttemptPage {
  /**
   * Quantidade total de itens disponíveis de acordo com os parâmetros informados
   *
   * Format: `int64`
   */
  totalElementos?: number;
  /** Quantidade total de páginas disponíveis para consulta. */
  totalPaginas?: number;
  /** Informa se é a primeira página */
  primeiraPagina?: boolean;
  /** Informa se é a última página */
  ultimaPagina?: boolean;
  /** Dados de cada notificação de callback. */
  data: CallbackAttemptPageItem[];
}

export interface CallbackAttemptPageItem {
  /**
   * URL do webhook no momento do disparo.
   *
   * Format: `uri`
   */
  webhookUrl?: string;
  payload: CallbackCobranca[];
  /** Qual o índice da tentativa de disparo. */
  numeroTentativa: number;
  /**
   * Data/hora da tentativa de disparo do callback.
   *
   * Format: `date-time`
   */
  dataHoraDisparo?: string;
  /** Informa se obteve sucesso no disparo do callback. */
  sucesso: boolean;
  /** Resposta da chamada ao endpoint do webhook. */
  httpStatus?: number;
  /** Mensagem de erro em caso de falha no dispardo do callback. */
  mensagemErro?: string;
}

export interface CallbackCobranca {
  /** Identificador único da cobrança */
  codigoSolicitacao: string;
  /**
   * Seu Número, enviado na requisição para inclusão do título.
   *
   * Length: 0..15
   */
  seuNumero?: string;
  /** Possíveis situações de uma cobranca. */
  situacao: SituacaoCobrancaCallbackEnum;
  /** Format: `date-time` */
  dataHoraSituacao: string;
  /** Pattern: `^\\d{1,10}\\.\\d{2}$` */
  valorTotalRecebido?: string;
  /** Origem do recebimento da cobrança */
  origemRecebimento?: OrigemRecebimentoEnum;
  /**
   * Nosso Número, atribuído automaticamente ao longo da inclusão do título.
   *
   * Length: 0..11
   */
  nossoNumero?: string;
  /**
   * Dígitos que compõem o código de barras do boleto (44 posições preenchidas)
   *
   * Length: 44..44
   */
  codigoBarras?: string;
  /**
   * Dígitos que compõem a linha digitável do boleto, sem formatação (47 posições preenchidas)
   *
   * Length: 47..47
   */
  linhaDigitavel?: string;
  /**
   * Txid da Cobrança PIX gerada
   *
   * Pattern: `^[a-zA-Z0-9]{26,35}$`
   */
  txid?: string;
  /** QRCode de cobrança para pagamento */
  pixCopiaECola?: string;
}

export interface PagadorBase {
  /**
   * CPF/CNPJ do pagador do título
   *
   * Length: 11..18
   */
  cpfCnpj: string;
  /**
   * Tipo do pagador:
   * * `FISICA` - Pessoa Física
   * * `JURIDICA` - Pessoa Jurídica
   */
  tipoPessoa: "FISICA" | "JURIDICA";
  /**
   * Nome do pagador
   *
   * Length: 1..100
   */
  nome: string;
  /**
   * Endereço do pagador
   *
   * Length: 1..100
   *
   * @example "Avenida Brasil"
   */
  endereco: string;
  /**
   * Bairro do pagador
   *
   * Length: 0..60
   * Default: `""`
   *
   * @example "Centro"
   */
  bairro?: string;
  /**
   * Cidade do pagador
   *
   * Length: 1..60
   *
   * @example "Belo Horizonte"
   */
  cidade: string;
  /**
   * UF
   *
   * @example "MG"
   */
  uf: EnumUF;
  /**
   * CEP do pagador
   *
   * Length: 8..8
   *
   * @example "30110000"
   */
  cep: string;
}

export interface BeneficiarioBase {
  /**
   * CPF/CNPJ do beneficiário do título
   *
   * Length: 11..18
   */
  cpfCnpj: string;
  /**
   * Tipo do beneficiário:
   * * `FISICA` - Pessoa Física
   * * `JURIDICA` - Pessoa Jurídica
   */
  tipoPessoa: "FISICA" | "JURIDICA";
  /**
   * Nome do beneficiário
   *
   * Length: 1..100
   */
  nome: string;
  /**
   * Endereço do beneficiário
   *
   * Length: 1..100
   *
   * @example "Avenida Brasil"
   */
  endereco: string;
  /**
   * Bairro do beneficiário
   *
   * Length: 0..60
   * Default: `""`
   *
   * @example "Centro"
   */
  bairro?: string;
  /**
   * Cidade do beneficiário
   *
   * Length: 1..60
   *
   * @example "Belo Horizonte"
   */
  cidade: string;
  /**
   * UF
   *
   * @example "MG"
   */
  uf: EnumUF;
  /**
   * CEP do beneficiário
   *
   * Length: 8..8
   *
   * @example "30110000"
   */
  cep: string;
}

export type Pagador = PagadorBase & {
  /**
   * E-mail do pagador
   *
   * Length: 0..50
   * Default: `""`
   */
  email?: string;
  /**
   * DDD do telefone do pagador
   *
   * Length: 0..2
   *
   * @example "31"
   */
  ddd?: string;
  /**
   * Telefone do pagador
   *
   * Length: 0..9
   */
  telefone?: string;
  /**
   * Número no logradouro do pagador
   *
   * Length: 0..10
   * Default: `""`
   *
   * @example "3456"
   */
  numero?: string;
  /**
   * Complemento do endereço do pagador
   *
   * Length: 0..30
   * Default: `""`
   *
   * @example "apartamento 3 bloco 4"
   */
  complemento?: string;
};

export interface Mensagem {
  /**
   * Linha 1 do campo de texto do título
   *
   * Length: 0..78
   */
  linha1?: string;
  /**
   * Linha 2 do campo de texto do título
   *
   * Length: 0..78
   */
  linha2?: string;
  /**
   * Linha 3 do campo de texto do título
   *
   * Length: 0..78
   */
  linha3?: string;
  /**
   * Linha 4 do campo de texto do título
   *
   * Length: 0..78
   */
  linha4?: string;
  /**
   * Linha 5 do campo de texto do título
   *
   * Length: 0..78
   */
  linha5?: string;
}

export interface Desconto {
  /**
   * * `VALORFIXODATAINFORMADA` - Valor fixo até a data informada.
   * * `PERCENTUALDATAINFORMADA` - Percentual até a data informada.
   */
  codigo: "PERCENTUALDATAINFORMADA" | "VALORFIXODATAINFORMADA";
  /** Quantidade de dias antes do vencimento que será aplicado o desconto. */
  quantidadeDias: number;
}

export type DescontoTaxa = Desconto & ({
  /**
   * Taxa Percentual de Desconto do título.
   *
   * Máximo de duas casas decimais, valores excedentes são arredondados.
   *
   * Ex: 0.033 -> 0.03 | 0.049 -> 0.05 | 0.335 -> 0.34
   */
  taxa: number;
});

export type DescontoValor = Desconto & ({
  /**
   * Valor de Desconto, expresso na moeda do título.
   *
   * Máximo de duas casas decimais, valores excedentes são arredondados.
   *
   * Ex: 10.032 -> 10.03 | 0.249 -> 0.25 | 15.745 -> 15.75
   */
  valor: number;
});

export type DescontoResponse = DescontoTaxa | DescontoValor;

export interface Multa {
  codigo: "PERCENTUAL" | "VALORFIXO";
}

export type MultaTaxa = Multa & ({
  /**
   * Taxa Percentual de Multa do título.
   *
   * Máximo de duas casas decimais, valores excedentes são arredondados.
   *
   * Ex: 0.033 -> 0.03 | 0.049 -> 0.05 | 0.335 -> 0.34
   */
  taxa: number;
});

export type MultaValor = Multa & ({
  /**
   * Valor de Multa expresso na moeda do título.
   *
   * Máximo de duas casas decimais, valores excedentes são arredondados.
   *
   * Ex: 1.033 -> 1.03 | 0.249 -> 0.25 | 2.745 -> 2.75
   */
  valor: number;
});

export interface Mora {
  codigo: "TAXAMENSAL" | "VALORDIA";
}

export type MoraTaxa = Mora & ({
  /**
   * Percentual de Mora do título.
   *
   * Máximo de duas casas decimais, valores excedentes são arredondados.
   *
   * Ex: 0.033 -> 0.03 | 0.049 -> 0.05 | 0.335 -> 0.34
   *
   * @example 1
   */
  taxa: number;
});

export type MoraValor = Mora & ({
  /**
   * Valor de Mora expresso na moeda do título.
   *
   * Máximo de duas casas decimais, valores excedentes são arredondados.
   *
   * Ex: 1.033 -> 1.03 | 0.249 -> 0.25 | 2.745 -> 2.75
   *
   * @example 1.5
   */
  valor: number;
});

/** Nota fiscal atrelada à cobrança realizada */
export interface NotaFiscal {
  /**
   * Chave de Acesso da Nota Fiscal.
   *
   * Pattern: `^[0-9]+$`
   * Length: 44..44
   */
  chaveNFe: string;
  /**
   * Número da Nota Fiscal.
   *
   * Format: `int32`
   */
  numero: number;
  /**
   * Série da Nota Fiscal.
   *
   * Format: `int32`
   */
  serie: number;
  /**
   * Data de Emissão da Nota Fiscal.
   *
   * Format: `date`
   */
  dataEmissao: string;
  /**
   * Parcela da Nota Fiscal.
   *
   * Format: `int32`
   */
  parcela?: number;
  /** Natureza da Operação da Nota Fiscal. */
  naturezaOperacao?: string;
}

/**
 * Nota fiscal relacionada à cobrança.
 *
 * **Essa propriedade só será retornada caso a nota fiscal tenha sido especificada no momento do cadastro da cobrança.**
 */
export type NotaFiscalResponse = NotaFiscal;

export interface MultaMoraResponse {
  codigo: string;
  taxa?: number;
  valor?: number;
}

export type TipoOrdenacaoCobrancasEnum = "ASC" | "DESC";

export type OrdenarCobrancasPorEnum = "PESSOA_PAGADORA" | "TIPO_COBRANCA" | "CODIGO_COBRANCA" | "IDENTIFICADOR" | "DATA_EMISSAO" | "DATA_VENCIMENTO" | "VALOR" | "STATUS";

/** Origem do recebimento da cobrança */
export type OrigemRecebimentoEnum = "BOLETO" | "PIX";

/** UF */
export type EnumUF = "AC" | "AL" | "AP" | "AM" | "BA" | "CE" | "DF" | "ES" | "GO" | "MA" | "MT" | "MS" | "MG" | "PA" | "PB" | "PR" | "PE" | "PI" | "RJ" | "RN" | "RS" | "RO" | "RR" | "SC" | "SP" | "SE" | "TO";

/** Possíveis situações de uma cobranca. */
export type SituacaoCobrancaEnum = "RECEBIDO" | "A_RECEBER" | "MARCADO_RECEBIDO" | "ATRASADO" | "CANCELADO" | "EXPIRADO" | "FALHA_EMISSAO" | "EM_PROCESSAMENTO" | "PROTESTO";

/** Possíveis situações de uma cobranca. */
export type SituacaoCobrancaCallbackEnum = "RECEBIDO" | "A_RECEBER" | "MARCADO_RECEBIDO" | "CANCELADO" | "EXPIRADO" | "FALHA_EMISSAO";

/** Tipos de cobranças existentes. */
export type TipoCobrancaEnum = "SIMPLES" | "PARCELADO" | "RECORRENTE";

export type FiltrarDataPorEnum = "VENCIMENTO" | "EMISSAO" | "PAGAMENTO";

/** Possíveis formas de recebimento de uma cobranca. */
export type FormaRecebimentoEnum = "BOLETO" | "PIX" | "SEM_FORMA_PAGAMENTO";

export interface EmitirCobrancaAsyncResponse {
  /** Código identificador único da cobranca */
  codigoSolicitacao: string;
}

export interface PdfResponse {
  /** Retorno do pdf base64 para String */
  pdf?: string;
}

/** Violação */
export interface Violacao {
  /**
   * Descrição do erro
   *
   * @example "Valor do pagamento não pode ser 0.00"
   */
  razao?: string;
  /**
   * Nome da propriedade
   *
   * @example "valor"
   */
  propriedade?: string;
  /**
   * Valor da propriedade
   *
   * @example "061996671234"
   */
  valor?: string;
}

export interface Problema {
  /**
   * Código HTTP do status retornado.
   *
   * @example 404
   */
  status: number;
  /**
   * Descrição resumida do problema.
   *
   * @example "Erro"
   */
  title: string;
  /** Descrição completa do problema. */
  detail?: string;
  violacoes?: Violacao[];
}

/** Possíveis status de uma cobranca. */
export type StatusCobrancaEnum = "RECEBIDO" | "A_RECEBER" | "MARCADO_RECEBIDO" | "ATRASADO" | "CANCELADO" | "EXPIRADO" | "FALHA_EMISSAO" | "EM_PROCESSAMENTO" | "PROTESTO";

/** OpenAPI schema: `itemSumarioCobrancas` */
export interface ItemSumarioCobrancas {
  /** Possíveis status de uma cobranca. */
  situacao: StatusCobrancaEnum;
  /**
   * Valor
   *
   * Default: `0`
   *
   * @example 1.5
   */
  valor: number;
  /**
   * Número de cobranças com esta situação
   *
   * Format: `int64`
   * Default: `0`
   *
   * @example 12
   */
  quantidade: number;
}

export interface PagamentoCobrancaRequestBody {
  pagarCom: "BOLETO" | "PIX";
}

export interface UpdateCobrancaResponseBody {
  status?: "PROCESSANDO" | "SUCESSO" | "FALHA";
  mensagem?: string;
  /** Identificador utilizado para consultar status da edição. */
  codigoEdicao?: string;
}

export interface UpdateCobrancaRequestBody {
  /**
   * Data de vencimento
   *
   * Formato aceito: YYYY-MM-DD
   *
   * Format: `date`
   */
  dataVencimento?: string;
  /**
   * Valor Nominal do título
   *
   * Range: 2.5..99999999.99
   */
  valorNominal?: number;
}

export interface GetStatusUpdateResponseBody {
  status?: "PROCESSANDO" | "SUCESSO" | "FALHA";
}

export interface RetryCallbacksRequestBody {
  /**
   * Lista de códigos identificadores das cobranças. Poderá ser enviado até 50 códigos para efetuar o reenvio.
   */
  codigoSolicitacao: string[];
}

export interface RetryCallbackResponse {
  /**
   * Lista dos códigos identificadores das cobranças em que o reenvio foi solicitado com sucesso.
   */
  foundIds?: string[];
}

/**
 * Query parameters for `GET /cobranca/v3/cobrancas`.
 * Recuperar coleção de cobranças
 */
export interface PesquisaCobrancaQuery {
  /**
   * Data de vencimento do título
   *
   * Formato aceito: YYYY-MM-DD
   *
   * Format: `date`
   */
  dataInicial: string;
  /**
   * Data de fim do filtro
   *
   * Formato aceito: YYYY-MM-DD
   *
   * Format: `date`
   */
  dataFinal: string;
  /** Default: `"VENCIMENTO"` */
  filtrarDataPor?: FiltrarDataPorEnum;
  /** Possíveis situações de uma cobranca. */
  situacao?: SituacaoCobrancaEnum;
  /** Filtro pelo nome do pagador */
  pessoaPagadora?: string;
  /**
   * Filtro pelo cpf/cnpj do pagador
   *
   * Length: 1..18
   */
  cpfCnpjPessoaPagadora?: string;
  /**
   * Filtro pelo código "seu número"
   *
   * Length: 0..15
   */
  seuNumero?: string;
  /** Tipos de cobranças existentes. */
  tipoCobranca?: TipoCobrancaEnum;
  /**
   * Quantidade máxima de registros retornados em cada página. Apenas a última página pode conter uma quantidade menor de registros.
   *
   * Format: `int32`
   * Range: -∞..1000
   * Default: `100`
   */
  "paginacao.itensPorPagina"?: number;
  /**
   * Página a ser retornada pela consulta. Se não for informada, assumirá que será 0.
   *
   * Format: `int32`
   * Default: `0`
   */
  "paginacao.paginaAtual"?: number;
  /** Default: `"PESSOA_PAGADORA"` */
  ordenarPor?: OrdenarCobrancasPorEnum;
  /** Default: `"ASC"` */
  tipoOrdenacao?: TipoOrdenacaoCobrancasEnum;
}

/**
 * Query parameters for `GET /cobranca/v3/cobrancas/sumario`.
 * Recuperar sumário de cobranças
 */
export interface ConsultarSumarioQuery {
  /**
   * Data de vencimento do título
   *
   * Formato aceito: YYYY-MM-DD
   *
   * Format: `date`
   */
  dataInicial: string;
  /**
   * Data de fim do filtro
   *
   * Formato aceito: YYYY-MM-DD
   *
   * Format: `date`
   */
  dataFinal: string;
  /** Default: `"VENCIMENTO"` */
  filtrarDataPor?: FiltrarDataPorEnum;
  /** Possíveis situações de uma cobranca. */
  situacao?: SituacaoCobrancaEnum;
  /** Tipos de cobranças existentes. */
  tipoCobranca?: TipoCobrancaEnum;
  /**
   * Filtro pelo código "seu número"
   *
   * Length: 0..15
   */
  seuNumero?: string;
  /** Filtro pelo nome do pagador */
  pessoaPagadora?: string;
  /**
   * Filtro pelo cpf/cnpj do pagador
   *
   * Length: 1..18
   */
  cpfCnpjPessoaPagadora?: string;
}

/**
 * Query parameters for `GET /cobranca/v3/cobrancas/webhook/callbacks`.
 * Consulta de callbacks enviados
 */
export interface CallbacksFilterQuery {
  /**
   * Formato aceito: yyyy-MM-dd'T'HH:mm[:ss][.SSS]XXX
   *
   * Format: `date-time`
   */
  dataHoraInicio: string;
  /**
   * Formato aceito: yyyy-MM-dd'T'HH:mm[:ss][.SSS]XXX
   *
   * Format: `date-time`
   */
  dataHoraFim: string;
  /**
   * Posição da página na lista de dados
   *
   * Default: `0`
   */
  pagina?: number;
  /**
   * Tamanho da página
   *
   * Range: 10..50
   * Default: `20`
   */
  tamanhoPagina?: number;
  /**
   * Codigo único da cobrança
   *
   * Format: `uuid`
   */
  codigoSolicitacao?: string;
}
