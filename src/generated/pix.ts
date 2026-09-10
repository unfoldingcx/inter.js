// ---------------------------------------------------------------------------
// API Pix
// Generated from specs/pix.json by scripts/generate.ts - do not edit.
// Base path: /pix/v2
// ---------------------------------------------------------------------------

/** Dados enviados para criação ou alteração da cobrança com vencimento via API Pix */
export type CobVSolicitadaLote = {
  /**
   * # Identificador da transação
   *
   * O campo txid determina o identificador da transação.
   * O objetivo desse campo é ser um elemento que possibilite ao PSP do recebedor apresentar ao usuário recebedor a funcionalidade de conciliação de pagamentos.
   *
   * O txid é criado exclusivamente pelo usuário recebedor e está sob sua responsabilidade.
   * O txid, no contexto de representação de uma cobrança, é único por CPF/CNPJ do usuário recebedor.
   *
   * Pattern: `[a-zA-Z0-9]{26,35}`
   */
  txid: TxId;
} & CobVSolicitada;

/** Status do registro da cobrança */
export type StatusCobVRevisada = "REMOVIDA_PELO_USUARIO_RECEBEDOR";

/**
 * Os campos aninhados sob o objeto devedor são opcionais e identificam a pessoa ou a instituição a quem a cobrança está endereçada. Não identifica, necessariamente, quem irá efetivamente realizar o pagamento.
 *
 * Não é permitido que o campo devedor.cpf e campo devedor.cnpj estejam preenchidos ao mesmo tempo. Se o campo devedor.nome está preenchido, então deve existir ou um devedor.cpf ou um campo devedor.cnpj preenchido.
 */
export type CobVDevedor = PessoaFisicaCobV | PessoaJuridicaCobV;

/** Data de Vencimento */
export interface CobVDataVencimento {
  /**
   * Trata-se de uma data, no formato `YYYY-MM-DD`, segundo ISO 8601. É a data de vencimento da cobrança. A cobrança pode ser honrada até esse dia, inclusive, em qualquer horário do dia.
   *
   * Format: `date`
   *
   * @example "2020-04-01"
   */
  dataDeVencimento: string;
  /**
   * Trata-se da quantidade de dias corridos após calendario.dataDeVencimento,
   * em que a cobrança poderá ser paga.
   *
   * Aplica-se este campo sobre o vencimento original da cobrança acrescentando-se o
   * número de dias corridos nos quais a cobrança ainda poderá ser paga, após vencida.
   * Este valor não se sobrepõe à possibilidade de pagamento em data posterior ao vencimento
   * original por [força de lei](http://www.planalto.gov.br/ccivil_03/LEIS/L7089.htm).
   * Nesse sentido, um vencimento determinado para um dia não útil deverá ser acatado
   * no primeiro dia útil subsequente mesmo que exceda o número de dias definido neste campo.
   *
   * Para ilustrar o funcionamento, seguem alguns exemplos:
   *
   * Exemplo A:
   *
   * ```txt
   * dataDeVencimento: 2020-10-20, terça-feira.
   * validadeAposVencimento: 4
   *
   * Tenta-se pagar no dia 2020-10-23, sexta: aceito.
   * Tenta-se pagar no dia 2020-10-24, sábado: aceito.
   * Tenta-se pagar no dia 2020-10-25, domingo: negado.
   * ```
   *
   * Exemplo B:
   *
   * ```txt
   * dataDeVencimento: 2020-12-25, sexta-feira, feriado.
   * validadeAposVencimento: 0
   *
   * Tenta-se pagar no dia 2020-12-25, sexta: aceito.
   * Tenta-se pagar no dia 2020-12-26, sábado: aceito.
   * Tenta-se pagar no dia 2020-12-27, domingo: aceito.
   * Tenta-se pagar no dia 2020-12-28, segunda: aceito.
   * Tenta-se pagar no dia 2020-12-29, terça: negado.
   * ```
   *
   * Exemplo C:
   *
   * ```txt
   * dataDeVencimento: 2020-12-25, sexta-feira, feriado.
   * validadeAposVencimento: 1
   *
   * Tenta-se pagar no dia 2020-12-25, sexta: aceito.
   * Tenta-se pagar no dia 2020-12-26, sábado: aceito.
   * Tenta-se pagar no dia 2020-12-27, domingo: aceito.
   * Tenta-se pagar no dia 2020-12-28, segunda: aceito.
   * Tenta-se pagar no dia 2020-12-29, terça: negado.
   * ```
   *
   * Exemplo D:
   *
   * ```txt
   * dataDeVencimento: 2020-12-25, sexta-feira, feriado.
   * validadeAposVencimento: 3
   *
   * Tenta-se pagar no dia 2020-12-25, sexta: aceito.
   * Tenta-se pagar no dia 2020-12-26, sábado: aceito.
   * Tenta-se pagar no dia 2020-12-27, domingo: aceito.
   * Tenta-se pagar no dia 2020-12-28, segunda: aceito.
   * Tenta-se pagar no dia 2020-12-29, terça: negado.
   * ```
   *
   * Exemplo E:
   *
   * ```txt
   * dataDeVencimento: 2020-12-25, sexta-feira, feriado.
   * validadeAposVencimento: 4
   *
   * Tenta-se pagar no dia 2020-12-25, sexta: aceito.
   * Tenta-se pagar no dia 2020-12-26, sábado: aceito.
   * Tenta-se pagar no dia 2020-12-27, domingo: aceito.
   * Tenta-se pagar no dia 2020-12-28, segunda: aceito.
   * Tenta-se pagar no dia 2020-12-29, terça: aceito.
   * Tenta-se pagar no dia 2020-12-30, quarta: negado.
   * ```
   *
   * Format: `int32`
   */
  validadeAposVencimento?: number;
}

/** Tipo da cobrança */
export type TipoLocationCobEnum = "cob" | "cobv";

export interface InfoAdicionaisItem {
  /**
   * Nome do campo.
   *
   * Length: 1..50
   */
  nome: string;
  /**
   * Dados do campo.
   *
   * Length: 1..200
   */
  valor: string;
}

/**
 * Os campos aninhados sob o objeto devedor são opcionais e identificam a pessoa ou a instituição a quem a cobrança está endereçada. Não identifica, necessariamente, quem irá efetivamente realizar o pagamento.
 *
 * Não é permitido que o campo devedor.cpf e campo devedor.cnpj estejam preenchidos ao mesmo tempo. Se o campo devedor.nome está preenchido, então deve existir ou um devedor.cpf ou um campo devedor.cnpj preenchido.
 */
export type CobDevedor = PessoaFisica | PessoaJuridica;

/** Expiração */
export interface CalendarioCobSolicitada {
  /**
   * Tempo de vida da cobrança, especificado em segundos a partir da data de criação (Calendario.criacao)
   *
   * Format: `int32`
   * Range: 1..∞
   * Default: `86400`
   *
   * @example 3600
   */
  expiracao?: number;
}

export type SituacaoCobranca = "EM_PROCESSAMENTO" | "CRIADA" | "NEGADA";

/** Sumário de um Lote de cobranças com vencimento */
export interface SummaryLoteCobV {
  /**
   * Data de criação do processamento
   *
   * Format: `date-time`
   */
  dataCriacaoProcessamento: string;
  /** Situação do processamento */
  statusProcessamento: string;
  /** Número de Pix Cobranças no lote */
  totalCobrancas: number;
  /** Número de Pix Cobranças com vencimento negados */
  totalCobrancasNegadas: number;
  /** Número de Pix Cobranças com vencimento criados */
  totalCobrancasCriadas: number;
}

/**
 * Filtra os registros cuja data de criação seja maior ou igual que a data de início. Respeita RFC 3339.
 */
export type Inicio = string;

/**
 * Filtra os registros cuja data de criação seja menor ou igual que a data de fim. Respeita RFC 3339.
 */
export type Fim = string;

/** OpenAPI schema: `summary` */
export interface Summary {
  recebidos?: QuantidadeValor;
  previstos?: QuantidadeValor;
  baixados?: QuantidadeValor;
  expirados?: QuantidadeValor;
}

/** OpenAPI schema: `quantidadeValor` */
export interface QuantidadeValor {
  /**
   * quantidade
   *
   * @example 1
   */
  quantidade?: number;
  /**
   * valor
   *
   * @example 1.5
   */
  valor?: number;
}

/**
 * # Identificador da transação
 *
 * O campo txid determina o identificador da transação.
 * O objetivo desse campo é ser um elemento que possibilite ao PSP do recebedor apresentar ao usuário recebedor a funcionalidade de conciliação de pagamentos.
 *
 * O txid é criado exclusivamente pelo usuário recebedor e está sob sua responsabilidade.
 * O txid, no contexto de representação de uma cobrança, é único por CPF/CNPJ do usuário recebedor.
 */
export type TxId = string;

/** Id único para identificação do Pix Cobrança. */
export type EndToEndId = string;

/** Id gerado pelo cliente para representar unicamente uma devolução. */
export type DevolucaoId = string;

/** valores monetários referentes à cobrança. */
export interface CobValorRevisada {
  /**
   * Valor original da cobrança.
   *
   * Pattern: `\d{1,10}\.\d{2}`
   */
  original?: string;
  /**
   * Trata-se de um campo que determina se o valor final do documento pode ser alterado pelo pagador.
   * Na ausência desse campo, assume-se que não se pode alterar o valor do documento de cobrança, ou seja, assume-se o valor 0. Se o campo estiver presente e com valor 1, então está determinado que o valor final da cobrança pode ter seu valor alterado pelo pagador.
   *
   * Format: `int32`
   * Range: 0..1
   * Default: `0`
   */
  modalidadeAlteracao?: number;
  /**
   * É uma estrutura opcional relacionada ao conceito de recebimento de numerário. Apenas um agrupamento por vez é permitido, quando há `saque` não há `troco` e vice-versa.
   *
   * Quando uma cobrança imediata tem uma estrutura de `retirada` ela deixa de ser considerada Pix comum e passa à categoria de Pix Saque ou Pix Troco.
   *
   * Para que o preenchimento do objeto `retirada` seja considerado válido as seguintes regras se aplicam:
   * - os campos `modalidadeAgente` e `prestadorDoServicoDeSaque` são de **preenchimento obrigatório**;
   * - quando o `saque` estiver presente a cobrança deve respeitar as seguintes condições:
   * - O campo `valor.original` deve ser preenchido com **valor igual a 0.00 (zero)**;
   * - O campo `valor.modalidadeAlteracao` deve possuir o valor 0 (zero) explicitamente, ou implicitamente (pelo não preenchimento).
   * - quando o `troco` estiver presente a cobrança deve respeitar as seguintes condições:
   * - O campo `valor.original` deve ser preenchido com **valor maior que 0.00 (zero)**;
   * - O campo `valor.modalidadeAlteracao` deve possuir o valor 0 (zero) explicitamente, ou implicitamente (pelo não preenchimento).
   *
   * **IMPORTANTE**: Quando usados o `saque` ou `troco` não será permitida a alteração do `valor.original` recebido. Na presença de `saque` ou `troco` o recebimento do campo `valor.modalidadeAlteracao` com valor 1 (um) é considerado erro.
   */
  retirada?: Retirada;
}

/** valores monetários referentes à cobrança. */
export interface CobValor {
  /**
   * Valor original da cobrança.
   *
   * Pattern: `\d{1,10}\.\d{2}`
   */
  original: string;
  /**
   * Trata-se de um campo que determina se o valor final do documento
   * pode ser alterado pelo pagador.
   *
   * Na ausência desse campo, assume-se que não se pode alterar o valor do documento de cobrança, ou seja, assume-se o valor 0. Se o campo estiver presente e com valor 1, então está determinado que o valor final da cobrança pode ter seu valor alterado pelo pagador.
   *
   * Format: `int32`
   * Range: 0..1
   * Default: `0`
   */
  modalidadeAlteracao?: number;
  /**
   * É uma estrutura opcional relacionada ao conceito de recebimento de numerário. Apenas um agrupamento por vez é permitido, quando há `saque` não há `troco` e vice-versa.
   *
   * Quando uma cobrança imediata tem uma estrutura de `retirada` ela deixa de ser considerada Pix comum e passa à categoria de Pix Saque ou Pix Troco.
   *
   * Para que o preenchimento do objeto `retirada` seja considerado válido as seguintes regras se aplicam:
   * - os campos `modalidadeAgente` e `prestadorDoServicoDeSaque` são de **preenchimento obrigatório**;
   * - quando o `saque` estiver presente a cobrança deve respeitar as seguintes condições:
   * - O campo `valor.original` deve ser preenchido com **valor igual a 0.00 (zero)**;
   * - O campo `valor.modalidadeAlteracao` deve possuir o valor 0 (zero) explicitamente, ou implicitamente (pelo não preenchimento).
   * - quando o `troco` estiver presente a cobrança deve respeitar as seguintes condições:
   * - O campo `valor.original` deve ser preenchido com **valor maior que 0.00 (zero)**;
   * - O campo `valor.modalidadeAlteracao` deve possuir o valor 0 (zero) explicitamente, ou implicitamente (pelo não preenchimento).
   *
   * **IMPORTANTE**: Quando usados o `saque` ou `troco` não será permitida a alteração do `valor.original` recebido. Na presença de `saque` ou `troco` o recebimento do campo `valor.modalidadeAlteracao` com valor 1 (um) é considerado erro.
   */
  retirada?: Retirada;
}

/** Identificador da location a ser informada na criação da cobrança . */
export type PayloadLocationId = number;

/**
 * # O campo `revisao`
 *
 * Denota a revisão da cobrança. Sempre começa em zero. Sempre varia em acréscimos de 1.
 *
 * O incremento em uma cobrança deve ocorrer sempre que um objeto da cobrança em questão for alterado.
 * O campo `loc` é uma exceção a esta regra.
 *
 * Se em uma determinada alteração em uma cobrança, o único campo alterado for o campo `loc`,
 * então esta operação não incrementa a revisão da cobrança.
 *
 * O campo `loc` não ocasiona uma alteração na cobrança em si.
 * Não é necessário armazenar histórico das alterações do campo `loc` para uma determinada cobrança.
 * Para os outros campos da cobrança, registra-se histórico.
 */
