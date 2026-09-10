// ---------------------------------------------------------------------------
// API Pix Automatico
// Generated from specs/pix-automatico.json by scripts/generate.ts - do not edit.
// Base path: /pix/v2
// ---------------------------------------------------------------------------

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

/**
 * Filtra os registros cuja data de criação seja maior ou igual que a data de início. Respeita RFC 3339.
 */
export type Inicio = string;

/**
 * Filtra os registros cuja data de criação seja menor ou igual que a data de fim. Respeita RFC 3339.
 */
export type Fim = string;

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

/** Identificador da location a ser informado na criação da cobrança . */
export type PayloadLocationId = number;

/** Identificador da location a ser informado na criação de uma recorrência. */
export type PayloadLocationRecId = number;

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

/** Pessoa Física */
export interface PessoaFisicaRecorrencia {
  /**
   * CPF do usuário.
   *
   * Pattern: `\d{11}`
   */
  cpf?: string;
  /**
   * Nome do usuário.
   *
   * Length: 0..140
   */
  nome: string;
}

/** Contendo `nome`, `CNPJ` e `convenio` do recebedor. */
export interface PessoaJuridicaRecorrencia {
  /**
   * CNPJ do usuário.
   *
   * Pattern: `\d{14}`
   */
  cnpj: string;
  /**
   * Nome do usuário.
   *
   * Length: 0..140
   */
  nome: string;
}

/** O objeto devedor organiza as informações sobre o devedor da recorrência. */
export interface DevedorRecorrencia {
  /**
   * Nome do devedor.
   *
   * Length: 0..140
   */
  nome: string;
  /**
   * CPF do devedor.
   *
   * Pattern: `\d{11}`
   */
  cpf?: string;
  /**
   * CNPJ do devedor.
   *
   * Pattern: `\d{14}`
   */
  cnpj?: string;
}

/** CPF do usuário. */
export type CPF = string;

/** CNPJ do usuário. */
export type CNPJ = string;

export interface DadosDevedorRecorrencia {
  /** Contendo `email`, `logradouro`, `cidade`, `uf` e `cep` */
  devedor?: {
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
     * Pattern: `[0-9]{8}`
     */
    cep?: string;
  };
}

/** Contendo `conta`, `ìspbParticipante`, `agencia` e `cpf` ou `cnpj` do pagador. */
export type DadosBancarios = {
  /**
   * CPF do usuário.
   *
   * Pattern: `\\d{11}`
   */
  cpf?: CPF;
} | {
  /**
   * CNPJ do usuário.
   *
   * Pattern: `\\d{14}`
   */
  cnpj?: CNPJ;
};

/** Contendo `nome`, `cnpj`, `conta`, `tipoConta` e `agencia` */
export interface DadosBancariosRecebedor {
  /**
   * Número da conta do usuário recebedor.
   *
   * Length: 0..20
   */
  conta: string;
  /** Tipo da conta do usuário recebedor. */
  tipoConta: "CORRENTE" | "POUPANCA" | "PAGAMENTO";
  /**
   * Número da agência do usuário recebedor.
   *
   * Length: 0..4
   */
  agencia?: string;
}

/** O objeto recebedor organiza as informações sobre o recebedor da cobrança. */
export type DadosBancariosRecebedorCompleto = DadosBancariosRecebedor & PessoaJuridicaRecorrencia;

