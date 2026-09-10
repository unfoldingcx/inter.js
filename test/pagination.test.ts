import { describe, expect, test } from "bun:test";
import { InterClient, flatPage, Paginator, pixPage } from "../src/index.ts";
import { MockTransport } from "../src/testing.ts";

describe("Paginator", () => {
  const pageOf = (items: number[], page: number, totalPages: number) => ({
    items,
    page,
    totalPages,
    hasMore: page + 1 < totalPages,
    raw: null,
  });

  test("iterates items across pages", async () => {
    const paginator = new Paginator<number>(async (page) => pageOf([page * 2, page * 2 + 1], page, 3));
    expect(await paginator.all()).toEqual([0, 1, 2, 3, 4, 5]);
  });

  test("stops at the requested limit", async () => {
    let fetched = 0;
    const paginator = new Paginator<number>(
      async (page) => {
        fetched++;
        return pageOf([page * 2, page * 2 + 1], page, 100);
      },
      { limit: 3 },
    );
    expect(await paginator.all()).toEqual([0, 1, 2]);
    expect(fetched).toBe(2);
  });

  test("stops on an empty page even when the API claims more", async () => {
    const paginator = new Paginator<number>(async (page) => pageOf(page === 0 ? [1] : [], page, 99));
    expect(await paginator.all()).toEqual([1]);
  });

  test("first() reads only what it needs", async () => {
    let fetched = 0;
    const paginator = new Paginator<number>(async (page) => {
      fetched++;
      return pageOf([page], page, 10);
    });
    expect(await paginator.first()).toBe(0);
    expect(fetched).toBe(1);
  });

  test("pages() exposes envelope metadata", async () => {
    const paginator = new Paginator<number>(async (page) => pageOf([page], page, 2));
    const pages = [];
    for await (const page of paginator.pages()) pages.push(page.totalPages);
    expect(pages).toEqual([2, 2]);
  });
});

describe("envelope adapters", () => {
  test("reads the Cobrança and Banking shape", () => {
    const page = flatPage({ totalPaginas: 3, totalElementos: 25, tamanhoPagina: 10, ultimaPagina: false }, [1, 2], 0);
    expect(page).toMatchObject({ page: 0, pageSize: 10, totalPages: 3, totalItems: 25, hasMore: true });
  });

  test("trusts ultimaPagina over the page count", () => {
    expect(flatPage({ totalPaginas: 9, ultimaPagina: true }, [1], 0).hasMore).toBe(false);
  });

  test("reads the Pix shape", () => {
    const body = { parametros: { paginacao: { paginaAtual: 1, itensPorPagina: 100, quantidadeDePaginas: 4, quantidadeTotalDeItens: 350 } } };
    expect(pixPage(body, [1], 1)).toMatchObject({ page: 1, pageSize: 100, totalPages: 4, totalItems: 350, hasMore: true });
  });

  test("stops on the last Pix page", () => {
    const body = { parametros: { paginacao: { paginaAtual: 3, quantidadeDePaginas: 4 } } };
    expect(pixPage(body, [1], 3).hasMore).toBe(false);
  });
});

describe("resource pagination", () => {
  test("walks Cobrança pages and sends paginacao.paginaAtual", async () => {
    const transport = new MockTransport().withToken().onGet("/cobranca/v3/cobrancas", (req) => {
      const page = Number(req.query["paginacao.paginaAtual"] ?? 0);
      return {
        body: {
          totalPaginas: 3,
          ultimaPagina: page === 2,
          cobrancas: [{ cobranca: { seuNumero: `P${page}` } }],
        },
      };
    });
    const inter = new InterClient({ clientId: "a", clientSecret: "b", transport, rateLimit: false });

    const seen: string[] = [];
    for await (const item of inter.cobranca.listPaginated({ dataInicial: "2026-01-01", dataFinal: "2026-01-31" })) {
      seen.push(item.cobranca.seuNumero!);
    }

    expect(seen).toEqual(["P0", "P1", "P2"]);
    expect(transport.requestsFor("/cobranca/v3/cobrancas")).toHaveLength(3);
  });

  test("walks Pix pages using the nested envelope", async () => {
    const transport = new MockTransport().withToken().onGet("/pix/v2/cob", (req) => {
      const page = Number(req.query["paginacao.paginaAtual"] ?? 0);
      return {
        body: {
          parametros: { paginacao: { paginaAtual: page, quantidadeDePaginas: 2 } },
          cobs: [{ txid: `T${page}` }],
        },
      };
    });
    const inter = new InterClient({ clientId: "a", clientSecret: "b", transport, rateLimit: false });

    const items = await inter.pix.cob
      .listPaginated({ inicio: "2026-01-01T00:00:00Z", fim: "2026-01-31T00:00:00Z" })
      .all();

    expect(items.map((c) => c.txid)).toEqual(["T0", "T1"]);
  });

  test("follows the enriched statement's scroll cursor", async () => {
    let call = 0;
    const transport = new MockTransport().withToken().onGet("/banking/v2/extrato/completo", (req) => {
      call++;
      expect(req.query.scrollEnabled).toBe("true");
      if (call === 1) return { body: { hasMore: true, scrollId: "cursor-1", transacoes: [{ valor: "1" }] } };
      expect(req.query.scrollId).toBe("cursor-1");
      return { body: { hasMore: false, transacoes: [{ valor: "2" }] } };
    });
    const inter = new InterClient({ clientId: "a", clientSecret: "b", transport, rateLimit: false });

    const values: string[] = [];
    for await (const t of inter.banking.extratoCompletoScroll({ dataInicio: "2026-01-01", dataFim: "2026-01-31" })) {
      values.push(String(t.valor));
    }

    expect(values).toEqual(["1", "2"]);
    expect(call).toBe(2);
  });
});
