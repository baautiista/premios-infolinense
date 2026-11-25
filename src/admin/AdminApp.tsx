import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { PHASES, type Phase } from "../shared/phase";
import { countPending } from "../shared/markdown";
import { formatMadrid } from "../shared/time";
import { Markdown } from "../app/pages/info";
import { api, ApiError, cropTo, uploadImage } from "./api";

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "editor";
}
interface Category {
  id: number;
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
  nominee_count: number;
}
interface Nominee {
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

type Tab = "resumen" | "edicion" | "categorias" | "candidaturas" | "resultados" | "revision" | "incidencias" | "ganadores" | "patrocinadores" | "paginas" | "auditoria";
const TABS: { id: Tab; label: string; admin?: boolean }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "edicion", label: "Fases y fechas", admin: true },
  { id: "categorias", label: "Categorías" },
  { id: "candidaturas", label: "Candidaturas" },
  { id: "resultados", label: "Resultados", admin: true },
  { id: "revision", label: "Revisión de votos", admin: true },
  { id: "incidencias", label: "Incidencias", admin: true },
  { id: "ganadores", label: "Ganadores", admin: true },
  { id: "patrocinadores", label: "Patrocinadores" },
  { id: "paginas", label: "Páginas" },
  { id: "auditoria", label: "Auditoría" },
];

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

function askReason(question: string): string | null {
  const r = window.prompt(`${question}\n\nEl motivo queda registrado en la auditoría (mínimo 5 caracteres).`);
  if (r === null) return null;
  if (r.trim().length < 5) {
    window.alert("El motivo es obligatorio (mínimo 5 caracteres).");
    return null;
  }
  return r.trim();
}

/* ------------------------------------------------------------------ */
/* Piezas de interfaz                                                  */
/* ------------------------------------------------------------------ */

const input = "w-full rounded-xl border border-white/15 bg-night/60 px-3 py-2.5 text-white placeholder:text-white/35 focus:border-lime focus:outline-none";
const btn = "inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold transition disabled:opacity-50";
const btnPrimary = `${btn} bg-lime text-navy hover:brightness-105`;
const btnGhost = `${btn} border border-white/25 hover:bg-white/10`;
const btnDanger = `${btn} border border-[#ff8080]/60 text-[#ffb3b3] hover:bg-[#ff8080]/10`;

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-mist">{hint}</span>}
    </label>
  );
}

