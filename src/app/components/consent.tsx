import { useEffect, useState } from "react";
import { loadGtm, readConsent, saveConsent } from "../lib/analytics";
import { Link } from "../nav";

/** Aviso de cookies de analítica: discreto, sin bloquear la página ni la votación. */
export function ConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const c = readConsent();
    if (c === "granted") loadGtm();
    if (c === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener("pi:consent-open", reopen);
    return () => window.removeEventListener("pi:consent-open", reopen);
  }, []);

  if (!open) return null;

  const choose = (granted: boolean) => {
    const prev = readConsent();
    saveConsent(granted ? "granted" : "denied");
    setOpen(false);
    if (granted) loadGtm();
    else if (prev === "granted") location.reload(); // descarga lo que ya estuviera cargado
  };

  return (
    <div role="region" aria-label="Cookies de analítica" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl bg-night/95 p-4 text-sm text-white shadow-2xl ring-1 ring-white/20 backdrop-blur sm:bottom-5 sm:p-5">
      <p className="leading-snug">
        Usamos cookies de analítica (Google) para saber cuántas personas visitan la web. Solo se activan si las aceptas y no influyen en la votación.{" "}
        <Link href="/privacidad" className="underline decoration-lime underline-offset-2">
          Más información
        </Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" className="btn btn-lime min-h-10 flex-1 px-4 text-sm" onClick={() => choose(true)}>
          Aceptar
        </button>
        <button type="button" className="btn btn-ghost min-h-10 flex-1 px-4 text-sm" onClick={() => choose(false)}>
          Rechazar
        </button>
      </div>
    </div>
  );
}

export function openConsent() {
  window.dispatchEvent(new Event("pi:consent-open"));
}
