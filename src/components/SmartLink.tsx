import type { MouseEvent, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { reduced } from "../lib/anim";
import { useReservation } from "../lib/reservation";

/* Lien interne tolérant : accepte « /catalogue », « /#reservation » et
   « /?vehicule=X#reservation ». Un lien vers une ancre de la page courante
   défile sans navigation ; un lien vers une autre page navigue puis laisse
   le shell défiler sur l'ancre (il écoute location.hash).
   Cas particulier : l'ancre « #reservation » n'existe plus sur la page
   d'accueil — le rendez-vous se prend dans la popup, que ces liens ouvrent
   (avec le modèle passé en query, s'il y en a un). */
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
  const reservation = useReservation();

  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    /* Laisse le navigateur gérer les ouvertures dans un nouvel onglet */
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    const [beforeHash, hash = ""] = to.split("#");
    const [path = "", query = ""] = beforeHash.split("?");
    const target = path || "/";

    if (hash === "reservation" && reservation) {
      e.preventDefault();
      reservation.open(new URLSearchParams(query).get("vehicule") ?? undefined);
      return;
    }

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
