import { renderToString } from "react-dom/server.edge";
import { App } from "../app/App";
import type { RoutePayload } from "../shared/types";
import type { Env } from "./env";

declare const __ASSETS__: { js: string; css: string };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
/** JSON incrustado en HTML sin posibilidad de cerrar la etiqueta <script>. */
const safeJson = (v: unknown) =>
  JSON.stringify(v).replace(/</g, "\\u003c").replace(/[\u2028\u2029]/g, (c) => (c === "\u2028" ? "\\u2028" : "\\u2029"));

function abs(env: Env, path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${env.SITE_URL.replace(/\/$/, "")}${path}`;
}

export function renderDocument(env: Env, payload: RoutePayload<unknown> | null, opts: { admin?: boolean } = {}): string {
  const meta = payload?.meta ?? { title: "Panel · Premios InfoLinense", description: "Panel de administración", noindex: true };
  const body = payload && !opts.admin ? renderToString(<App initial={payload} />) : "";
  const canonical = meta.canonical ? abs(env, meta.canonical) : null;
  const image = abs(env, meta.image ?? null);
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://infolinense.com/#organization",
        name: "InfoLinense",
        url: "https://infolinense.com/",
      },
      {
        "@type": "WebSite",
        "@id": `${env.SITE_URL}/#website`,
        name: "Premios InfoLinense",
        url: `${env.SITE_URL}/`,
        inLanguage: "es",
        publisher: { "@id": "https://infolinense.com/#organization" },
      },
    ],
  };
  const head = [
    `<meta charset="utf-8">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`,
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}">`,
    `<meta name="robots" content="${meta.noindex || opts.admin ? "noindex, nofollow" : "index, follow, max-image-preview:large"}">`,
    `<meta name="theme-color" content="#0B2A86">`,
    canonical ? `<link rel="canonical" href="${esc(canonical)}">` : "",
    `<meta property="og:site_name" content="Premios InfoLinense">`,
    `<meta property="og:locale" content="es_ES">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${esc(meta.title)}">`,
    `<meta property="og:description" content="${esc(meta.description)}">`,
    canonical ? `<meta property="og:url" content="${esc(canonical)}">` : "",
    image ? `<meta property="og:image" content="${esc(image)}">` : "",
    image ? `<meta property="og:image:alt" content="${esc(meta.title)}">` : "",
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(meta.title)}">`,
    `<meta name="twitter:description" content="${esc(meta.description)}">`,
    image ? `<meta name="twitter:image" content="${esc(image)}">` : "",
    `<link rel="icon" href="/favicon.png" type="image/png">`,
    `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`,
    `<link rel="preload" as="font" href="/fonts/raleway-latin-wght.woff" type="font/woff" crossorigin>`,
    `<link rel="preload" as="image" href="/brand/logo-premios-infolinense.webp" type="image/webp">`,
    `<link rel="stylesheet" href="${__ASSETS__.css}">`,
    `<link rel="modulepreload" href="${__ASSETS__.js}">`,
    opts.admin ? "" : `<script type="application/ld+json">${safeJson(ld)}</script>`,
  ]
    .filter(Boolean)
    .join("\n");

  const data = opts.admin ? { admin: true } : payload;
  return `<!doctype html>
<html lang="es">
<head>
${head}
</head>
<body>
<div id="root">${body}</div>
<script type="application/json" id="__DATA__">${safeJson(data)}</script>
<script type="module" src="${__ASSETS__.js}"></script>
</body>
</html>`;
}
