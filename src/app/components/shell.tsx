import { useEffect, useState, type ReactNode } from "react";
import type { SiteInfo } from "../../shared/types";
import { Link, useNav } from "../nav";
import { BrandCurve, Logo } from "./brand";
import { FooterInfoLinense, OrganizerBadge } from "./medios";

function navItems(site: SiteInfo) {
  const p = site.phase.phase;
  const items = [
    { href: "/categorias", label: "Categorías" },
    p === "voting" ? { href: "/votar", label: "Vota" } : null,
    p === "winners" ? { href: "/ganadores", label: "Ganadores" } : null,
    p === "winners" ? { href: "/palmares", label: "Palmarés" } : null,
    { href: "/bases", label: "Bases" },
    { href: "/sistema-de-votacion", label: "Cómo se vota" },
  ];
  return items.filter(Boolean) as { href: string; label: string }[];
}

export function Shell({ site, children, bare = false }: { site: SiteInfo; children: ReactNode; bare?: boolean }) {
  const { path, loading } = useNav();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const items = navItems(site);
  const voting = site.phase.phase === "voting";

  return (
    <>
      <div className="brand-bg" aria-hidden="true" />
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-navy">
        Saltar al contenido
      </a>
      <div
        className={`fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-lime transition-transform duration-500 ${loading ? "scale-x-75" : "scale-x-0"}`}
        aria-hidden="true"
      />
      {!bare && (
        <header className="relative z-30">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3 sm:px-8">
            <div className="flex min-w-0 items-center gap-3 sm:gap-5">
              {path === "/" ? (
                <span className="kicker hidden text-mist sm:inline">I edición · 2026</span>
              ) : (
                <Link href="/" className="block w-28 shrink-0 sm:w-40" aria-label="Premios InfoLinense 2026 · Portada">
                  <Logo />
                </Link>
              )}
              <OrganizerBadge />
            </div>
            <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
              {items.map((i) => (
                <Link
                  key={i.href}
                  href={i.href}
                  aria-current={path === i.href ? "page" : undefined}
                  className={`rounded-full px-3.5 py-2 text-sm font-semibold transition hover:bg-white/10 ${
                    i.href === "/votar" ? "bg-lime text-navy hover:bg-lime" : path === i.href ? "bg-white/15" : "text-white/90"
                  }`}
                >
                  {i.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2 md:hidden">
              {voting && path !== "/votar" && (
                <Link href="/votar" className="btn btn-lime min-h-10 px-4 text-xs">
                  Vota
                </Link>
              )}
              <button
                type="button"
                className="grid h-11 w-11 place-items-center rounded-full bg-white/10 ring-1 ring-white/20"
                aria-expanded={open}
                aria-controls="menu-movil"
                onClick={() => setOpen((v) => !v)}
              >
                <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
                <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                  {open ? (
                    <path d="M4 4l12 12M16 4L4 16" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                  ) : (
                    <path d="M3 6h14M3 10h14M3 14h14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          {open && (
            <nav id="menu-movil" aria-label="Menú" className="absolute inset-x-3 top-full z-40 rounded-3xl bg-navy/95 p-3 shadow-2xl ring-1 ring-white/15 backdrop-blur md:hidden">
              <Link href="/" className="block rounded-2xl px-4 py-3 text-lg font-bold">
                Portada
              </Link>
              {items.map((i) => (
                <Link key={i.href} href={i.href} className="block rounded-2xl px-4 py-3 text-lg font-bold hover:bg-white/10">
                  {i.label}
                </Link>
              ))}
            </nav>
          )}
        </header>
      )}
      <main id="contenido" tabIndex={-1} className="relative z-10 outline-none">
        {children}
      </main>
      {!bare && <Footer site={site} />}
    </>
  );
}

function Footer({ site }: { site: SiteInfo }) {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-night/40">
      <BrandCurve className="absolute -right-40 -bottom-40 h-[38rem] w-[38rem] opacity-70" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="w-44">
            <Logo />
          </div>
          <FooterInfoLinense />
        </div>
        <div>
          <p className="kicker mb-3 text-mist">Información</p>
          <ul className="space-y-2 text-sm">
            {site.footer_pages.map((p) => (
              <li key={p.slug}>
                <Link href={`/${p.slug}`} className="hover:underline">
                  {p.title.replace(/ de los Premios InfoLinense 2026$/, "")}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/comprobante" className="hover:underline">
                Comprobar mi papeleta
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="kicker mb-3 text-mist">Contacto</p>
          <ul className="space-y-2 text-sm">
            {site.contact_email && (
              <li>
                <a href={`mailto:${site.contact_email}`} className="hover:underline">
                  {site.contact_email}
                </a>
              </li>
            )}
            {site.instagram_url && (
              <li>
                <a href={site.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Instagram @infolinense
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <p className="relative mx-auto max-w-6xl px-5 pb-10 text-xs text-white/50 sm:px-8">
        © 2026 InfoLinense · Premios InfoLinense · I edición
      </p>
    </footer>
  );
}
