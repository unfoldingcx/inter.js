// ---------------------------------------------------------------------------
// API Banking
// Generated from specs/banking.json by scripts/generate.ts - do not edit.
// Base path: /banking/v2
// ---------------------------------------------------------------------------

export interface EfetuarPagamento {
  /**
   * Código de barras ou linha digitável.
   *
   * @example "07797000000000000004501008460019310001802680"
   */
  codBarraLinhaDigitavel: string;
  /**
   * Valor a ser pago.
   *
   * @example "26.80"
   */
  valorPagar: string;
  /**
   * Data para efetivar o pagamento. Se não informada, o pagamento será feito no mesmo dia.
   * Formato aceito: YYYY-MM-DD
   *
   * @example "2023-08-18"
   */
  dataPagamento?: string;
  /**
   * Data de vencimento do título.
   * Formato aceito: YYYY-MM-DD
   *
   * @example "2021-07-27"
   */
  dataVencimento: string;
  /**
   * CPF/CNPJ do beneficiário! Caso informado, será realizada a validação do campo em questão. Formato aceito: 12345678912345
   *
   * Pattern: `^[0-9]{11}$|^[0-9]{14}$`
   *
   * @example "12345678912345"
   */
  cpfCnpjBeneficiario?: string;
}

/** EfetuarPagamentoResponse */
export interface EfetuarPagamentoResponse {
  /**
   * Format: `int32`
   *
   * @example 2
   */
  quantidadeAprovadores?: number;
  /** @example "2019-10-10 13:00:00" */
  dataAgendamento?: string;
  statusPagamento?: SituacaoPagamento;
  /** @example "8bbdede4-35db-4ec9-b652-e176841e62c8" */
  codigoTransacao?: string;
}

export type SituacaoPagamento = "EMPROCESSAMENTO" | "AGENDADO_CANCELADO" | "AGUARDANDO_APROVACAO" | "APROVADO" | "CANCELADO" | "AGENDADO" | "REALIZADO" | "ERRO" | "APROVACAO_EXPIRADA" | "REPROVADO" | "NAO_COMPENSADO";

/** DadosBoleto */
export interface BoletoResponse {
  /** Pessoa */
  beneficiario?: Pessoa;
  /** Pessoa */
  pagador?: Pessoa;
  /**
   * Format: `double`
   *
   * @example 120.5
   */
  valorNominal?: number;
  /**
   * Format: `double`
   *
   * @example 10
   */
  desconto?: number;
  /**
   * Format: `double`
   *
   * @example 13.2
   */
  multa?: number;
  /**
   * Format: `double`
   *
   * @example 3
   */
  juros?: number;
  /**
   * Format: `double`
   *
   * @example 120.5
   */
  valorPagar?: number;
  /**
   * Format: `double`
   *
   * @example 50
   */
  valorMinimo?: number;
  /**
   * Format: `double`
   *
   * @example 1500
   */
  valorMaximo?: number;
  /**
   * Format: `date`
   *
   * @example "2030-05-10"
   */
  vencimento?: string;
  /** StatusPagamento */
  statusPagamento?: StatusPagamento;
  /** Convenio */
  convenio?: Convenio;
  /**
   * Format: `date`
   *
   * @example "2019-10-10"
   */
  dataLimitePagamento?: string;
  /** @example "Banco Inter" */
  instituicaoEmissora?: string;
  /** @example false */
  pagamentoParcial?: boolean;
  /**
   * Format: `double`
   *
   * @example 20
   */
  totalEncargos?: number;
  /** @example false */
  permiteAgendamento?: boolean;
  /** @example "846600000026266702962017910100130004000625169925" */
  linhaDigitavel?: string;
  /** @example "81670000001283647972020063000000000294909999" */
  codigoBarra?: string;
  /** @example 31 */
  codigoEspecie?: string;
  /** @example false */
  pagamentoBloqueado?: boolean;
  /** @example false */
  boletoVencido?: boolean;
  /** @example "16:00" */
  horarioLimitePagamento?: string;
  /** Alerta */
  alerta?: Alerta;
  /** @example "077" */
  codigoBanco?: string;
  /** @example "Aberto" */
  situacaoTituloPagamento?: string;
}

/** Pessoa */
export interface Pessoa {
  /**
   * Nome Pessoa/Empresa
   *
   * @example "Banco Loren"
   */
  nome?: string;
  /**
   * CPF/CNPJ
   *
   * @example 27395669000186
   */
  cpfCnpj?: string;
  /** @example "banco inter" */
  nomeFantasia?: string;
  /** @example "Banco Loren" */
  razaoSocial?: string;
}

/** StatusPagamento */
export interface StatusPagamento {
  /**
   * Se o título já foi pago ou não
   *
   * @example true
   */
  pago?: boolean;
  /**
   * Data do pagamento (String formatada)
   *
   * @example "2019-03-27"
   */
  data?: string;
  /**
   * Se permite mais de um pagamento
   *
   * @example true
   */
  permitePagamentoMultiplo?: boolean;
  /**
   * Format: `double`
   *
   * @example 133
   */
  valor?: number;
}

/** Convenio */
export interface Convenio {
  /**
   * Descrição
   *
   * @example 123
   */
  descricao?: string;
  /**
   * Se o título esta habilitado para cadastro debito automatico
   *
   * @example true
   */
  debitoAutomatico?: boolean;
  /**
   * Segmento do Convênio
   *
   * @example "ENERGIA_ELETRICA_GAS"
   */
  segmento?: string;
  /** Código da empresa */
  codigoEmpresa?: string;
  /**
   * Tipo de convênio configurado
   *
   * @example "IS2B"
   */
  tipoConvenio?: string;
  /**
   * Abrangência do convênio. Nacional ou Municipal
   *
   * @example "NACIONAL"
   */
  abrangenciaConvenio?: string;
  /**
   * Código do Município
   *
   * @example "123456"
   */
  codigoMunicipio?: string;
}

/** InformacoesPagamento */
export interface InformacoesPagamento {
  /** @example "3414f226-36fb-4d87-811e-cfd99911d845" */
  codigoTransacao?: string;
  /** @example 2.3791908400000545e+43 */
  codigoBarra?: string;
  /** @example "Pagamento Xpto" */
  tipo?: string;
  /** @example "2019-10-10 13:00:00" */
  dataVencimentoDigitada?: string;
  /** @example "2019-10-10 13:00:00" */
  dataVencimentoTitulo?: string;
  /** @example "2019-10-10 13:00:00" */
  dataInclusao?: string;
  /** @example "2019-10-10 13:00:00" */
  dataPagamento?: string;
  /** @example 85.9 */
  valorPago?: number;
  /** @example 85.9 */
  valorNominal?: number;
  statusPagamento?: SituacaoPagamento;
  /**
   * Aprovações necessárias para o pagamento ser aprovado.
   *
   * @example 2
   */
  aprovacoesNecessarias?: number;
  /**
   * Aprovações já realizadas.
   *
   * @example 2
   */
  aprovacoesRealizadas?: number;
  /** @example "123456789-01" */
  cpfCnpjBeneficiario?: string;
  /** @example "João 123" */
  nomeBeneficiario?: string;
  /** @example 3.1408993599359996e+29 */
  autenticacao?: string;
  /**
   * Número sequencial único, exclusivo para uso no Inter.
   *
   * @example "82127399"
   */
  nsu?: string;
}

