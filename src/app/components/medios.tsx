/**
 * Medios vinculados a InfoLinense: organizador y patrocinadores de categorías.
 * Logotipos originales descargados de sus webs oficiales (public/brand/medios).
 * Los enlaces externos se abren en otra pestaña con rel="noopener noreferrer".
 */
import type { ReactNode } from "react";

export interface Medio {
  id: "infolinense" | "carnavalinense" | "el-cofrade-linense";
  name: string;
  url: string;
  urlLabel: string;
  logo: string;
  logoW: number;
  logoH: number;
  claim: string;
}

export const MEDIOS: Record<Medio["id"], Medio> = {
  infolinense: {
    id: "infolinense",
    name: "InfoLinense",
    url: "https://infolinense.com",
    urlLabel: "infolinense.com",
    logo: "/brand/medios/infolinense.webp",
    logoW: 720,
    logoH: 182,
    claim: "Actualidad e información de La Línea de la Concepción.",
  },
  carnavalinense: {
    id: "carnavalinense",
    name: "Carnavalinense",
    url: "https://carnavalinense.com",
    urlLabel: "carnavalinense.com",
    logo: "/brand/medios/carnavalinense.webp",
    logoW: 480,
    logoH: 245,
    claim: "Toda la información del Carnaval linense y sus protagonistas.",
  },
  "el-cofrade-linense": {
    id: "el-cofrade-linense",
    name: "El Cofrade Linense",
    url: "https://www.instagram.com/elcofradelinense/",
    urlLabel: "@elcofradelinense",
    logo: "/brand/medios/el-cofrade-linense.webp",
    logoW: 150,
    logoH: 150,
    claim: "La actualidad cofrade y las tradiciones de nuestra Semana Santa.",
  },
};

/** Patrocinio de categorías: el patrocinador no interviene en candidaturas, votación ni ganadores. */
const PATROCINIOS: Record<string, { medio: Medio["id"]; frase: string }> = {
  "carnaval-linense": {
    medio: "carnavalinense",
    frase: "Toda la actualidad, las agrupaciones y las coplas del Carnaval de La Línea, en Carnavalinense.",
  },
  "vocacion-cofrade": {
    medio: "el-cofrade-linense",
    frase: "La actualidad de nuestras hermandades, el patrimonio y la Semana Santa linense.",
  },
  "impulso-cofrade": {
    medio: "el-cofrade-linense",
    frase: "La actualidad de nuestras hermandades, el patrimonio y la Semana Santa linense.",
  },
};

export function patrocinio(slug: string) {
  const p = PATROCINIOS[slug];
  return p ? { ...p, medio: MEDIOS[p.medio] } : null;
}

export function Ext({ href, className = "", children, label }: { href: string; className?: string; children: ReactNode; label?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} aria-label={label}>
      {children}
    </a>
  );
}

/** Logotipo de un medio con el fondo que necesita para leerse sobre el azul de los premios. */
export function MedioLogo({ medio, size = "md", className = "" }: { medio: Medio; size?: "xs" | "sm" | "md" | "lg"; className?: string }) {
  if (medio.id === "infolinense") {
    const h = { xs: "h-6", sm: "h-8", md: "h-10", lg: "h-12" }[size];
    return <img src={medio.logo} alt={medio.name} width={medio.logoW} height={medio.logoH} className={`${h} w-auto ${className}`} loading="lazy" decoding="async" />;
  }
  if (medio.id === "el-cofrade-linense") {
    const s = { xs: "h-6 w-6", sm: "h-8 w-8", md: "h-12 w-12", lg: "h-20 w-20" }[size];
    return (
      <img
        src={medio.logo}
        alt={medio.name}
        width={medio.logoW}
        height={medio.logoH}
        className={`${s} shrink-0 rounded-xl ring-1 ring-white/25 ${className}`}
        loading="lazy"
        decoding="async"
      />
    );
  }
  const h = { xs: "h-5", sm: "h-7", md: "h-10", lg: "h-16" }[size];
  return <img src={medio.logo} alt={medio.name} width={medio.logoW} height={medio.logoH} className={`${h} w-auto ${className}`} loading="lazy" decoding="async" />;
}

