import { useMemo, useRef, useState } from "react";
import SmartLink from "../components/SmartLink";
import {
  CARS,
  CATALOGUE,
  EUR,
  EUR2,
  FAMILIES,
  SORTS,
  inkRatio,
  inkStyle,
  type Family,
} from "../data/site";
import { gsap, useGSAP, reduced } from "../lib/anim";
import { usePageMeta } from "../lib/seo";

/* Page catalogue.
   Grammaire empruntée aux listings Ferrari Approved : canvas clair, titre en
   bas de casse sans capitalisation décorative, grille aérée à filets fins, et
   cartes réduites à l'essentiel — un visuel plein cadre, un badge, la méta, le
   nom, le prix, trois caractéristiques et deux boutons. Aucun bord, aucune
   ombre : la photo et la typographie portent seules. Le chrome reste
   monochrome ; le bleu de marque est réservé au bouton principal, comme le
   rouge l'est chez Ferrari.

   Carte produit alignée sur la fiche de référence : fond clair, visuel plein
   cadre, pastille noire arrondie, nom en bas de casse, mensualité, méta
   discrète, puis une action pleine largeur — la fiche se lit de haut en bas
   sans concurrence visuelle. */

const norm = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const km = (n: number) => (n === 0 ? "0 km" : `${n.toLocaleString("fr-FR")} km`);

