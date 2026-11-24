import { handleAdmin } from "./admin";
import type { Env } from "./env";
import { HttpError, errorResponse, json, securityHeaders } from "./http";
import { serveMedia } from "./media";
import { loadRoute, sitemapPaths } from "./public";
import { renderDocument } from "./render";
import { checkReceipt, submitBallot, voteStatus } from "./vote";

async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (path.startsWith("/api/admin/") || path === "/api/admin") {
    const res = await handleAdmin(env, request, url);
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }
  if (path === "/api/vote/status" && method === "GET") return voteStatus(env, request);
  if (path === "/api/vote/ballot" && method === "POST") return submitBallot(env, request);
  if (path === "/api/vote/receipt" && method === "POST") return checkReceipt(env, request);
  if (path === "/api/page" && method === "GET") {
    const target = url.searchParams.get("path") ?? "/";
    if (!target.startsWith("/") || target.startsWith("//") || target.length > 300) throw new HttpError(400, "invalid_path");
    const payload = await loadRoute(env, new URL(target, url.origin));
    return json(payload, { status: payload.status });
  }
  if (path.startsWith("/api/")) throw new HttpError(404, "not_found");

  if (path.startsWith("/media/") && (method === "GET" || method === "HEAD")) return serveMedia(env, request, path.slice(7));

  if (method !== "GET" && method !== "HEAD") return new Response("Método no permitido", { status: 405, headers: { Allow: "GET, HEAD" } });

  if (path === "/robots.txt") {
    return new Response(
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /comprobante\n\nSitemap: ${env.SITE_URL}/sitemap.xml\n`,
      { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } },
    );
  }
  if (path === "/sitemap.xml") {
    const paths = await sitemapPaths(env);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
      .map((p) => `  <url><loc>${env.SITE_URL}${p.replace(/&/g, "&amp;")}</loc></url>`)
      .join("\n")}\n</urlset>\n`;
    return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=600" } });
  }

  if (path === "/admin" || path.startsWith("/admin/")) {
    const headers = new Headers({ "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    securityHeaders(headers, { admin: true });
    return new Response(renderDocument(env, null, { admin: true }), { headers });
  }

  const payload = await loadRoute(env, url);
  const headers = new Headers({ "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
  securityHeaders(headers);
  return new Response(method === "HEAD" ? null : renderDocument(env, payload), { status: payload.status, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const res = await route(request, env);
      if (!res.headers.has("X-Content-Type-Options")) res.headers.set("X-Content-Type-Options", "nosniff");
      return res;
    } catch (err) {
      if (err instanceof HttpError) return errorResponse(err);
      console.error("Error no controlado", err);
      return json({ ok: false, error: "server_error", message: "Se ha producido un error. Inténtalo de nuevo." }, { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