/** Cabecera: InfoLinense como organizador, sin sustituir al logotipo de los premios. */
export function OrganizerBadge() {
  const m = MEDIOS.infolinense;
  return (
    <Ext href={m.url} className="group inline-flex min-h-10 items-center gap-2 rounded-full transition hover:opacity-90" label="Organiza InfoLinense · abre infolinense.com en una pestaña nueva">
      <span className="hidden text-[0.7rem] font-semibold tracking-wide text-mist uppercase lg:inline">Organiza</span>
      <MedioLogo medio={m} size="xs" />
    </Ext>
  );
}

/** Banda de patrocinio en la página de la categoría. */
export function SponsorBand({ slug, categoryName }: { slug: string; categoryName: string }) {
  const p = patrocinio(slug);
  if (!p) return null;
  return (
    <aside aria-label={`Patrocinio de ${categoryName}`} className="mx-auto mt-8 max-w-xl rounded-[1.75rem] bg-night/45 p-5 text-left ring-1 ring-white/15 sm:p-6">
      <div className="flex items-center gap-4">
        <MedioLogo medio={p.medio} size="md" />
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-mist uppercase">{categoryName}</p>
          <p className="mt-0.5 text-sm italic text-white/90">Categoría patrocinada por {p.medio.name}</p>
        </div>
      </div>
      <p className="mt-4 leading-snug text-white">«{p.frase}»</p>
      <Ext href={p.medio.url} className="btn btn-ghost mt-4 min-h-11 px-5 text-sm">
        {p.medio.id === "el-cofrade-linense" ? "Síguelo en Instagram" : `Visita ${p.medio.urlLabel}`}
        <span aria-hidden="true"> ↗</span>
      </Ext>
      <p className="mt-3 text-xs text-white/55">El patrocinador no interviene en las candidaturas, la votación ni los ganadores.</p>
    </aside>
  );
}

/** Mención discreta en la tarjeta de la categoría (sin enlace: la tarjeta entera ya enlaza a la categoría). */
export function SponsorChip({ slug }: { slug: string }) {
  const p = patrocinio(slug);
  if (!p) return null;
  return (
    <p className="mt-3 inline-flex items-center gap-2 text-xs text-mist">
      <MedioLogo medio={p.medio} size="xs" />
      <span>Patrocina {p.medio.name}</span>
    </p>
  );
}

/** Portada: sección editorial de InfoLinense. */
export function InfoLinenseEditorial() {
  const m = MEDIOS.infolinense;
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-night/55 px-6 py-10 ring-1 ring-white/15 sm:px-12 sm:py-14">
      <div className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="kicker text-lime">El medio que organiza los premios</p>
          <h2 className="display mt-3 text-[clamp(2rem,6vw,3.2rem)]">Mucho más que unos premios</h2>
          <p className="mt-5 max-w-xl text-[1.1rem] leading-relaxed text-white/90">
            En InfoLinense contamos cada día lo que ocurre en nuestra ciudad. Las historias de sus vecinos, los proyectos que transforman nuestros barrios y el talento de quienes hacen grande a La Línea.
          </p>
          <Ext href={m.url} className="btn btn-lime mt-7">
            Descubre InfoLinense <span aria-hidden="true">↗</span>
          </Ext>
        </div>
        <div className="order-first flex md:order-none md:justify-end">
          <img src={m.logo} alt="InfoLinense" width={m.logoW} height={m.logoH} className="h-auto w-full max-w-[10rem] md:max-w-[18rem]" loading="lazy" decoding="async" />
        </div>
      </div>
    </div>
  );
}

