/**
 * Google Tag Manager (GTM-TRQZPZKB) con consentimiento previo.
 * No se carga nada de Google hasta que la persona pulsa «Aceptar».
 * La elección se guarda en este navegador (localStorage «pi_consent»).
 */
export const GTM_ID = "GTM-TRQZPZKB";
const KEY = "pi_consent";
export type Consent = "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __piGtmLoaded?: boolean;
  }
}

export function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function saveConsent(c: Consent) {
  try {
    localStorage.setItem(KEY, c);
  } catch {
    /* navegación privada: se pregunta de nuevo en la próxima visita */
  }
  window.dispatchEvent(new CustomEvent("pi:consent", { detail: c }));
}

export function loadGtm() {
  if (typeof window === "undefined" || window.__piGtmLoaded) return;
  if (location.pathname.startsWith("/admin")) return;
  window.__piGtmLoaded = true;
  window.dataLayer = window.dataLayer || [];
  const gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  } as (...args: unknown[]) => void;
  window.gtag = gtag;
  gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  gtag("js", new Date());
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(s);
}
