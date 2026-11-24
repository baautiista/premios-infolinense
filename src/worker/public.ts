import { nominationsVisible, type Phase } from "../shared/phase";
import type {
  CategoriesData,
  CategoryData,
  HomeData,
  InfoPageData,
  NomineeData,
  PublicCategory,
  PublicNominee,
  RouteName,
  RoutePayload,
  SiteInfo,
  VoteData,
  Winner,
  WinnerData,
  WinnersData,
} from "../shared/types";
import {
  currentPhase,
  loadSettings,
  orderNominees,
  publishedCategories,
  publishedSponsors,
  toPublicCategory,
  toPublicNominee,
  visibleNominees,
  type CategoryRow,
  type NomineeRow,
  type Settings,
} from "./db";
import type { Env } from "./env";

export const DEFAULT_OG = "/brand/og-premios-infolinense.jpg";
const SITE_NAME = "Premios InfoLinense 2026";
const DEFAULT_DESCRIPTION =
  "Premios InfoLinense 2026: reconocimientos a quienes hacen grande a La Línea de la Concepción. Conoce a los nominados y vota a tus favoritos.";

interface Ctx {
  env: Env;
  settings: Settings;
  phase: Phase;
  site: SiteInfo;
  path: string;
}

async function siteInfo(env: Env, settings: Settings, phase: Phase): Promise<SiteInfo> {
  const { results } = await env.DB.prepare("SELECT slug, title FROM pages ORDER BY position, slug").all<{ slug: string; title: string }>();
  return {
    phase: {
      phase,
      announce_at: settings.announce_at,
      voting_opens_at: settings.voting_opens_at,
      voting_closes_at: settings.voting_closes_at,
      // La fecha de resultados solo se comunica; los ganadores siguen ocultos hasta entonces.
      results_at: settings.results_at,
    },
    contact_email: settings.contact_email,
    instagram_url: settings.instagram_url,
    footer_pages: results,
    turnstile_site_key: env.TURNSTILE_SITE_KEY || null,
    random_order: settings.nominee_order === "random",
    now: Date.now(),
  };
}

function page<D>(ctx: Ctx, route: RouteName, data: D, meta: RoutePayload["meta"], status = 200): RoutePayload<D> {
  return { route, path: ctx.path, status, site: ctx.site, data, meta };
}

function notFound(ctx: Ctx): RoutePayload<null> {
  return page(ctx, "not_found", null, { title: `Página no encontrada · ${SITE_NAME}`, description: DEFAULT_DESCRIPTION, noindex: true }, 404);
}

/** Candidaturas públicas por categoría. Las categorías sin votación no muestran candidaturas antes del palmarés. */
function groupNominees(categories: CategoryRow[], nominees: NomineeRow[], phase: Phase) {
  const byCat = new Map<number, NomineeRow[]>();
  for (const n of nominees) {
    const c = categories.find((x) => x.id === n.category_id);
    if (!c) continue;
    if (!c.votable && !(phase === "winners" && c.winner_nominee_id === n.id)) continue;
    if (!nominationsVisible(phase)) continue;
    const list = byCat.get(n.category_id) ?? [];
    list.push(n);
    byCat.set(n.category_id, list);
  }
  return byCat;
}

async function base(env: Env) {
  const [categories, nominees] = await Promise.all([publishedCategories(env.DB), visibleNominees(env.DB)]);
  return { categories, nominees };
}

function winnersFrom(categories: CategoryRow[], byCat: Map<number, NomineeRow[]>, settings: Settings): Winner[] {
  return categories
    .filter((c) => c.winner_nominee_id)
    .map((c) => {
      const list = byCat.get(c.id) ?? [];
      const winner = list.find((n) => n.id === c.winner_nominee_id);
      return {
        category: toPublicCategory(c, list.length),
        nominees: orderNominees(list, settings.nominee_order).map(toPublicNominee),
        winner: winner ? toPublicNominee(winner) : null,
        reason: c.winner_reason,
      };
    })
    .filter((w) => w.winner)
    // El reconocimiento de la redacción cierra la presentación.
    .sort((a, b) => Number(b.category.votable) - Number(a.category.votable) || a.category.position - b.category.position);
}

