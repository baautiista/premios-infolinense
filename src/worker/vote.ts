import { madridDay } from "../shared/time";
import { currentPhase, EDITION_ID, loadSettings, VISIBLE_NOMINEE } from "./db";
import type { Env } from "./env";
import { missingSecrets } from "./env";
import { HttpError, cookie, json, parseCookies, readJson } from "./http";
import {
  clientIp,
  hmacHex,
  logEvent,
  networkKey,
  randomToken,
  rateLimit,
  signDeviceId,
  verifyDeviceToken,
  verifyTurnstile,
} from "./security";

export const DEVICE_COOKIE = "pi_vid";
const DEVICE_MAX_AGE = 60 * 60 * 24 * 400;
const RECEIPT_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin caracteres ambiguos

interface Identity {
  deviceIds: string[]; // identificadores válidos presentados (cookie y almacenamiento local)
  primaryId: string;
  isNew: boolean;
  deviceHashes: string[];
  primaryHash: string;
  netHash: string;
  signalHash: string;
  setCookie: string | null;
  deviceToken: string;
}

async function identify(env: Env, request: Request, bodyToken: unknown): Promise<Identity> {
  const pepper = env.VOTE_PEPPER as string;
  const cookieToken = parseCookies(request)[DEVICE_COOKIE];
  const ids: string[] = [];
  for (const t of [cookieToken, bodyToken]) {
    const id = await verifyDeviceToken(env, t);
    if (id && !ids.includes(id)) ids.push(id);
  }
  const isNew = ids.length === 0;
  const primaryId = ids[0] ?? randomToken(24);
  if (isNew) ids.push(primaryId);
  const deviceHashes = await Promise.all(ids.map((id) => hmacHex(pepper, `device:${id}`)));
  const net = networkKey(clientIp(request));
  const ua = (request.headers.get("User-Agent") ?? "").slice(0, 400);
  const lang = (request.headers.get("Accept-Language") ?? "").slice(0, 100);
  const deviceToken = await signDeviceId(env, primaryId);
  const secure = new URL(request.url).protocol === "https:";
  return {
    deviceIds: ids,
    primaryId,
    isNew,
    deviceHashes,
    primaryHash: deviceHashes[0],
    netHash: await hmacHex(pepper, `net:${net}`),
    signalHash: await hmacHex(pepper, `signal:${net}|${ua}|${lang}`),
    setCookie: cookieToken === deviceToken ? null : cookie(DEVICE_COOKIE, deviceToken, { maxAge: DEVICE_MAX_AGE, secure }),
    deviceToken,
  };
}

async function hasVoted(db: D1Database, hashes: string[]): Promise<boolean> {
  if (!hashes.length) return false;
  const placeholders = hashes.map((_, i) => `?${i + 2}`).join(",");
  const row = await db
    .prepare(`SELECT 1 AS x FROM ballots WHERE edition_id = ?1 AND device_hash IN (${placeholders}) LIMIT 1`)
    .bind(EDITION_ID, ...hashes)
    .first();
  return Boolean(row);
}

function withCookie(res: Response, setCookie: string | null): Response {
  if (setCookie) res.headers.append("Set-Cookie", setCookie);
  return res;
}

/** GET /api/vote/status — estado de la votación para este dispositivo (nunca incluye recuentos). */
export async function voteStatus(env: Env, request: Request): Promise<Response> {
  const settings = await loadSettings(env.DB);
  const phase = currentPhase(settings);
  if (missingSecrets(env).some((s) => s !== "TURNSTILE_SECRET" && s !== "TURNSTILE_SITE_KEY")) {
    return json({ ok: true, phase, votingOpen: false, configured: false });
  }
  const id = await identify(env, request, request.headers.get("X-Device-Token"));
  return withCookie(
    json({
      ok: true,
      phase,
      votingOpen: phase === "voting",
      configured: missingSecrets(env).length === 0,
      closesAt: settings.voting_closes_at,
      alreadyVoted: id.isNew ? false : await hasVoted(env.DB, id.deviceHashes),
      deviceToken: id.deviceToken,
    }),
    id.setCookie,
  );
}

interface BallotBody {
  selections?: unknown;
  turnstileToken?: unknown;
  deviceToken?: unknown;
}

function makeReceipt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const chars = [...bytes].map((b) => RECEIPT_ALPHABET[b % RECEIPT_ALPHABET.length]).join("");
  return `PI26-${chars.slice(0, 4)}-${chars.slice(4)}`;
}

