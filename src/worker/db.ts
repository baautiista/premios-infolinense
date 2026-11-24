import { effectivePhase, isPhase, type Phase, type PhaseSettings } from "../shared/phase";
import type { PublicCategory, PublicNominee, Sponsor } from "../shared/types";

export const EDITION_ID = 1;

export interface Settings extends PhaseSettings {
  nominee_order: "random" | "manual" | "alpha";
  soft_network_limit: number;
  hard_network_limit: number;
  contact_email: string | null;
  instagram_url: string | null;
}

export const SETTING_KEYS = [
  "phase",
  "announce_at",
  "voting_opens_at",
  "voting_closes_at",
  "results_at",
  "nominee_order",
  "soft_network_limit",
  "hard_network_limit",
  "contact_email",
  "instagram_url",
] as const;

export async function loadSettings(db: D1Database): Promise<Settings> {
  const { results } = await db.prepare("SELECT key, value FROM settings").all<{ key: string; value: string | null }>();
  const m = new Map(results.map((r) => [r.key, r.value]));
  const int = (k: string, d: number) => {
    const n = Number.parseInt(m.get(k) ?? "", 10);
    return Number.isFinite(n) && n >= 0 ? n : d;
  };
  const order = m.get("nominee_order");
  const phase = m.get("phase");
  return {
    phase: isPhase(phase) ? phase : "coming_soon",
    announce_at: m.get("announce_at") || null,
    voting_opens_at: m.get("voting_opens_at") || null,
    voting_closes_at: m.get("voting_closes_at") || null,
    results_at: m.get("results_at") || null,
    nominee_order: order === "manual" || order === "alpha" ? order : "random",
    soft_network_limit: int("soft_network_limit", 4),
    hard_network_limit: int("hard_network_limit", 40),
    contact_email: m.get("contact_email") || null,
    instagram_url: m.get("instagram_url") || null,
  };
}

export function currentPhase(s: Settings, now = Date.now()): Phase {
  return effectivePhase(s, now);
}

/* ------------------------------------------------------------------ */

export interface CategoryRow {
  id: number;
  edition_id: number;
  slug: string;
  name: string;
  award_title: string | null;
  question: string | null;
  description: string | null;
  nomination_note: string | null;
  color: string;
  ink: string;
  slots: number;
  votable: number;
  published: number;
  position: number;
  winner_nominee_id: number | null;
  winner_reason: string | null;
}

export interface NomineeRow {
  id: number;
  category_id: number;
  slug: string;
  name: string;
  subtitle: string | null;
  reason: string | null;
  bio: string | null;
  merits: string | null;
  links: string | null;
  photo_portrait: string | null;
  photo_square: string | null;
  photo_wide: string | null;
  photo_alt: string | null;
  photo_credit: string | null;
  published: number;
  is_alternate: number;
  position: number;
}

export function toPublicCategory(c: CategoryRow, nomineeCount: number): PublicCategory {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    award_title: c.award_title,
    question: c.question,
    description: c.description,
    nomination_note: c.nomination_note,
    color: c.color,
    ink: c.ink,
    slots: c.slots,
    votable: c.votable === 1,
    position: c.position,
    nominee_count: nomineeCount,
  };
}

const SAFE_URL = /^https?:\/\//i;

export function toPublicNominee(n: NomineeRow): PublicNominee {
  return {
    id: n.id,
    slug: n.slug,
    name: n.name,
    subtitle: n.subtitle,
    reason: n.reason,
    bio: n.bio,
    merits: (n.merits ?? "")
      .split("\n")
      .map((l) => l.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean),
    links: (n.links ?? "")
      .split("\n")
      .map((l) => {
        const [label, url] = l.includes("|") ? l.split("|").map((x) => x.trim()) : [l.trim(), l.trim()];
        return { label: label || url, url };
      })
      .filter((l) => SAFE_URL.test(l.url)),
    photo_portrait: n.photo_portrait,
    photo_square: n.photo_square,
    photo_wide: n.photo_wide,
    photo_alt: n.photo_alt,
    photo_credit: n.photo_credit,
    category_id: n.category_id,
  };
}

/** Candidaturas visibles: publicadas y no alternativas. */
export const VISIBLE_NOMINEE = "n.published = 1 AND n.is_alternate = 0";

export async function publishedCategories(db: D1Database): Promise<CategoryRow[]> {
  const { results } = await db
    .prepare("SELECT * FROM categories WHERE edition_id = ?1 AND published = 1 ORDER BY position, id")
    .bind(EDITION_ID)
    .all<CategoryRow>();
  return results;
}

export async function visibleNominees(db: D1Database): Promise<NomineeRow[]> {
  const { results } = await db
    .prepare(
      `SELECT n.* FROM nominees n JOIN categories c ON c.id = n.category_id
       WHERE c.edition_id = ?1 AND c.published = 1 AND ${VISIBLE_NOMINEE}
       ORDER BY n.category_id, n.position, n.id`,
    )
    .bind(EDITION_ID)
    .all<NomineeRow>();
  return results;
}

/** Orden de presentación: aleatorio en cada visita (por defecto), manual o alfabético. */
export function orderNominees<T extends { name: string; position?: number }>(list: T[], mode: Settings["nominee_order"]): T[] {
  const copy = [...list];
  if (mode === "alpha") return copy.sort((a, b) => a.name.localeCompare(b.name, "es"));
  if (mode === "manual") return copy.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  for (let i = copy.length - 1; i > 0; i--) {
    const r = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [copy[i], copy[r]] = [copy[r], copy[i]];
  }
  return copy;
}

export async function publishedSponsors(db: D1Database): Promise<Sponsor[]> {
  const { results } = await db
    .prepare("SELECT id, name, logo_url, url, tier FROM sponsors WHERE published = 1 ORDER BY position, id")
    .all<Sponsor>();
  return results;
}

export async function audit(
  db: D1Database,
  e: { actor: string; action: string; entity?: string; entity_id?: string | number | null; reason?: string | null; before?: unknown; after?: unknown },
) {
  await db
    .prepare(
      "INSERT INTO audit_log (actor, action, entity, entity_id, reason, before_json, after_json) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
    )
    .bind(
      e.actor,
      e.action,
      e.entity ?? null,
      e.entity_id == null ? null : String(e.entity_id),
      e.reason ?? null,
      e.before === undefined ? null : JSON.stringify(e.before),
      e.after === undefined ? null : JSON.stringify(e.after),
    )
    .run();
}
