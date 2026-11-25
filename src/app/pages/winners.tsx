import { useCallback, useEffect, useRef, useState } from "react";
import type { SiteInfo, Winner, WinnerData, WinnersData } from "../../shared/types";
import { formatMadrid } from "../../shared/time";
import { BrandCurve, CURVE_PATH, CategoryTag, Logo, Portrait, Section, initials } from "../components/brand";
import { Link } from "../nav";
import { ShareButton } from "./nominees";

function NotYet({ site }: { site: SiteInfo }) {
  return (
    <Section className="pt-10">
      <div className="mx-auto max-w-2xl rounded-[2rem] bg-night/50 p-8 text-center ring-1 ring-white/15 sm:p-12">
        <h1 className="display text-[clamp(2rem,7vw,3.2rem)]">Los ganadores aún no se han publicado</h1>
        <p className="mt-5 text-lg text-white/90">
          {site.phase.results_at ? <>Se darán a conocer el {formatMadrid(site.phase.results_at)}.</> : <>Se darán a conocer cuando termine la votación.</>}
        </p>
        <p className="mt-6">
          <Link href="/categorias" className="btn btn-primary">
            Ver las candidaturas
          </Link>
        </p>
      </div>
    </Section>
  );
}

/**
 * «Descubre a los ganadores»: presentación digital, premio a premio.
 * Teclado: ← → para moverse, Intro para revelar. Respeta «reducir movimiento».
 */