export async function loadRoute(env: Env, url: URL): Promise<RoutePayload<unknown>> {
  const settings = await loadSettings(env.DB);
  const phase = currentPhase(settings);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const ctx: Ctx = { env, settings, phase, site: await siteInfo(env, settings, phase), path };
  const seg = path.split("/").filter(Boolean).map((s) => decodeURIComponent(s));

  if (path === "/") return home(ctx);
  if (seg[0] === "categorias" && seg.length === 1) return categoriesPage(ctx);
  if (seg[0] === "categorias" && seg.length === 2) return categoryPage(ctx, seg[1]);
  if (seg[0] === "nominados" && seg.length === 2) return nomineePage(ctx, seg[1]);
  if (seg[0] === "votar" && seg.length === 1) return votePage(ctx);
  if (seg[0] === "comprobante" && seg.length === 1)
    return page(ctx, "receipt", null, { title: `Comprobar papeleta · ${SITE_NAME}`, description: "Comprueba que tu papeleta está registrada.", noindex: true });
  if (seg[0] === "ganadores" && seg.length === 1) return winnersPage(ctx, "winners");
  if (seg[0] === "palmares" && seg.length === 1) return winnersPage(ctx, "palmares");
  if (seg[0] === "ganadores" && seg.length === 2) return winnerPage(ctx, seg[1]);
  if (seg.length === 1 && /^[a-z0-9-]{2,60}$/.test(seg[0])) return infoPage(ctx, seg[0]);
  return notFound(ctx);
}

async function home(ctx: Ctx): Promise<RoutePayload<HomeData>> {
  const { categories, nominees } = await base(ctx.env);
  const byCat = groupNominees(categories, nominees, ctx.phase);
  const visible = [...byCat.values()].flat();
  const withPhoto = visible.filter((n) => n.photo_portrait || n.photo_square);
  const mosaic = orderNominees(withPhoto, "random").slice(0, 7).map(toPublicNominee);
  return page(
    ctx,
    "home",
    {
      categories: categories.map((c) => toPublicCategory(c, (byCat.get(c.id) ?? []).length)),
      mosaic,
      sponsors: await publishedSponsors(ctx.env.DB),
      totalNominees: visible.length,
    },
    { title: `${SITE_NAME} · Hay gente que hace grande a La Línea`, description: DEFAULT_DESCRIPTION, image: DEFAULT_OG, canonical: "/" },
  );
}

async function categoriesPage(ctx: Ctx): Promise<RoutePayload<CategoriesData>> {
  const { categories, nominees } = await base(ctx.env);
  const byCat = groupNominees(categories, nominees, ctx.phase);
  return page(
    ctx,
    "categories",
    { categories: categories.map((c) => toPublicCategory(c, (byCat.get(c.id) ?? []).length)) },
    {
      title: `Categorías · ${SITE_NAME}`,
      description: "Las categorías de los Premios InfoLinense 2026 y sus candidaturas.",
      image: DEFAULT_OG,
      canonical: "/categorias",
    },
  );
}

async function categoryPage(ctx: Ctx, slug: string): Promise<RoutePayload<CategoryData | null>> {
  const { categories, nominees } = await base(ctx.env);
  const idx = categories.findIndex((c) => c.slug === slug);
  if (idx < 0) return notFound(ctx);
  const c = categories[idx];
  const byCat = groupNominees(categories, nominees, ctx.phase);
  const list = byCat.get(c.id) ?? [];
  const ordered = orderNominees(list, ctx.settings.nominee_order).map(toPublicNominee);
  const pub = toPublicCategory(c, list.length);
  const prev = categories[idx - 1];
  const next = categories[idx + 1];
  return page(
    ctx,
    "category",
    {
      category: pub,
      nominees: ordered,
      hidden: !nominationsVisible(ctx.phase),
      winnerId: ctx.phase === "winners" ? c.winner_nominee_id : null,
      prev: prev ? { slug: prev.slug, name: prev.name } : null,
      next: next ? { slug: next.slug, name: next.name } : null,
    },
    {
      title: `${c.name}${c.award_title ? ` · ${c.award_title}` : ""} · ${SITE_NAME}`,
      description: c.question ?? `Candidaturas de la categoría ${c.name} de los Premios InfoLinense 2026.`,
      image: ordered.find((n) => n.photo_wide)?.photo_wide ?? DEFAULT_OG,
      canonical: `/categorias/${c.slug}`,
    },
  );
}

async function nomineePage(ctx: Ctx, slug: string): Promise<RoutePayload<NomineeData | null>> {
  if (!nominationsVisible(ctx.phase)) return notFound(ctx);
  const { categories, nominees } = await base(ctx.env);
  const byCat = groupNominees(categories, nominees, ctx.phase);
  const n = [...byCat.values()].flat().find((x) => x.slug === slug);
  if (!n) return notFound(ctx);
  const c = categories.find((x) => x.id === n.category_id) as CategoryRow;
  const siblings = (byCat.get(c.id) ?? []).filter((x) => x.id !== n.id);
  const pub = toPublicNominee(n);
  const desc = n.reason ?? `${n.name}, candidatura a ${c.name} en los Premios InfoLinense 2026.`;
  return page(
    ctx,
    "nominee",
    {
      nominee: pub,
      category: toPublicCategory(c, (byCat.get(c.id) ?? []).length),
      siblings: orderNominees(siblings, ctx.settings.nominee_order).map((s) => ({ slug: s.slug, name: s.name })),
      isWinner: ctx.phase === "winners" && c.winner_nominee_id === n.id,
    },
    {
      title: `${n.name} · ${c.name} · ${SITE_NAME}`,
      description: desc.slice(0, 200),
      image: pub.photo_wide ?? DEFAULT_OG,
      canonical: `/nominados/${n.slug}`,
    },
  );
}

