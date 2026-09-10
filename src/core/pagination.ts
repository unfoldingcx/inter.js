/**
 * Pagination.
 *
 * Inter uses three different pagination envelopes across its APIs, plus a
 * scroll mode on the enriched statement. Every list method in this SDK returns
 * a {@link Page} for the raw response and a matching `…Paginated()` helper that
 * hands back a {@link Paginator} you can iterate without tracking page numbers.
 *
 * ```ts
 * for await (const cobranca of inter.cobranca.listAll({ dataInicial, dataFinal })) {
 *   console.log(cobranca.cobranca.seuNumero);
 * }
 * ```
 */

/** One page of results, normalised across the three envelope shapes. */
export interface Page<T> {
  /** Items on this page. */
  items: T[];
  /** Zero-based index of this page. */
  page: number;
  /** Items requested per page. */
  pageSize?: number;
  /** Total pages available, when the API reports it. */
  totalPages?: number;
  /** Total items available, when the API reports it. */
  totalItems?: number;
  /** `true` when another page can be fetched. */
  hasMore: boolean;
  /** The untouched response body, in case you need a field the envelope drops. */
  raw: unknown;
}

/** Fetches a single page. */
export type PageFetcher<T> = (page: number, signal?: AbortSignal) => Promise<Page<T>>;

/** Options accepted by every `…Paginated()` helper. */
export interface PaginateOptions {
  /** Zero-based page to start from. @default 0 */
  startPage?: number;
  /** Stop after this many items. */
  limit?: number;
  /** Cancels iteration between pages. */
  signal?: AbortSignal;
}

/**
 * A lazy cursor over a paginated endpoint.
 *
 * Iterating the paginator yields items; {@link pages} yields whole pages when
 * you need the envelope metadata.
 */
export class Paginator<T> implements AsyncIterable<T> {
  constructor(
    private readonly fetcher: PageFetcher<T>,
    private readonly options: PaginateOptions = {},
  ) {}

  /** Yields every page in order, stopping when the API says there are no more. */
  async *pages(): AsyncGenerator<Page<T>, void, undefined> {
    let page = this.options.startPage ?? 0;
    let emitted = 0;
    const limit = this.options.limit;

    for (;;) {
      this.options.signal?.throwIfAborted();
      const result = await this.fetcher(page, this.options.signal);
      yield result;

      emitted += result.items.length;
      if (limit !== undefined && emitted >= limit) return;
      if (!result.hasMore || result.items.length === 0) return;
      page++;
    }
  }

  /** Yields every item across every page. */
  async *[Symbol.asyncIterator](): AsyncGenerator<T, void, undefined> {
    let emitted = 0;
    const limit = this.options.limit;
    for await (const page of this.pages()) {
      for (const item of page.items) {
        if (limit !== undefined && emitted >= limit) return;
        emitted++;
        yield item;
      }
    }
  }

  /**
   * Collects every item into an array.
   *
   * Fetches sequentially, so a wide date range on a busy account can mean many
   * round trips. Pass `limit` when you only need the first N.
   */
  async all(): Promise<T[]> {
    const out: T[] = [];
    for await (const item of this) out.push(item);
    return out;
  }

  /** Returns the first item, or `undefined` when the result set is empty. */
  async first(): Promise<T | undefined> {
    for await (const item of this) return item;
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// envelope adapters
// ---------------------------------------------------------------------------

/** The Cobrança and Banking envelope: counters at the top level. */
interface FlatEnvelope {
  totalPaginas?: number;
  totalElementos?: number;
  tamanhoPagina?: number;
  primeiraPagina?: boolean;
  ultimaPagina?: boolean;
  numeroDeElementos?: number;
}

/** The Pix envelope: counters nested under `parametros.paginacao`. */
interface PixEnvelope {
  parametros?: {
    paginacao?: {
      paginaAtual?: number;
      itensPorPagina?: number;
      quantidadeDePaginas?: number;
      quantidadeTotalDeItens?: number;
    };
  };
}

/**
 * Normalises a `{ totalPaginas, ultimaPagina, … }` response.
 *
 * Used by Cobrança, the enriched statement and every callback listing.
 */
export function flatPage<T>(body: unknown, items: T[], requestedPage: number): Page<T> {
  const envelope = (body ?? {}) as FlatEnvelope;
  const totalPages = envelope.totalPaginas;
  const hasMore =
    envelope.ultimaPagina !== undefined
      ? !envelope.ultimaPagina
      : totalPages !== undefined
        ? requestedPage + 1 < totalPages
        : items.length > 0;

  return {
    items,
    page: requestedPage,
    pageSize: envelope.tamanhoPagina,
    totalPages,
    totalItems: envelope.totalElementos,
    hasMore,
    raw: body,
  };
}

/**
 * Normalises a `{ parametros: { paginacao: … } }` response.
 *
 * Used by every Pix and Pix Automático listing.
 */
export function pixPage<T>(body: unknown, items: T[], requestedPage: number): Page<T> {
  const paginacao = ((body ?? {}) as PixEnvelope).parametros?.paginacao;
  const page = paginacao?.paginaAtual ?? requestedPage;
  const totalPages = paginacao?.quantidadeDePaginas;

  return {
    items,
    page,
    pageSize: paginacao?.itensPorPagina,
    totalPages,
    totalItems: paginacao?.quantidadeTotalDeItens,
    hasMore: totalPages !== undefined ? page + 1 < totalPages : items.length > 0,
    raw: body,
  };
}
