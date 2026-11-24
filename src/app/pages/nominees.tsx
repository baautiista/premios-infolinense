import { useState } from "react";
import type { CategoryData, NomineeData, PublicCategory, PublicNominee, SiteInfo } from "../../shared/types";
import { BrandCurve, CategoryTag, NominationDisclaimer, Portrait, Section } from "../components/brand";
import { Link } from "../nav";

function CategoryHeader({ category, level = 1 }: { category: PublicCategory; level?: 1 | 2 }) {
  const H = level === 1 ? "h1" : "h2";
  return (
    <header className="relative flex flex-col items-center text-center">
      <CategoryTag category={category} size="xl" />
      <H className="display mt-4 text-[clamp(2.3rem,8.5vw,4.8rem)]">{category.award_title ?? category.name}</H>
      {category.question && <p className="mt-4 max-w-[30ch] text-[clamp(1.1rem,3.6vw,1.45rem)] leading-snug text-white/90">{category.question}</p>}
      {category.nomination_note && <p className="mt-4 max-w-xl text-sm text-mist">{category.nomination_note}</p>}
    </header>
  );
}

export function NomineeCard({ nominee, category, isWinner = false, priority = false }: { nominee: PublicNominee; category: PublicCategory; isWinner?: boolean; priority?: boolean }) {
  return (
    <article className="group relative flex flex-col">
      <Link href={`/nominados/${nominee.slug}`} className="block rounded-[1.6rem]" aria-label={`${nominee.name}: ver candidatura`}>
        <Portrait
          nominee={nominee}
          color={category.color}
          priority={priority}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="transition duration-300 group-hover:-translate-y-1"
        />
      </Link>
      <div className="mt-3 flex items-start gap-2 sm:mt-4 sm:gap-3">
        <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: category.color }} aria-hidden="true" />
        <div className="min-w-0">
          <h3 className="display text-[clamp(1.15rem,4.8vw,1.65rem)] leading-tight">
            <Link href={`/nominados/${nominee.slug}`} className="hover:underline">
              {nominee.name}
            </Link>
          </h3>
          {nominee.subtitle && <p className="mt-0.5 font-semibold text-mist">{nominee.subtitle}</p>}
          {isWinner && <p className="tag mt-2 bg-lime text-[0.7rem] text-navy">Gana el premio</p>}
          {nominee.reason && <p className="mt-2 line-clamp-3 leading-snug text-white/85">{nominee.reason}</p>}
        </div>
      </div>
    </article>
  );
}

export function CategoryPage({ data, site }: { data: CategoryData; site: SiteInfo }) {
  const { category, nominees } = data;
  const voting = site.phase.phase === "voting" && category.votable;
  return (
    <>
      <div className="relative overflow-hidden pt-8 pb-14">
        <BrandCurve className="absolute -left-40 top-0 h-[60rem] w-[60rem] max-w-none" />
        <Section className="relative">
          <CategoryHeader category={category} />
        </Section>
      </div>

      <Section>
        {data.hidden ? (
          <p className="mx-auto max-w-xl rounded-3xl bg-night/45 p-6 text-center text-lg ring-1 ring-white/15">
            Las candidaturas se presentan oficialmente el 25 de noviembre de 2026.
          </p>
        ) : !category.votable && nominees.length === 0 ? (
          <p className="mx-auto max-w-xl rounded-3xl bg-night/45 p-6 text-center text-lg ring-1 ring-white/15">
            Reconocimiento especial concedido por la redacción de InfoLinense, sin votación popular. Se dará a conocer junto con el resto de ganadores.
          </p>
        ) : nominees.length === 0 ? (
          <p className="mx-auto max-w-xl rounded-3xl bg-night/45 p-6 text-center text-lg ring-1 ring-white/15">
            Las candidaturas de esta categoría se publicarán próximamente.
          </p>
        ) : (
          <>
            <ul className="flex flex-wrap justify-center gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14">
              {nominees.map((n, i) => (
                <li key={n.id} className="w-[calc(50%-0.5rem)] max-w-sm sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
                  <NomineeCard nominee={n} category={category} isWinner={data.winnerId === n.id} priority={i < 2} />
                </li>
              ))}
            </ul>
            <div className="mt-14 flex flex-col items-center gap-5 text-center">
              {voting && (
                <Link href={`/votar#categoria-${category.id}`} className="btn btn-lime">
                  Vota en {category.name}
                </Link>
              )}
              <NominationDisclaimer random={site.random_order} className="max-w-xl" />
            </div>
          </>
        )}

        <nav aria-label="Otras categorías" className="mt-20 grid gap-3 border-t border-white/20 pt-8 sm:grid-cols-2">
          {data.prev ? (
            <Link href={`/categorias/${data.prev.slug}`} className="rounded-2xl p-3 hover:bg-white/5">
              <span className="kicker block text-mist">← Anterior</span>
              <span className="mt-1 block text-lg font-bold">{data.prev.name}</span>
            </Link>
          ) : (
            <span />
          )}
          {data.next && (
            <Link href={`/categorias/${data.next.slug}`} className="rounded-2xl p-3 text-right hover:bg-white/5">
              <span className="kicker block text-mist">Siguiente →</span>
              <span className="mt-1 block text-lg font-bold">{data.next.name}</span>
            </Link>
          )}
        </nav>
      </Section>
    </>
  );
}