/** InformacoesPagamento */
export interface InformacoesPagamentoDarf {
  /** @example "3414f226-36fb-4d87-811e-cfd99911d845" */
  codigoSolicitacao?: string;
  /** @example "PRETO" */
  tipoDarf?: string;
  /** @example 50.96 */
  valor?: number;
  /** @example 0 */
  valorMulta?: number;
  /** @example 0 */
  valorJuros?: number;
  /** @example 50.96 */
  valorTotal?: number;
  /** @example "Darf" */
  tipo?: string;
  /** @example "2019-10-10 13:00:00" */
  periodoApuracao?: string;
  /** @example "2019-10-10 13:00:00" */
  dataPagamento?: string;
  /** @example 424562562565 */
  referencia?: string;
  /** @example "2019-10-10 13:00:00" */
  dataVencimento?: string;
  /**
   * Length: 4..4
   *
   * @example 190
   */
  codigoReceita?: string;
  statusPagamento?: SituacaoPagamento;
  /** @example "2019-10-10 13:00:00" */
  dataInclusao?: string;
  /** @example "84668147010" */
  cnpjCpf?: string;
  /**
   * Aprovações necessárias para o pagamento ser aprovado.
   *
   * @example 4
   */
  aprovacoesNecessarias?: number;
  /**
   * Aprovações já realizadas.
   *
   * @example 2
   */
  aprovacoesRealizadas?: number;
}

/** Alerta */
export interface Alerta {
  /**
   * Titulo do alerta
   *
   * @example "Titulo"
   */
  titulo?: string;
  /**
   * Mensagem do alerta
   *
   * @example "Mensagem"
   */
  mensagem?: string;
}

export interface Saldo {
  /**
   * Saldo bloqueado (cheque). Retornando apenas quando **não** é informado a "dataSaldo" na requisição.
   *
   * Format: `int64`
   *
   * @example 240.25
   */
  bloqueadoCheque?: number;
  /**
   * Saldo líquido
   *
   * Format: `int64`
   *
   * @example 2850.55
   */
  disponivel?: number;
  /**
   * Saldo bloqueado (justiça). Retornando apenas quando **não** é informado a "dataSaldo" na requisição.
   *
   * Format: `int64`
   *
   * @example 510.35
   */
  bloqueadoJudicialmente?: number;
  /**
   * Saldo bloqueado (justiça). Retornando apenas quando **não** é informado a "dataSaldo" na requisição.
   *
   * Format: `int64`
   *
   * @example 510.35
   */
  bloqueadoAdministrativo?: number;
  /**
   * Limite de credito da conta. Retornando apenas quando **não** é informado a "dataSaldo" na requisição.
   *
   * Format: `int64`
   *
   * @example 510.35
   */
  limite?: number;
  /**
   * A data referência será retornada quando a consulta for realizada em um dia não útil. Visto que o saldo não é sensibilizado em dias não úteis, será retornada à data referência do saldo, sendo o último dia útil.
   *
   * @example "01/01/2024"
   */
  dataReferencia?: string;
}

export interface ListaTransacoes {
  transacoes?: TransacaoSimples[];
}

export interface ListaTransacoesCompletaPadrao {
  /**
   * Quantidade total de páginas disponíveis para consulta.
   *
   * Range: 1..∞
   *
   * @example 1
   */
  totalPaginas?: TotalPaginas;
  /**
   * Quantidade total de itens disponíveis de acordo com os parâmetros informados.
   *
   * Format: `int64`
   * Range: 0..∞
   */
  totalElementos?: TotalElementos;
  /**
   * Última página
   *
   * @example true
   */
  ultimaPagina?: UltimaPagina;
  /**
   * Primeira página
   *
   * @example true
   */
  primeiraPagina?: PrimeiraPagina;
  /**
   * Quantidade de registros por página, configurado na requisição.
   *
   * Range: 1..∞
   *
   * @example 20
   */
  tamanhoPagina?: TamanhoPagina;
  /**
   * Quantidade de registros retornado na página atual.
   *
   * Range: 1..∞
   */
  numeroDeElementos?: NumeroDeElementos;
  transacoes?: TransacaoCompleta[];
}

/**
 * Resposta para consultas usando modo scroll. Retornado quando
 * headers `x-inter-scroll-enabled` ou `x-inter-scroll-id` são utilizados.
 */
export interface ListaTransacoesCompletaScroll {
  /**
   * Quantidade total de itens disponíveis de acordo com os parâmetros informados.
   *
   * Format: `int64`
   * Range: 0..∞
   */
  totalElementos?: TotalElementos;
  /**
   * ID único do scroll para continuar a navegação. Use este valor no
   * header `x-inter-scroll-id` das próximas requisições.
   * Quando `hasMore: false`, este campo será `null` indicando que o
   * scroll foi finalizado e removido.
   *
   * Format: `uuid`
   *
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  scrollId?: string | null;
  /**
   * Indica se existem mais transações para serem recuperadas. Quando `false`, o scroll é automaticamente removido.
   *
   * @example true
   */
  hasMore?: boolean;
  transacoes?: TransacaoCompleta[];
}

export interface PdfModel {
  /** Base64 do PDF */
  pdf?: string;
}

export interface TransacaoSimples {
  cpmf?: string;
  /** Format: `date` */
  dataEntrada?: string;
  /**
   * Transação vinculada a movimentação
   * * `DEBITO_EM_CONTA`
   * * `DEPOSITO_BOLETO`
   * * `ANTECIPACAO_RECEBIVEIS`
   * * `ANTECIPACAO_RECEBIVEIS_CARTAO`
   * * `BOLETO_COBRANCA`
   * * `CAMBIO`
   * * `CASHBACK`
   * * `CHEQUE`
   * * `ESTORNO`
   * * `DOMICILIO_CARTAO`
   * * `FINANCIAMENTO`
   * * `IMPOSTO`
   * * `INTERPAG`
   * * `INVESTIMENTO`
   * * `JUROS`
   * * `MAQUININHA_GRANITO`
   * * `MULTA`
   * * `OUTROS`
   * * `PAGAMENTO`
   * * `PIX`
   * * `PROVENTOS`
   * * `SAQUE`
   * * `COMPRA_DEBITO`
   * * `DEBITO_AUTOMATICO`
   * * `TARIFA`
   * * `TRANSFERENCIA`
   */
  tipoTransacao?: string;
  /**
   * Tipo de operação realizada
   * * `D` - Débito(Saída)
   * * `C` - Crédito(Entrada)
   */
  tipoOperacao?: string;
  valor?: string;
  titulo?: string;
  descricao?: string;
}

