import { useRef, useState } from "react";
import { gsap, useGSAP, reduced } from "../lib/anim";
import SmartLink from "./SmartLink";
import { NEWS_HIGHLIGHT as NEWS } from "../data/site";

/* Actualités : carrousel éditorial (composition reprise de la référence
   client) — titre + chapô + « Lire la suite » à gauche, grand visuel à droite,
   flèches sur les bords, points et lien « toutes les actualités » en pied.

   Les diapositives sont toutes montées, empilées : les visuels sont donc
   préchargés et le passage se fait en fondu CSS. Aucune animation GSAP
   d'opacité n'est posée sur ces couches — un `opacity: 1` inline écraserait la
   classe `opacity-0` des diapositives masquées et les ferait toutes apparaître
   l'une sur l'autre. */
export default function Actualites() {
  const root = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);

  const go = (step: number) => setIndex((i) => (i + step + NEWS.length) % NEWS.length);

  useGSAP(
    () => {
      if (reduced()) return;
      gsap.fromTo(
        ".act-head, .act-foot",
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
        },
      );
    },
    { scope: root },
  );

  /* Zoom doux du visuel actif à chaque changement de diapositive */
  useGSAP(
    () => {
      const img = root.current?.querySelector<HTMLImageElement>(".act-live img");
      if (!img || reduced()) return;
      gsap.fromTo(img, { scale: 1.045 }, { scale: 1, duration: 1.3, ease: "power3.out" });
    },
    { dependencies: [index], scope: root },
  );

  return (
    <section id="actualites" ref={root} className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
        {/* <p className="act-head text-[10px] font-semibold uppercase tracking-[0.3em] text-ink/45">
          Actualités
        </p> */}

        <div className="relative mt-8 md:mt-10 flex">
         

          {NEWS.map((n, i) => {
            const active = i === index;
            return (
              <div
                key={n.id}
                aria-hidden={!active}
                className={`grid items-center gap-8 transition-[opacity,transform] duration-500 ease-out md:grid-cols-[1fr_1.05fr] md:gap-14 lg:gap-20 ${
                  active
                    ? "act-live relative translate-y-0 opacity-100"
                    : "pointer-events-none absolute inset-0 -translate-y-2 opacity-0"
                }`}
              >
                
                <div className="md:pl-[7%]">
                  <div className=" flex flex-row ">
                     {/* Flèches */}
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Actualité précédente"
            className=" left-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center text-2xl text-ink/60 transition-colors hover:text-ink md:flex"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Actualité suivante"
            className=" right-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center text-2xl text-ink/60 transition-colors hover:text-ink md:flex"
          >
            <span aria-hidden="true">›</span>
          </button>
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-ink/50">{n.category}</p>
                  <h2 className="mt-4 max-w-2xl text-[clamp(1.75rem,3.5vw,3rem)] font-extrabold uppercase leading-[1.04] tracking-[-0.01em] text-ink">
                    {n.title}
                  </h2>
                  <p className="mt-6 max-w-xl text-[13px] leading-relaxed text-ink/70 md:text-[15px]">
                    {n.excerpt}
                  </p>
                  <SmartLink
                    to={n.to}
                    className="group mt-8 inline-flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.18em] text-ink"
                  >
                    Lire la suite
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/25 text-[15px] transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-white">
                      →
                    </span>
                  </SmartLink>
                </div>

                <div className="relative aspect-[4/3] overflow-hidden bg-mist md:aspect-[5/6]">
                  <img
                    src={n.img}
                    alt={n.alt}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Pied : points, filet, lien */}
        <div className="act-foot mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-5 md:mt-14">
          <div className="flex items-center gap-2.5">
            {NEWS.map((n, i) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Afficher l'actualité ${i + 1} sur ${NEWS.length}`}
                aria-current={i === index}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-2.5 bg-brand ring-4 ring-ink/25" : "w-2.5 bg-ink/20 hover:bg-ink/40"
                }`}
              />
            ))}
          </div>

          <span aria-hidden="true" className="hidden h-px w-40 bg-ink/25 lg:block" />

          <SmartLink
            to="/actualites"
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink underline-offset-4 transition-colors hover:text-brand hover:underline"
          >
            Lire toutes les actualités
          </SmartLink>
        </div>
      </div>
    </section>
  );
}
