import type { MouseEvent, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { reduced } from "../lib/anim";

/* Lien interne tolérant : accepte « /catalogue », « /#reservation » et
   « /?vehicule=X#reservation ». Un lien vers une ancre de la page courante
   défile sans navigation ; un lien vers une autre page navigue puis laisse
   le shell défiler sur l'ancre (il écoute location.hash). */
export default function SmartLink({
  to,
  className,
  children,
  ariaLabel,
}: {
  to: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    /* Laisse le navigateur gérer les ouvertures dans un nouvel onglet */
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    const [beforeHash, hash = ""] = to.split("#");
    const [path = "", query = ""] = beforeHash.split("?");
    const target = path || "/";

    e.preventDefault();

    if (hash && pathname === target) {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
        return;
      }
    }
    navigate(`${target}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`);
  };

  return (
    <a href={to} className={className} aria-label={ariaLabel} onClick={handle}>
      {children}
    </a>
  );
}