export default function Catalogue() {
  usePageMeta(
    "Catalogue BMW",
    "Les BMW disponibles en concession au Mans : sportives BMW M, BMW i électriques et pièces BMW Classic. Prix, kilométrage et mensualités.",
  );

  const root = useRef<HTMLElement>(null);
  const [family, setFamily] = useState<"Tout" | Family>("Tout");
  const [sort, setSort] = useState(SORTS[0].id);
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = norm(query.trim());
    const filtered = CATALOGUE.filter((c) => {
      if (family !== "Tout" && c.family !== family) return false;
      if (!q) return true;
      return norm(`${c.name} ${c.motorisation} ${c.energy} ${c.year}`).includes(q);
    });
    const sorted = [...filtered];
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "year-desc") sorted.sort((a, b) => b.year - a.year);
    else if (sort === "km-asc") sorted.sort((a, b) => a.km - b.km);
    else sorted.sort((a, b) => a.price - b.price);
    return sorted;
  }, [family, sort, query]);

  const signature = `${family}|${sort}|${query}|${list.length}`;

  useGSAP(
    () => {
      if (reduced()) return;
      gsap.fromTo(
        ".cat-card",
        { y: 22, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.045, ease: "power3.out" },
      );
    },
    { dependencies: [signature], scope: root },
  );

  /* Onglets de famille — filet sous l'onglet actif, comme les motorisations
     chez Ferrari. */
  const tab = (active: boolean) =>
    `-mb-px shrink-0 border-b-2 pb-3 text-[12px] whitespace-nowrap transition-colors ${
      active
        ? "border-ink text-ink"
        : "border-transparent text-ink/40 hover:text-ink/70"
    }`;

  const clear = () => {
    setFamily("Tout");
    setQuery("");
  };

  return (
    <section ref={root} className=" pb-20 md:pb-28">
      {/* Chapeau : contexte en micro-capitales, propos en bas de casse */}
      <div className="mx-auto max-w-[1600px] px-5 pt-10 md:px-10 md:pt-16">
        <p className="text-[11px] uppercase tracking-[0.14em] text-ink/50">
          Catalogue BMW · Ampère Autopassion, Le Mans
        </p>
        <h1 className="mt-3 max-w-4xl text-[28px] leading-[1.15] text-ink md:text-[36px]">
          {CATALOGUE.length} BMW disponibles en concession
        </h1>
        <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-ink/60">
          Chaque véhicule est contrôlé et préparé par nos ateliers. Réservez votre essai : nous
          préparons la BMW choisie avant votre arrivée.
        </p>
      </div>

      {/* Barre d'outils : chrome monochrome, filets fins, rien de plus */}
      <div className="sticky top-0 z-30 mt-8 border-b border-line backdrop-blur-md md:mt-12">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-5 md:px-10 lg:flex-row lg:items-end lg:justify-between">
          <div
            className="no-scrollbar flex items-end gap-7 overflow-x-auto"
            role="group"
            aria-label="Filtrer par gamme"
          >
            <button type="button" onClick={() => setFamily("Tout")} className={tab(family === "Tout")}>
              Tout
            </button>
            {FAMILIES.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFamily(f)}
                className={tab(family === f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6 pb-3 lg:pb-2">
            <label className="relative block flex-1 lg:flex-none">
              <span className="sr-only">Rechercher un modèle</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un modèle"
                className="w-full border-b border-line bg-transparent pb-1.5 text-[12px] text-ink transition-colors placeholder:text-ink/35 focus:border-ink focus:outline-none sm:w-56"
              />
            </label>

            <label className="relative flex items-center gap-1.5">
              <span className="sr-only">Trier</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="cursor-pointer appearance-none bg-transparent pr-4 text-[12px] text-ink/70 transition-colors hover:text-ink focus:outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-0 text-[9px] text-ink/40"
              >
                ▾
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Résultat de la recherche en cours */}
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-5 pt-6 md:px-10 md:pt-8">
        <p className="text-[11px] uppercase tracking-[0.14em] text-ink/50">
          {list.length} {list.length > 1 ? "véhicules" : "véhicule"}
        </p>
        {family !== "Tout" && (
          <button
            type="button"
            onClick={() => setFamily("Tout")}
            className="inline-flex items-center gap-2 bg-ink px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-brand"
          >
            {family}
            <span aria-hidden="true">✕</span>
          </button>
        )}
      </div>

      {/* Grille */}
      <div className="mx-auto max-w-[1600px] px-5 pt-6 md:px-10 md:pt-8">
        {list.length === 0 ? (
          <div className="border-t border-line py-20 text-center">
            <p className="text-[22px] text-ink md:text-[26px]">Aucun véhicule ne correspond</p>
            <p className="mx-auto mt-3 max-w-md text-[12px] leading-relaxed text-ink/55">
              Élargissez la recherche — ou confiez-nous votre recherche : nous trouvons votre BMW
              dans le réseau de la marque.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={clear}
                className="border border-line px-7 py-3 text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink"
              >
                Réinitialiser les filtres
              </button>
              <SmartLink
                to="/#reservation"
                className="bg-brand px-7 py-3 text-[11px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-navy"
              >
                Rechercher un modèle
              </SmartLink>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {list.map((c) => {
              const configurable = CARS.some((car) => car.id === c.id);
              return (
                <article
                  key={c.id}
                  className="cat-card group flex flex-col bg-mist"
                >
                  {/* Visuel plein cadre, aucun cadre autour */}
                  <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden">
                    {c.bbox ? (
                      <div
                        className="relative z-10 w-[86%] transition-transform duration-700 group-hover:scale-[1.03]"
                        style={{ aspectRatio: inkRatio(c.bbox) }}
                      >
                        <img
                          src={c.img}
                          alt={c.name}
                          className="absolute"
                          style={inkStyle(c.bbox)}
                        />
                      </div>
                    ) : (
                      <img
                        src={c.img}
                        alt={c.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>

                  {/* Corps : pastille, nom, mensualité, méta, action */}
                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    <span className="inline-flex w-fit items-center rounded-full bg-ink px-3.5 py-1.5 text-[11px] leading-none text-white">
                      {c.tag ?? c.family}
                    </span>

                    <h2 className="mt-4 text-[20px] leading-tight text-ink md:text-[22px]">
                      {c.name}
                    </h2>
                    <p className="mt-1.5 text-[11px] leading-snug text-ink/50">{c.motorisation}</p>

                    <p className="mt-3.5 text-[13px] text-ink/55">
                      À partir de {EUR2(c.monthly)} / mois
                    </p>
                    <p className="mt-1 text-[11px] leading-snug text-ink/45">
                      {c.year} · {km(c.km)} · {c.energy} · {c.gearbox} · {EUR(c.price)}
                    </p>

                    <div className="mt-auto pt-6">
                      <SmartLink
                        to={
                          configurable
                            ? `/configurateur?modele=${c.id}`
                            : `/?vehicule=${encodeURIComponent(c.name)}#reservation`
                        }
                        className="block bg-ink py-3.5 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-brand"
                      >
                        {configurable ? "Découvrez-la" : "Réserver un essai"}
                      </SmartLink>
                      <SmartLink
                        to={`/?vehicule=${encodeURIComponent(c.name)}#reservation`}
                        className="mx-auto mt-3 block w-fit text-center text-[11px] text-ink/50 underline underline-offset-4 transition-colors hover:text-ink"
                      >
                        Demander un devis
                      </SmartLink>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