export interface TransacaoCompleta {
  idTransacao?: string;
  /** Format: `date` */
  dataInclusao?: string;
  /** Format: `date` */
  dataTransacao?: string;
  /**
   * Transação vinculada a movimentação
   * * `DEBITO_EM_CONTA`
   * * `DEPOSITO_BOLETO`
   * * `ANTECIPACAO_RECEBIVEIS`
   * * `ANTECIPACAO_RECEBIVEIS_CARTAO`
   * * `BOLETO_COBRANCA`
   * * `CAMBIO`
   * * `CASHBACK`
   * * `CHEQUE`
   * * `ESTORNO`
   * * `DOMICILIO_CARTAO`
   * * `FINANCIAMENTO`
   * * `IMPOSTO`
   * * `INTERPAG`
   * * `INVESTIMENTO`
   * * `JUROS`
   * * `MAQUININHA_GRANITO`
   * * `MULTA`
   * * `OUTROS`
   * * `PAGAMENTO`
   * * `PIX`
   * * `PROVENTOS`
   * * `SAQUE`
   * * `COMPRA_DEBITO`
   * * `DEBITO_AUTOMATICO`
   * * `TARIFA`
   * * `TRANSFERENCIA`
   */
  tipoTransacao?: string;
  /**
   * Tipo de operação realizada
   * * `D` - Débito(Saída)
   * * `C` - Crédito(Entrada)
   */
  tipoOperacao?: string;
  valor?: string;
  titulo?: string;
  descricao?: string;
  numeroDocumento?: string;
  detalhes?: DetalhePix | DetalheBoletoCobranca | DetalheCashback | DetalheCheque | DetalheCompraDebito | DetalheDepositoBoleto | DetalheTransferencia | DetalhePagamento | DetalheTarifa;
}

export type TransacaoCompletaSemDetalhe = TransacaoCompleta;

export type TransacaoCompletaComDetalhe = TransacaoCompleta & {
  detalhes: Record<string, unknown>;
};

/**
 * Quantidade total de páginas disponíveis para consulta.
 *
 * OpenAPI schema: `totalPaginas`
 */
export type TotalPaginas = number;

/**
 * Quantidade total de itens disponíveis de acordo com os parâmetros informados.
 *
 * OpenAPI schema: `totalElementos`
 */
export type TotalElementos = number;

/**
 * Última página
 *
 * OpenAPI schema: `ultimaPagina`
 */
export type UltimaPagina = boolean;

/**
 * Primeira página
 *
 * OpenAPI schema: `primeiraPagina`
 */
export type PrimeiraPagina = boolean;

/**
 * Quantidade de registros por página, configurado na requisição.
 *
 * OpenAPI schema: `tamanhoPagina`
 */
export type TamanhoPagina = number;

/**
 * Quantidade de registros retornado na página atual.
 *
 * OpenAPI schema: `numeroDeElementos`
 */
export type NumeroDeElementos = number;

/** detalhes de transações de BOLETO_COBRANCA */
export type TransacaoBoletoCobranca = TransacaoCompleta & {
  /** Boleto Cobrança */
  detalhes?: DetalheBoletoCobranca;
};

/** detalhes de transações de PAGAMENTO */
export type TransacaoPagamento = TransacaoCompleta & {
  /** Pagamento */
  detalhes?: DetalhePagamento;
};

/** detalhes de transações de PIX */
export type TransacaoPix = TransacaoCompleta & {
  /** Pix */
  detalhes?: DetalhePix;
};

/** detalhes de transações de PIX */
export type TransacaoTransferencia = TransacaoCompleta & {
  /** Transferência */
  detalhes?: DetalheTransferencia;
};

/** detalhes de transações de CASHBACK */
export type TransacaoCashback = TransacaoCompleta & {
  /** Cashback */
  detalhes?: DetalheCashback;
};

/** detalhes de transações de DEPOSITO_BOLETO */
export type TransacaoDepositoBoleto = TransacaoCompleta & {
  /** Depósito Boleto */
  detalhes?: DetalheDepositoBoleto;
};

/** detalhes de transações de COMPRA_DEBITO */
export type TransacaoCompraDebito = TransacaoCompleta & {
  /** Compra Débito */
  detalhes?: DetalheCompraDebito;
};

/** detalhes de transações de CHEQUE */
export type TransacaoCheque = TransacaoCompleta & {
  /** Cheque */
  detalhes?: DetalheCheque;
};

/** Cheque */
export interface DetalheCheque {
  /** @example "0072" */
  agencia?: string;
  /** @example "000219" */
  numeroChequeBancario?: string;
  /** @example "" */
  contaBancaria?: string;
  dataRetorno?: string;
  /** @example "" */
  motivoRetorno?: string;
  /** @example "Cheque Bancário" */
  descricaoChequeBancario?: string;
  /** @example "BCO SANTANDER (BRASIL) S.A" */
  nomeEmpresa?: string;
  /** @example "COMPLETE" */
  tipoDetalhe?: string;
  /** @example "033" */
  codigoAfiliado?: string;
}

/** Compra Débito */
export interface DetalheCompraDebito {
  /** @example "Loja teste" */
  estabelecimento?: string;
  /** @example "COMPLETE" */
  tipoDetalhe?: string;
}

/** Depósito Boleto */
export interface DetalheDepositoBoleto {
  /** @example "2022-07-12" */
  dataVencimento?: string;
  /** @example "COMPLETE" */
  tipoDetalhe?: string;
  /** @example "2022-07-09" */
  dataEmissao?: string;
  /** @example "7777011657373795603057629" */
  nossoNumero?: string;
  /** @example "07795904400000500007777011657373795603057629" */
  codBarras?: string;
}

/** Cashback */
export interface DetalheCashback {
  /** @example "60.00" */
  valorCompra?: string;
  /** @example "TIM" */
  produto?: string;
  /** @example "COMPLETE" */
  tipoDetalhe?: string;
}

/** Transferência */
export interface DetalheTransferencia {
  /** @example "9733000" */
  contaBancariaPagador?: string;
  /** @example "transferência" */
  descricaoTransferencia?: string;
  /** @example "0001" */
  agenciaPagador?: string;
  /** @example "Nu Pagamentos" */
  bancoRecebedor?: string;
  /** @example "1372125" */
  contaBancariaRecebedor?: string;
  /** @example "07857016640" */
  cpfCnpjRecebedor?: string;
  /** @example "905.678.996-16" */
  cpfCnpjPagador?: string;
  /** @example "Nome" */
  nomePagador?: string;
  /** @example "Banco Inter" */
  nomeEmpresaPagador?: string;
  /** @example "Fernanda" */
  nomeRecebedor?: string;
  /** @example "COMPLETE" */
  tipoDetalhe?: string;
  /** @example "PAG20220621248759639" */
  idTransferencia?: string;
  /** @example "0001" */
  agenciaRecebedor?: string;
  /** @example "21/06/2022" */
  dataEfetivacao?: string;
}

/** Pix */
export interface DetalhePix {
  /**
   * ID de identificação do documento.
   * Seu objetivo é possibilitar a conciliação de pagamentos.
   *
   * @example "Rv1pt4pjd2jtjdzx5nafhtjks7"
   */
  txId?: string;
  /** @example "Nome Pagador" */
  nomePagador?: string;
  /** @example "Pagamento do aluguel" */
  descricaoPix?: string;
  /** @example "90105709247" */
  cpfCnpjPagador?: string;
  /** @example "17687786" */
  contaBancariaRecebedor?: string;
  /** @example "Banco Inter" */
  nomeEmpresaPagador?: string;
  /** @example "COMPLETE" */
  tipoDetalhe?: string;
  /**
   * Id único para identificação do pagamento Pix.
   *
   * @example "E00416968202206201436ghzKRVgnb7A"
   */
  endToEndId?: string;
  /** @example "+5531985443142" */
  chavePixRecebedor?: string;
  /** @example "CAIXA ECONOMICA FEDEREAL" */
  nomeEmpresaRecebedor?: string;
  /** @example "Nome Recebedor" */
  nomeRecebedor?: string;
  /** @example "0089" */
  agenciaRecebedor?: string;
  /** @example "04993960654" */
  cpfCnpjRecebedor?: string;
  /** @example "CHAVE" */
  origemMovimentacao?: string;
  /** @example "f6a4de9c-4630-4806-b349-8cd96ea67d12" */
  codigoSolicitacao?: string;
}

