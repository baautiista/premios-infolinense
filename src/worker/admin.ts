import { isPhase, PHASES } from "../shared/phase";
import { madridLocalToUtcIso, utcIsoToMadridLocal } from "../shared/time";
import { audit, EDITION_ID, loadSettings, currentPhase, type CategoryRow, type NomineeRow } from "./db";
import type { Env } from "./env";
import { missingSecrets } from "./env";
import { HttpError, cookie, json, parseCookies, readJson } from "./http";
import { clientIp, hashPassword, logEvent, randomToken, rateLimit, safeEqual, sha256Hex, hmacHex, networkKey } from "./security";
import { storeMedia } from "./media";

export const ADMIN_COOKIE = "pi_admin";
const SESSION_HOURS = 12;

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: "admin" | "editor";
}

/* ------------------------------------------------------------------ */
/* Validación                                                          */
/* ------------------------------------------------------------------ */

function str(v: unknown, field: string, max: number, required = false): string | null {
  if (v === undefined || v === null || v === "") {
    if (required) throw new HttpError(400, "invalid_field", `Falta el campo «${field}».`);
    return null;
  }
  if (typeof v !== "string") throw new HttpError(400, "invalid_field", `«${field}» no es válido.`);
  const s = v.trim();
  if (s.length > max) throw new HttpError(400, "invalid_field", `«${field}» supera ${max} caracteres.`);
  if (!s && required) throw new HttpError(400, "invalid_field", `Falta el campo «${field}».`);
  return s || null;
}
function int(v: unknown, field: string, min: number, max: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isInteger(n) || n < min || n > max) throw new HttpError(400, "invalid_field", `«${field}» debe estar entre ${min} y ${max}.`);
  return n;
}
function bool(v: unknown): number {
  return v === true || v === 1 || v === "1" ? 1 : 0;
}
function color(v: unknown, field: string): string {
  const s = str(v, field, 7, true) as string;
  if (!/^#[0-9a-fA-F]{6}$/.test(s)) throw new HttpError(400, "invalid_field", `«${field}» debe ser un color #RRGGBB.`);
  return s.toUpperCase();
}
function slugOf(v: unknown, field: string): string {
  const s = (str(v, field, 80, true) as string).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) throw new HttpError(400, "invalid_field", `«${field}» solo admite minúsculas, números y guiones.`);
  return s;
}
function mediaUrl(v: unknown, field: string): string | null {
  const s = str(v, field, 300);
  if (s && !/^\/media\/[A-Za-z0-9/_.-]+$/.test(s) && !/^https:\/\//.test(s)) throw new HttpError(400, "invalid_field", `«${field}» no es una imagen válida.`);
  return s;
}
function reasonOf(v: unknown): string {
  const r = str(v, "motivo", 500);
  if (!r || r.length < 5) throw new HttpError(400, "reason_required", "Indica el motivo de la intervención (mínimo 5 caracteres).");
  return r;
}

/* ------------------------------------------------------------------ */
/* Sesión                                                              */
/* ------------------------------------------------------------------ */

async function sessionUser(env: Env, request: Request): Promise<AdminUser | null> {
  const token = parseCookies(request)[ADMIN_COOKIE];
  if (!token || token.length > 100) return null;
  const row = await env.DB.prepare(
    `SELECT u.id, u.email, u.name, u.role FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id
     WHERE s.token_hash = ?1 AND s.expires_at > ?2 AND u.active = 1`,
  )
    .bind(await sha256Hex(token), new Date().toISOString())
    .first<AdminUser>();
  return row ?? null;
}

function requireRole(user: AdminUser, role: "admin" | "editor") {
  if (role === "admin" && user.role !== "admin") throw new HttpError(403, "forbidden", "Esta acción requiere perfil de administración.");
}

/** Protección CSRF: cabecera propia (no la puede enviar otro sitio sin CORS) y origen coincidente. */
function checkCsrf(env: Env, request: Request) {
  if (request.headers.get("X-Premios-Admin") !== "1") throw new HttpError(403, "csrf", "Petición no permitida.");
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) throw new HttpError(403, "csrf", "Origen no permitido.");
}

