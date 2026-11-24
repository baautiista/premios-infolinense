import { Fragment } from "react";
import { parseMarkdown, type Inline } from "../../shared/markdown";
import type { InfoPageData } from "../../shared/types";
import { Section } from "../components/brand";
import { Link } from "../nav";

export function Inlines({ items }: { items: Inline[] }) {
  return (
    <>
      {items.map((it, i) => {
        if (it.t === "strong") return <strong key={i}>{it.v}</strong>;
        if (it.t === "pending")
          return (
            <span key={i} className="pending">
              Pendiente: {it.v}
            </span>
          );
        if (it.t === "link") {
          const external = /^https?:/.test(it.href);
          return it.href.startsWith("/") ? (
            <Link key={i} href={it.href}>
              {it.v}
            </Link>
          ) : (
            <a key={i} href={it.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {it.v}
            </a>
          );
        }
        return <Fragment key={i}>{it.v}</Fragment>;
      })}
    </>
  );
}

export function Markdown({ source }: { source: string }) {
  return (
    <div className="prose-premios">
      {parseMarkdown(source).map((b, i) => {
        if (b.t === "h2") return <h2 key={i}>{<Inlines items={b.inline} />}</h2>;
        if (b.t === "h3") return <h3 key={i}>{<Inlines items={b.inline} />}</h3>;
        if (b.t === "ul")
          return (
            <ul key={i}>
              {b.items.map((li, j) => (
                <li key={j}>
                  <Inlines items={li} />
                </li>
              ))}
            </ul>
          );
        return (
          <p key={i}>
            <Inlines items={b.inline} />
          </p>
        );
      })}
    </div>
  );
}

export function InfoPage({ data }: { data: InfoPageData }) {
  return (
    <Section className="pt-8">
      <div className="mx-auto max-w-3xl">
        {data.status === "draft" && (
          <p role="note" className="mb-8 rounded-2xl border border-dashed border-lime/70 bg-lime/10 px-5 py-4 text-sm text-lime">
            <strong>Borrador pendiente de aprobación.</strong> Este texto puede cambiar: la organización aún no lo ha aprobado
            {/\[PENDIENTE:/.test(data.body) ? " y contiene apartados pendientes de completar" : ""}.
          </p>
        )}
        <h1 className="display text-[clamp(2.4rem,8vw,4.2rem)]">{data.title}</h1>
        {data.summary && <p className="mt-5 text-xl leading-snug text-white/85">{data.summary}</p>}
        <div className="mt-10">
          <Markdown source={data.body} />
        </div>
        <p className="mt-12 text-xs text-white/50">
          Última actualización: {new Date(data.updated_at).toLocaleDateString("es-ES", { timeZone: "Europe/Madrid", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>
    </Section>
  );
}

export function NotFoundPage() {
  return (
    <Section className="pt-16 text-center">
      <p className="kicker text-mist">Error 404</p>
      <h1 className="display mt-4 text-[clamp(2.4rem,8vw,4rem)]">Esta página no existe</h1>
      <p className="mt-4 text-lg text-white/85">Puede que la dirección haya cambiado o que aún no se haya publicado.</p>
      <p className="mt-8">
        <Link href="/" className="btn btn-primary">
          Ir a la portada
        </Link>
      </p>
    </Section>
  );
}