/** Pagamento */
export interface DetalhePagamento {
  /** @example "13.45" */
  valorTotal?: string;
  /** @example "Pagamento" */
  detalheDescricao?: string;
  /** @example "0008579377" */
  contaBancaria?: string;
  /** @example "0001-9" */
  agencia?: string;
  /** @example "0.0" */
  adicionado?: string;
  /** @example "2022-11-08" */
  dataVencimento?: string;
  /** @example "001" */
  codigoAfiliado?: string;
  /** @example "CAIXA ECONOMICA FEDERAL" */
  empresaEmissora?: string;
  /** @example "13.45" */
  valorOriginal?: string;
  /** @example "0.0" */
  desconto?: string;
  /** @example "00436923000190" */
  cpfCnpj?: string;
  /** @example "25.50" */
  valorPrincipal?: string;
  periodoApuracao?: string;
  /** @example "0.0" */
  valorAumentado?: string;
  /** @example "10491916300000013453395782000100040000022263" */
  codBarras?: string;
  /** @example "0.0" */
  valorParcial?: string;
  /** @example "16h56" */
  hora?: string;
  /** @example "0.0" */
  juros?: string;
  /** @example "0.0" */
  multa?: string;
  /** @example "Banco Inter" */
  empresaOrigem?: string;
  /** @example "CEDENTE TESTE GEPEC" */
  nomeDestinatario?: string;
  /** @example "COMPLETE" */
  tipoDetalhe?: string;
  /** @example "SACADO TESTE GEPEC" */
  nomeOrigem?: string;
  /** @example "0561" */
  codigoReceita?: string;
  /** @example "07797777051167847115990071126347192950000003010" */
  linhaDigitavel?: string;
  /** @example "314089907290729163000000134528" */
  autenticacao?: string;
}

/** Boleto Cobrança */
export interface DetalheBoletoCobranca {
  /** @example "2022-07-06" */
  dataVencimento?: string;
  /** @example "2022-07-06 11:12:29.810" */
  dataTransacao?: string;
  /** @example "00776396923" */
  nossoNumero?: string;
  /** @example "1616" */
  seuNumero?: string;
  /** @example "07791904700001000000001112056207900776396923" */
  codBarras?: string;
  /** @example "0" */
  juros?: string;
  /** @example "20.00" */
  multa?: string;
  /** @example "11.00" */
  desconto1?: string;
  /** @example "12.00" */
  desconto2?: string;
  /** @example "13.00" */
  desconto3?: string;
  /** @example "BoletoCobranca" */
  nome?: string;
  /** @example "2022-07-17" */
  dataLimite?: string;
  /** @example "COMPLETE" */
  tipoDetalhe?: string;
  /** @example "08942553630" */
  cpfCnpj?: string;
  /** @example "2022-07-06" */
  dataEmissao?: string;
  /** @example "0" */
  abatimento?: string;
}

/** Tarifa */
export interface DetalheTarifa {
  /** @example "2022-07-12" */
  dataVencimento?: string;
  /** @example "2022-07-09" */
  dataEmissao?: string;
  /** @example "2022-07-09" */
  dataTransacao?: string;
  /** @example "00776396923" */
  nossoNumero?: string;
  /** @example "1616" */
  seuNumero?: string;
  /** @example "07791904700001000000001112056207900776396923" */
  codBarras?: string;
  /** @example "E00416968202206201436ghzKRVgnb7A" */
  endToEndId?: string;
}

export type TransactionType = "BOLETO_COBRANCA" | "CAMBIO" | "ESTORNO" | "INVESTIMENTO" | "PAGAMENTO" | "PIX" | "TRANSFERENCIA" | "CASHBACK" | "ANTECIPACAO_RECEBIVEIS_CARTAO" | "DEPOSITO_BOLETO" | "JUROS" | "TARIFA" | "DEBITO_AUTOMATICO" | "COMPRA_DEBITO" | "SAQUE" | "PROVENTOS" | "MULTA" | "MAQUININHA_GRANITO" | "INTERPAG" | "IMPOSTO" | "FINANCIAMENTO" | "DOMICILIO_CARTAO" | "CHEQUE" | "SEGURO";

/** Violação */
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
   */
  type?: string;
  /** Descrição resumida do problema. */
  title: string;
  /** Código HTTP do status retornado. */
  status?: number;
  /** Descrição completa do problema. */
  detail: string;
  /** Data no formato timestamp do erro */
  timestamp?: string;
}

export interface EntidadeNaoProcessavel {
  /**
   * Descrição resumida do problema.
   *
   * @example "Não foi possível processar o QR Code"
   */
  title: string;
  /**
   * Descrição completa do problema.
   *
   * @example "Por favor, verifique com quem o gerou. Você consegue pagar de outra forma, buscando nos favoritos ou inserindo a chave."
   */
  detail?: string;
  /**
   * Data no formato timestamp do erro
   *
   * @example "2023-10-23T13:10:47.149543-03:00"
   */
  timestamp?: string;
}

export interface DarfRequest {
  /**
   * Campo para informar o cpf ou cnpj do pagador
   *
   * Length: 11..20
   *
   * @example "90022400664"
   */
  cnpjCpf: string;
  /**
   * Campo para informar o código da receita
   *
   * Length: 4..4
   *
   * @example "0220"
   */
  codigoReceita: string;
  /**
   * Campo para informar a data de vencimento da DARF
   *
   * Formato aceito: YYYY-MM-DD
   *
   * Format: `date`
   *
   * @example "2022-01-30"
   */
  dataVencimento: string;
  /**
   * Campo para informar a descrição
   *
   * Length: 0..1000
   *
   * @example "Pagamento DARF Janeiro"
   */
  descricao: string;
  /**
   * Campo para informar o nome da empresa
   *
   * Length: 0..100
   *
   * @example "Minha Empresa"
   */
  nomeEmpresa: string;
  /**
   * Campo para informar o telefone da empresa
   *
   * Length: 0..50
   *
   * @example "031999911111"
   */
  telefoneEmpresa?: string;
  /**
   * Campo para informar o período de apuração da DARF
   *
   * Formato aceito: YYYY-MM-DD
   *
   * Format: `date`
   *
   * @example "2020-01-31"
   */
  periodoApuracao: string;
  /**
   * Campo para informar o valor principal
   *
   * @example 47.14
   */
  valorPrincipal: number;
  /**
   * Campo para informar o valor da multa
   *
   * @example 27.48
   */
  valorMulta?: number;
  /**
   * Campo para informar o valor do juros
   *
   * @example 10.11
   */
  valorJuros?: number;
  /**
   * Campo para informar a referência da DARF
   *
   * Pattern: `[0-9]`
   * Length: 0..30
   *
   * @example "13609400849201739"
   */
  referencia: string;
}