/** POST /api/vote/ballot — registra una papeleta completa en una única transacción. */
export async function submitBallot(env: Env, request: Request): Promise<Response> {
  if (missingSecrets(env).length) {
    throw new HttpError(503, "voting_not_configured", "La votación no está configurada todavía.");
  }
  const ip = clientIp(request);
  const pepper = env.VOTE_PEPPER as string;
  const netHashEarly = await hmacHex(pepper, `net:${networkKey(ip)}`);

  // 1. Límite de intentos por conexión (antes de cualquier trabajo costoso).
  if (!(await rateLimit(env.DB, `ballot:${netHashEarly}`, 30, 600))) {
    await logEvent(env.DB, { type: "rate_limited", severity: "warning", net_hash: netHashEarly });
    throw new HttpError(429, "too_many_attempts", "Demasiados intentos desde esta conexión. Inténtalo más tarde.");
  }

  const body = await readJson<BallotBody>(request, 8 * 1024);

  // 2. Fase: solo durante el periodo oficial.
  const settings = await loadSettings(env.DB);
  if (currentPhase(settings) !== "voting") {
    throw new HttpError(403, "voting_closed", "La votación no está abierta.");
  }

  // 3. Verificación anti-bots.
  const ts = await verifyTurnstile(env, body.turnstileToken, ip, "ballot");
  if (!ts.ok) {
    await logEvent(env.DB, { type: "turnstile_failed", severity: "warning", net_hash: netHashEarly, detail: ts.reason });
    throw new HttpError(403, "bot_check_failed", "No hemos podido verificar que no eres un robot. Recarga la página e inténtalo de nuevo.");
  }

  const id = await identify(env, request, body.deviceToken);

  // 4. Forma de la papeleta.
  const raw = body.selections;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new HttpError(400, "invalid_ballot");
  const entries = Object.entries(raw as Record<string, unknown>);
  if (entries.length === 0) throw new HttpError(400, "empty_ballot", "Elige al menos una candidatura.");
  if (entries.length > 50) throw new HttpError(400, "invalid_ballot");
  const selections: { categoryId: number; nomineeId: number }[] = [];
  for (const [k, v] of entries) {
    const categoryId = Number(k);
    const nomineeId = typeof v === "number" ? v : Number.NaN;
    if (!Number.isSafeInteger(categoryId) || !Number.isSafeInteger(nomineeId) || categoryId <= 0 || nomineeId <= 0) {
      await logEvent(env.DB, { type: "ballot_tampered", severity: "high", net_hash: id.netHash, device_hash: id.primaryHash, detail: { k, v } });
      throw new HttpError(400, "invalid_ballot", "La papeleta no es válida.");
    }
    selections.push({ categoryId, nomineeId });
  }

  // 5. Validación en el servidor contra las candidaturas oficiales.
  const { results: valid } = await env.DB.prepare(
    `SELECT n.id AS nominee_id, n.category_id FROM nominees n JOIN categories c ON c.id = n.category_id
     WHERE c.edition_id = ?1 AND c.published = 1 AND c.votable = 1 AND ${VISIBLE_NOMINEE}`,
  )
    .bind(EDITION_ID)
    .all<{ nominee_id: number; category_id: number }>();
  const allowed = new Map(valid.map((r) => [r.nominee_id, r.category_id]));
  for (const s of selections) {
    if (allowed.get(s.nomineeId) !== s.categoryId) {
      await logEvent(env.DB, {
        type: "ballot_tampered",
        severity: "high",
        net_hash: id.netHash,
        device_hash: id.primaryHash,
        detail: { categoryId: s.categoryId, nomineeId: s.nomineeId },
      });
      throw new HttpError(400, "invalid_selection", "La papeleta contiene una selección no válida.");
    }
  }

  // 6. Una papeleta por dispositivo (cookie o almacenamiento local).
  if (await hasVoted(env.DB, id.deviceHashes)) {
    await logEvent(env.DB, { type: "duplicate_device", severity: "info", net_hash: id.netHash, device_hash: id.primaryHash });
    return withCookie(
      json({ ok: false, error: "already_voted", message: "Ya se ha registrado una papeleta desde este dispositivo." }, { status: 409 }),
      id.setCookie,
    );
  }

  // 7. Señales de conexión: nunca se usan como prueba única; marcan para revisión.
  const day = madridDay();
  const flags: string[] = [];
  const netRow = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM ballots WHERE edition_id = ?1 AND net_hash = ?2 AND local_day = ?3 AND status != 'annulled'",
  )
    .bind(EDITION_ID, id.netHash, day)
    .first<{ n: number }>();
  const netCount = netRow?.n ?? 0;
  if (settings.hard_network_limit > 0 && netCount >= settings.hard_network_limit) {
    await logEvent(env.DB, { type: "network_hard_limit", severity: "high", net_hash: id.netHash, device_hash: id.primaryHash, detail: { netCount } });
    throw new HttpError(429, "network_limit", "Se ha alcanzado el máximo de papeletas diarias desde esta conexión. Puedes votar desde otra red.");
  }
  if (settings.soft_network_limit > 0 && netCount >= settings.soft_network_limit) flags.push("volumen_de_red");
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const sameSignal = await env.DB.prepare(
    "SELECT 1 AS x FROM ballots WHERE edition_id = ?1 AND signal_hash = ?2 AND created_at >= ?3 AND status != 'annulled' LIMIT 1",
  )
    .bind(EDITION_ID, id.signalHash, since)
    .first();
  if (sameSignal) flags.push("mismo_navegador_y_red");
  const status = flags.length ? "review" : "valid";

  // 8. Escritura atómica: papeleta + votos. UNIQUE(edition_id, device_hash) impide duplicados concurrentes.
  const receipt = makeReceipt();
  const receiptHash = await hmacHex(pepper, `receipt:${receipt}`);
  const now = new Date().toISOString();
  const stmts = [
    env.DB.prepare(
      `INSERT INTO ballots (edition_id, device_hash, net_hash, signal_hash, receipt_hash, status, flags, local_day, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`,
    ).bind(EDITION_ID, id.primaryHash, id.netHash, id.signalHash, receiptHash, status, flags.join(",") || null, day, now),
    ...selections.map((s) =>
      env.DB.prepare("INSERT INTO votes (ballot_id, category_id, nominee_id) SELECT id, ?2, ?3 FROM ballots WHERE receipt_hash = ?1").bind(
        receiptHash,
        s.categoryId,
        s.nomineeId,
      ),
    ),
  ];
  try {
    await env.DB.batch(stmts);
  } catch (e) {
    const msg = String((e as Error)?.message ?? e);
    if (/UNIQUE/i.test(msg)) {
      await logEvent(env.DB, { type: "duplicate_race", severity: "warning", net_hash: id.netHash, device_hash: id.primaryHash });
      return withCookie(
        json({ ok: false, error: "already_voted", message: "Ya se ha registrado una papeleta desde este dispositivo." }, { status: 409 }),
        id.setCookie,
      );
    }
    throw e;
  }
  if (status === "review") {
    await logEvent(env.DB, { type: "ballot_flagged", severity: "warning", net_hash: id.netHash, device_hash: id.primaryHash, detail: flags.join(",") });
  }

  // Misma respuesta para papeletas válidas y en revisión: no se revela el criterio de revisión.
  return withCookie(
    json({ ok: true, receipt, categories: selections.length, deviceToken: id.deviceToken, at: now }, { status: 201 }),
    id.setCookie,
  );
}

/** POST /api/vote/receipt — comprueba un comprobante sin revelar el contenido de la papeleta. */
export async function checkReceipt(env: Env, request: Request): Promise<Response> {
  const ip = clientIp(request);
  const pepper = env.VOTE_PEPPER as string;
  if (!pepper) throw new HttpError(503, "voting_not_configured");
  const netHash = await hmacHex(pepper, `net:${networkKey(ip)}`);
  if (!(await rateLimit(env.DB, `receipt:${netHash}`, 20, 600))) throw new HttpError(429, "too_many_attempts");
  const body = await readJson<{ code?: unknown }>(request, 1024);
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!/^PI26-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) throw new HttpError(400, "invalid_code", "El código no tiene el formato correcto.");
  const row = await env.DB.prepare("SELECT status, created_at FROM ballots WHERE receipt_hash = ?1")
    .bind(await hmacHex(pepper, `receipt:${code}`))
    .first<{ status: string; created_at: string }>();
  if (!row) return json({ ok: true, found: false });
  return json({ ok: true, found: true, status: row.status === "annulled" ? "anulada" : "registrada", at: row.created_at });
}
