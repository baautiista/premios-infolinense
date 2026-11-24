import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CategoriesData,
  CategoryData,
  HomeData,
  InfoPageData,
  NomineeData,
  RoutePayload,
  VoteData,
  WinnerData,
  WinnersData,
} from "../shared/types";
import { Shell } from "./components/shell";
import { NavContext, type Nav } from "./nav";
import { CategoriesPage, HomePage } from "./pages/home";
import { InfoPage, NotFoundPage } from "./pages/info";
import { CategoryPage, NomineePage } from "./pages/nominees";
import { ReceiptPage, VotePage } from "./pages/vote";
import { PalmaresPage, WinnerPage, WinnersPage } from "./pages/winners";

function currentPath(): string {
  return typeof window === "undefined" ? "/" : window.location.pathname + window.location.search;
}

function Page({ payload }: { payload: RoutePayload<unknown> }) {
  const { site, data } = payload;
  switch (payload.route) {
    case "home":
      return <HomePage data={data as HomeData} site={site} />;
    case "categories":
      return <CategoriesPage data={data as CategoriesData} site={site} />;
    case "category":
      return <CategoryPage data={data as CategoryData} site={site} />;
    case "nominee":
      return <NomineePage data={data as NomineeData} site={site} />;
    case "vote":
      return <VotePage data={data as VoteData} site={site} />;
    case "receipt":
      return <ReceiptPage />;
    case "winners":
      return <WinnersPage data={data as WinnersData} site={site} />;
    case "palmares":
      return <PalmaresPage data={data as WinnersData} site={site} />;
    case "winner":
      return <WinnerPage data={data as WinnerData} site={site} />;
    case "page":
      return <InfoPage data={data as InfoPageData} />;
    default:
      return <NotFoundPage />;
  }
}

export function App({ initial }: { initial: RoutePayload<unknown> }) {
  const [payload, setPayload] = useState(initial);
  const [path, setPath] = useState(initial.path);
  const [loading, setLoading] = useState(false);
  const seq = useRef(0);

  const load = useCallback(async (to: string, mode: "push" | "replace" | "pop") => {
    const id = ++seq.current;
    setLoading(true);
    try {
      const res = await fetch(`/api/page?path=${encodeURIComponent(to)}`, { headers: { Accept: "application/json" } });
      if (!res.ok && res.status !== 404) throw new Error(String(res.status));
      const next = (await res.json()) as RoutePayload<unknown>;
      if (id !== seq.current) return;
      if (mode === "push") history.pushState(null, "", to);
      if (mode === "replace") history.replaceState(null, "", to);
      setPayload(next);
      setPath(next.path);
      document.title = next.meta.title;
      if (mode !== "pop") {
        const hash = new URL(to, location.origin).hash;
        if (!hash) window.scrollTo({ top: 0 });
      }
      requestAnimationFrame(() => {
        const main = document.getElementById("contenido");
        main?.focus({ preventScroll: true });
      });
    } catch {
      // Si la carga falla, se navega de forma tradicional.
      window.location.assign(to);
    } finally {
      if (id === seq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const onPop = () => load(currentPath(), "pop");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [load]);

  const nav: Nav = useMemo(
    () => ({
      path,
      loading,
      navigate: (to, opts) => {
        if (to === currentPath() && !to.includes("#")) return;
        void load(to, opts?.replace ? "replace" : "push");
      },
    }),
    [path, loading, load],
  );

  return (
    <NavContext.Provider value={nav}>
      <Shell site={payload.site}>
        <Page payload={payload} />
      </Shell>
    </NavContext.Provider>
  );
}
