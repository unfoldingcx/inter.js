#!/usr/bin/env bun
/**
 * Rewrites `.ts` extensions to `.js` in the emitted declaration files.
 *
 * The source imports use explicit `.ts` specifiers, which is what
 * `allowImportingTsExtensions` is for. Consumers do not have that flag enabled,
 * so the published `.d.ts` files must point at `.js` instead. TypeScript's
 * `rewriteRelativeImportExtensions` covers the JavaScript emit but not every
 * compiler applies it to declaration output, so this pass makes it certain.
 *
 *   bun run scripts/fix-dts.ts dist
 */
import { readdir } from "node:fs/promises";
import { join, dirname } from "node:path";

const target = Bun.argv[2] ?? join(dirname(import.meta.dir), "dist");

/** Matches the specifier in `from "..."`, `import("...")` and `export … from "..."`. */
const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|\bmodule\s+)(["'])(\.{1,2}\/[^"']+?)\.ts\2/g;

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (entry.name.endsWith(".d.ts") || entry.name.endsWith(".d.ts.map")) yield path;
  }
}

let changed = 0;
for await (const path of walk(target)) {
  const source = await Bun.file(path).text();
  const rewritten = path.endsWith(".map")
    ? source
    : source.replace(SPECIFIER, (_match, prefix: string, quote: string, spec: string) => `${prefix}${quote}${spec}.js${quote}`);
  if (rewritten !== source) {
    await Bun.write(path, rewritten);
    changed++;
  }
}

console.log(`> rewrote .ts specifiers in ${changed} declaration file(s) under ${target}`);

// Fail loudly if anything slipped through: a published .d.ts that imports a
// ".ts" path breaks every consumer that does not enable allowImportingTsExtensions.
const leftovers: string[] = [];
for await (const path of walk(target)) {
  if (path.endsWith(".map")) continue;
  const source = await Bun.file(path).text();
  if (SPECIFIER.test(source)) leftovers.push(path);
  SPECIFIER.lastIndex = 0;
}
if (leftovers.length) {
  console.error(`! ${leftovers.length} declaration file(s) still import .ts paths:\n  ${leftovers.join("\n  ")}`);
  process.exit(1);
}