/** Objeto para retorno do detalhamento do erro */
export interface ResponseError {
  /** Objeto para retorno do detalhamento do erro */
  erro?: ErrorModel;
}

/** Objeto para retorno do detalhamento do erro */
export interface ErrorModel {
  /**
   * Mensagem de erro.
   *
   * Length: 0..200
   *
   * @example "(Requisição inválida, Erro interno do servidor, ...)"
   */
  mensagem?: string;
  /**
   * Mensagem de erro detalhada.
   *
   * Length: 0..200
   *
   * @example "(Tipo não informado, CPF/CNPJ não pode ser nulo, ...)"
   */
  mensagemDetalhe?: string;
  /**
   * Código da mensagem.
   *
   * @example "(51002, 51001, ...)"
   */
  codigo?: number;
  /**
   * Status da Resposta.
   *
   * @example "(400, 422, ...)"
   */
  status?: number;
}

export interface SucessoDarfResponse {
  /**
   * Identificador retornado pelo Autbank
   *
   * @example 1
   */
  nroOperacao?: number;
  tipoRetorno?: TipoRetornoEnum;
  /**
   * Mensagem de sucesso detalhada
   *
   * @example "Movimentação concluída com sucesso."
   */
  mensagemDetalhe?: string;
  /**
   * Identificador do Pagamento ou Agendamento de DARF
   *
   * @example 1
   */
  codigo?: number;
  /**
   * Autenticação da transação
   *
   * @example "12345678910433"
   */
  autenticacao?: string;
  /**
   * Data de pagamento
   *
   * @example "23/01/2022"
   */
  dataPagamento?: string;
}

export interface DarfResponse {
  /** @example 4 */
  quantidadeAprovadores?: number;
  /**
   * Autenticação da transação
   *
   * @example "12345678910433"
   */
  autenticacao?: string;
  /**
   * Data de pagamento
   *
   * @example "23/01/2022"
   */
  dataPagamento?: string;
  tipoRetorno?: TipoRetornoEnum;
  /** @example "8bbdede4-35db-4ec9-b652-e176841e62c8" */
  codigoSolicitacao?: string;
}

export type TipoRetornoEnum = "PAGAMENTO" | "AGENDAMENTO" | "APROVACAO_PAGAMENTO" | "APROVACAO_AGENDAMENTO";

export type TipoRetornoPagamentoPixEnum = "APROVACAO" | "PROCESSADO" | "AGENDADO";

export interface PagarLoteRequest {
  /**
   * Identificador do lote para o cliente.
   *
   * Length: 0..30
   */
  meuIdentificador?: string;
  /** Pagamentos a serem efetuado. */
  pagamentos: Array<RequestBoletoLote | RequestDarfLote>;
}

export interface PagamentoRequestModelBase {
  tipoPagamento: TipoPagamentoEnum;
}

export interface PagamentoResponseModelBase {
  tipoPagamento?: TipoPagamentoEnum;
  detalhe?: string;
}

export type RequestBoletoLote = PagamentoRequestModelBase & {
  /**
   * Código de barras ou linha digitável
   *
   * Length: 44..48
   *
   * @example "07797000000000000004501008460019310001802680"
   */
  codBarraLinhaDigitavel: string;
  /**
   * Valor a ser pago.
   *
   * Range: 0.01..∞
   *
   * @example "26.80"
   */
  valorPagar: number;
  /**
   * Data em que será pago o título.
   * Formato aceito: YYYY-MM-DD
   *
   * Format: `date`
   *
   * @example "2023-08-18"
   */
  dataPagamento?: string;
  /**
   * Data de vencimento do título.
   * Formato aceito: YYYY-MM-DD
   *
   * Format: `date`
   *
   * @example "2018-07-27"
   */
  dataVencimento: string;
  /**
   * CPF/CNPJ do beneficiário! Caso informado, será realizada a validação do campo em questão. Formato aceito: 12345678912345
   *
   * Pattern: `^[0-9]{11}$|^[0-9]{14}$`
   *
   * @example "12345678912345"
   */
  cpfCnpjBeneficiario?: string;
};

export interface PagamentoPixRequestBody {
  /**
   * Valor do pagamento PIX
   *
   * Format: `double`
   *
   * @example 234.56
   */
  valor: number;
  /**
   * Data solicitada para efetivação do pagamento do Pix (String formatada)
   *
   * Se não for informada, será a data atual.
   *
   * Format aceito: YYYY-MM-DD
   *
   * Format: `date`
   *
   * @example "2025-02-24"
   */
  dataPagamento?: string;
  /** Length: 0..140 */
  descricao?: string;
  destinatario: DestinatarioDadosBancarios | DestinatarioChave | DestinatarioPixCopiaECola;
}

export interface DestinatarioBase {
  /**
   * Tipos de pagamentos que podem ser realizados. Por chave pix, dados bancários ou código Pix Copia E Cola.
   */
  tipo: TipoDestinatario;
}

export type DestinatarioDadosBancarios = DestinatarioBase & {
  contaCorrente: string;
  /** @example "CONTA_CORRENTE" */
  tipoConta: TipoConta;
  cpfCnpj: string;
  agencia: string;
  nome: string;
  instituicaoFinanceira: InstituicaoFinanceira;
};

export type DestinatarioChave = DestinatarioBase & {
  /**
   * Exemplos de tipos:
   * Se email: email do recebedor (ex: fulano.da.silva@example.com)
   * Se CPF/CNPJ: 12345678900 / 00038166000105
   * Se número do telefone celular: +55DD9XXXXXXXX (formato internacional)
   * Se EVP: 123e4567-e12b-12d1-a456-426655440000
   */
  chave: string;
};

export type DestinatarioPixCopiaECola = DestinatarioBase & {
  /** Informar o código Pix Copia e Cola */
  pixCopiaECola: string;
};

/**
 * Tipos de pagamentos que podem ser realizados. Por chave pix, dados bancários ou código Pix Copia E Cola.
 */
export type TipoDestinatario = "CHAVE" | "DADOS_BANCARIOS" | "PIX_COPIA_E_COLA";

export type TipoConta = "CONTA_CORRENTE" | "CONTA_POUPANCA" | "CONTA_SALARIO" | "CONTA_PAGAMENTO";

export interface InstituicaoFinanceira {
  /**
   * Código ISPB, de 8 dígitos, dos bancos
   *
   * @example "01234567"
   */
  ispb: string;
}

export interface PagamentoPixResponse {
  tipoRetorno?: TipoRetornoPagamentoPixEnum;
  /**
   * Codigo da solicitacao do pagamento Pix
   *
   * @example "c42f0787-02cb-4b31-827e-459ec9d7ece1"
   */
  codigoSolicitacao?: string;
  /**
   * Data solicitada para efetivação do pagamento do Pix
   *
   * @example "2025-02-28"
   */
  dataPagamento?: string;
  /**
   * Data em que foi solicitado a inclusão do pagamento do Pix
   *
   * @example "2025-02-24"
   */
  dataOperacao?: string;
}