async function votePage(ctx: Ctx): Promise<RoutePayload<VoteData>> {
  const { categories, nominees } = await base(ctx.env);
  const byCat = groupNominees(categories, nominees, ctx.phase);
  const data: VoteData = {
    categories: categories
      .filter((c) => c.votable && (byCat.get(c.id) ?? []).length >= 2)
      .map((c) => ({
        ...toPublicCategory(c, (byCat.get(c.id) ?? []).length),
        nominees: orderNominees(byCat.get(c.id) ?? [], ctx.settings.nominee_order).map(toPublicNominee),
      })),
  };
  return page(ctx, "vote", data, {
    title: `Vota · ${SITE_NAME}`,
    description: "Elige a tus favoritos en cada categoría de los Premios InfoLinense 2026.",
    image: DEFAULT_OG,
    canonical: "/votar",
  });
}

async function winnersPage(ctx: Ctx, route: "winners" | "palmares"): Promise<RoutePayload<WinnersData>> {
  const published = ctx.phase === "winners";
  let awards: Winner[] = [];
  if (published) {
    const { categories, nominees } = await base(ctx.env);
    awards = winnersFrom(categories, groupNominees(categories, nominees, ctx.phase), ctx.settings);
  }
  return page(ctx, route, { awards, published }, {
    title: route === "winners" ? `Descubre a los ganadores · ${SITE_NAME}` : `Palmarés · ${SITE_NAME}`,
    description: published ? "Ganadores de los Premios InfoLinense 2026." : "Los ganadores se publicarán en esta página en la fecha oficial.",
    image: DEFAULT_OG,
    canonical: route === "winners" ? "/ganadores" : "/palmares",
  });
}

async function winnerPage(ctx: Ctx, slug: string): Promise<RoutePayload<WinnerData | null>> {
  if (ctx.phase !== "winners") return notFound(ctx);
  const { categories, nominees } = await base(ctx.env);
  const award = winnersFrom(categories, groupNominees(categories, nominees, ctx.phase), ctx.settings).find(
    (w) => w.winner?.slug === slug,
  );
  if (!award || !award.winner) return notFound(ctx);
  return page(ctx, "winner", { award }, {
    title: `${award.winner.name}, ${award.category.name} · ${SITE_NAME}`,
    description: award.reason ?? `${award.winner.name} gana el premio ${award.category.name} de los Premios InfoLinense 2026.`,
    image: award.winner.photo_wide ?? DEFAULT_OG,
    canonical: `/ganadores/${slug}`,
  });
}

async function infoPage(ctx: Ctx, slug: string): Promise<RoutePayload<InfoPageData | null>> {
  const p = await ctx.env.DB.prepare("SELECT slug, title, summary, body, status, updated_at FROM pages WHERE slug = ?1")
    .bind(slug)
    .first<InfoPageData>();
  if (!p) return notFound(ctx);
  return page(ctx, "page", p, {
    title: `${p.title} · ${SITE_NAME}`,
    description: p.summary ?? p.title,
    image: DEFAULT_OG,
    canonical: `/${p.slug}`,
  });
}

/** Lista de URL para el sitemap. */
export async function sitemapPaths(env: Env): Promise<string[]> {
  const settings = await loadSettings(env.DB);
  const phase = currentPhase(settings);
  const { categories, nominees } = await base(env);
  const byCat = groupNominees(categories, nominees, phase);
  const { results: pages } = await env.DB.prepare("SELECT slug FROM pages").all<{ slug: string }>();
  const paths = ["/", "/categorias", ...categories.map((c) => `/categorias/${c.slug}`), ...pages.map((p) => `/${p.slug}`)];
  if (nominationsVisible(phase)) paths.push(...[...byCat.values()].flat().map((n) => `/nominados/${n.slug}`));
  if (phase === "voting") paths.push("/votar");
  if (phase === "winners") {
    paths.push("/ganadores", "/palmares");
    for (const w of winnersFrom(categories, byCat, settings)) if (w.winner) paths.push(`/ganadores/${w.winner.slug}`);
  }
  return paths;
}

export type { PublicCategory, PublicNominee };