async function login(env: Env, request: Request): Promise<Response> {
  const body = await readJson<{ email?: unknown; password?: unknown }>(request, 2048);
  const email = (str(body.email, "correo", 200, true) as string).toLowerCase();
  const password = str(body.password, "contraseña", 200, true) as string;
  const netHash = await hmacHex(env.SESSION_SECRET as string, `adminnet:${networkKey(clientIp(request))}`);
  const okNet = await rateLimit(env.DB, `login-net:${netHash}`, 10, 900);
  const okUser = await rateLimit(env.DB, `login-user:${await sha256Hex(email)}`, 5, 900);
  if (!okNet || !okUser) {
    await logEvent(env.DB, { type: "admin_login_rate_limited", severity: "high", net_hash: netHash });
    throw new HttpError(429, "too_many_attempts", "Demasiados intentos. Espera 15 minutos.");
  }
  const user = await env.DB.prepare(
    "SELECT id, email, name, role, password_hash, password_salt, iterations, active FROM admin_users WHERE email = ?1",
  )
    .bind(email)
    .first<AdminUser & { password_hash: string; password_salt: string; iterations: number; active: number }>();
  // Se calcula el hash aunque el usuario no exista, para no revelar qué correos están dados de alta.
  const candidate = await hashPassword(password, user?.password_salt ?? "AAAAAAAAAAAAAAAAAAAAAA==", user?.iterations ?? 100_000);
  if (!user || !user.active || !safeEqual(candidate, user.password_hash)) {
    await logEvent(env.DB, { type: "admin_login_failed", severity: "warning", net_hash: netHash, detail: { email } });
    throw new HttpError(401, "invalid_credentials", "Correo o contraseña incorrectos.");
  }
  const token = randomToken(32);
  const expires = new Date(Date.now() + SESSION_HOURS * 3600 * 1000).toISOString();
  await env.DB.batch([
    env.DB.prepare("DELETE FROM admin_sessions WHERE expires_at < ?1").bind(new Date().toISOString()),
    env.DB.prepare("INSERT INTO admin_sessions (token_hash, user_id, created_at, expires_at) VALUES (?1, ?2, ?3, ?4)").bind(
      await sha256Hex(token),
      user.id,
      new Date().toISOString(),
      expires,
    ),
    env.DB.prepare("UPDATE admin_users SET last_login_at = ?1 WHERE id = ?2").bind(new Date().toISOString(), user.id),
  ]);
  await audit(env.DB, { actor: user.email, action: "login" });
  const secure = new URL(request.url).protocol === "https:";
  return json(
    { ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } },
    { headers: { "Set-Cookie": cookie(ADMIN_COOKIE, token, { maxAge: SESSION_HOURS * 3600, sameSite: "Strict", secure }) } },
  );
}

async function logout(env: Env, request: Request): Promise<Response> {
  const token = parseCookies(request)[ADMIN_COOKIE];
  if (token) await env.DB.prepare("DELETE FROM admin_sessions WHERE token_hash = ?1").bind(await sha256Hex(token)).run();
  return json({ ok: true }, { headers: { "Set-Cookie": cookie(ADMIN_COOKIE, "", { maxAge: 0, sameSite: "Strict" }) } });
}

/* ------------------------------------------------------------------ */
/* Router                                                              */
/* ------------------------------------------------------------------ */

export async function handleAdmin(env: Env, request: Request, url: URL): Promise<Response> {
  const path = url.pathname.replace(/^\/api\/admin/, "") || "/";
  const method = request.method;
  checkCsrf(env, request);

  if (path === "/login" && method === "POST") return login(env, request);
  if (path === "/logout" && method === "POST") return logout(env, request);

  const user = await sessionUser(env, request);
  if (!user) throw new HttpError(401, "unauthenticated", "Inicia sesión para continuar.");
  const actor = user.email;
  const seg = path.split("/").filter(Boolean);

  if (path === "/me") return json({ ok: true, user });
  if (path === "/overview" && method === "GET") return overview(env, user);

  // Ajustes de la edición (fase, fechas, límites)
  if (path === "/settings" && method === "GET") return getSettings(env);
  if (path === "/settings" && method === "PUT") {
    requireRole(user, "admin");
    return putSettings(env, request, actor);
  }

  // Categorías
  if (seg[0] === "categories") {
    if (seg.length === 1 && method === "GET") return listCategories(env);
    if (seg.length === 1 && method === "POST") return saveCategory(env, request, actor, null);
    const id = int(seg[1], "id", 1, 1e9);
    if (seg.length === 2 && method === "PUT") return saveCategory(env, request, actor, id);
    if (seg.length === 2 && method === "DELETE") {
      requireRole(user, "admin");
      return deleteCategory(env, request, actor, id);
    }
    if (seg[2] === "winner" && method === "PUT") {
      requireRole(user, "admin");
      return setWinner(env, request, actor, id);
    }
  }

  // Candidaturas
  if (seg[0] === "nominees") {
    if (seg.length === 1 && method === "GET") return listNominees(env);
    if (seg.length === 1 && method === "POST") return saveNominee(env, request, actor, null);
    const id = int(seg[1], "id", 1, 1e9);
    if (seg.length === 2 && method === "PUT") return saveNominee(env, request, actor, id);
    if (seg.length === 2 && method === "DELETE") return deleteNominee(env, request, actor, id);
  }

  // Imágenes
  if (path === "/media" && method === "POST") return storeMedia(env, request, actor);

  // Resultados internos y control de fraude (solo administración)
  if (path === "/results" && method === "GET") {
    requireRole(user, "admin");
    return results(env);
  }
  if (path === "/results.csv" && method === "GET") {
    requireRole(user, "admin");
    return resultsCsv(env, actor);
  }
  if (path === "/ballots" && method === "GET") {
    requireRole(user, "admin");
    return listBallots(env, url);
  }
  if (seg[0] === "ballots" && seg[1] && method === "POST") {
    requireRole(user, "admin");
    return changeBallots(env, request, actor, seg[1]);
  }
  if (path === "/events" && method === "GET") {
    requireRole(user, "admin");
    return listEvents(env);
  }
  if (path === "/purge-technical" && method === "POST") {
    requireRole(user, "admin");
    return purgeTechnical(env, request, actor);
  }

  // Patrocinadores
  if (seg[0] === "sponsors") {
    if (seg.length === 1 && method === "GET") return listSponsors(env);
    if (seg.length === 1 && method === "POST") return saveSponsor(env, request, actor, null);
    const id = int(seg[1], "id", 1, 1e9);
    if (seg.length === 2 && method === "PUT") return saveSponsor(env, request, actor, id);
    if (seg.length === 2 && method === "DELETE") return deleteSponsor(env, actor, id);
  }

  // Páginas informativas
  if (seg[0] === "pages") {
    if (seg.length === 1 && method === "GET") return listPages(env);
    if (seg.length === 2 && method === "PUT") return savePage(env, request, actor, seg[1]);
  }

  if (path === "/audit" && method === "GET") return listAudit(env);

  throw new HttpError(404, "not_found");
}