export interface ConsultaPixAsyncResponse {
  transacaoPix?: PixAsyncResponse;
  historico?: HistoricoResponse[];
}

export interface PixAsyncResponse {
  contaCorrente?: string;
  recebedor?: DadosConta;
  erros?: ErroPagamento[];
  endToEnd?: string;
  valor?: number;
  /**
   * Status atual da transação Pix
   * * `CRIADO`
   * * `AGUARDANDO_APROVACAO`
   * * `APROVADO`
   * * `REPROVADO`
   * * `EXPIRADO`
   * * `CANCELADO`
   * * `FALHA`
   * * `AGENDADO`
   * * `PAGO`
   * * `ENVIADO`
   * * `CANCELADO_SEM_SALDO`
   * * `DEBITADO`
   * * `PARCIALMENTE_DEBITADO`
   * * `PARCIALMENTE_PAGO`
   * * `NAO_DEBITADO`
   * * `AGENDAMENTO_CANCELADO`
   */
  status?: StatusPix;
  dataHoraMovimento?: string;
  dataHoraSolicitacao?: string;
  chave?: string;
  codigoSolicitacao?: string;
}

export interface HistoricoResponse {
  /**
   * Status atual da transação Pix
   * * `CRIADO`
   * * `AGUARDANDO_APROVACAO`
   * * `APROVADO`
   * * `REPROVADO`
   * * `EXPIRADO`
   * * `CANCELADO`
   * * `FALHA`
   * * `AGENDADO`
   * * `PAGO`
   * * `ENVIADO`
   * * `CANCELADO_SEM_SALDO`
   * * `DEBITADO`
   * * `PARCIALMENTE_DEBITADO`
   * * `PARCIALMENTE_PAGO`
   * * `NAO_DEBITADO`
   * * `AGENDAMENTO_CANCELADO`
   */
  status?: StatusHistoricoPix;
  dataHoraEvento?: string;
}

/**
 * Status atual da transação Pix
 * * `CRIADO`
 * * `AGUARDANDO_APROVACAO`
 * * `APROVADO`
 * * `REPROVADO`
 * * `EXPIRADO`
 * * `CANCELADO`
 * * `FALHA`
 * * `AGENDADO`
 * * `PAGO`
 * * `ENVIADO`
 * * `CANCELADO_SEM_SALDO`
 * * `DEBITADO`
 * * `PARCIALMENTE_DEBITADO`
 * * `PARCIALMENTE_PAGO`
 * * `NAO_DEBITADO`
 * * `AGENDAMENTO_CANCELADO`
 */
export type StatusPix = string;

/**
 * Status atual da transação Pix
 * * `CRIADO`
 * * `AGUARDANDO_APROVACAO`
 * * `APROVADO`
 * * `REPROVADO`
 * * `EXPIRADO`
 * * `CANCELADO`
 * * `FALHA`
 * * `AGENDADO`
 * * `PAGO`
 * * `ENVIADO`
 * * `CANCELADO_SEM_SALDO`
 * * `DEBITADO`
 * * `PARCIALMENTE_DEBITADO`
 * * `PARCIALMENTE_PAGO`
 * * `NAO_DEBITADO`
 * * `AGENDAMENTO_CANCELADO`
 */
export type StatusHistoricoPix = string;

export type RequestDarfLote = PagamentoRequestModelBase & {
  /**
   * Length: 11..20
   *
   * @example "90022400664"
   */
  cnpjCpf: string;
  /**
   * Length: 0..10
   *
   * @example "0220"
   */
  codigoReceita: string;
  /**
   * Format: `date`
   *
   * @example "2022-05-10"
   */
  dataVencimento: string;
  /**
   * Length: 0..1000
   *
   * @example "Pagamento DARF Janeiro"
   */
  descricao?: string;
  /**
   * Length: 0..100
   *
   * @example "Minha Empresa"
   */
  nomeEmpresa: string;
  /** @example "031999911111" */
  telefoneEmpresa?: string;
  /**
   * Format: `date`
   *
   * @example "2020-01-31"
   */
  periodoApuracao: string;
  /**
   * Format: `int64`
   * Range: 0.1..∞
   *
   * @example 47.14
   */
  valorPrincipal: number;
  /**
   * Format: `int64`
   *
   * @example 27.48
   */
  valorMulta?: number;
  /** @example 10.11 */
  valorJuros?: number;
  /**
   * Pattern: `[0-9]`
   * Length: 0..30
   *
   * @example "13609400849201739"
   */
  referencia: string;
};

export interface PagarLoteResponse {
  /**
   * Id do pagamento de um lote específico.
   *
   * Length: 24..24
   */
  idLote: string;
  status: StatusLoteEnum;
  /**
   * Identificador do lote
   *
   * @example "Lote de pagamentos referente a despesas do condomínio"
   */
  meuIdentificador?: string;
  /**
   * Qtde de pagamentos existentes no lote.
   *
   * Format: `int32`
   */
  qtdePagamentos?: number;
}

export type ObterLoteResponse = PagarLoteResponse & ({
  /** Conta corrente responsável pelo pagamento do lote. */
  contaCorrente?: string;
  /**
   * Data em que o lote foi cadastrado.
   *
   * Format: `date-time`
   */
  dataCriacao?: string;
  pagamentos?: Array<ResponseBoletoLote | ResponseDarfLote>;
});

export type TipoPagamentoEnum = "BOLETO" | "DARF";

export type StatusLoteEnum = "EMPROCESSAMENTO" | "PROCESSADOCOMERRO" | "PROCESSADOSEMERRO";

/**
 * * EMPROCESSAMENTO não representa um estado do serviço de pagamentos. É o estado inicial do pagamento
 */
export type StatusPagamentoBoleto = "EMPROCESSAMENTO" | "REALIZADO" | "AGENDADO" | "AGUARDANDO_APROVACAO" | "APROVADO" | "CANCELADO" | "REPROVADO" | "ERRO" | "NAO_COMPENSADO" | "APROVADO_NOVO_PAGAMENTO" | "APROVADO_AGUARDO_RETENTATIVA" | "AGENDADO_REALIZADO" | "AGENDADO_NAO_REALIZADO" | "AGENDADO_CANCELADO" | "APROVACAO_EXPIRADA" | "ERRO_PAGAMENTO" | "PAGO" | "PAGAMENTO_AGENDADO" | "PAGAMENTO_COBRANCA_AGENDADO";

/**
 * * EMPROCESSAMENTO não representa um estado do serviço de pagamentos. É o estado inicial do pagamento
 */
export type StatusPagamentoDarf = "EMPROCESSAMENTO" | "PAGO" | "PAGAMENTO_AGENDADO" | "AGENDAMENTO_CANCELADO" | "NAO_COMPENSADO" | "ERRO_PAGAMENTO" | "AGUARDANDO_APROVACAO" | "APROVADO" | "CANCELADO";

