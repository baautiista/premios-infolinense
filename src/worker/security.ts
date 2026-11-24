import type { Env } from "./env";
import { isDev } from "./env";

const enc = new TextEncoder();

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function base64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function randomToken(bytes = 32): string {
  return base64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

const keyCache = new Map<string, Promise<CryptoKey>>();
function hmacKey(secret: string): Promise<CryptoKey> {
  let k = keyCache.get(secret);
  if (!k) {
    k = crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    keyCache.set(secret, k);
  }
  return k;
}

export async function hmacHex(secret: string, data: string): Promise<string> {
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(data));
  return toHex(sig);
}

export async function sha256Hex(data: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", enc.encode(data)));
}

/** Comparación en tiempo constante de cadenas de igual longitud. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function clientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? request.headers.get("X-Real-IP") ?? "0.0.0.0";
}

/** Clave de red: IPv4 completa; IPv6 agrupada por su prefijo /64 (una vivienda u oficina). */
export function networkKey(ip: string): string {
  if (!ip.includes(":")) return ip;
  const groups = ip.split("::");
  const head = groups[0].split(":").filter(Boolean);
  const tail = groups.length > 1 ? groups[1].split(":").filter(Boolean) : [];
  const full = [...head, ...Array(Math.max(0, 8 - head.length - tail.length)).fill("0"), ...tail];
  return full.slice(0, 4).map((g) => g.toLowerCase().replace(/^0+(?=.)/, "")).join(":") + "::/64";
}

/* ------------------------------------------------------------------ */
/* Identificador anónimo de dispositivo (firmado para que no se falsee) */
/* ------------------------------------------------------------------ */

export async function signDeviceId(env: Env, id: string): Promise<string> {
  const sig = (await hmacHex(env.SESSION_SECRET as string, `device:${id}`)).slice(0, 32);
  return `v1.${id}.${sig}`;
}

export async function verifyDeviceToken(env: Env, token: unknown): Promise<string | null> {
  if (typeof token !== "string" || token.length > 120) return null;
  const m = /^v1\.([A-Za-z0-9_-]{22,64})\.([a-f0-9]{32})$/.exec(token);
  if (!m) return null;
  const expected = (await hmacHex(env.SESSION_SECRET as string, `device:${m[1]}`)).slice(0, 32);
  return safeEqual(expected, m[2]) ? m[1] : null;
}

/* ------------------------------------------------------------------ */
/* Turnstile                                                           */
/* ------------------------------------------------------------------ */

export type TurnstileResult = { ok: true } | { ok: false; reason: string };

export async function verifyTurnstile(env: Env, token: unknown, ip: string, action: string): Promise<TurnstileResult> {
  if (!env.TURNSTILE_SECRET) {
    return isDev(env) ? { ok: true } : { ok: false, reason: "not_configured" };
  }
  if (typeof token !== "string" || token.length < 10 || token.length > 2048) return { ok: false, reason: "missing_token" };
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", token);
  form.append("remoteip", ip);
  form.append("idempotency_key", crypto.randomUUID());
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
    const data = (await res.json()) as { success: boolean; action?: string; hostname?: string; "error-codes"?: string[] };
    if (!data.success) return { ok: false, reason: (data["error-codes"] ?? ["failed"]).join(",") };
    // Las claves de prueba no devuelven acción; en producción se exige la acción esperada.
    if (!isDev(env) && data.action && data.action !== action) return { ok: false, reason: "action_mismatch" };
    if (!isDev(env) && data.hostname && env.SITE_URL && !env.SITE_URL.includes(data.hostname)) {
      return { ok: false, reason: "hostname_mismatch" };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "verify_unavailable" };
  }
}

/* ------------------------------------------------------------------ */
/* Limitación de intentos (ventana fija, contador en D1)              */
/* ------------------------------------------------------------------ */

export async function rateLimit(db: D1Database, key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % windowSeconds);
  const row = await db
    .prepare(
      `INSERT INTO rate_limits (key, window_start, count) VALUES (?1, ?2, 1)
       ON CONFLICT(key) DO UPDATE SET
         count = CASE WHEN rate_limits.window_start = excluded.window_start THEN rate_limits.count + 1 ELSE 1 END,
         window_start = excluded.window_start
       RETURNING count`,
    )
    .bind(key, windowStart)
    .first<{ count: number }>();
  return (row?.count ?? 1) <= limit;
}

export async function logEvent(
  db: D1Database,
  e: { type: string; severity: "info" | "warning" | "high"; net_hash?: string | null; device_hash?: string | null; detail?: unknown },
) {
  const detail = e.detail === undefined ? null : typeof e.detail === "string" ? e.detail : JSON.stringify(e.detail);
  await db
    .prepare("INSERT INTO security_events (type, severity, net_hash, device_hash, detail) VALUES (?1, ?2, ?3, ?4, ?5)")
    .bind(e.type, e.severity, e.net_hash ?? null, e.device_hash ?? null, detail ? detail.slice(0, 2000) : null)
    .run();
}

/* ------------------------------------------------------------------ */
/* Contraseñas del panel (PBKDF2-SHA256)                               */
/* ------------------------------------------------------------------ */

export const PBKDF2_ITERATIONS = 100_000; // máximo admitido por Workers

export async function hashPassword(password: string, saltB64: string, iterations: number): Promise<string> {
  const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  return toHex(bits);
}
