import { useState } from "react";
import SmartLink from "./SmartLink";
import ContactModal from "./ContactModal";
import { ROUNDEL } from "../data/site";

/* Pied de page.
   Bande de marque + appel à l'action, puis les quatre groupes de navigation,
   puis les réseaux sociaux et la mention mobilité, puis la barre légale.
   Le chrome reste monochrome — filets et libellés en blanc — et le bleu de
   marque n'apparaît que sur le bouton d'action, comme sur la page catalogue. */

const TEL = "02 43 85 00 11";
const TEL_HREF = "tel:+33243850011";
const MAIL = "contactlemans@amplitude.net.bmw.fr";
const ADRESSE = "2 boulevard René Cassin, 72016 Le Mans";

const COLS = [
  {
    title: "La gamme",
    links: [
      { label: "Catalogue", to: "/catalogue" },
      { label: "Nos modèles", to: "/#tendances" },
      { label: "Galerie", to: "/#galerie" },
      { label: "Configurateur", to: "/configurateur" },
    ],
  },
  {
    title: "Acheter",
    links: [
      { label: "Composer ma BMW", to: "/configurateur" },
      { label: "Véhicules en stock", to: "/catalogue" },
      { label: "Financement & LOA", to: "/#reservation" },
      { label: "Reprise de votre BMW", to: "/#reservation" },
    ],
  },
  {
    title: "Concession",
    links: [
      { label: "Prendre rendez-vous", to: "/#reservation" },
      { label: "Horaires", to: "/#reservation" },
      { label: "Nous contacter", to: "/#reservation" },
      { label: "Retour à l'accueil", to: "/" },
    ],
  },
];

/* Liens légaux — repris de la page partenaire BMW. `href` présent = lien
   externe (nouvel onglet) ; sinon page interne. */
const LEGAL: { label: string; href?: string }[] = [
  { label: "Classes énergétiques", href: "https://www.bmw.fr/fr/gamme-bmw/classes-energetiques-bmw.html" },
  { label: "Mentions légales" },
  { label: "Protection des données" },
  { label: "Cookies" },
  { label: "Carrières", href: "https://www.reseaubmwrecrute.com/" },
];

const SOCIALS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/bmw.lemans",
    path: "M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.25-1.5 1.55-1.5H16.7V4.6c-.29-.04-1.28-.13-2.44-.13-2.41 0-4.06 1.47-4.06 4.18v2.33H7.5V14h2.7v8h3.3z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/amplitude_automobiles_le_mans/",
    path: "M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.43-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2zm0 1.8c-3.15 0-3.5.01-4.74.07-.9.04-1.38.19-1.71.32-.43.17-.74.37-1.06.69-.32.32-.52.63-.69 1.06-.13.33-.28.81-.32 1.71C3.21 8.5 3.2 8.85 3.2 12s.01 3.5.07 4.74c.04.9.19 1.38.32 1.71.17.43.37.74.69 1.06.32.32.63.52 1.06.69.33.13.81.28 1.71.32 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c.9-.04 1.38-.19 1.71-.32.43-.17.74-.37 1.06-.69.32-.32.52-.63.69-1.06.13-.33.28-.81.32-1.71.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.04-.9-.19-1.38-.32-1.71a2.9 2.9 0 0 0-.69-1.06 2.9 2.9 0 0 0-1.06-.69c-.33-.13-.81-.28-1.71-.32C15.5 4.01 15.15 4 12 4zm0 3.78a4.22 4.22 0 1 0 0 8.44 4.22 4.22 0 0 0 0-8.44zm0 6.96a2.74 2.74 0 1 1 0-5.48 2.74 2.74 0 0 1 0 5.48zm5.38-7.13a.99.99 0 1 1-1.98 0 .99.99 0 0 1 1.98 0z",
  },
  {
    label: "LinkedIn",
    href: "https://fr.linkedin.com/company/amplitude-automobiles-bmw-le-mans",
    path: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.75V21h-4v-5.5c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9V21H9z",
  },
];