export function ShareButton({ title, text, path }: { title: string; text: string; path: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = new URL(path, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* el usuario canceló */
    }
  };
  return (
    <button type="button" onClick={share} className="btn btn-ghost">
      {copied ? "Enlace copiado" : "Compartir"}
    </button>
  );
}

export function NomineePage({ data, site }: { data: NomineeData; site: SiteInfo }) {
  const { nominee: n, category: c } = data;
  const voting = site.phase.phase === "voting" && c.votable;
  const hasContent = Boolean(n.reason || n.bio || n.merits.length);
  return (
    <Section className="pt-8">
      <nav aria-label="Miga de pan" className="mb-8 text-sm text-mist">
        <Link href="/categorias" className="hover:underline">
          Categorías
        </Link>{" "}
        /{" "}
        <Link href={`/categorias/${c.slug}`} className="hover:underline">
          {c.name}
        </Link>
      </nav>
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="lg:sticky lg:top-8 lg:self-start">
          <Portrait nominee={n} color={c.color} priority sizes="(min-width: 1024px) 40vw, 92vw" />
          {n.photo_credit && <p className="mt-2 text-xs text-mist">Foto: {n.photo_credit}</p>}
        </div>
        <article>
          <CategoryTag category={c} size="lg" />
          {c.award_title && <p className="mt-3 font-semibold text-mist">{c.award_title}</p>}
          <h1 className="display mt-4 text-[clamp(2.6rem,9vw,5rem)]">{n.name}</h1>
          {n.subtitle && <p className="mt-2 text-xl font-semibold text-mist">{n.subtitle}</p>}
          {data.isWinner && <p className="tag mt-4 bg-lime text-sm text-navy">Gana el premio {c.name}</p>}

          {n.reason && <p className="mt-8 text-[clamp(1.2rem,3.6vw,1.5rem)] font-semibold leading-snug">{n.reason}</p>}
          {n.bio && (
            <div className="prose-premios mt-6">
              {n.bio.split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
          {n.merits.length > 0 && (
            <section className="mt-10">
              <h2 className="kicker text-mist">Méritos de 2026</h2>
              <ul className="mt-4 space-y-3 border-l-2 pl-5" style={{ borderColor: c.color }}>
                {n.merits.map((m, i) => (
                  <li key={i} className="text-[1.05rem] leading-snug">
                    {m}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {!hasContent && <p className="mt-8 rounded-2xl bg-night/40 p-5 text-mist ring-1 ring-white/10">La presentación de esta candidatura se publicará próximamente.</p>}
          {n.links.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-3">
              {n.links.map((l) => (
                <li key={l.url}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-lime decoration-2">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-10 flex flex-wrap gap-3">
            {voting && (
              <Link href={`/votar#categoria-${c.id}`} className="btn btn-lime">
                Votar en {c.name}
              </Link>
            )}
            <ShareButton title={`${n.name} · Premios InfoLinense 2026`} text={`${n.name}, candidatura a ${c.name} en los Premios InfoLinense 2026`} path={`/nominados/${n.slug}`} />
          </div>

          {data.siblings.length > 0 && (
            <section className="mt-14 border-t border-white/20 pt-8">
              <h2 className="kicker text-mist">También nominados en {c.name}</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {data.siblings.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/nominados/${s.slug}`} className="inline-block rounded-full bg-white/10 px-4 py-2 font-semibold ring-1 ring-white/15 hover:bg-white/20">
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </div>
    </Section>
  );
}
