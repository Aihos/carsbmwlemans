/* ARCHIVÉ le 2026-10-04 — remplacé par src/components/ConfigurateurComposer.tsx
   (composeur partagé entre /configurateur et la section #configurateur de
   l'accueil). Conservé hors de src/ : tsconfig.app.json n'inclut que src, donc
   ce fichier n'est ni typé ni embarqué par le build — ses imports relatifs
   (« ../lib/anim », « ../data/site ») ne résolvent plus depuis old/. */
import { useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger } from "../lib/anim";
import { BASE_PRICE, CAR_NAME, COLORS, ENGINES, EUR, WHEELS } from "../data/site";
import SmartLink from "./SmartLink";
import WheelIcon from "./WheelIcon";

export default function Configurateur() {
  const root = useRef<HTMLElement>(null);
  const carRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState(COLORS[0]);
  const [wheel, setWheel] = useState(WHEELS[0]);
  const [engine, setEngine] = useState(ENGINES[0]);
  const first = useRef(true);

  const total = BASE_PRICE + wheel.price + engine.price;

  useGSAP(
    () => {
      if (first.current) {
        first.current = false;
        return;
      }
      if (!carRef.current) return;
      gsap.fromTo(
        carRef.current,
        { scale: 0.94, x: -18 },
        { scale: 1, x: 0, duration: 0.9, ease: "power3.out" },
      );
      if (glowRef.current) {
        gsap.fromTo(glowRef.current, { opacity: 0 }, { opacity: 0.55, duration: 0.9 });
      }
    },
    { dependencies: [color.id] },
  );

  useGSAP(
    () => {
      if (!carRef.current) return;
      gsap.fromTo(
        carRef.current,
        { autoAlpha: 0.55, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" },
      );
    },
    { dependencies: [wheel.id, engine.id] },
  );

  useGSAP(
    () => {
      gsap.fromTo(
        ".cfg-reveal",
        { y: 40, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
        },
      );
      ScrollTrigger.refresh();
    },
    { scope: root },
  );

  return (
    <section id="configurateur" ref={root} className="py-16 md:py-24">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="cfg-reveal max-w-3xl">
          <h2 className="font-display text-[clamp(1.7rem,5.1vw,4rem)] font-bold uppercase leading-[1.06] tracking-[-0.01em] text-ink">
            Composez votre BMW
          </h2>
          <p className="mt-4 max-w-xl text-[11px] leading-relaxed text-ink/60 md:text-sm">
            Teinte extérieure, jantes et motorisation : composez la BMW qui vous ressemble, puis
            adressez votre configuration à la concession.
          </p>
          <SmartLink
            to="/configurateur"
            className="mt-5 inline-flex items-center gap-3 border border-brand px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand transition-colors hover:bg-brand hover:text-white"
          >
            Ouvrir le configurateur
            <span aria-hidden="true">→</span>
          </SmartLink>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:gap-8">
          {/* Colonne aperçu */}
          <div className="cfg-reveal flex flex-col gap-4">
            <div className="flex items-baseline justify-between border-b border-line pb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-ink/50">
                Modèle
              </span>
              <span className="font-display text-lg font-bold text-ink md:text-xl">{CAR_NAME}</span>
            </div>

            <div
              ref={glowRef}
              className="grain relative flex aspect-[16/9] items-center justify-center overflow-hidden border border-line bg-white"
            >
              <div
                className="absolute inset-0 opacity-50 transition-colors duration-500"
                style={{
                  background: `radial-gradient(70% 80% at 50% 62%, ${color.hex}55 0%, transparent 68%)`,
                }}
              />
              <img
                src="/img/logo/BMW.svg"
                alt=""
                aria-hidden="true"
                className="watermark left-1/2 top-6 h-40 w-40 -translate-x-1/2 opacity-[0.06]"
              />
              <img
                ref={carRef}
                src="/img/produit/voitureA-net.png"
                alt={`${CAR_NAME} configurée`}
                className="relative z-10 w-[86%] object-contain"
              />
            </div>

            <dl className="grid grid-cols-1 divide-y divide-line border border-line bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="px-5 py-4">
                <dt className="text-[9px] font-bold uppercase tracking-[0.24em] text-ink/45">
                  Teinte extérieure
                </dt>
                <dd className="mt-2 flex items-center gap-2 text-sm font-bold text-ink">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full ring-1 ring-ink/15"
                    style={{ background: color.hex }}
                  />
                  {color.name}
                </dd>
              </div>
              <div className="px-5 py-4">
                <dt className="text-[9px] font-bold uppercase tracking-[0.24em] text-ink/45">
                  Jantes
                </dt>
                <dd className="mt-2 text-sm font-bold text-ink">
                  {wheel.tyre} · {wheel.size} {wheel.style}
                </dd>
              </div>
              <div className="px-5 py-4">
                <dt className="text-[9px] font-bold uppercase tracking-[0.24em] text-ink/45">
                  Motorisation
                </dt>
                <dd className="mt-2 text-sm font-bold text-ink">
                  {engine.name} · {engine.power}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap items-end justify-between gap-4 border border-line bg-mist px-5 py-4">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-ink/45">
                  Prix total configuré
                </span>
                <p className="mt-1 font-display text-2xl font-bold text-ink md:text-3xl">
                  {EUR(total)}
                </p>
              </div>
              <SmartLink
                to="/#reservation"
                className="group inline-flex items-center gap-3 bg-brand px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-navy"
              >
                Demander un devis
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </SmartLink>
            </div>
          </div>

          {/* Colonne options */}
          <div className="cfg-reveal border border-line bg-white p-5 md:p-7">
            <div>
              <h3 className="font-display text-xl font-bold text-ink md:text-2xl">Teinte extérieure</h3>
              <div className="mt-4 grid grid-cols-4 gap-3">
                {COLORS.map((c) => {
                  const active = c.id === color.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColor(c)}
                      aria-pressed={active}
                      aria-label={c.name}
                      title={c.name}
                      className={`flex aspect-square items-center justify-center rounded-full ring-1 transition-all duration-300 ${
                        active
                          ? "ring-2 ring-brand ring-offset-2 ring-offset-white"
                          : "ring-ink/10 hover:ring-ink/40"
                      }`}
                      style={{ background: c.hex }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="mt-8 border-t border-line pt-6">
              <h3 className="font-display text-xl font-bold text-ink md:text-2xl">Jantes</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {WHEELS.map((w) => {
                  const active = w.id === wheel.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWheel(w)}
                      aria-pressed={active}
                      className={`flex flex-col items-center gap-2 border p-3 text-center transition-all duration-300 ${
                        active ? "border-brand bg-brand/5" : "border-line hover:border-ink/30"
                      }`}
                    >
                      <WheelIcon spokes={w.spokes} active={active} />
                      <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink/70">
                        {w.style}
                      </span>
                      <span className="text-[9px] text-ink/40">
                        {w.price === 0 ? "Inclus" : `+ ${EUR(w.price)}`}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-ink/45">
                {wheel.tyre} · {wheel.size}
              </p>
            </div>

            <div className="mt-8 border-t border-line pt-6">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-xl font-bold text-ink md:text-2xl">Motorisation</h3>
                <span className="text-[10px] uppercase tracking-[0.18em] text-ink/45">
                  {ENGINES.length} options
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {ENGINES.map((e) => {
                  const active = e.id === engine.id;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setEngine(e)}
                      aria-pressed={active}
                      className={`border p-4 text-left transition-all duration-300 ${
                        active ? "border-brand bg-brand/5" : "border-line hover:border-ink/30"
                      }`}
                    >
                      <span
                        className={`block font-display text-xl font-bold ${active ? "text-brand" : "text-ink"}`}
                      >
                        {e.name}
                      </span>
                      <span className="mt-1 block text-[10px] uppercase tracking-[0.16em] text-ink/50">
                        {e.label}
                      </span>
                      <span className="mt-3 block text-[11px] font-bold text-ink/70">
                        {e.power}
                      </span>
                      <span className="mt-1 block text-[10px] text-ink/40">
                        {e.price === 0 ? "Inclus" : `+ ${EUR(e.price)}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
