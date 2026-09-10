#!/usr/bin/env bun
/**
 * Generates `src/generated/*` from the OpenAPI documents in `specs/`.
 *
 *   bun run scripts/generate.ts
 *
 * Output:
 *   src/generated/token.ts           schema types for the OAuth endpoint
 *   src/generated/cobranca.ts        schema + query types for /cobranca/v3
 *   src/generated/banking.ts         schema + query types for /banking/v2
 *   src/generated/pix.ts             schema + query types for /pix/v2
 *   src/generated/pix-automatico.ts  schema + query types for Pix Automatico
 *   src/generated/endpoints.ts       per-operation scope + rate-limit metadata
 *   src/generated/index.ts           barrel
 *
 * Nothing here is edited by hand; re-run the script after `fetch-specs.ts`.
 */
import { join, dirname } from "node:path";

const ROOT = dirname(import.meta.dir);
const SPEC_DIR = join(ROOT, "specs");
const OUT_DIR = join(ROOT, "src", "generated");

interface SpecFile {
  file: string;
  module: string;
  title: string;
  basePath: string;
}

const SPECS: SpecFile[] = [
  { file: "token.json", module: "token", title: "Autenticacao OAuth", basePath: "/oauth/v2" },
  { file: "cobranca.json", module: "cobranca", title: "API Cobranca (Boleto com Pix)", basePath: "/cobranca/v3" },
  { file: "banking.json", module: "banking", title: "API Banking", basePath: "/banking/v2" },
  { file: "pix.json", module: "pix", title: "API Pix", basePath: "/pix/v2" },
  { file: "pix-automatico.json", module: "pix-automatico", title: "API Pix Automatico", basePath: "/pix/v2" },
];

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** Strips HTML, collapses whitespace and normalises the portal's markdown. */
function cleanDoc(text: unknown): string {
  if (typeof text !== "string") return "";
  return text
    .replace(/<img[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/(td|th)>/gi, " | ")
    .replace(/<\/?(table|thead|tbody|tr|td|th)\b[^>]*>/gi, "")
    // Any remaining HTML tag: `<` followed by a letter or `/`, up to the next `>`.
    .replace(/<\/?[A-Za-z][^>]*>/g, "")
    .replace(/\*\//g, "*\u200b/")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((l) => l.trim().replace(/\s*\|\s*$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function pascal(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9]+/g, " ").trim();
  if (!cleaned) return "Unnamed";
  const parts = cleaned.split(" ");
  // Preserve existing internal casing (CobVGerada stays CobVGerada) but force
  // the first character of every part upper-case.
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
}

function isSafeIdent(key: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
}

function quoteKey(key: string): string {
  return isSafeIdent(key) ? key : JSON.stringify(key);
}

function jsdoc(lines: string[], pad = ""): string {
  const body = lines
    .join("\n")
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l, i, arr) => !(l === "" && (i === 0 || arr[i - 1] === "")));
  while (body.length && body[body.length - 1] === "") body.pop();
  if (!body.length) return "";
  if (body.length === 1 && body[0]!.length < 90) return `${pad}/** ${body[0]} */\n`;
  return `${pad}/**\n${body.map((l) => `${pad} *${l ? " " + l : ""}`).join("\n")}\n${pad} */\n`;
}

// ---------------------------------------------------------------------------
// schema -> TypeScript
// ---------------------------------------------------------------------------

class SpecContext {
  readonly names = new Map<string, string>(); // schema key -> TS name
  readonly inline: { name: string; code: string }[] = [];
  private counter = 0;

  constructor(readonly spec: any) {
    for (const key of Object.keys(spec.components?.schemas ?? {})) {
      this.names.set(key, pascal(key));
    }
    // Guard against two schema keys collapsing onto the same PascalCase name.
    const seen = new Map<string, string>();
    for (const [key, name] of this.names) {
      const prev = seen.get(name);
      if (prev !== undefined && prev !== key) {
        this.names.set(key, name + "_" + ++this.counter);
      } else {
        seen.set(name, key);
      }
    }
  }

