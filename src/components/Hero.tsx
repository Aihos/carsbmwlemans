import { useRef } from "react";
import { gsap, useGSAP, reduced } from "../lib/anim";
import SmartLink from "./SmartLink";
import { useReservation } from "../lib/reservation";

/* Hero vidéo plein écran (wireframe 31, d'après la page d'accueil bmw.fr).
   La vidéo est un plan promotionnel BMW (HLS Scene7 converti en MP4) : le hero
   la remonte sous l'en-tête grâce à une marge négative, donc l'image occupe
   tout le premier écran tandis que l'en-tête (en flux) reste posé dessus.
   Deux sources : WebM/VP9 d'abord (2,2 Mo contre 5 Mo pour le MP4), le MP4
   restant en repli pour les navigateurs sans VP9. */
const VIDEO_WEBM = "/video/hero-bmw.webm";
const VIDEO_MP4 = "/video/hero-bmw.mp4";
const POSTER = "/video/hero-poster.webp";

export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);
  const reservation = useReservation();

  useGSAP(
    () => {
      if (!ready || reduced()) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".hero-video",
        { scale: 1.14, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 2, ease: "power2.out" },
      )
        .fromTo(
          ".hero-word",
          { yPercent: 115, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 1.15, stagger: 0.11 },
          0.3,
        )
        .fromTo(".hero-cta", { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9 }, 0.75)
        .fromTo(
          ".hero-scroll",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.8, repeat: -1, yoyo: true, ease: "sine.inOut" },
          1.4,
        );
    },
    { scope: root, dependencies: [ready] },
  );

  return (
    <section
      id="top"
      ref={root}
      className="relative -mt-20 flex h-[100svh] max-h-[100svh] items-end justify-center overflow-hidden md:-mt-24"
    >
      <video
        className="hero-video absolute inset-0 h-full w-full object-cover"
        poster={POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
      >
        <source src={VIDEO_WEBM} type="video/webm" />
        <source src={VIDEO_MP4} type="video/mp4" />
      </video>

      {/* Voile : lisibilité du titre et de l'en-tête sur l'image */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/20 to-ink/80" />

      <div className="relative z-10 mx-auto mb-[8svh] flex w-full max-w-[1600px] flex-col items-center px-5 text-center md:px-10">
        <p className="mask-line font-sans text-[clamp(0.95rem,1.5vw,1.4rem)] font-light text-white/90">
          <span className="hero-word inline-block">Ventes privées · 13 &amp; 14 novembre 2026</span>
        </p>

        <h1 className="mt-2 font-sans text-[clamp(1.5rem,3.7vw,3.4rem)] font-bold uppercase leading-[1.08] tracking-[0.005em] text-white">
          <span className="mask-line">
            <span className="hero-word inline-block">Sur invitation</span>
          </span>
        </h1>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:mt-9">
          <button
            type="button"
            onClick={() => reservation?.open()}
            className="hero-cta inline-flex items-center gap-3 bg-white px-7 py-3.5 text-[11px] font-bold tracking-[0.08em] text-ink transition-colors hover:bg-brand hover:text-white md:text-xs"
          >
            Réserver mon créneau
          </button>
          <SmartLink
            to="/catalogue"
            className="hero-cta inline-flex items-center gap-3 border border-white/60 px-7 py-3.5 text-[11px] font-bold tracking-[0.08em] text-white backdrop-blur-[2px] transition-colors hover:bg-white hover:text-ink md:text-xs"
          >
            Voir les véhicules exposés
          </SmartLink>
        </div>
      </div>

      <span
        className="hero-scroll pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[9px] font-bold uppercase tracking-[0.3em] text-white/70"
        aria-hidden="true"
      >
        Défiler
      </span>
    </section>
  );
}