/** Portada: los medios que hacen grande a La Línea. */
export function MediaPartners() {
  const list = [MEDIOS.infolinense, MEDIOS.carnavalinense, MEDIOS["el-cofrade-linense"]];
  return (
    <section aria-labelledby="medios-titulo">
      <p className="kicker text-mist">InfoLinense y sus medios</p>
      <h2 id="medios-titulo" className="display mt-3 text-[clamp(1.9rem,6vw,3.2rem)] uppercase">
        Los medios que hacen grande a La Línea
      </h2>
      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {list.map((m) => (
          <li key={m.id}>
            <Ext
              href={m.url}
              className={`group flex h-full flex-col justify-between gap-8 rounded-[1.75rem] p-6 ring-1 transition hover:-translate-y-0.5 ${
                m.id === "infolinense" ? "bg-[#1a4de8] ring-white/25 hover:ring-white/60" : m.id === "carnavalinense" ? "bg-night/50 ring-white/15 hover:ring-white/40" : "bg-[#222366] ring-white/15 hover:ring-white/40"
              }`}
            >
              <div className="flex h-16 items-center">
                {m.id === "infolinense" ? (
                  <img src={m.logo} alt="" width={m.logoW} height={m.logoH} className="h-10 w-auto" loading="lazy" decoding="async" />
                ) : m.id === "carnavalinense" ? (
                  <img src={m.logo} alt="" width={m.logoW} height={m.logoH} className="h-14 w-auto" loading="lazy" decoding="async" />
                ) : (
                  <img src={m.logo} alt="" width={m.logoW} height={m.logoH} className="h-16 w-16 rounded-2xl ring-1 ring-white/25" loading="lazy" decoding="async" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-extrabold">{m.name}</h3>
                <p className="mt-1 leading-snug text-white/85">{m.claim}</p>
                <p className={`mt-5 inline-flex items-center gap-1.5 text-sm font-bold underline decoration-2 underline-offset-4 decoration-lime`}>
                  {m.urlLabel} <span aria-hidden="true">↗</span>
                </p>
              </div>
            </Ext>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Final de la página de categoría: referencia discreta a InfoLinense. */
export function CategoryInfoLinenseNote() {
  const m = MEDIOS.infolinense;
  return (
    <p className="mt-12 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-sm text-mist">
      <span>Más noticias y actualidad de La Línea en</span>
      <Ext href={m.url} className="inline-flex min-h-10 items-center gap-1 font-semibold text-white underline decoration-lime decoration-2 underline-offset-4">
        infolinense.com <span aria-hidden="true">↗</span>
      </Ext>
    </p>
  );
}

/** Tras emitir el voto. */
export function ThanksInfoLinense() {
  const m = MEDIOS.infolinense;
  return (
    <div className="mt-10 w-full max-w-md rounded-[2rem] bg-[#1a4de8] p-6 text-left ring-1 ring-white/25">
      <img src={m.logo} alt="InfoLinense" width={m.logoW} height={m.logoH} className="h-7 w-auto" loading="lazy" decoding="async" />
      <p className="mt-4 text-lg font-bold leading-snug">¡Gracias por participar! Mientras esperamos los resultados, descubre todo lo que ocurre en La Línea.</p>
      <Ext href={m.url} className="btn btn-primary mt-5 w-full sm:w-auto">
        Leer InfoLinense <span aria-hidden="true">↗</span>
      </Ext>
    </div>
  );
}

/** Pie de página. */
export function FooterInfoLinense() {
  const m = MEDIOS.infolinense;
  return (
    <Ext href={m.url} className="mt-6 inline-flex flex-col gap-3 rounded-2xl transition hover:opacity-90" label="Una iniciativa de InfoLinense · abre infolinense.com">
      <MedioLogo medio={m} size="sm" className="self-start" />
      <span className="max-w-xs text-sm leading-snug text-white/85">Una iniciativa de InfoLinense, el periódico digital de La Línea de la Concepción.</span>
    </Ext>
  );
}