/* ------------------------------------------------------------------ */
/* Resumen y ajustes                                                   */
/* ------------------------------------------------------------------ */

async function overview(env: Env, user: AdminUser): Promise<Response> {
  const settings = await loadSettings(env.DB);
  const phase = currentPhase(settings);
  const [cats, noms, events] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) AS n FROM categories WHERE edition_id = ?1").bind(EDITION_ID).first<{ n: number }>(),
    env.DB.prepare(
      "SELECT SUM(published = 1 AND is_alternate = 0) AS published, SUM(is_alternate = 1) AS alternates, SUM(photo_portrait IS NULL AND published = 1) AS no_photo, SUM(reason IS NULL AND published = 1) AS no_reason FROM nominees",
    ).first<{ published: number; alternates: number; no_photo: number; no_reason: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS n FROM security_events WHERE severity != 'info' AND created_at > ?1")
      .bind(new Date(Date.now() - 86400_000).toISOString())
      .first<{ n: number }>(),
  ]);
  let ballots: unknown = null;
  if (user.role === "admin") {
    const { results } = await env.DB.prepare("SELECT status, COUNT(*) AS n FROM ballots WHERE edition_id = ?1 GROUP BY status")
      .bind(EDITION_ID)
      .all<{ status: string; n: number }>();
    ballots = Object.fromEntries(results.map((r) => [r.status, r.n]));
  }
  return json({
    ok: true,
    phase,
    configuredPhase: settings.phase,
    settings,
    missingSecrets: missingSecrets(env),
    counts: { categories: cats?.n ?? 0, ...noms, incidents24h: events?.n ?? 0 },
    ballots,
  });
}

async function getSettings(env: Env): Promise<Response> {
  const s = await loadSettings(env.DB);
  return json({
    ok: true,
    settings: {
      ...s,
      announce_at_local: utcIsoToMadridLocal(s.announce_at),
      voting_opens_at_local: utcIsoToMadridLocal(s.voting_opens_at),
      voting_closes_at_local: utcIsoToMadridLocal(s.voting_closes_at),
      results_at_local: utcIsoToMadridLocal(s.results_at),
    },
    phases: PHASES,
    effective: currentPhase(s),
  });
}

async function putSettings(env: Env, request: Request, actor: string): Promise<Response> {
  const body = await readJson<Record<string, unknown>>(request);
  const before = await loadSettings(env.DB);
  const next: Record<string, string | null> = {};
  if (body.phase !== undefined) {
    if (!isPhase(body.phase)) throw new HttpError(400, "invalid_field", "Fase no válida.");
    next.phase = body.phase;
  }
  for (const k of ["announce_at", "voting_opens_at", "voting_closes_at", "results_at"]) {
    const v = body[`${k}_local`];
    if (v === undefined) continue;
    if (v === "" || v === null) next[k] = null;
    else {
      const iso = madridLocalToUtcIso(String(v));
      if (!iso) throw new HttpError(400, "invalid_field", `Fecha no válida en «${k}».`);
      next[k] = iso;
    }
  }
  const opens = next.voting_opens_at !== undefined ? next.voting_opens_at : before.voting_opens_at;
  const closes = next.voting_closes_at !== undefined ? next.voting_closes_at : before.voting_closes_at;
  const resultsAt = next.results_at !== undefined ? next.results_at : before.results_at;
  if (opens && closes && Date.parse(closes) <= Date.parse(opens)) throw new HttpError(400, "invalid_dates", "El cierre debe ser posterior a la apertura.");
  if (closes && resultsAt && Date.parse(resultsAt) < Date.parse(closes)) throw new HttpError(400, "invalid_dates", "Los resultados no pueden publicarse antes del cierre.");
  if (body.nominee_order !== undefined) {
    if (!["random", "manual", "alpha"].includes(String(body.nominee_order))) throw new HttpError(400, "invalid_field", "Orden no válido.");
    next.nominee_order = String(body.nominee_order);
  }
  if (body.soft_network_limit !== undefined) next.soft_network_limit = String(int(body.soft_network_limit, "límite de revisión", 0, 10000));
  if (body.hard_network_limit !== undefined) next.hard_network_limit = String(int(body.hard_network_limit, "límite máximo", 0, 100000));
  if (body.contact_email !== undefined) next.contact_email = str(body.contact_email, "correo de contacto", 200);
  if (body.instagram_url !== undefined) next.instagram_url = str(body.instagram_url, "Instagram", 300);
  if (next.phase === "winners") {
    const pending = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM categories WHERE edition_id = ?1 AND published = 1 AND votable = 1 AND winner_nominee_id IS NULL",
    )
      .bind(EDITION_ID)
      .first<{ n: number }>();
    if ((pending?.n ?? 0) > 0 && body.confirm_incomplete !== true) {
      throw new HttpError(409, "winners_incomplete", `Faltan ganadores en ${pending?.n} categorías con votación. Confirma para publicar igualmente.`);
    }
  }
  const now = new Date().toISOString();
  await env.DB.batch(
    Object.entries(next).map(([k, v]) =>
      env.DB.prepare(
        "INSERT INTO settings (key, value, updated_at, updated_by) VALUES (?1, ?2, ?3, ?4) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by",
      ).bind(k, v, now, actor),
    ),
  );
  await audit(env.DB, { actor, action: "settings.update", entity: "settings", reason: str(body.reason, "motivo", 500), before, after: next });
  return getSettings(env);
}

