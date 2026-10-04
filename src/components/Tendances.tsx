import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, reduced } from "../lib/anim";
import { CARS, EUR, EUR2, ROUNDEL, inkRatio, inkStyle } from "../data/site";
import SmartLink from "./SmartLink";

export default function Tendances() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(Math.max(0, CARS.length - 4));

  const gap = () => {
    const t = track.current;
    if (!t) return 24;
    return parseFloat(getComputedStyle(t).columnGap || "24") || 24;
  };

  const step = () => {
    const first = track.current?.firstElementChild as HTMLElement | null;
    return (first?.offsetWidth ?? 320) + gap();
  };

  useEffect(() => {
    const compute = () => {
      const vp = viewport.current;
      const t = track.current;
      if (!vp || !t) return;
      const s = step();
      const perView = Math.max(1, Math.floor((vp.clientWidth + gap()) / s));
      const mx = Math.max(0, CARS.length - perView);
      setMaxIndex(mx);
      setIndex((v) => Math.min(v, mx));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useGSAP(
    () => {
      if (!track.current) return;
      gsap.to(track.current, {
        x: -index * step(),
        duration: reduced() ? 0 : 0.85,
        ease: "power3.inOut",
      });
    },
    { dependencies: [index] },
  );

  const go = (d: number) => setIndex((v) => Math.min(Math.max(v + d, 0), maxIndex));

  return (
    <section id="tendances" ref={root} className="relative overflow-hidden py-16 md:py-24">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <h2
          data-lines
          className="font-display text-[clamp(2.4rem,7.4vw,6rem)] font-bold uppercase leading-[1.06] tracking-[-0.01em] text-ink"
        >
          <span className="mask-line">
            <span>Nos</span>
          </span>
          <span className="mask-line">
            <span>Modèles</span>
          </span>
        </h2>

        <div className="mt-4 flex items-end justify-between gap-6">
          <p className="max-w-sm text-[11px] leading-relaxed text-ink/60 md:text-xs">
            Sportives BMW M, BMW i électriques, pièces BMW Classic : chaque modèle passe entre les
            mains de nos ateliers et part avec sa garantie constructeur. Essai sur route sans
            engagement, reprise de votre BMW et financement étudié en concession.
          </p>
          <div className=" flex flex-col gap-4 items-end">
          <span className="hidden shrink-0 font-display text-sm tabular-nums text-ink/40 md:block">
            {String(index + 1).padStart(2, "0")} / {String(CARS.length).padStart(2, "0")}
          </span>
 <div className="flex justify-center b">
        <SmartLink
          to="/catalogue"
          className="inline-flex items-center gap-3 border border-line px-8 py-4 text-[11px] uppercase tracking-[0.16em] text-ink transition-colors hover:border-ink"
        >
          Voir tous nos modèles
        </SmartLink>
      </div>
          </div>
        </div>

        <div ref={viewport} className="mt-10 overflow-hidden md:mt-14">
          <div ref={track} className="flex gap-6 will-change-transform">
            {CARS.map((c) => (
              <article
                key={c.id}
                className="group flex w-[78vw] shrink-0 flex-col bg-mist sm:w-[48vw] md:w-[300px] lg:w-[318px]"
              >
                {/* Visuel : roundel en filigrane + voiture détourée */}
                <div className="relative flex aspect-[5/4] items-center justify-center overflow-hidden px-5">
                  <img
                    src={ROUNDEL}
                    alt=""
                    aria-hidden="true"
                    className="watermark left-1/2 top-1/2 w-[74%] -translate-x-1/2 -translate-y-1/2 opacity-[0.09] grayscale"
                  />
                  {c.bbox ? (
                    <div className="relative z-10 w-[86%]" style={{ aspectRatio: inkRatio(c.bbox) }}>
                      <img src={c.img} alt={c.name} className="absolute" style={inkStyle(c.bbox)} />
                    </div>
                  ) : (
                    <img
                      src={c.img}
                      alt={c.name}
                      className="relative z-10 w-[94%] transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  )}
                </div>

                <div className="flex items-end justify-between gap-4 px-5 pt-3">
                  <div>
                    <h3 className="font-display text-2xl leading-none text-ink">{c.name}</h3>
                    <p className="mt-2 text-[11px] text-ink/55">À partir de {EUR2(c.monthly)} / mois</p>
                  </div>
                  <span className="shrink-0 font-display text-[1.35rem] leading-none text-ink">
                    {EUR(c.price)}
                  </span>
                </div>

                <SmartLink
                  to={`/?vehicule=${encodeURIComponent(c.name)}#reservation`}
                  className="mt-5 block bg-ink py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand"
                >
                  Réserver un essai
                </SmartLink>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={index === 0}
            aria-label="Modèles précédents"
            className="flex h-12 w-12 items-center justify-center bg-ink text-white transition-all hover:bg-brand disabled:opacity-30"
          >
            <span aria-hidden="true">◀</span>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={index >= maxIndex}
            aria-label="Modèles suivants"
            className="flex h-12 w-12 items-center justify-center bg-ink text-white transition-all hover:bg-brand disabled:opacity-30"
          >
            <span aria-hidden="true">▶</span>
          </button>
        </div>
      </div>
    </section>
  );
}
