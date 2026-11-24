import { createContext, useContext, type AnchorHTMLAttributes, type MouseEvent } from "react";

export interface Nav {
  navigate: (to: string, opts?: { replace?: boolean }) => void;
  path: string;
  loading: boolean;
}

export const NavContext = createContext<Nav>({ navigate: () => undefined, path: "/", loading: false });
export const useNav = () => useContext(NavContext);

/** Enlace interno con navegación sin recarga (y enlace normal si no hay JavaScript). */
export function Link({ href, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const { navigate } = useNav();
  const internal = href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/media/") && !href.startsWith("/admin");
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || !internal || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target) return;
    e.preventDefault();
    navigate(href);
  };
  return <a href={href} onClick={handle} {...rest} />;
}