/* ------------------------------------------------------------------ */
/* Categorías y candidaturas                                           */
/* ------------------------------------------------------------------ */

async function listCategories(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    `SELECT c.*, (SELECT COUNT(*) FROM nominees n WHERE n.category_id = c.id AND n.published = 1 AND n.is_alternate = 0) AS nominee_count
     FROM categories c WHERE edition_id = ?1 ORDER BY position, id`,
  )
    .bind(EDITION_ID)
    .all();
  return json({ ok: true, categories: results });
}

async function saveCategory(env: Env, request: Request, actor: string, id: number | null): Promise<Response> {
  const b = await readJson<Record<string, unknown>>(request);
  const row = {
    slug: slugOf(b.slug, "slug"),
    name: str(b.name, "nombre", 80, true),
    award_title: str(b.award_title, "título del premio", 120),
    question: str(b.question, "pregunta", 400),
    description: str(b.description, "descripción", 4000),
    nomination_note: str(b.nomination_note, "nota", 400),
    color: color(b.color, "color"),
    ink: color(b.ink ?? "#FFFFFF", "color del texto"),
    slots: int(b.slots ?? 5, "número de candidaturas", 0, 20),
    votable: bool(b.votable),
    published: bool(b.published),
    position: int(b.position ?? 0, "orden", 0, 1000),
  };
  const before = id ? await env.DB.prepare("SELECT * FROM categories WHERE id = ?1").bind(id).first<CategoryRow>() : null;
  if (id && !before) throw new HttpError(404, "not_found");
  if (before && before.votable === 1 && row.votable === 0) {
    const votes = await env.DB.prepare("SELECT COUNT(*) AS n FROM votes WHERE category_id = ?1").bind(id).first<{ n: number }>();
    if ((votes?.n ?? 0) > 0) throw new HttpError(409, "has_votes", "La categoría ya tiene votos: no puede pasar a ser sin votación.");
  }
  try {
    if (id) {
      await env.DB.prepare(
        `UPDATE categories SET slug=?1, name=?2, award_title=?3, question=?4, description=?5, nomination_note=?6, color=?7, ink=?8,
         slots=?9, votable=?10, published=?11, position=?12, updated_at=?13 WHERE id=?14`,
      )
        .bind(row.slug, row.name, row.award_title, row.question, row.description, row.nomination_note, row.color, row.ink, row.slots, row.votable, row.published, row.position, new Date().toISOString(), id)
        .run();
    } else {
      const r = await env.DB.prepare(
        `INSERT INTO categories (edition_id, slug, name, award_title, question, description, nomination_note, color, ink, slots, votable, published, position)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13) RETURNING id`,
      )
        .bind(EDITION_ID, row.slug, row.name, row.award_title, row.question, row.description, row.nomination_note, row.color, row.ink, row.slots, row.votable, row.published, row.position)
        .first<{ id: number }>();
      id = r?.id ?? null;
    }
  } catch (e) {
    if (/UNIQUE/i.test(String(e))) throw new HttpError(409, "slug_taken", "Ya existe una categoría con esa dirección (slug).");
    throw e;
  }
  await audit(env.DB, { actor, action: before ? "category.update" : "category.create", entity: "category", entity_id: id, before, after: row });
  return json({ ok: true, id });
}