export default function Footer() {
  const [reserve, setReserve] = useState(false);

  return (
    <footer className="grain relative overflow-hidden bg-ink text-white">
      <div className="relative z-10 mx-auto max-w-[1600px] px-5 pb-8 pt-14 md:px-10 md:pb-10 md:pt-20">
        {/* Bande de marque + action */}
        <div className="flex flex-col gap-10 border-b border-white/15 pb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16 md:pb-12">
          <div>
            <div className="flex items-center gap-4">
              <img
                src={ROUNDEL}
                alt="BMW"
                className="h-10 w-10 brightness-0 invert md:h-12 md:w-12"
              />
              <span className="leading-none">
                <span className="block text-[15px] uppercase leading-tight tracking-[0.14em] md:text-base">
                  Ampère Autopassion
                </span>
                <span className="mt-1.5 block text-[10px] uppercase tracking-[0.24em] text-white/50">
                  Le Mans · France
                </span>
              </span>
            </div>
            <p className="mt-6 max-w-sm text-[13px] leading-relaxed text-white/70">
              Concession BMW au Mans : véhicules neufs, occasions BMW Premium Selection et pièces
              BMW Classic. Le plaisir de conduire, à deux pas du circuit de la Sarthe.
            </p>
          </div>

          <div className="lg:text-right">
            <p className="text-[13px] leading-relaxed text-white/70">
              Votre prochaine BMW se choisit au volant.
            </p>
            <button
              type="button"
              onClick={() => setReserve(true)}
              className="mt-5 inline-flex items-center gap-3 bg-brand px-7 py-3.5 text-[11px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-navy"
            >
              Réserver un essai
              <span aria-hidden="true">→</span>
            </button>
            <p className="mt-5">
              <a
                href={TEL_HREF}
                className="text-[18px] tracking-wide text-white transition-colors hover:text-white/70 md:text-xl"
              >
                {TEL}
              </a>
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid gap-10 pt-10 sm:grid-cols-2 md:pt-12 lg:grid-cols-4">
          {COLS.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/45">{c.title}</h2>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <SmartLink
                      to={l.to}
                      className="group inline-flex items-center gap-2 text-[13px] text-white/80 transition-colors hover:text-white"
                    >
                      <span className="h-px w-0 bg-white transition-all duration-300 group-hover:w-4" />
                      {l.label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Coordonnées — pas un menu : un bloc d'information */}
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/45">Nous joindre</h2>
            <ul className="mt-5 space-y-3 text-[13px] text-white/80">
              <li>
                <a href={TEL_HREF} className="transition-colors hover:text-white md:text-[15px]">
                  {TEL}
                </a>
              </li>
              <li>
                <a href={`mailto:${MAIL}`} className="transition-colors hover:text-white">
                  {MAIL}
                </a>
              </li>
              <li className="text-white/55">{ADRESSE}</li>
            </ul>
          </div>
        </div>

        {/* Réseaux sociaux + mention mobilité */}
        <div className="mt-14 flex flex-col gap-6 border-t border-white/15 pt-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <ul className="flex items-center gap-5">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="text-white/60 transition-colors hover:text-white"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
          <p className="max-w-2xl text-[11px] leading-relaxed text-white/50 lg:text-right">
            Pour les trajets courts, privilégiez la marche ou le vélo. Pensez à covoiturer. Au
            quotidien, prenez les transports en commun. #SeDéplacerMoinsPolluer
          </p>
        </div>

        {/* Barre légale */}
        <div className="mt-8 flex flex-col gap-4 border-t border-white/15 pt-6 text-[10px] uppercase tracking-[0.18em] text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright © 2026</p>
          <ul className="flex flex-wrap gap-6">
            {LEGAL.map((l) => (
              <li key={l.label}>
                {l.href ? (
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-white"
                  >
                    {l.label}
                  </a>
                ) : (
                  <SmartLink to="/" className="transition-colors hover:text-white">
                    {l.label}
                  </SmartLink>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Popup de rendez-vous — même composant que l'en-tête et le
          configurateur, ouverte depuis l'appel à l'action du pied de page. */}
      <ContactModal open={reserve} onClose={() => setReserve(false)} />
    </footer>
  );
}
