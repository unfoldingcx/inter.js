# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-09-09

First release.

### Added

- **`InterClient`** covering all four public Banco Inter APIs: Cobrança v3 (Boleto com Pix),
  Banking v2, Pix v2 and Pix Automático — 92 operations in total.
- **Mutual TLS** on Node (`node:https`), Bun (`fetch` with `tls`) and Deno
  (`Deno.createHttpClient`), with certificates accepted as a file path, a PEM string, raw bytes
  or a PKCS#12 bundle.
- **OAuth token management** with per-scope caching, single-flight minting, automatic refresh
  and a pluggable `TokenStore` for sharing one token across replicas. The default `"auto"` scope
  strategy widens the token as calls demand, so no unused permission is ever requested.
- **Client-side rate limiting** driven by the per-endpoint budgets published in Inter's
  reference, using a sliding window so bursts up to the limit pass through untouched.
- **Retries** with exponential backoff and full jitter, honouring `Retry-After`, and replaying a
  `POST` only when it carries an idempotency key.
- **Typed errors** mapping every documented status onto a specific class, carrying the parsed
  RFC 7807 body including Inter's `violacoes` array.
- **Pagination** as async iterators over all three envelope shapes Inter uses, plus the enriched
  statement's scroll mode.
- **Webhooks** (`inter.js/webhooks`): a discriminated union of typed payloads, an HTTPS listener
  that verifies Inter's client certificate against the CA from Internet Banking, and the
  published source-address ranges.
- **Brazilian helpers** (`inter.js/utils`): CPF and CNPJ validation including the alphanumeric
  CNPJ, Pix key classification, BR Code (EMV) parsing and building with CRC-16, boleto barcode
  and linha digitável conversion for both families, and money handling free of floating-point
  drift.
- **Test doubles** (`inter.js/testing`): a `MockTransport` that answers from a routing table.
- **Certificate expiry warnings**, read from the client certificate at startup.
- **Observability**: a pluggable logger with automatic redaction of credentials and personal
  data, plus `onRequest` / `onResponse` / `onRetry` / `onError` hooks.
- **Multi-account support** through `x-conta-corrente` and `client.withAccount()`, which shares
  the parent's connection pool, token cache and rate-limit state.
- **Reproducible codegen**: `bun run specs:fetch` re-extracts Inter's OpenAPI documents from the
  developer portal and `bun run generate` regenerates the typed layer from them.
