/**
 * Fases de la edición. La organización fija la fase en el panel; las fechas
 * configuradas hacen avanzar la web automáticamente (y nunca la adelantan a
 * la publicación de ganadores antes de la fecha oficial).
 */
export type Phase = "coming_soon" | "nominations" | "voting" | "closed" | "winners";

export const PHASES: { id: Phase; label: string; help: string }[] = [
  { id: "coming_soon", label: "1 · Próximamente", help: "Presentación y cuenta atrás hasta el anuncio." },
  { id: "nominations", label: "2 · Nominaciones publicadas", help: "Se consultan las candidaturas; aún no se vota." },
  { id: "voting", label: "3 · Votaciones abiertas", help: "Papeleta activa hasta la fecha de cierre." },
  { id: "closed", label: "4 · Votaciones cerradas", help: "Se desactiva el voto a la espera de los ganadores." },
  { id: "winners", label: "5 · Ganadores publicados", help: "Palmarés y presentación digital de ganadores." },
];

export interface PhaseSettings {
  phase: Phase;
  announce_at: string | null;
  voting_opens_at: string | null;
  voting_closes_at: string | null;
  results_at: string | null;
}

function at(iso: string | null): number {
  if (!iso) return Number.NaN;
  return Date.parse(iso);
}

export function isPhase(v: unknown): v is Phase {
  return typeof v === "string" && PHASES.some((p) => p.id === v);
}

export function effectivePhase(s: PhaseSettings, now: number = Date.now()): Phase {
  let p: Phase = isPhase(s.phase) ? s.phase : "coming_soon";
  // NaN en las comparaciones = fecha no configurada → no hay transición automática.
  if (p === "coming_soon" && at(s.announce_at) <= now) p = "nominations";
  if (p === "nominations" && at(s.voting_opens_at) <= now) p = "voting";
  if (p === "voting" && at(s.voting_opens_at) > now) p = "nominations";
  if ((p === "nominations" || p === "voting") && at(s.voting_closes_at) <= now) p = "closed";
  if (p === "winners" && at(s.results_at) > now) p = "closed";
  return p;
}

export const phaseOrder = (p: Phase) => PHASES.findIndex((x) => x.id === p);
export const nominationsVisible = (p: Phase) => phaseOrder(p) >= phaseOrder("nominations");
