/**
 * Balance, statements and paying a boleto without risking a double payment.
 *
 *   bun run examples/03-banking.ts
 */
import { InterClient, InterAPIError } from "../src/index.ts";
import { formatBRL, parseBoleto, toPixAmount } from "../src/utils/index.ts";
import { randomUUID } from "node:crypto";

const inter = new InterClient({ logLevel: "info" });

const saldo = await inter.banking.saldo();
console.log("disponível:", formatBRL(saldo.disponivel ?? 0));
console.log("limite:", formatBRL(saldo.limite ?? 0));

// The simple statement covers up to 90 days and returns everything at once.
const extrato = await inter.banking.extrato({ dataInicio: "2026-01-01", dataFim: "2026-01-31" });
console.log(`${extrato.transacoes?.length ?? 0} transactions in January`);

// The enriched statement adds counterparty detail and pages.
let credits = 0;
for await (const t of inter.banking.extratoCompletoPaginated({
  dataInicio: "2026-01-01",
  dataFim: "2026-01-31",
  tipoOperacao: "C",
})) {
  credits += Number(t.valor ?? 0);
}
console.log("credited in January:", formatBRL(credits));

await Bun.write("extrato.pdf", await inter.banking.extratoPdf({ dataInicio: "2026-01-01", dataFim: "2026-01-31" }));

// Validate the barcode locally first: a wrong check digit is a guaranteed 400.
const linhaDigitavel = "00190500954014481606906809350314337370000000100";
const boleto = parseBoleto(linhaDigitavel);
if (!boleto.valid) throw new Error(`invalid boleto: ${boleto.error}`);
console.log("paying", formatBRL(boleto.valor ?? 0), "to bank", boleto.banco);

try {
  const payment = await inter.banking.pagamentos.payBoleto(
    {
      codBarraLinhaDigitavel: boleto.codigoBarras,
      valorPagar: toPixAmount(boleto.valor ?? 0),
      dataVencimento: boleto.vencimento?.toISOString().slice(0, 10) ?? "2026-12-31",
    },
    // Without a key the SDK refuses to replay this POST, so a timeout fails
    // loudly instead of paying twice. With one, a retry is safe.
    { idempotencyKey: randomUUID() },
  );
  console.log("payment:", payment.codigoTransacao, payment.statusPagamento);
} catch (err) {
  if (err instanceof InterAPIError) console.error(err.status, err.title, err.detail);
  else throw err;
}

// Outbound Pix gets an idempotency key automatically.
const pix = await inter.banking.pixPagamento.send({
  valor: 1.23,
  descricao: "Reembolso pedido 1001",
  destinatario: { tipo: "CHAVE", chave: "maria@example.com" },
});
console.log("pix out:", pix.codigoSolicitacao);
console.log("status:", (await inter.banking.pixPagamento.get(pix.codigoSolicitacao!)).transacaoPix?.status);

await inter.close();
