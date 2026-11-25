import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PublicCategory, PublicNominee, SiteInfo, VoteData } from "../../shared/types";
import { formatMadrid } from "../../shared/time";
import { BrandCurve, CategoryTag, Logo, Section, initials } from "../components/brand";
import { ThanksInfoLinense } from "../components/medios";
import { Link } from "../nav";

type Cat = PublicCategory & { nominees: PublicNominee[] };
type Step = "ballot" | "review" | "done";

interface Status {
  votingOpen: boolean;
  configured: boolean;
  alreadyVoted: boolean;
  deviceToken?: string;
  closesAt?: string | null;
}

const LS_DEVICE = "pi_vid";
const SS_DRAFT = "pi_ballot_draft";

function storage(kind: "local" | "session") {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
    __turnstileReady?: () => void;
  }
}

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  return new Promise((resolve, reject) => {
    window.__turnstileReady = () => resolve();
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__turnstileReady";
    s.async = true;
    s.defer = true;
    s.onerror = () => reject(new Error("turnstile"));
    document.head.appendChild(s);
  });
}

function Turnstile({ siteKey, onToken }: { siteKey: string; onToken: (t: string | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let id: string | undefined;
    let cancelled = false;
    loadTurnstile()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        id = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          action: "ballot",
          theme: "dark",
          language: "es",
          size: "flexible",
          callback: (t: string) => onToken(t),
          "expired-callback": () => onToken(null),
          "error-callback": () => onToken(null),
        });
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      if (id && window.turnstile) window.turnstile.remove(id);
    };
  }, [siteKey, onToken]);
  return (
    <div>
      <div ref={ref} className="min-h-[65px]" />
      {failed && <p className="mt-2 text-sm text-lime">No se ha podido cargar la verificación anti-bots. Revisa tu conexión o desactiva el bloqueador de contenido y recarga la página.</p>}
    </div>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Section className="pt-10">
      <div className="mx-auto max-w-2xl rounded-[2rem] bg-night/50 p-8 text-center ring-1 ring-white/15 sm:p-12">
        <h1 className="display text-[clamp(2rem,7vw,3.2rem)]">{title}</h1>
        <div className="mt-5 space-y-4 text-lg leading-snug text-white/90">{children}</div>
      </div>
    </Section>
  );
}