export type Revisao = number;

export interface DescontoDataFixa {
  /** Descontos absolutos aplicados à cobrança. */
  descontoDataFixa?: Array<{
    /**
     * Descontos por pagamento antecipado, com data fixa. Matriz com até três elementos, sendo que cada elemento é composto por um par "data e valorPerc", para estabelecer descontos percentuais ou absolutos, até aquela data de pagamento. Trata-se de uma data, no formato `YYYY-MM-DD`, segundo ISO 8601. A data de desconto obrigatoriamente deverá ser menor que a data de vencimento da cobrança.
     *
     * @example "2020-04-01"
     */
    data?: string;
    /**
     * Desconto em valor absoluto ou percentual por dia, útil ou corrido, conforme valor.desconto.modalidade
     *
     * Pattern: `\d{1,10}\.\d{2}`
     */
    valorPerc?: string;
  }>;
}

export interface ValorPerc {
  /**
   * Abatimentos ou outras deduções aplicadas ao documento, em valor absoluto ou percentual do valor original do documento.
   *
   * Pattern: `\d{1,10}\.\d{2}`
   */
  valorPerc: string;
}

/**
 * É uma estrutura opcional relacionada ao conceito de recebimento de numerário. Apenas um agrupamento por vez é permitido, quando há `saque` não há `troco` e vice-versa.
 *
 * Quando uma cobrança imediata tem uma estrutura de `retirada` ela deixa de ser considerada Pix comum e passa à categoria de Pix Saque ou Pix Troco.
 *
 * Para que o preenchimento do objeto `retirada` seja considerado válido as seguintes regras se aplicam:
 * - os campos `modalidadeAgente` e `prestadorDoServicoDeSaque` são de **preenchimento obrigatório**;
 * - quando o `saque` estiver presente a cobrança deve respeitar as seguintes condições:
 * - O campo `valor.original` deve ser preenchido com **valor igual a 0.00 (zero)**;
 * - O campo `valor.modalidadeAlteracao` deve possuir o valor 0 (zero) explicitamente, ou implicitamente (pelo não preenchimento).
 * - quando o `troco` estiver presente a cobrança deve respeitar as seguintes condições:
 * - O campo `valor.original` deve ser preenchido com **valor maior que 0.00 (zero)**;
 * - O campo `valor.modalidadeAlteracao` deve possuir o valor 0 (zero) explicitamente, ou implicitamente (pelo não preenchimento).
 *
 * **IMPORTANTE**: Quando usados o `saque` ou `troco` não será permitida a alteração do `valor.original` recebido. Na presença de `saque` ou `troco` o recebimento do campo `valor.modalidadeAlteracao` com valor 1 (um) é considerado erro.
 */
export interface Retirada {
  /** Informações relacionadas ao saque */
  saque?: Saque;
  /** Informações relacionadas ao troco */
  troco?: Troco;
}

/** Informações relacionadas ao saque */
export interface Saque {
  /**
   * Valor do saque efetuado
   *
   * Pattern: `\d{1,10}\.\d{2}`
   */
  valor: string;
  /**
   * Modalidade de alteração de valor do saque. Quando não preenchido o valor assumido é o 0 (zero).
   *
   * Format: `int32`
   * Range: 0..1
   * Default: `0`
   */
  modalidadeAlteracao?: number;
  /**
   * ##### Modalidade do Agente SIGLA | Descrição
   * AGTEC | Agente Estabelecimento Comercial
   * AGTOT | Agente Outra Espécie de Pessoa Jurídica ou Correspondente no País
   * AGPSS | Agente Facilitador de Serviço de Saque
   * O campo modalidadeAgente permite as seguintes modalidades:
   * * `AGTEC` - Agente Estabelecimento Comercial.
   * * `AGTOT` - Agente Outra Espécie de Pessoa Jurídica ou Correspondente no País.
   * * `AGPSS` - Agente Facilitador de Serviço de Saque.
   */
  modalidadeAgente: string;
  /** ISPB do Facilitador de Serviço de Saque */
  prestadorDoServicoDeSaque: string;
}

/** Informações relacionadas ao troco */
export interface Troco {
  /**
   * Valor do troco efetuado
   *
   * Pattern: `\d{1,10}\.\d{2}`
   */
  valor: string;
  /**
   * Modalidade de alteração de valor do troco. Quando não preenchido o valor assumido é o 0 (zero).
   *
   * Format: `int32`
   * Range: 0..1
   * Default: `0`
   */
  modalidadeAlteracao?: number;
  /**
   * ##### Modalidade do Agente SIGLA | Descrição
   * AGTEC | Agente Estabelecimento Comercial
   * AGTOT | Agente Outra Espécie de Pessoa Jurídica ou Correspondente no País
   * AGPSS | Agente Facilitador de Serviço de Saque
   * O campo modalidadeAgente permite as seguintes modalidades:
   * * `AGTEC` - Agente Estabelecimento Comercial.
   * * `AGTOT` - Agente Outra Espécie de Pessoa Jurídica ou Correspondente no País.
   */
  modalidadeAgente: string;
  /** ISPB do Facilitador de Serviço de Saque */
  prestadorDoServicoDeSaque: string;
}

/** Pessoa Física */
export interface PessoaFisica {
  /**
   * Nome do usuário.
   *
   * Length: 0..200
   */
  nome: string;
  /**
   * CPF do usuário.
   *
   * Pattern: `\d{11}`
   */
  cpf: string;
}

/** Pessoa Física */
export interface PessoaFisicaCobV {
  /**
   * Nome do usuário.
   *
   * Length: 0..200
   */
  nome: string;
  /**
   * CPF do usuário.
   *
   * Pattern: `\d{11}`
   */
  cpf: string;
  /** Email do usuário. */
  email?: string;
  /**
   * Logradouro do usuário.
   *
   * Length: 0..200
   */
  logradouro?: string;
  /**
   * Cidade do usuário.
   *
   * Length: 0..200
   */
  cidade?: string;
  /**
   * UF do usuário.
   *
   * Length: 0..2
   */
  uf?: string;
  /**
   * CEP do usuário.
   *
   * Pattern: `[0-9]{1,8}`
   */
  cep?: string;
}

/** Pessoa Jurídica */
export interface PessoaJuridica {
  /**
   * Nome do usuário.
   *
   * Length: 0..200
   */
  nome: string;
  /**
   * CNPJ do usuário.
   *
   * Pattern: `\d{14}`
   */
  cnpj: string;
}

/** Pessoa Jurídica */
export interface PessoaJuridicaCobV {
  /**
   * Nome do usuário.
   *
   * Length: 0..200
   */
  nome: string;
  /**
   * CNPJ do usuário.
   *
   * Pattern: `\d{14}`
   */
  cnpj: string;
  /** Email do usuário. */
  email?: string;
  /**
   * Logradouro do usuário.
   *
   * Length: 0..200
   */
  logradouro?: string;
  /**
   * Cidade do usuário.
   *
   * Length: 0..200
   */
  cidade?: string;
  /**
   * UF do usuário.
   *
   * Length: 0..2
   */
  uf?: string;
  /**
   * CEP do usuário.
   *
   * Pattern: `[0-9]{1,8}`
   */
  cep?: string;
}

export interface DadosComplementaresPessoa {
  /**
   * Logradouro do usuário.
   *
   * Length: 0..200
   */
  logradouro?: string;
  /**
   * Cidade do usuário.
   *
   * Length: 0..200
   */
  cidade?: string;
  /**
   * UF do usuário.
   *
   * Length: 0..2
   */
  uf?: string;
  /**
   * CEP do usuário.
   *
   * Length: 0..8
   */
  cep?: string;
}

export interface DadosDevedor {
  /**
   * Não é permitido que o campo devedor.cpf e campo devedor.cnpj estejam preenchidos ao mesmo tempo. Se o campo devedor.nome está preenchido, então deve existir ou um devedor.cpf ou um campo devedor.cnpj preenchido.
   *
   * Os campos aninhados sob o objeto devedor são opcionais e identificam a pessoa ou a instituição a quem a cobrança está endereçada. Não identifica, necessariamente, quem irá efetivamente realizar o pagamento.
   */
  devedor?: PessoaFisica | PessoaJuridica;
}

/** Dados do recebedor */
export interface DevedorPixEntity {
  /** CPF ou CNPJ do devedor. */
  cpfOrCnpj?: string;
  /** nome do devedor. */
  nome?: string;
  /** UF do devedor. */
  uf?: string;
  /** CEP do devedor. */
  cep?: string;
  /** Logradouro do devedor. */
  logradouro?: string;
  /** Cidade do devedor. */
  cidade?: string;
  /** Email do devedor. */
  email?: string;
}

export interface DadosRecebedor {
  /** O objeto recebedor organiza as informações sobre o credor da cobrança. */
  recebedor?: PessoaFisica | PessoaJuridica | PessoaJuridica & {
    /**
     * Nome fantasia.
     *
     * Length: 0..200
     */
    nomeFantasia?: string;
  };
}

/** Webhook */
export interface WebhookSolicitado {
  /**
   * URL de configuração do webhook. Deve iniciar obrigatoriamente com **https://**
   *
   * Format: `uri`
   * Pattern: `^https://[^\s]*$`
   *
   * @example "https://pix.example.com/api/webhook/"
   */
  webhookUrl: string;
}

/** Webhook */
export interface WebhookCompleto {
  /**
   * Format: `uri`
   *
   * @example "https://pix.example.com/api/webhook/"
   */
  webhookUrl: string;
  /**
   * # Formato do campo chave
   *
   * * O campo chave determina a chave Pix registrada no DICT que será utilizada para a cobrança. Essa chave será lida pelo aplicativo do PSP do pagador para consulta ao DICT, que retornará a informação que identificará o recebedor da cobrança.
   * * Os tipos de chave podem ser: telefone, e-mail, cpf/cnpj ou EVP.
   * * O formato das chaves pode ser encontrado na seção "Formatação das chaves do DICT no BR Code" do [Manual de Padrões para iniciação do Pix](https://www.bcb.gov.br/estabilidadefinanceira/pagamentosinstantaneos).
   *
   * Length: 0..77
   */
  chave: string;
  /**
   * Data e hora em que o webhook foi cadastrado. Respeita RFC 3339.
   *
   * Format: `date-time`
   * Read-only: returned by the API, never sent.
   */
  criacao: string;
}

/** Expiração */
export interface CobExpiracao {
  /**
   * Tempo de vida da cobrança, especificado em segundos a partir da data de criação (Calendario.criacao)
   *
   * Format: `int32`
   * Range: 1..∞
   * Default: `"86400"`
   *
   * @example "3600"
   */
  expiracao?: number;
}

/** Data de Vencimento */
export interface CobDataDeVencimento {
  /**
   * Trata-se de uma data, no formato `YYYY-MM-DD`, segundo ISO 8601. É a data de vencimento da cobrança. A cobrança pode ser honrada até esse dia, inclusive, em qualquer horário do dia.
   *
   * @example "2020-04-01"
   */
  dataDeVencimento?: string;
  /**
   * Trata-se da quantidade de dias corridos após calendario.dataDeVencimento,
   * em que a cobrança poderá ser paga.
   *
   * Aplica-se este campo sobre o vencimento original da cobrança acrescentando-se o
   * número de dias corridos nos quais a cobrança ainda poderá ser paga, após vencida.
   * Este valor não se sobrepõe à possibilidade de pagamento em data posterior ao vencimento
   * original por [força de lei](http://www.planalto.gov.br/ccivil_03/LEIS/L7089.htm).
   * Nesse sentido, um vencimento determinado para um dia não útil deverá ser acatado
   * no primeiro dia útil subsequente mesmo que exceda o número de dias definido neste campo.
   *
   * Para ilustrar o funcionamento, seguem alguns exemplos:
   *
   * Exemplo A:
   *
   * ```txt
   * dataDeVencimento: 2020-10-20, terça-feira.
   * validadeAposVencimento: 4
   *
   * Tenta-se pagar no dia 2020-10-23, sexta: aceito.
   * Tenta-se pagar no dia 2020-10-24, sábado: aceito.
   * Tenta-se pagar no dia 2020-10-25, domingo: negado.
   * ```
   *
   * Exemplo B:
   *
   * ```txt
   * dataDeVencimento: 2020-12-25, sexta-feira, feriado.
   * validadeAposVencimento: 0
   *
   * Tenta-se pagar no dia 2020-12-25, sexta: aceito.
   * Tenta-se pagar no dia 2020-12-26, sábado: aceito.
   * Tenta-se pagar no dia 2020-12-27, domingo: aceito.
   * Tenta-se pagar no dia 2020-12-28, segunda: aceito.
   * Tenta-se pagar no dia 2020-12-29, terça: negado.
   * ```
   *
   * Exemplo C:
   *
   * ```txt
   * dataDeVencimento: 2020-12-25, sexta-feira, feriado.
   * validadeAposVencimento: 1
   *
   * Tenta-se pagar no dia 2020-12-25, sexta: aceito.
   * Tenta-se pagar no dia 2020-12-26, sábado: aceito.
   * Tenta-se pagar no dia 2020-12-27, domingo: aceito.
   * Tenta-se pagar no dia 2020-12-28, segunda: aceito.
   * Tenta-se pagar no dia 2020-12-29, terça: negado.
   * ```
   *
   * Exemplo D:
   *
   * ```txt
   * dataDeVencimento: 2020-12-25, sexta-feira, feriado.
   * validadeAposVencimento: 3
   *
   * Tenta-se pagar no dia 2020-12-25, sexta: aceito.
   * Tenta-se pagar no dia 2020-12-26, sábado: aceito.
   * Tenta-se pagar no dia 2020-12-27, domingo: aceito.
   * Tenta-se pagar no dia 2020-12-28, segunda: aceito.
   * Tenta-se pagar no dia 2020-12-29, terça: negado.
   * ```
   *
   * Exemplo E:
   *
   * ```txt
   * dataDeVencimento: 2020-12-25, sexta-feira, feriado.
   * validadeAposVencimento: 4
   *
   * Tenta-se pagar no dia 2020-12-25, sexta: aceito.
   * Tenta-se pagar no dia 2020-12-26, sábado: aceito.
   * Tenta-se pagar no dia 2020-12-27, domingo: aceito.
   * Tenta-se pagar no dia 2020-12-28, segunda: aceito.
   * Tenta-se pagar no dia 2020-12-29, terça: aceito.
   * Tenta-se pagar no dia 2020-12-30, quarta: negado.
   * ```
   *
   * Format: `int32`
   * Default: `30`
   */
  validadeAposVencimento?: number;
}

