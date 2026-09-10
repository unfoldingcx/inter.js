/**
 * Receive callbacks over mutual TLS.
 *
 * Inter authenticates itself with a client certificate issued by its own CA.
 * Download that CA from Internet Banking under
 * `Minhas integrações > Certificado Webhook`, and give this server a TLS
 * certificate for a public hostname.
 *
 *   bun run examples/04-webhook-server.ts
 */
import { InterClient } from "../src/index.ts";
import { createWebhookServer } from "../src/webhooks/index.ts";

const inter = new InterClient({ logLevel: "info" });
const publicUrl = process.env.WEBHOOK_PUBLIC_URL ?? "https://api.example.com";

const server = await createWebhookServer({
  certificate: process.env.WEBHOOK_TLS_CERT ?? "./certs/server.crt",
  privateKey: process.env.WEBHOOK_TLS_KEY ?? "./certs/server.key",
  // Inter's public key. Without it, anyone could post to this endpoint.
  interCA: process.env.INTER_WEBHOOK_CA ?? "./certs/inter-ca.crt",
  port: Number(process.env.PORT ?? 8443),

  route: {
    "/webhooks/cobranca": "cobranca",
    "/webhooks/pix": "pix",
    "/webhooks/pix-pagamento": "banking.pix-pagamento",
    "/webhooks/boleto-pagamento": "banking.boleto-pagamento",
  },

  async onEvent({ source, events }, context) {
    console.log(`[${source}] ${events.length} event(s) from ${context.remoteAddress}`);

    // `source` narrows `events` to the right payload type.
    switch (source) {
      case "cobranca":
        for (const e of events) console.log("  boleto", e.seuNumero, "->", e.situacao, e.valorTotalRecebido);
        break;
      case "pix":
        for (const e of events) console.log("  pix in", e.endToEndId, e.valor, "txid", e.txid);
        break;
      case "banking.pix-pagamento":
        for (const e of events) console.log("  pix out", e.codigoSolicitacao, "->", e.status);
        break;
      case "banking.boleto-pagamento":
        for (const e of events) console.log("  payment", e.codigoTransacao, "->", e.status);
        break;
    }

    // Throwing here answers 500 and Inter retries later. Only do that for
    // failures that a retry could actually fix; acknowledge and queue otherwise.
  },

  onError(error, context) {
    console.error(`rejected callback on ${context.path}:`, error instanceof Error ? error.message : error);
  },
});

console.log(`listening on :${server.port}`);

// Point Inter at this server. One URL per API.
await inter.cobranca.webhook.set(`${publicUrl}/webhooks/cobranca`);
await inter.pix.webhook.set(process.env.INTER_PIX_KEY ?? "pix@empresa.com.br", `${publicUrl}/webhooks/pix`);
await inter.banking.webhooks.set("pix-pagamento", `${publicUrl}/webhooks/pix-pagamento`);
console.log("webhooks registered");

// After an outage, replay what you missed instead of reconciling by hand.
const attempts = await inter.pix.webhook
  .callbacksPaginated({ dataHoraInicio: new Date(Date.now() - 86_400_000), dataHoraFim: new Date() })
  .all();
console.log(`${attempts.length} delivery attempt(s) in the last day`);

process.on("SIGINT", () => {
  void server.close().then(() => inter.close()).then(() => process.exit(0));
});