export function VotePage({ data, site }: { data: VoteData; site: SiteInfo }) {
  const phase = site.phase.phase;
  const [status, setStatus] = useState<Status | null>(null);
  const [selections, setSelections] = useState<Record<number, number>>({});
  const [step, setStep] = useState<Step>("ballot");
  const [token, setToken] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ code: string; at: string; count: number } | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const cats = data.categories as Cat[];

  // Estado del dispositivo y borrador de la papeleta (solo en el navegador).
  useEffect(() => {
    if (phase !== "voting") return;
    const local = storage("local");
    const headers: Record<string, string> = {};
    const saved = local?.getItem(LS_DEVICE);
    if (saved) headers["X-Device-Token"] = saved;
    fetch("/api/vote/status", { headers, credentials: "same-origin" })
      .then((r) => r.json() as Promise<Status>)
      .then((s) => {
        if (s.deviceToken) local?.setItem(LS_DEVICE, s.deviceToken);
        setStatus(s);
      })
      .catch(() => setStatus({ votingOpen: false, configured: false, alreadyVoted: false }));
    try {
      const draft = JSON.parse(storage("session")?.getItem(SS_DRAFT) ?? "{}");
      if (draft && typeof draft === "object") {
        const valid: Record<number, number> = {};
        for (const [k, v] of Object.entries(draft)) {
          const c = cats.find((x) => x.id === Number(k));
          if (c && c.nominees.some((n) => n.id === v)) valid[c.id] = v as number;
        }
        setSelections(valid);
      }
    } catch {
      /* sin borrador */
    }
  }, [phase, cats]);

  // Saltar a una categoría desde un enlace (#categoria-3).
  useEffect(() => {
    if (status && location.hash.startsWith("#categoria-")) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: "start" });
    }
  }, [status]);

  const choose = (categoryId: number, nomineeId: number | null) => {
    setSelections((prev) => {
      const next = { ...prev };
      if (nomineeId === null || prev[categoryId] === nomineeId) delete next[categoryId];
      else next[categoryId] = nomineeId;
      storage("session")?.setItem(SS_DRAFT, JSON.stringify(next));
      return next;
    });
  };

  const count = Object.keys(selections).length;
  const goTo = (s: Step) => {
    setStep(s);
    setError(null);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ block: "start" }));
  };
  const onToken = useCallback((t: string | null) => setToken(t), []);

  const submit = async () => {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/vote/ballot", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selections,
          turnstileToken: token ?? "",
          deviceToken: storage("local")?.getItem(LS_DEVICE) ?? undefined,
        }),
      });
      const body = (await res.json()) as { ok: boolean; receipt?: string; at?: string; categories?: number; message?: string; error?: string; deviceToken?: string };
      if (body.deviceToken) storage("local")?.setItem(LS_DEVICE, body.deviceToken);
      if (!res.ok || !body.ok) {
        if (body.error === "already_voted") setStatus((s) => (s ? { ...s, alreadyVoted: true } : s));
        setError(body.message ?? "No se ha podido registrar la papeleta. Inténtalo de nuevo.");
        setToken(null);
        if (window.turnstile) window.turnstile.reset();
        return;
      }
      storage("session")?.removeItem(SS_DRAFT);
      setReceipt({ code: body.receipt as string, at: body.at as string, count: body.categories ?? count });
      goTo("done");
    } catch {
      setError("Sin conexión. Comprueba tu red e inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  };

  /* --- Estados fuera del periodo de votación --- */
  if (phase === "coming_soon" || phase === "nominations") {
    return (
      <Notice title="La votación aún no está abierta">
        <p>{site.phase.voting_opens_at ? <>Podrás votar a partir del {formatMadrid(site.phase.voting_opens_at)}.</> : <>Anunciaremos muy pronto la fecha de apertura.</>}</p>
        <p>
          <Link href="/categorias" className="btn btn-primary">
            Conoce a los nominados
          </Link>
        </p>
      </Notice>
    );
  }
  if (phase === "closed") {
    return (
      <Notice title="Votaciones finalizadas">
        <p>Próximamente conoceremos a los ganadores.</p>
        {site.phase.results_at && <p className="text-mist">Publicación de resultados: {formatMadrid(site.phase.results_at)}.</p>}
      </Notice>
    );
  }
  if (phase === "winners") {
    return (
      <Notice title="La votación ha terminado">
        <p>
          <Link href="/ganadores" className="btn btn-lime">
            Descubre a los ganadores
          </Link>
        </p>
      </Notice>
    );
  }

  if (step === "done" && receipt) return <Confirmation receipt={receipt} />;

  if (status && !status.configured) {
    return (
      <Notice title="La votación estará disponible en breve">
        <p>Estamos terminando de preparar el sistema de votación. Vuelve a intentarlo en unos minutos.</p>
      </Notice>
    );
  }
  if (status?.alreadyVoted && step !== "done") {
    return (
      <Notice title="Ya has votado">
        <p>Desde este dispositivo ya se ha registrado una papeleta. Solo se admite una papeleta por persona.</p>
        <p>
          <Link href="/comprobante" className="font-semibold underline decoration-lime decoration-2">
            Comprobar mi papeleta
          </Link>
        </p>
      </Notice>
    );
  }

  return (
    <div ref={topRef} className="scroll-mt-4">
      <Section className="pt-6">
        <p className="kicker text-mist">Votación popular · 2026</p>
        <h1 className="display mt-3 text-[clamp(2.5rem,9vw,4.6rem)]">{step === "review" ? "Revisa tu papeleta" : "Tu papeleta"}</h1>
        {step === "ballot" && (
          <ul className="mt-6 max-w-2xl space-y-2 text-[1.05rem] text-white/90">
            <li>Elige una candidatura en cada categoría que quieras votar.</li>
            <li>Puedes dejar categorías sin votar.</li>
            <li>Solo hay una papeleta por persona: una vez confirmada, no se puede cambiar.</li>
            {site.phase.voting_closes_at && <li className="text-mist">Puedes votar hasta el {formatMadrid(site.phase.voting_closes_at)}.</li>}
          </ul>
        )}
      </Section>

      {step === "ballot" && (
        <Section className="mt-10 pb-36">
          <div className="space-y-16">
            {cats.map((c, i) => (
              <div key={c.id}>
              {c.slug.endsWith("-cofrade") && !cats.slice(0, i).some((p) => p.slug.endsWith("-cofrade")) && <CofradeNotice />}
              <fieldset id={`categoria-${c.id}`} className="scroll-mt-6">
                <legend className="w-full">
                  <CategoryTag category={c} size="lg" />
                  <span className="display mt-3 block text-[clamp(1.8rem,6vw,2.8rem)]">{c.award_title ?? c.name}</span>
                  {c.question && <span className="mt-1 block max-w-2xl leading-snug text-white/80">{c.question}</span>}
                  {c.description && <span className="mt-2 block max-w-2xl font-semibold leading-snug text-white">{c.description}</span>}
                </legend>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {c.nominees.map((n) => {
                    const checked = selections[c.id] === n.id;
                    return (
                      <label
                        key={n.id}
                        className="group relative cursor-pointer rounded-[1.35rem] p-1.5 transition"
                        style={{
                          background: checked ? c.color : "rgba(255,255,255,0.06)",
                          boxShadow: checked ? `0 0 0 3px #fff, 0 18px 40px -18px ${c.color}` : undefined,
                        }}
                      >
                        <input
                          type="radio"
                          name={`cat-${c.id}`}
                          value={n.id}
                          checked={checked}
                          onChange={() => choose(c.id, n.id)}
                          onClick={() => checked && choose(c.id, null)}
                          className="peer sr-only"
                        />
                        <span className="relative block overflow-hidden rounded-[1rem] peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-lime">
                          {n.photo_portrait || n.photo_square ? (
                            <img src={n.photo_square ?? n.photo_portrait ?? ""} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                          ) : (
                            <span className="grid aspect-square w-full place-items-center bg-navy/60" aria-hidden="true">
                              <span className="display text-4xl text-white/80">{initials(n.name)}</span>
                            </span>
                          )}
                          <span
                            className={`absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full text-sm font-black transition ${checked ? "scale-100 bg-white text-navy" : "scale-90 bg-navy/60 text-transparent ring-2 ring-white/60"}`}
                            aria-hidden="true"
                          >
                            ✓
                          </span>
                        </span>
                        <span className="block px-1.5 pt-2.5 pb-1.5 text-[0.98rem] leading-tight font-bold" style={{ color: checked ? c.ink : "#fff" }}>
                          {n.name}
                          {n.subtitle && <span className="mt-0.5 block text-[0.8rem] font-semibold opacity-80">{n.subtitle}</span>}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p className="mt-3 text-sm text-mist" aria-live="polite">
                  {selections[c.id] ? (
                    <>
                      Has elegido <strong className="text-white">{c.nominees.find((n) => n.id === selections[c.id])?.name}</strong>.{" "}
                      <button type="button" className="underline" onClick={() => choose(c.id, null)}>
                        Quitar
                      </button>
                    </>
                  ) : (
                    "Sin votar en esta categoría."
                  )}
                </p>
              </fieldset>
              </div>
            ))}
          </div>
        </Section>
      )}

      {step === "ballot" && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-navy/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-bold">
                {count} de {cats.length} categorías
              </p>
              <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-white/15 sm:w-56" aria-hidden="true">
                <div className="h-full rounded-full bg-lime transition-all" style={{ width: `${(count / Math.max(1, cats.length)) * 100}%` }} />
              </div>
            </div>
            <button type="button" className="btn btn-lime" disabled={count === 0 || !status} onClick={() => goTo("review")}>
              Revisar papeleta
            </button>
          </div>
        </div>
      )}

      {step === "review" && (
        <Section className="mt-8 pb-16">
          <ol className="divide-y divide-white/15 rounded-[2rem] bg-night/45 ring-1 ring-white/15">
            {cats.map((c) => {
              const n = c.nominees.find((x) => x.id === selections[c.id]);
              return (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-7">
                  <CategoryTag category={c} size="sm" />
                  <span className={`text-right text-[1.05rem] ${n ? "font-extrabold" : "text-mist"}`}>{n ? n.name : "Sin votar"}</span>
                </li>
              );
            })}
          </ol>
          <div className="mt-8 rounded-[2rem] bg-white/[0.06] p-6 ring-1 ring-white/15 sm:p-8">
            <p className="text-lg font-bold">Antes de confirmar</p>
            <p className="mt-2 leading-snug text-white/85">
              Vas a votar en {count} {count === 1 ? "categoría" : "categorías"}. Una vez confirmada, tu papeleta no se puede modificar ni repetir.
            </p>
            <div className="mt-6">
              {site.turnstile_site_key ? <Turnstile siteKey={site.turnstile_site_key} onToken={onToken} /> : <p className="text-sm text-mist">Verificación anti-bots desactivada en este entorno de pruebas.</p>}
            </div>
            {error && (
              <p role="alert" className="mt-5 rounded-2xl bg-[#ff6b6b]/15 px-4 py-3 font-semibold text-white ring-1 ring-[#ff6b6b]/50">
                {error}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button type="button" className="btn btn-ghost" onClick={() => goTo("ballot")} disabled={sending}>
                Cambiar selección
              </button>
              <button type="button" className="btn btn-lime" onClick={submit} disabled={sending || (Boolean(site.turnstile_site_key) && !token)}>
                {sending ? "Enviando…" : "Confirmar mi voto"}
              </button>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}

function Confirmation({ receipt }: { receipt: { code: string; at: string; count: number } }) {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);
  const share = async () => {
    const url = window.location.origin;
    try {
      if (navigator.share) await navigator.share({ title: "Premios InfoLinense 2026", text: "Ya he votado en los Premios InfoLinense 2026. ¡Vota tú también!", url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
      }
    } catch {
      /* cancelado */
    }
  };
  return (
    <div className="relative overflow-hidden">
      <BrandCurve draw className="absolute -left-32 top-0 h-[70rem] w-[70rem] max-w-none" />
      <Section className="relative flex flex-col items-center pt-10 pb-10 text-center">
        <div className="w-[min(70vw,22rem)]">
          <Logo animate />
        </div>
        <p className="tag anim-rise anim-delay-1 mt-10 bg-lime text-sm text-navy">Papeleta registrada</p>
        <h1 ref={ref} tabIndex={-1} className="display anim-rise anim-delay-1 mt-5 text-[clamp(2.6rem,10vw,5rem)] outline-none">
          Gracias por votar.
        </h1>
        <p className="anim-rise anim-delay-2 mt-4 max-w-[32ch] text-xl leading-snug text-white/90">
          Tu voto en {receipt.count} {receipt.count === 1 ? "categoría" : "categorías"} ya forma parte de los Premios InfoLinense 2026.
        </p>
        <div className="anim-rise anim-delay-3 mt-10 w-full max-w-md rounded-[2rem] bg-night/55 p-6 ring-1 ring-white/20">
          <p className="kicker text-mist">Tu código de comprobante</p>
          <p className="mt-3 font-mono text-[clamp(1.5rem,7vw,2.1rem)] font-bold tracking-wider text-lime select-all">{receipt.code}</p>
          <p className="mt-3 text-sm text-mist">Guárdalo (por ejemplo, con una captura). Te permite comprobar que tu papeleta está registrada. No muestra a quién has votado.</p>
          <p className="mt-2 text-xs text-white/60">{formatMadrid(receipt.at)}</p>
        </div>
        <ThanksInfoLinense />
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button type="button" className="btn btn-primary" onClick={share}>
            {copied ? "Enlace copiado" : "Invita a votar"}
          </button>
          <Link href="/categorias" className="btn btn-ghost">
            Ver las candidaturas
          </Link>
        </div>
        <p className="mt-10 text-mist">Los ganadores se conocerán cuando termine la votación.</p>
      </Section>
    </div>
  );
}

export function ReceiptPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ found: boolean; status?: string; at?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const formatted = useMemo(() => code.toUpperCase().replace(/[^A-Z0-9-]/g, ""), [code]);
  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/vote/receipt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: formatted }) });
      const body = (await res.json()) as { found: boolean; status?: string; at?: string; message?: string };
      if (!res.ok) setError(body.message ?? "No se ha podido comprobar el código.");
      else setResult(body);
    } catch {
      setError("Sin conexión.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Section className="pt-10">
      <div className="mx-auto max-w-xl">
        <h1 className="display text-[clamp(2.3rem,8vw,3.6rem)]">Comprobar mi papeleta</h1>
        <p className="mt-4 text-lg text-white/85">Introduce el código que recibiste al votar. Solo indica si la papeleta está registrada, nunca su contenido.</p>
        <form onSubmit={check} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="codigo">
            Código de comprobante
          </label>
          <input
            id="codigo"
            value={formatted}
            onChange={(e) => setCode(e.target.value)}
            placeholder="PI26-XXXX-XXXX"
            autoComplete="off"
            spellCheck={false}
            maxLength={14}
            className="min-h-12 flex-1 rounded-full bg-white px-5 font-mono text-lg tracking-wider text-navy placeholder:text-navy/40"
          />
          <button type="submit" className="btn btn-lime" disabled={busy || formatted.length < 14}>
            {busy ? "Comprobando…" : "Comprobar"}
          </button>
        </form>
        <div aria-live="polite" className="mt-6">
          {error && <p className="rounded-2xl bg-[#ff6b6b]/15 px-4 py-3 ring-1 ring-[#ff6b6b]/50">{error}</p>}
          {result && !result.found && <p className="rounded-2xl bg-night/50 px-4 py-3 ring-1 ring-white/15">No hay ninguna papeleta con ese código.</p>}
          {result?.found && (
            <p className="rounded-2xl bg-night/50 px-4 py-3 ring-1 ring-white/15">
              Papeleta <strong className={result.status === "anulada" ? "text-[#ff9b9b]" : "text-lime"}>{result.status}</strong> el {formatMadrid(result.at)}.
              {result.status === "anulada" && " Si crees que es un error, escribe a la organización."}
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}

/** Aviso previo a los dos premios cofrades: son categorías independientes. */
function CofradeNotice() {
  return (
    <p role="note" className="mb-8 flex max-w-2xl gap-3 rounded-2xl bg-white px-5 py-4 text-[1.02rem] font-semibold leading-snug text-navy">
      <span aria-hidden="true" className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#080B8F] text-sm text-white">2</span>
      Los premios cofrades cuentan con dos categorías independientes. Puedes elegir un candidato en cada una.
    </p>
  );
}