/** Apresentação */
export interface CobApresentacao {
  /**
   * Timestamp que indica o momento em que o payload JSON que representa a cobrança foi recuperado. Ou seja, idealmente, é o momento em que o usuário realizou a captura do QR Code para verificar os dados de pagamento. Respeita o formato definido na RFC 3339.
   *
   * Format: `date-time`
   */
  apresentacao: string;
}

/** Criação */
export interface CobCriacao {
  /**
   * Timestamp que indica o momento em que foi criada a cobrança. Respeita o formato definido na RFC 3339.
   *
   * Format: `date-time`
   */
  criacao: string;
}

/** Valores monetários. */
export interface CobVValor {
  /** Valor original da cobrança. */
  original?: string;
  /** Multa aplicada à cobrança */
  multa?: {
    /**
     * ##### Modalidade da multa, conforme tabela de domínios.
     * Descrição | Domínio
     * Valor Fixo | 1
     * Percentual | 2
     *
     * Format: `int32`
     * Range: 1..2
     */
    modalidade?: number;
    /**
     * Multa do documento em valor absoluto ou percentual, conforme "valor.multa.modalidade".
     *
     * Pattern: `\d{1,10}\.\d{2}`
     */
    valorPerc?: string;
  };
  /** Juro aplicado à cobrança */
  juros?: {
    /**
     * ##### Modalidade de juros, conforme tabela de domínios.
     * Descrição | Domínio
     * Valor (dias corridos) | 1
     * Percentual ao dia (dias corridos) | 2
     * Percentual ao mês (dias corridos) | 3
     * Percentual ao ano (dias corridos) | 4
     * Valor (dias úteis) | 5
     * Percentual ao dia (dias úteis) | 6
     * Percentual ao mês (dias úteis) | 7
     * Percentual ao ano (dias úteis) | 8
     *
     * Format: `int32`
     * Range: 1..8
     */
    modalidade?: number;
    /**
     * Valor
     *
     * Pattern: `\d{1,10}\.\d{2}`
     */
    valorPerc?: string;
  };
  /** Abatimento aplicado à cobrança */
  abatimento?: {
    /**
     * ##### Modalidade de abatimentos, conforme tabela de domínios.
     * Descrição | Domínio
     * Valor Fixo | 1
     * Percentual | 2
     *
     * Format: `int32`
     * Range: 1..2
     */
    modalidade: number;
    /**
     * Abatimentos ou outras deduções aplicadas ao documento, em valor absoluto ou percentual do valor original do documento.
     *
     * Pattern: `\d{1,10}\.\d{2}`
     */
    valorPerc: string;
  };
  /** Descontos aplicados à cobrança */
  desconto?: ValorPerc | DescontoDataFixa;
}

/** Valores monetários. */
export interface ValorPixEntity {
  /** Valor original da cobrança. */
  valorOriginal?: string;
  /** Multa aplicada à cobrança */
  multa?: {
    /**
     * Modalidade da multa
     *
     * Format: `int32`
     */
    modalidade?: number;
    /** Multa do documento em valor absoluto ou percentual, conforme "valor.multa.modalidade". */
    valorPerc?: string;
  };
  /** Juro aplicado à cobrança */
  juros?: {
    /**
     * ##### Modalidade de juros, conforme tabela de domínios.
     * Descrição | Domínio
     * Valor (dias corridos) | 1
     * Percentual ao dia (dias corridos) | 2
     * Percentual ao mês (dias corridos) | 3
     * Percentual ao ano (dias corridos) | 4
     * Valor (dias úteis) | 5
     * Percentual ao dia (dias úteis) | 6
     * Percentual ao mês (dias úteis) | 7
     * Percentual ao ano (dias úteis) | 8
     *
     * Format: `int32`
     * Range: 1..8
     */
    modalidade?: number;
    /** Valor */
    valorPerc?: string;
  };
  /** Abatimento aplicado à cobrança */
  abatimento?: {
    /**
     * ##### Modalidade de abatimentos, conforme tabela de domínios.
     * Descrição | Domínio
     * Valor Fixo | 1
     * Percentual | 2
     *
     * Format: `int32`
     */
    modalidade?: number;
    /**
     * Abatimentos ou outras deduções aplicadas ao documento, em valor absoluto ou percentual do valor original do documento.
     */
    valorPerc?: string;
  };
  /** Descontodds aplicados à cobrança */
  desconto?: ValorPerc | DescontoDataFixa;
}

/**
 * Todos os campos que indicam valores monetários obedecem ao pattern \d{1,10}\.\d{2}. O separador decimal é o caractere ponto. Não é aplicável utilizar separador de milhar. Exemplos de valores aderentes ao padrão: 1.00, 123.99, 123456789.23"
 */
export interface CobPayloadValor {
  /** Valor original da cobrança. */
  original?: string;
  /**
   * Trata-se de um campo que determina se o valor final do documento pode ser alterado pelo pagador. Na ausência desse campo, assume-se que não se pode alterar o valor do documento de cobrança, ou seja, assume-se o valor 0. Se o campo estiver presente e com valor 1, então está determinado que o valor final da cobrança pode ter seu valor alterado pelo pagador.
   *
   * Format: `int32`
   * Range: 0..1
   */
  modalidadeAlteracao?: number;
  /**
   * É uma estrutura opcional relacionada ao conceito de recebimento de numerário. Apenas um agrupamento por vez é permitido, quando há `saque` não há `troco` e vice-versa.
   *
   * Quando uma cobrança imediata tem uma estrutura de `retirada` ela deixa de ser considerada Pix comum e passa à categoria de Pix Saque ou Pix Troco.
   *
   * Para que o preenchimento do objeto `retirada` seja considerado válido as seguintes regras se aplicam:
   * - os campos `modalidadeAgente` e `prestadorDoServicoDeSaque` são de **preenchimento obrigatório**;
   * - quando o `saque` estiver presente a cobrança deve respeitar as seguintes condições:
   * - O campo `valor.original` deve ser preenchido com **valor igual a 0.00 (zero)**;
   * - O campo `valor.modalidadeAlteracao` deve possuir o valor 0 (zero) explicitamente, ou implicitamente (pelo não preenchimento).
   * - quando o `troco` estiver presente a cobrança deve respeitar as seguintes condições:
   * - O campo `valor.original` deve ser preenchido com **valor maior que 0.00 (zero)**;
   * - O campo `valor.modalidadeAlteracao` deve possuir o valor 0 (zero) explicitamente, ou implicitamente (pelo não preenchimento).
   *
   * **IMPORTANTE**: Quando usados o `saque` ou `troco` não será permitida a alteração do `valor.original` recebido. Na presença de `saque` ou `troco` o recebimento do campo `valor.modalidadeAlteracao` com valor 1 (um) é considerado erro.
   *
   * #### Exemplos válidos:
   * Considerando os campos da estrutura `valor` e o predicado 'presente' cujo resultado é verdade quando a estrutura apontada é encontrada temos:
   * - **uma cobrança com valor fixo** (condições: valor.original > 0 && valor.modalidadeAlteração = 0 && !presente(valor.retirada))
   * ```
   * ...
   * "valor": {
   * "original": "10.00"
   * },
   * ...
   * ```
   * - **uma cobrança com valor alterável** (condições: valor.original >= 0.00 && modalidadeAlteração = 1 && !presente(valor.retirada))
   * ```
   * ...
   * "valor": {
   * "original": "10.00",
   * "modalidadeAlteracao": 1
   * },
   * ```
   * - **saque com valor fixo** (condições: valor.original = 0.00 && valor.modalidadeAlteração = 0 && presente(valor.retirada.saque) && valor.retirada.saque.valor > 0 && valor.retirada.saque.modalidadeAlteracao = 0)
   * ```
   * ...
   * "valor": {
   * "original": "0.00",
   * "retirada": {
   * "saque": {
   * "valor": "5.00",
   * "modalidadeAgente": "AGPSS",
   * "prestadorDoServicoDeSaque": "12345678"
   * }
   * }
   * },
   * ...
   * ```
   * - **saque com valor alterável** (condições: valor.original = 0.00 && valor.modalidadeAlteração = 0 && presente(valor.retirada.saque) && valor.retirada.saque.valor >= 0 && valor.retirada.saque.modalidadeAlteracao = 1)
   * ```
   * ...
   * "valor": {
   * "original": "0.00",
   * "retirada": {
   * "saque": {
   * "valor": "5.00",
   * "modalidadeAlteracao": 1,
   * "modalidadeAgente": "AGPSS",
   * "prestadorDoServicoDeSaque": "12345678"
   * }
   * }
   * },
   * ...
   * ```
   * - **cobrança com troco fixo** (condições: valor.original > 0.00 && valor.modalidadeAlteração = 0 && presente(valor.retirada.troco) && valor.retirada.troco.valor > 0 && valor.retirada.troco.modalidadeAlteracao = 0)
   * ```
   * ...
   * "valor": {
   * "original": "10.00",
   * "retirada": {
   * "troco": {
   * "valor": "5.00",
   * "modalidadeAgente": "AGTEC",
   * "prestadorDoServicoDeSaque": "12345678"
   * }
   * }
   * },
   * ...
   * ```
   * - **cobrança com troco alterável** (condições: valor.original > 0.00 && valor.modalidadeAlteração = 0 && presente(valor.retirada.troco) && valor.retirada.troco.valor >= 0 && valor.retirada.troco.modalidadeAlteracao = 1)
   * ```
   * ...
   * "valor": {
   * "original": "10.00",
   * "retirada": {
   * "troco": {
   * "valor": "0.00",
   * "modalidadeAlteracao": 1,
   * "modalidadeAgente": "AGTEC",
   * "prestadorDoServicoDeSaque": "12345678"
   * }
   * }
   * },
   * ...
   * ```
   * #### Exemplos inválidos:
   * Abaixo alguns exemplos que **não são válidos**. Convém observar que esta listagem não tem pretensão de ser completa, sendo tão somente uma referência para alguns erros possíveis.
   * - **saque sem `modalidadeAgente` e `prestadorDoServicoDeSaque`**
   * ```
   * ...
   * "valor": {
   * "original": "0.00",
   * "retirada": {
   * "saque": {
   * "valor": "5.00"
   * }
   * }
   * },
   * ...
   * ```
   * - **cobrança com saque e troco juntos** (não pode ter os dois ao mesmo tempo)
   * ```
   * ...
   * "valor": {
   * "original": "100.00",
   * "retirada": {
   * "saque": {
   * "valor": "50.00",
   * "modalidadeAgente": "AGPSS",
   * "prestadorDoServicoDeSaque": "12345678"
   * },
   * "troco": {
   * "valor": "30.00",
   * "modalidadeAgente": "AGTEC",
   * "prestadorDoServicoDeSaque": "12345678"
   * }
   * }
   * },
   * ...
   * ```
   * - **saque com valor.original maior que 0.00 (zero)** (saque requer valor.original = 0.00)
   * ```
   * ...
   * "valor": {
   * "original": "10.00",
   * "retirada": {
   * "saque": {
   * "valor": "5.00",
   * "modalidadeAgente": "AGPSS",
   * "prestadorDoServicoDeSaque": "12345678"
   * }
   * }
   * },
   * ...
   * ```
   * - **troco com valor.original igual a 0.00 (zero)** (para haver troco tem que haver valor.original > 0.00)
   * ```
   * ...
   * "valor": {
   * "original": "0.00",
   * "retirada": {
   * "troco": {
   * "valor": "5.00",
   * "modalidadeAgente": "AGTEC",
   * "prestadorDoServicoDeSaque": "12345678"
   * }
   * }
   * },
   * ...
   * ```
   * - **saque com valor.original alterável** (não se pode alterar o valor.original na presença do saque)
   * ```
   * ...
   * "valor": {
   * "original": "0.00",
   * "modalidadeAlteracao": 1,
   * "retirada": {
   * "saque": {
   * "valor": "5.00",
   * "modalidadeAlteracao": 1,
   * "modalidadeAgente": "AGPSS",
   * "prestadorDoServicoDeSaque": "12345678"
   * }
   * }
   * },
   * ...
   * ```
   * - **troco com valor.original alterável** (não se pode alterar o valor.original na presença do troco)
   * ```
   * ...
   * "valor": {
   * "original": "0.01",
   * "modalidadeAlteracao": 1,
   * "retirada": {
   * "troco": {
   * "valor": "5.00",
   * "modalidadeAlteracao": 1,
   * "modalidadeAgente": "AGTOT",
   * "prestadorDoServicoDeSaque": "12345678"
   * }
   * }
   * },
   * ...
   * ```
   */
  retirada?: {
    /** Informações relacionadas ao saque */
    saque?: Saque;
    /** Informações relacionadas ao troco */
    troco?: Troco;
  };
}

/**
 * Todos os campos que indicam valores monetários obedecem ao formato do ID 54 da especificação EMV/BR Code para QR Codes. O separador decimal é o caractere ponto. Não é aplicável utilizar separador de milhar. Exemplos de valores aderentes ao padrão: 1.00, 123.99, 123456789.23
 */
export interface CobVPayloadValor {
  /** Valor original da cobrança. */
  original?: string;
  /** Multa aplicada à cobrança */
  multa?: string;
  /** Juro aplicado à cobrança */
  juros?: string;
  /** Abatimento aplicado à cobrança */
  abatimento?: string;
  /** Descontos aplicados à cobrança */
  desconto?: string;
  /** Valor final da cobrança. */
  final: string;
}