async function deleteCategory(env: Env, request: Request, actor: string, id: number): Promise<Response> {
  const body = await readJson<{ reason?: unknown }>(request).catch(() => ({ reason: undefined }));
  const reason = reasonOf(body.reason);
  const votes = await env.DB.prepare("SELECT COUNT(*) AS n FROM votes WHERE category_id = ?1").bind(id).first<{ n: number }>();
  if ((votes?.n ?? 0) > 0) throw new HttpError(409, "has_votes", "La categoría tiene votos registrados: ocúltala en lugar de eliminarla.");
  const before = await env.DB.prepare("SELECT * FROM categories WHERE id = ?1").bind(id).first();
  if (!before) throw new HttpError(404, "not_found");
  await env.DB.batch([
    env.DB.prepare("UPDATE categories SET winner_nominee_id = NULL WHERE id = ?1").bind(id),
    env.DB.prepare("DELETE FROM nominees WHERE category_id = ?1").bind(id),
    env.DB.prepare("DELETE FROM categories WHERE id = ?1").bind(id),
  ]);
  await audit(env.DB, { actor, action: "category.delete", entity: "category", entity_id: id, reason, before });
  return json({ ok: true });
}

async function listNominees(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    `SELECT n.* FROM nominees n JOIN categories c ON c.id = n.category_id WHERE c.edition_id = ?1 ORDER BY c.position, n.is_alternate, n.position, n.id`,
  )
    .bind(EDITION_ID)
    .all();
  return json({ ok: true, nominees: results });
}

async function saveNominee(env: Env, request: Request, actor: string, id: number | null): Promise<Response> {
  const b = await readJson<Record<string, unknown>>(request);
  const row = {
    category_id: int(b.category_id, "categoría", 1, 1e9),
    slug: slugOf(b.slug, "slug"),
    name: str(b.name, "nombre", 120, true),
    subtitle: str(b.subtitle, "subtítulo", 160),
    reason: str(b.reason, "motivo de la nominación", 600),
    bio: str(b.bio, "presentación", 6000),
    merits: str(b.merits, "méritos", 4000),
    links: str(b.links, "enlaces", 2000),
    photo_portrait: mediaUrl(b.photo_portrait, "foto 4:5"),
    photo_square: mediaUrl(b.photo_square, "foto 1:1"),
    photo_wide: mediaUrl(b.photo_wide, "foto horizontal"),
    photo_alt: str(b.photo_alt, "texto alternativo", 300),
    photo_credit: str(b.photo_credit, "crédito", 160),
    published: bool(b.published),
    is_alternate: bool(b.is_alternate),
    position: int(b.position ?? 0, "orden", 0, 1000),
  };
  if (row.is_alternate) row.published = 0; // una alternativa nunca es pública
  const cat = await env.DB.prepare("SELECT id FROM categories WHERE id = ?1 AND edition_id = ?2").bind(row.category_id, EDITION_ID).first();
  if (!cat) throw new HttpError(400, "invalid_field", "La categoría no existe.");
  const before = id ? await env.DB.prepare("SELECT * FROM nominees WHERE id = ?1").bind(id).first<NomineeRow>() : null;
  if (id && !before) throw new HttpError(404, "not_found");
  if (before && before.category_id !== row.category_id) {
    const votes = await env.DB.prepare("SELECT COUNT(*) AS n FROM votes WHERE nominee_id = ?1").bind(id).first<{ n: number }>();
    if ((votes?.n ?? 0) > 0) throw new HttpError(409, "has_votes", "La candidatura tiene votos: no puede cambiar de categoría.");
  }
  const now = new Date().toISOString();
  try {
    if (id) {
      await env.DB.prepare(
        `UPDATE nominees SET category_id=?1, slug=?2, name=?3, subtitle=?4, reason=?5, bio=?6, merits=?7, links=?8, photo_portrait=?9,
         photo_square=?10, photo_wide=?11, photo_alt=?12, photo_credit=?13, published=?14, is_alternate=?15, position=?16, updated_at=?17 WHERE id=?18`,
      )
        .bind(row.category_id, row.slug, row.name, row.subtitle, row.reason, row.bio, row.merits, row.links, row.photo_portrait, row.photo_square, row.photo_wide, row.photo_alt, row.photo_credit, row.published, row.is_alternate, row.position, now, id)
        .run();
    } else {
      const r = await env.DB.prepare(
        `INSERT INTO nominees (category_id, slug, name, subtitle, reason, bio, merits, links, photo_portrait, photo_square, photo_wide, photo_alt, photo_credit, published, is_alternate, position)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16) RETURNING id`,
      )
        .bind(row.category_id, row.slug, row.name, row.subtitle, row.reason, row.bio, row.merits, row.links, row.photo_portrait, row.photo_square, row.photo_wide, row.photo_alt, row.photo_credit, row.published, row.is_alternate, row.position)
        .first<{ id: number }>();
      id = r?.id ?? null;
    }
  } catch (e) {
    if (/UNIQUE/i.test(String(e))) throw new HttpError(409, "slug_taken", "Ya existe una candidatura con esa dirección (slug).");
    throw e;
  }
  await audit(env.DB, { actor, action: before ? "nominee.update" : "nominee.create", entity: "nominee", entity_id: id, reason: str(b.reason_change, "motivo", 500), before, after: row });
  return json({ ok: true, id });
}