export type ResponseBoletoLote = PagamentoResponseModelBase & {
  /** Identificador único do pagamento ao ser registrado. */
  codigoTransacao?: string;
  /**
   * * EMPROCESSAMENTO não representa um estado do serviço de pagamentos. É o estado inicial do pagamento
   */
  status?: StatusPagamentoBoleto;
  /**
   * Código de barras ou linha digitável
   *
   * Length: 44..48
   *
   * @example "07797000000000000004501008460019310001802680"
   */
  codBarraLinhaDigitavel?: string;
  /**
   * Valor a ser pago.
   *
   * Range: 0.01..∞
   *
   * @example "26.80"
   */
  valorPagar?: number;
  /**
   * Data em que será pago o título.
   * Formato aceito: YYYY-MM-DD
   *
   * Format: `date`
   *
   * @example "2023-08-18"
   */
  dataPagamento?: string;
  /**
   * Data de vencimento do título.
   * Formato aceito: YYYY-MM-DD
   *
   * Format: `date`
   *
   * @example "2018-07-27"
   */
  dataVencimento?: string;
  /**
   * Número sequencial único, exclusivo para uso no Inter.
   *
   * @example "82127399"
   */
  nsu?: string;
};

export type ResponseDarfLote = PagamentoResponseModelBase & {
  /**
   * * EMPROCESSAMENTO não representa um estado do serviço de pagamentos. É o estado inicial do pagamento
   */
  status?: StatusPagamentoDarf;
  /**
   * Identificador único do pagamento ao ser registrado.
   *
   * @example "3414f226-36fb-4d87-811e-cfd99911d845"
   */
  codigoSolicitacao?: string;
  /** @example "PRETO" */
  tipoDarf?: string;
  /** @example "90022400664" */
  cnpjCpf?: string;
  descricao?: string;
  nomeEmpresa?: string;
  telefoneEmpresa?: string;
  /** @example 50.96 */
  valor?: number;
  /** @example 0 */
  valorMulta?: number;
  /** @example 0 */
  valorJuros?: number;
  /** @example 50.96 */
  valorTotal?: number;
  /**
   * Format: `date`
   *
   * @example "2019-10-10"
   */
  periodoApuracao?: string;
  /**
   * Format: `date`
   *
   * @example "2019-10-10"
   */
  dataPagamento?: string;
  /** @example 424562562565 */
  referencia?: string;
  /**
   * Format: `date`
   *
   * @example "2019-10-10"
   */
  dataVencimento?: string;
  /** @example 190 */
  codigoReceita?: string;
};

/**
 * * `pix-pagamento:` - Pix pagamento
 * * `boleto-pagamento:` - Boleto Pagamento
 */
export type TipoWebhookEnum = "pix-pagamento" | "boleto-pagamento";

export interface WebhookModel {
  /**
   * URL de configuração do webhook. Deve iniciar obrigatoriamente com **https://**
   *
   * Format: `uri`
   * Pattern: `^https://[^\s]*$`
   *
   * @example "https://meuwebhook.com/"
   */
  webhookUrl: string;
  /**
   * Data e hora em que o webhook foi cadastrado. Representada de acordo com a [RFC3339](https://tools.ietf.org/html/rfc3339)
   *
   * Format: `date-time`
   * Read-only: returned by the API, never sent.
   */
  criacao?: string;
}

export interface CallbackPixPagamentoModel {
  codigoSolicitacao?: string;
  chave?: string;
  dataHoraMovimento?: string;
  dataHoraSolicitacao?: string;
  descricaoPagamento?: string;
  endToEnd?: string;
  instituicaoDestinatario?: string;
  recebedor?: DadosConta;
  erros?: ErroPagamento[];
  /**
   * * `EFETIVADO`
   * * `ERRO`
   * * `REPROVADO`
   * * `APROVACAO_EXPIRADA`
   * * `CANCELADO`
   */
  status?: StatusPixPagamento;
  /** * `PAGAMENTO` */
  tipoMovimentacao?: TipoMovimentacao;
  valor?: string;
}

export interface CallbackPagamentoBoletoModel {
  linhaDigitavel?: string;
  codigoTransacao?: string;
  dataPagamento?: string;
  dataHoraSolicitacao?: string;
  nomeBeneficiario?: string;
  /**
   * * `REALIZADO`
   * * `AGENDADO`
   * * `CANCELADO`
   * * `ERRO`
   * * `REPROVADO`
   * * `APROVACAO_EXPIRADA`
   */
  status?: StatusPagamentoBoletoCallback;
  /** O atributo em questão só é retornado em caso de Pagamento Boleto **REALIZADO**. */
  valorPago?: string;
  /** O atributo em questão só é retornado em caso de de Pagamento Boleto **AGENDADO**. */
  valorAgendado?: string;
  /**
   * Número sequencial único, exclusivo para uso no Inter.
   *
   * @example "82127399"
   */
  nsu?: string;
  erros?: CallbackPagamentoBoletoErrorModel[];
}

export interface CallbackPagamentoBoletoErrorModel {
  codigoErro?: string;
  descricaoErro?: string;
}

export interface DadosConta {
  /** O atributo em questão só é retornado em caso de Pagamento Pix com dados bancários. */
  codIspb?: string;
  /** O atributo em questão só é retornado em caso de Pagamento Pix com dados bancários. */
  codAgencia?: string;
  /** O atributo em questão só é retornado em caso de Pagamento Pix com dados bancários. */
  nroConta?: string;
  /** Caso seja um CPF, o dado retornado será mascarado. (ex:\***.777.888-\**) */
  cpfCnpj?: string;
  nome?: string;
  /** O atributo em questão só é retornado em caso de Pagamento Pix com dados bancários. */
  tipoConta?: string;
}

export interface ErroPagamento {
  codigoErro?: string;
  descricaoErro?: string;
  codigoErroComplementar?: string;
}

/**
 * * `EFETIVADO`
 * * `ERRO`
 * * `REPROVADO`
 * * `APROVACAO_EXPIRADA`
 * * `CANCELADO`
 */
export type StatusPixPagamento = "EFETIVADO" | "ERRO" | "REPROVADO" | "APROVACAO_EXPIRADA" | "CANCELADO";

/**
 * * `REALIZADO`
 * * `AGENDADO`
 * * `CANCELADO`
 * * `ERRO`
 * * `REPROVADO`
 * * `APROVACAO_EXPIRADA`
 */
export type StatusPagamentoBoletoCallback = "REALIZADO" | "AGENDADO" | "CANCELADO" | "ERRO" | "REPROVADO" | "APROVACAO_EXPIRADA";

/** * `PAGAMENTO` */
export type TipoMovimentacao = "PAGAMENTO";

export interface CallbackAttemptPage {
  /** Format: `int64` */
  totalElementos?: number;
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
  dataEnvio: string;
  sucesso: boolean;
  /** Resposta da chamada ao endpoint do webhook. */
  httpStatus?: number;
  mensagemErro?: string;
}

export interface RetryCallbacksRequestBody {
  body?: CallbackRetryPixPagamentoBody | CallbackRetryBoletoPagamentoBody;
}

/** boleto-pagamento */
export interface CallbackRetryBoletoPagamentoBody {
  /** Lista de códigos de transações de pagamento que deseja reenviar o callback */
  codigoTransacao: string[];
}

/** pix-pagamento */
export interface CallbackRetryPixPagamentoBody {
  /** Lista de códigos de solicitações de pagamento pix que deseja reenviar o callback */
  codigoSolicitacao: string[];
}