/** Atributos comuns a todas entidades de Cobrança */
export interface CobBase {
  /**
   * * O campo chave determina a chave Pix do recebedor que será utilizada para a cobrança.
   * * Os tipos de chave podem ser: telefone, e-mail, cpf/cnpj ou EVP.
   * * O formato das chaves pode ser encontrado na seção "Formatação das chaves do DICT no BR Code" do [Manual de Padrões para iniciação do Pix](https://www.bcb.gov.br/estabilidadefinanceira/pagamentosinstantaneos).
   *
   * Length: 1..77
   */
  chave?: string;
  /**
   * O campo solicitacaoPagador determina um texto a ser apresentado ao pagador para que ele possa digitar uma informação correlata, em formato livre, a ser enviada ao recebedor. Esse texto está limitado a 140 caracteres.
   *
   * Length: 1..140
   */
  solicitacaoPagador?: string;
  /**
   * Cada respectiva informação adicional contida na lista (nome e valor) deve ser apresentada ao pagador.
   *
   * Range: -∞..50
   */
  infoAdicionais?: Array<{
    /**
     * Nome do campo.
     *
     * Length: 1..50
     */
    nome: string;
    /**
     * Dados do campo.
     *
     * Length: 1..200
     */
    valor: string;
  }>;
}

/** Atributos comuns a todas entidades de Cobrança que possuem informação de Copia e Cola */
export type CobBaseCopiaCola = {
  /**
   * Este campo retorna o valor do Pix Copia e Cola correspondente à cobrança. Trata-se da sequência de caracteres que representa o BR Code.
   *
   * Length: 0..512
   */
  pixCopiaECola?: string;
} & CobBase;

/** Dados enviados para criação ou alteração da cobrança imediata via API Pix */
export interface CobSolicitada {
  /** Expiração */
  calendario: CalendarioCobSolicitada;
  /**
   * Os campos aninhados sob o objeto devedor são opcionais e identificam a pessoa ou a instituição a quem a cobrança está endereçada. Não identifica, necessariamente, quem irá efetivamente realizar o pagamento.
   *
   * Não é permitido que o campo devedor.cpf e campo devedor.cnpj estejam preenchidos ao mesmo tempo. Se o campo devedor.nome está preenchido, então deve existir ou um devedor.cpf ou um campo devedor.cnpj preenchido.
   */
  devedor?: CobDevedor;
  /** Identificador da localização do payload. */
  loc?: PayloadLocationCob;
  /** valores monetários referentes à cobrança. */
  valor: CobValor;
  /**
   * # Formato do campo chave
   *
   * * O campo chave determina a chave Pix registrada no DICT que será utilizada para a cobrança. Essa chave será lida pelo aplicativo do PSP do pagador para consulta ao DICT, que retornará a informação que identificará o recebedor da cobrança.
   * * Os tipos de chave podem ser: telefone, e-mail, cpf/cnpj ou EVP.
   * * O formato das chaves pode ser encontrado na seção "Formatação das chaves do DICT no BR Code" do [Manual de Padrões para iniciação do Pix](https://www.bcb.gov.br/estabilidadefinanceira/pagamentosinstantaneos).
   *
   * Length: 1..77
   */
  chave: string;
  /**
   * O campo solicitacaoPagador, opcional, determina um texto a ser apresentado ao pagador para que ele possa digitar uma informação correlata, em formato livre, a ser enviada ao recebedor. Esse texto será preenchido, na pacs.008, pelo PSP do pagador, no campo RemittanceInformation . O tamanho do campo na pacs.008 está limitado a 140 caracteres.
   *
   * Length: 1..140
   */
  solicitacaoPagador?: string;
  /**
   * Cada respectiva informação adicional contida na lista (nome e valor) deve ser apresentada ao pagador.
   *
   * Range: -∞..50
   */
  infoAdicionais?: InfoAdicionaisItem[];
}

/** Dados enviados para criação ou alteração da cobrança com vencimento via API Pix */
export type CobVSolicitada = {
  /** Data de Vencimento */
  calendario?: CobVDataVencimento;
} & {
  /**
   * Os campos aninhados sob o objeto devedor são opcionais e identificam a pessoa ou a instituição a quem a cobrança está endereçada. Não identifica, necessariamente, quem irá efetivamente realizar o pagamento.
   *
   * Não é permitido que o campo devedor.cpf e campo devedor.cnpj estejam preenchidos ao mesmo tempo. Se o campo devedor.nome está preenchido, então deve existir ou um devedor.cpf ou um campo devedor.cnpj preenchido.
   */
  devedor?: CobVDevedor;
} & {
  /** Identificador da localização do payload. */
  loc?: PayloadLocationCob;
} & {
  /** Valores monetários. */
  valor?: CobVValor;
} & CobBase;

/** Dados enviados para revisão da cobrança imediata via API Pix */
export interface CobRevisada {
  /** Expiração */
  calendario?: CalendarioCobSolicitada;
  /**
   * Os campos aninhados sob o objeto devedor são opcionais e identificam a pessoa ou a instituição a quem a cobrança está endereçada. Não identifica, necessariamente, quem irá efetivamente realizar o pagamento.
   *
   * Não é permitido que o campo devedor.cpf e campo devedor.cnpj estejam preenchidos ao mesmo tempo. Se o campo devedor.nome está preenchido, então deve existir ou um devedor.cpf ou um campo devedor.cnpj preenchido.
   */
  devedor?: CobDevedor;
  /** Identificador da localização do payload. */
  loc?: PayloadLocationCob;
  /** Status da Cobrança */
  status?: "REMOVIDA_PELO_USUARIO_RECEBEDOR";
  /** valores monetários referentes à cobrança. */
  valor?: CobValorRevisada;
  /**
   * # Formato do campo chave
   *
   * * O campo chave determina a chave Pix registrada no DICT que será utilizada para a cobrança. Essa chave será lida pelo aplicativo do PSP do pagador para consulta ao DICT, que retornará a informação que identificará o recebedor da cobrança.
   * * Os tipos de chave podem ser: telefone, e-mail, cpf/cnpj ou EVP.
   * * O formato das chaves pode ser encontrado na seção "Formatação das chaves do DICT no BR Code" do [Manual de Padrões para iniciação do Pix](https://www.bcb.gov.br/estabilidadefinanceira/pagamentosinstantaneos).
   *
   * Length: 1..77
   */
  chave?: string;
  /**
   * O campo solicitacaoPagador, opcional, determina um texto a ser apresentado ao pagador para que ele possa digitar uma informação correlata, em formato livre, a ser enviada ao recebedor. Esse texto será preenchido, na pacs.008, pelo PSP do pagador, no campo RemittanceInformation . O tamanho do campo na pacs.008 está limitado a 140 caracteres.
   *
   * Length: 1..140
   */
  solicitacaoPagador?: string;
  /**
   * Cada respectiva informação adicional contida na lista (nome e valor) deve ser apresentada ao pagador.
   *
   * Range: -∞..50
   */
  infoAdicionais?: InfoAdicionaisItem[];
}

export interface CobVRevisadaComplemento {
  /**
   * Os campos aninhados sob o identificador calendário organizam informações a respeito de controle de tempo da cobrança.
   */
  calendario?: CobDataDeVencimento;
  /**
   * Não é permitido que o campo devedor.cpf e campo devedor.cnpj estejam preenchidos ao mesmo tempo. Se o campo devedor.nome está preenchido, então deve existir ou um devedor.cpf ou um campo devedor.cnpj preenchido.
   *
   * Os campos aninhados sob o objeto devedor são opcionais e identificam a pessoa ou a instituição a quem a cobrança está endereçada. Não identifica, necessariamente, quem irá efetivamente realizar o pagamento.
   */
  devedor?: PessoaFisica | PessoaJuridica;
  /** Identificador da localização do payload. */
  loc?: PayloadLocationCob;
  /** Status da Cobrança */
  status?: "REMOVIDA_PELO_USUARIO_RECEBEDOR";
  /** Valores monetários. */
  valor?: CobVValor;
}

/** Dados enviados para revisão da cobrança com vencimento via API Pix */
export type CobVRevisada = {
  /** Data de Vencimento */
  calendario?: CobVDataVencimento;
} & {
  /**
   * Os campos aninhados sob o objeto devedor são opcionais e identificam a pessoa ou a instituição a quem a cobrança está endereçada. Não identifica, necessariamente, quem irá efetivamente realizar o pagamento.
   *
   * Não é permitido que o campo devedor.cpf e campo devedor.cnpj estejam preenchidos ao mesmo tempo. Se o campo devedor.nome está preenchido, então deve existir ou um devedor.cpf ou um campo devedor.cnpj preenchido.
   */
  devedor?: CobVDevedor;
} & {
  /** Identificador da localização do payload. */
  loc?: PayloadLocationCob;
} & {
  /** Valores monetários. */
  valor?: CobVValor;
} & CobBase & {
  /** Status do registro da cobrança */
  status?: StatusCobVRevisada;
};

/** Lote de cobrança com vencimento revisada */
export interface LoteCobVRevisada {
  /** Descrição do lote */
  descricao?: string;
  cobsv?: CobVRevisadaItem[];
}

export type CobVRevisadaItem = ({
  /** Pattern: `[a-zA-Z0-9]{26,35}` */
  txid: string;
  /**
   * Os campos aninhados sob o identificador calendário organizam informações a respeito de controle de tempo da cobrança.
   */
  calendario?: CobDataDeVencimento;
  /**
   * Não é permitido que o campo devedor.cpf e campo devedor.cnpj estejam preenchidos ao mesmo tempo. Se o campo devedor.nome está preenchido, então deve existir ou um devedor.cpf ou um campo devedor.cnpj preenchido.
   *
   * Os campos aninhados sob o objeto devedor são opcionais e identificam a pessoa ou a instituição a quem a cobrança está endereçada. Não identifica, necessariamente, quem irá efetivamente realizar o pagamento.
   */
  devedor?: PessoaFisica | PessoaJuridica;
  loc?: PayloadLocationCob;
  /** Status da Cobrança */
  status?: "REMOVIDA_PELO_USUARIO_RECEBEDOR";
  /** Valores monetários. */
  valor?: CobVValor;
}) & CobBase;

export interface LoteCobVSolicitado {
  /** Descrição do lote */
  descricao: string;
  cobsv: CobVSolicitadaLote[];
}

/** Dados enviados para criação ou alteração da cobrança com vencimento via API Pix */
export type CobVSolicitadaItem = ({
  txid?: TxId;
  /**
   * Os campos aninhados sob o identificador calendário organizam informações a respeito de controle de tempo da cobrança.
   */
  calendario?: CobDataDeVencimento;
  devedor?: PessoaFisica | PessoaJuridica;
  loc?: PayloadLocationCob;
  valor?: CobVValor;
}) & CobBase;

/** Dados criados ou alterados da cobrança imediata via API Pix */
export type CobGerada = ({
  /**
   * Não é permitido que o campo devedor.cpf e campo devedor.cnpj estejam preenchidos ao mesmo tempo. Se o campo devedor.nome está preenchido, então deve existir ou um devedor.cpf ou um campo devedor.cnpj preenchido.
   *
   * Os campos aninhados sob o objeto devedor são opcionais e identificam a pessoa ou a instituição a quem a cobrança está endereçada. Não identifica, necessariamente, quem irá efetivamente realizar o pagamento.
   */
  devedor?: PessoaFisica | PessoaJuridica;
}) & {
  loc?: PayloadLocation;
} & {
  /**
   * Localização do Payload a ser informada na criação da cobrança.
   *
   * Format: `uri`
   * Length: 0..77
   * Read-only: returned by the API, never sent.
   *
   * @example "pix.example.com/qr/v2/2353c790eefb11eaadc10242ac120002"
   */
  location?: string;
} & ({
  /** Status da Cobrança */
  status?: "ATIVA" | "CONCLUIDA" | "REMOVIDA_PELO_USUARIO_RECEBEDOR" | "REMOVIDA_PELO_PSP";
}) & {
  valor?: CobValor;
} & {
  /**
   * Os campos aninhados sob o identificador calendário organizam informações a respeito de controle de tempo da cobrança.
   */
  calendario?: {
    /**
     * Tempo de vida da cobrança, especificado em segundos a partir da data de criação (Calendario.criacao)
     *
     * Format: `int32`
     * Default: `"86400"`
     *
     * @example "3600"
     */
    expiracao: number;
    /**
     * Data de Criação
     *
     * Format: `date-time`
     */
    criacao?: string;
  };
  /** Pattern: `[a-zA-Z0-9]{26,35}` */
  txid?: string;
  /**
   * # O campo `revisao`
   *
   * Denota a revisão da cobrança. Sempre começa em zero. Sempre varia em acréscimos de 1.
   *
   * O incremento em uma cobrança deve ocorrer sempre que um objeto da cobrança em questão for alterado.
   * O campo `loc` é uma exceção a esta regra.
   *
   * Se em uma determinada alteração em uma cobrança, o único campo alterado for o campo `loc`,
   * então esta operação não incrementa a revisão da cobrança.
   *
   * O campo `loc` não ocasiona uma alteração na cobrança em si.
   * Não é necessário armazenar histórico das alterações do campo `loc` para uma determinada cobrança.
   * Para os outros campos da cobrança, registra-se histórico.
   *
   * Format: `int32`
   * Read-only: returned by the API, never sent.
   */
  revisao?: Revisao;
} & CobBaseCopiaCola;

