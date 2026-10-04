/* ============================================================================
   ANCIEN HERO — archivé (wireframes 16-20 / 29 / 31).
   Remplacé par le hero vidéo plein écran → src/components/Hero.tsx
   (d'après la page d'accueil bmw.fr : Collections / LE PLAISIR DE CONDUIRE).

   Ce fichier est volontairement hors de src/ : il n'est donc ni compilé par
   tsc ni embarqué par Vite. Ses imports (../lib/anim, ../data/site) ne
   résolvent plus depuis ce dossier — le recopier dans src/components/ pour le
   réutiliser.
   ============================================================================ */
import { useRef } from "react";
import { gsap, useGSAP, reduced } from "../lib/anim";
import { ROUNDEL, inkRatio, inkStyle, type BBox } from "../data/site";
import SmartLink from "./SmartLink";

/* Voiture du hero : New5.png, posée sur la ligne de sol de son dessin utile
   (bornes mesurées sur le canal alpha du PNG : 1087 × 812, dessin x 44 → 1018,
   ligne de sol y 661). */
const HERO_CAR = "/img/intro/New5.png";
const HERO_BBOX: BBox = { w: 1087, h: 812, x0: 44, y0: 346, y1: 661, bw: 975 };

export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ready || reduced()) return;

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(
        ".hero-word",
        { yPercent: 118, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 1.25, stagger: 0.09 },
      )
        .fromTo(".hero-rule", { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "power3.inOut" }, 0.15)
        .fromTo(
          ".hero-meta",
          { y: 26, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.85, stagger: 0.08 },
          0.35,
        )
        .fromTo(
          ".hero-arch",
          { y: 90, scale: 0.94, autoAlpha: 0, transformOrigin: "bottom center" },
          { y: 0, scale: 1, autoAlpha: 1, duration: 1.4 },
          0.3,
        )
        .fromTo(
          ".hero-car",
          { y: 130, scale: 1.08, autoAlpha: 0 },
          { y: 0, scale: 1, autoAlpha: 1, duration: 1.5 },
          0.6,
        )
        .fromTo(".hero-mstripes", { x: 60, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.9 }, 1);

      /* Parallaxe continue : la voiture "flotte" légèrement */
    /*   gsap.to(".hero-car", {
        y: -14,
        duration: 4.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2.2,
      }); */
    },
    { scope: root, dependencies: [ready] },
  );

  return (
    <section
      id="top"
      ref={root}
      className="relative flex h-[calc(100svh-5rem)] max-h-[calc(100svh-5rem)] flex-col overflow-hidden md:h-[calc(100svh-6rem)] md:max-h-[calc(100svh-6rem)]"
    >
      {/* 1/3 — le titre */}
      <div className="mx-auto flex h-1/3 w-full max-w-[1600px] flex-col justify-end mt-10 px-5 md:px-10">
        <h1 className="flex items-end justify-between font-display text-[min(16vw,calc((100svh-5rem)*0.3),12rem)] font-black leading-[0.74] tracking-[-0.035em] text-royal md:text-[min(16vw,calc((100svh-6rem)*0.3),14rem)]">
          <span className="mask-line">
            <span className="hero-word">LE</span>
          </span>
          <span className="mask-line">
            <span className="hero-word">MANS</span>
          </span>
        </h1>

        <div className="hero-rule mt-3 h-px w-full origin-left bg-line md:mt-4" />
      </div>

      {/* 1/3 — accroche + actions */}
      <div className="mx-auto flex h-1/3 w-full max-w-[1600px] flex-col justify-center px-5 md:px-10">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start md:gap-16">
          <div className="max-w-xl">
            <p className="hero-meta text-[10px] font-semibold uppercase tracking-[0.3em] text-ink/60 md:text-xs">
              BMW Ampère Autopassion
            </p>
            <div className="mt-4 flex flex-wrap gap-3 md:mt-6">
              <SmartLink
                to="/catalogue"
                className="hero-meta group inline-flex items-center gap-3 border border-ink px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] transition-colors hover:bg-ink hover:text-white md:text-[11px]"
              >
                Découvrir le catalogue
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </SmartLink>
              <SmartLink
                to="/#reservation"
                className="hero-meta group inline-flex items-center gap-3 border border-ink px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] transition-colors hover:bg-ink hover:text-white md:text-[11px]"
              >
                Prendre rendez-vous
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </SmartLink>
            </div>
          </div>

          <p className="hero-meta max-w-[300px] text-[11px] leading-relaxed text-ink/70 md:max-w-[210px] md:text-right md:text-xs">
            Explorez toute la gamme de modèles BMW pour trouver le véhicule qui satisfera
            pleinement à vos désirs et à vos besoins. Prenez rendez-vous directement en concession
            pour votre projet.
          </p>
        </div>
      </div>

      {/* 1/3 — arche + voiture */}
      <div className="relative flex h-1/3 w-full items-end justify-center">

            <img
              src={ROUNDEL}
              alt=""
              aria-hidden="true"
              className="absolute top-[0%] origin-top left-1/2 w-full -translate-x-1/2 opacity-20"
            />
            <span className="noise absolute inset-0 z-[2]" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
            {/* Boîte = dessin utile de 5.png : les roues tombent sur la base de l'arche */}
            <div
              className="hero-car relative w-[95%] max-w-[1100px]"
              style={{ aspectRatio: inkRatio(HERO_BBOX) }}
            >
              <img
                src={HERO_CAR}
                alt="BMW M2 Coupé — vue de profil"
                className="absolute z-[1]"
                style={inkStyle(HERO_BBOX)}
              />
              <span
                className="noise absolute z-[2]"
                style={{
                  ...inkStyle(HERO_BBOX),
                  aspectRatio: `${HERO_BBOX.w} / ${HERO_BBOX.h}`,
                  maskImage: `url(${HERO_CAR})`,
                  WebkitMaskImage: `url(${HERO_CAR})`,
                  maskSize: "100% 100%",
                  WebkitMaskSize: "100% 100%",
                }}
              />
            </div>
          </div>
      </div>

      <div className="hero-mstripes absolute bottom-4 right-5 flex gap-1.5 md:bottom-8 md:right-10">
        <span className="h-12 w-3 -skew-x-[18deg] bg-azure md:h-20 md:w-5" />
        <span className="h-12 w-3 -skew-x-[18deg] bg-ink md:h-20 md:w-5" />
        <span className="h-12 w-3 -skew-x-[18deg] bg-white/70 md:h-20 md:w-5" />
      </div>
    </section>
  );
}