export interface RetryCallbackResponse {
  /** Lista dos códigos identificadores em que o reenvio foi solicitado com sucesso. */
  foundIds?: string[];
}

/**
 * Query parameters for `GET /banking/v2/extrato`.
 * Consultar extrato
 */
export interface ExtratoQuery {
  /**
   * Data início da consulta de extrato.
   *
   * Formato: YYYY-MM-DD
   *
   * Format: `date`
   */
  dataInicio: string;
  /**
   * Data fim da consulta de extrato.
   *
   * Formato: YYYY-MM-DD
   *
   * Format: `date`
   */
  dataFim: string;
}

/**
 * Query parameters for `GET /banking/v2/extrato/exportar`.
 * Recuperar extrato em PDF
 */
export interface ExtratoExportQuery {
  /**
   * Data inicio da exportação de extrato.
   *
   * Formato: YYYY-MM-DD
   *
   * Format: `date`
   */
  dataInicio: string;
  /**
   * Data fim da exportação de extrato.
   *
   * Formato: YYYY-MM-DD
   *
   * Format: `date`
   */
  dataFim: string;
}

/**
 * Query parameters for `GET /banking/v2/extrato/completo`.
 * Consultar extrato enriquecido
 */
export interface ExtratoCompleteQuery {
  /**
   * Data inicio da exportação de extrato.
   *
   * Formato: YYYY-MM-DD
   *
   * Format: `date`
   */
  dataInicio: string;
  /**
   * Data fim da exportação de extrato.
   *
   * Formato: YYYY-MM-DD
   *
   * Format: `date`
   */
  dataFim: string;
  /**
   * Posição da página na lista de movimentações.
   *
   * **Apenas para paginação tradicional**.
   *
   * Range: 0..∞
   * Default: `0`
   */
  pagina?: number;
  /**
   * Tamanho da página na lista de movimentações.
   *
   * **Para paginação tradicional**: Define o tamanho da página
   * atual.
   *
   * **Para scroll**: Define o tamanho de cada página do scroll.
   *
   * Máximo de 10.000 registros por página em ambos os modos.
   *
   * Range: -∞..10000
   * Default: `50`
   */
  tamanhoPagina?: number;
  /**
   * values:
   * * `D` - Débito(Saída)
   * * `C` - Crédito(Entrada)
   */
  tipoOperacao?: "D" | "C";
  /** transação vinculada a movimentacao */
  tipoTransacao?: string;
  /**
   * Opcional, habilita o modo de paginação scroll para grandes volumes de transações.
   * Use `true` para iniciar um novo scroll. É permitido apenas um scroll ativo por conta.
   */
  scrollEnabled?: "true";
  /**
   * ID do scroll, use este parâmetro para continuar a paginação. O scrollId expira automaticamente após hasMore retornar`false` ou 6 minutos.
   *
   * Format: `uuid`
   */
  scrollId?: string;
}

/**
 * Query parameters for `GET /banking/v2/saldo`.
 * Consultar saldo
 */
export interface SaldoQuery {
  /**
   * Data de consulta para o saldo posicional.
   *
   * Formato: YYYY-MM-DD
   *
   * Obs: Caso uma data não seja informada, será utilizada a data atual, e os valores retornados serão: o saldo atual (disponível),
   * o bloqueado em cheque, o bloqueado judicialmente, o bloqueado administrativo e o limite, até o momento da consulta.
   * Caso seja informada uma data, o retorno será somente o valor do saldo naquele dia (disponível). Se a data for a atual,
   * o valor do saldo até o momento da consulta.
   *
   * Format: `date`
   */
  dataSaldo?: string;
}

/**
 * Query parameters for `GET /banking/v2/pagamento`.
 * Buscar pagamentos
 */
export interface BuscarInformacoesPagamentosQuery {
  /**
   * Código de barras ou Linha digitável do boleto
   *
   * Length: 44..48
   *
   * @example 6.539000353864661e+46
   */
  codBarraLinhaDigitavel?: string;
  /**
   * Código de transação UUID
   *
   * Length: 36..36
   *
   * @example "a928f403-0076-419b-9c99-432d52083d0a"
   */
  codigoTransacao?: string;
  /**
   * Data inicio, em acordo com o campo "filtrarDataPor"
   *
   * Formato aceito: YYYY-MM-DD
   *
   * * O campo dataInicio é opcional, mas, caso seja informado, o campo dataFim se torna obrigatório para determinar o intervalo da busca.
   *
   * * Caso data inicio e fim seja nula, por default será consultado os últimos 30 dias por data de inclusão.
   *
   * * Período máximo entre as datas inicio e fim é de 90 dias.
   */
  dataInicio?: string;
  /**
   * Data Fim, em acordo com o campo "filtrarDataPor"
   *
   * * O campo dataFim é opcional, mas, caso seja informado, o campo dataInicio se torna obrigatório para determinar o intervalo da busca.
   *
   * Formato aceito: YYYY-MM-DD
   */
  dataFim?: string;
  /**
   * Os filtros de data inicial e data final se aplicarão a:
   * * `INCLUSAO` - Data da operação que foi solicitado o pagamento do título. (Default)
   * * `PAGAMENTO` - Data em que foi efetuado o pagamento do título
   * * `VENCIMENTO` - Data do vencimento do título de pagamento.
   *
   * Default: `"INCLUSAO"`
   */
  filtrarDataPor?: "INCLUSAO" | "PAGAMENTO" | "VENCIMENTO";
}

/**
 * Query parameters for `GET /banking/v2/pagamento/darf`.
 * Buscar pagamentos de DARF
 */
export interface BuscarInformacoesPagamentoDarfQuery {
  /**
   * Código de solicitação UUID
   *
   * Length: 36..36
   *
   * @example "a928f403-0076-419b-9c99-432d52083d0a"
   */
  codigoSolicitacao?: string;
  /**
   * Código da receita
   *
   * @example "0211"
   */
  codigoReceita?: string;
  /**
   * Data inicio, em acordo com a data de pagamento da DARF.
   *
   * * O campo dataInicio é opcional, mas, caso seja informado, o campo dataFim se torna obrigatório para determinar o intervalo da busca.
   *
   * * Caso data inicio ou fim seja nula, por default será consultado os últimos 30 dias por data de inclusão.
   *
   * Formato aceito: YYYY-MM-DD
   *
   * Format: `date`
   */
  dataInicio?: string;
  /**
   * Data Fim, em acordo com a data de pagamento da DARF.
   *
   * * O campo dataFim é opcional, mas, caso seja informado, o campo dataInicio se torna obrigatório para determinar o intervalo da busca.
   *
   * Formato aceito: YYYY-MM-DD
   *
   * Format: `date`
   */
  dataFim?: string;
}

/**
 * Query parameters for `GET /banking/v2/webhooks/{tipoWebhook}/callbacks`.
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
  /**
   * EndToEnd do callback, caso queira filtrar as notificações de algum Pix Pagamento específico. **Exclusivo para o PATH PARAMETERS pix-pagamento**.
   */
  endToEnd?: string;
  /**
   * CodigoTransacao do callback, caso queira filtrar as notificações de algum Pagamento Boleto específico. **Exclusivo para o PATH PARAMETERS boleto-pagamento**.
   */
  codigoTransacao?: string;
}
