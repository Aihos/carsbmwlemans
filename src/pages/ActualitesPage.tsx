import { useMemo, useRef, useState } from "react";
import SmartLink from "../components/SmartLink";
import { NEWS, NEWS_TAGS } from "../data/site";
import { gsap, useGSAP, reduced } from "../lib/anim";
import { usePageMeta } from "../lib/seo";

/* Page actualités — grammaire reprise de la page News de ferrari.com :
   canvas clair, chapeau + barre de filtres à filets fins, deux grands visuels
   en tête avec le texte posé SUR l'image, puis une grille de cartes sans aucun
   contenant (ni bord, ni ombre, ni fond) — visuel 16/9, ligne de méta
   date/catégorie en micro-capitales, titre en capitales.
   On garde la marque du projet : accent bleu `brand` (le rouge Ferrari ne sert
   qu'à leur CTA), police et angles du site, aucune capitalisation sur les noms
   de modèle (« BMW iX2 xDrive30 » doit rester lisible tel quel → le titre est
   en capitales par CSS, le contenu reste en casse normale). */

/** « 2026-10-03 » → « 03 oct » (date locale, jamais décalée par le fuseau). */
const jour = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" })
    .format(new Date(y, m - 1, d))
    .replace(".", "");
};

export default function ActualitesPage() {
  usePageMeta(
    "Actualités des ventes privées BMW",
    "Ce que la concession BMW Amplitude Automobiles prépare pour ses ventes privées au Mans : véhicules exposés, BMW M, BMW i, BMW Classic, atelier et reprises.",
  );

  const root = useRef<HTMLElement>(null);
  const [tag, setTag] = useState("Tout");

  const list = useMemo(
    () => (tag === "Tout" ? NEWS : NEWS.filter((n) => n.category === tag)),
    [tag],
  );

  /* Sur « Tout », les deux premières parutions passent en grands visuels ;
     sur un filtre, tout va dans la grille (pas de doublon en tête). */
  const featured = tag === "Tout" ? list.slice(0, 2) : [];
  const grid = tag === "Tout" ? list.slice(2) : list;
  const signature = `${tag}|${grid.length}`;

  useGSAP(
    () => {
      if (reduced()) return;
      gsap.fromTo(
        ".act-card",
        { y: 22, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.045, ease: "power3.out" },
      );
    },
    { dependencies: [signature], scope: root },
  );

  /* Onglets de catégorie — filet sous l'onglet actif, comme les motorisations
     chez Ferrari. */
  const tab = (active: boolean) =>
    `-mb-px shrink-0 border-b-2 pb-3 text-[12px] whitespace-nowrap transition-colors ${
      active ? "border-ink text-ink" : "border-transparent text-ink/40 hover:text-ink/70"
    }`;

  const meta = "flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em]";

  return (
    <section ref={root} className="pb-20 md:pb-28">
      {/* Chapeau */}
      <div className="mx-auto max-w-[1600px] px-5 pt-10 md:px-10 md:pt-16">
        <p className="text-[11px] uppercase tracking-[0.14em] text-ink/50">
          Actualités · Ventes privées, Amplitude Automobiles Le Mans
        </p>
        <h1 className="mt-3 max-w-4xl text-[28px] leading-[1.15] text-ink md:text-[36px]">
          Ce qui se prépare pour les ventes privées
        </h1>
      </div>

      {/* Barre de filtres : chrome monochrome, filets fins, rien de plus */}
      <div className="sticky top-0 z-30 mt-8 border-b border-line bg-page md:mt-12">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-5 md:px-10 lg:flex-row lg:items-end lg:justify-between">
          <div
            className="no-scrollbar flex items-end gap-7 overflow-x-auto"
            role="group"
            aria-label="Filtrer les actualités"
          >
            {NEWS_TAGS.map((t) => (
              <button key={t} type="button" onClick={() => setTag(t)} className={tab(tag === t)}>
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 pb-3 lg:pb-2">
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink/50">
              {list.length} {list.length > 1 ? "actualités" : "actualité"}
            </p>
            {tag !== "Tout" && (
              <button
                type="button"
                onClick={() => setTag("Tout")}
                className="inline-flex items-center gap-2 bg-ink px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-brand"
              >
                {tag}
                <span aria-hidden="true">✕</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grands visuels : le texte est posé sur l'image */}
      {featured.length > 0 && (
        <div className="mx-auto max-w-[1600px] px-5 pt-8 md:px-10 md:pt-12">
          <div className="grid gap-2 md:grid-cols-2">
            {featured.map((n) => (
              <SmartLink
                key={n.id}
                to={n.to}
                className="act-card group relative block aspect-[16/9] overflow-hidden bg-ink"
              >
                <img
                  src={n.img}
                  alt={n.alt}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-ink/5" />
                <span className="absolute inset-x-0 bottom-0 block p-5 text-white md:p-7">
                  <span className={`${meta} text-white/75`}>
                    <span>{jour(n.date)}</span>
                    <span aria-hidden="true" className="h-px w-6 bg-white/40" />
                    <span>{n.category}</span>
                  </span>
                  {/* Bas de casse : la nomenclature BMW (« BMW iX5 eDrive40 »)
                      ne survit pas à une capitalisation CSS. */}
                  <span className="mt-3 block max-w-2xl text-[clamp(1.05rem,1.6vw,1.5rem)] font-bold leading-[1.2]">
                    {n.title}
                  </span>
                </span>
              </SmartLink>
            ))}
          </div>
        </div>
      )}

      {/* Grille */}
      <div className="mx-auto max-w-[1600px] px-5 pt-12 md:px-10 md:pt-16">
        {grid.length === 0 && featured.length === 0 ? (
          <div className="border-t border-line py-20 text-center">
            <p className="text-[22px] text-ink md:text-[26px]">Aucune actualité dans cette rubrique</p>
            <button
              type="button"
              onClick={() => setTag("Tout")}
              className="mt-8 border border-line px-7 py-3 text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink"
            >
              Voir toutes les actualités
            </button>
          </div>
        ) : (
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
            {grid.map((n) => (
              <article key={n.id} className="act-card group">
                <SmartLink to={n.to} className="block">
                  <span className="relative block aspect-[16/9] overflow-hidden bg-mist">
                    <img
                      src={n.img}
                      alt={n.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </span>
                  <span className={`${meta} mt-4`}>
                    <span className="text-ink/50">{jour(n.date)}</span>
                    <span className="text-brand">{n.category}</span>
                  </span>
                  <span className="mt-2.5 block text-[18px] font-bold leading-[1.25] text-ink">
                    {n.title}
                  </span>
                  <span className="mt-2.5 block text-[14px] leading-relaxed text-ink/55 md:text-[15px]">
                    {n.excerpt}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-ink/55 transition-colors group-hover:text-brand">
                    Lire la suite
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </SmartLink>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Bandeau de fin : retour à l'atelier de configuration */}
      <div className="mx-auto mt-20 max-w-[1600px] px-5 md:mt-28 md:px-10">
        <div className="grain relative overflow-hidden bg-ink">
          <img
            src="/img/produit/voitureA-net.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 bottom-0 hidden h-[92%] w-auto opacity-95 md:block"
          />
          <div className="relative z-10 max-w-xl px-6 py-12 md:px-14 md:py-16">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/55">
              Avant les ventes privées
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.6rem,3.4vw,2.6rem)] font-bold uppercase leading-[1.06] text-white">
              Préparez votre BMW
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-white/70 md:text-[15px]">
              Teinte extérieure, jantes et motorisation : composez la BMW que vous essaierez pendant
              les ventes privées, la concession la prépare avant votre créneau.
            </p>
            <SmartLink
              to="/configurateur"
              className="group mt-7 inline-flex items-center gap-3 bg-brand px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-navy"
            >
              Ouvrir le configurateur
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </SmartLink>
          </div>
        </div>
      </div>
    </section>
  );
}