export function WinnersPage({ data, site }: { data: WinnersData; site: SiteInfo }) {
  const [index, setIndex] = useState(-1); // -1 = portada
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const live = useRef<HTMLParagraphElement>(null);
  const awards = data.awards;
  const current = index >= 0 ? awards[index] : null;
  const isRevealed = revealed.has(index);

  const reveal = useCallback(() => setRevealed((s) => new Set(s).add(index)), [index]);
  const go = useCallback((i: number) => setIndex(Math.max(-1, Math.min(awards.length - 1, i))), [awards.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
      if (e.key === "Enter" && index >= 0 && !isRevealed) reveal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, isRevealed, go, reveal]);

  if (!data.published) return <NotYet site={site} />;
  if (!awards.length) return <NotYet site={site} />;

  if (!current) {
    return (
      <div className="relative min-h-[80svh] overflow-hidden">
        <BrandCurve draw className="absolute -left-40 top-0 h-[75rem] w-[75rem] max-w-none" />
        <Section className="relative flex min-h-[75svh] flex-col items-center justify-center py-10 text-center">
          <div className="w-[min(86vw,32rem)]">
            <Logo animate priority />
          </div>
          <h1 className="display anim-rise anim-delay-1 mt-10 text-[clamp(2.4rem,9vw,4.6rem)]">Descubre a los ganadores</h1>
          <p className="anim-rise anim-delay-2 mt-4 max-w-[34ch] text-xl text-white/90">
            {awards.length} premios elegidos por votación popular.
          </p>
          <div className="anim-rise anim-delay-3 mt-9 flex flex-col gap-3 sm:flex-row">
            <button type="button" className="btn btn-lime" onClick={() => go(0)}>
              Empezar
            </button>
            <Link href="/palmares" className="btn btn-ghost">
              Ver el palmarés completo
            </Link>
          </div>
        </Section>
      </div>
    );
  }

  const c = current.category;
  const w = current.winner!;
  return (
    <div className="relative overflow-hidden">
      <BrandCurve key={`curve-${index}-${isRevealed}`} draw className="absolute -left-48 top-10 h-[80rem] w-[80rem] max-w-none" opacity={isRevealed ? 0.16 : 0.1} />
      <Section className="relative flex min-h-[78svh] flex-col items-center pt-4 pb-32 text-center">
        <p className="kicker text-mist">
          Premio {index + 1} de {awards.length}
        </p>
        <div className="mt-5" key={`tag-${index}`}>
          <CategoryTag category={c} size="xl" className="anim-rise" />
        </div>
        <h1 className="display anim-rise anim-delay-1 mt-4 text-[clamp(2.2rem,8vw,4.2rem)]" key={`h-${index}`}>
          {c.award_title ?? c.name}
        </h1>

        {!isRevealed ? (
          <div className="mt-10 w-full" key={`n-${index}`}>
            {current.nominees.length > 1 && (
              <>
                <p className="kicker text-mist">Las candidaturas</p>
                <ul className="mx-auto mt-5 flex max-w-4xl flex-wrap justify-center gap-3">
                  {current.nominees.map((n, i) => (
                    <li key={n.id} className="anim-rise" style={{ animationDelay: `${0.2 + i * 0.08}s` }}>
                      <span className="flex items-center gap-3 rounded-full bg-white/10 py-1.5 pr-5 pl-1.5 ring-1 ring-white/15">
                        {n.photo_square || n.photo_portrait ? (
                          <img src={n.photo_square ?? n.photo_portrait ?? ""} alt="" className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <span className="grid h-10 w-10 place-items-center rounded-full text-sm font-black" style={{ background: c.color, color: c.ink }} aria-hidden="true">
                            {initials(n.name)}
                          </span>
                        )}
                        <span className="font-bold">{n.name}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <button type="button" className="btn btn-lime mt-10" onClick={reveal} autoFocus>
              {c.votable ? "Revelar quién gana" : "Descubrir el reconocimiento"}
            </button>
          </div>
        ) : (
          <div className="mt-8 grid w-full max-w-5xl items-center gap-6 text-left md:mt-10 md:grid-cols-[0.8fr_1.2fr] md:gap-8" key={`w-${index}`}>
            <div className="portrait-in mx-auto w-full max-w-[13rem] sm:max-w-xs md:max-w-none">
              <Portrait nominee={w} color={c.color} priority />
            </div>
            <div className="text-center md:text-left">
              <p className="kicker anim-rise text-lime">{c.votable ? "Elección del público" : "Concedido por la redacción"}</p>
              <h2 className="display winner-name mt-3 text-[clamp(2.6rem,10vw,5.6rem)]">{w.name}</h2>
              {w.subtitle && <p className="anim-rise anim-delay-1 mt-2 text-xl font-semibold text-mist">{w.subtitle}</p>}
              {current.reason && <p className="anim-rise anim-delay-2 mt-6 text-[1.2rem] leading-snug text-white/90">{current.reason}</p>}
              <p className="anim-rise anim-delay-3 mt-6">
                <Link href={`/ganadores/${w.slug}`} className="font-semibold underline decoration-lime decoration-2">
                  Página del premio y distintivo
                </Link>
              </p>
            </div>
          </div>
        )}
        <p ref={live} className="sr-only" aria-live="polite">
          {isRevealed ? `${c.name}: ${w.name}` : ""}
        </p>
      </Section>

      <nav aria-label="Navegación de premios" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-navy/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
          <button type="button" className="btn btn-ghost px-4" onClick={() => go(index - 1)}>
            ← <span className="hidden sm:inline">Anterior</span>
          </button>
          <ol className="hidden items-center gap-1.5 sm:flex" aria-label="Premios">
            {awards.map((a, i) => (
              <li key={a.category.id}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`${a.category.name}${i === index ? " (actual)" : ""}`}
                  aria-current={i === index ? "step" : undefined}
                  className="block h-2.5 rounded-full transition-all"
                  style={{ width: i === index ? 28 : 10, background: i === index ? a.category.color : "rgba(255,255,255,0.35)" }}
                />
              </li>
            ))}
          </ol>
          <Link href="/palmares" className="text-sm font-semibold underline sm:hidden">
            Palmarés
          </Link>
          {index < awards.length - 1 ? (
            <button type="button" className="btn btn-primary px-5" onClick={() => go(index + 1)}>
              Siguiente premio →
            </button>
          ) : (
            <Link href="/palmares" className="btn btn-lime px-5">
              Ver palmarés
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}

export function PalmaresPage({ data, site }: { data: WinnersData; site: SiteInfo }) {
  if (!data.published || !data.awards.length) return <NotYet site={site} />;
  return (
    <Section className="pt-8">
      <p className="kicker text-mist">I edición · 2026</p>
      <h1 className="display mt-3 text-[clamp(2.6rem,9vw,5rem)]">Palmarés</h1>
      <ol className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {data.awards.map((a) => (
          <li key={a.category.id}>
            <Link href={`/ganadores/${a.winner!.slug}`} className="group block">
              <Portrait nominee={a.winner!} color={a.category.color} className="transition group-hover:-translate-y-1" sizes="(min-width: 1024px) 30vw, 90vw" />
              <div className="mt-4">
                <CategoryTag category={a.category} size="sm" />
                <p className="mt-2 text-sm font-semibold text-mist">{a.category.award_title}</p>
                <h2 className="display mt-1 text-[1.9rem] leading-tight group-hover:underline">{a.winner!.name}</h2>
              </div>
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-14">
        <Link href="/ganadores" className="btn btn-ghost">
          Ver la presentación
        </Link>
      </p>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Distintivo digital descargable (1080×1350, formato Instagram)      */
/* ------------------------------------------------------------------ */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

async function drawBadge(canvas: HTMLCanvasElement, award: Winner) {
  const W = 1080;
  const H = 1350;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  await document.fonts?.ready;
  const c = award.category;
  const w = award.winner!;
  // Fondo oficial
  const g = ctx.createLinearGradient(W, 0, 0, H);
  g.addColorStop(0, "#154DD5");
  g.addColorStop(0.4, "#1038AC");
  g.addColorStop(0.75, "#0C2A89");
  g.addColorStop(1, "#081D61");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // Curva
  ctx.save();
  ctx.scale(W / 1725, H / 2156);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 92;
  ctx.lineCap = "round";
  ctx.stroke(new Path2D(CURVE_PATH));
  ctx.restore();
  // Logotipo
  const logo = await loadImage("/brand/logo-premios-infolinense.png");
  const lw = 620;
  ctx.drawImage(logo, (W - lw) / 2, 90, lw, (lw * logo.height) / logo.width);
  // Etiqueta
  ctx.font = "700 46px Poppins, sans-serif";
  const label = c.name.toUpperCase();
  const tw = ctx.measureText(label).width + 64;
  const ty = 420;
  ctx.fillStyle = c.color;
  ctx.beginPath();
  ctx.roundRect((W - tw) / 2, ty, tw, 92, 26);
  ctx.fill();
  ctx.fillStyle = c.ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, W / 2, ty + 49);
  // Retrato
  let y = 560;
  if (w.photo_square || w.photo_portrait) {
    try {
      const img = await loadImage((w.photo_square ?? w.photo_portrait) as string);
      const s = 300;
      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, y + s / 2, s / 2, 0, Math.PI * 2);
      ctx.clip();
      const r = Math.max(s / img.width, s / img.height);
      ctx.drawImage(img, W / 2 - (img.width * r) / 2, y + s / 2 - (img.height * r) / 2, img.width * r, img.height * r);
      ctx.restore();
      y += s + 50;
    } catch {
      /* sin foto */
    }
  } else y += 60;
  // Nombre
  ctx.fillStyle = "#FFFFFF";
  ctx.textBaseline = "alphabetic";
  let size = 104;
  ctx.font = `800 ${size}px Raleway, sans-serif`;
  let lines = wrap(ctx, w.name, 900);
  while (lines.length > 2 && size > 64) {
    size -= 8;
    ctx.font = `800 ${size}px Raleway, sans-serif`;
    lines = wrap(ctx, w.name, 900);
  }
  for (const l of lines) {
    y += size;
    ctx.fillText(l, W / 2, y);
  }
  // Premio
  ctx.font = "600 44px Raleway, sans-serif";
  ctx.fillStyle = "#C8F031";
  y += 80;
  ctx.fillText(c.award_title ?? c.name, W / 2, y);
  ctx.font = "600 30px Poppins, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText(c.votable ? "PREMIO POR VOTACIÓN POPULAR" : "RECONOCIMIENTO DE LA REDACCIÓN", W / 2, H - 120);
  ctx.font = "500 28px Raleway, sans-serif";
  ctx.fillText("premios.infolinense.com", W / 2, H - 72);
}

export function WinnerPage({ data }: { data: WinnerData; site: SiteInfo }) {
  const { award } = data;
  const c = award.category;
  const w = award.winner!;
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (canvas.current) drawBadge(canvas.current, award).then(() => setReady(true));
  }, [award]);
  const download = () => {
    if (!canvas.current) return;
    const a = document.createElement("a");
    a.href = canvas.current.toDataURL("image/png");
    a.download = `premios-infolinense-2026-${w.slug}.png`;
    a.click();
  };
  return (
    <Section className="pt-8">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Portrait nominee={w} color={c.color} priority />
        <div>
          <CategoryTag category={c} size="lg" />
          <p className="kicker mt-5 text-lime">{c.votable ? "Premio por votación popular" : "Reconocimiento de la redacción"} · 2026</p>
          <h1 className="display mt-3 text-[clamp(2.6rem,9vw,5rem)]">{w.name}</h1>
          {w.subtitle && <p className="mt-2 text-xl font-semibold text-mist">{w.subtitle}</p>}
          {c.award_title && <p className="mt-6 text-2xl font-extrabold">{c.award_title}</p>}
          {award.reason && <p className="mt-4 text-[1.15rem] leading-snug text-white/90">{award.reason}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <ShareButton title={`${w.name} · Premios InfoLinense 2026`} text={`${w.name} gana el premio ${c.name} de los Premios InfoLinense 2026`} path={`/ganadores/${w.slug}`} />
            <Link href={`/nominados/${w.slug}`} className="btn btn-ghost">
              Ver la candidatura
            </Link>
          </div>

          <section className="mt-12 rounded-[2rem] bg-night/45 p-6 ring-1 ring-white/15">
            <h2 className="text-xl font-extrabold">Distintivo digital</h2>
            <p className="mt-1 text-sm text-mist">Imagen oficial para compartir en redes (1080 × 1350 px).</p>
            <canvas ref={canvas} className="mt-5 aspect-[4/5] w-full max-w-xs rounded-2xl bg-navy" role="img" aria-label={`Distintivo de ${w.name}, ${c.name}`} />
            <button type="button" className="btn btn-lime mt-5" onClick={download} disabled={!ready}>
              Descargar distintivo
            </button>
          </section>
        </div>
      </div>
    </Section>
  );
}
