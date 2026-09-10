# OpenAPI specifications

These are the authoritative OpenAPI 3.0.3 documents that back Banco Inter's public
API reference at <https://developers.inter.co/references>. They are embedded in the
portal's Docusaurus bundle rather than published as standalone files, so
`bun run scripts/fetch-specs.ts` re-extracts them from the live site.

| File | Portal page | Base path |
| --- | --- | --- |
| `token.json` | `/references/token` | `/oauth/v2` |
| `cobranca.json` | `/references/cobranca-bolepix` | `/cobranca/v3` |
| `banking.json` | `/references/banking` | `/banking/v2` |
| `pix.json` | `/references/pix` | `/pix/v2` |
| `pix-automatico.json` | `/references/pix-automatico` | `/pix/v2` |

`bun run scripts/generate.ts` turns them into `src/generated/*`. Do not edit the
generated files by hand.