async function deleteNominee(env: Env, request: Request, actor: string, id: number): Promise<Response> {
  const body = await readJson<{ reason?: unknown }>(request).catch(() => ({ reason: undefined }));
  const reason = reasonOf(body.reason);
  const votes = await env.DB.prepare("SELECT COUNT(*) AS n FROM votes WHERE nominee_id = ?1").bind(id).first<{ n: number }>();
  if ((votes?.n ?? 0) > 0) throw new HttpError(409, "has_votes", "La candidatura tiene votos: despublícala en lugar de eliminarla.");
  const before = await env.DB.prepare("SELECT * FROM nominees WHERE id = ?1").bind(id).first();
  if (!before) throw new HttpError(404, "not_found");
  await env.DB.batch([
    env.DB.prepare("UPDATE categories SET winner_nominee_id = NULL WHERE winner_nominee_id = ?1").bind(id),
    env.DB.prepare("DELETE FROM nominees WHERE id = ?1").bind(id),
  ]);
  await audit(env.DB, { actor, action: "nominee.delete", entity: "nominee", entity_id: id, reason, before });
  return json({ ok: true });
}

async function setWinner(env: Env, request: Request, actor: string, categoryId: number): Promise<Response> {
  const b = await readJson<{ nominee_id?: unknown; public_reason?: unknown; reason?: unknown }>(request);
  const reason = reasonOf(b.reason);
  const nomineeId = b.nominee_id === null || b.nominee_id === undefined ? null : int(b.nominee_id, "candidatura", 1, 1e9);
  const cat = await env.DB.prepare("SELECT * FROM categories WHERE id = ?1").bind(categoryId).first<CategoryRow>();
  if (!cat) throw new HttpError(404, "not_found");
  if (nomineeId) {
    const n = await env.DB.prepare("SELECT category_id, published, is_alternate FROM nominees WHERE id = ?1").bind(nomineeId).first<NomineeRow>();
    if (!n || n.category_id !== categoryId) throw new HttpError(400, "invalid_field", "La candidatura no pertenece a esta categoría.");
    if (n.is_alternate || !n.published) throw new HttpError(400, "invalid_field", "La candidatura debe estar publicada (en las categorías sin votación no se muestra hasta el palmarés).");
  }
  const publicReason = str(b.public_reason, "motivo público", 1000);
  await env.DB.prepare("UPDATE categories SET winner_nominee_id = ?1, winner_reason = ?2, updated_at = ?3 WHERE id = ?4")
    .bind(nomineeId, publicReason, new Date().toISOString(), categoryId)
    .run();
  await audit(env.DB, {
    actor,
    action: "winner.set",
    entity: "category",
    entity_id: categoryId,
    reason,
    before: { winner_nominee_id: cat.winner_nominee_id, winner_reason: cat.winner_reason },
    after: { winner_nominee_id: nomineeId, winner_reason: publicReason },
  });
  return json({ ok: true });
}

/* ------------------------------------------------------------------ */
/* Resultados y fraude                                                 */
/* ------------------------------------------------------------------ */

async function results(env: Env): Promise<Response> {
  const [{ results: rows }, { results: totals }, { results: daily }] = await Promise.all([
    env.DB.prepare(
      `SELECT c.id AS category_id, c.name AS category, c.color, c.winner_nominee_id, n.id AS nominee_id, n.name AS nominee,
              SUM(CASE WHEN b.status = 'valid' THEN 1 ELSE 0 END) AS valid,
              SUM(CASE WHEN b.status = 'review' THEN 1 ELSE 0 END) AS review,
              SUM(CASE WHEN b.status = 'annulled' THEN 1 ELSE 0 END) AS annulled
       FROM categories c
       JOIN nominees n ON n.category_id = c.id AND n.is_alternate = 0
       LEFT JOIN votes v ON v.nominee_id = n.id
       LEFT JOIN ballots b ON b.id = v.ballot_id
       WHERE c.edition_id = ?1 AND c.votable = 1
       GROUP BY c.id, n.id ORDER BY c.position, valid DESC, n.name`,
    )
      .bind(EDITION_ID)
      .all<{ category_id: number; category: string; color: string; winner_nominee_id: number | null; nominee_id: number; nominee: string; valid: number; review: number; annulled: number }>(),
    env.DB.prepare("SELECT status, COUNT(*) AS n FROM ballots WHERE edition_id = ?1 GROUP BY status").bind(EDITION_ID).all<{ status: string; n: number }>(),
    env.DB.prepare(
      "SELECT local_day AS day, SUM(status='valid') AS valid, SUM(status='review') AS review, SUM(status='annulled') AS annulled FROM ballots WHERE edition_id = ?1 GROUP BY local_day ORDER BY local_day",
    )
      .bind(EDITION_ID)
      .all(),
  ]);
  const categories = new Map<number, { id: number; name: string; color: string; winner_nominee_id: number | null; nominees: typeof rows; tie: boolean }>();
  for (const r of rows) {
    const c = categories.get(r.category_id) ?? { id: r.category_id, name: r.category, color: r.color, winner_nominee_id: r.winner_nominee_id, nominees: [], tie: false };
    c.nominees.push(r);
    categories.set(r.category_id, c);
  }
  for (const c of categories.values()) {
    const top = c.nominees[0]?.valid ?? 0;
    c.tie = top > 0 && c.nominees.filter((n) => n.valid === top).length > 1;
  }
  return json({ ok: true, totals: Object.fromEntries(totals.map((t) => [t.status, t.n])), daily, categories: [...categories.values()] });
}

