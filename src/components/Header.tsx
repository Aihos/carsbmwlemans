import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SmartLink from "./SmartLink";
import ContactModal from "./ContactModal";
import { NAV } from "../data/site";

/* En-tête : roundel BMW, navigation, téléphone, bouton « Réserver ».
   En flux normal (pas de position fixe) : il défile avec la page. Transparent
   sur la page d'accueil (il se pose sur le hero), opaque sur les pages
   intérieures. « Réserver » ouvre la popup de rendez-vous (même composant que
   celui du configurateur) au lieu de faire défiler jusqu'à la section bas de
   page. */
export default function Header({ ready }: { ready: boolean }) {
  const [open, setOpen] = useState(false);
  const [reserve, setReserve] = useState(false);
  const { pathname } = useLocation();
  const solid = pathname !== "/";

  /* Le menu mobile se referme à chaque changement de page */
  useEffect(() => setOpen(false), [pathname]);

  /* Verrou du scroll pendant que le menu mobile est ouvert */
  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [open]);

  /* Sur la page d'accueil le hero est une vidéo sombre : l'en-tête passe en blanc */
  const onVideo = !solid;

  const linkClass = (active: boolean) =>
    onVideo
      ? `text-[10px] font-bold uppercase tracking-[0.2em] transition-colors md:text-[11px] ${
          active ? "text-white" : "text-white/70 hover:text-white"
        }`
      : `text-[10px] font-bold uppercase tracking-[0.2em] transition-colors md:text-[11px] ${
          active ? "text-brand" : "text-ink/70 hover:text-ink"
        }`;

  return (
    <header
      className={`relative z-50 transition-opacity duration-500 ${
        ready ? "opacity-100" : "opacity-0"
      } ${solid ? "border-b border-line bg-page/85 backdrop-blur-md" : ""}`}
    >
      <div className="mx-auto flex h-20 max-w-[1700px] items-center justify-between gap-6 px-5 md:h-24 md:px-10">
        <SmartLink to="/" ariaLabel="Ampère Autopassion — Le Mans" className="shrink-0">
          {/* Logo blanc sur la vidéo du hero (accueil), noir sur les pages
              intérieures à fond clair (catalogue, configurateur). */}
          <img
            src={solid ? "/img/logo/logoHeader-noir.svg" : "/img/logo/logoHeader).svg"}
            alt="BMW"
            className="h-12 w-12 md:h-16 md:w-16"
          />
        </SmartLink>

       

        <div className="flex items-center gap-3 md:gap-6">
           <nav aria-label="Navigation principale" className="hidden items-end gap-8 lg:flex">
          {NAV.map((n) => (
            <SmartLink key={n.to} to={n.to} className={linkClass(pathname === n.to)}>
              {n.label}
            </SmartLink>
          ))}
        </nav>
          <a
            href="tel:+33649015334"
            className={`hidden text-[11px] font-bold uppercase tracking-[0.18em] transition-colors sm:block md:text-sm md:tracking-[0.2em] ${
              onVideo ? "text-white hover:text-white/70" : "text-ink hover:text-brand"
            }`}
          >
            06 49 01 53 34
          </a>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setReserve(true);
            }}
            className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors md:px-7 md:py-3 md:text-[11px] ${
              onVideo
                ? "border border-white/70 text-white hover:bg-white hover:text-ink"
                : "border border-ink text-ink hover:bg-ink hover:text-white"
            }`}
          >
            Réserver
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            className={`flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden ${
              onVideo ? "border border-white/70" : "border border-ink"
            }`}
          >
            <span
              className={`block h-[1.5px] w-4 transition-transform duration-300 ${
                onVideo ? "bg-white" : "bg-ink"
              } ${
                open ? "translate-y-[3.25px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-[1.5px] w-4 transition-transform duration-300 ${
                onVideo ? "bg-white" : "bg-ink"
              } ${
                open ? "-translate-y-[3.25px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {open && (
        <div id="menu-mobile" className="border-t border-line bg-page lg:hidden">
          <nav aria-label="Navigation mobile" className="mx-auto max-w-[1600px] px-5 py-6 md:px-10">
            <ul className="grid gap-1">
              <li>
                <SmartLink
                  to="/"
                  className="block border-b border-line py-4 font-display text-2xl uppercase text-ink transition-colors hover:text-brand"
                >
                  Accueil
                </SmartLink>
              </li>
              {NAV.map((n) => (
                <li key={n.to}>
                  <SmartLink
                    to={n.to}
                    className="block border-b border-line py-4 font-display text-2xl uppercase text-ink transition-colors hover:text-brand"
                  >
                    {n.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
            <a
              href="tel:+33649015334"
              className="mt-5 inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-brand"
            >
              06 49 01 53 34
            </a>
          </nav>
        </div>
      )}

      {/* Popup de rendez-vous — le formulaire de la page d'accueil, dans la
          popup du configurateur (même composant ContactModal). */}
      <ContactModal open={reserve} onClose={() => setReserve(false)} />
    </header>
  );
}
