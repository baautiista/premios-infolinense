import type { CategoriesData, HomeData, PublicCategory, SiteInfo, Sponsor } from "../../shared/types";
import { formatMadrid, formatMadridDay } from "../../shared/time";
import { BrandCurve, CategoryTag, Countdown, Logo, NominationDisclaimer, Portrait, Section } from "../components/brand";
import { Link } from "../nav";

function heroCountdown(site: SiteInfo): { target: string; label: string } | null {
  const p = site.phase;
  if (p.phase === "coming_soon" && p.announce_at) return { target: p.announce_at, label: "Presentación de las candidaturas" };
  if (p.phase === "nominations" && p.voting_opens_at) return { target: p.voting_opens_at, label: "Apertura de las votaciones" };
  if (p.phase === "voting" && p.voting_closes_at) return { target: p.voting_closes_at, label: "Cierre de las votaciones" };
  if (p.phase === "closed" && p.results_at) return { target: p.results_at, label: "Publicación de los ganadores" };
  return null;
}

export function PhaseCallout({ site }: { site: SiteInfo }) {
  const p = site.phase;
  const box = "rounded-3xl bg-night/45 px-5 py-4 text-[1.02rem] leading-snug ring-1 ring-white/15";
  switch (p.phase) {
    case "coming_soon":
      return (
        <p className={box}>
          Las candidaturas se presentan oficialmente el <strong>25 de noviembre de 2026</strong>.
        </p>
      );
    case "nominations":
      return (
        <p className={box}>
          {p.voting_opens_at ? (
            <>
              La votación popular se abrirá el <strong>{formatMadrid(p.voting_opens_at)}</strong>.
            </>
          ) : (
            <>Ya puedes conocer a todas las candidaturas. Muy pronto anunciaremos la fecha de la votación.</>
          )}
        </p>
      );
    case "voting":
      return (
        <p className={box}>
          <span className="mr-2 inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-lime align-middle" aria-hidden="true" />
          Votaciones abiertas{p.voting_closes_at ? <> hasta el <strong>{formatMadrid(p.voting_closes_at)}</strong></> : null}.
        </p>
      );
    case "closed":
      return <p className={box}>Votaciones finalizadas. Próximamente conoceremos a los ganadores.</p>;
    case "winners":
      return <p className={box}>Ya conocemos a los ganadores de la I edición de los Premios InfoLinense.</p>;
  }
}