/** Dados criados ou alterados da cobrança com vencimento via API Pix */
export type CobVGerada = {
  /**
   * Os campos aninhados sob o identificador calendário organizam informações a respeito de controle de tempo da cobrança.
   */
  calendario?: {
    /**
     * Data de Criação
     *
     * Format: `date-time`
     */
    criacao?: string;
    /**
     * Trata-se de uma data, no formato `YYYY-MM-DD`, segundo ISO 8601. É a data de vencimento da cobrança. A cobrança pode ser honrada até esse dia, inclusive, em qualquer horário do dia.
     *
     * Format: `date`
     *
     * @example "2020-04-01"
     */
    dataDeVencimento?: string;
    /**
     * Trata-se da quantidade de dias corridos após calendario.dataDeVencimento,
     * em que a cobrança poderá ser paga.
     *
     * Aplica-se este campo sobre o vencimento original da cobrança acrescentando-se o
     * número de dias corridos nos quais a cobrança ainda poderá ser paga, após vencida.
     * Este valor não se sobrepõe à possibilidade de pagamento em data posterior ao vencimento
     * original por [força de lei](http://www.planalto.gov.br/ccivil_03/LEIS/L7089.htm).
     * Nesse sentido, um vencimento determinado para um dia não útil deverá ser acatado
     * no primeiro dia útil subsequente mesmo que exceda o número de dias definido neste campo.
     *
     * Para ilustrar o funcionamento, seguem alguns exemplos:
     *
     * Exemplo A:
     *
     * ```txt
     * dataDeVencimento: 2020-10-20, terça-feira.
     * validadeAposVencimento: 4
     *
     * Tenta-se pagar no dia 2020-10-23, sexta: aceito.
     * Tenta-se pagar no dia 2020-10-24, sábado: aceito.
     * Tenta-se pagar no dia 2020-10-25, domingo: negado.
     * ```
     *
     * Exemplo B:
     *
     * ```txt
     * dataDeVencimento: 2020-12-25, sexta-feira, feriado.
     * validadeAposVencimento: 0
     *
     * Tenta-se pagar no dia 2020-12-25, sexta: aceito.
     * Tenta-se pagar no dia 2020-12-26, sábado: aceito.
     * Tenta-se pagar no dia 2020-12-27, domingo: aceito.
     * Tenta-se pagar no dia 2020-12-28, segunda: aceito.
     * Tenta-se pagar no dia 2020-12-29, terça: negado.
     * ```
     *
     * Exemplo C:
     *
     * ```txt
     * dataDeVencimento: 2020-12-25, sexta-feira, feriado.
     * validadeAposVencimento: 1
     *
     * Tenta-se pagar no dia 2020-12-25, sexta: aceito.
     * Tenta-se pagar no dia 2020-12-26, sábado: aceito.
     * Tenta-se pagar no dia 2020-12-27, domingo: aceito.
     * Tenta-se pagar no dia 2020-12-28, segunda: aceito.
     * Tenta-se pagar no dia 2020-12-29, terça: negado.
     * ```
     *
     * Exemplo D:
     *
     * ```txt
     * dataDeVencimento: 2020-12-25, sexta-feira, feriado.
     * validadeAposVencimento: 3
     *
     * Tenta-se pagar no dia 2020-12-25, sexta: aceito.
     * Tenta-se pagar no dia 2020-12-26, sábado: aceito.
     * Tenta-se pagar no dia 2020-12-27, domingo: aceito.
     * Tenta-se pagar no dia 2020-12-28, segunda: aceito.
     * Tenta-se pagar no dia 2020-12-29, terça: negado.
     * ```
     *
     * Exemplo E:
     *
     * ```txt
     * dataDeVencimento: 2020-12-25, sexta-feira, feriado.
     * validadeAposVencimento: 4
     *
     * Tenta-se pagar no dia 2020-12-25, sexta: aceito.
     * Tenta-se pagar no dia 2020-12-26, sábado: aceito.
     * Tenta-se pagar no dia 2020-12-27, domingo: aceito.
     * Tenta-se pagar no dia 2020-12-28, segunda: aceito.
     * Tenta-se pagar no dia 2020-12-29, terça: aceito.
     * Tenta-se pagar no dia 2020-12-30, quarta: negado.
     * ```
     *
     * Format: `int32`
     * Default: `30`
     */
    validadeAposVencimento: number;
  };
  /**
   * # Identificador da transação
   *
   * O campo txid determina o identificador da transação.
   * O objetivo desse campo é ser um elemento que possibilite ao PSP do recebedor apresentar ao usuário recebedor a funcionalidade de conciliação de pagamentos.
   *
   * O txid é criado exclusivamente pelo usuário recebedor e está sob sua responsabilidade.
   * O txid, no contexto de representação de uma cobrança, é único por CPF/CNPJ do usuário recebedor.
   *
   * Pattern: `[a-zA-Z0-9]{26,35}`
   */
  txid?: TxId;
  /**
   * # O campo `revisao`
   *
   * Denota a revisão da cobrança. Sempre começa em zero. Sempre varia em acréscimos de 1.
   *
   * O incremento em uma cobrança deve ocorrer sempre que um objeto da cobrança em questão for alterado.
   * O campo `loc` é uma exceção a esta regra.
   *
   * Se em uma determinada alteração em uma cobrança, o único campo alterado for o campo `loc`,
   * então esta operação não incrementa a revisão da cobrança.
   *
   * O campo `loc` não ocasiona uma alteração na cobrança em si.
   * Não é necessário armazenar histórico das alterações do campo `loc` para uma determinada cobrança.
   * Para os outros campos da cobrança, registra-se histórico.
   *
   * Format: `int32`
   * Read-only: returned by the API, never sent.
   */
  revisao?: Revisao;
} & ({
  /**
   * Não é permitido que o campo devedor.cpf e campo devedor.cnpj estejam preenchidos ao mesmo tempo. Se o campo devedor.nome está preenchido, então deve existir ou um devedor.cpf ou um campo devedor.cnpj preenchido.
   *
   * Os campos aninhados sob o objeto devedor são opcionais e identificam a pessoa ou a instituição a quem a cobrança está endereçada. Não identifica, necessariamente, quem irá efetivamente realizar o pagamento.
   */
  devedor?: PessoaFisica | PessoaJuridica;
}) & ({
  /**
   * Os campos aninhados sob o objeto devedor são opcionais e identificam o devedor, ou seja, a pessoa ou a instituição a quem a cobrança está endereçada. Não identifica, necessariamente, quem irá efetivamente realizar o pagamento. Um CPF pode ser o devedor de uma cobrança, mas pode acontecer de outro CPF realizar, efetivamente, o pagamento do documento. Não é permitido que o campo devedor.cpf e campo devedor.cnpj estejam preenchidos ao mesmo tempo. Se o campo devedor.cnpj está preenchido, então o campo devedor.cpf não pode estar preenchido, e vice-versa. Se o campo devedor.nome está preenchido, então deve existir ou um devedor.cpf ou um campo devedor.cnpj preenchido.
   */
  recebedor?: PessoaFisica | PessoaJuridica;
}) & {
  loc?: PayloadLocation;
} & ({
  /** Status da Cobrança */
  status?: "ATIVA" | "CONCLUIDA" | "REMOVIDA_PELO_USUARIO_RECEBEDOR" | "REMOVIDA_PELO_PSP";
}) & {
  valor?: CobVValor;
} & CobBaseCopiaCola;

/** Lote de cobranças com vencimento gerado */
export interface LoteCobVGerado {
  /**
   * Id do lote
   *
   * Format: `int64`
   */
  id: number;
  /** Descrição do lote */
  descricao: string;
  /**
   * Timestamp que indica o momento em que foi criado o lote. Respeita o formato definido na RFC 3339.
   *
   * Format: `date-time`
   */
  criacao: string;
  cobsv: CobVGerada[];
}

/** Cobrança com vencimento completa */
export type CobVCompleta = CobVGerada & CobVSolicitada & {
  /** Pix recebidos */
  pix?: Pix[];
} & ({
  /** Status da Cobrança */
  status?: "ATIVA" | "CONCLUIDA" | "REMOVIDA_PELO_USUARIO_RECEBEDOR" | "REMOVIDA_PELO_PSP";
});

/** Cobrança com vencimento completa */
export interface PixCobranca {
  /**
   * Id do pix
   *
   * Format: `int64`
   */
  id?: number;
  /** Conta corrente do recebedor */
  contaCorrente?: string;
  /** Id da transação */
  txid?: string;
  /** Status do Pix */
  status?: "ATIVA" | "CONCLUIDA" | "REMOVIDA_PELO_USUARIO_RECEBEDOR" | "REMOVIDA_PELO_PSP";
  /**
   * Timestamp que indica o momento em que foi criado o pix.
   *
   * Format: `date-time`
   */
  dataCriacao?: string;
  /**
   * Timestamp que indica o momento em que foi criado o pix.
   *
   * Format: `date`
   */
  dataVencimento?: string;
  /** Chave do recebedor */
  chave?: string;
  /** Validade apos vencimento do pix */
  validadeAposVencimento?: number;
  /** Payload location do pix */
  location?: string;
  /** Descricao */
  descricao?: string;
  /** Tipo de cobrança Pix */
  tipo?: "COB" | "COBV";
  /** Dados do recebedor */
  devedor?: DevedorPixEntity;
  /** Valores monetários. */
  valor?: ValorPixEntity;
  /** Entidade Pagamento Pix */
  pagamento?: PixCobrancaPagamento;
  /** Lista Devolucao */
  devolucoes?: PixCobrancaDevolucao[];
}

/** Entidade Pagamento Pix */
export interface PixCobrancaPagamento {
  /**
   * Data do Pagamento
   *
   * Format: `date-time`
   */
  dataPagamento?: string;
  /** Valor pago nesse pagamento */
  valorPagamento?: string;
  /** E2eId do pagamento */
  e2eId?: string;
}

/** Entidade Devolucao Pix */
export interface PixCobrancaDevolucao {
  /**
   * Data da Devolucao
   *
   * Format: `date-time`
   */
  dataDevolucao?: string;
  /** Valor pago na devolucao */
  valorDevolucao?: string;
  /** RtrId da devolucao */
  rtrId?: string;
  /** Status da devolucao */
  status?: string;
}

/** Cobrança imediata completa */
export type CobCompleta = CobGerada & CobSolicitada & ({
  /** Status da Cobrança */
  status?: "ATIVA" | "CONCLUIDA" | "REMOVIDA_PELO_USUARIO_RECEBEDOR" | "REMOVIDA_PELO_PSP";
}) & {
  /** Pix recebidos */
  pix?: Pix[];
};

/** Lote de solicitações de alteração ou criação de cobranças com vencimento */
export interface LoteCobVConsultado {
  /**
   * Id do lote
   *
   * Format: `int64`
   */
  id: number;
  /** Descrição do lote */
  descricao: string;
  /**
   * Timestamp que indica o momento em que foi criado o lote. Respeita o formato definido na RFC 3339.
   *
   * Format: `date-time`
   */
  criacao: string;
  cobsv: Array<{
    /** Pattern: `[a-zA-Z0-9]{26,35}` */
    txid: string;
    /** Status da solicitação de criação/alteração da cobrança no contexto de criação via lote */
    status: "EM_PROCESSAMENTO" | "CRIADA" | "NEGADA";
    problema?: Problema;
    /**
     * Data e hora em que a cobrança foi criada. Respeita RFC 3339.
     *
     * Format: `date-time`
     * Read-only: returned by the API, never sent.
     */
    criacao?: string;
  }>;
}

/** Lotes de solicitações de cobranças com vencimento */
export interface LotesCobVConsultados {
  /**
   * Parâmetros utilizados para a realização de uma consulta de lote de cobranças com vencimento.
   */
  parametros: ParametrosConsultaLote;
  /** Lotes de solicitações de criação/alteração de cobranças com vencimento */
  lotes: LoteCobVConsultado[];
}

/** Dados da cobrança com vencimento acessados pelo payload JSON */
export type CobVPayload = CobBase & ({
  /**
   * Os campos aninhados sob o objeto devedor são opcionais e identificam o devedor, ou seja, a pessoa ou a instituição a quem a cobrança está endereçada. Não identifica, necessariamente, quem irá efetivamente realizar o pagamento. Um CPF pode ser o devedor de uma cobrança, mas pode acontecer de outro CPF realizar, efetivamente, o pagamento do documento. Não é permitido que o campo devedor.cpf e campo devedor.cnpj estejam preenchidos ao mesmo tempo. Se o campo devedor.cnpj está preenchido, então o campo devedor.cpf não pode estar preenchido, e vice-versa. Se o campo devedor.nome está preenchido, então deve existir ou um devedor.cpf ou um campo devedor.cnpj preenchido.
   */
  devedor?: PessoaFisica | PessoaJuridica;
  recebedor?: PessoaFisica | PessoaJuridica;
  /**
   * # Identificador da transação
   *
   * O campo txid determina o identificador da transação.
   * O objetivo desse campo é ser um elemento que possibilite ao PSP do recebedor apresentar ao usuário recebedor a funcionalidade de conciliação de pagamentos.
   *
   * O txid é criado exclusivamente pelo usuário recebedor e está sob sua responsabilidade.
   * O txid, no contexto de representação de uma cobrança, é único por CPF/CNPJ do usuário recebedor.
   *
   * Pattern: `[a-zA-Z0-9]{26,35}`
   */
  txid?: TxId;
  /**
   * # O campo `revisao`
   *
   * Denota a revisão da cobrança. Sempre começa em zero. Sempre varia em acréscimos de 1.
   *
   * O incremento em uma cobrança deve ocorrer sempre que um objeto da cobrança em questão for alterado.
   * O campo `loc` é uma exceção a esta regra.
   *
   * Se em uma determinada alteração em uma cobrança, o único campo alterado for o campo `loc`,
   * então esta operação não incrementa a revisão da cobrança.
   *
   * O campo `loc` não ocasiona uma alteração na cobrança em si.
   * Não é necessário armazenar histórico das alterações do campo `loc` para uma determinada cobrança.
   * Para os outros campos da cobrança, registra-se histórico.
   *
   * Format: `int32`
   * Read-only: returned by the API, never sent.
   */
  revisao?: Revisao;
  /** Status da Cobrança */
  status?: "ATIVA" | "CONCLUIDA" | "REMOVIDA_PELO_USUARIO_RECEBEDOR" | "REMOVIDA_PELO_PSP";
  /**
   * Todos os campos que indicam valores monetários obedecem ao formato do ID 54 da especificação EMV/BR Code para QR Codes. O separador decimal é o caractere ponto. Não é aplicável utilizar separador de milhar. Exemplos de valores aderentes ao padrão: 1.00, 123.99, 123456789.23
   */
  valor?: CobVPayloadValor;
}) & {
  /**
   * Os campos aninhados sob o identificador calendário organizam informações a respeito de controle de tempo da cobrança.
   */
  calendario: CobCriacao & CobApresentacao & CobDataDeVencimento;
};

