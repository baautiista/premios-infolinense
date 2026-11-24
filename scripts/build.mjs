// Compila la web: cliente (React + Tailwind) en dist/client y Worker en dist/worker.
// Uso: node scripts/build.mjs
import { build, transform } from "esbuild";
import { compile } from "tailwindcss";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const out = path.join(root, "dist");
const started = Date.now();

await rm(out, { recursive: true, force: true });
await mkdir(path.join(out, "client", "assets"), { recursive: true });

// 1. Cliente: JavaScript con división de código (el panel se carga aparte).
const client = await build({
  absWorkingDir: root,
  entryPoints: { app: "src/client/entry.tsx" },
  bundle: true,
  splitting: true,
  format: "esm",
  outdir: "dist/client/assets",
  entryNames: "[name]-[hash]",
  chunkNames: "c-[hash]",
  minify: true,
  sourcemap: false,
  metafile: true,
  target: ["es2022", "safari16", "chrome111", "firefox115"],
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "none",
  logLevel: "warning",
});
const entry = Object.entries(client.metafile.outputs).find(([, o]) => o.entryPoint === "src/client/entry.tsx");
if (!entry) throw new Error("No se encontró la salida del cliente");
const jsPath = "/" + path.relative(path.join(out, "client"), path.join(root, entry[0])).split(path.sep).join("/");

// 2. CSS: Tailwind v4 con detección de clases en el código fuente.
async function walk(dir) {
  const files = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(p)));
    else if (/\.(tsx?|css)$/.test(e.name)) files.push(p);
  }
  return files;
}
const candidates = new Set();
for (const f of await walk(path.join(root, "src"))) {
  // Se parte solo por espacios y comillas para conservar clases como text-[clamp(2rem,6vw,3rem)].
  for (const raw of (await readFile(f, "utf8")).split(/[\s"'`{};]+/)) {
    for (const token of [raw, raw.replace(/^[(:,]+|[),:]+$/g, "")]) if (token && token.length < 160) candidates.add(token);
  }
}
const cssEntry = path.join(root, "src/client/styles.css");
const compiler = await compile(await readFile(cssEntry, "utf8"), {
  base: path.dirname(cssEntry),
  async loadStylesheet(id, base) {
    const file = id === "tailwindcss" ? require.resolve("tailwindcss/index.css") : id.startsWith("tailwindcss/") ? require.resolve(id) : path.resolve(base, id);
    return { path: file, base: path.dirname(file), content: await readFile(file, "utf8") };
  },
  async loadModule() {
    throw new Error("Los plugins de Tailwind no están soportados en este build");
  },
});
const rawCss = compiler.build([...candidates]);
const { code: css } = await transform(rawCss, {
  loader: "css",
  minify: true,
  target: ["safari16", "chrome111", "firefox115"],
});
const cssHash = createHash("sha256").update(css).digest("hex").slice(0, 10);
const cssName = `/assets/app-${cssHash}.css`;
await writeFile(path.join(out, "client", cssName), css);

// 3. Archivos estáticos (logotipo, iconos, imagen social, cabeceras).
await cp(path.join(root, "public"), path.join(out, "client"), { recursive: true });

// 4. Worker (un único módulo ESM, sin dependencias de Node).
const manifest = { js: jsPath, css: cssName };
await build({
  absWorkingDir: root,
  entryPoints: ["src/worker/index.ts"],
  bundle: true,
  format: "esm",
  platform: "neutral",
  conditions: ["workerd", "worker", "browser", "import", "default"],
  mainFields: ["module", "main"],
  outfile: "dist/worker/index.js",
  jsx: "automatic",
  define: { __ASSETS__: JSON.stringify(manifest), "process.env.NODE_ENV": '"production"' },
  minify: true,
  target: "es2022",
  legalComments: "none",
  logLevel: "warning",
});
await writeFile(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 2));

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const jsSize = (await readFile(path.join(root, entry[0]))).length;
console.log(`✓ Build en ${Date.now() - started} ms · JS ${kb(jsSize)} · CSS ${kb(css.length)} · ${manifest.js} ${manifest.css}`);
