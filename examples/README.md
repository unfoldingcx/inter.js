# Examples

Each file runs on its own. They read credentials from the environment, so set these first:

```sh
export INTER_CLIENT_ID=...
export INTER_CLIENT_SECRET=...
export INTER_CERTIFICATE=./certs/inter.crt
export INTER_PRIVATE_KEY=./certs/inter.key
export INTER_ENVIRONMENT=sandbox
```

Then:

```sh
bun run examples/01-emitir-cobranca.ts
```

| File | Shows |
| --- | --- |
| `01-emitir-cobranca.ts` | issuing a boleto with Pix, waiting for it, downloading the PDF |
| `02-cobranca-pix.ts` | creating a Pix charge, watching for payment, refunding |
| `03-banking.ts` | balance, statements and paying a boleto safely |
| `04-webhook-server.ts` | receiving callbacks over mutual TLS |
| `05-producao.ts` | the settings a production deployment wants |

The sandbox runs 08:00–20:00 BRT on weekdays. Outside that window every call answers `503`.