/** Dados da cobrança imediata acessados pelo payload JSON */
export type CobPayload = CobBase & ({
  /**
   * Os campos aninhados sob o identificador calendário organizam informações a respeito de controle de tempo da cobrança.
   */
  calendario?: CobCriacao & CobApresentacao & CobExpiracao;
  /**
   * Não é permitido que o campo devedor.cpf e campo devedor.cnpj estejam preenchidos ao mesmo tempo. Se o campo devedor.nome está preenchido, então deve existir ou um devedor.cpf ou um campo devedor.cnpj preenchido.
   *
   * Os campos aninhados sob o objeto devedor são opcionais e identificam a pessoa ou a instituição a quem a cobrança está endereçada. Não identifica, necessariamente, quem irá efetivamente realizar o pagamento.
   */
  devedor?: PessoaFisica | PessoaJuridica;
  /**
   * # Identificador da transação
   *
   * O campo txid determina o identificador da transação.
   * O objetivo desse campo é ser um elemento que possibilite ao PSP do recebedor apresentar ao usuário recebedor a funcionalidade de conciliação de pagamentos.
   *
   * O txid é criado exclusivamente pelo usuário recebedor e está sob sua responsabilidade.
   * O txid, no contexto de representação de uma cobrança, é único por CPF/CNPJ do usuário recebedor.
   *
   * Pattern: `[a-zA-Z0-9]{26,35}`
   */
  txid?: TxId;
  /**
   * # O campo `revisao`
   *
   * Denota a revisão da cobrança. Sempre começa em zero. Sempre varia em acréscimos de 1.
   *
   * O incremento em uma cobrança deve ocorrer sempre que um objeto da cobrança em questão for alterado.
   * O campo `loc` é uma exceção a esta regra.
   *
   * Se em uma determinada alteração em uma cobrança, o único campo alterado for o campo `loc`,
   * então esta operação não incrementa a revisão da cobrança.
   *
   * O campo `loc` não ocasiona uma alteração na cobrança em si.
   * Não é necessário armazenar histórico das alterações do campo `loc` para uma determinada cobrança.
   * Para os outros campos da cobrança, registra-se histórico.
   *
   * Format: `int32`
   * Read-only: returned by the API, never sent.
   */
  revisao?: Revisao;
  /** Status da Cobrança */
  status?: "ATIVA" | "CONCLUIDA" | "REMOVIDA_PELO_USUARIO_RECEBEDOR" | "REMOVIDA_PELO_PSP";
  /**
   * Todos os campos que indicam valores monetários obedecem ao pattern \d{1,10}\.\d{2}. O separador decimal é o caractere ponto. Não é aplicável utilizar separador de milhar. Exemplos de valores aderentes ao padrão: 1.00, 123.99, 123456789.23"
   */
  valor?: CobPayloadValor;
}) & {
  /**
   * Os campos aninhados sob o identificador calendário organizam informações a respeito de controle de tempo da cobrança.
   */
  calendario: CobCriacao & CobApresentacao & CobExpiracao;
};

/** Identificador da localização do payload. */
export interface PayloadLocation {
  /**
   * Identificador da location a ser informada na criação da cobrança .
   *
   * Format: `int64`
   */
  id?: PayloadLocationId;
  /**
   * Localização do Payload a ser informada na criação da cobrança.
   *
   * Format: `uri`
   * Length: 0..77
   * Read-only: returned by the API, never sent.
   *
   * @example "pix.example.com/qr/v2/2353c790eefb11eaadc10242ac120002"
   */
  location?: string;
  /** Tipo da cobrança */
  tipoCob?: "cob" | "cobv";
  /**
   * Data e hora em que a location foi criada. Respeita RFC 3339.
   *
   * Format: `date-time`
   * Read-only: returned by the API, never sent.
   */
  criacao?: string;
}

/** Identificador da localização do payload solicitada. */
export interface PayloadLocationSolicitada {
  /** Tipo da cobrança */
  tipoCob?: string;
}

/** Identificador da localização do payload completo. */
export interface PayloadLocationCompleta {
  /**
   * Identificador da location a ser informada na criação da cobrança .
   *
   * Format: `int64`
   */
  id?: PayloadLocationId;
  /** Pattern: `[a-zA-Z0-9]{26,35}` */
  txid?: string;
  /**
   * Localização do Payload a ser informada na criação da cobrança.
   *
   * Format: `uri`
   * Length: 0..77
   * Read-only: returned by the API, never sent.
   *
   * @example "pix.example.com/qr/v2/2353c790eefb11eaadc10242ac120002"
   */
  location?: string;
  /** Tipo da cobrança */
  tipoCob?: "cob" | "cobv";
  /**
   * Data e hora em que a location foi criada. Respeita RFC 3339.
   *
   * Format: `date-time`
   * Read-only: returned by the API, never sent.
   */
  criacao?: string;
}

/** Identificador da localização do payload. */
export interface PayloadLocationCob {
  /**
   * Identificador da location a ser informada na criação da cobrança .
   *
   * Format: `int64`
   */
  id?: PayloadLocationId;
  /** Tipo da cobrança */
  tipoCob?: TipoLocationCobEnum;
}

/** [DEPRECADO] Parâmetros utilizados para a realização de uma consulta de cobranças. */
export interface ParametrosConsultaCob {
  /**
   * Data inicial utilizada na consulta.
   * Exemplo: 2020-04-01T00:00:00Z
   *
   * @example "2020-04-01T00:00:00Z"
   */
  inicio: string;
  /**
   * Data inicial utilizada na consulta.
   * Exemplo: 2020-04-01T17:00:00Z
   *
   * @example "2020-04-01T17:00:00Z"
   */
  fim: string;
  /**
   * Filtro pelo CPF do devedor. Não pode ser utilizado ao mesmo tempo que o CNPJ.
   *
   * Pattern: `\d{11}`
   */
  cpf?: string;
  /**
   * Filtro pelo CNPJ do devedor. Não pode ser utilizado ao mesmo tempo que o CPF.
   *
   * Pattern: `\d{14}`
   */
  cnpj?: string;
  /** Filtro pela existência de location vinculada. */
  locationPresente?: boolean;
  /** Filtro pelo status das cobranças. */
  status?: string;
  /** Paginação */
  paginacao: Paginacao;
}

/**
 * Parâmetros utilizados para a realização de uma consulta de lote de cobranças com vencimento.
 */
export interface ParametrosConsultaLote {
  /**
   * Data inicial utilizada na consulta. Respeita RFC 3339.
   *
   * @example "2020-04-01T00:00:00Z"
   */
  inicio?: string;
  /**
   * Data de fim utilizada na consulta. Respeita RFC 3339.
   *
   * @example "2020-04-01T17:00:00Z"
   */
  fim?: string;
  /** Paginação */
  paginacao?: Paginacao;
}

/** Cobranças com vencimento consultadas */
export interface CobsVConsultadas {
  /** [DEPRECADO] Parâmetros utilizados para a realização de uma consulta de cobranças. */
  parametros: ParametrosConsultaCob;
  /** Lista de cobranças */
  cobs: CobVCompleta[];
}

/** Cobranças imediatas consultadas */
export interface CobsConsultadas {
  /** [DEPRECADO] Parâmetros utilizados para a realização de uma consulta de cobranças. */
  parametros: ParametrosConsultaCob;
  /** Lista de cobranças */
  cobs: CobCompleta[];
}

/** Objeto utilizado no callback do Pix */
export interface PixCallback {
  /**
   * Id único para identificação do Pix Cobrança.
   *
   * Pattern: `[a-zA-Z0-9]{32}`
   */
  endToEndId?: EndToEndId;
  txid?: TxId;
  /**
   * Valor do Pix.
   *
   * Pattern: `\d{1,10}\.\d{2}`
   */
  valor?: string;
  /**
   * O objetivo dessa estrutura é explicar os elementos de composição do valor do Pix, incluindo informações sobre as multas, juros, descontos e abatimentos quando o Pix for relativo a cobranças com vencimento.
   *
   * Regras da estrutura:
   * - O valor do Pix é igual a:
   * - (original.valor + saque.valor + troco.valor) + multa.valor + juros.valor – abatimento.valor – desconto.valor considerando-se apenas os campos que estiverem presentes para cada tipo de cobrança pago.
   * - As estruturas saque e troco só serão retornadas quando o Pix for relativo a um Pix Saque ou Pix Troco, respectivamente, e as demais estruturas (juros, multa, abatimento e desconto) só serão pertinentes aos Pix de pagamentos das cobranças com vencimento.
   * - Não pode haver simultaneamente uma subsestrutura do tipo saque e outra do tipo troco;
   * - Não há restrição na ordem das subestruturas.
   *
   * Para o caso de um Pix Saque pode-se retornar original com valor=0.00 (zero) uma vez que a soma será respeitada, ou pode-se omitir a subestrutura original.
   * No caso de um Pix Troco ou de um pagamento de cobrança com vencimento a subsestrutura original vai sempre estar presente.
   *
   * #### Exemplos válidos:
   * Exemplo de preenchimentos válidos.
   *
   * - **Pix para pagamento de cobrança imediata (sem saque ou troco).**
   * ```
   * ...
   * "componentesValor": {
   * "original": {
   * "valor": "100.00"
   * }
   * }
   * ...
   * ```
   * - **Pix Saque.**
   * ```
   * ...
   * "componentesValor": {
   * "saque": {
   * "valor": "100.00",
   * "modalidadeAgente": "AGPSS",
   * "prestadorDeServicoDeSaque": "12345678"
   * }
   * }
   * ...
   * ```
   * - **Pix para pagamento de cobrança imediata com saque (pode vir original.valor=0.00).**
   * ```
   * ...
   * "componentesValor": {
   * "original": {
   * "valor": "0.00"
   * },
   * "saque": {
   * "valor": "100.00",
   * "modalidadeAgente": "AGPSS",
   * "prestadorDeServicoDeSaque": "12345678"
   * }
   * }
   * ...
   * ```
   * - **Pix Troco.**
   * ```
   * ...
   * "componentesValor": {
   * "original": {
   * "valor": "80.00"
   * },
   * "troco": {
   * "valor": "20.00",
   * "modalidadeAgente": "AGTEC",
   * "prestadorDeServicoDeSaque": "12345678"
   * }
   * }
   * ...
   * ```
   * - **Pix para pagamento de cobrança imediata com troco (ordem não importa).**
   * ```
   * ...
   * "componentesValor": {
   * "troco": {
   * "valor": "20.00",
   * "modalidadeAgente": "AGTEC",
   * "prestadorDeServicoDeSaque": "12345678"
   * },
   * "original": {
   * "valor": "80.00"
   * }
   * }
   * ...
   * ```
   * - **Pix para pagamento de cobrança com vencimento de R$100,00 considerando-se um atraso de 2 dias a uma multa de 3% e juros de 1% ao dia. O valor do Pix será R$105,00.**
   * ```
   * ...
   * "componentesValor": {
   * "original": {
   * "valor": "100.00"
   * },
   * "multa": {
   * "valor": "3.00"
   * },
   * "juros": {
   * "valor": "2.00"
   * }
   * }
   * ...
   * ```
   * #### Exemplos inválidos:
   * Exemplos, não exaustivos, de preenchimentos inválidos.
   * - **`original.valor` maior que 0.00 (zero) e `saque` juntos**
   * ```
   * ...
   * "componentesValor": {
   * "original": {
   * "valor": "80.00"
   * },
   * "saque": {
   * "valor": "20.00",
   * "modalidadeAgente": "AGPSS",
   * "prestadorDeServicoDeSaque": "12345678"
   * }
   * }
   * ...
   * ```
   * - **dois elementos de `saque`**
   * ```
   * ...
   * "componentesValor": [
   * "saque": {
   * "valor": "20.00",
   * "modalidadeAgente": "AGPSS",
   * "prestadorDeServicoDeSaque": "12345678"
   * },
   * "saque": {
   * "valor": "10.00",
   * "modalidadeAgente": "AGPSS",
   * "prestadorDeServicoDeSaque": "12345678"
   * }
   * ]
   * ...
   * ```
   * - **saque e troco simultaneamente**
   * ```
   * ...
   * "componentesValor": {
   * "original": {
   * "valor": "60.00"
   * },
   * "saque": {
   * "valor": "20.00",
   * "modalidadeAgente": "AGPSS",
   * "prestadorDeServicoDeSaque": "12345678"
   * },
   * "troco": {
   * "valor": "20.00",
   * "modalidadeAgente": "AGTEC",
   * "prestadorDeServicoDeSaque": "12345678"
   * }
   * }
   * ...
   * ```
   */
  componentesValor?: PixValorOriginal | PixValorSaque | PixValorTroco | PixValorJuros | PixValorMulta | PixValorAbatimento | PixValorDesconto;
  /**
   * # Formato do campo chave
   *
   * * Campo chave do recebedor conforme atribuído na respectiva PACS008.
   * * Os tipos de chave podem ser: telefone, e-mail, cpf/cnpj ou EVP.
   * * O formato das chaves pode ser encontrado na seção "Formatação das chaves do DICT no BR Code" do [Manual de Padrões para iniciação do Pix](https://www.bcb.gov.br/estabilidadefinanceira/pagamentosinstantaneos).
   *
   * Length: 0..77
   */
  chave?: string;
  /**
   * Horário em que o Pix foi processado no PSP.
   *
   * Format: `date-time`
   */
  horario?: string;
  /**
   * Informação livre do pagador
   *
   * Length: 0..140
   */
  infoPagador?: string;
  /** Devoluções */
  devolucoes?: Devolucao[];
  /** Informacoes do pagador */
  pagador?: {
    nome?: string;
    /**
     * Caso o pagador seja uma pessoa física, o campo cpfCnpj virá mascarado. Ex: &#147;&#42;&#42;&#42;853226&#42;&#42;&#148;
     */
    cpfCnpj?: string;
  };
}

