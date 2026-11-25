export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  if (!headers.has("Cache-Control")) headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function errorResponse(err: HttpError): Response {
  return json({ ok: false, error: err.code, message: err.message }, { status: err.status });
}

export async function readJson<T = unknown>(request: Request, maxBytes = 64 * 1024): Promise<T> {
  const type = request.headers.get("Content-Type") ?? "";
  if (!type.includes("application/json")) throw new HttpError(415, "unsupported_media_type");
  const declared = Number(request.headers.get("Content-Length") ?? "0");
  if (declared > maxBytes) throw new HttpError(413, "payload_too_large");
  const text = await request.text();
  if (text.length > maxBytes) throw new HttpError(413, "payload_too_large");
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpError(400, "invalid_json");
  }
}

export function parseCookies(request: Request): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (request.headers.get("Cookie") ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    if (k) out[k] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function cookie(
  name: string,
  value: string,
  opts: { maxAge?: number; sameSite?: "Strict" | "Lax"; secure?: boolean; path?: string } = {},
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${opts.path ?? "/"}`, "HttpOnly", `SameSite=${opts.sameSite ?? "Lax"}`];
  if (opts.secure !== false) parts.push("Secure");
  if (opts.maxAge !== undefined) parts.push(`Max-Age=${opts.maxAge}`);
  return parts.join("; ");
}

/** Cabeceras de seguridad comunes a todas las respuestas HTML. */
export function securityHeaders(headers: Headers, opts: { admin?: boolean } = {}) {
  // Google Tag Manager / Analytics solo en la web pública (se carga tras el consentimiento).
  const g = opts.admin ? "" : " https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com";
  const csp = [
    "default-src 'self'",
    `script-src 'self' https://challenges.cloudflare.com${opts.admin ? "" : " https://www.googletagmanager.com"}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    `img-src 'self' data: blob:${g}`,
    `connect-src 'self'${g}`,
    `frame-src https://challenges.cloudflare.com${opts.admin ? "" : " https://www.googletagmanager.com"}`,
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
  ].join("; ");
  headers.set("Content-Security-Policy", csp);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  if (opts.admin) headers.set("X-Robots-Tag", "noindex, nofollow");
}
