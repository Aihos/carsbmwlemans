import { useEffect, useRef } from "react";
import { gsap, reduced } from "../lib/anim";
import { GALLERY, INTRO_BBOX, inkRatio, inkStyle } from "../data/site";

type Props = { onReveal: () => void; onDone: () => void };

/* Écran de chargement (wireframes 16 à 20) : un carré bleu centré, les voitures
   qui glissent de la gauche vers la droite, et le compteur 00 → 99 à côté.

   Les visuels sont des PNG détourés vus de profil. Les bornes du dessin utile
   sont mesurées sur le canal alpha de chaque fichier (voir data/site.ts) : elles
   posent toutes les voitures sur la même ligne de sol et à la même échelle, quel
   que soit le vide transparent autour du dessin. */
const CARS = Object.entries(INTRO_BBOX).map(([src, bbox]) => ({ src, ...bbox }));

/* Mise à l'échelle dans le repère du carré bleu (1 unité = 1 % du carré) */
const SUBJECT_W = 106; // largeur de la voiture
const SUBJECT_L = 17; // marge à gauche de la voiture

/* Défilement des voitures : chaque voiture APPARAÎT sur place (fondu d'opacité
   très court, aucun déplacement horizontal), puis laisse la place à la suivante.
   La série boucle LOOPS fois, et la dernière voiture disparaît avant que le
   carré bleu n'envahisse l'écran. */
const LOOPS = 2;
const PASS = 0.3; // délai entre deux apparitions
const FADE = 0.14; // durée de l'apparition (opacité 0 → 1)
const T_START = 0.45;
const T_END = T_START + CARS.length * LOOPS * PASS;
const LAST = CARS.length - 1;

/* Vitesse de lecture de la timeline.
   Base 1,43 = réglage d'origine (~30 % plus rapide) ; × 1/0,75 = 25 % plus
   rapide encore, demandé ensuite. Modifier ici suffit : tout l'écran suit. */
const SPEED = 1.43 / 0.75; // ≈ 1,91

const IMAGES = [...CARS.map((c) => c.src), "/img/produit/voitureA-net.png", ...GALLERY];

function preload(srcs: string[]) {
  return Promise.all(
    srcs.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = src;
        }),
    ),
  );
}

export default function Preloader({ onReveal, onDone }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const square = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const fired = useRef({ reveal: false, done: false });

  const fireReveal = () => {
    if (fired.current.reveal) return;
    fired.current.reveal = true;
    onReveal();
  };
  const fireDone = () => {
    if (fired.current.done) return;
    fired.current.done = true;
    onDone();
  };

  useEffect(() => {
    if (reduced()) {
      fireReveal();
      fireDone();
      return;
    }

    let tl: gsap.core.Timeline | null = null;
    let alive = true;

    // état de départ, avant même le téléchargement des visuels (pas de flash)
    gsap.set(".pl-car", { autoAlpha: 0 });
    gsap.set(square.current, { autoAlpha: 0, scale: 0.9 });
    gsap.set(".pl-count", { autoAlpha: 0, y: 10 });

    const play = () => {
      if (!alive) return;

      const count = { v: 0 };

      tl = gsap.timeline({ onComplete: fireDone });
      const line = tl;
      /* Écran de chargement accéléré, voir SPEED en tête de fichier. */
      line.timeScale(SPEED);

      // 1. le carré bleu et le compteur se posent
      line.to(square.current, { autoAlpha: 1, scale: 1, duration: 0.55, ease: "power3.out" }, 0)
        .to(".pl-count", { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.15)
        .to(
          count,
          {
            v: 99,
            duration: T_END - T_START,
            ease: "none",
            onUpdate: () => {
              if (num.current) num.current.textContent = String(Math.round(count.v)).padStart(2, "0");
            },
          },
          T_START,
        );

      // 2. les voitures apparaissent sur place (opacité 0 → 1, aucun déplacement),
      //    série répétée LOOPS fois
      for (let i = 0; i < CARS.length * LOOPS; i += 1) {
        const car = `.pl-car-${i % CARS.length}`;
        const before = `.pl-car-${(i + CARS.length - 1) % CARS.length}`;
        const t = T_START + i * PASS;

        line
          .set(before, { autoAlpha: 0 }, t)
          .fromTo(car, { autoAlpha: 0 }, { autoAlpha: 1, duration: FADE, ease: "power1.out" }, t);
      }

      // 3. la dernière voiture disparaît, le carré bleu envahit l'écran puis se
      //    lève pour révéler le site
      line.to(".pl-count", { autoAlpha: 0, y: -12, duration: 0.3, ease: "power2.in" }, T_END - 0.1)
        .to(`.pl-car-${LAST}`, { autoAlpha: 0, duration: 0.28, ease: "power2.in" }, T_END)
        .to(
          square.current,
          {
            scale: () => {
              const s = stage.current;
              if (!s) return 6;
              const r = s.getBoundingClientRect();
              return Math.max(window.innerWidth / r.width, window.innerHeight / r.height) * 1.06;
            },
            duration: 0.6,
            ease: "power3.inOut",
          },
          T_END + 0.12,
        )
        .add(() => fireReveal(), T_END + 0.46)
        .to(root.current, { yPercent: -100, duration: 0.8, ease: "power4.inOut" }, T_END + 0.5)
        .set(root.current, { pointerEvents: "none" });
    };

    preload(IMAGES).then(play);

    return () => {
      alive = false;
      tl?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] overflow-hidden bg-page"
      aria-hidden="true"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div ref={stage} className="relative aspect-square w-[clamp(190px,22vw,330px)]">
          <div ref={square} className="absolute inset-0 bg-cobalt" />

          {CARS.map((c, i) => (
            <div
              key={c.src}
              className={`pl-car pl-car-${i} absolute bottom-0`}
              style={{
                width: `${SUBJECT_W}%`,
                left: `${SUBJECT_L}%`,
                aspectRatio: inkRatio(c),
              }}
            >
              <img
                src={c.src}
                alt=""
                className="absolute block"
                style={inkStyle(c)}
                draggable={false}
              />
            </div>
          ))}

          <span
            ref={num}
            className="pl-count absolute left-[calc(100%+8%)] top-[-2%] font-display text-[clamp(1.1rem,3.4vw,2.1rem)] font-bold leading-none tracking-tight text-cobalt tabular-nums"
          >
            00
          </span>
        </div>
      </div>
    </div>
  );
}
