import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { gsap, useGSAP, reduced } from "../lib/anim";
import { CARS, EUR, EUR2, ROUNDEL, inkRatio, inkStyle } from "../data/site";
import SmartLink from "./SmartLink";

/* Glissement au doigt du carrousel.
   DRAG_MIN  : déplacement avant de décider si le geste part à l'horizontale.
   DRAG_STEP : distance qui fait passer au modèle suivant ou précédent.
   FLICK_*   : un geste court mais rapide change aussi de modèle. */
const DRAG_MIN = 8;
const DRAG_STEP = 56;
const FLICK_DIST = 18;
const FLICK_SPEED = 0.45; // px/ms

type Drag = {
  id: number;
  x: number;
  y: number;
  /** translateX du rail au moment de la prise en main. */
  base: number;
  t: number;
  axis: "" | "x" | "y";
};

export default function Tendances() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(Math.max(0, CARS.length - 4));
  /** Geste en cours (null = aucun). */
  const drag = useRef<Drag | null>(null);
  /** Horodatage du dernier glissement : sert à ne pas ouvrir un lien au lâcher. */
  const lastDrag = useRef(0);

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

  /** Amène le rail sur le modèle `i`. `duration` sert au retour élastique. */
  const animateTo = (i: number, duration = 0.85) => {
    if (!track.current) return;
    gsap.to(track.current, {
      x: -i * step(),
      duration: reduced() ? 0 : duration,
      ease: "power3.inOut",
    });
  };

  useGSAP(() => animateTo(index), { dependencies: [index] });

  const go = (d: number) => setIndex((v) => Math.min(Math.max(v + d, 0), maxIndex));

  /* Glissement au doigt : le rail suit le doigt, puis se cale sur un modèle.
     La souris est exclue, le carrousel garde ses flèches sur ordinateur. */
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const t = track.current;
    if (!t || e.pointerType === "mouse" || e.button !== 0) return;
    gsap.killTweensOf(t);
    drag.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      base: Number(gsap.getProperty(t, "x")) || 0,
      t: performance.now(),
      axis: "",
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture indisponible : les évènements continuent d'arriver au parent */
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const t = track.current;
    if (!d || !t || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!d.axis) {
      const dy = e.clientY - d.y;
      if (Math.abs(dx) < DRAG_MIN && Math.abs(dy) < DRAG_MIN) return;
      d.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (d.axis !== "x") return;
    // Résistance aux extrémités : le rail freine au lieu de partir.
    const min = -maxIndex * step();
    let x = d.base + dx;
    if (x > 0) x *= 0.35;
    else if (x < min) x = min + (x - min) * 0.35;
    gsap.set(t, { x });
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>, cancelled = false) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (d.axis !== "x") return;
    const dx = cancelled ? 0 : e.clientX - d.x;
    const speed = dx / Math.max(1, performance.now() - d.t);
    const flick = Math.abs(dx) > FLICK_DIST && Math.abs(speed) > FLICK_SPEED;
    let target = index;
    if (dx <= -DRAG_STEP || (flick && dx < 0)) target = Math.min(index + 1, maxIndex);
    else if (dx >= DRAG_STEP || (flick && dx > 0)) target = Math.max(index - 1, 0);
    lastDrag.current = performance.now();
    if (target !== index) setIndex(target);
    else animateTo(index, 0.35);
  };

  /** Un glissement ne doit pas ouvrir la fiche du modèle au lâcher. */
  const onClickCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (performance.now() - lastDrag.current > 500) return;
    e.preventDefault();
    e.stopPropagation();
  };

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
        <div className="flex justify-center">
        <SmartLink
          to="/catalogue"
          className="inline-flex items-center gap-3 border border-line px-8 py-4 text-[11px] uppercase tracking-[0.16em] text-ink transition-colors hover:border-ink"
        >
          Voir tous nos modèles
        </SmartLink>
      </div>
          </div>
        </div>

        <div
          ref={viewport}
          className="mt-10 overflow-hidden overscroll-x-none md:mt-14"
          style={{ touchAction: "pan-y" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => endDrag(e)}
          onPointerCancel={(e) => endDrag(e, true)}
          onClickCapture={onClickCapture}
        >
          <div ref={track} className="flex cursor-grab select-none gap-6 will-change-transform active:cursor-grabbing">
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
                    draggable={false}
                    className="watermark left-1/2 top-1/2 w-[74%] -translate-x-1/2 -translate-y-1/2 opacity-[0.09] grayscale"
                  />
                  {c.bbox ? (
                    <div className="relative z-10 w-[86%]" style={{ aspectRatio: inkRatio(c.bbox) }}>
                      <img
                        src={c.img}
                        alt={c.name}
                        draggable={false}
                        className="absolute"
                        style={inkStyle(c.bbox)}
                      />
                    </div>
                  ) : (
                    <img
                      src={c.img}
                      alt={c.name}
                      draggable={false}
                      className="relative z-10 w-[94%] transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  )}
                </div>

                <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                  <h3 className="min-h-[2.1em] font-display text-2xl leading-[1.05] text-ink">
                    {c.name}
                  </h3>
                  <div className="mt-2 flex items-end justify-between gap-4">
                    <p className="text-[11px] text-ink/55">À partir de {EUR2(c.monthly)} / mois</p>
                    <span className="shrink-0 font-display text-[1.35rem] leading-none text-ink">
                      {EUR(c.price)}
                    </span>
                  </div>
                </div>

                <SmartLink
                  to={`/?vehicule=${encodeURIComponent(c.name)}#reservation`}
                  className="block bg-ink py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand"
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

        <p className="mt-4 text-center text-[10px] uppercase tracking-[0.16em] text-ink/40 md:hidden">
          Glissez pour parcourir
        </p>
      </div>
    </section>
  );
}