function Card({ title, children, actions }: { title?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-3xl bg-navy/70 p-5 ring-1 ring-white/10 sm:p-6">
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="text-lg font-extrabold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

function Stat({ label, value, tone = "white" }: { label: string; value: ReactNode; tone?: string }) {
  return (
    <div className="rounded-2xl bg-night/60 p-4 ring-1 ring-white/10">
      <p className="text-3xl font-black tabular-nums" style={{ color: tone }}>
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold text-mist">{label}</p>
    </div>
  );
}

function Tag({ name, color, ink }: { name: string; color: string; ink: string }) {
  return (
    <span className="tag text-[0.68rem]" style={{ background: color, color: ink }}>
      {name}
    </span>
  );
}

function useLoad<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setError(null);
    fn()
      .then((d) => alive && setData(d))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { data, error, reload: () => setTick((t) => t + 1), setData };
}

/* ------------------------------------------------------------------ */
/* Aplicación                                                          */
/* ------------------------------------------------------------------ */

export function AdminApp() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>(() => (location.hash.replace("#/", "") as Tab) || "resumen");
  const [toast, setToast] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    api<{ user: User }>("GET", "/me")
      .then((r) => setUser(r.user))
      .catch(() => setUser(null));
  }, []);
  useEffect(() => {
    const on = () => setTab((location.hash.replace("#/", "") as Tab) || "resumen");
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const notify = useCallback((kind: "ok" | "error", text: string) => setToast({ kind, text }), []);
  const run = useCallback(
    async (fn: () => Promise<unknown>, ok?: string) => {
      try {
        await fn();
        if (ok) notify("ok", ok);
        return true;
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) setUser(null);
        notify("error", e instanceof Error ? e.message : "Error");
        return false;
      }
    },
    [notify],
  );

  if (user === undefined) return <div className="grid min-h-screen place-items-center bg-night text-mist">Cargando…</div>;
  if (user === null) return <Login onLogin={setUser} />;

  const tabs = TABS.filter((t) => !t.admin || user.role === "admin");
  const active = tabs.some((t) => t.id === tab) ? tab : "resumen";
  const ctx = { user, run, notify };

  return (
    <div className="min-h-screen bg-night text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-night/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <img src="/brand/logo-premios-infolinense.png" alt="Premios InfoLinense" className="h-9 w-auto" />
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold">Panel</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-mist sm:inline">
              {user.name} · {user.role === "admin" ? "Administración" : "Edición"}
            </span>
            <a href="/" target="_blank" rel="noreferrer" className={btnGhost}>
              Ver web
            </a>
            <button type="button" className={btnGhost} onClick={() => api("POST", "/logout").finally(() => setUser(null))}>
              Salir
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2" aria-label="Secciones">
          {tabs.map((t) => (
            <a
              key={t.id}
              href={`#/${t.id}`}
              aria-current={active === t.id ? "page" : undefined}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold ${active === t.id ? "bg-white text-navy" : "text-white/80 hover:bg-white/10"}`}
            >
              {t.label}
            </a>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        {active === "resumen" && <Overview {...ctx} />}
        {active === "edicion" && <Edition {...ctx} />}
        {active === "categorias" && <Categories {...ctx} />}
        {active === "candidaturas" && <Nominees {...ctx} />}
        {active === "resultados" && <Results {...ctx} />}
        {active === "revision" && <Review {...ctx} />}
        {active === "incidencias" && <Incidents {...ctx} />}
        {active === "ganadores" && <Winners {...ctx} />}
        {active === "patrocinadores" && <Sponsors {...ctx} />}
        {active === "paginas" && <Pages {...ctx} />}
        {active === "auditoria" && <Audit />}
      </main>
      {toast && (
        <div
          role="status"
          className={`fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-md rounded-2xl px-5 py-3.5 font-semibold shadow-2xl sm:left-auto ${toast.kind === "ok" ? "bg-lime text-navy" : "bg-[#ff6b6b] text-white"}`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}

interface Ctx {
  user: User;
  run: (fn: () => Promise<unknown>, ok?: string) => Promise<boolean>;
  notify: (kind: "ok" | "error", text: string) => void;
}

function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ user: User }>("POST", "/login", { email, password });
      onLogin(r.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="grid min-h-screen place-items-center px-4" style={{ background: "linear-gradient(to bottom left,#154DD5,#081D61)" }}>
      <form onSubmit={submit} className="w-full max-w-sm rounded-[2rem] bg-night/80 p-7 ring-1 ring-white/15">
        <img src="/brand/logo-premios-infolinense.png" alt="Premios InfoLinense 2026" className="mx-auto w-56" />
        <h1 className="mt-6 text-center text-xl font-extrabold">Acceso al panel</h1>
        <div className="mt-6 space-y-4">
          <Field label="Correo">
            <input className={input} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Contraseña">
            <input className={input} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
        </div>
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-[#ff6b6b]/15 px-3 py-2 text-sm ring-1 ring-[#ff6b6b]/40">
            {error}
          </p>
        )}
        <button type="submit" className={`${btnPrimary} mt-6 w-full`} disabled={busy}>
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Resumen                                                             */
/* ------------------------------------------------------------------ */

function Overview({ user }: Ctx) {
  const { data, error } = useLoad(() =>
    api<{
      phase: Phase;
      configuredPhase: Phase;
      settings: Record<string, string | number | null>;
      missingSecrets: string[];
      counts: Record<string, number>;
      ballots: Record<string, number> | null;
    }>("GET", "/overview"),
  );
  if (error) return <Card>{error}</Card>;
  if (!data) return <Card>Cargando…</Card>;
  const phaseLabel = (p: Phase) => PHASES.find((x) => x.id === p)?.label ?? p;
  return (
    <>
      {data.missingSecrets.length > 0 && (
        <div className="rounded-3xl bg-[#ff6b6b]/15 p-5 ring-1 ring-[#ff6b6b]/50">
          <p className="font-extrabold">Configuración incompleta: la votación no funcionará hasta completarla.</p>
          <p className="mt-1 text-sm">Faltan: {data.missingSecrets.join(", ")}. Consulta docs/DESPLIEGUE.md.</p>
        </div>
      )}
      <Card title="Estado de la edición">
        <p className="text-2xl font-black">{phaseLabel(data.phase)}</p>
        {data.phase !== data.configuredPhase && (
          <p className="mt-1 text-sm text-mist">
            Fase configurada: {phaseLabel(data.configuredPhase)}. Las fechas programadas la han hecho avanzar automáticamente.
          </p>
        )}
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Presentación", data.settings.announce_at],
            ["Apertura de votación", data.settings.voting_opens_at],
            ["Cierre de votación", data.settings.voting_closes_at],
            ["Publicación de ganadores", data.settings.results_at],
          ].map(([k, v]) => (
            <div key={k as string} className="rounded-2xl bg-night/60 p-3">
              <dt className="text-mist">{k}</dt>
              <dd className="mt-1 font-bold">{v ? formatMadrid(v as string) : "Sin fecha"}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Candidaturas publicadas" value={data.counts.published ?? 0} />
        <Stat label="Sin fotografía" value={data.counts.no_photo ?? 0} tone={(data.counts.no_photo ?? 0) > 0 ? "#FFB627" : "#C8F031"} />
        <Stat label="Sin motivo de nominación" value={data.counts.no_reason ?? 0} tone={(data.counts.no_reason ?? 0) > 0 ? "#FFB627" : "#C8F031"} />
        <Stat label="Candidaturas alternativas" value={data.counts.alternates ?? 0} />
        {user.role === "admin" && data.ballots && (
          <>
            <Stat label="Papeletas válidas" value={data.ballots.valid ?? 0} tone="#C8F031" />
            <Stat label="En revisión" value={data.ballots.review ?? 0} tone="#FFB627" />
            <Stat label="Anuladas" value={data.ballots.annulled ?? 0} tone="#ff9b9b" />
            <Stat label="Incidencias (24 h)" value={data.counts.incidents24h ?? 0} />
          </>
        )}
      </div>
      <p className="text-sm text-mist">Los recuentos solo son visibles en este panel; ningún endpoint público los expone.</p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Fases y fechas                                                      */
/* ------------------------------------------------------------------ */

function Edition({ run }: Ctx) {
  const { data, reload } = useLoad(() => api<{ settings: Record<string, string | number | null>; effective: Phase }>("GET", "/settings"));
  const [form, setForm] = useState<Record<string, string | number>>({});
  useEffect(() => {
    if (data) setForm(Object.fromEntries(Object.entries(data.settings).map(([k, v]) => [k, v ?? ""])) as Record<string, string | number>);
  }, [data]);
  if (!data) return <Card>Cargando…</Card>;
  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));
  const save = async (confirmIncomplete = false) => {
    const reason = askReason("¿Por qué cambias la configuración de la edición?");
    if (!reason) return;
    const body = {
      phase: form.phase,
      announce_at_local: form.announce_at_local,
      voting_opens_at_local: form.voting_opens_at_local,
      voting_closes_at_local: form.voting_closes_at_local,
      results_at_local: form.results_at_local,
      nominee_order: form.nominee_order,
      soft_network_limit: Number(form.soft_network_limit),
      hard_network_limit: Number(form.hard_network_limit),
      contact_email: form.contact_email,
      instagram_url: form.instagram_url,
      reason,
      confirm_incomplete: confirmIncomplete,
    };
    try {
      await api("PUT", "/settings", body);
      reload();
      run(async () => undefined, "Configuración guardada");
    } catch (e) {
      if (e instanceof ApiError && e.code === "winners_incomplete" && window.confirm(`${e.message}`)) return save(true);
      run(async () => {
        throw e;
      });
    }
  };
  return (
    <>
      <Card title="Fase de la edición">
        <p className="mb-4 text-sm text-mist">
          Fase en vigor ahora: <strong className="text-white">{PHASES.find((p) => p.id === data.effective)?.label}</strong>. Si fijas fechas, la web avanza sola: se
          abre y se cierra la votación a su hora, y los ganadores nunca se muestran antes de la fecha de publicación.
        </p>
        <div className="grid gap-2 md:grid-cols-5">
          {PHASES.map((p) => (
            <label key={p.id} className={`cursor-pointer rounded-2xl p-3 ring-1 ${form.phase === p.id ? "bg-lime text-navy ring-lime" : "bg-night/60 ring-white/10"}`}>
              <input type="radio" name="phase" className="sr-only" checked={form.phase === p.id} onChange={() => set("phase", p.id)} />
              <span className="block text-sm font-extrabold">{p.label}</span>
              <span className="mt-1 block text-xs opacity-80">{p.help}</span>
            </label>
          ))}
        </div>
      </Card>
      <Card title="Fechas (hora peninsular, Europe/Madrid)">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["announce_at_local", "Presentación de candidaturas", "Cuenta atrás de la fase 1"],
            ["voting_opens_at_local", "Apertura de la votación", "Vacía = apertura manual"],
            ["voting_closes_at_local", "Cierre de la votación", "Obligatoria para mostrar la cuenta atrás"],
            ["results_at_local", "Publicación de ganadores", "Hasta esta hora los ganadores permanecen ocultos"],
          ].map(([k, label, hint]) => (
            <Field key={k} label={label} hint={hint}>
              <div className="flex gap-2">
                <input type="datetime-local" className={input} value={String(form[k] ?? "")} onChange={(e) => set(k, e.target.value)} />
                {form[k] && (
                  <button type="button" className={btnGhost} onClick={() => set(k, "")}>
                    Quitar
                  </button>
                )}
              </div>
            </Field>
          ))}
        </div>
      </Card>
      <Card title="Presentación y control de votos">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Orden de las candidaturas" hint="Aleatorio: cambia en cada visita para no favorecer a nadie.">
            <select className={input} value={String(form.nominee_order ?? "random")} onChange={(e) => set("nominee_order", e.target.value)}>
              <option value="random">Aleatorio en cada visita</option>
              <option value="alpha">Alfabético</option>
              <option value="manual">Manual (campo «orden»)</option>
            </select>
          </Field>
          <Field label="Revisión a partir de" hint="Papeletas al día desde una misma conexión antes de marcar las siguientes para revisión (0 = nunca).">
            <input type="number" min={0} className={input} value={form.soft_network_limit ?? 4} onChange={(e) => set("soft_network_limit", e.target.value)} />
          </Field>
          <Field label="Máximo por conexión y día" hint="A partir de aquí se rechaza la papeleta (0 = sin límite). Ten en cuenta institutos y redes compartidas.">
            <input type="number" min={0} className={input} value={form.hard_network_limit ?? 40} onChange={(e) => set("hard_network_limit", e.target.value)} />
          </Field>
          <Field label="Correo de contacto">
            <input className={input} value={String(form.contact_email ?? "")} onChange={(e) => set("contact_email", e.target.value)} />
          </Field>
          <Field label="Instagram">
            <input className={input} value={String(form.instagram_url ?? "")} onChange={(e) => set("instagram_url", e.target.value)} />
          </Field>
        </div>
      </Card>
      <div className="flex justify-end">
        <button type="button" className={btnPrimary} onClick={() => save()}>
          Guardar configuración
        </button>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Categorías                                                          */
/* ------------------------------------------------------------------ */

const EMPTY_CAT: Partial<Category> = { name: "", slug: "", color: "#1F5EFF", ink: "#FFFFFF", slots: 5, votable: 1, published: 1, position: 99 };

function Categories({ run, user }: Ctx) {
  const { data, reload } = useLoad(() => api<{ categories: Category[] }>("GET", "/categories"));
  const [edit, setEdit] = useState<Partial<Category> | null>(null);
  const save = async () => {
    if (!edit) return;
    const ok = await run(() => (edit.id ? api("PUT", `/categories/${edit.id}`, edit) : api("POST", "/categories", edit)), "Categoría guardada");
    if (ok) {
      setEdit(null);
      reload();
    }
  };
  const remove = async (c: Category) => {
    const reason = askReason(`¿Eliminar la categoría «${c.name}» y sus candidaturas? Si ya tiene votos, no se podrá.`);
    if (!reason) return;
    if (await run(() => api("DELETE", `/categories/${c.id}`, { reason }), "Categoría eliminada")) reload();
  };
  return (
    <>
      <Card title="Categorías" actions={<button className={btnPrimary} onClick={() => setEdit({ ...EMPTY_CAT })}>Nueva categoría</button>}>
        <ul className="divide-y divide-white/10">
          {(data?.categories ?? []).map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-6 text-right text-sm text-mist tabular-nums">{c.position}</span>
                <Tag name={c.name} color={c.color} ink={c.ink} />
                <span className="truncate text-sm text-mist">{c.award_title}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className={c.nominee_count < c.slots && c.votable ? "text-[#FFB627]" : "text-mist"}>
                  {c.votable ? `${c.nominee_count}/${c.slots} candidaturas` : "Sin votación"}
                </span>
                {!c.published && <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">Oculta</span>}
                <button className={btnGhost} onClick={() => setEdit(c)}>
                  Editar
                </button>
                {user.role === "admin" && (
                  <button className={btnDanger} onClick={() => remove(c)}>
                    Eliminar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
      {edit && (
        <Card title={edit.id ? `Editar «${edit.name}»` : "Nueva categoría"} actions={<Tag name={edit.name || "Categoría"} color={edit.color ?? "#1F5EFF"} ink={edit.ink ?? "#FFFFFF"} />}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nombre">
              <input className={input} value={edit.name ?? ""} onChange={(e) => setEdit({ ...edit, name: e.target.value, slug: edit.id ? edit.slug : slugify(e.target.value) })} />
            </Field>
            <Field label="Dirección (slug)" hint={`/categorias/${edit.slug || "…"}`}>
              <input className={input} value={edit.slug ?? ""} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} />
            </Field>
            <Field label="Título del premio" hint="Ej.: «Deportista del año»">
              <input className={input} value={edit.award_title ?? ""} onChange={(e) => setEdit({ ...edit, award_title: e.target.value })} />
            </Field>
            <Field label="Pregunta de la campaña">
              <input className={input} value={edit.question ?? ""} onChange={(e) => setEdit({ ...edit, question: e.target.value })} />
            </Field>
            <Field label="Nota sobre las candidaturas" hint="Ej.: «Candidaturas propuestas por los vecinos»">
              <input className={input} value={edit.nomination_note ?? ""} onChange={(e) => setEdit({ ...edit, nomination_note: e.target.value })} />
            </Field>
            <Field label="Descripción ampliada (opcional)">
              <textarea rows={2} className={input} value={edit.description ?? ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Color identificativo">
                <input type="color" className="h-11 w-full rounded-xl bg-transparent" value={edit.color ?? "#1F5EFF"} onChange={(e) => setEdit({ ...edit, color: e.target.value })} />
              </Field>
              <Field label="Color del texto">
                <select className={input} value={edit.ink ?? "#FFFFFF"} onChange={(e) => setEdit({ ...edit, ink: e.target.value })}>
                  <option value="#FFFFFF">Blanco</option>
                  <option value="#081A54">Azul noche</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Número de candidaturas">
                <input type="number" min={0} max={20} className={input} value={edit.slots ?? 5} onChange={(e) => setEdit({ ...edit, slots: Number(e.target.value) })} />
              </Field>
              <Field label="Orden">
                <input type="number" min={0} className={input} value={edit.position ?? 0} onChange={(e) => setEdit({ ...edit, position: Number(e.target.value) })} />
              </Field>
            </div>
            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={Boolean(edit.votable)} onChange={(e) => setEdit({ ...edit, votable: e.target.checked ? 1 : 0 })} /> Votación popular
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={Boolean(edit.published)} onChange={(e) => setEdit({ ...edit, published: e.target.checked ? 1 : 0 })} /> Publicada
              </label>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button className={btnGhost} onClick={() => setEdit(null)}>
              Cancelar
            </button>
            <button className={btnPrimary} onClick={save}>
              Guardar
            </button>
          </div>
        </Card>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Candidaturas                                                        */
/* ------------------------------------------------------------------ */

function PhotoEditor({ value, onChange, run }: { value: Nominee; onChange: (patch: Partial<Nominee>) => void; run: Ctx["run"] }) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [focus, setFocus] = useState({ x: 0.5, y: 0.4 });
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pick = (f: File | undefined) => {
    if (!f) return;
    if (f.size > 25 * 1024 * 1024) return window.alert("La imagen original supera 25 MB.");
    const url = URL.createObjectURL(f);
    const i = new Image();
    i.onload = () => {
      setImg(i);
      setFocus({ x: 0.5, y: 0.4 });
    };
    i.src = url;
  };
  const crops = [
    { kind: "portrait", w: 1080, h: 1350, label: "4:5 · retrato", field: "photo_portrait" as const },
    { kind: "square", w: 800, h: 800, label: "1:1 · papeleta", field: "photo_square" as const },
    { kind: "wide", w: 1200, h: 630, label: "1,91:1 · redes", field: "photo_wide" as const },
  ];
  const upload = async () => {
    if (!img) return;
    setBusy(true);
    const ok = await run(async () => {
      const patch: Partial<Nominee> = {};
      for (const c of crops) patch[c.field] = await uploadImage(await cropTo(img, focus, c.w, c.h), c.kind);
      onChange(patch);
    }, "Fotografías recortadas y subidas. Guarda la candidatura para publicarlas.");
    if (ok) setImg(null);
    setBusy(false);
  };
  const previewStyle = (w: number, h: number) => ({
    aspectRatio: `${w} / ${h}`,
    backgroundImage: img ? `url(${img.src})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: `${focus.x * 100}% ${focus.y * 100}%`,
  });
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {value.photo_portrait ? <img src={value.photo_portrait} alt="" className="h-28 w-[5.6rem] rounded-xl object-cover" /> : <div className="grid h-28 w-[5.6rem] place-items-center rounded-xl bg-white/5 text-xs text-mist">Sin foto</div>}
        <div className="space-y-2">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
          <button type="button" className={btnGhost} onClick={() => fileRef.current?.click()}>
            {value.photo_portrait ? "Cambiar fotografía" : "Subir fotografía"}
          </button>
          {value.photo_portrait && (
            <button type="button" className={`${btnDanger} ml-2`} onClick={() => onChange({ photo_portrait: null, photo_square: null, photo_wide: null })}>
              Quitar
            </button>
          )}
          <p className="text-xs text-mist">Se generan automáticamente los recortes 4:5, 1:1 y 1,91:1.</p>
        </div>
      </div>
      {img && (
        <div className="rounded-2xl bg-night/60 p-4 ring-1 ring-white/10">
          <p className="mb-3 text-sm font-semibold">Pulsa sobre la imagen para marcar el punto que no debe recortarse (normalmente, la cara).</p>
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div
              className="relative cursor-crosshair overflow-hidden rounded-xl"
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setFocus({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
              }}
            >
              <img src={img.src} alt="Imagen original" className="w-full" />
              <span className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-lime shadow" style={{ left: `${focus.x * 100}%`, top: `${focus.y * 100}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-2">
              {crops.map((c) => (
                <figure key={c.kind}>
                  <div className="w-full rounded-lg bg-navy" style={previewStyle(c.w, c.h)} />
                  <figcaption className="mt-1 text-xs text-mist">{c.label}</figcaption>
                </figure>
              ))}
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className={btnGhost} onClick={() => setImg(null)}>
              Cancelar
            </button>
            <button type="button" className={btnPrimary} onClick={upload} disabled={busy}>
              {busy ? "Subiendo…" : "Recortar y subir"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Nominees({ run, user }: Ctx) {
  const cats = useLoad(() => api<{ categories: Category[] }>("GET", "/categories"));
  const { data, reload } = useLoad(() => api<{ nominees: Nominee[] }>("GET", "/nominees"));
  const [filter, setFilter] = useState<number | "all">("all");
  const [edit, setEdit] = useState<Nominee | null>(null);
  const categories = cats.data?.categories ?? [];
  const catOf = (id: number) => categories.find((c) => c.id === id);
  const list = (data?.nominees ?? []).filter((n) => filter === "all" || n.category_id === filter);

  const blank = (): Nominee => ({
    id: 0,
    category_id: typeof filter === "number" ? filter : (categories[0]?.id ?? 0),
    slug: "",
    name: "",
    subtitle: null,
    reason: null,
    bio: null,
    merits: null,
    links: null,
    photo_portrait: null,
    photo_square: null,
    photo_wide: null,
    photo_alt: null,
    photo_credit: null,
    published: 1,
    is_alternate: 0,
    position: 0,
  });
  const save = async () => {
    if (!edit) return;
    const ok = await run(() => (edit.id ? api("PUT", `/nominees/${edit.id}`, edit) : api("POST", "/nominees", edit)), "Candidatura guardada");
    if (ok) {
      setEdit(null);
      reload();
      cats.reload();
    }
  };
  const remove = async (n: Nominee) => {
    const reason = askReason(`¿Eliminar «${n.name}»? Si ya tiene votos no se podrá: despublícala en su lugar.`);
    if (!reason) return;
    if (await run(() => api("DELETE", `/nominees/${n.id}`, { reason }), "Candidatura eliminada")) reload();
  };
  const promote = async (n: Nominee) => {
    if (!window.confirm(`¿Publicar «${n.name}» como candidatura? Recuerda despublicar la candidatura a la que sustituye.`)) return;
    if (await run(() => api("PUT", `/nominees/${n.id}`, { ...n, is_alternate: 0, published: 1 }), "Alternativa publicada")) reload();
  };

  return (
    <>
      <Card
        title="Candidaturas"
        actions={
          <div className="flex flex-wrap gap-2">
            <select className={`${input} w-auto`} value={String(filter)} onChange={(e) => setFilter(e.target.value === "all" ? "all" : Number(e.target.value))}>
              <option value="all">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button className={btnPrimary} onClick={() => setEdit(blank())}>
              Nueva candidatura
            </button>
          </div>
        }
      >
        <ul className="divide-y divide-white/10">
          {list.map((n) => {
            const c = catOf(n.category_id);
            return (
              <li key={n.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  {n.photo_square ? <img src={n.photo_square} alt="" className="h-11 w-11 rounded-full object-cover" /> : <span className="h-11 w-11 rounded-full bg-white/10" />}
                  <div className="min-w-0">
                    <p className="truncate font-bold">
                      {n.name} {n.subtitle && <span className="font-medium text-mist">· {n.subtitle}</span>}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      {c && <Tag name={c.name} color={c.color} ink={c.ink} />}
                      {n.is_alternate ? <span className="rounded-full bg-[#FFB627] px-2 py-0.5 font-bold text-navy">Alternativa</span> : null}
                      {!n.published && !n.is_alternate ? <span className="rounded-full bg-white/15 px-2 py-0.5">Oculta</span> : null}
                      {!n.photo_portrait && <span className="text-[#FFB627]">Sin foto</span>}
                      {!n.reason && <span className="text-[#FFB627]">Sin motivo</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {n.is_alternate ? (
                    <button className={btnGhost} onClick={() => promote(n)}>
                      Publicar como sustituta
                    </button>
                  ) : null}
                  <button className={btnGhost} onClick={() => setEdit(n)}>
                    Editar
                  </button>
                  {user.role === "admin" && (
                    <button className={btnDanger} onClick={() => remove(n)}>
                      Eliminar
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
      {edit && (
        <Card title={edit.id ? `Editar «${edit.name}»` : "Nueva candidatura"}>
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-4">
              <Field label="Categoría">
                <select className={input} value={edit.category_id} onChange={(e) => setEdit({ ...edit, category_id: Number(e.target.value) })}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Nombre">
                <input className={input} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value, slug: edit.id ? edit.slug : slugify(e.target.value) })} />
              </Field>
              <Field label="Subtítulo (opcional)" hint="Ej.: personas que forman el proyecto">
                <input className={input} value={edit.subtitle ?? ""} onChange={(e) => setEdit({ ...edit, subtitle: e.target.value })} />
              </Field>
              <Field label="Enlace permanente (slug)" hint={`/nominados/${edit.slug || "…"}`}>
                <input className={input} value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} />
              </Field>
              <Field label="Motivo de la nominación" hint="Una o dos frases. Se muestra en la ficha y en las tarjetas.">
                <textarea rows={3} className={input} value={edit.reason ?? ""} onChange={(e) => setEdit({ ...edit, reason: e.target.value })} />
              </Field>
              <Field label="Presentación ampliada" hint="Separa los párrafos con una línea en blanco.">
                <textarea rows={6} className={input} value={edit.bio ?? ""} onChange={(e) => setEdit({ ...edit, bio: e.target.value })} />
              </Field>
              <Field label="Méritos de 2026" hint="Uno por línea.">
                <textarea rows={4} className={input} value={edit.merits ?? ""} onChange={(e) => setEdit({ ...edit, merits: e.target.value })} />
              </Field>
              <Field label="Enlaces" hint="Uno por línea: Texto | https://…">
                <textarea rows={2} className={input} value={edit.links ?? ""} onChange={(e) => setEdit({ ...edit, links: e.target.value })} />
              </Field>
            </div>
            <div className="space-y-4">
              <PhotoEditor value={edit} onChange={(p) => setEdit({ ...edit, ...p })} run={run} />
              <Field label="Texto alternativo de la foto" hint="Describe la imagen para personas que usan lector de pantalla.">
                <input className={input} value={edit.photo_alt ?? ""} onChange={(e) => setEdit({ ...edit, photo_alt: e.target.value })} />
              </Field>
              <Field label="Crédito de la foto">
                <input className={input} value={edit.photo_credit ?? ""} onChange={(e) => setEdit({ ...edit, photo_credit: e.target.value })} />
              </Field>
              <Field label="Orden manual">
                <input type="number" className={input} value={edit.position} onChange={(e) => setEdit({ ...edit, position: Number(e.target.value) })} />
              </Field>
              <div className="flex flex-col gap-3 pt-2">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={Boolean(edit.published)} disabled={Boolean(edit.is_alternate)} onChange={(e) => setEdit({ ...edit, published: e.target.checked ? 1 : 0 })} /> Publicada
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={Boolean(edit.is_alternate)} onChange={(e) => setEdit({ ...edit, is_alternate: e.target.checked ? 1 : 0, published: e.target.checked ? 0 : edit.published })} />{" "}
                  Candidatura alternativa (no pública)
                </label>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button className={btnGhost} onClick={() => setEdit(null)}>
              Cancelar
            </button>
            <button className={btnPrimary} onClick={save}>
              Guardar candidatura
            </button>
          </div>
        </Card>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Resultados                                                          */
/* ------------------------------------------------------------------ */

interface ResultsData {
  totals: Record<string, number>;
  daily: { day: string; valid: number; review: number; annulled: number }[];
  categories: { id: number; name: string; color: string; tie: boolean; winner_nominee_id: number | null; nominees: { nominee_id: number; nominee: string; valid: number; review: number; annulled: number }[] }[];
}

async function downloadCsv(run: Ctx["run"]) {
  await run(async () => {
    const res = await fetch("/api/admin/results.csv", { headers: { "X-Premios-Admin": "1" }, credentials: "same-origin" });
    if (!res.ok) throw new Error("No se pudo descargar");
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `premios-infolinense-resultados-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }, "CSV descargado (queda registrado en la auditoría)");
}

function Results({ run }: Ctx) {
  const { data, reload } = useLoad(() => api<ResultsData>("GET", "/results"));
  if (!data) return <Card>Cargando…</Card>;
  const maxDay = Math.max(1, ...data.daily.map((d) => d.valid + d.review + d.annulled));
  return (
    <>
      <div className="rounded-3xl bg-[#FFB627]/15 p-4 text-sm ring-1 ring-[#FFB627]/40">
        Información confidencial. Solo se cuentan como válidos los votos de papeletas en estado «válida». Las papeletas en revisión no suman hasta que se validen.
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Papeletas válidas" value={data.totals.valid ?? 0} tone="#C8F031" />
        <Stat label="En revisión" value={data.totals.review ?? 0} tone="#FFB627" />
        <Stat label="Anuladas" value={data.totals.annulled ?? 0} tone="#ff9b9b" />
      </div>
      <Card
        title="Papeletas por día"
        actions={
          <div className="flex gap-2">
            <button className={btnGhost} onClick={reload}>
              Actualizar
            </button>
            <button className={btnPrimary} onClick={() => downloadCsv(run)}>
              Descargar CSV
            </button>
          </div>
        }
      >
        {data.daily.length === 0 ? (
          <p className="text-mist">Todavía no hay papeletas.</p>
        ) : (
          <div className="flex h-40 items-end gap-1.5 overflow-x-auto" role="img" aria-label="Gráfico de papeletas por día">
            {data.daily.map((d) => (
              <div key={d.day} className="flex min-w-8 max-w-16 flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-col-reverse overflow-hidden rounded-t-md" style={{ height: `${((d.valid + d.review + d.annulled) / maxDay) * 120}px` }}>
                  <div className="bg-lime" style={{ flex: d.valid }} />
                  <div className="bg-[#FFB627]" style={{ flex: d.review }} />
                  <div className="bg-[#ff9b9b]" style={{ flex: d.annulled }} />
                </div>
                <span className="text-[0.65rem] text-mist">{d.day.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        {data.categories.map((c) => {
          const max = Math.max(1, ...c.nominees.map((n) => n.valid));
          return (
            <Card key={c.id} title={c.name} actions={c.tie ? <span className="rounded-full bg-[#FFB627] px-2.5 py-1 text-xs font-bold text-navy">Empate en cabeza</span> : undefined}>
              <ul className="space-y-2.5">
                {c.nominees.map((n) => (
                  <li key={n.nominee_id}>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="font-semibold">{n.nominee}</span>
                      <span className="tabular-nums">
                        <strong>{n.valid}</strong>
                        {n.review > 0 && <span className="text-[#FFB627]"> +{n.review} en revisión</span>}
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full" style={{ width: `${(n.valid / max) * 100}%`, background: c.color }} />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Revisión de papeletas e incidencias                                 */
/* ------------------------------------------------------------------ */

interface BallotRow {
  id: number;
  status: string;
  flags: string | null;
  created_at: string;
  net: string | null;
  signal: string | null;
  device: string;
  net_total: number;
  selections: string | null;
  review_reason: string | null;
  reviewed_by: string | null;
}

function Review({ run }: Ctx) {
  const [status, setStatus] = useState<"review" | "valid" | "annulled">("review");
  const { data, reload } = useLoad(() => api<{ ballots: BallotRow[]; networks: Record<string, string | number>[] }>("GET", `/ballots?status=${status}`), [status]);
  const [sel, setSel] = useState<Set<number>>(new Set());
  useEffect(() => setSel(new Set()), [status, data]);
  const act = async (action: "annul" | "validate" | "restore") => {
    const labels = { annul: "anular", validate: "validar", restore: "restaurar" };
    const reason = askReason(`¿Por qué quieres ${labels[action]} ${sel.size} papeleta(s)?`);
    if (!reason) return;
    if (await run(() => api("POST", `/ballots/${action}`, { ids: [...sel], reason }), "Cambios registrados en la auditoría")) reload();
  };
  const toggleNet = (net: string | null) => {
    const ids = (data?.ballots ?? []).filter((b) => b.net === net).map((b) => b.id);
    setSel((s) => {
      const n = new Set(s);
      const all = ids.every((i) => n.has(i));
      ids.forEach((i) => (all ? n.delete(i) : n.add(i)));
      return n;
    });
  };
  return (
    <>
      <Card title="Conexiones con más papeletas">
        <p className="mb-3 text-sm text-mist">Identificadores seudonimizados (nunca la IP). Una red compartida no implica fraude: revisa el ritmo y las selecciones.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-mist">
              <tr>
                <th className="py-2 pr-4">Conexión</th>
                <th className="pr-4">Total</th>
                <th className="pr-4">En revisión</th>
                <th className="pr-4">Anuladas</th>
                <th className="pr-4">Primera</th>
                <th>Última</th>
              </tr>
            </thead>
            <tbody>
              {(data?.networks ?? []).map((n) => (
                <tr key={String(n.net)} className="border-t border-white/10">
                  <td className="py-2 pr-4 font-mono">{n.net}</td>
                  <td className="pr-4 font-bold">{n.total}</td>
                  <td className="pr-4">{n.review}</td>
                  <td className="pr-4">{n.annulled}</td>
                  <td className="pr-4">{formatMadrid(String(n.first))}</td>
                  <td>{formatMadrid(String(n.last))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card
        title="Papeletas"
        actions={
          <div className="flex flex-wrap gap-2">
            {(["review", "valid", "annulled"] as const).map((s) => (
              <button key={s} className={status === s ? btnPrimary : btnGhost} onClick={() => setStatus(s)}>
                {s === "review" ? "En revisión" : s === "valid" ? "Válidas" : "Anuladas"}
              </button>
            ))}
          </div>
        }
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-mist">{sel.size} seleccionadas</span>
          {status !== "annulled" && (
            <button className={btnDanger} disabled={!sel.size} onClick={() => act("annul")}>
              Anular
            </button>
          )}
          {status === "review" && (
            <button className={btnPrimary} disabled={!sel.size} onClick={() => act("validate")}>
              Validar
            </button>
          )}
          {status === "annulled" && (
            <button className={btnGhost} disabled={!sel.size} onClick={() => act("restore")}>
              Restaurar
            </button>
          )}
        </div>
        <div className="max-h-[60vh] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-navy text-mist">
              <tr>
                <th className="py-2 pr-2">
                  <span className="sr-only">Seleccionar</span>
                </th>
                <th className="pr-3">Fecha</th>
                <th className="pr-3">Conexión</th>
                <th className="pr-3">Motivo</th>
                <th>Selecciones</th>
              </tr>
            </thead>
            <tbody>
              {(data?.ballots ?? []).map((b) => (
                <tr key={b.id} className="border-t border-white/10 align-top">
                  <td className="py-2 pr-2">
                    <input
                      type="checkbox"
                      aria-label={`Papeleta ${b.id}`}
                      checked={sel.has(b.id)}
                      onChange={() =>
                        setSel((s) => {
                          const n = new Set(s);
                          if (n.has(b.id)) n.delete(b.id);
                          else n.add(b.id);
                          return n;
                        })
                      }
                    />
                  </td>
                  <td className="pr-3 whitespace-nowrap">{formatMadrid(b.created_at)}</td>
                  <td className="pr-3">
                    <button className="font-mono underline" title="Seleccionar todas las de esta conexión" onClick={() => toggleNet(b.net)}>
                      {b.net ?? "—"}
                    </button>
                    <span className="block text-xs text-mist">{b.net_total} en total</span>
                  </td>
                  <td className="pr-3 text-xs">
                    {b.flags?.replace(/_/g, " ")}
                    {b.review_reason && (
                      <span className="block text-mist">
                        {b.review_reason} ({b.reviewed_by})
                      </span>
                    )}
                  </td>
                  <td className="text-xs text-white/85">{b.selections}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data && data.ballots.length === 0 && <p className="py-6 text-center text-mist">No hay papeletas en este estado.</p>}
        </div>
      </Card>
    </>
  );
}

function Incidents({ run }: Ctx) {
  const { data, reload } = useLoad(() =>
    api<{ events: { id: number; type: string; severity: string; net: string | null; device: string | null; detail: string | null; created_at: string }[]; summary: { type: string; severity: string; n: number; last: string }[] }>("GET", "/events"),
  );
  const labels: Record<string, string> = {
    rate_limited: "Exceso de intentos",
    turnstile_failed: "Verificación anti-bots fallida",
    ballot_tampered: "Papeleta manipulada",
    duplicate_device: "Intento de voto repetido (dispositivo)",
    duplicate_race: "Envío duplicado simultáneo",
    network_hard_limit: "Límite de conexión alcanzado",
    ballot_flagged: "Papeleta enviada a revisión",
    admin_login_failed: "Acceso al panel fallido",
    admin_login_rate_limited: "Bloqueo de acceso al panel",
  };
  return (
    <>
      <Card title="Resumen de incidencias" actions={<button className={btnGhost} onClick={reload}>Actualizar</button>}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(data?.summary ?? []).map((s) => (
            <Stat key={s.type + s.severity} label={`${labels[s.type] ?? s.type} · última ${formatMadrid(s.last)}`} value={s.n} tone={s.severity === "high" ? "#ff9b9b" : s.severity === "warning" ? "#FFB627" : "#fff"} />
          ))}
          {data && data.summary.length === 0 && <p className="text-mist">Sin incidencias registradas.</p>}
        </div>
      </Card>
      <Card title="Minimización de datos (tras los resultados)">
        <p className="text-sm text-mist">
          Cuando termine el periodo de reclamaciones, elimina las huellas técnicas de red y navegador de todas las papeletas y el registro de incidencias. Los votos y
          la auditoría se conservan. Solo está disponible con los ganadores publicados y no se puede deshacer.
        </p>
        <button
          type="button"
          className={`${btnDanger} mt-4`}
          onClick={async () => {
            const reason = askReason("Motivo de la eliminación de datos técnicos (por ejemplo: «Fin del periodo de reclamaciones»).");
            if (!reason) return;
            const confirm = window.prompt("Esta acción no se puede deshacer. Escribe PURGAR para confirmar.");
            if (confirm !== "PURGAR") return;
            if (await run(() => api("POST", "/purge-technical", { reason, confirm }), "Datos técnicos eliminados")) reload();
          }}
        >
          Eliminar huellas técnicas
        </button>
      </Card>
      <Card title="Últimos registros">
        <ul className="divide-y divide-white/10 text-sm">
          {(data?.events ?? []).map((e) => (
            <li key={e.id} className="flex flex-wrap justify-between gap-3 py-2">
              <span>
                <span className={`mr-2 inline-block h-2 w-2 rounded-full ${e.severity === "high" ? "bg-[#ff6b6b]" : e.severity === "warning" ? "bg-[#FFB627]" : "bg-white/50"}`} />
                {labels[e.type] ?? e.type}
                {e.detail && <span className="ml-2 font-mono text-xs text-mist">{e.detail.slice(0, 120)}</span>}
              </span>
              <span className="font-mono text-xs text-mist">
                {e.net ?? ""} · {formatMadrid(e.created_at)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Ganadores                                                           */
/* ------------------------------------------------------------------ */

function Winners({ run }: Ctx) {
  const cats = useLoad(() => api<{ categories: Category[] }>("GET", "/categories"));
  const noms = useLoad(() => api<{ nominees: Nominee[] }>("GET", "/nominees"));
  const res = useLoad(() => api<ResultsData>("GET", "/results"));
  const [draft, setDraft] = useState<Record<number, { nominee: string; reason: string }>>({});
  useEffect(() => {
    if (cats.data) setDraft(Object.fromEntries(cats.data.categories.map((c) => [c.id, { nominee: c.winner_nominee_id ? String(c.winner_nominee_id) : "", reason: c.winner_reason ?? "" }])));
  }, [cats.data]);
  const save = async (c: Category) => {
    const d = draft[c.id];
    const reason = askReason(`Registro de la decisión para «${c.name}» (por ejemplo: «Más votos válidos tras la revisión»).`);
    if (!reason) return;
    if (await run(() => api("PUT", `/categories/${c.id}/winner`, { nominee_id: d.nominee ? Number(d.nominee) : null, public_reason: d.reason, reason }), "Ganador registrado")) cats.reload();
  };
  return (
    <>
      <div className="rounded-3xl bg-white/5 p-4 text-sm ring-1 ring-white/10">
        Seleccionar aquí un ganador <strong>no lo publica</strong>. Los ganadores solo se muestran cuando la fase es «Ganadores publicados» y ha llegado la fecha de publicación
        (en «Fases y fechas»). Para el Honor a la Trayectoria, crea primero la candidatura en esa categoría y márcala como publicada: no se mostrará hasta el palmarés.
      </div>
      {(cats.data?.categories ?? []).map((c) => {
        const options = (noms.data?.nominees ?? []).filter((n) => n.category_id === c.id && n.published && !n.is_alternate);
        const top = res.data?.categories.find((r) => r.id === c.id);
        return (
          <Card key={c.id} title={c.name} actions={<Tag name={c.award_title ?? c.name} color={c.color} ink={c.ink} />}>
            {c.votable && top && (
              <p className="mb-3 text-sm text-mist">
                Más votos válidos: <strong className="text-white">{top.nominees[0]?.nominee ?? "—"}</strong> ({top.nominees[0]?.valid ?? 0})
                {top.tie && <span className="ml-2 font-bold text-[#FFB627]">Empate: aplica el criterio de las bases</span>}
              </p>
            )}
            <div className="grid gap-4 md:grid-cols-[1fr_2fr_auto] md:items-end">
              <Field label="Ganador">
                <select className={input} value={draft[c.id]?.nominee ?? ""} onChange={(e) => setDraft({ ...draft, [c.id]: { ...draft[c.id], nominee: e.target.value } })}>
                  <option value="">Sin decidir</option>
                  {options.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Motivo del reconocimiento (público)">
                <input className={input} value={draft[c.id]?.reason ?? ""} onChange={(e) => setDraft({ ...draft, [c.id]: { ...draft[c.id], reason: e.target.value } })} />
              </Field>
              <button className={btnPrimary} onClick={() => save(c)}>
                Guardar
              </button>
            </div>
          </Card>
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Patrocinadores                                                      */
/* ------------------------------------------------------------------ */

interface SponsorRow {
  id: number;
  name: string;
  logo_url: string | null;
  url: string | null;
  tier: string | null;
  position: number;
  published: number;
}

function Sponsors({ run }: Ctx) {
  const { data, reload } = useLoad(() => api<{ sponsors: SponsorRow[] }>("GET", "/sponsors"));
  const [edit, setEdit] = useState<Partial<SponsorRow> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = async (f: File | undefined) => {
    if (!f || !edit) return;
    await run(async () => {
      const url = await uploadImage(f, "logo");
      setEdit((e) => ({ ...e, logo_url: url }));
    }, "Logotipo subido");
  };
  const save = async () => {
    if (!edit) return;
    if (await run(() => (edit.id ? api("PUT", `/sponsors/${edit.id}`, edit) : api("POST", "/sponsors", edit)), "Patrocinador guardado")) {
      setEdit(null);
      reload();
    }
  };
  return (
    <>
      <Card title="Patrocinadores" actions={<button className={btnPrimary} onClick={() => setEdit({ name: "", published: 1, position: 0 })}>Añadir</button>}>
        <p className="mb-3 text-sm text-mist">Aparecen en la portada bajo «Con el patrocinio de». No tienen acceso a la votación ni a los resultados.</p>
        {data && data.sponsors.length === 0 && <p className="text-mist">No hay patrocinadores. La sección no se muestra en la web mientras esté vacía.</p>}
        <ul className="divide-y divide-white/10">
          {(data?.sponsors ?? []).map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3">
                {s.logo_url ? <img src={s.logo_url} alt="" className="h-10 w-20 object-contain" /> : <span className="h-10 w-20 rounded bg-white/10" />}
                <span className="font-bold">{s.name}</span>
                <span className="text-sm text-mist">{s.tier}</span>
                {!s.published && <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">Oculto</span>}
              </div>
              <div className="flex gap-2">
                <button className={btnGhost} onClick={() => setEdit(s)}>
                  Editar
                </button>
                <button
                  className={btnDanger}
                  onClick={async () => {
                    if (window.confirm(`¿Eliminar a ${s.name}?`) && (await run(() => api("DELETE", `/sponsors/${s.id}`), "Eliminado"))) reload();
                  }}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      {edit && (
        <Card title={edit.id ? "Editar patrocinador" : "Nuevo patrocinador"}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nombre">
              <input className={input} value={edit.name ?? ""} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            </Field>
            <Field label="Tipo de colaboración" hint="Ej.: Patrocinio principal, Colaboración">
              <input className={input} value={edit.tier ?? ""} onChange={(e) => setEdit({ ...edit, tier: e.target.value })} />
            </Field>
            <Field label="Web">
              <input className={input} placeholder="https://" value={edit.url ?? ""} onChange={(e) => setEdit({ ...edit, url: e.target.value })} />
            </Field>
            <Field label="Orden">
              <input type="number" className={input} value={edit.position ?? 0} onChange={(e) => setEdit({ ...edit, position: Number(e.target.value) })} />
            </Field>
            <div>
              <span className="mb-1.5 block text-sm font-semibold">Logotipo (PNG transparente o WebP)</span>
              <div className="flex items-center gap-3">
                {edit.logo_url && <img src={edit.logo_url} alt="" className="h-12 w-28 rounded bg-white/5 object-contain" />}
                <input ref={fileRef} type="file" accept="image/png,image/webp,image/jpeg" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
                <button className={btnGhost} type="button" onClick={() => fileRef.current?.click()}>
                  Subir logotipo
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 pt-6 text-sm font-semibold">
              <input type="checkbox" checked={Boolean(edit.published)} onChange={(e) => setEdit({ ...edit, published: e.target.checked ? 1 : 0 })} /> Visible en la web
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button className={btnGhost} onClick={() => setEdit(null)}>
              Cancelar
            </button>
            <button className={btnPrimary} onClick={save}>
              Guardar
            </button>
          </div>
        </Card>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Páginas                                                             */
/* ------------------------------------------------------------------ */

interface PageRow {
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  status: "draft" | "approved";
  updated_at: string;
  updated_by: string | null;
}

function Pages({ run }: Ctx) {
  const { data, reload } = useLoad(() => api<{ pages: PageRow[] }>("GET", "/pages"));
  const [edit, setEdit] = useState<PageRow | null>(null);
  const pending = useMemo(() => (edit ? countPending(edit.body) : 0), [edit]);
  const save = async () => {
    if (!edit) return;
    if (edit.status === "approved" && pending > 0 && !window.confirm(`El texto aún tiene ${pending} apartados [PENDIENTE]. ¿Aprobarlo igualmente?`)) return;
    if (await run(() => api("PUT", `/pages/${edit.slug}`, edit), "Página guardada")) {
      setEdit(null);
      reload();
    }
  };
  return (
    <>
      <Card title="Páginas informativas">
        <ul className="divide-y divide-white/10">
          {(data?.pages ?? []).map((p) => (
            <li key={p.slug} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-bold">{p.title}</p>
                <p className="text-xs text-mist">
                  /{p.slug} · {p.status === "approved" ? "Aprobada" : "Borrador"} · {countPending(p.body)} pendientes
                </p>
              </div>
              <button className={btnGhost} onClick={() => setEdit(p)}>
                Editar
              </button>
            </li>
          ))}
        </ul>
      </Card>
      {edit && (
        <Card title={`Editar «${edit.title}»`}>
          <p className="mb-4 text-sm text-mist">
            Formato: <code>## Título</code>, <code>- lista</code>, <code>**negrita**</code>, <code>[texto](https://…)</code> y <code>[PENDIENTE: …]</code> para datos por completar.
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <Field label="Título">
                <input className={input} value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
              </Field>
              <Field label="Resumen">
                <input className={input} value={edit.summary ?? ""} onChange={(e) => setEdit({ ...edit, summary: e.target.value })} />
              </Field>
              <Field label="Contenido">
                <textarea rows={22} className={`${input} font-mono text-sm`} value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} />
              </Field>
              <Field label="Estado" hint={pending ? `Quedan ${pending} apartados pendientes.` : "Sin apartados pendientes."}>
                <select className={input} value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value as PageRow["status"] })}>
                  <option value="draft">Borrador (muestra el aviso «pendiente de aprobación»)</option>
                  <option value="approved">Aprobada por la organización</option>
                </select>
              </Field>
            </div>
            <div className="max-h-[80vh] overflow-auto rounded-2xl p-5" style={{ background: "linear-gradient(to bottom left,#154DD5,#081D61)" }}>
              <p className="kicker mb-4 text-mist">Vista previa</p>
              <Markdown source={edit.body} />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button className={btnGhost} onClick={() => setEdit(null)}>
              Cancelar
            </button>
            <button className={btnPrimary} onClick={save}>
              Guardar
            </button>
          </div>
        </Card>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Auditoría                                                           */
/* ------------------------------------------------------------------ */

function Audit() {
  const { data } = useLoad(() =>
    api<{ entries: { id: number; actor: string; action: string; entity: string | null; entity_id: string | null; reason: string | null; created_at: string; before_json: string | null; after_json: string | null }[] }>(
      "GET",
      "/audit",
    ),
  );
  return (
    <Card title="Registro de auditoría">
      <p className="mb-4 text-sm text-mist">Registro inalterable: la base de datos impide modificar o borrar entradas.</p>
      <ul className="divide-y divide-white/10 text-sm">
        {(data?.entries ?? []).map((e) => (
          <li key={e.id} className="py-3">
            <div className="flex flex-wrap justify-between gap-2">
              <span>
                <strong>{e.action}</strong>
                {e.entity && (
                  <span className="text-mist">
                    {" "}
                    · {e.entity} {e.entity_id}
                  </span>
                )}
              </span>
              <span className="text-mist">
                {e.actor} · {formatMadrid(e.created_at)}
              </span>
            </div>
            {e.reason && <p className="mt-1">Motivo: {e.reason}</p>}
            {(e.before_json || e.after_json) && (
              <details className="mt-1">
                <summary className="cursor-pointer text-xs text-mist">Ver cambios</summary>
                <pre className="mt-2 max-h-60 overflow-auto rounded-xl bg-night/70 p-3 text-xs whitespace-pre-wrap">
                  {e.before_json && `Antes: ${e.before_json}\n`}
                  {e.after_json && `Después: ${e.after_json}`}
                </pre>
              </details>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
