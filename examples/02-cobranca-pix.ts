/**
 * Create a Pix charge, watch for the payment, then refund part of it.
 *
 *   bun run examples/02-cobranca-pix.ts
 */
import { InterClient } from "../src/index.ts";
import { parseBrCode, toPixAmount } from "../src/utils/index.ts";

const inter = new InterClient({ logLevel: "info" });
const chave = process.env.INTER_PIX_KEY ?? "pix@empresa.com.br";

// A txid you own makes the call idempotent: replaying it returns the same
// charge instead of creating a second one.
const txid = `PEDIDO${Date.now()}`.padEnd(26, "0").slice(0, 35);

const cob = await inter.pix.cob.createWithTxid(txid, {
  chave,
  valor: { original: toPixAmount(149.9) },
  calendario: { expiracao: 3600 },
  devedor: { cpf: "12345678909", nome: "Maria Souza" },
  solicitacaoPagador: "Pedido 1001",
  infoAdicionais: [{ nome: "Pedido", valor: "1001" }],
});

console.log("txid:", cob.txid, "status:", cob.status);
console.log("copia e cola:", cob.pixCopiaECola);

// Decode the payload locally to confirm it is intact before showing a QR code.
const decoded = parseBrCode(cob.pixCopiaECola ?? "");
console.log("payload valid:", decoded.valid, "| points at:", decoded.url ?? decoded.chave);

// In the sandbox you can play the payer's part.
if (inter.environment === "sandbox") {
  await inter.pix.cob.simulatePayment(txid, { valor: "149.90" } as never);
  console.log("simulated a payment");
}

const settled = await inter.pix.cob.get(txid);
console.log("status now:", settled.status, "| payments:", settled.pix?.length ?? 0);

const payment = settled.pix?.[0];
if (payment?.endToEndId) {
  const refund = await inter.pix.received.refund(payment.endToEndId, `REF${txid}`.slice(0, 35), {
    valor: toPixAmount(10),
  });
  console.log("refund:", refund.rtrId, refund.status);
}

// Everything received in the last day, paginated transparently.
const since = new Date(Date.now() - 86_400_000);
for await (const pix of inter.pix.received.listPaginated({ inicio: since, fim: new Date() }, { limit: 20 })) {
  console.log(pix.horario, pix.endToEndId, pix.valor);
}

await inter.close();
