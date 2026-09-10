#!/usr/bin/env bun
/**
 * Re-extracts Banco Inter's OpenAPI documents from the live developer portal.
 *
 * The portal (https://developers.inter.co) is a Docusaurus site that renders its
 * API reference with redocusaurus. The specs are not served as standalone files;
 * they are inlined into the client bundle inside a `JSON.parse('...')` blob under
 * the `docusaurus-plugin-redoc` key. This script locates that blob, decodes it and
 * writes each spec to `specs/`.
 *
 *   bun run scripts/fetch-specs.ts
 */
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

const PORTAL = "https://developers.inter.co";
const OUT_DIR = join(dirname(import.meta.dir), "specs");

/** Portal spec key -> local file name. Keys not listed here are ignored. */
const WANTED: Record<string, string> = {
  "swagger-token-yaml": "token.json",
  "swagger-cobranca-bolepix-yaml": "cobranca.json",
  "swagger-banking-yaml": "banking.json",
  "swagger-api-pix-yaml": "pix.json",
  "swagger-api-pix-automatico-yaml": "pix-automatico.json",
};

async function main(): Promise<void> {
  console.log(`> fetching ${PORTAL}`);
  const shell = await (await fetch(PORTAL)).text();

  const bundlePath = shell.match(/src="(\/assets\/js\/main\.[a-f0-9]+\.js)"/)?.[1];
  if (!bundlePath) throw new Error("could not locate the portal's main JS bundle");

  console.log(`> fetching ${bundlePath}`);
  const bundle = await (await fetch(PORTAL + bundlePath)).text();

  const anchor = bundle.indexOf('"docusaurus-plugin-redoc"');
  if (anchor === -1) throw new Error("redoc plugin data not found in bundle");

  const open = bundle.lastIndexOf("JSON.parse('", anchor);
  if (open === -1) throw new Error("enclosing JSON.parse(...) not found");
  const start = open + "JSON.parse('".length;

  let end = start;
  for (let escaped = false; end < bundle.length; end++) {
    const ch = bundle[end]!;
    if (escaped) escaped = false;
    else if (ch === "\\") escaped = true;
    else if (ch === "'") break;
  }

  // The blob is a single-quoted JS string literal wrapping JSON. Let the JS
  // parser undo the literal's escapes, then parse the JSON it yields.
  const literal = bundle.slice(start, end);
  const json = new Function(`return '${literal}'`)() as string;
  const data = JSON.parse(json) as Record<string, any>;

  const specs = data["docusaurus-plugin-redoc"] as Record<string, { spec?: unknown }>;
  if (!specs) throw new Error("redoc plugin data missing after decode");

  await mkdir(OUT_DIR, { recursive: true });

  let written = 0;
  for (const [key, file] of Object.entries(WANTED)) {
    const spec = specs[key]?.spec;
    if (!spec) {
      console.warn(`! ${key} not present in bundle - skipped`);
      continue;
    }
    const target = join(OUT_DIR, file);
    await Bun.write(target, JSON.stringify(spec, null, 2) + "\n");
    const paths = Object.keys((spec as any).paths ?? {}).length;
    const schemas = Object.keys((spec as any).components?.schemas ?? {}).length;
    console.log(`  ${file.padEnd(20)} ${String(paths).padStart(3)} paths  ${String(schemas).padStart(3)} schemas`);
    written++;
  }

  console.log(`> wrote ${written} spec(s) to ${OUT_DIR}`);
  console.log("> run `bun run scripts/generate.ts` to regenerate src/generated");
}

await main();
