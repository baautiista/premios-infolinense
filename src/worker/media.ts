import { audit } from "./db";
import type { Env } from "./env";
import { HttpError, json } from "./http";
import { randomToken } from "./security";

const MAX_BYTES = 6 * 1024 * 1024;
const TYPES: Record<string, { ext: string; magic: (b: Uint8Array) => boolean }> = {
  "image/jpeg": { ext: "jpg", magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": { ext: "png", magic: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  "image/webp": {
    ext: "webp",
    magic: (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
};
const KINDS = new Set(["portrait", "square", "wide", "logo", "original"]);

/** POST /api/admin/media?kind=portrait — sube una imagen ya recortada en el navegador. */
export async function storeMedia(env: Env, request: Request, actor: string): Promise<Response> {
  const url = new URL(request.url);
  const kind = url.searchParams.get("kind") ?? "original";
  if (!KINDS.has(kind)) throw new HttpError(400, "invalid_kind");
  const type = (request.headers.get("Content-Type") ?? "").split(";")[0].trim();
  const spec = TYPES[type];
  if (!spec) throw new HttpError(415, "unsupported_media_type", "Formatos admitidos: JPEG, PNG y WebP.");
  const declared = Number(request.headers.get("Content-Length") ?? "0");
  if (declared > MAX_BYTES) throw new HttpError(413, "payload_too_large", "La imagen supera 6 MB.");
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.length === 0 || bytes.length > MAX_BYTES) throw new HttpError(413, "payload_too_large", "La imagen supera 6 MB.");
  if (!spec.magic(bytes)) throw new HttpError(400, "invalid_image", "El archivo no es una imagen válida.");
  const d = new Date();
  const key = `uploads/${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${kind}-${randomToken(12)}.${spec.ext}`;
  await env.MEDIA.put(key, bytes, { httpMetadata: { contentType: type, cacheControl: "public, max-age=31536000, immutable" } });
  await audit(env.DB, { actor, action: "media.upload", entity: "media", entity_id: key });
  return json({ ok: true, url: `/media/${key}` }, { status: 201 });
}

/** GET /media/<clave> — sirve imágenes desde R2 con caché larga (las claves son únicas). */
export async function serveMedia(env: Env, request: Request, key: string): Promise<Response> {
  if (!/^[A-Za-z0-9/_.-]+$/.test(key) || key.includes("..")) return new Response("No encontrado", { status: 404 });
  const obj = await env.MEDIA.get(key, { onlyIf: request.headers });
  if (!obj) return new Response("No encontrado", { status: 404 });
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("ETag", obj.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Content-Security-Policy", "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'");
  if (!("body" in obj) || !obj.body) return new Response(null, { status: 304, headers });
  return new Response(obj.body, { headers });
}
