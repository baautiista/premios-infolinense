import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { PublicCategory, PublicNominee } from "../../shared/types";

/** Logotipo oficial (archivo original, sin redibujar). */
export function Logo({ className = "", animate = false, priority = false }: { className?: string; animate?: boolean; priority?: boolean }) {
  return (
    <picture>
      <source srcSet="/brand/logo-premios-infolinense.webp" type="image/webp" />
      <img
        src="/brand/logo-premios-infolinense.png"
        alt="Premios InfoLinense 2026"
        width={1116}
        height={441}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={`h-auto w-full select-none ${animate ? "anim-logo" : ""} ${className}`}
        draggable={false}
      />
    </picture>
  );
}

/**
 * La curva característica de las publicaciones, trazada en SVG.
 * viewBox con las proporciones del fondo original.
 */
export const CURVE_PATH =
  "M-60 418 C 60 392 210 400 300 470 C 390 540 425 610 368 712 C 300 832 150 935 70 1035 C -10 1135 -20 1240 20 1345 C 110 1560 420 1770 860 1795 C 1250 1815 1560 1690 1790 1545";

export function BrandCurve({
  className = "",
  draw = false,
  opacity = 0.12,
  style,
}: {
  className?: string;
  draw?: boolean;
  opacity?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 1725 2156"
      preserveAspectRatio="xMinYMid slice"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none ${draw ? "curve-draw" : ""} ${className}`}
      style={style}
    >
      <path d={CURVE_PATH} fill="none" stroke={`rgba(255,255,255,${opacity})`} strokeWidth={92} strokeLinecap="round" pathLength={1} />
    </svg>
  );
}

/** Etiqueta de categoría, como en las publicaciones (color oficial de fondo). */
export function CategoryTag({
  category,
  size = "md",
  className = "",
}: {
  category: Pick<PublicCategory, "name" | "color" | "ink">;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: "text-[0.7rem]",
    md: "text-[0.85rem]",
    lg: "text-[clamp(1rem,3.6vw,1.35rem)]",
    xl: "text-[clamp(1.15rem,5.2vw,2.1rem)]",
  };
  return (
    <span className={`tag ${sizes[size]} ${className}`} style={{ background: category.color, color: category.ink }}>
      {category.name}
    </span>
  );
}

export function initials(name: string): string {
  const words = name
    .replace(/\(.*?\)/g, "")
    .split(/[\s—–-]+/)
    .filter((w) => /^[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(w) && !/^(de|del|la|las|los|el|y|con)$/i.test(w));
  return (words[0]?.[0] ?? "") + (words[1]?.[0] ?? "");
}

/**
 * Retrato 4:5. Si aún no hay fotografía, se muestra un marco con las iniciales
 * (no se inventan imágenes) y el color de la categoría como acento.
 */
export function Portrait({
  nominee,
  color,
  className = "",
  sizes = "(min-width: 1024px) 30vw, 90vw",
  priority = false,
  aspect = "aspect-[4/5]",
}: {
  nominee: Pick<PublicNominee, "name" | "photo_portrait" | "photo_alt">;
  color: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  aspect?: string;
}) {
  if (nominee.photo_portrait) {
    return (
      <div className={`relative overflow-hidden rounded-[1.6rem] bg-navy ${aspect} ${className}`}>
        <img
          src={nominee.photo_portrait}
          alt={nominee.photo_alt ?? nominee.name}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }
  return (
    <div
      className={`relative grid place-items-center overflow-hidden rounded-[1.6rem] ${aspect} ${className}`}
      style={{ background: `linear-gradient(160deg, ${color}33, #081a5480 70%)`, boxShadow: `inset 0 0 0 1px ${color}55` }}
      role="img"
      aria-label={`${nominee.name}. Fotografía pendiente de publicación`}
    >
      <BrandCurve className="absolute inset-0 h-full w-full" opacity={0.08} />
      <span className="display relative text-[clamp(2.4rem,10vw,5.5rem)] text-white/90" aria-hidden="true">
        {initials(nominee.name)}
      </span>
      <span className="kicker absolute bottom-3 px-2 text-center text-[0.55rem] text-white/60 sm:bottom-4 sm:text-[0.6rem]" aria-hidden="true">
        Fotografía próximamente
      </span>
    </div>
  );
}

/** Cuenta atrás. Se pinta tras la hidratación para no desajustar el HTML del servidor. */
export function Countdown({ target, label }: { target: string; label: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const end = Date.parse(target);
  const diff = now === null ? null : Math.max(0, end - now);
  const parts =
    diff === null
      ? null
      : [
          { v: Math.floor(diff / 86_400_000), l: "días" },
          { v: Math.floor((diff / 3_600_000) % 24), l: "horas" },
          { v: Math.floor((diff / 60_000) % 60), l: "min" },
          { v: Math.floor((diff / 1000) % 60), l: "seg" },
        ];
  return (
    <div className="inline-flex flex-col items-center gap-2 lg:items-start">
      <p className="kicker text-mist">{label}</p>
      <div className="flex gap-2" role="timer" aria-live="off">
        {(parts ?? [0, 1, 2, 3].map(() => ({ v: null as number | null, l: "" }))).map((p, i) => (
          <div key={i} className="min-w-16 rounded-2xl bg-night/40 px-3 py-2 text-center ring-1 ring-white/15">
            <span className="display block text-3xl tabular-nums">{p.v === null ? "··" : String(p.v).padStart(2, "0")}</span>
            <span className="text-[0.7rem] text-mist">{p.l || " "}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Section({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>
      {children}
    </section>
  );
}

/** Aviso fijo de transparencia. */
export function NominationDisclaimer({ className = "", random = true }: { className?: string; random?: boolean }) {
  return (
    <p className={`text-sm text-mist ${className}`}>
      Estar nominado no significa haber ganado el premio.
      {random ? " Las candidaturas se muestran en orden aleatorio en cada visita para que ninguna tenga ventaja." : ""}
    </p>
  );
}