export function HomePage({ data, site }: { data: HomeData; site: SiteInfo }) {
  const countdown = heroCountdown(site);
  const phase = site.phase.phase;
  const nominationsOut = phase !== "coming_soon";
  const showMosaic = data.mosaic.length >= 3;

  return (
    <>
      {/* PORTADA */}
      <div className="relative overflow-hidden">
        <BrandCurve draw className="absolute -left-[22vw] top-[18vh] h-[120vh] w-[120vw] max-w-none sm:-left-24 sm:top-24 sm:h-[115vh] sm:w-[85vw]" />
        <Section className="relative grid items-center gap-12 pt-6 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:pt-10 lg:pb-24">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="w-[min(88vw,34rem)]">
              <Logo animate priority />
            </div>
            <h1 className="display anim-rise anim-delay-1 mt-10 max-w-[15ch] text-[clamp(2.5rem,8.4vw,4.9rem)]">
              Hay gente que hace grande a <span className="whitespace-nowrap text-lime">La Línea.</span>
            </h1>
            <p className="anim-rise anim-delay-2 mt-6 max-w-[36ch] text-[clamp(1.08rem,3.4vw,1.32rem)] leading-snug text-white/90">
              Queremos reconocer a quienes destacan en el deporte, crean arte, ponen en marcha negocios y movilizan a sus barrios.
            </p>
            <div className="anim-rise anim-delay-3 mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row lg:items-start">
              {phase === "winners" ? (
                <>
                  <Link href="/ganadores" className="btn btn-lime w-full sm:w-auto">
                    Descubre a los ganadores
                  </Link>
                  <Link href="/palmares" className="btn btn-ghost w-full sm:w-auto">
                    Palmarés
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/categorias" className="btn btn-primary w-full sm:w-auto">
                    Conoce a los nominados
                  </Link>
                  {phase === "voting" && (
                    <Link href="/votar" className="btn btn-lime w-full sm:w-auto">
                      Vota a tus favoritos
                    </Link>
                  )}
                </>
              )}
            </div>
            {countdown && (
              <div className="anim-rise anim-delay-3 mt-10">
                <Countdown target={countdown.target} label={countdown.label} />
              </div>
            )}
          </div>

          {/* Composición: retratos de candidaturas si hay fotografías; si no, la cascada de etiquetas oficiales. */}
          <div aria-hidden={!showMosaic} className="relative mx-auto w-full max-w-md lg:max-w-none">
            {showMosaic ? (
              <ul className="grid grid-cols-3 gap-3" aria-label="Algunas candidaturas">
                {data.mosaic.slice(0, 6).map((n, i) => {
                  const cat = data.categories.find((c) => c.id === n.category_id);
                  return (
                    <li key={n.id} className={i % 3 === 1 ? "translate-y-8" : i % 3 === 2 ? "translate-y-3" : ""}>
                      <Link href={`/nominados/${n.slug}`} aria-label={n.name}>
                        <Portrait nominee={n} color={cat?.color ?? "#1F5EFF"} sizes="18vw" className="rounded-[1.1rem]" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <TagCascade categories={data.categories} />
            )}
          </div>
        </Section>
      </div>

      <Section className="-mt-4">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <PhaseCallout site={site} />
        </div>
      </Section>

      {/* CÓMO FUNCIONA */}
      <Section className="mt-24" id="como-funciona">
        <p className="kicker text-mist">El certamen</p>
        <h2 className="display mt-3 max-w-[18ch] text-[clamp(2rem,6vw,3.4rem)]">Así funcionan los premios</h2>
        <ol className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              t: "Candidaturas",
              d: `Se presentan el 25 de noviembre de 2026. ${nominationsOut ? `${data.totalNominees} candidaturas en ${data.categories.filter((c) => c.votable).length} categorías.` : ""}`,
            },
            {
              t: "Votación popular",
              d: "El público elige a los ganadores desde esta web: una papeleta por persona, sin registrarse.",
            },
            {
              t: "Resultados digitales",
              d: "No hay gala presencial: los ganadores se anuncian aquí, en una presentación digital.",
            },
            {
              t: "Un trofeo por premio",
              d: "Cada candidatura ganadora recibe un trofeo físico como recuerdo del reconocimiento.",
            },
          ].map((s, i) => (
            <li key={s.t} className="relative border-t-2 border-white/25 pt-5">
              <span className="display text-5xl text-lime" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="mt-3 text-xl font-extrabold">{s.t}</h3>
              <p className="mt-2 leading-relaxed text-white/85">{s.d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <NominationDisclaimer random={site.random_order} className="max-w-xl" />
          <Link href="/sistema-de-votacion" className="font-semibold underline decoration-lime decoration-2">
            Cómo protegemos la votación
          </Link>
        </div>
      </Section>

      {/* CATEGORÍAS */}
      <Section className="mt-28" id="categorias">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker text-mist">Las categorías</p>
            <h2 className="display mt-3 text-[clamp(2rem,6vw,3.4rem)]">Los reconocimientos de 2026</h2>
          </div>
          <Link href="/categorias" className="btn btn-ghost">
            Ver todas
          </Link>
        </div>
        <CategoryList categories={data.categories} showCounts={nominationsOut} />
      </Section>

      {data.sponsors.length > 0 && <Sponsors sponsors={data.sponsors} />}

      {phase === "coming_soon" && site.phase.announce_at && (
        <Section className="mt-20">
          <p className="text-sm text-mist">Presentación de candidaturas: {formatMadridDay(site.phase.announce_at)}.</p>
        </Section>
      )}
    </>
  );
}

/** Etiquetas oficiales en cascada: composición de la portada mientras no haya retratos. */
function TagCascade({ categories }: { categories: PublicCategory[] }) {
  const offsets = ["ml-0", "ml-10", "ml-4", "ml-16", "ml-2", "ml-12", "ml-6", "ml-14", "ml-1", "ml-9", "ml-5", "ml-11"];
  return (
    <ul className="flex flex-col items-start gap-2.5 sm:gap-3">
      {categories.map((c, i) => (
        <li key={c.id} className={`${offsets[i % offsets.length]} anim-rise`} style={{ animationDelay: `${0.25 + i * 0.06}s` }}>
          <Link href={`/categorias/${c.slug}`} tabIndex={-1}>
            <CategoryTag category={c} size="lg" className="shadow-[0_12px_30px_-12px_rgba(0,0,0,0.5)]" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Lista editorial de categorías: bloques grandes con su color identificativo. */
export function CategoryList({ categories, showCounts }: { categories: PublicCategory[]; showCounts: boolean }) {
  return (
    <ol className="mt-12 border-t border-white/20">
      {categories.map((c, i) => (
        <li key={c.id} className="border-b border-white/20">
          <Link
            href={`/categorias/${c.slug}`}
            className="group relative grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 py-8 transition sm:gap-x-8 md:grid-cols-[5rem_1fr_auto] md:items-center md:py-10"
          >
            <span
              className="absolute inset-y-0 -left-5 w-1.5 origin-top scale-y-0 rounded-full transition duration-300 group-hover:scale-y-100 sm:-left-8"
              style={{ background: c.color }}
              aria-hidden="true"
            />
            <span className="display pt-1 text-[clamp(1.6rem,5vw,2.6rem)] text-white/35 tabular-nums" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <CategoryTag category={c} size="md" />
              <h3 className="display mt-3 text-[clamp(1.75rem,5.6vw,3.1rem)] transition group-hover:translate-x-1">
                {c.award_title ?? c.name}
              </h3>
              {c.question && <p className="mt-2 max-w-2xl text-[1.02rem] leading-snug text-white/80">{c.question}</p>}
              {c.description && <p className="mt-2 max-w-2xl text-[0.98rem] font-semibold leading-snug text-white">{c.description}</p>}
              {c.nomination_note && <p className="mt-2 max-w-2xl text-sm text-mist">{c.nomination_note}</p>}
            </div>
            <span className="col-span-2 flex items-center gap-3 text-sm font-semibold text-mist md:col-span-1 md:justify-end">
              {!c.votable ? "Elige la redacción" : showCounts ? (c.nominee_count ? `${c.nominee_count} candidaturas` : "Candidaturas pendientes") : `${c.slots} candidaturas`}
              <span
                className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-white/30 transition group-hover:bg-white group-hover:text-navy"
                aria-hidden="true"
              >
                →
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export function CategoriesPage({ data, site }: { data: CategoriesData; site: SiteInfo }) {
  return (
    <Section className="pt-8">
      <p className="kicker text-mist">I edición · 2026</p>
      <h1 className="display mt-3 text-[clamp(2.6rem,9vw,5rem)]">Categorías</h1>
      <p className="mt-5 max-w-2xl text-lg leading-snug text-white/85">
        {data.categories.filter((c) => c.votable).length} categorías con votación popular
        {data.categories.some((c) => !c.votable) ? " y un reconocimiento especial de la redacción de InfoLinense" : ""}.
      </p>
      <CategoryList categories={data.categories} showCounts={site.phase.phase !== "coming_soon"} />
      <NominationDisclaimer random={site.random_order} className="mt-8" />
    </Section>
  );
}

function Sponsors({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <Section className="mt-28">
      <div className="rounded-[2rem] bg-white/[0.06] px-6 py-10 ring-1 ring-white/10 sm:px-10">
        <p className="kicker text-center text-mist">Con el patrocinio de</p>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {sponsors.map((s) => {
            const inner = s.logo_url ? (
              <img src={s.logo_url} alt={s.name} className="h-12 w-auto max-w-[10rem] object-contain sm:h-14" loading="lazy" />
            ) : (
              <span className="text-lg font-bold">{s.name}</span>
            );
            return (
              <li key={s.id} className="flex flex-col items-center gap-2">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer sponsored" className="opacity-90 transition hover:opacity-100">
                    {inner}
                  </a>
                ) : (
                  inner
                )}
                {s.tier && <span className="text-xs text-mist">{s.tier}</span>}
              </li>
            );
          })}
        </ul>
        <p className="mt-8 text-center text-xs text-mist">Los patrocinadores no intervienen en las candidaturas, la votación ni los resultados.</p>
      </div>
    </Section>
  );
}