  resolve(ref: string): any {
    return ref
      .replace(/^#\//, "")
      .split("/")
      .reduce((acc: any, part) => acc?.[part.replace(/~1/g, "/").replace(/~0/g, "~")], this.spec);
  }

  refName(ref: string): string | undefined {
    const m = ref.match(/^#\/components\/schemas\/(.+)$/);
    return m ? this.names.get(m[1]!) : undefined;
  }
}

/** True when a schema renders as a standalone object literal (i.e. an `interface`). */
function rendersAsInterface(schema: any): boolean {
  if (!schema || typeof schema !== "object") return false;
  if (schema.$ref || schema.enum || schema.oneOf || schema.anyOf) return false;
  if (schema.allOf) return schema.allOf.every((m: any) => !m?.$ref && (m?.properties || m?.type === "object"));
  return Boolean(schema.properties) || schema.type === "object";
}

/** Merges the inline members of an `allOf` into a single property bag. */
function flattenAllOf(schema: any): { properties: Record<string, any>; required: Set<string>; additionalProperties?: any } {
  const properties: Record<string, any> = {};
  const required = new Set<string>();
  let additionalProperties: any;
  const visit = (node: any): void => {
    if (!node || typeof node !== "object") return;
    for (const member of node.allOf ?? []) visit(member);
    for (const [k, v] of Object.entries(node.properties ?? {})) properties[k] = v;
    for (const r of node.required ?? []) required.add(r);
    if (node.additionalProperties !== undefined) additionalProperties = node.additionalProperties;
  };
  visit(schema);
  return { properties, required, additionalProperties };
}

function typeOf(schema: any, ctx: SpecContext, level = 0): string {
  if (!schema || typeof schema !== "object") return "unknown";

  if (schema.$ref) {
    const named = ctx.refName(schema.$ref);
    if (named) return named;
    return typeOf(ctx.resolve(schema.$ref), ctx, level);
  }

  const nullable = schema.nullable === true ? " | null" : "";

  if (Array.isArray(schema.enum) && schema.enum.length) {
    return schema.enum.map((v: unknown) => JSON.stringify(v)).join(" | ") + nullable;
  }

  if (Array.isArray(schema.oneOf) || Array.isArray(schema.anyOf)) {
    const members: any[] = schema.oneOf ?? schema.anyOf;
    const union = [...new Set(members.map((m) => typeOf(m, ctx, level)))];
    return union.join(" | ") + nullable;
  }

  if (Array.isArray(schema.allOf)) {
    if (rendersAsInterface(schema)) {
      const flat = flattenAllOf(schema);
      return objectLiteral(flat.properties, flat.required, flat.additionalProperties, ctx, level) + nullable;
    }
    const parts: string[] = [];
    for (const member of schema.allOf) {
      const rendered = typeOf(member, ctx, level);
      if (rendered !== "unknown" && rendered !== "Record<string, unknown>") parts.push(rendered);
    }
    if (schema.properties) {
      parts.push(objectLiteral(schema.properties, new Set(schema.required ?? []), schema.additionalProperties, ctx, level));
    }
    if (!parts.length) return "Record<string, unknown>" + nullable;
    if (parts.length === 1) return parts[0]! + nullable;
    return parts.map((p) => (p.includes(" | ") ? `(${p})` : p)).join(" & ") + nullable;
  }

  switch (schema.type) {
    case "array":
      return arrayType(schema, ctx, level) + nullable;
    case "string":
      return "string" + nullable;
    case "number":
    case "integer":
      return "number" + nullable;
    case "boolean":
      return "boolean" + nullable;
    case "object":
      return objectLiteral(schema.properties ?? {}, new Set(schema.required ?? []), schema.additionalProperties, ctx, level) + nullable;
    default:
      if (schema.properties) {
        return objectLiteral(schema.properties, new Set(schema.required ?? []), schema.additionalProperties, ctx, level) + nullable;
      }
      if (schema.items) return arrayType(schema, ctx, level) + nullable;
      return "unknown";
  }
}

function arrayType(schema: any, ctx: SpecContext, level: number): string {
  const item = typeOf(schema.items ?? {}, ctx, level);
  return /^[A-Za-z0-9_$.]+$/.test(item) ? `${item}[]` : `Array<${item}>`;
}

function objectLiteral(
  properties: Record<string, any>,
  required: Set<string>,
  additionalProperties: any,
  ctx: SpecContext,
  level: number,
): string {
  const inner = "  ".repeat(level + 1);
  const outer = "  ".repeat(level);
  const entries = Object.entries(properties);

  const extra =
    additionalProperties === true
      ? "[key: string]: unknown;"
      : additionalProperties && typeof additionalProperties === "object"
        ? `[key: string]: ${typeOf(additionalProperties, ctx, level + 1)};`
        : "";

  if (!entries.length) return extra ? `{\n${inner}${extra}\n${outer}}` : "Record<string, unknown>";

  const lines = entries.map(([key, value]) => {
    const doc = propertyDoc(value, ctx, inner);
    const optional = required.has(key) ? "" : "?";
    return `${doc}${inner}${quoteKey(key)}${optional}: ${typeOf(value, ctx, level + 1)};`;
  });
  if (extra) lines.push(`${inner}${extra}`);
  return `{\n${lines.join("\n")}\n${outer}}`;
}

function propertyDoc(schema: any, ctx: SpecContext, pad = "  "): string {
  const target = schema?.$ref ? { ...ctx.resolve(schema.$ref), ...schema } : schema;
  if (!target || typeof target !== "object") return "";

  const lines: string[] = [];
  const desc = cleanDoc(target.description ?? target.title);
  if (desc) lines.push(desc, "");

  const facts: string[] = [];
  if (target.format) facts.push(`Format: \`${target.format}\``);
  if (target.pattern) facts.push(`Pattern: \`${String(target.pattern).replace(/\*\//g, "*​/")}\``);
  if (typeof target.minLength === "number" || typeof target.maxLength === "number") {
    facts.push(`Length: ${target.minLength ?? 0}..${target.maxLength ?? "∞"}`);
  }
  if (typeof target.minimum === "number" || typeof target.maximum === "number") {
    facts.push(`Range: ${target.minimum ?? "-∞"}..${target.maximum ?? "∞"}`);
  }
  if (target.default !== undefined) facts.push(`Default: \`${JSON.stringify(target.default)}\``);
  if (target.readOnly) facts.push("Read-only: returned by the API, never sent.");
  for (const f of facts) lines.push(f + "  ");

  if (target.example !== undefined && typeof target.example !== "object") {
    lines.push("", `@example ${JSON.stringify(target.example)}`);
  }
  if (target.deprecated) lines.push("", "@deprecated");

  return jsdoc(lines, pad);
}

// ---------------------------------------------------------------------------
// operation query parameters
// ---------------------------------------------------------------------------

interface OperationInfo {
  key: string;
  method: HttpMethod;
  path: string;
  summary: string;
  scope: string | undefined;
  ratePrd: number | undefined;
  rateSbx: number | undefined;
  queryTypeName?: string;
}

/** Reads the rate-limit badges the portal embeds in each operation description. */
function rateLimits(description: string): { prd?: number; sbx?: number } {
  const out: { prd?: number; sbx?: number } = {};
  const re = /badge\/(PRODU[^-]*|SANDBOX)-[0-9A-Fa-f]{6}\\?"?\s*\/?>\s*([0-9]+)\s*chamadas por minuto/g;
  for (const m of description.matchAll(re)) {
    const value = Number(m[2]);
    if (m[1]!.startsWith("SAND")) out.sbx = value;
    else out.prd = value;
  }
  return out;
}

function scopeOf(op: any): string | undefined {
  const text = `${op.description ?? ""} ${op.summary ?? ""}`;
  const found = [...text.matchAll(/`([a-z][a-z0-9-]*\.(?:read|write))`/g)].map((m) => m[1]!);
  if (found.length) return found[0];
  const loose = text.match(/\b([a-z][a-z0-9-]*\.(?:read|write))\b/);
  return loose?.[1];
}

function operationKey(method: HttpMethod, path: string, op: any, taken: Set<string>): string {
  const base =
    op.operationId && /^[A-Za-z]/.test(op.operationId)
      ? op.operationId
      : `${method} ${path.replace(/\{([^}]+)\}/g, " by $1")}`;
  const pascalName = pascal(base);
  let name = pascalName.charAt(0).toLowerCase() + pascalName.slice(1);
  let n = 1;
  while (taken.has(name)) name = `${name}${++n}`;
  taken.add(name);
  return name;
}

/**
 * Normalises a path template. Inter's Pix spec contains `"/ sandbox/cob/pagamento"`
 * with a stray space; sending that verbatim would 404.
 */
function normalizePath(path: string): string {
  return path.replace(/\s+/g, "");
}

// ---------------------------------------------------------------------------
// per-spec emit
// ---------------------------------------------------------------------------

function emitSpec(meta: SpecFile, spec: any): { code: string; ops: OperationInfo[] } {
  const ctx = new SpecContext(spec);
  const out: string[] = [];

  out.push("// ---------------------------------------------------------------------------");
  out.push(`// ${meta.title}`);
  out.push(`// Generated from specs/${meta.file} by scripts/generate.ts - do not edit.`);
  out.push(`// Base path: ${meta.basePath}`);
  out.push("// ---------------------------------------------------------------------------");
  out.push("");

  // --- component schemas ---------------------------------------------------
  const schemas = spec.components?.schemas ?? {};
  for (const [key, schema] of Object.entries<any>(schemas)) {
    const name = ctx.names.get(key)!;
    const lines: string[] = [];
    const desc = cleanDoc(schema.description ?? schema.title);
    if (desc) lines.push(desc);
    if (desc && key !== name) lines.push("");
    if (key !== name) lines.push(`OpenAPI schema: \`${key}\``);
    const doc = jsdoc(lines);

    const rendered = typeOf(schema, ctx);
    if (rendersAsInterface(schema) && rendered.startsWith("{")) {
      out.push(`${doc}export interface ${name} ${rendered}`);
    } else {
      out.push(`${doc}export type ${name} = ${rendered};`);
    }
    out.push("");
  }

  // --- query parameter shapes ---------------------------------------------
  const ops: OperationInfo[] = [];
  const taken = new Set<string>();

  for (const [path, item] of Object.entries<any>(spec.paths ?? {})) {
    for (const method of HTTP_METHODS) {
      const op = item?.[method];
      if (!op) continue;

      const key = operationKey(method, path, op, taken);
      const description = String(op.description ?? "");
      const { prd, sbx } = rateLimits(description);

      const params: any[] = (item.parameters ?? []).concat(op.parameters ?? []).map((p: any) => (p?.$ref ? ctx.resolve(p.$ref) : p));
      const query = params.filter((p) => p && p.in === "query" && p.name);

      let queryTypeName: string | undefined;
      if (query.length) {
        queryTypeName = pascal(key) + "Query";
        const body = query
          .map((p) => {
            const target = p.schema?.$ref ? { ...ctx.resolve(p.schema.$ref), ...p.schema } : (p.schema ?? {});
            const merged = { ...target, description: p.description || target.description };
            const doc = propertyDoc(merged, ctx);
            const optional = p.required ? "" : "?";
            return `${doc}  ${quoteKey(p.name)}${optional}: ${typeOf(p.schema ?? {}, ctx, 1)};`;
          })
          .join("\n");
        out.push(
          jsdoc([`Query parameters for \`${method.toUpperCase()} ${meta.basePath}${path}\`.`, op.summary ? cleanDoc(op.summary) : ""]) +
            `export interface ${queryTypeName} {\n${body}\n}`,
        );
        out.push("");
      }

      ops.push({
        key,
        method,
        path: normalizePath(path),
        summary: cleanDoc(op.summary),
        scope: scopeOf(op),
        ratePrd: prd,
        rateSbx: sbx,
        queryTypeName,
      });
    }
  }

  // Two operations that resolve to the same verb + path are the same endpoint
  // documented twice (Inter lists the sandbox payment helper under two tags).
  const seenRoutes = new Set<string>();
  const unique = ops.filter((op) => {
    const route = `${op.method} ${op.path}`;
    if (seenRoutes.has(route)) return false;
    seenRoutes.add(route);
    return true;
  });

  return { code: out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n", ops: unique };
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

const allOps: Record<string, OperationInfo[]> = {};
const scopeSet = new Set<string>();

for (const meta of SPECS) {
  const spec = await Bun.file(join(SPEC_DIR, meta.file)).json();
  const { code, ops } = emitSpec(meta, spec);
  await Bun.write(join(OUT_DIR, `${meta.module}.ts`), code);
  allOps[meta.module] = ops;
  for (const op of ops) if (op.scope) scopeSet.add(op.scope);
  console.log(`  src/generated/${meta.module}.ts`.padEnd(40), `${ops.length} operations`);
}

// --- endpoints.ts ----------------------------------------------------------
{
  const lines: string[] = [];
  lines.push("// ---------------------------------------------------------------------------");
  lines.push("// Per-operation metadata: HTTP method, path template, required OAuth scope and");
  lines.push("// the documented rate limits (calls per minute) for each environment.");
  lines.push("// Generated by scripts/generate.ts - do not edit.");
  lines.push("// ---------------------------------------------------------------------------");
  lines.push("");
  lines.push('import type { InterScope } from "../core/scopes.ts";');
  lines.push("");
  lines.push("/** Documented call budget for a single endpoint, in requests per minute. */");
  lines.push("export interface EndpointRateLimit {");
  lines.push("  /** Requests per minute allowed in production. */");
  lines.push("  readonly producao?: number;");
  lines.push("  /** Requests per minute allowed in the sandbox. */");
  lines.push("  readonly sandbox?: number;");
  lines.push("}");
  lines.push("");
  lines.push("/** Everything the transport needs to know about one API operation. */");
  lines.push("export interface EndpointMeta {");
  lines.push("  /** HTTP verb. */");
  lines.push("  readonly method: \"GET\" | \"POST\" | \"PUT\" | \"PATCH\" | \"DELETE\";");
  lines.push("  /** Path template relative to the API base path, e.g. `/cobrancas/{codigoSolicitacao}`. */");
  lines.push("  readonly path: string;");
  lines.push("  /** OAuth scope the token must carry for this call to be authorised. */");
  lines.push("  readonly scope?: InterScope;");
  lines.push("  /** Human-readable summary taken from the official reference. */");
  lines.push("  readonly summary?: string;");
  lines.push("  /** Documented rate limits per environment. */");
  lines.push("  readonly rateLimit?: EndpointRateLimit;");
  lines.push("}");
  lines.push("");

  for (const meta of SPECS) {
    const ops = allOps[meta.module]!;
    if (!ops.length) continue;
    const safeName = meta.module.toUpperCase().replace(/[^A-Z0-9]+/g, "_") + "_ENDPOINTS";
    lines.push(jsdoc([`Operations exposed by ${meta.title} (base path \`${meta.basePath}\`).`]).trimEnd());
    lines.push(`export const ${safeName} = {`);
    for (const op of ops) {
      const parts = [
        `method: ${JSON.stringify(op.method.toUpperCase())}`,
        `path: ${JSON.stringify(op.path)}`,
        op.scope ? `scope: ${JSON.stringify(op.scope)}` : "",
        op.summary ? `summary: ${JSON.stringify(op.summary)}` : "",
        op.ratePrd || op.rateSbx
          ? `rateLimit: { ${[op.ratePrd ? `producao: ${op.ratePrd}` : "", op.rateSbx ? `sandbox: ${op.rateSbx}` : ""].filter(Boolean).join(", ")} }`
          : "",
      ].filter(Boolean);
      lines.push(`  ${quoteKey(op.key)}: { ${parts.join(", ")} },`);
    }
    lines.push("} as const satisfies Record<string, EndpointMeta>;");
    lines.push("");
  }

  const present = SPECS.filter((s) => allOps[s.module]!.length);
  lines.push("/** Every documented operation, grouped by API. */");
  lines.push("export const INTER_ENDPOINTS = {");
  for (const s of present) {
    const camel = s.module.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    lines.push(`  ${camel}: ${s.module.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_ENDPOINTS,`);
  }
  lines.push("} as const;");
  lines.push("");

  await Bun.write(join(OUT_DIR, "endpoints.ts"), lines.join("\n"));
  console.log("  src/generated/endpoints.ts".padEnd(40), `${Object.values(allOps).flat().length} operations`);
}

// --- index.ts --------------------------------------------------------------
{
  // Schema names collide across APIs (every spec defines `Problema`, `Violacao`,
  // `WebhookSolicitado`, ...), so the barrel namespaces them per API instead of
  // flattening. Endpoint metadata has unique names and is re-exported directly.
  const nsName = (m: string) => pascal(m);
  const lines = [
    "// Barrel for the generated layer. Generated by scripts/generate.ts - do not edit.",
    "",
    ...SPECS.map((s) => `export type * as ${nsName(s.module)} from "./${s.module}.ts";`),
    'export * from "./endpoints.ts";',
    "",
  ];
  await Bun.write(join(OUT_DIR, "index.ts"), lines.join("\n"));
}

console.log(`\n> discovered scopes: ${[...scopeSet].sort().join(" ")}`);
