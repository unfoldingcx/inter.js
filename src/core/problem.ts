/**
 * RFC 7807 problem documents as Banco Inter returns them.
 *
 * Every API in the platform answers failures with `application/problem+json`
 * (a few endpoints use plain `application/json` with the same shape). The Pix
 * APIs follow the Banco Central specification, so `type` looks like
 * `https://pix.bcb.gov.br/api/v2/error/CobOperacaoInvalida`.
 */

/** One field-level rejection inside a problem document. */
export interface Violacao {
  /** Why the value was rejected, in Portuguese. */
  razao?: string;
  /** Dotted path of the offending property, e.g. `cob.valor.original`. */
  propriedade?: string;
  /** The value that was rejected. */
  valor?: string;
  [key: string]: unknown;
}

/** An RFC 7807 problem document. */
export interface Problema {
  /** URI identifying the error type, e.g. `.../error/CobOperacaoInvalida`. */
  type?: string;
  /** Short, human-readable summary. */
  title?: string;
  /** HTTP status code, repeated in the body. */
  status?: number;
  /** Human-readable explanation specific to this occurrence. */
  detail?: string;
  /** Field-level rejections. */
  violacoes?: Violacao[];
  /** Correlation identifier some Inter endpoints echo back. */
  correlationId?: string;
  /** Inter occasionally uses these instead of `title`/`detail`. */
  message?: string;
  /** Inter's internal error code on some Banking endpoints. */
  codigo?: string;
  [key: string]: unknown;
}

/**
 * Parses a response body into a problem document.
 *
 * Accepts the canonical RFC 7807 shape, Inter's `{ message, codigo }` variant,
 * and arrays of violations returned bare by a couple of Banking endpoints.
 * Returns `undefined` when the body is not JSON or carries no usable detail.
 */
export function parseProblem(body: unknown): Problema | undefined {
  if (body == null) return undefined;

  if (Array.isArray(body)) {
    const violacoes = body.filter((v): v is Violacao => typeof v === "object" && v !== null);
    return violacoes.length ? { violacoes } : undefined;
  }

  if (typeof body !== "object") return undefined;
  const record = body as Record<string, unknown>;

  const problem: Problema = { ...record };

  // Some endpoints nest the violations under a differently-cased key.
  const violations = record.violacoes ?? record.violations ?? record.violacao;
  if (Array.isArray(violations)) problem.violacoes = violations as Violacao[];
  else delete problem.violacoes;

  if (!problem.title && typeof record.message === "string") problem.title = record.message;
  if (!problem.detail && typeof record.mensagem === "string") problem.detail = record.mensagem;

  const hasSignal =
    problem.type || problem.title || problem.detail || problem.status || (problem.violacoes?.length ?? 0) > 0;
  return hasSignal ? problem : undefined;
}

/**
 * Extracts the short error identifier from a problem `type` URI.
 *
 * @example
 * problemCode({ type: "https://pix.bcb.gov.br/api/v2/error/CobOperacaoInvalida" })
 * // => "CobOperacaoInvalida"
 */
export function problemCode(problem: Problema | undefined): string | undefined {
  if (!problem) return undefined;
  if (typeof problem.codigo === "string" && problem.codigo) return problem.codigo;
  if (typeof problem.type !== "string") return undefined;
  const segment = problem.type.split("/").filter(Boolean).pop();
  return segment && segment !== problem.type ? segment : undefined;
}