/** Dados do Pagador */
export interface DadosPagadorRec {
  pagador?: {
    /**
     * CPF do usuário.
     *
     * Pattern: `\d{11}`
     */
    cpf: string;
  } | {
    /**
     * CNPJ do usuário.
     *
     * Pattern: `\d{14}`
     */
    cnpj: string;
  };
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

/** Webhook Base */
export interface WebhookRecBase {
  /**
   * URL Webhook
   *
   * Format: `uri`
   *
   * @example "https://pix.example.com/api/webhookrec/"
   */
  webhookUrl: string;
}

/** Webhook Base */
export interface WebhookRecCompleto {
  /**
   * URL Webhook
   *
   * Format: `uri`
   *
   * @example "https://pix.example.com/api/webhookrec/"
   */
  webhookUrl: string;
  /**
   * Data e hora em que o webhook foi cadastrado. Respeita RFC 3339.
   *
   * Format: `date-time`
   * Read-only: returned by the API, never sent.
   */
  criacao?: string;
}

/** Webhook Base */
export interface WebhookCobRCompleto {
  /**
   * URL Webhook
   *
   * Format: `uri`
   *
   * @example "https://pix.example.com/api/webhookrec/"
   */
  webhookUrl: string;
  /**
   * Data e hora em que o webhook foi cadastrado. Respeita RFC 3339.
   *
   * Format: `date-time`
   * Read-only: returned by the API, never sent.
   */
  criacao?: string;
}

/** Webhook Solicitado */
export type WebhookRecSolicitado = WebhookRecBase;

/** Webhook Base */
export interface WebhookCobRSolicitado {
  /**
   * URL Webhook
   *
   * Format: `uri`
   *
   * @example "https://pix.example.com/api/webhookrec/"
   */
  webhookUrl: string;
}

/** Identificador da localização do payload. */
export interface PayloadLocation {
  /**
   * Identificador da location a ser informado na criação da cobrança .
   *
   * Format: `int64`
   */
  id: PayloadLocationId;
  /**
   * Localização do Payload a ser informada na criação da cobrança.
   *
   * Format: `uri`
   * Length: 0..77
   * Read-only: returned by the API, never sent.
   *
   * @example "pix.example.com/qr/v2/2353c790eefb11eaadc10242ac120002"
   */
  location: string;
  /**
   * Tipo da cobrança:
   * - `cob`: Cobrança imediata
   * - `cobv`: Cobrança com vencimento
   */
  tipoCob: "cob" | "cobv";
  /**
   * Data e hora em que a location foi criada. Respeita RFC 3339.
   *
   * Format: `date-time`
   * Read-only: returned by the API, never sent.
   */
  criacao: string;
}

/** Identificador da localização do payload solicitada. */
export interface PayloadLocationSolicitada {
  /** Tipo da cobrança */
  tipoCob?: string;
}

/** Identificador da localização do payload solicitada. */
export interface PayloadLocationRecSolicitada {
  /** Tipo da cobrança */
  tipo: "rec";
}

/** Identificador da localização do payload completo. */
export interface PayloadLocationRecGerada {
  /**
   * Identificador da location a ser informado na criação de uma recorrência.
   *
   * Format: `int64`
   */
  id: PayloadLocationRecId;
  /**
   * Localização do Payload a ser informada na criação da recorrência.
   *
   * Format: `uri`
   * Length: 0..77
   * Read-only: returned by the API, never sent.
   *
   * @example "pix.example.com/qr/v2/rec/2353c790eefb11eaadc10242ac120002"
   */
  location: string;
  /**
   * Data e hora em que a location foi criada. Respeita RFC 3339.
   *
   * Format: `date-time`
   * Read-only: returned by the API, never sent.
   */
  criacao: string;
}

/** Contendo `id`, `location`, `criacao` e `idRec`. */
export type PayloadLocationRecCompleta = PayloadLocationRecGerada & {
  /**
   * # Identificador da Recorrência
   *
   * Regra de formação:
   *
   * - RAxxxxxxxxyyyyMMddzzzzzzzzzzz (29 caracteres; "case sensitive", isso
   * é, diferencia letras maiúsculas e minúsculas), sendo:
   * - "R": fixo (1 caractere). "R" para a recorrência criada dentro do
   * Pix;
   * - "A": identificação da possibilidade de novas tentativas, sendo
   * possíveis os valores "R" ou "N" (1 caractere). "R" caso a recorrência permita novas tentativas de pagamento pós vencimento, ou "N" caso não permita novas tentativas.
   * - "xxxxxxxx": identificação do agente que presta serviço para o
   * usuário recebedor que gerou o , podendo ser: o ISPB do participante direto, o ISPB do participante indireto ou os 8 primeiros dígitos do CNPJ do prestador de serviço de iniciação (8 caracteres numéricos [0-9]);
   * - "yyyyMMdd": data (8 caracteres) de criação da recorrência;
   * - "zzzzzzzzzzz": sequencial criado pelo agente que gerou o
   * (11 caracteres alfanuméricos [a-z|A-Z|0-9]). Deve ser único dentro de cada "yyyyMMdd".
   * Dessa forma, o ID da recorrência deve ser formado de acordo com um dos tipos a seguir:
   * - "RRxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que permite novas tentativas de pagamento pós vencimento; ou
   * - "RNxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que não permite novas tentativas de pagamento pós vencimento.
   *
   * Pattern: `[a-zA-Z0-9]{29}`
   * Length: 29..29
   *
   * @example "RR1234567820240115abcdefghijk"
   */
  idRec?: RecId;
};

/** Identificador da localização do payload completo. */
export interface PayloadLocationCompleta {
  /**
   * Identificador da location a ser informado na criação da cobrança .
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
  /**
   * Tipo da cobrança:
   * - `cob`: Cobrança imediata
   * - `cobv`: Cobrança com vencimento
   */
  tipoCob?: "cob" | "cobv";
  /**
   * Data e hora em que a location foi criada. Respeita RFC 3339.
   *
   * Format: `date-time`
   * Read-only: returned by the API, never sent.
   */
  criacao?: string;
}

/** Pix */
export interface PixAutomatico {
  /**
   * Id único para identificação do Pix Cobrança.
   *
   * Pattern: `[a-zA-Z0-9]{32}`
   */
  endToEndId: EndToEndId;
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
  /**
   * Valor do Pix.
   *
   * Pattern: `\d{1,10}\.\d{2}`
   */
  valor: string;
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
  /**
   * Contendo `id`, `rtrId`, `valor`, `natureza`, `descricao`, `horario`, `status` e `motivo` da devolução.
   */
  devolucoes?: DevolucaoPixAutomatico[];
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

/** Devolução */
export interface DevolucaoPixAutomatico {
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
  /**
   * Indica qual é a natureza da devolução. Uma devolução pode ser relacionada a um Pix comum (com códigos possíveis: `MD06` e `FR01` da pacs.004 e `REFU` da pacs.008). Na ausência deste campo a natureza deve ser interpretada como
   * sendo de um Pix comum (`ORIGINAL`).
   *
   * As naturezas são assim definidas:
   * - `ORIGINAL`: quando a devolução é solicitada pelo usuário recebedor e se refere a um Pix comum (`MD06`);
   * - `MED_FRAUDE`: quando a devolução ocorre no âmbito do MED (Mecanismo Especial de Devolução) por fundada suspeita de fraude e se refere a um Pix comum (`FR01`).
   * - `MED_PIX_AUTOMATICO`: reembolso total ou parcial ao participante do usuário pagador no âmbito do MED (Mecanismo Especial de Devolução) para o Pix Automático pela utilização de recursos próprios para ressarcimento do usuário pagador.(`REFU`);
   *
   * Os valores de devoluções são sempre limitados aos valores máximos a seguir:
   * - Pix comum: o valor da devolução é limitado ao valor do próprio Pix (a natureza nesse caso pode ser: ORIGINAL, MED_PIX_AUTOMATICO ou MED_FRAUDE);
   */
  natureza?: DevolucaoNaturezaPixAutomatico;
  /**
   * O campo `descricao`, opcional, determina um texto a ser apresentado ao pagador contendo informações sobre a devolução. Esse texto será preenchido, na pacs.004, pelo PSP do recebedor, no campo RemittanceInformation. O tamanho do campo na pacs.004 está limitado a 140 caracteres.
   *
   * Length: 0..140
   */
  descricao?: string;
  /** Contendo `solicitacao` e `liquidacao` */
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

/**
 * Indica qual é a natureza da devolução. Uma devolução pode ser relacionada a um Pix comum (com códigos possíveis: `MD06` e `FR01` da pacs.004 e `REFU` da pacs.008). Na ausência deste campo a natureza deve ser interpretada como
 * sendo de um Pix comum (`ORIGINAL`).
 *
 * As naturezas são assim definidas:
 * - `ORIGINAL`: quando a devolução é solicitada pelo usuário recebedor e se refere a um Pix comum (`MD06`);
 * - `MED_FRAUDE`: quando a devolução ocorre no âmbito do MED (Mecanismo Especial de Devolução) por fundada suspeita de fraude e se refere a um Pix comum (`FR01`).
 * - `MED_PIX_AUTOMATICO`: reembolso total ou parcial ao participante do usuário pagador no âmbito do MED (Mecanismo Especial de Devolução) para o Pix Automático pela utilização de recursos próprios para ressarcimento do usuário pagador.(`REFU`);
 *
 * Os valores de devoluções são sempre limitados aos valores máximos a seguir:
 * - Pix comum: o valor da devolução é limitado ao valor do próprio Pix (a natureza nesse caso pode ser: ORIGINAL, MED_PIX_AUTOMATICO ou MED_FRAUDE);
 */
export type DevolucaoNaturezaPixAutomatico = "ORIGINAL" | "MED_PIX_AUTOMATICO" | "MED_FRAUDE";

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
  /**
   * Tipo da cobrança:
   * - `cob`: Cobrança imediata
   * - `cobv`: Cobrança com vencimento
   */
  tipoCob?: "cob" | "cobv";
  /** Paginação */
  paginacao?: Paginacao;
}

/** Contendo `ìnicio`, `fim`, `idRecPresente` e `paginacao`. */
export interface ParametrosConsultaPayloadLocationRec {
  /**
   * Data inicial utilizada na consulta. Respeita RFC 3339.
   *
   * Format: `date-time`
   *
   * @example "2020-01-01T00:00:00Z"
   */
  inicio: string;
  /**
   * Data de fim utilizada na consulta. Respeita RFC 3339.
   *
   * Format: `date-time`
   *
   * @example "2020-12-01T17:00:00Z"
   */
  fim: string;
  /** Filtro pela existência de id da recorrência. */
  idRecPresente?: boolean;
  /** Recebedor */
  recebedor?: {
    /**
     * Convênio entre usuÃ¡rio e participante recebedor.
     *
     * Length: 0..60
     */
    convenio?: string;
  };
  /** Paginação */
  paginacao: Paginacao;
}

/** Locations Consultadas */
export interface PayloadLocationRecConsultadas {
  /** Contendo `ìnicio`, `fim`, `idRecPresente` e `paginacao`. */
  parametros: ParametrosConsultaPayloadLocationRec;
  /** Contendo `id`, `location`, `criacao` e `idRec`. */
  loc: PayloadLocationRecCompleta[];
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

/** Parâmetros utilizados para a realização de uma consulta de recorrências. */
export interface ParametrosConsultaRec {
  /**
   * Data inicial utilizada na consulta. Respeita RFC 3339.
   *
   * Format: `date-time`
   *
   * @example "2020-04-01T00:00:00.000Z"
   */
  inicio: string;
  /**
   * Data de fim utilizada na consulta. Respeita RFC 3339.
   *
   * Format: `date-time`
   *
   * @example "2020-04-01T17:00:00.000Z"
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
  /**
   * Filtro pelo status das recorrências:
   * - `CRIADA`: Recorrência criada, aguardando aprovação do pagador
   * - `APROVADA`: Recorrência aprovada pelo pagador e ativa
   * - `REJEITADA`: Recorrência rejeitada pelo pagador
   * - `EXPIRADA`: Recorrência expirou sem aprovação
   * - `CANCELADA`: Recorrência cancelada pelo recebedor ou pagador
   */
  status?: "CRIADA" | "APROVADA" | "REJEITADA" | "EXPIRADA" | "CANCELADA";
  /** Recebedor */
  recebedor?: {
    /**
     * Convênio entre usuário e participante recebedor.
     *
     * Length: 0..60
     */
    convenio?: string;
  };
  /** Paginação */
  paginacao: Paginacao;
}

/** Parâmetros utilizados para a realização de uma consulta de cobranças. */
export interface ParametrosConsultaCobR {
  /**
   * Data inicial utilizada na consulta. Respeita RFC 3339.
   *
   * Format: `date-time`
   *
   * @example "2020-04-01T00:00:00.000Z"
   */
  inicio: string;
  /**
   * Data de fim utilizada na consulta. Respeita RFC 3339.
   *
   * Format: `date-time`
   *
   * @example "2020-04-01T17:00:00.000Z"
   */
  fim: string;
  /**
   * # Identificador da Recorrência
   *
   * Regra de formação:
   *
   * - RAxxxxxxxxyyyyMMddzzzzzzzzzzz (29 caracteres; "case sensitive", isso
   * é, diferencia letras maiúsculas e minúsculas), sendo:
   * - "R": fixo (1 caractere). "R" para a recorrência criada dentro do
   * Pix;
   * - "A": identificação da possibilidade de novas tentativas, sendo
   * possíveis os valores "R" ou "N" (1 caractere). "R" caso a recorrência permita novas tentativas de pagamento pós vencimento, ou "N" caso não permita novas tentativas.
   * - "xxxxxxxx": identificação do agente que presta serviço para o
   * usuário recebedor que gerou o , podendo ser: o ISPB do participante direto, o ISPB do participante indireto ou os 8 primeiros dígitos do CNPJ do prestador de serviço de iniciação (8 caracteres numéricos [0-9]);
   * - "yyyyMMdd": data (8 caracteres) de criação da recorrência;
   * - "zzzzzzzzzzz": sequencial criado pelo agente que gerou o
   * (11 caracteres alfanuméricos [a-z|A-Z|0-9]). Deve ser único dentro de cada "yyyyMMdd".
   * Dessa forma, o ID da recorrência deve ser formado de acordo com um dos tipos a seguir:
   * - "RRxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que permite novas tentativas de pagamento pós vencimento; ou
   * - "RNxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que não permite novas tentativas de pagamento pós vencimento.
   *
   * Pattern: `[a-zA-Z0-9]{29}`
   * Length: 29..29
   *
   * @example "RR1234567820240115abcdefghijk"
   */
  idRec?: RecId;
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
  /** Filtro pelo status das cobranças. */
  status?: string;
  /** Recebedor */
  recebedor?: {
    /**
     * Convênio entre usuário e participante recebedor.
     *
     * Length: 0..60
     */
    convenio?: string;
  };
  /** Paginação */
  paginacao: Paginacao;
}

/** Cobranças recorrentes consultadas */
export interface CobsRConsultadas {
  /** Parâmetros utilizados para a realização de uma consulta de cobranças. */
  parametros: ParametrosConsultaCobR;
  /** Lista de cobranças */
  cobsr: CobRCompleta[];
}

/** Recorrencias consultadas */
export interface RecsConsultadas {
  /** Parâmetros utilizados para a realização de uma consulta de recorrências. */
  parametros: ParametrosConsultaRec;
  /** Lista de recorrências */
  recs: RecCompletaPesquisada[];
}

/** Contendo `dataInicial`, `dataFinal` e `periodicidade` da recorrência. */
export interface RecBaseCalendario {
  /**
   * Trata-se de uma data, no formato `YYYY-MM-DD`, segundo ISO 8601. Data estimada de primeiro pagamento.
   *
   * Format: `date`
   *
   * @example "2023-04-01T00:00:00.000Z"
   */
  dataInicial: string;
  /**
   * Campo opcional que deve ser preenchido para autorizações com vigência pré-definida, devendo ser compatível com os valores informados em tipoFrequencia e a dataInicialRecorrencia. Não deve ser preenchido para autorizações por tempo indeterminado. Trata-se de uma data, no formato `YYYY-MM-DD`, segundo ISO 8601.
   *
   * Format: `date`
   *
   * @example "2023-04-01T00:00:00.000Z"
   */
  dataFinal?: string;
  /** Periodicidade das cobranças recorrentes. */
  periodicidade: "SEMANAL" | "MENSAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL";
}

/** Contendo `dataExpiracaoSolicitacao` da solicitação de recorrência. */
export interface SolicrecBaseCalendario {
  /**
   * Data de expiração da solicitação de recorrência. Respeita RFC 3339.
   *
   * Format: `date-time`
   *
   * @example "2023-04-01T00:00:00.000Z"
   */
  dataExpiracaoSolicitacao: string;
}

/** Atributos de Configuração de Recorrência */
export type RecCompleta = RecBase & {
  /**
   * # Identificador da Recorrência
   *
   * Regra de formação:
   *
   * - RAxxxxxxxxyyyyMMddzzzzzzzzzzz (29 caracteres; "case sensitive", isso
   * é, diferencia letras maiúsculas e minúsculas), sendo:
   * - "R": fixo (1 caractere). "R" para a recorrência criada dentro do
   * Pix;
   * - "A": identificação da possibilidade de novas tentativas, sendo
   * possíveis os valores "R" ou "N" (1 caractere). "R" caso a recorrência permita novas tentativas de pagamento pós vencimento, ou "N" caso não permita novas tentativas.
   * - "xxxxxxxx": identificação do agente que presta serviço para o
   * usuário recebedor que gerou o , podendo ser: o ISPB do participante direto, o ISPB do participante indireto ou os 8 primeiros dígitos do CNPJ do prestador de serviço de iniciação (8 caracteres numéricos [0-9]);
   * - "yyyyMMdd": data (8 caracteres) de criação da recorrência;
   * - "zzzzzzzzzzz": sequencial criado pelo agente que gerou o
   * (11 caracteres alfanuméricos [a-z|A-Z|0-9]). Deve ser único dentro de cada "yyyyMMdd".
   * Dessa forma, o ID da recorrência deve ser formado de acordo com um dos tipos a seguir:
   * - "RRxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que permite novas tentativas de pagamento pós vencimento; ou
   * - "RNxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que não permite novas tentativas de pagamento pós vencimento.
   *
   * Pattern: `[a-zA-Z0-9]{29}`
   * Length: 29..29
   *
   * @example "RR1234567820240115abcdefghijk"
   */
  idRec?: RecId;
} & {
  recebedor?: PessoaJuridicaRecorrencia & {
    /**
     * Filtro pelo convênio associado.
     *
     * Length: 0..60
     */
    convenio?: string;
  };
} & DadosPagadorRec & RecStatus & RecConfiguracao & {
  /** Contendo `id`, `location`, `criacao` e `idRec`. */
  loc?: PayloadLocationRecCompleta;
} & RecAtualizacao & RecEncerramento & {
  /** Solicitações vinculadas às recorrências. */
  solicitacao?: SolicRecCompleta[];
} & RecAtivacao & ({
  /**
   * ##### Informações relacionadas aos parâmetros `idRec` e `txid` informados na requisição.
   * Ao consultar uma recorrência via endpoint GET `/rec/{idRec}?txid={txid}`, o usuário recebedor pode optar pela consulta sem
   * o `txid` ou por compor a requisição com um `txid` de uma cobrança imediata, ou cobrança com vencimento, de forma a obter o QR Composto
   * para a jornada de interesse.
   *
   * Os `dadosQR` retornados variam de acordo com a jornada desejada, indicada pela presença dos parâmetros de interesse, conforme a tabela abaixo:
   *
   * idRec | txid de Cob | txid de CobV | Conteúdo esperado
   *
   * X | - | - | { jornada: "JORNADA_2", pixCopiaECola: "QR Composto da recorrência" }
   *
   * X | X | - | { jornada: "JORNADA_3", pixCopiaECola: "QR Composto da cobrança imediata + recorrência" }
   *
   * X | - | X | { jornada: "JORNADA_4", pixCopiaECola: "QR Composto da cobrança com vencimento + recorrência" }
   *
   * Os campos `dadosQR.jornada` e `dadosQR.pixCopiaECola` só serão retornados se as respectivas locations necessárias para a construção do QR Composto
   * estiverem preenchidas na recorrência e na eventual cobrança, a depender da jornada desejada.
   */
  dadosQR?: DadosQRCode;
});

/**
 * ##### Informações relacionadas aos parâmetros `idRec` e `txid` informados na requisição.
 * Ao consultar uma recorrência via endpoint GET `/rec/{idRec}?txid={txid}`, o usuário recebedor pode optar pela consulta sem
 * o `txid` ou por compor a requisição com um `txid` de uma cobrança imediata, ou cobrança com vencimento, de forma a obter o QR Composto
 * para a jornada de interesse.
 *
 * Os `dadosQR` retornados variam de acordo com a jornada desejada, indicada pela presença dos parâmetros de interesse, conforme a tabela abaixo:
 *
 * idRec | txid de Cob | txid de CobV | Conteúdo esperado
 *
 * X | - | - | { jornada: "JORNADA_2", pixCopiaECola: "QR Composto da recorrência" }
 *
 * X | X | - | { jornada: "JORNADA_3", pixCopiaECola: "QR Composto da cobrança imediata + recorrência" }
 *
 * X | - | X | { jornada: "JORNADA_4", pixCopiaECola: "QR Composto da cobrança com vencimento + recorrência" }
 *
 * Os campos `dadosQR.jornada` e `dadosQR.pixCopiaECola` só serão retornados se as respectivas locations necessárias para a construção do QR Composto
 * estiverem preenchidas na recorrência e na eventual cobrança, a depender da jornada desejada.
 */
export interface DadosQRCode {
  /**
   * Jornada de ativação da recorrência:
   * - `JORNADA_2`: Usuário pagador aceitou a recorrência através de leitura de QR Code de recorrência
   * - `JORNADA_3`: Usuário pagador iniciou a recorrência através de leitura de QR Code composto e pagamento de cobrança imediata
   * - `JORNADA_4`: Usuário pagador escolheu aderir à recorrência através de leitura de QR Code composto relacionado à cobrança com vencimento
   */
  jornada?: "JORNADA_2" | "JORNADA_3" | "JORNADA_4";
  /**
   * Este campo retorna o valor do Pix Copia e Cola correspondente à recorrência. Trata-se da sequência de caracteres que representa o BR Code.
   *
   * Length: 0..512
   */
  pixCopiaECola?: string;
}

/** Atributos de Configuração de Recorrência */
export type RecCompletaPesquisada = {
  /**
   * # Identificador da Recorrência
   *
   * Regra de formação:
   *
   * - RAxxxxxxxxyyyyMMddzzzzzzzzzzz (29 caracteres; "case sensitive", isso
   * é, diferencia letras maiúsculas e minúsculas), sendo:
   * - "R": fixo (1 caractere). "R" para a recorrência criada dentro do
   * Pix;
   * - "A": identificação da possibilidade de novas tentativas, sendo
   * possíveis os valores "R" ou "N" (1 caractere). "R" caso a recorrência permita novas tentativas de pagamento pós vencimento, ou "N" caso não permita novas tentativas.
   * - "xxxxxxxx": identificação do agente que presta serviço para o
   * usuário recebedor que gerou o , podendo ser: o ISPB do participante direto, o ISPB do participante indireto ou os 8 primeiros dígitos do CNPJ do prestador de serviço de iniciação (8 caracteres numéricos [0-9]);
   * - "yyyyMMdd": data (8 caracteres) de criação da recorrência;
   * - "zzzzzzzzzzz": sequencial criado pelo agente que gerou o
   * (11 caracteres alfanuméricos [a-z|A-Z|0-9]). Deve ser único dentro de cada "yyyyMMdd".
   * Dessa forma, o ID da recorrência deve ser formado de acordo com um dos tipos a seguir:
   * - "RRxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que permite novas tentativas de pagamento pós vencimento; ou
   * - "RNxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que não permite novas tentativas de pagamento pós vencimento.
   *
   * Pattern: `[a-zA-Z0-9]{29}`
   * Length: 29..29
   *
   * @example "RR1234567820240115abcdefghijk"
   */
  idRec?: RecId;
} & RecBase & {
  recebedor?: PessoaJuridicaRecorrencia;
} & DadosPagadorRec & RecStatus & RecConfiguracao & {
  /** Contendo `id`, `location`, `criacao` e `idRec`. */
  loc?: PayloadLocationRecCompleta;
} & RecAtualizacao & RecEncerramento & {
  /** Solicitações vinculadas às recorrências. */
  solicitacao?: SolicRecCompleta[];
} & RecAtivacao;

/** Atributos de Configuração de Recorrência */
export type RecGerada = RecBase & {
  /**
   * # Identificador da Recorrência
   *
   * Regra de formação:
   *
   * - RAxxxxxxxxyyyyMMddzzzzzzzzzzz (29 caracteres; "case sensitive", isso
   * é, diferencia letras maiúsculas e minúsculas), sendo:
   * - "R": fixo (1 caractere). "R" para a recorrência criada dentro do
   * Pix;
   * - "A": identificação da possibilidade de novas tentativas, sendo
   * possíveis os valores "R" ou "N" (1 caractere). "R" caso a recorrência permita novas tentativas de pagamento pós vencimento, ou "N" caso não permita novas tentativas.
   * - "xxxxxxxx": identificação do agente que presta serviço para o
   * usuário recebedor que gerou o , podendo ser: o ISPB do participante direto, o ISPB do participante indireto ou os 8 primeiros dígitos do CNPJ do prestador de serviço de iniciação (8 caracteres numéricos [0-9]);
   * - "yyyyMMdd": data (8 caracteres) de criação da recorrência;
   * - "zzzzzzzzzzz": sequencial criado pelo agente que gerou o
   * (11 caracteres alfanuméricos [a-z|A-Z|0-9]). Deve ser único dentro de cada "yyyyMMdd".
   * Dessa forma, o ID da recorrência deve ser formado de acordo com um dos tipos a seguir:
   * - "RRxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que permite novas tentativas de pagamento pós vencimento; ou
   * - "RNxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que não permite novas tentativas de pagamento pós vencimento.
   *
   * Pattern: `[a-zA-Z0-9]{29}`
   * Length: 29..29
   *
   * @example "RR1234567820240115abcdefghijk"
   */
  idRec?: RecId;
} & {
  recebedor?: PessoaJuridicaRecorrencia & {
    /**
     * Convênio entre usuário e participante recebedor.
     *
     * Length: 0..60
     */
    convenio?: string;
  };
} & RecStatus & {
  /** Contendo `id`, `location`, `criacao` e `idRec`. */
  loc?: PayloadLocationRecCompleta;
} & RecAtualizacao & RecEncerramento & RecAtivacao;

/** Atributos de Configuração de Recorrência */
export type RecSolicitada = RecBase & RecConfiguracao & {
  /**
   * Identificador da location a ser informado na criação de uma recorrência.
   *
   * Format: `int64`
   */
  loc?: PayloadLocationRecId;
} & RecAtivacaoSolicitada;

/**
 * Atributos de Configuração de Recorrência:
 *
 * `vinculo`, `calendario`, `valor`, `idRec`, `recebedor`, `politicaRetentativa` e `atualizacao`
 */
export type RecPayload = RecBase & {
  /**
   * # Identificador da Recorrência
   *
   * Regra de formação:
   *
   * - RAxxxxxxxxyyyyMMddzzzzzzzzzzz (29 caracteres; "case sensitive", isso
   * é, diferencia letras maiúsculas e minúsculas), sendo:
   * - "R": fixo (1 caractere). "R" para a recorrência criada dentro do
   * Pix;
   * - "A": identificação da possibilidade de novas tentativas, sendo
   * possíveis os valores "R" ou "N" (1 caractere). "R" caso a recorrência permita novas tentativas de pagamento pós vencimento, ou "N" caso não permita novas tentativas.
   * - "xxxxxxxx": identificação do agente que presta serviço para o
   * usuário recebedor que gerou o , podendo ser: o ISPB do participante direto, o ISPB do participante indireto ou os 8 primeiros dígitos do CNPJ do prestador de serviço de iniciação (8 caracteres numéricos [0-9]);
   * - "yyyyMMdd": data (8 caracteres) de criação da recorrência;
   * - "zzzzzzzzzzz": sequencial criado pelo agente que gerou o
   * (11 caracteres alfanuméricos [a-z|A-Z|0-9]). Deve ser único dentro de cada "yyyyMMdd".
   * Dessa forma, o ID da recorrência deve ser formado de acordo com um dos tipos a seguir:
   * - "RRxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que permite novas tentativas de pagamento pós vencimento; ou
   * - "RNxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que não permite novas tentativas de pagamento pós vencimento.
   *
   * Pattern: `[a-zA-Z0-9]{29}`
   * Length: 29..29
   *
   * @example "RR1234567820240115abcdefghijk"
   */
  idRec?: RecId;
} & {
  /** Dados do recebedor `cnpj`, `nome` e `ispbParticipante` */
  recebedor?: {
    /**
     * CNPJ do usuário.
     *
     * Pattern: `\d{14}`
     */
    cnpj: string;
    /**
     * Nome do usuário.
     *
     * Length: 0..140
     */
    nome: string;
    /**
     * ISPB do usuário recebedor.
     *
     * Pattern: `\d{8}`
     */
    ispbParticipante: string;
  };
} & RecConfiguracao & RecAtualizacao;

/** Atributos de Revisão da Configuração de Recorrência */
export type RecRevisada = {
  /** Status do registro da recorrência */
  status?: "CANCELADA";
} & {
  /** Contendo o objeto `devedor` */
  vinculo?: {
    /** Contendo `nome`. */
    devedor?: {
      /**
       * Nome do devedor.
       *
       * Length: 0..140
       */
      nome?: string;
    };
  };
} & {
  /**
   * Identificador da location a ser informado na criação de uma recorrência.
   *
   * Format: `int64`
   */
  loc?: PayloadLocationRecId;
} & {
  /** Contendo `dataInicial` */
  calendario?: RecRevisadaCalendario;
} & RecAtivacaoSolicitada;

/** Contendo `dataInicial` */
export interface RecRevisadaCalendario {
  /**
   * Trata-se de uma data, no formato `YYYY-MM-DD`, segundo ISO 8601. Data estimada de primeiro pagamento.
   *
   * Format: `date`
   *
   * @example "2023-04-01T00:00:00.000Z"
   */
  dataInicial?: string;
}

/** Atributos de Notificação de Recorrência */
export type RecNotification = {
  /**
   * # Identificador da Recorrência
   *
   * Regra de formação:
   *
   * - RAxxxxxxxxyyyyMMddzzzzzzzzzzz (29 caracteres; "case sensitive", isso
   * é, diferencia letras maiúsculas e minúsculas), sendo:
   * - "R": fixo (1 caractere). "R" para a recorrência criada dentro do
   * Pix;
   * - "A": identificação da possibilidade de novas tentativas, sendo
   * possíveis os valores "R" ou "N" (1 caractere). "R" caso a recorrência permita novas tentativas de pagamento pós vencimento, ou "N" caso não permita novas tentativas.
   * - "xxxxxxxx": identificação do agente que presta serviço para o
   * usuário recebedor que gerou o , podendo ser: o ISPB do participante direto, o ISPB do participante indireto ou os 8 primeiros dígitos do CNPJ do prestador de serviço de iniciação (8 caracteres numéricos [0-9]);
   * - "yyyyMMdd": data (8 caracteres) de criação da recorrência;
   * - "zzzzzzzzzzz": sequencial criado pelo agente que gerou o
   * (11 caracteres alfanuméricos [a-z|A-Z|0-9]). Deve ser único dentro de cada "yyyyMMdd".
   * Dessa forma, o ID da recorrência deve ser formado de acordo com um dos tipos a seguir:
   * - "RRxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que permite novas tentativas de pagamento pós vencimento; ou
   * - "RNxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que não permite novas tentativas de pagamento pós vencimento.
   *
   * Pattern: `[a-zA-Z0-9]{29}`
   * Length: 29..29
   *
   * @example "RR1234567820240115abcdefghijk"
   */
  idRec?: RecId;
} & RecStatus & RecAtualizacao & RecEncerramento & RecAtivacao;

/** Dados relacionados à confirmação da ativação da recorrência. */
export interface RecAtivacao {
  /** Contendo `tipojornada`e `dadosJornada` */
  ativacao?: RecAtivacaoConfirmacao;
}

/** Contendo `tipojornada`e `dadosJornada` */
export interface RecAtivacaoConfirmacao {
  /**
   * Dado relacionado ao caminho percorrido pelo processo de adesão à recorrência pelo usuário pagador:
   * - `JORNADA_1`: Usuário pagador aceitou a recorrência através de notificação externa.
   * - `JORNADA_2`: Usuário pagador aceitou a recorrência através de leitura de QR Code de recorrência.
   * - `JORNADA_3`: Usuário pagador iniciou a recorrência através de leitura de QR Code composto e pagamento de cobrança imediata.
   * - `JORNADA_4`: Usuário pagador escolheu aderir à recorrência através de leitura de QR Code composto relacionado à cobrança com vencimento.
   * - `AGUARDANDO_DEFINICAO`: Valor inicial posterior à criação e anterior à ativação da recorrência.
   */
  tipoJornada: "JORNADA_1" | "JORNADA_2" | "JORNADA_3" | "JORNADA_4" | "AGUARDANDO_DEFINICAO";
  /** Contendo `txid` */
  dadosJornada?: RecAtivacaoJornada;
}

/** Dados relacionados à confirmação da ativação da recorrência. */
export interface RecAtivacaoSolicitada {
  /** Contendo `dadosJornada` */
  ativacao?: {
    /** Contendo `txid` */
    dadosJornada?: RecAtivacaoJornada;
  };
}

/** Contendo `txid` */
export interface RecAtivacaoJornada {
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
}

/** Status da Recorrência */
export interface RecStatus {
  /**
   * Status do registro da recorrência:
   * - `CRIADA`: Recorrência criada, aguardando aprovação do pagador
   * - `APROVADA`: Recorrência aprovada pelo pagador e ativa
   * - `REJEITADA`: Recorrência rejeitada pelo pagador
   * - `EXPIRADA`: Recorrência expirou sem aprovação
   * - `CANCELADA`: Recorrência cancelada pelo recebedor ou pagador
   */
  status: "CRIADA" | "APROVADA" | "REJEITADA" | "EXPIRADA" | "CANCELADA";
}

/** Configuração da Recorrência */
export interface RecConfiguracao {
  /**
   * NAO_PERMITE: Não permite retentativas. PERMITE_3R_7D: Permite até 3 retentativas em dias diferentes no intervalo de até 7 dias corridos contados a partir da data de liquidação prevista na instrução de pagamento original. As retentativas devem ser enviadas pelo recebedor. [Consulte a documentação](#tag/Cobranca-Recorrente/operation/cobrTxidRetentativaDataPost)
   */
  politicaRetentativa: "NAO_PERMITE" | "PERMITE_3R_7D";
}

/** Histórico de atualização da recorrência. */
export interface RecAtualizacao {
  /** Contendo `status`e `data`. */
  atualizacao: Array<{
    /**
     * Status da recorrência:
     * - `CRIADA`: Recorrência criada, aguardando aprovação do pagador
     * - `APROVADA`: Recorrência aprovada pelo pagador e ativa
     * - `REJEITADA`: Recorrência rejeitada pelo pagador
     * - `EXPIRADA`: Recorrência expirou sem aprovação
     * - `CANCELADA`: Recorrência cancelada pelo recebedor ou pagador
     */
    status: "CRIADA" | "APROVADA" | "REJEITADA" | "EXPIRADA" | "CANCELADA";
    /**
     * Data e hora do registro de status atualizado. Respeita RFC 3339.
     *
     * Format: `date-time`
     */
    data: string;
  }>;
}

/** Detalhamento do encerramento da recorrência. */
export interface RecEncerramento {
  /** Detalha o encerramento da recorrência, seja por `rejeicao` ou `cancelamento` */
  encerramento?: {
    /** Contendo `codigo` e `descricao` da causa da rejeição. */
    rejeicao?: RecEncerramentoRejeicao;
    /** Contendo `solicitante`, `codigo` e `descricao` do cancelamento. */
    cancelamento?: RecEncerramentoCancelamento;
  };
}

/** Contendo `codigo` e `descricao` da causa da rejeição. */
export interface RecEncerramentoRejeicao {
  /**
   * Código da rejeição.AC01: Conta não localizada ou não pertencente ao usuário pagador.AC04: Conta transacional do usuário pagador encontra-se encerrada.AC06: Conta transacional do usuário pagador encontra-se bloqueada.AG12: Não é permitido o envio da solicitação de autorização de recorrência, de cancelamento de recorrência, de confirmação de recorrência ou de cancelamento de pain.009 para uma conta transacional na mesma instituição ou em participante que utilize o serviço de liquidação de um mesmo participante liquidante no SPI.AM05: Solicitação de confirmação de recorrência para pagamentos periódicos já confirmada previamente ou com status 'PDNG'.AP01: Divergência no campo de atualização dos dados da recorrência para os pagamentos periódicos e o status da recorrência para os pagamentos periódicos (ex.: falta de sincronização).AP02: CPF/CNPJ do usuário pagador não localizado ou diferente do constante na pain.009 original. Ou, no caso de cancelamento, o CPF/CNPJ usuário pagador não coincide com o contido nos dados da recorrência para os pagamentos periódicos.AP03: Agência do usuário pagador não localizada.AP04: ID da recorrência inválido ou não corresponde ao original.AP05: Status da recorrência para os pagamentos periódicos inconsistente.AP06: CPF/CNPJ do usuário recebedor diferente do constante na pain.009 ou do payload. Ou, no caso de cancelamento, o CPF/CNPJ usuário recebedor não coincide com o contido nos dados da recorrência para os pagamentos periódicos.AP07: Confirmação da recorrência pelo usuário pagador realizada após a expiração ou cancelamento da solicitação de confirmação (pain.009).AP08: Primeiro pagamento imediato associado à recorrência não foi identificado. (Válido apenas para a Jornada 3 de autorização.).AP09: Solicitação de confirmação de recorrência para pagamentos periódicos não foi identificada para viabilizar seu cancelamento.AP10: CPF/CNPJ do solicitante do cancelamento não corresponde à identificação do usuário pagador/recebedor ou do PSP pagador/recebedor contidos na recorrência para os pagamentos periódicos.AP11: ISPB do PSP pagador diverge da informação contida na recorrência para pagamentos periódicos.AP12: ISPB do PSP recebedor diverge da informação contida na recorrência para pagamentos periódicos.AP13: Solicitação de confirmação da recorrência para os pagamentos periódicos rejeitada pelo usuário pagador por não reconhecimento do usuário recebedor.AP14: Solicitação de confirmação da recorrência para os pagamentos periódicos rejeitada pelo usuário pagador por não ter interesse no uso do Pix Automático para o usuário recebedor.AP15: Solicitação de confirmação da recorrência para os pagamentos periódicos rejeitada pelo participante do usuário pagador que optou por não oferecer uso do Pix Automático para cliente pessoa jurídica.CH16: Preenchimento do conteúdo da mensagem incorreto ou incompatível com as regras de negócio.DS27: Participante não se encontra cadastrado ou ainda não iniciou a operação no SPI.MD01: Recorrência objeto da solicitação de cancelamento não existe. Não deve ser utilizado para solicitações de cancelamento de pain.009 com status = 'PDNG'. Ou seja, uma recorrência com status = 'PDNG' deve ser considerada como uma recorrência existente.MD20: Recorrência objeto da solicitação de cancelamento já expirou.RC09: ISPB do participante do usuário pagador inválido ou inexistente.RC10: ISPB do participante do usuário recebedor inválido ou inexistente.
   *
   * Length: 0..4
   */
  codigo: "AC01" | "AC04" | "AC06" | "AG12" | "AM05" | "AP01" | "AP02" | "AP03" | "AP04" | "AP05" | "AP06" | "AP07" | "AP08" | "AP09" | "AP10" | "AP11" | "AP12" | "AP13" | "AP14" | "AP15" | "CH16" | "DS27" | "MD01" | "MD20" | "RC09" | "RC10";
  /**
   * Descricao da causa da rejeição
   *
   * Length: 0..105
   */
  descricao: string;
}

/** Contendo `solicitante`, `codigo` e `descricao` do cancelamento. */
export interface RecEncerramentoCancelamento {
  /**
   * Identifica quem solicitou o cancelamento:
   * - `PSP_PAGADOR`: Cancelamento solicitado pelo PSP do pagador
   * - `USUARIO_PAGADOR`: Cancelamento solicitado pelo usuário pagador
   * - `PSP_RECEBEDOR`: Cancelamento solicitado pelo PSP do recebedor
   * - `USUARIO_RECEBEDOR`: Cancelamento solicitado pelo usuário recebedor
   */
  solicitante: "PSP_PAGADOR" | "USUARIO_PAGADOR" | "PSP_RECEBEDOR" | "USUARIO_RECEBEDOR";
  /**
   * Razão para a mudança de status. Valores possíveis:
   * - **ACCL**: Cancelamento motivado por encerramento de conta
   * - **CPCL**: Cancelamento motivado por encerramento de empresa
   * - **DCSD**: Cancelamento motivado por falecimento
   * - **ERSL**: Cancelamento solicitado pelo usuário recebedor ou pelo seu participante por erro na solicitação de confirmação
   * - **FRUD**: Cancelamento motivado por fraude
   * - **PCFD**: Cancelamento solicitado pelo PSP recebedor por ausência de resposta à pain.009 dentro do prazo regulamentar
   * - **SLCR**: Cancelamento solicitado pelo participante do usuário recebedor porque a mesma recorrência foi confirmada por meio de outra jornada, por exemplo, via QR Code
   * - **SLDB**: Cancelamento solicitado pelo usuário recebedor
   *
   * Length: 0..4
   */
  codigo: "ACCL" | "CPCL" | "DCSD" | "ERSL" | "FRUD" | "PCFD" | "SLCR" | "SLDB";
  /**
   * Descricao do cancelamento.
   *
   * Length: 0..105
   */
  descricao: string;
}

/**
 * # Identificador da Recorrência
 *
 * Regra de formação:
 *
 * - RAxxxxxxxxyyyyMMddzzzzzzzzzzz (29 caracteres; "case sensitive", isso
 * é, diferencia letras maiúsculas e minúsculas), sendo:
 * - "R": fixo (1 caractere). "R" para a recorrência criada dentro do
 * Pix;
 * - "A": identificação da possibilidade de novas tentativas, sendo
 * possíveis os valores "R" ou "N" (1 caractere). "R" caso a recorrência permita novas tentativas de pagamento pós vencimento, ou "N" caso não permita novas tentativas.
 * - "xxxxxxxx": identificação do agente que presta serviço para o
 * usuário recebedor que gerou o , podendo ser: o ISPB do participante direto, o ISPB do participante indireto ou os 8 primeiros dígitos do CNPJ do prestador de serviço de iniciação (8 caracteres numéricos [0-9]);
 * - "yyyyMMdd": data (8 caracteres) de criação da recorrência;
 * - "zzzzzzzzzzz": sequencial criado pelo agente que gerou o
 * (11 caracteres alfanuméricos [a-z|A-Z|0-9]). Deve ser único dentro de cada "yyyyMMdd".
 * Dessa forma, o ID da recorrência deve ser formado de acordo com um dos tipos a seguir:
 * - "RRxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que permite novas tentativas de pagamento pós vencimento; ou
 * - "RNxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que não permite novas tentativas de pagamento pós vencimento.
 */
export type RecId = string;

/** Atributos de Configuração de Recorrência */
export interface RecBase {
  /** Contendo `objeto`, `devedor` e `contrato`. */
  vinculo: RecBaseObjeto;
  /** Contendo `dataInicial`, `dataFinal` e `periodicidade` da recorrência. */
  calendario: RecBaseCalendario;
  /** Contendo `valorRec`e `ValorMinimoRecebedor` */
  valor?: {
    /**
     * Campo opcional, deve ser preenchido apenas quando o valor dos pagamentos for fixo ou não for sujeito a alteração durante a vigência da autorização.
     *
     * Pattern: `\d{1,10}\.\d{2}`
     */
    valorRec?: string;
    /**
     * Campo opcional. Valor definido pelo usuário recebedor. Se o usuário pagador atribuir um valor máximo para os pagamentos daquela autorização, ele não poderá ser inferior ao piso definido pelo usuário recebedor. Não pode ser preenchido nas autorizações de valor fixo, ou seja, com campo valor preenchido.
     *
     * Pattern: `\d{1,10}\.\d{2}`
     */
    valorMinimoRecebedor?: string;
  };
}

/** Contendo `objeto`, `devedor` e `contrato`. */
export interface RecBaseObjeto {
  /**
   * Campo de texto livre para informações referentes ao contrato que permitam ao usuário pagador reconhecer o objeto dos pagamentos periódicos por meio do Pix Automático.
   *
   * Length: 0..35
   */
  objeto?: string;
  /** Contendo `nome` e `cpf` ou `cnpj` */
  devedor: {
    /**
     * Nome do devedor.
     *
     * Length: 0..140
     */
    nome?: string;
    /**
     * CPF do devedor.
     *
     * Pattern: `\d{11}`
     */
    cpf?: string;
  } | {
    /**
     * Nome do devedor.
     *
     * Length: 0..140
     */
    nome?: string;
    /**
     * CNPJ do devedor.
     *
     * Pattern: `\d{14}`
     */
    cnpj?: string;
  };
  /**
   * Número, identificador, ou código que representa o objeto da autorização (contrato, pedido etc.).
   *
   * Length: 0..35
   */
  contrato: string;
}

/** Dados criados ou alterados da cobrança recorrente via API Pix */
export interface SolicRecId {
  /**
   * # Identificador da Solicitação da Recorrência
   *
   * Regra de formação:
   * - SCxxxxxxxxyyyyMMddzzzzzzzzzzz (29 caracteres; “case sensitive”, isso é, diferencia letras maiúsculas e minúsculas), sendo:
   * - SC - fixo (2 caracteres);
   * - xxxxxxxx – ISPB do agente que envia a mensagem pain.009 de
   * solicitação de confirmação da recorrência;
   * - yyyyMMdd – data (8 caracteres) de criação da mensagem pain.009
   * de solicitação de confirmação da recorrência;
   * - zzzzzzzzzzz – sequencial criado pelo agente que gerou a
   * mensagem de solicitação de confirmação da recorrência (11 caracteres alfanuméricos [a-z|A-Z|0-9]). Deve ser único dentro de cada “yyyyMMdd”.
   *
   * Pattern: `[a-zA-Z0-9]{29}`
   * Length: 29..29
   *
   * @example "SC1234567820240115abcdefghijk"
   */
  idSolicRec: string;
}

/** Dados criados ou alterados da cobrança recorrente via API Pix */
export interface SolicRecBase {
  /**
   * # Identificador da Recorrência
   *
   * Regra de formação:
   *
   * - RAxxxxxxxxyyyyMMddzzzzzzzzzzz (29 caracteres; "case sensitive", isso
   * é, diferencia letras maiúsculas e minúsculas), sendo:
   * - "R": fixo (1 caractere). "R" para a recorrência criada dentro do
   * Pix;
   * - "A": identificação da possibilidade de novas tentativas, sendo
   * possíveis os valores "R" ou "N" (1 caractere). "R" caso a recorrência permita novas tentativas de pagamento pós vencimento, ou "N" caso não permita novas tentativas.
   * - "xxxxxxxx": identificação do agente que presta serviço para o
   * usuário recebedor que gerou o , podendo ser: o ISPB do participante direto, o ISPB do participante indireto ou os 8 primeiros dígitos do CNPJ do prestador de serviço de iniciação (8 caracteres numéricos [0-9]);
   * - "yyyyMMdd": data (8 caracteres) de criação da recorrência;
   * - "zzzzzzzzzzz": sequencial criado pelo agente que gerou o
   * (11 caracteres alfanuméricos [a-z|A-Z|0-9]). Deve ser único dentro de cada "yyyyMMdd".
   * Dessa forma, o ID da recorrência deve ser formado de acordo com um dos tipos a seguir:
   * - "RRxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que permite novas tentativas de pagamento pós vencimento; ou
   * - "RNxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que não permite novas tentativas de pagamento pós vencimento.
   *
   * Pattern: `[a-zA-Z0-9]{29}`
   * Length: 29..29
   *
   * @example "RR1234567820240115abcdefghijk"
   */
  idRec: RecId;
  /** Contendo `dataExpiracaoSolicitacao` da solicitação de recorrência. */
  calendario: SolicrecBaseCalendario;
  /** Contendo `conta`, `ìspbParticipante`, `agencia` e `cpf` ou `cnpj` do pagador. */
  destinatario: DadosBancarios;
}

/** Status da Solicitação de Recorrência */
export interface SolicRecStatus {
  /**
   * Status da solicitação de recorrência:
   * - `CRIADA`: Solicitação criada, aguardando envio
   * - `ENVIADA`: Solicitação enviada ao pagador
   * - `RECEBIDA`: Solicitação recebida pelo pagador
   * - `REJEITADA`: Solicitação rejeitada pelo pagador
   * - `ACEITA`: Solicitação aceita pelo pagador
   * - `EXPIRADA`: Solicitação expirou sem resposta
   * - `CANCELADA`: Solicitação cancelada
   */
  status: "CRIADA" | "ENVIADA" | "RECEBIDA" | "REJEITADA" | "ACEITA" | "EXPIRADA" | "CANCELADA";
}

/** Histórico de Status da Solicitação de Recorrência */
export interface SolicRecAtualizacao {
  /** Contendo `status`e `data` */
  atualizacao: Array<{
    /**
     * Status da solicitação de recorrência:
     * - `CRIADA`: Solicitação criada, aguardando envio
     * - `ENVIADA`: Solicitação enviada ao pagador
     * - `RECEBIDA`: Solicitação recebida pelo pagador
     * - `REJEITADA`: Solicitação rejeitada pelo pagador
     * - `ACEITA`: Solicitação aceita pelo pagador
     * - `EXPIRADA`: Solicitação expirou sem resposta
     * - `CANCELADA`: Solicitação cancelada
     */
    status: "CRIADA" | "ENVIADA" | "RECEBIDA" | "REJEITADA" | "ACEITA" | "EXPIRADA" | "CANCELADA";
    /**
     * Data e hora do registro de status atualizado. Respeita RFC 3339.
     *
     * Format: `date-time`
     */
    data: string;
  }>;
}

/** Dados criados ou alterados da solicitação da recorrência */
export type SolicRecSolicitada = SolicRecBase;

/** Dados alterados da solicitação da recorrência */
export interface SolicRecRevisada {
  /** Status do registro da solicitação de recorrência */
  status: "CANCELADA";
}

/** Dados criados ou alterados da solicitação da recorrência */
export type SolicRecCompleta = SolicRecBase & SolicRecId & SolicRecStatus & SolicRecAtualizacao & {
  /**
   * Atributos de Configuração de Recorrência:
   *
   * `vinculo`, `calendario`, `valor`, `idRec`, `recebedor`, `politicaRetentativa` e `atualizacao`
   */
  recPayload?: RecPayload;
};

/** Dados criados ou alterados da cobrança recorrente via API Pix */
export type CobRGerada = {
  /**
   * # Identificador da Recorrência
   *
   * Regra de formação:
   *
   * - RAxxxxxxxxyyyyMMddzzzzzzzzzzz (29 caracteres; "case sensitive", isso
   * é, diferencia letras maiúsculas e minúsculas), sendo:
   * - "R": fixo (1 caractere). "R" para a recorrência criada dentro do
   * Pix;
   * - "A": identificação da possibilidade de novas tentativas, sendo
   * possíveis os valores "R" ou "N" (1 caractere). "R" caso a recorrência permita novas tentativas de pagamento pós vencimento, ou "N" caso não permita novas tentativas.
   * - "xxxxxxxx": identificação do agente que presta serviço para o
   * usuário recebedor que gerou o , podendo ser: o ISPB do participante direto, o ISPB do participante indireto ou os 8 primeiros dígitos do CNPJ do prestador de serviço de iniciação (8 caracteres numéricos [0-9]);
   * - "yyyyMMdd": data (8 caracteres) de criação da recorrência;
   * - "zzzzzzzzzzz": sequencial criado pelo agente que gerou o
   * (11 caracteres alfanuméricos [a-z|A-Z|0-9]). Deve ser único dentro de cada "yyyyMMdd".
   * Dessa forma, o ID da recorrência deve ser formado de acordo com um dos tipos a seguir:
   * - "RRxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que permite novas tentativas de pagamento pós vencimento; ou
   * - "RNxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que não permite novas tentativas de pagamento pós vencimento.
   *
   * Pattern: `[a-zA-Z0-9]{29}`
   * Length: 29..29
   *
   * @example "RR1234567820240115abcdefghijk"
   */
  idRec?: RecId;
} & {
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
} & CobRBase & {
  /** Contendo `dataDeVencimento` e `criacao` */
  calendario?: CobrCalendario;
} & {
  /** O objeto recebedor organiza as informações sobre o recebedor da cobrança. */
  recebedor?: DadosBancariosRecebedorCompleto;
} & CobRStatus & DadosDevedorRecorrencia;

/** Dados completos da cobrança recorrente via API Pix */
export type CobRCompleta = {
  /**
   * # Identificador da Recorrência
   *
   * Regra de formação:
   *
   * - RAxxxxxxxxyyyyMMddzzzzzzzzzzz (29 caracteres; "case sensitive", isso
   * é, diferencia letras maiúsculas e minúsculas), sendo:
   * - "R": fixo (1 caractere). "R" para a recorrência criada dentro do
   * Pix;
   * - "A": identificação da possibilidade de novas tentativas, sendo
   * possíveis os valores "R" ou "N" (1 caractere). "R" caso a recorrência permita novas tentativas de pagamento pós vencimento, ou "N" caso não permita novas tentativas.
   * - "xxxxxxxx": identificação do agente que presta serviço para o
   * usuário recebedor que gerou o , podendo ser: o ISPB do participante direto, o ISPB do participante indireto ou os 8 primeiros dígitos do CNPJ do prestador de serviço de iniciação (8 caracteres numéricos [0-9]);
   * - "yyyyMMdd": data (8 caracteres) de criação da recorrência;
   * - "zzzzzzzzzzz": sequencial criado pelo agente que gerou o
   * (11 caracteres alfanuméricos [a-z|A-Z|0-9]). Deve ser único dentro de cada "yyyyMMdd".
   * Dessa forma, o ID da recorrência deve ser formado de acordo com um dos tipos a seguir:
   * - "RRxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que permite novas tentativas de pagamento pós vencimento; ou
   * - "RNxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que não permite novas tentativas de pagamento pós vencimento.
   *
   * Pattern: `[a-zA-Z0-9]{29}`
   * Length: 29..29
   *
   * @example "RR1234567820240115abcdefghijk"
   */
  idRec?: RecId;
} & {
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
} & CobRBase & {
  /** Contendo `dataDeVencimento` e `criacao` */
  calendario?: CobrCalendario;
} & CobRStatus & CobRConfiguracao & DadosDevedorRecorrencia & {
  /** Contendo `endToEndId`, `txid`, `valor`, `horario`, `infoPagador` e `devolucoes` */
  pix?: PixAutomatico[];
} & CobRAtualizacao & CobRTentativas;

/** Histórico de Atualização da Cobrança Recorrente */
export interface CobRAtualizacao {
  /** Histórico das mudanças de status das cobranças recorrentes. */
  atualizacao: Array<{
    /**
     * Status da cobrança recorrente:
     * - `CRIADA`: A cobrança foi criada pelo usuário recebedor
     * - `ATIVA`: O PSP Pagador recebeu e aceitou a cobrança, agendando o pagamento
     * - `CONCLUIDA`: A cobrança foi paga com sucesso
     * - `EXPIRADA`: A cobrança não foi liquidada após todas as tentativas de pagamento permitidas
     * - `REJEITADA`: A cobrança foi rejeitada pelo PSP Pagador
     * - `CANCELADA`: A cobrança foi cancelada com sucesso
     */
    status: "CRIADA" | "ATIVA" | "CONCLUIDA" | "EXPIRADA" | "REJEITADA" | "CANCELADA";
    /**
     * Data e hora do registro de status atualizado. Respeita RFC 3339.
     *
     * Format: `date-time`
     */
    data: string;
  }>;
  /** Contendo `cancelamento` ou `rejeicao` */
  encerramento?: CobREncerramento;
}

/** Contendo `cancelamento` ou `rejeicao` */
export interface CobREncerramento {
  /** Informações sobre o cancelamento da cobrança */
  cancelamento?: CobRCancelamento;
  /** Informações sobre a rejeição da cobrança */
  rejeicao?: CobRRejeicao;
}

/** Informações sobre a rejeição da cobrança */
export interface CobRRejeicao {
  /**
   * Código da rejeição:
   * - **AB10**: Transação interrompida devido a erro no participante do usuário pagador.
   * - **AC05**: Conta transacional do usuário pagador encerrada.
   * - **AC06**: Conta transacional do usuário pagador bloqueada.
   * - **AG12**: Não é permitida solicitação de agendamento (pain.013) cujos recursos sejam transferidos de uma conta transacional para outra em uma mesma instituição participante ou entre participantes que utilizem o serviço de liquidação de um mesmo participante liquidante no SPI.
   * - **AM02**: Valor da cobrança ultrapassa o valor máximo estabelecido pelo usuário pagador.
   * - **AM09**: Valor da cobrança não corresponde ao valor estabelecido na recorrência.
   * - **DENC**: CPF/CNPJ do usuário pagador não corresponde ao dado contido na recorrência/autorização.
   * - **DS27**: Participante não se encontra cadastrado ou ainda não iniciou a operação no SPI.
   * - **DTED**: Divergência entre a data de vencimento informada e a periodicidade da recorrência e/ou as regras do produto.
   * - **DTNT**: Novas tentativas de agendamento pós vencimento em desacordo com o limite de dias definido na regra de negócio (a partir de D+8, considerando D0, a data do vencimento).
   * - **FBRD**: Pain.013 recebida fora do prazo para cumprimento das regras do negócio.
   * - **IRNT**: Cobrança recorrente não permite novas tentativas de agendamento pós vencimento (idRecorrencia com característica que não permite novas tentativas).
   * - **MIDI**: idRecorrencia inexistente ou incorreto.
   * - **MSUC**: statusRecorrencia diferente de (CFDB - confirmado pelo usuário pagador).
   * - **NIEC**: Nova instrução de pagamento inválida pois a mesma cobrança já possui ordem de pagamento agendada ainda pendente de envio ao SPI para liquidação.
   * - **NIPA**: Nova instrução de pagamento inválida, pagamento já foi efetivado.
   * - **NITX**: Nova instrução de pagamento não corresponde a uma cobrança recorrente gerada anteriormente.
   * (IdConciliacaoDoRecebedor diferentes). Utilizada somente para as finalidades de agendamento 'NTAG' e 'RIFL'.
   * - **QUNT**: Quantidade de novas tentativas de agendamento pós vencimento excede o limite definido pela regra de negócio (mais de 3 tentativas em intervalo de 7 dias após o vencimento, considerando D0, a data do vencimento).
   * - **RC09**: ISPB do participante do usuário pagador inválido ou inexistente.
   * - **UDEI**: CPF/CNPJ do devedor incorreto.
   *
   * Length: 0..4
   */
  codigo: "AB10" | "AC05" | "AC06" | "AG12" | "AM02" | "AM09" | "DENC" | "DS27" | "DTED" | "DTNT" | "FBRD" | "IRNT" | "MIDI" | "MSUC" | "NIEC" | "NIPA" | "NITX" | "QUNT" | "RC09" | "UDEI";
  /**
   * Descricao da causa da rejeição
   *
   * Length: 0..105
   */
  descricao: string;
}

/** Informações sobre o cancelamento da cobrança */
export interface CobRCancelamento {
  /**
   * Identifica quem solicitou o cancelamento:
   * - `PSP_PAGADOR`: Cancelamento solicitado pelo PSP do pagador
   * - `USUARIO_PAGADOR`: Cancelamento solicitado pelo usuário pagador
   * - `PSP_RECEBEDOR`: Cancelamento solicitado pelo PSP do recebedor
   * - `USUARIO_RECEBEDOR`: Cancelamento solicitado pelo usuário recebedor
   */
  solicitante: "PSP_PAGADOR" | "USUARIO_PAGADOR" | "PSP_RECEBEDOR" | "USUARIO_RECEBEDOR";
  /**
   * Código do cancelamento. ACCT: Encerramento de uma conta transacional. BLCK: Bloqueio de uma conta transacional. CCLD: Cancelamento da autorização para pagamentos periódicos. FAIL: Cancelamento do agendamento por falha ou erro no fluxo de liquidação. OTHR: Cancelamento por outros motivos. SLBD: Solicitado pelo usuário pagador. SLCR: Solicitado pelo usuário destinatário.
   *
   * Length: 0..4
   */
  codigo: "ACCT" | "BLCK" | "CCLD" | "FAIL" | "OTHR" | "SLBD" | "SLCR";
  /**
   * Descricao da causa do cancelamento
   *
   * Length: 0..105
   */
  descricao: string;
}

/** Histórico de Tentativas da Cobrança Recorrente */
export interface CobRTentativas {
  /** Histórico de Tentativas de Cobrança */
  tentativas?: Array<{
    /**
     * Data da liquidação da cobrança. Trata-se de uma data, no formato `YYYY-MM-DD`, segundo ISO 8601.
     *
     * Format: `date`
     *
     * @example "2023-04-01T00:00:00.000Z"
     */
    dataLiquidacao: string;
    /**
     * AGND - Agendamento do débito original. NTAG - Agendamento de nova tentativa após o vencimento. RIFL - Reenvio da instrução de pagamento devido a erro na liquidação.
     */
    tipo: "AGND" | "NTAG" | "RIFL";
    /**
     * Status da tentativa da cobrança:
     * - `SOLICITADA`: Cobrança agendada mas não paga até a data de vencimento.
     * - `AGENDADA`: O PSP Pagador recebeu e aceitou a cobrança, agendando o pagamento.
     * - `PAGA`: A cobrança foi paga com sucesso.
     * - `CANCELADA`: A cobrança foi cancelada com sucesso.
     * - `REJEITADA`: A cobrança foi rejeitada pelo PSP Pagador.
     * - `EXPIRADA`: A cobrança não foi liquidada após todas as tentativas de pagamento permitidas.
     */
    status: "SOLICITADA" | "AGENDADA" | "PAGA" | "CANCELADA" | "REJEITADA" | "EXPIRADA";
    /**
     * Id único para identificação do Pix Cobrança.
     *
     * Pattern: `[a-zA-Z0-9]{32}`
     */
    endToEndId: EndToEndId;
    /** Histórico das mudanças de status da tentativa de cobrança. */
    atualizacao: Array<{
      /**
       * Status da tentativa da cobrança:
       * - `SOLICITADA`: Cobrança agendada mas não paga até a data de vencimento.
       * - `AGENDADA`: O PSP Pagador recebeu e aceitou a cobrança, agendando o pagamento.
       * - `PAGA`: A cobrança foi paga com sucesso.
       * - `CANCELADA`: A cobrança foi cancelada com sucesso.
       * - `REJEITADA`: A cobrança foi rejeitada pelo PSP Pagador.
       * - `EXPIRADA`: A cobrança não foi liquidada após todas as tentativas de pagamento permitidas.
       */
      status: "SOLICITADA" | "AGENDADA" | "PAGA" | "CANCELADA" | "REJEITADA" | "EXPIRADA";
      /**
       * Data e hora do registro de status atualizado. Respeita RFC 3339.
       *
       * Format: `date-time`
       */
      data: string;
    }>;
    /** Informações sobre a rejeição da tentativa da cobrança */
    rejeicao?: {
      /**
       * Código da rejeição:
       * - **AB10**: Transação interrompida devido a erro no participante do usuário pagador.
       * - **AC05**: Conta transacional do usuário pagador encerrada.
       * - **AC06**: Conta transacional do usuário pagador bloqueada.
       * - **AM02**: Valor da cobrança ultrapassa o valor máximo estabelecido pelo usuário pagador.
       * - **AM09**: Valor da cobrança não corresponde ao valor estabelecido na recorrência.
       * - **DENC**: CPF/CNPJ do usuário pagador não corresponde ao dado contido na recorrência/autorização.
       * - **DS27**: Participante não se encontra cadastrado ou ainda não iniciou a operação no SPI.
       * - **DTED**: Divergência entre a data de vencimento informada e a periodicidade da recorrência e/ou as regras do produto.
       * - **DTNT**: Novas tentativas de agendamento pós vencimento em desacordo com o limite de dias definido na regra de negócio (a partir de D+8, considerando D0, a data do vencimento).
       * - **FBRD**: Pain.013 recebida fora do prazo para cumprimento das regras do negócio.
       * - **IRNT**: Cobrança recorrente não permite novas tentativas de agendamento pós vencimento (idRecorrencia com característica que não permite novas tentativas).
       * - **MIDI**: idRecorrencia inexistente ou incorreto.
       * - **MSUC**: statusRecorrencia diferente de (CFDB - confirmado pelo usuário pagador).
       * - **NIEC**: Nova instrução de pagamento inválida pois a mesma cobrança já possui ordem de pagamento agendada ainda pendente de envio ao SPI para liquidação.
       * - **NIPA**: Nova instrução de pagamento inválida, pagamento já foi efetivado.
       * - **NITX**: Nova instrução de pagamento não corresponde a uma cobrança recorrente gerada anteriormente.
       * (IdConciliacaoDoRecebedor diferentes). Utilizada somente para as finalidades de agendamento 'NTAG' e 'RIFL'.
       * - **QUNT**: Quantidade de novas tentativas de agendamento pós vencimento excede o limite definido pela regra de negócio (mais de 3 tentativas em intervalo de 7 dias após o vencimento, considerando D0, a data do vencimento).
       * - **RC09**: ISPB do participante do usuário pagador inválido ou inexistente.
       * - **UDEI**: CPF/CNPJ do devedor incorreto.
       *
       * Length: 0..4
       */
      codigo: "AB10" | "AC05" | "AC06" | "AM02" | "AM09" | "DENC" | "DS27" | "DTED" | "DTNT" | "FBRD" | "IRNT" | "MIDI" | "MSUC" | "NIEC" | "NIPA" | "NITX" | "QUNT" | "RC09" | "UDEI";
      /**
       * Descrição da causa da rejeição
       *
       * Length: 0..105
       */
      descricao: string;
    };
  }>;
}

/** Dados enviados para revisão da cobrança recorrente via API Pix */
export type CobRRevisada = CobRStatusRevisada;

/** Dados enviados para criação da cobrança recorrente via API Pix */
export type CobRSolicitada = {
  /**
   * # Identificador da Recorrência
   *
   * Regra de formação:
   *
   * - RAxxxxxxxxyyyyMMddzzzzzzzzzzz (29 caracteres; "case sensitive", isso
   * é, diferencia letras maiúsculas e minúsculas), sendo:
   * - "R": fixo (1 caractere). "R" para a recorrência criada dentro do
   * Pix;
   * - "A": identificação da possibilidade de novas tentativas, sendo
   * possíveis os valores "R" ou "N" (1 caractere). "R" caso a recorrência permita novas tentativas de pagamento pós vencimento, ou "N" caso não permita novas tentativas.
   * - "xxxxxxxx": identificação do agente que presta serviço para o
   * usuário recebedor que gerou o , podendo ser: o ISPB do participante direto, o ISPB do participante indireto ou os 8 primeiros dígitos do CNPJ do prestador de serviço de iniciação (8 caracteres numéricos [0-9]);
   * - "yyyyMMdd": data (8 caracteres) de criação da recorrência;
   * - "zzzzzzzzzzz": sequencial criado pelo agente que gerou o
   * (11 caracteres alfanuméricos [a-z|A-Z|0-9]). Deve ser único dentro de cada "yyyyMMdd".
   * Dessa forma, o ID da recorrência deve ser formado de acordo com um dos tipos a seguir:
   * - "RRxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que permite novas tentativas de pagamento pós vencimento; ou
   * - "RNxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que não permite novas tentativas de pagamento pós vencimento.
   *
   * Pattern: `[a-zA-Z0-9]{29}`
   * Length: 29..29
   *
   * @example "RR1234567820240115abcdefghijk"
   */
  idRec?: RecId;
} & CobRBase & DadosDevedorRecorrencia & {
  /** Contendo `email`, `logradouro`, `cidade`, `uf` e `cep` */
  devedor?: unknown;
};

/** Dados enviados para criação da cobrança recorrente via API Pix */
export type CobRNotification = {
  /**
   * # Identificador da Recorrência
   *
   * Regra de formação:
   *
   * - RAxxxxxxxxyyyyMMddzzzzzzzzzzz (29 caracteres; "case sensitive", isso
   * é, diferencia letras maiúsculas e minúsculas), sendo:
   * - "R": fixo (1 caractere). "R" para a recorrência criada dentro do
   * Pix;
   * - "A": identificação da possibilidade de novas tentativas, sendo
   * possíveis os valores "R" ou "N" (1 caractere). "R" caso a recorrência permita novas tentativas de pagamento pós vencimento, ou "N" caso não permita novas tentativas.
   * - "xxxxxxxx": identificação do agente que presta serviço para o
   * usuário recebedor que gerou o , podendo ser: o ISPB do participante direto, o ISPB do participante indireto ou os 8 primeiros dígitos do CNPJ do prestador de serviço de iniciação (8 caracteres numéricos [0-9]);
   * - "yyyyMMdd": data (8 caracteres) de criação da recorrência;
   * - "zzzzzzzzzzz": sequencial criado pelo agente que gerou o
   * (11 caracteres alfanuméricos [a-z|A-Z|0-9]). Deve ser único dentro de cada "yyyyMMdd".
   * Dessa forma, o ID da recorrência deve ser formado de acordo com um dos tipos a seguir:
   * - "RRxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que permite novas tentativas de pagamento pós vencimento; ou
   * - "RNxxxxxxxxyyyyMMddzzzzzzzzzzz"; para recorrência criada dentro do Pix e que não permite novas tentativas de pagamento pós vencimento.
   *
   * Pattern: `[a-zA-Z0-9]{29}`
   * Length: 29..29
   *
   * @example "RR1234567820240115abcdefghijk"
   */
  idRec?: RecId;
} & {
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
} & CobRStatus & CobRAtualizacao & CobRTentativas & {
  /** Pix recebidos */
  pix?: Array<PixAutomatico & {
    txid?: TxId;
  }>;
};

/** Configuração da Cobrança Recorrente */
export interface CobRConfiguracao {
  /**
   * NAO_PERMITE: Não permite retentativas. PERMITE_3R_7D: Permite até 3 retentativas em dias diferentes no intervalo de até 7 dias corridos contados a partir da data de liquidação prevista na instrução de pagamento original. As retentativas devem ser enviadas pelo recebedor. [Consulte a documentação](#tag/Cobranca-Recorrente/operation/cobrTxidRetentativaDataPost)
   */
  politicaRetentativa: "NAO_PERMITE" | "PERMITE_3R_7D";
}

/** Status da Cobrança Recorrente */
export interface CobRStatus {
  /**
   * Status da cobrança recorrente:
   * - `CRIADA`: A cobrança foi criada pelo usuário recebedor
   * - `ATIVA`: O PSP Pagador recebeu e aceitou a cobrança, agendando o pagamento
   * - `CONCLUIDA`: A cobrança foi paga com sucesso
   * - `EXPIRADA`: A cobrança não foi liquidada após todas as tentativas de pagamento permitidas
   * - `REJEITADA`: A cobrança foi rejeitada pelo PSP Pagador
   * - `CANCELADA`: A cobrança foi cancelada com sucesso
   */
  status?: "CRIADA" | "ATIVA" | "CONCLUIDA" | "EXPIRADA" | "REJEITADA" | "CANCELADA";
}

/** Status da Cobrança Recorrente */
export interface CobRStatusRevisada {
  /** Status do registro da cobrança */
  status?: "CANCELADA";
}

/** Atributos de cobrança recorrente */
export interface CobRBase {
  /**
   * Informações adicionais da fatura.
   *
   * Length: 0..140
   */
  infoAdicional?: string;
  /** Contendo `dataDeVencimento` */
  calendario?: CobRBaseCalendario;
  /** Contendo `valorOriginal` */
  valor?: CobRBaseValor;
  /**
   * Campo de ativação do ajuste da data de vencimento para próximo dia útil caso o vencimento corrente seja um dia não útil. O PSP Pagador deverá considerar os feriados locais com base no código município do usuário pagador.
   *
   * Default: `true`
   */
  ajusteDiaUtil: boolean;
  /** Contendo `nome`, `cnpj`, `conta`, `tipoConta` e `agencia` */
  recebedor?: DadosBancariosRecebedor;
}

/** Contendo `dataDeVencimento` */
export interface CobRBaseCalendario {
  /**
   * Trata-se de uma data, no formato `YYYY-MM-DD`, segundo ISO 8601. É a data de expiração da cobrança.
   *
   * Format: `date`
   *
   * @example "2023-04-01T00:00:00.000Z"
   */
  dataDeVencimento: string;
}

/** Contendo `dataDeVencimento` e `criacao` */
export type CobrCalendario = CobRBaseCalendario & {
  /**
   * Trata-se de uma data, no formato `YYYY-MM-DD`, segundo ISO 8601. É a data de criação da cobrança.
   *
   * Format: `date`
   *
   * @example "2023-04-01T00:00:00.000Z"
   */
  criacao: string;
};

/** Contendo `valorOriginal` */
export interface CobRBaseValor {
  /**
   * Valor original da cobrança.
   *
   * Pattern: `\d{1,10}\.\d{2}`
   */
  original: string;
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
   * @example 61996671234
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

export interface ChangeStatusRec {
  status: "APROVADA" | "CANCELADA";
  /**
   * Razão para a mudança de status. Valores possíveis:
   * - **ACCL**: Cancelamento motivado por encerramento de conta
   * - **CPCL**: Cancelamento motivado por encerramento de empresa
   * - **DCSD**: Cancelamento motivado por falecimento
   * - **ERSL**: Cancelamento solicitado pelo usuário recebedor ou pelo seu participante por erro na solicitação de confirmação
   * - **FRUD**: Cancelamento motivado por fraude
   * - **PCFD**: Cancelamento solicitado pelo PSP recebedor por ausência de resposta à pain.009 dentro do prazo regulamentar
   * - **SLCR**: Cancelamento solicitado pelo participante do usuário recebedor porque a mesma recorrência foi confirmada por meio de outra jornada, por exemplo, via QR Code
   * - **SLDB**: Cancelamento solicitado pelo usuário recebedor
   * - **NRES**: Cancelamento solicitado pelo usuário pagador
   */
  razao?: "ACCL" | "CPCL" | "DCSD" | "ERSL" | "FRUD" | "PCFD" | "SLCR" | "SLDB" | "NRES";
}

export interface ChangeStatusSolicRec {
  status: "ACEITA" | "REJEITADA";
}

export interface ChangeStatusCobr {
  status: "CANCELADA";
  /**
   * Razão para a mudança de status. Valores possíveis:
   * - **UNSPECIFIED**: Sem motivo específico fornecido.
   * - **ACCOUNT_CANCELED**: Conta cancelada.
   * - **ACCOUNT_BLOCKED**: Conta bloqueada.
   * - **RECURRENCE_CANCELED**: Recorrência cancelada.
   * - **SETTLEMENT_FAILED**: Liquidação falhou.
   * - **OTHER**: Outras razões não especificadas.
   * - **REQUESTED_BY_PAYER**: Cancelamento solicitado pelo pagador.
   * - **REQUESTED_BY_RECEIVER**: Cancelamento solicitado pelo recebedor.
   */
  razao: "UNSPECIFIED" | "ACCOUNT_CANCELED" | "ACCOUNT_BLOCKED" | "RECURRENCE_CANCELED" | "SETTLEMENT_FAILED" | "OTHER" | "REQUESTED_BY_PAYER" | "REQUESTED_BY_RECEIVER";
}

export interface MakePaymentCobr {
  /** @example 100 */
  valor: number;
  /** @example 9008007006 */
  cpfCnpj: string;
  /** @example "33beb661beda44a8928fef47dbeb2dc5" */
  txId: string;
  /** @example "12345678901" */
  chave: string;
}

export interface MakePaymentCobrResponse {
  /** @example "E00416968202406141552CmNRIqASznP" */
  endToEnd: string;
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
 * Query parameters for `GET /pix/v2/rec`.
 * Consultar lista de recorrências
 */
export interface RecGetQuery {
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
   * Filtro pelo status da recorrência:
   * - `CRIADA`: Recorrência criada, aguardando aprovação do pagador
   * - `APROVADA`: Recorrência aprovada pelo pagador e ativa
   * - `REJEITADA`: Recorrência rejeitada pelo pagador
   * - `EXPIRADA`: Recorrência expirou sem aprovação
   * - `CANCELADA`: Recorrência cancelada pelo recebedor ou pagador
   */
  status?: "CRIADA" | "APROVADA" | "REJEITADA" | "EXPIRADA" | "CANCELADA";
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
   * Filtro pelo convênio associado.
   *
   * Length: 0..60
   */
  convenio?: string;
}

/**
 * Query parameters for `GET /pix/v2/rec/{idRec}`.
 * Consultar recorrência
 */
export interface RecIdRecGetQuery {
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
}

/**
 * Query parameters for `GET /pix/v2/cobr`.
 * Consultar lista de cobranças recorrentes
 */
export interface CobrGetQuery {
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
  /**
   * Filtro pelo Identificador da Recorrência.
   *
   * Pattern: `[a-zA-Z0-9]{29}`
   * Length: 29..29
   */
  idRec?: string;
  /** Filtro pelo CPF do devedor. Não pode ser utilizado ao mesmo tempo que o CNPJ. */
  cpf?: string;
  /** Filtro pelo CNPJ do devedor. Não pode ser utilizado ao mesmo tempo que o CPF. */
  cnpj?: string;
  /**
   * Filtro pelo status da cobrança recorrente
   * - `CRIADA`: A cobrança foi criada pelo usuário recebedor
   * - `ATIVA`: O PSP Pagador recebeu e aceitou a cobrança,
   * agendando o pagamento
   * - `CONCLUIDA`: A cobrança foi paga com sucesso
   * - `EXPIRADA`: A cobrança não foi liquidada após todas as
   * tentativas de pagamento permitidas
   * - `REJEITADA`: A cobrança foi rejeitada pelo PSP Pagador
   * - `CANCELADA`: A cobrança foi cancelada com sucesso
   */
  status?: "CRIADA" | "ATIVA" | "CONCLUIDA" | "EXPIRADA" | "REJEITADA" | "CANCELADA";
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
   * Filtro pelo convênio associado.
   *
   * Length: 0..60
   */
  convenio?: string;
}

/**
 * Query parameters for `GET /pix/v2/locrec`.
 * Consultar locations cadastradas.
 */
export interface FindAllLocrecQuery {
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
  idRecPresente?: boolean;
  /**
   * Filtro pelo convênio associado.
   *
   * Length: 0..60
   */
  convenio?: string;
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