function csvCell(v: unknown): string {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // evita inyección de fórmulas en hojas de cálculo
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function resultsCsv(env: Env, actor: string): Promise<Response> {
  const res = await results(env);
  const data = (await res.json()) as { categories: { name: string; nominees: { nominee: string; valid: number; review: number; annulled: number }[] }[] };
  const lines = [["categoria", "candidatura", "votos_validos", "votos_en_revision", "votos_anulados"].join(",")];
  for (const c of data.categories) for (const n of c.nominees) lines.push([c.name, n.nominee, n.valid, n.review, n.annulled].map(csvCell).join(","));
  await audit(env.DB, { actor, action: "results.export_csv" });
  return new Response("﻿" + lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="premios-infolinense-resultados-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

async function listBallots(env: Env, url: URL): Promise<Response> {
  const status = url.searchParams.get("status") ?? "review";
  if (!["valid", "review", "annulled"].includes(status)) throw new HttpError(400, "invalid_field");
  const { results } = await env.DB.prepare(
    `SELECT b.id, b.status, b.flags, b.created_at, b.local_day, substr(b.net_hash, 1, 10) AS net, substr(b.signal_hash, 1, 10) AS signal,
            substr(b.device_hash, 1, 10) AS device, b.review_reason, b.reviewed_by, b.reviewed_at,
            (SELECT COUNT(*) FROM ballots x WHERE x.net_hash = b.net_hash AND x.edition_id = b.edition_id) AS net_total,
            (SELECT group_concat(c.name || ': ' || n.name, ' · ') FROM votes v JOIN nominees n ON n.id = v.nominee_id JOIN categories c ON c.id = v.category_id WHERE v.ballot_id = b.id) AS selections
     FROM ballots b WHERE b.edition_id = ?1 AND b.status = ?2 ORDER BY b.net_hash, b.created_at DESC LIMIT 500`,
  )
    .bind(EDITION_ID, status)
    .all();
  const { results: hotNets } = await env.DB.prepare(
    `SELECT substr(net_hash, 1, 10) AS net, COUNT(*) AS total, SUM(status='review') AS review, SUM(status='annulled') AS annulled, MIN(created_at) AS first, MAX(created_at) AS last
     FROM ballots WHERE edition_id = ?1 GROUP BY net_hash HAVING COUNT(*) >= 3 ORDER BY total DESC LIMIT 30`,
  )
    .bind(EDITION_ID)
    .all();
  return json({ ok: true, ballots: results, networks: hotNets });
}

/** Cambios de estado de papeletas: siempre con motivo y responsable, y registrados en la auditoría. */
async function changeBallots(env: Env, request: Request, actor: string, action: string): Promise<Response> {
  const transitions: Record<string, { from: string[]; to: string }> = {
    annul: { from: ["valid", "review"], to: "annulled" },
    validate: { from: ["review"], to: "valid" },
    restore: { from: ["annulled"], to: "valid" },
  };
  const t = transitions[action];
  if (!t) throw new HttpError(404, "not_found");
  const b = await readJson<{ ids?: unknown; reason?: unknown }>(request);
  const reason = reasonOf(b.reason);
  if (!Array.isArray(b.ids) || b.ids.length === 0 || b.ids.length > 500) throw new HttpError(400, "invalid_field", "Selecciona entre 1 y 500 papeletas.");
  const ids = b.ids.map((x) => int(x, "papeleta", 1, 1e12));
  const now = new Date().toISOString();
  const placeholders = ids.map((_, i) => `?${i + 5}`).join(",");
  const fromList = t.from.map((s) => `'${s}'`).join(",");
  const { results: before } = await env.DB.prepare(`SELECT id, status FROM ballots WHERE id IN (${ids.map((_, i) => `?${i + 1}`).join(",")})`)
    .bind(...ids)
    .all<{ id: number; status: string }>();
  const res = await env.DB.prepare(
    `UPDATE ballots SET status = ?1, reviewed_at = ?2, reviewed_by = ?3, review_reason = ?4 WHERE status IN (${fromList}) AND id IN (${placeholders})`,
  )
    .bind(t.to, now, actor, reason, ...ids)
    .run();
  await audit(env.DB, { actor, action: `ballots.${action}`, entity: "ballot", entity_id: ids.join(",").slice(0, 900), reason, before, after: { status: t.to, changed: res.meta.changes } });
  return json({ ok: true, changed: res.meta.changes });
}

async function listEvents(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    "SELECT id, type, severity, substr(net_hash,1,10) AS net, substr(device_hash,1,10) AS device, detail, created_at FROM security_events ORDER BY id DESC LIMIT 300",
  ).all();
  const { results: summary } = await env.DB.prepare(
    "SELECT type, severity, COUNT(*) AS n, MAX(created_at) AS last FROM security_events GROUP BY type, severity ORDER BY n DESC",
  ).all();
  return json({ ok: true, events: results, summary });
}

/** Elimina las huellas técnicas de red y navegador (minimización de datos tras el periodo de reclamaciones). */
async function purgeTechnical(env: Env, request: Request, actor: string): Promise<Response> {
  const b = await readJson<{ reason?: unknown; confirm?: unknown }>(request);
  const reason = reasonOf(b.reason);
  if (b.confirm !== "PURGAR") throw new HttpError(400, "confirm_required", "Escribe PURGAR para confirmar.");
  const settings = await loadSettings(env.DB);
  if (currentPhase(settings) !== "winners") throw new HttpError(409, "too_early", "Solo puede hacerse tras publicar los ganadores.");
  const r = await env.DB.prepare("UPDATE ballots SET net_hash = NULL, signal_hash = NULL WHERE edition_id = ?1").bind(EDITION_ID).run();
  await env.DB.prepare("DELETE FROM security_events").run();
  await audit(env.DB, { actor, action: "privacy.purge_technical", reason, after: { ballots: r.meta.changes } });
  return json({ ok: true, changed: r.meta.changes });
}

/* ------------------------------------------------------------------ */
/* Patrocinadores, páginas y auditoría                                 */
/* ------------------------------------------------------------------ */

async function listSponsors(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare("SELECT * FROM sponsors ORDER BY position, id").all();
  return json({ ok: true, sponsors: results });
}

async function saveSponsor(env: Env, request: Request, actor: string, id: number | null): Promise<Response> {
  const b = await readJson<Record<string, unknown>>(request);
  const url = str(b.url, "web", 300);
  if (url && !/^https?:\/\//.test(url)) throw new HttpError(400, "invalid_field", "La web debe empezar por https://");
  const row = {
    name: str(b.name, "nombre", 120, true),
    logo_url: mediaUrl(b.logo_url, "logotipo"),
    url,
    tier: str(b.tier, "tipo de colaboración", 80),
    position: int(b.position ?? 0, "orden", 0, 1000),
    published: bool(b.published),
  };
  const before = id ? await env.DB.prepare("SELECT * FROM sponsors WHERE id = ?1").bind(id).first() : null;
  if (id) {
    if (!before) throw new HttpError(404, "not_found");
    await env.DB.prepare("UPDATE sponsors SET name=?1, logo_url=?2, url=?3, tier=?4, position=?5, published=?6, updated_at=?7 WHERE id=?8")
      .bind(row.name, row.logo_url, row.url, row.tier, row.position, row.published, new Date().toISOString(), id)
      .run();
  } else {
    const r = await env.DB.prepare("INSERT INTO sponsors (name, logo_url, url, tier, position, published) VALUES (?1,?2,?3,?4,?5,?6) RETURNING id")
      .bind(row.name, row.logo_url, row.url, row.tier, row.position, row.published)
      .first<{ id: number }>();
    id = r?.id ?? null;
  }
  await audit(env.DB, { actor, action: before ? "sponsor.update" : "sponsor.create", entity: "sponsor", entity_id: id, before, after: row });
  return json({ ok: true, id });
}

async function deleteSponsor(env: Env, actor: string, id: number): Promise<Response> {
  const before = await env.DB.prepare("SELECT * FROM sponsors WHERE id = ?1").bind(id).first();
  if (!before) throw new HttpError(404, "not_found");
  await env.DB.prepare("DELETE FROM sponsors WHERE id = ?1").bind(id).run();
  await audit(env.DB, { actor, action: "sponsor.delete", entity: "sponsor", entity_id: id, before });
  return json({ ok: true });
}

async function listPages(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare("SELECT * FROM pages ORDER BY position, slug").all();
  return json({ ok: true, pages: results });
}

async function savePage(env: Env, request: Request, actor: string, slug: string): Promise<Response> {
  const b = await readJson<Record<string, unknown>>(request, 128 * 1024);
  const before = await env.DB.prepare("SELECT * FROM pages WHERE slug = ?1").bind(slug).first();
  if (!before) throw new HttpError(404, "not_found");
  const status = b.status === "approved" ? "approved" : "draft";
  const row = { title: str(b.title, "título", 120, true), summary: str(b.summary, "resumen", 300), body: str(b.body, "contenido", 100_000, true), status };
  await env.DB.prepare("UPDATE pages SET title=?1, summary=?2, body=?3, status=?4, updated_at=?5, updated_by=?6 WHERE slug=?7")
    .bind(row.title, row.summary, row.body, row.status, new Date().toISOString(), actor, slug)
    .run();
  await audit(env.DB, { actor, action: "page.update", entity: "page", entity_id: slug, before, after: row });
  return json({ ok: true });
}

async function listAudit(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    "SELECT id, actor, action, entity, entity_id, reason, created_at, before_json, after_json FROM audit_log ORDER BY id DESC LIMIT 300",
  ).all();
  return json({ ok: true, entries: results });
}
