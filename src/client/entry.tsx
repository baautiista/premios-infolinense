import { hydrateRoot, createRoot } from "react-dom/client";
import { App } from "../app/App";
import type { RoutePayload } from "../shared/types";

const root = document.getElementById("root") as HTMLElement;
const raw = document.getElementById("__DATA__")?.textContent ?? "null";
const data = JSON.parse(raw) as (RoutePayload<unknown> & { admin?: undefined }) | { admin: true } | null;

if (data && "admin" in data && data.admin) {
  // El panel se descarga aparte: no pesa en la web pública.
  import("../admin/AdminApp").then(({ AdminApp }) => createRoot(root).render(<AdminApp />));
} else if (data) {
  hydrateRoot(root, <App initial={data as RoutePayload<unknown>} />);
}