/** Pix */
export interface Pix {
  /**
   * Id único para identificação do Pix Cobrança.
   *
   * Pattern: `[a-zA-Z0-9]{32}`
   */
  endToEndId: EndToEndId;
  txid?: TxId;
  /**
   * Valor do Pix.
   *
   * Pattern: `\d{1,10}\.\d{2}`
   */
  valor: string;
  /**
   * O objetivo dessa estrutura é explicar os elementos de composição do valor do Pix, incluindo informações sobre as multas, juros, descontos e abatimentos quando o Pix for relativo a cobranças com vencimento.
   *
   * Regras da estrutura:
   * - O valor do Pix é igual a:
   * - (original.valor + saque.valor + troco.valor) + multa.valor + juros.valor – abatimento.valor – desconto.valor considerando-se apenas os campos que estiverem presentes para cada tipo de cobrança pago.
   * - As estruturas saque e troco só serão retornadas quando o Pix for relativo a um Pix Saque ou Pix Troco, respectivamente, e as demais estruturas (juros, multa, abatimento e desconto) só serão pertinentes aos Pix de pagamentos das cobranças com vencimento.
   * - Não pode haver simultaneamente uma subsestrutura do tipo saque e outra do tipo troco;
   * - Não há restrição na ordem das subestruturas.
   *
   * Para o caso de um Pix Saque pode-se retornar original com valor=0.00 (zero) uma vez que a soma será respeitada, ou pode-se omitir a subestrutura original.
   * No caso de um Pix Troco ou de um pagamento de cobrança com vencimento a subsestrutura original vai sempre estar presente.
   *
   * #### Exemplos válidos:
   * Exemplo de preenchimentos válidos.
   *
   * - **Pix para pagamento de cobrança imediata (sem saque ou troco).**
   * ```
   * ...
   * "componentesValor": {
   * "original": {
   * "valor": "100.00"
   * }
   * }
   * ...
   * ```
   * - **Pix Saque.**
   * ```
   * ...
   * "componentesValor": {
   * "saque": {
   * "valor": "100.00",
   * "modalidadeAgente": "AGPSS",
   * "prestadorDeServicoDeSaque": "12345678"
   * }
   * }
   * ...
   * ```
   * - **Pix para pagamento de cobrança imediata com saque (pode vir original.valor=0.00).**
   * ```
   * ...
   * "componentesValor": {
   * "original": {
   * "valor": "0.00"
   * },
   * "saque": {
   * "valor": "100.00",
   * "modalidadeAgente": "AGPSS",
   * "prestadorDeServicoDeSaque": "12345678"
   * }
   * }
   * ...
   * ```
   * - **Pix Troco.**
   * ```
   * ...
   * "componentesValor": {
   * "original": {
   * "valor": "80.00"
   * },
   * "troco": {
   * "valor": "20.00",
   * "modalidadeAgente": "AGTEC",
   * "prestadorDeServicoDeSaque": "12345678"
   * }
   * }
   * ...
   * ```
   * - **Pix para pagamento de cobrança imediata com troco (ordem não importa).**
   * ```
   * ...
   * "componentesValor": {
   * "troco": {
   * "valor": "20.00",
   * "modalidadeAgente": "AGTEC",
   * "prestadorDeServicoDeSaque": "12345678"
   * },
   * "original": {
   * "valor": "80.00"
   * }
   * }
   * ...
   * ```
   * - **Pix para pagamento de cobrança com vencimento de R$100,00 considerando-se um atraso de 2 dias a uma multa de 3% e juros de 1% ao dia. O valor do Pix será R$105,00.**
   * ```
   * ...
   * "componentesValor": {
   * "original": {
   * "valor": "100.00"
   * },
   * "multa": {
   * "valor": "3.00"
   * },
   * "juros": {
   * "valor": "2.00"
   * }
   * }
   * ...
   * ```
   * #### Exemplos inválidos:
   * Exemplos, não exaustivos, de preenchimentos inválidos.
   * - **`original.valor` maior que 0.00 (zero) e `saque` juntos**
   * ```
   * ...
   * "componentesValor": {
   * "original": {
   * "valor": "80.00"
   * },
   * "saque": {
   * "valor": "20.00",
   * "modalidadeAgente": "AGPSS",
   * "prestadorDeServicoDeSaque": "12345678"
   * }
   * }
   * ...
   * ```
   * - **dois elementos de `saque`**
   * ```
   * ...
   * "componentesValor": [
   * "saque": {
   * "valor": "20.00",
   * "modalidadeAgente": "AGPSS",
   * "prestadorDeServicoDeSaque": "12345678"
   * },
   * "saque": {
   * "valor": "10.00",
   * "modalidadeAgente": "AGPSS",
   * "prestadorDeServicoDeSaque": "12345678"
   * }
   * ]
   * ...
   * ```
   * - **saque e troco simultaneamente**
   * ```
   * ...
   * "componentesValor": {
   * "original": {
   * "valor": "60.00"
   * },
   * "saque": {
   * "valor": "20.00",
   * "modalidadeAgente": "AGPSS",
   * "prestadorDeServicoDeSaque": "12345678"
   * },
   * "troco": {
   * "valor": "20.00",
   * "modalidadeAgente": "AGTEC",
   * "prestadorDeServicoDeSaque": "12345678"
   * }
   * }
   * ...
   * ```
   */
  componentesValor?: PixValorOriginal | PixValorSaque | PixValorTroco | PixValorJuros | PixValorMulta | PixValorAbatimento | PixValorDesconto;
  /**
   * # Formato do campo chave
   *
   * * Campo chave do recebedor conforme atribuído na respectiva PACS008.
   * * Os tipos de chave podem ser: telefone, e-mail, cpf/cnpj ou EVP.
   * * O formato das chaves pode ser encontrado na seção "Formatação das chaves do DICT no BR Code" do [Manual de Padrões para iniciação do Pix](https://www.bcb.gov.br/estabilidadefinanceira/pagamentosinstantaneos).
   *
   * Length: 0..77
   */
  chave?: string;
  /**
   * Horário em que o Pix foi processado no PSP.
   *
   * Format: `date-time`
   */
  horario: string;
  /**
   * Informação livre do pagador
   *
   * Length: 0..140
   */
  infoPagador?: string;
  /** Devoluções */
  devolucoes?: Devolucao[];
}

/** Devolução */
export interface Devolucao {
  /**
   * Id gerado pelo cliente para representar unicamente uma devolução.
   *
   * Pattern: `[a-zA-Z0-9]{1,35}`
   */
  id: DevolucaoId;
  /**
   * ReturnIdentification que transita na PACS004.
   *
   * Pattern: `[a-zA-Z0-9]{32}`
   * Length: 32..32
   *
   * @example "D12345678202009091000abcde123456"
   */
  rtrId: string;
  /**
   * Valor a devolver.
   *
   * Pattern: `\d{1,10}\.\d{2}`
   */
  valor: string;
  horario: {
    /**
     * Horário no qual a devolução foi solicitada no PSP.
     *
     * Format: `date-time`
     */
    solicitacao?: string;
    /**
     * Horário no qual a devolução foi liquidada no PSP.
     *
     * Format: `date-time`
     */
    liquidacao?: string;
  };
  /** Status da devolução. */
  status: "EM_PROCESSAMENTO" | "DEVOLVIDO" | "NAO_REALIZADO";
  /**
   * # Status da Devolução
   *
   * Campo opcional que pode ser utilizado pelo PSP recebedor para detalhar os motivos
   * de a devolução ter atingido o status em questão.
   * Pode ser utilizado, por exemplo, para detalhar o motivo de a devolução não ter sido realizada.
   *
   * Length: 0..140
   */
  motivo?: string;
}

export interface DevolucaoSolicitada {
  /**
   * Valor solicitado para devolução. A soma dos valores de todas as devolucões não podem ultrapassar o valor total do Pix.
   *
   * Pattern: `\d{1,10}\.\d{2}`
   */
  valor: string;
  /**
   * Indica qual é a natureza da devolução solicitada. Uma solicitação de devolução pelo usuário recebedor pode ser relacionada a um Pix
   * comum (com código: `MD06` da pacs.004), ou a um Pix de Saque ou Troco (com códigos possíveis: `MD06` e `SL02` da pacs.004). Na ausência
   * deste campo a natureza deve ser interpretada como sendo de um Pix comum (`ORIGINAL`).
   *
   * As naturezas são assim definidas:
   * - `ORIGINAL`: quando a devolução é solicitada pelo usuário recebedor e se refere a um Pix comum ou ao valor da compra em um Pix Troco (`MD06`);
   * - `RETIRADA`: quando a devolução é solicitada pelo usuário recebedor e se refere a um Pix Saque ou ao valor do troco em um Pix Troco (`SL02`).
   *
   * Os valores de devoluções são sempre limitados aos valores máximos a seguir:
   * - Pix comum: o valor da devolução é limitado ao valor do próprio Pix (a natureza nesse caso deve ser: ORIGINAL);
   * - Pix Saque: o valor da devolução é limitado ao valor da retirada (a natureza nesse caso deve ser: RETIRADA); e
   * - Pix Troco: o valor da devolução é limitado ao valor relativo à compra ou ao troco:
   * - Quando a devolução for referente à compra, o valor limita-se ao valor da compra (a natureza nesse caso deve ser ORIGINAL); e
   * - Quando a devolução for referente ao troco, o valor limita-se ao valor do troco (a natureza nesse caso deve ser RETIRADA).
   *
   * Default: `"ORIGINAL"`
   */
  natureza?: DevolucaoSolicitadaNatureza;
  /**
   * O campo `descricao`, opcional, determina um texto a ser apresentado ao pagador contendo informações sobre a devolução. Esse texto será preenchido, na pacs.004, pelo PSP do recebedor, no campo RemittanceInformation. O tamanho do campo na pacs.004 está limitado a 140 caracteres.
   *
   * Length: 0..140
   */
  descricao?: string;
}

/**
 * Indica qual é a natureza da devolução solicitada. Uma solicitação de devolução pelo usuário recebedor pode ser relacionada a um Pix
 * comum (com código: `MD06` da pacs.004), ou a um Pix de Saque ou Troco (com códigos possíveis: `MD06` e `SL02` da pacs.004). Na ausência
 * deste campo a natureza deve ser interpretada como sendo de um Pix comum (`ORIGINAL`).
 *
 * As naturezas são assim definidas:
 * - `ORIGINAL`: quando a devolução é solicitada pelo usuário recebedor e se refere a um Pix comum ou ao valor da compra em um Pix Troco (`MD06`);
 * - `RETIRADA`: quando a devolução é solicitada pelo usuário recebedor e se refere a um Pix Saque ou ao valor do troco em um Pix Troco (`SL02`).
 *
 * Os valores de devoluções são sempre limitados aos valores máximos a seguir:
 * - Pix comum: o valor da devolução é limitado ao valor do próprio Pix (a natureza nesse caso deve ser: ORIGINAL);
 * - Pix Saque: o valor da devolução é limitado ao valor da retirada (a natureza nesse caso deve ser: RETIRADA); e
 * - Pix Troco: o valor da devolução é limitado ao valor relativo à compra ou ao troco:
 * - Quando a devolução for referente à compra, o valor limita-se ao valor da compra (a natureza nesse caso deve ser ORIGINAL); e
 * - Quando a devolução for referente ao troco, o valor limita-se ao valor do troco (a natureza nesse caso deve ser RETIRADA).
 */
export type DevolucaoSolicitadaNatureza = "ORIGINAL" | "RETIRADA";

/** Parâmetros utilizados para a realização de uma consulta de locations. */
export interface ParametrosConsultaPayloadLocation {
  /**
   * Data inicial utilizada na consulta. Respeita RFC 3339.
   *
   * @example "2020-01-01T00:00:00Z"
   */
  inicio?: string;
  /**
   * Data de fim utilizada na consulta. Respeita RFC 3339.
   *
   * @example "2020-12-01T17:00:00Z"
   */
  fim?: string;
  /** Filtro pela existência de txid. */
  txIdPresente?: boolean;
  tipoCob?: "cob" | "cobv";
  /** Paginação */
  paginacao?: Paginacao;
}

/** Locations Consultadas */
export interface PayloadLocationConsultadas {
  /** Parâmetros utilizados para a realização de uma consulta de locations. */
  parametros: ParametrosConsultaPayloadLocation;
  /** Lista de locations cadastradas */
  loc: PayloadLocationCompleta[];
}

/** Parâmetros utilizados para a realização de uma consulta de Pix. */
export interface ParametrosConsultaPix {
  /**
   * Data inicial utilizada na consulta. Respeita RFC 3339.
   *
   * @example "2020-01-01T00:00:00Z"
   */
  inicio: string;
  /**
   * Data de fim utilizada na consulta. Respeita RFC 3339.
   *
   * @example "2020-12-01T17:00:00Z"
   */
  fim: string;
  txid?: TxId;
}

export interface PixValorOriginal {
  original?: {
    /**
     * Valor original do Pix.
     *
     * Pattern: `\d{1,10}\.\d{2}`
     */
    valor: string;
  };
}

export interface PixValorSaque {
  saque?: {
    /**
     * Valor do Saque Pix.
     *
     * Pattern: `\d{1,10}\.\d{2}`
     */
    valor: string;
    /**
     * ##### Modalidade do Agente
     * SIGLA | Descrição
     * AGTEC | Agente Estabelecimento Comercial
     * AGTOT | Agente Outra Espécie de Pessoa Jurídica ou Correspondente no País
     * AGPSS | Agente Facilitador de Serviço de Saque (ATENÇÃO: no mapeamento para o campo 'modalidadeAgente', da pacs.008, esse valor deve ser substituído por AGFSS))
     */
    modalidadeAgente: "AGTEC" | "AGTOT" | "AGPSS";
    /**
     * ISPB do Facilitador de Serviço de Saque
     *
     * Pattern: `\d{8}`
     */
    prestadorDoServicoDeSaque: string;
  };
}

export interface PixValorTroco {
  troco?: {
    /**
     * Valor do Troco Pix.
     *
     * Pattern: `\d{1,10}\.\d{2}`
     */
    valor: string;
    /**
     * ##### Modalidade do Agente
     * SIGLA | Descrição
     * AGTEC | Agente Estabelecimento Comercial
     * AGTOT | Agente Outra Espécie de Pessoa Jurídica ou Correspondente no País
     */
    modalidadeAgente: "AGTEC" | "AGTOT";
    /**
     * ISPB do Facilitador de Serviço de Saque
     *
     * Pattern: `\d{8}`
     */
    prestadorDoServicoDeSaque: string;
  };
}

export interface PixValorJuros {
  juros?: {
    /**
     * Valor dos juros.
     *
     * Pattern: `\d{1,10}\.\d{2}`
     */
    valor: string;
  };
}

