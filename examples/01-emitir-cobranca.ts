/**
 * Issue a boleto with an attached Pix QR code, wait for it to be produced, and
 * save the PDF.
 *
 *   bun run examples/01-emitir-cobranca.ts
 */
import { InterClient, InterValidationError, isValidCPF } from "../src/index.ts";

const inter = new InterClient({ logLevel: "info" });

// Fail fast on a bad certificate or missing credentials, before any business
// logic runs.
await inter.ready();
console.log(`certificate valid for ${inter.certificate?.daysUntilExpiry} more days`);

const cpf = "12345678909";
if (!isValidCPF(cpf)) throw new Error("payer CPF is invalid — no point spending an API call");

try {
  const { codigoSolicitacao } = await inter.cobranca.issue({
    // Your own identifier. Keep it unique per account: it is what ties the
    // callback back to an order in your system.
    seuNumero: `PED-${Date.now()}`,
    valorNominal: 149.9,
    dataVencimento: "2026-12-11",
    // How many days after the due date the boleto stays payable.
    numDiasAgenda: 30,
    pagador: {
      cpfCnpj: cpf,
      tipoPessoa: "FISICA",
      nome: "Maria Souza",
      endereco: "Rua São Paulo, 100",
      bairro: "Centro",
      cidade: "Belo Horizonte",
      uf: "MG",
      cep: "30170000",
      email: "maria@example.com",
    },
    multa: { codigo: "PERCENTUAL", taxa: 2 },
    mora: { codigo: "TAXAMENSAL", taxa: 1 },
    mensagem: { linha1: "Não receber após o vencimento." },
  });

  console.log("issued:", codigoSolicitacao);

  // Issuing is asynchronous: the boleto and QR code appear a moment later.
  const cobranca = await inter.cobranca.waitUntilIssued(codigoSolicitacao);
  console.log("situação:", cobranca.cobranca?.situacao);
  console.log("linha digitável:", cobranca.boleto?.linhaDigitavel);
  console.log("pix copia e cola:", cobranca.pix?.pixCopiaECola);

  await Bun.write("boleto.pdf", await inter.cobranca.pdf(codigoSolicitacao));
  console.log("saved boleto.pdf");

  const summary = await inter.cobranca.summary({ dataInicial: "2026-01-01", dataFinal: "2026-12-31" });
  for (const line of summary) console.log(line.situacao, line.quantidade, line.valor);
} catch (err) {
  if (err instanceof InterValidationError) {
    console.error("Inter rejected the request:");
    for (const v of err.violations) console.error(`  ${v.propriedade}: ${v.razao}`);
  } else {
    throw err;
  }
} finally {
  await inter.close();
}
