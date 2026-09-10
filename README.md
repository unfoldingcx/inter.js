# inter.js

A TypeScript SDK for **Banco Inter's** partner APIs. Covers all four public APIs, handles the
mutual-TLS handshake and OAuth token lifecycle for you, and ships request and response types
generated from Inter's own OpenAPI documents.

Runs on Node 18.17+, Bun and Deno. No runtime dependencies.

```ts
import { InterClient } from "inter.js";

const inter = new InterClient({
  clientId: process.env.INTER_CLIENT_ID,
  clientSecret: process.env.INTER_CLIENT_SECRET,
  certificate: "./certs/inter.crt",
  privateKey: "./certs/inter.key",
});

const { disponivel } = await inter.banking.saldo();
```

---

## Contents

- [Install](#install)
- [Getting credentials](#getting-credentials)
- [Configuration](#configuration)
- [The four APIs](#the-four-apis)
- [Errors](#errors)
- [Pagination](#pagination)
- [Webhooks](#webhooks)
- [Behaviour you can tune](#behaviour-you-can-tune)
- [Brazilian helpers](#brazilian-helpers)
- [Testing](#testing)
- [How the types are generated](#how-the-types-are-generated)
- [Endpoint map](#endpoint-map)

---

## Install

```sh
bun add inter.js     # or: npm install inter.js
```

## Getting credentials

Access is only available to Brazilian business accounts. In Internet Banking PJ, open
`Integrar > Nova integração`, pick the permissions your application needs, and submit the form.
Once approved, download the key and certificate — that download is also the only time the
`clientSecret` is shown.

You end up with four things:

| Item | Used for |
| --- | --- |
| `clientId` | OAuth client credentials |
| `clientSecret` | OAuth client credentials |
| `*.crt` | the client certificate presented on every connection |
| `*.key` | its private key |

Certificates last one year in production and 30 days in the sandbox. Renewal opens 90 days
before expiry and keeps the same `clientId` and `clientSecret`. The client reads the expiry date
at startup and warns you through your logger while there is still time to act.

## Configuration

Every option can also come from the environment, so the smallest working setup is
`new InterClient()` with these variables set:

```sh
INTER_CLIENT_ID=...
INTER_CLIENT_SECRET=...
INTER_CERTIFICATE=./certs/inter.crt
INTER_PRIVATE_KEY=./certs/inter.key
INTER_ENVIRONMENT=production      # or sandbox
INTER_CONTA_CORRENTE=1234567      # only when the integration covers several accounts
```

Certificates can be a file path, a PEM string, or raw bytes — which is what you want when they
come out of a secrets manager rather than a file:

```ts
const inter = new InterClient({
  certificate: await secrets.get("inter-cert"),  // PEM string
  privateKey: await secrets.get("inter-key"),
});
```

A PKCS#12 bundle works too, if you already produced one for Inter's Java or C# SDK:

```ts
new InterClient({ pfx: "./certs/inter.pfx", passphrase: process.env.INTER_PFX_PASSWORD });
```

**Several accounts on one integration.** Inter routes by the `x-conta-corrente` header. Set
`contaCorrente` on the client, override it per call, or derive a bound client that shares the
same connection pool and token cache:

```ts
const matriz = inter.withAccount("1234567");
const filial = inter.withAccount("7654321");
```

**Startup validation.** `await inter.ready()` loads the certificate and builds the transport
eagerly, turning a bad configuration into a boot failure rather than a surprise on your first
payment.

## The four APIs

```
inter.cobranca         Cobrança v3   boletos with an attached Pix QR code
inter.banking          Banking v2    balance, statements, payments, outbound Pix
inter.pix              Pix v2        charges you receive, refunds, Pix webhooks
inter.pixAutomatico    Pix Automático  recurring mandates and charges
```

The split worth remembering: **`inter.banking.pixPagamento` sends money out**, while
**`inter.pix` manages charges you receive**.

### Cobrança — boleto with Pix

Issuing is asynchronous. The call returns a `codigoSolicitacao` immediately; the boleto and QR
code appear once `situacao` leaves `EM_PROCESSAMENTO`.

```ts
const { codigoSolicitacao } = await inter.cobranca.issue({
  seuNumero: "PED-1001",
  valorNominal: 149.9,
  dataVencimento: "2026-10-11",
  numDiasAgenda: 30,
  pagador: {
    cpfCnpj: "12345678909",
    tipoPessoa: "FISICA",
    nome: "Maria Souza",
    endereco: "Rua São Paulo, 100",
    bairro: "Centro",
    cidade: "Belo Horizonte",
    uf: "MG",
    cep: "30170000",
  },
  multa: { codigo: "PERCENTUAL", taxa: 2 },
  mora: { codigo: "TAXAMENSAL", taxa: 1 },
});

const cobranca = await inter.cobranca.waitUntilIssued(codigoSolicitacao);
console.log(cobranca.boleto?.linhaDigitavel);
console.log(cobranca.pix?.pixCopiaECola);

await Bun.write("boleto.pdf", await inter.cobranca.pdf(codigoSolicitacao));
await inter.cobranca.cancel(codigoSolicitacao, "pedido cancelado pelo cliente");
```

### Banking — balance, statements, payments

```ts
const saldo = await inter.banking.saldo();
const extrato = await inter.banking.extrato({ dataInicio: "2026-01-01", dataFim: "2026-01-31" });

await inter.banking.pagamentos.payBoleto(
  { codBarraLinhaDigitavel: linha, valorPagar: 65.33, dataVencimento: "2026-10-31" },
  { idempotencyKey: crypto.randomUUID() },
);

const pix = await inter.banking.pixPagamento.send({
  valor: 1.23,
  descricao: "Reembolso pedido 1001",
  destinatario: { tipo: "CHAVE", chave: "maria@example.com" },
});
```

Outbound Pix gets an `x-id-idempotente` automatically, so a socket timeout can never turn into a
second transfer. Boleto payments do not: pass `idempotencyKey` yourself when you want the same
protection, which also makes the request eligible for retries.

### Pix — charges you receive

```ts
const cob = await inter.pix.cob.create({
  chave: "pix@empresa.com.br",
  valor: { original: "149.90" },
  calendario: { expiracao: 3600 },
  devedor: { cpf: "12345678909", nome: "Maria Souza" },
});
// Render cob.pixCopiaECola as a QR code.

await inter.pix.received.refund(e2eId, `REF-${orderId}`, { valor: "7.89" });
```

Prefer `createWithTxid(txid, body)` over `create(body)` when the charge maps to something in your
own system: because you own the identifier, replaying the call returns the existing charge
instead of creating a second one.

### Pix Automático — recurring collection

Three objects, in the order you use them:

| Object | What it is |
| --- | --- |
| `rec` | the mandate the payer authorises |
| `solicrec` | a request asking the payer to confirm one |
| `cobr` | a single charge collected under an approved mandate |

```ts
const rec = await inter.pixAutomatico.rec.create({ /* ... */ });
// The payer approves in their own bank; rec.status becomes APROVADA.
const cobr = await inter.pixAutomatico.cobr.create({ idRec: rec.idRec, /* ... */ });
await inter.pixAutomatico.cobr.retry(cobr.txid, "2026-04-10");  // after a failed debit
```

Available only to CNPJs with at least six months of activity, per Banco Central rules.

## Errors

Everything the SDK throws extends `InterError`. Anything that came back from the API is an
`InterAPIError` carrying the parsed RFC 7807 body, Inter's `violacoes` array and the request
context.

```ts
import { InterRateLimitError, InterValidationError, isInterAPIError } from "inter.js";

try {
  await inter.cobranca.issue(body);
} catch (err) {
  if (err instanceof InterValidationError) {
    for (const v of err.violations) console.error(v.propriedade, v.razao);
  } else if (err instanceof InterRateLimitError) {
    console.error("retry after", err.retryAfterSeconds, "s");
  } else if (isInterAPIError(err)) {
    console.error(err.status, err.title, err.context.requestId);
  }
}
```

| Class | When |
| --- | --- |
| `InterValidationError` | `400`, `406`, `422` — check `violations` |
| `InterAuthenticationError` | `401` — credentials do not match the certificate, or the token expired |
| `InterPermissionError` | `403` — carries `requiredScope`, the scope the endpoint needed |
| `InterNotFoundError` | `404`, `410` |
| `InterConflictError` | `409` |
| `InterRateLimitError` | `429` — carries `retryAfterSeconds` |
| `InterServiceUnavailableError` | `503` — including the sandbox outside 08:00–20:00 BRT |
| `InterServerError` | other `5xx` |
| `InterTimeoutError` / `InterConnectionError` / `InterAbortError` | no response arrived |
| `InterConfigurationError` / `InterCertificateError` | bad setup, thrown before any request |
| `InterWebhookError` | a callback failed verification |

TLS failures come with an explanation rather than a bare `EPROTO`: an expired client certificate,
for instance, tells you to renew the integration in Internet Banking.

## Pagination

Every list endpoint has a `list()` that returns one raw page and a `listPaginated()` that returns
a lazy cursor. Inter uses three different pagination envelopes; the cursor hides all of them.

```ts
for await (const item of inter.cobranca.listPaginated({
  dataInicial: "2026-01-01",
  dataFinal: "2026-01-31",
  situacao: "A_RECEBER",
})) {
  console.log(item.cobranca.seuNumero);
}

const first50 = await inter.pix.received
  .listPaginated({ inicio: "2026-01-01T00:00:00Z", fim: "2026-01-31T23:59:59Z" }, { limit: 50 })
  .all();

for await (const page of inter.banking.extratoCompletoPaginated({ /* ... */ }).pages()) {
  console.log(page.page, "of", page.totalPages);
}
```

The enriched statement also supports Inter's scroll mode, which is what you want for very large
windows:

```ts
for await (const t of inter.banking.extratoCompletoScroll({ dataInicio, dataFim })) { /* ... */ }
```

## Webhooks

Inter does not sign callbacks with an HMAC. Authentication runs in the other direction: **Inter
presents a client certificate** issued by its own CA, and your server verifies it against the
`ca.crt` from `Minhas integrações > Certificado Webhook`. The security decision happens at the
TLS layer, before any application code runs.

The bundled listener wires that up:

```ts
import { createWebhookServer } from "inter.js/webhooks";

const server = await createWebhookServer({
  certificate: "./server.crt",
  privateKey: "./server.key",
  interCA: "./ca.crt",
  port: 8443,
  route: {
    "/webhooks/cobranca": "cobranca",
    "/webhooks/pix": "pix",
    "/webhooks/pix-pagamento": "banking.pix-pagamento",
  },
  async onEvent({ source, events }) {
    if (source === "pix") {
      for (const pix of events) await creditOrder(pix.txid, pix.valor);
    }
  },
});
```

Terminating TLS elsewhere? Configure the terminator to require and verify the client certificate,
then parse the body yourself:

```ts
import { parseWebhook, verifyWebhookRequest } from "inter.js/webhooks";

verifyWebhookRequest({ clientCertificateAuthorized: req.socket.authorized });
const { events } = parseWebhook("cobranca", await req.text());
```

`INTER_WEBHOOK_IP_RANGES` and `isInterWebhookIp()` are available as a secondary filter. Treat
them as defence in depth, never as the primary control: the list changes, and behind a proxy the
address you see is usually the proxy's.

Register the URL through the API like any other call:

```ts
await inter.cobranca.webhook.set("https://api.example.com/webhooks/cobranca");
await inter.pix.webhook.set("pix@empresa.com.br", "https://api.example.com/webhooks/pix");
await inter.banking.webhooks.set("pix-pagamento", "https://api.example.com/webhooks/pix-pagamento");
```

Missed callbacks during an outage are recoverable — every webhook exposes its delivery history
and a replay endpoint:

```ts
const attempts = await inter.pix.webhook.callbacksPaginated({
  dataHoraInicio: "2026-03-15T00:00Z",
  dataHoraFim: "2026-03-15T23:59Z",
}).all();
```

## Behaviour you can tune

### OAuth scopes

The token endpoint is capped at five calls per minute and a token lasts an hour, so the client
caches aggressively and never lets two concurrent callers mint the same token twice.

Scopes are handled by strategy. The default, `"auto"`, starts from nothing and widens the token
as calls demand new scopes — you never ask for a permission your integration was not granted, and
the set converges after a few calls. Use `"fixed"` with an explicit `scopes` list to request the
same set every time, or `"per-request"` for one token per scope.

Across several instances, share the cache so the five-per-minute budget is not multiplied by your
replica count:

```ts
new InterClient({
  tokenStore: {
    async get(key) { const raw = await redis.get(`inter:${key}`); return raw ? JSON.parse(raw) : undefined; },
    async set(key, record) {
      const ttl = Math.max(1, Math.floor((record.expiresAt - Date.now()) / 1000));
      await redis.set(`inter:${key}`, JSON.stringify(record), "EX", ttl);
    },
    async delete(key) { await redis.del(`inter:${key}`); },
  },
});
```

### Rate limiting

Every Inter endpoint publishes a per-minute budget, and this SDK ships those numbers. Rather than
discovering the limit by collecting `429`s, the client paces itself with a sliding window: a
burst up to the limit goes straight through, and the next call waits exactly until the oldest one
ages out.

```ts
new InterClient({ rateLimit: { factor: 0.8 } });  // leave headroom for other processes
new InterClient({ rateLimit: false });            // opt out entirely
```

### Retries

Transient transport failures, `429` and most `5xx` are retried with exponential backoff and full
jitter, honouring `Retry-After`. Bodies are only replayed when repeating them is safe: `GET`,
`PUT` and `DELETE` always, `POST` only when it carries an idempotency key.

```ts
new InterClient({ retry: { maxRetries: 4, minDelayMs: 250, maxDelayMs: 10_000 } });
new InterClient({ retry: false });
```

### Logging and tracing

Nothing is logged unless you ask. When you do, every value passes through a redactor first:
credentials are removed outright, and CPF, CNPJ, Pix keys and account numbers are masked down to
their last four characters so log lines stay useful without carrying personal data.

```ts
import { consoleLogger } from "inter.js";

new InterClient({
  logger: consoleLogger("debug"),
  hooks: {
    onRequest: ({ method, url, attempt }) => span.addEvent("inter.request", { method, url, attempt }),
    onResponse: ({ status, durationMs, requestId }) => metrics.record(status, durationMs, requestId),
    onRetry: ({ delayMs, status }) => metrics.increment("inter.retry", { status }),
  },
});
```

Request and response bodies stay out of the logs unless you set `debugBodies: true`, because they
carry names, documents and amounts.

### Transport

The right HTTP stack depends on the runtime, and the client picks automatically:

| Runtime | Transport | mTLS |
| --- | --- | --- |
| Bun | `fetch` with the `tls` option | yes |
| Deno | `fetch` with `Deno.createHttpClient` | yes |
| Node | `node:https` with a keep-alive agent | yes |

Node's global `fetch` cannot present a client certificate, which is why Node takes the
`node:https` path. To route through a proxy or supply your own `undici` dispatcher, pass
`fetchOptions`, or replace the stack entirely with `transport`.

### Endpoints this SDK does not wrap

`inter.request()` is the escape hatch. Everything the pipeline provides still applies:

```ts
const data = await inter.request<{ campo: string }>({
  endpoint: { method: "GET", path: "/algum/recurso", scope: "extrato.read" },
  api: "banking",
  basePath: "/banking/v2",
});
```

## Brazilian helpers

Importable on their own, so a form validator can use them without pulling in the client:

```ts
import {
  isValidCPF, isValidCNPJ, parsePixKey,
  parseBoleto, parseBrCode, buildBrCode, toPixAmount,
} from "inter.js/utils";

isValidCPF("529.982.247-25");                 // true
isValidCNPJ("12ABC34501DE35");                // true — the alphanumeric form is supported
parsePixKey("(31) 99999-9999");               // { type: "TELEFONE", value: "+5531999999999", valid: true }

const boleto = parseBoleto("00190500954014481606906809350314337370000000100");
// { tipo: "COBRANCA", valid: true, valor: 1, banco: "001", vencimento: 2007-12-31 }

parseBrCode(cob.pixCopiaECola);               // decodes the EMV payload and checks its CRC-16
buildBrCode({ chave, nome, cidade, valor: 50 });  // a static QR code, no API call needed
toPixAmount(149.9);                           // "149.90", without floating-point drift
```

Boleto support covers both families — bank slips and utility/tax slips — including the due-date
counter that wrapped in February 2025.

## Testing

`inter.js/testing` ships a transport that answers from a routing table instead of the network. It
needs no certificate, because the client skips TLS setup when a transport is supplied.

```ts
import { InterClient } from "inter.js";
import { MockTransport } from "inter.js/testing";

const transport = new MockTransport()
  .withToken()
  .onGet("/banking/v2/saldo", { body: { disponivel: 1234.56 } })
  .onPost("/cobranca/v3/cobrancas", { status: 400, body: { violacoes: [{ propriedade: "valorNominal" }] } });

const inter = new InterClient({ clientId: "id", clientSecret: "secret", transport });

expect((await inter.banking.saldo()).disponivel).toBe(1234.56);
expect(transport.lastRequest?.headers.authorization).toBe("Bearer test-token");
```

Routes accept a function for stateful behaviour, `times` to expire after N uses, and
`failNext()` to simulate a network failure so you can exercise your retry handling.

For end-to-end work, Inter's sandbox mirrors production at
`https://cdpj-sandbox.partners.uatinter.co` and adds endpoints that simulate a payer paying:

```ts
await inter.pix.cob.simulatePayment(txid, { valor: "10.00" });
await inter.cobranca.simulatePayment(codigoSolicitacao, { valorPago: 149.9 });
```

The sandbox runs 08:00–20:00 BRT on weekdays and its certificates last 30 days.

## How the types are generated

Inter publishes its API reference as OpenAPI documents embedded in the developer portal's bundle
rather than as standalone files. Two scripts keep this SDK in step with them:

```sh
bun run specs:fetch    # re-extract specs/*.json from developers.inter.co
bun run generate       # regenerate src/generated/* from those specs
```

The generated layer holds request and response types for all four APIs, query-parameter shapes
per operation, and a metadata table giving each endpoint's method, path, required OAuth scope and
documented rate limits. The client reads that table at runtime, which is how it knows which scope
to request and how fast it may call.

Do not edit `src/generated/` by hand. The hand-written layer — client, transport, resources —
sits on top and is where behaviour lives.

## Endpoint map

<details>
<summary>Cobrança (Boleto com Pix)</summary>

| Endpoint | Method |
| --- | --- |
| Emitir cobrança | `cobranca.issue()` |
| Recuperar cobrança | `cobranca.get()` / `cobranca.find()` / `cobranca.waitUntilIssued()` |
| Recuperar coleção de cobranças | `cobranca.list()` / `cobranca.listPaginated()` |
| Editar cobrança | `cobranca.update()` |
| Consultar status da edição | `cobranca.getEditStatus()` |
| Recuperar cobrança em PDF | `cobranca.pdf()` / `cobranca.pdfBase64()` |
| Cancelar cobrança | `cobranca.cancel()` |
| Recuperar sumário | `cobranca.summary()` |
| Pagar cobrança (sandbox) | `cobranca.simulatePayment()` |
| Webhook | `cobranca.webhook.set()` / `.get()` / `.delete()` |
| Callbacks | `cobranca.webhook.callbacks()` / `.callbacksPaginated()` / `.retryCallbacks()` |

</details>

<details>
<summary>Banking</summary>

| Endpoint | Method |
| --- | --- |
| Consultar saldo | `banking.saldo()` |
| Consultar extrato | `banking.extrato()` |
| Extrato enriquecido | `banking.extratoCompleto()` / `.extratoCompletoPaginated()` / `.extratoCompletoScroll()` |
| Extrato em PDF | `banking.extratoPdf()` |
| Pagamento com código de barras | `banking.pagamentos.payBoleto()` |
| Buscar pagamentos | `banking.pagamentos.list()` |
| Pagamento de DARF | `banking.pagamentos.payDarf()` |
| Buscar pagamentos de DARF | `banking.pagamentos.listDarf()` |
| Pagamentos em lote | `banking.pagamentos.payBatch()` / `.getBatch()` |
| Cancelar agendamento | `banking.pagamentos.cancelSchedule()` |
| Incluir pagamento Pix | `banking.pixPagamento.send()` |
| Consultar pagamento Pix | `banking.pixPagamento.get()` |
| Webhooks | `banking.webhooks.set()` / `.get()` / `.delete()` / `.callbacks()` / `.retryCallbacks()` |

</details>

<details>
<summary>Pix</summary>

| Endpoint | Method |
| --- | --- |
| Cobrança imediata | `pix.cob.create()` / `.createWithTxid()` / `.get()` / `.update()` / `.cancel()` / `.list()` / `.listPaginated()` |
| Cobrança com vencimento | `pix.cobv.create()` / `.get()` / `.update()` / `.cancel()` / `.list()` / `.listPaginated()` |
| Lote de cobranças com vencimento | `pix.loteCobv.create()` / `.update()` / `.get()` / `.summary()` / `.listBySituation()` / `.list()` |
| Payload location | `pix.loc.create()` / `.get()` / `.list()` / `.unlinkTxid()` |
| Pix recebidos | `pix.received.get()` / `.list()` / `.listPaginated()` |
| Devolução | `pix.received.refund()` / `.getRefund()` |
| Webhook | `pix.webhook.set()` / `.get()` / `.delete()` / `.callbacks()` / `.retryCallbacks()` |
| Pagar cobrança (sandbox) | `pix.cob.simulatePayment()` / `pix.cobv.simulatePayment()` |

</details>

<details>
<summary>Pix Automático</summary>

| Endpoint | Method |
| --- | --- |
| Recorrência | `pixAutomatico.rec.create()` / `.get()` / `.update()` / `.cancel()` / `.list()` / `.listPaginated()` |
| Solicitação de confirmação | `pixAutomatico.solicRec.create()` / `.get()` / `.update()` |
| Cobrança recorrente | `pixAutomatico.cobr.create()` / `.createWithTxid()` / `.get()` / `.update()` / `.cancel()` / `.retry()` / `.list()` |
| Location de recorrência | `pixAutomatico.locRec.create()` / `.get()` / `.list()` / `.unlinkRec()` |
| Webhooks | `pixAutomatico.webhooks.setRec()` / `.setCobr()` / `.getRec()` / `.getCobr()` / `.deleteRec()` / `.deleteCobr()` |
| Simulações (sandbox) | `.simulateStatusChange()` / `.simulatePayment()` |

</details>

---

## Contributing

```sh
bun install
bun run typecheck
bun test
bun run build
```

`bun run specs:fetch && bun run generate` refreshes the generated layer when Inter changes its
API reference.

## Disclaimer

Not an official Banco Inter product and not affiliated with Banco Inter S.A. Built from the
public developer portal at <https://developers.inter.co>.

## License

MIT © Pedro Viana