export interface PixValorMulta {
  multa?: {
    /**
     * Valor da multa.
     *
     * Pattern: `\d{1,10}\.\d{2}`
     */
    valor: string;
  };
}

export interface PixValorDesconto {
  desconto?: {
    /**
     * Valor do desconto.
     *
     * Pattern: `\d{1,10}\.\d{2}`
     */
    valor: string;
  };
}

export interface PixValorAbatimento {
  abatimento?: {
    /**
     * Valor do abatimento.
     *
     * Pattern: `\d{1,10}\.\d{2}`
     */
    valor: string;
  };
  /** Filtro pela existência de txid. */
  txIdPresente?: boolean;
  /** Filtro pela existência de devolução. */
  devolucaoPresente?: boolean;
  /**
   * CPF
   *
   * Pattern: `\d{11}`
   */
  cpf?: string;
  /**
   * CNPJ
   *
   * Pattern: `\d{14}`
   */
  cnpj?: string;
  /** Paginação */
  paginacao?: Paginacao;
}

/** Parâmetros utilizados para a realização de uma consulta de Webhooks. */
export interface ParametrosConsultaWebhooks {
  /**
   * Data inicial utilizada na consulta. Respeita RFC 3339.
   *
   * @example "2020-01-01T00:00:00Z"
   */
  inicio?: string;
  /**
   * Data de fim utilizada na consulta. Respeita RFC 3339.
   *
   * @example "2020-12-01T17:00:00Z"
   */
  fim?: string;
  /** Paginação */
  paginacao?: Paginacao;
}

/** Pix Consultados */
export interface PixConsultados {
  /** Parâmetros utilizados para a realização de uma consulta de Pix. */
  parametros: ParametrosConsultaPix;
  /** Lista de Pix recebidos */
  pix?: Pix[];
}

/** Webhooks Consultados */
export interface WebhooksConsultados {
  /** Parâmetros utilizados para a realização de uma consulta de Webhooks. */
  parametros?: ParametrosConsultaWebhooks;
  /** Lista de Webhooks consultados */
  webhooks: WebhookCompleto[];
}

/**
 * Não é permitido que o campo devedor.cpf e campo devedor.cnpj estejam preenchidos ao mesmo tempo. Se o campo devedor.nome está preenchido, então deve existir ou um devedor.cpf ou um campo devedor.cnpj preenchido.
 *
 * Os campos aninhados sob o objeto devedor são opcionais e identificam a pessoa ou a instituição a quem a cobrança está endereçada. Não identifica, necessariamente, quem irá efetivamente realizar o pagamento.
 */
export interface Devedor {
  /** Pessoa Jurídica */
  pessoaJuridica?: PessoaJuridica;
  /** Pessoa Física */
  pessoaFisica?: PessoaFisica;
}

/** Paginação */
export interface Paginacao {
  /**
   * Número da página recuperada.
   *
   * Range: 0..∞
   */
  paginaAtual: number;
  /**
   * Quantidade de registros retornado na página.
   *
   * Range: 1..∞
   */
  itensPorPagina: number;
  /**
   * Quantidade de páginas disponíveis para consulta.
   *
   * Range: 1..∞
   */
  quantidadeDePaginas: number;
  /**
   * Quantidade total de itens disponíveis de acordo com os parâmetros informados.
   *
   * Range: 0..∞
   */
  quantidadeTotalDeItens: number;
}

/** Violações */
export interface Violacao {
  /**
   * Descrição do erro
   *
   * @example "Valor da cobrança não pode ser 0.00"
   */
  razao?: string;
  /**
   * Nome da propriedade
   *
   * @example "cob.chave"
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
   * URI de referência que identifica o tipo de problema. De acordo com a RFC 7807.
   *
   * Format: `uri`
   *
   * @example "https://pix.bcb.gov.br/api/v2/error/NaoEncontrado"
   */
  type: string;
  /**
   * Descrição resumida do problema.
   *
   * @example "Not found"
   */
  title: string;
  /**
   * Código HTTP do status retornado.
   *
   * @example 404
   */
  status: number;
  /** Descrição completa do problema. */
  detail?: string;
  /** Identificador de correlação do problema para fins de suporte */
  correlationId?: string;
  violacoes?: Violacao[];
}

export interface TermoModel {
  /** @example "https://bkt-uat-projetos.s3.amazonaws.com/sme/termos/CC038-1.pdf" */
  url?: string;
  /**
   * Format: `date-time`
   *
   * @example "2020-01-01 08:00:00"
   */
  data?: string;
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
  /** Corpo enviado na requisição. */
  payload: Record<string, unknown>;
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
  /** Mensagem de erro em caso de falha no disparo do callback. */
  mensagemErro?: string;
}

export interface PagarCobrancaPix {
  valor: number;
}

export interface PagarCobrancaPixResponse {
  e2e: string;
}

export interface RetryCallbacksRequestBody {
  /** Lista de TXID's das transações que deseja reenviar o callback */
  txId: string[];
  /**
   * Chave Pix usada nas transações que deseja reenviar os callbacks. A chave pix deve ser a mesma para todos os TXID's
   */
  chavePix: string;
}

export interface RetryCallbackResponse {
  /** Lista dos códigos identificadores em que o reenvio foi solicitado com sucesso. */
  foundIds?: string[];
}

export interface MakePaymentCobCobv {
  /**
   * URL do pixCopiaECola.
   *
   * @example "000201010200661010014BR.GOV.BCB.PIX2009url-exemplo.qrcode.sandbox.co/pj-s/v2/cob/f5c23856e5694ed48607ab0bd0172496520400005309863540550.005802BR5901*6013BELO HORIZONT61089999999962070503***801000014BR.GOV.BCB.PIX2578cdpj-sandbox.partners.uatinter.co/pj-s/v2/rec/60eb10961d744397903cdc376c3ae8a56300288A"
   */
  qrCode: string;
  /**
   * Valor a ser pago.
   *
   * @example 100
   */
  valor: number;
}

export interface MakePaymentCobCobvResponse {
  /** @example "E00416968202406141552CmNRIqASznP" */
  endToEnd: string;
}

/**
 * Query parameters for `GET /pix/v2/cob`.
 * Consultar lista de cobranças imediatas
 */
export interface GetCobQuery {
  /**
   * Formato: yyyy-MM-dd'T'HH:mm:ss[.SSS]XXX
   *
   * Format: `date-time`
   */
  inicio: string;
  /**
   * Formato: yyyy-MM-dd'T'HH:mm:ss[.SSS]XXX
   *
   * Format: `date-time`
   */
  fim: string;
  /** Filtro pelo CPF do devedor. Não pode ser utilizado ao mesmo tempo que o CNPJ. */
  cpf?: string;
  /** Filtro pelo CNPJ do devedor. Não pode ser utilizado ao mesmo tempo que o CPF. */
  cnpj?: string;
  locationPresente?: boolean;
  /**
   * Estado do registro da cobrança. Não se confunde com o estado da cobrança em si, ou seja, não guarda relação com o fato de a cobrança encontrar-se vencida ou expirada, por exemplo.
   *
   * Os status são assim definidos:
   * - `ATIVA`: indica que o registro se refere a uma cobrança que foi gerada mas ainda não foi paga nem removida;
   * - `CONCLUIDA`: indica que o registro se refere a uma cobrança que já foi paga e, por conseguinte, não pode acolher outro pagamento;
   * - `REMOVIDO_PELO_USUARIO_RECEBEDOR`: indica que o usuário recebedor solicitou a remoção do registro da cobrança; e
   * - `REMOVIDO_PELO_PSP`: indica que o PSP Recebedor solicitou a remoção do registro da cobrança.
   */
  status?: "ATIVA" | "CONCLUIDA" | "REMOVIDA_PELO_USUARIO_RECEBEDOR" | "REMOVIDA_PELO_PSP";
  /**
   * Página a ser retornada pela consulta. Se não for informada, o PSP assumirá que será 0.
   *
   * Format: `int32`
   * Default: `0`
   */
  "paginacao.paginaAtual"?: number;
  /**
   * Quantidade máxima de registros retornados em cada página. Apenas a última página pode conter uma quantidade menor de registros.
   *
   * Format: `int32`
   * Range: -∞..1000
   * Default: `100`
   */
  "paginacao.itensPorPagina"?: number;
}

/**
 * Query parameters for `GET /pix/v2/cobv`.
 * Consultar lista de cobranças com vencimento
 */
export interface GetCobvQuery {
  /**
   * Formato: yyyy-MM-dd'T'HH:mm:ss[.SSS]XXX
   *
   * Format: `date-time`
   */
  inicio: string;
  /**
   * Formato: yyyy-MM-dd'T'HH:mm:ss[.SSS]XXX
   *
   * Format: `date-time`
   */
  fim: string;
  /** Filtro pelo CPF do devedor. Não pode ser utilizado ao mesmo tempo que o CNPJ. */
  cpf?: string;
  /** Filtro pelo CNPJ do devedor. Não pode ser utilizado ao mesmo tempo que o CPF. */
  cnpj?: string;
  locationPresente?: boolean;
  /**
   * Estado do registro da cobrança. Não se confunde com o estado da cobrança em si, ou seja, não guarda relação com o fato de a cobrança encontrar-se vencida ou expirada, por exemplo.
   *
   * Os status são assim definidos:
   * - `ATIVA`: indica que o registro se refere a uma cobrança que foi gerada mas ainda não foi paga nem removida;
   * - `CONCLUIDA`: indica que o registro se refere a uma cobrança que já foi paga e, por conseguinte, não pode acolher outro pagamento;
   * - `REMOVIDO_PELO_USUARIO_RECEBEDOR`: indica que o usuário recebedor solicitou a remoção do registro da cobrança; e
   * - `REMOVIDO_PELO_PSP`: indica que o PSP Recebedor solicitou a remoção do registro da cobrança.
   */
  status?: "ATIVA" | "CONCLUIDA" | "REMOVIDA_PELO_USUARIO_RECEBEDOR" | "REMOVIDA_PELO_PSP";
  /**
   * Página a ser retornada pela consulta. Se não for informada, o PSP assumirá que será 0.
   *
   * Format: `int32`
   * Default: `0`
   */
  "paginacao.paginaAtual"?: number;
  /**
   * Quantidade máxima de registros retornados em cada página. Apenas a última página pode conter uma quantidade menor de registros.
   *
   * Format: `int32`
   * Range: -∞..1000
   * Default: `100`
   */
  "paginacao.itensPorPagina"?: number;
  /**
   * Id do lote de cobrança com vencimento.
   *
   * Format: `int32`
   */
  loteCobVId?: number;
}

/**
 * Query parameters for `GET /pix/v2/lotecobv`.
 * Consultar lotes de cobranças com vencimento
 */
export interface LotecobvGetQuery {
  /**
   * Filtra os registros cuja data de criação seja maior ou igual que a data de início. Respeita RFC 3339.
   *
   * Format: `date-time`
   */
  inicio: Inicio;
  /**
   * Filtra os registros cuja data de criação seja menor ou igual que a data de fim. Respeita RFC 3339.
   *
   * Format: `date-time`
   */
  fim: Fim;
  /**
   * Página a ser retornada pela consulta. Se não for informada, o PSP assumirá que será 0.
   *
   * Format: `int32`
   * Default: `0`
   */
  "paginacao.paginaAtual"?: number;
  /**
   * Quantidade máxima de registros retornados em cada página. Apenas a última página pode conter uma quantidade menor de registros.
   *
   * Format: `int32`
   * Range: -∞..1000
   * Default: `100`
   */
  "paginacao.itensPorPagina"?: number;
}

/**
 * Query parameters for `GET /pix/v2/loc`.
 * Consultar locations cadastradas
 */
export interface GetLocQuery {
  /**
   * Formato: yyyy-MM-dd'T'HH:mm:ss[.SSS]XXX
   *
   * Format: `date-time`
   */
  inicio: string;
  /**
   * Formato: yyyy-MM-dd'T'HH:mm:ss[.SSS]XXX
   *
   * Format: `date-time`
   */
  fim: string;
  txIdPresente?: boolean;
  tipoCob?: "cob" | "cobv";
  /**
   * Página a ser retornada pela consulta. Se não for informada, o PSP assumirá que será 0.
   *
   * Format: `int32`
   * Default: `0`
   */
  "paginacao.paginaAtual"?: number;
  /**
   * Quantidade máxima de registros retornados em cada página. Apenas a última página pode conter uma quantidade menor de registros.
   *
   * Format: `int32`
   * Range: -∞..1000
   * Default: `100`
   */
  "paginacao.itensPorPagina"?: number;
}

/**
 * Query parameters for `GET /pix/v2/pix`.
 * Consultar pix recebidos
 */
export interface GetPixQuery {
  /**
   * Formato: yyyy-MM-dd'T'HH:mm:ss[.SSS]XXX
   *
   * Format: `date-time`
   */
  inicio: string;
  /**
   * Formato: yyyy-MM-dd'T'HH:mm:ss[.SSS]XXX
   *
   * Format: `date-time`
   */
  fim: string;
  /** Pattern: `[a-zA-Z0-9]{26,35}` */
  txId?: string;
  txIdPresente?: boolean;
  devolucaoPresente?: boolean;
  /** Filtro pelo CPF do devedor. Não pode ser utilizado ao mesmo tempo que o CNPJ. */
  cpf?: string;
  /** Filtro pelo CNPJ do devedor. Não pode ser utilizado ao mesmo tempo que o CPF. */
  cnpj?: string;
  /**
   * Página a ser retornada pela consulta. Se não for informada, o PSP assumirá que será 0.
   *
   * Format: `int32`
   * Default: `0`
   */
  "paginacao.paginaAtual"?: number;
  /**
   * Quantidade máxima de registros retornados em cada página. Apenas a última página pode conter uma quantidade menor de registros.
   *
   * Format: `int32`
   * Range: -∞..1000
   * Default: `100`
   */
  "paginacao.itensPorPagina"?: number;
}

/**
 * Query parameters for `GET /pix/v2/webhook/callbacks`.
 * Consultar callbacks
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
  /** txId do callback, caso queira filtrar as notificações de algum pagamento específico. */
  txid?: string;
}
