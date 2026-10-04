import { useRef } from "react";
import { gsap, useGSAP, reduced } from "../lib/anim";
import SmartLink from "./SmartLink";

/* Galerie : quatre grands visuels plein cadre, deux par ligne, chacun sur toute
   la hauteur de l'écran. La composition interne des cartes reprend celle de la
   carte « Collections » de Ferrari — micro-libellé, titre en capitales, appel à
   découvrir avec sa pastille fléchée. Le voile est dense en bas et léger en
   haut : il tient le contraste du texte sans éteindre la photo. */

type Shot = { kicker: string; title: string; src: string; alt: string; to: string };

const SHOTS: Shot[] = [
  {
    kicker: "Sportives",
    title: "Essai sur la côte",
    src: "/img/d.webp",
    alt: "BMW Coupé, essai sur la côte",
    to: "/catalogue",
  },
  {
    kicker: "BMW M",
    title: "BMW M2",
    src: "/img/troisquart/BMW-M2-2025-wallpaper.webp",
    alt: "BMW M2, sur route",
    to: "/catalogue",
  },
  {
    kicker: "BMW i",
    title: "Passer à l'électrique",
    src: "/img/BMW-i5-2024-Side_Profile.17799284.webp",
    alt: "BMW i5 eDrive40, profil",
    to: "/catalogue",
  },
  {
    kicker: "Berline de luxe",
    title: "BMW Série 7",
    src: "/img/troisquart/BMW-7-Series-2027-wallpaper.webp",
    alt: "BMW Série 7, essai",
    to: "/catalogue",
  },
];

export default function Gallery() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduced()) return;
      gsap.fromTo(
        ".gal-item",
        { yPercent: 10, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 1.05,
          stagger: 0.11,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
        },
      );
    },
    { scope: root },
  );

  return (
    <section id="galerie" ref={root} className="relative overflow-hidden">
      <div className="grid min-h-screen md:grid-cols-2">
        {SHOTS.map((s) => (
          <SmartLink
            key={s.title}
            to={s.to}
            ariaLabel={`${s.title}, découvrir`}
            className="gal-item group relative flex min-h-[280px] flex-col justify-end overflow-hidden bg-ink md:min-h-screen"
          >
            <img
              src={s.src}
              alt={s.alt}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10"
            />

            <div className="relative p-6 md:p-10">
              <p className="text-[15px] leading-none text-white/90 md:text-[18px]">{s.kicker}</p>
              <h3 className="mt-3 max-w-xl text-[26px] uppercase leading-[1.05] text-white md:text-[36px]">
                {s.title}
              </h3>
              <span className="mt-7 inline-flex items-center gap-4 text-[12px] uppercase tracking-[0.16em] text-white md:mt-9 md:text-[13px]">
                Découvrir
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 text-[14px] transition-colors group-hover:bg-white group-hover:text-ink md:h-12 md:w-12"
                >
                  →
                </span>
              </span>
            </div>
          </SmartLink>
        ))}
      </div>
    </section>
  );
}
