import { useRef } from "react";
import { gsap, useGSAP, reduced } from "../lib/anim";

/* La devise BMW, dans sa langue d'origine : c'est le seul endroit du site où
   elle apparaît telle quelle, le reste du parcours parle français. */
const LINES = ["FREUDE", "AM", "FAHREN"];

export default function Statement() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduced()) return;
      gsap.fromTo(
        ".stmt-word",
        { yPercent: 112 },
        {
          yPercent: 0,
          duration: 1.25,
          stagger: 0.12,
          ease: "power4.out",
          scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
        },
      );
      gsap.fromTo(
        ".stmt-meta",
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} className="grain relative overflow-hidden bg-royal">
      <div className="relative z-10 mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_300px] md:items-end">
          <div className="font-display font-bold uppercase leading-[1.06] tracking-[-0.01em] text-white">
            {LINES.map((l, i) => (
              <span key={l} className="mask-line">
                <span
                  className={`stmt-word block text-[clamp(2.2rem,10vw,9.5rem)] ${
                    i === 1 ? "md:pl-[4%]" : i === 2 ? "md:pl-[2%]" : ""
                  }`}
                >
                  {l}
                </span>
              </span>
            ))}
          </div>

          <div className="stmt-meta max-w-xs md:pb-6 md:text-right">
            <p className="text-[15px] leading-relaxed text-white/75 md:text-base">
              « Freude am Fahren » : le plaisir de conduire, la devise de BMW depuis Munich. Celle
              qui a mené la BMW V12 LMR à la victoire aux 24 Heures du Mans en 1999. Sportives de la
              gamme M, BMW i électriques et pièces BMW Classic : tout est préparé par les ateliers de
              la concession pour les ventes privées.
            </p>
            <a
              href="#configurateur"
              className="mt-6 inline-flex items-center gap-3 border border-white/70 px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white hover:text-royal md:text-[11px]"
            >
              Composer ma BMW
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
