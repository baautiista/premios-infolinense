/** Utilidades de fecha en la zona horaria oficial del certamen (Europe/Madrid). */
export const TZ = "Europe/Madrid";

interface Parts {
  y: number;
  m: number;
  d: number;
  h: number;
  mi: number;
  s: number;
}

const partsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function partsInMadrid(date: Date): Parts {
  const p: Record<string, string> = {};
  for (const part of partsFormatter.formatToParts(date)) p[part.type] = part.value;
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour, mi: +p.minute, s: +p.second };
}

/** Diferencia (ms) entre la hora de Madrid y UTC en un instante dado. */
function madridOffsetMs(date: Date): number {
  const p = partsInMadrid(date);
  const asUtc = Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** «2026-12-10T21:00» (hora de Madrid) → ISO UTC. Tiene en cuenta el cambio de horario. */
export function madridLocalToUtcIso(local: string | null | undefined): string | null {
  if (!local) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local.trim());
  if (!m) return null;
  const guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  let t = guess - madridOffsetMs(new Date(guess));
  const second = guess - madridOffsetMs(new Date(t));
  if (second !== t) t = second;
  return new Date(t).toISOString();
}

/** ISO UTC → «2026-12-10T21:00» en hora de Madrid (para campos datetime-local). */
export function utcIsoToMadridLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = partsInMadrid(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.y}-${pad(p.m)}-${pad(p.d)}T${pad(p.h)}:${pad(p.mi)}`;
}

/** Día natural en Madrid: «2026-12-10». */
export function madridDay(date: Date = new Date()): string {
  const p = partsInMadrid(date);
  return `${p.y}-${String(p.m).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`;
}

const longFormatter = new Intl.DateTimeFormat("es-ES", {
  timeZone: TZ,
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const dayFormatter = new Intl.DateTimeFormat("es-ES", { timeZone: TZ, day: "numeric", month: "long" });

/** «10 de diciembre de 2026, 21:00 h» */
export function formatMadrid(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${longFormatter.format(d)} h`;
}

/** «10 de diciembre» */
export function formatMadridDay(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : dayFormatter.format(d);
}
