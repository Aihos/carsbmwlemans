import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ContactModal from "./ContactModal";
import SmartLink from "./SmartLink";
import WheelIcon from "./WheelIcon";
import AccessoireIcon from "./AccessoireIcon";
import {
  ACCESSORIES,
  CARS,
  COLORS,
  ENGINES,
  EUR,
  EUR2,
  ROUNDEL,
  SEATS,
  TRIMS,
  WHEELS,
  inkRatio,
  inkStyle,
} from "../data/site";
import { gsap, useGSAP, reduced } from "../lib/anim";

const APPORT = 0.1;
const DUREE = 48;

/* Composeur BMW — un seul composant pour les deux emplacements :
   — `variant="page"` : contenu de la route /configurateur (l'atelier en grand) ;
   — `variant="home"` : la section #configurateur de la page d'accueil.
   Tout tient dans un hero 100svh : aperçu, options et prix restent visibles
   sans défiler, la barre de validation est fixée en bas de la fenêtre.
   « Terminer » ouvre la popup de rendez-vous (ContactModal) avec la
   configuration retenue — le même composant que le bouton « Réserver » de
   l'en-tête. */
export default function ConfigurateurComposer({
  variant = "page",
  id = "configurateur",
}: {
  variant?: "page" | "home";
  id?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [barVisible, setBarVisible] = useState(true);

  /* La barre de validation est fixée en bas de l'écran : elle reste visible
     tant que la section occupe l'écran, et s'efface dès qu'on l'a dépassée
     (sinon elle flotte sur les sections suivantes — footer sur /configurateur,
     galerie et réservation sur la page d'accueil). Le contrôle regarde les deux
     bords de la section : sur l'accueil elle est très loin sous la ligne de
     flottaison au chargement et la barre doit rester absente. */
  useEffect(() => {
    const onScroll = () => {
      const rect = root.current?.getBoundingClientRect();
      if (!rect) return;
      setBarVisible(rect.top < window.innerHeight - 140 && rect.bottom > 140);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const modeleId = params.get("modele") ?? CARS[0].id;
  const car = CARS.find((c) => c.id === modeleId) ?? CARS[0];

  const [colorId, setColorId] = useState(COLORS[0].id);
  const [wheelId, setWheelId] = useState(WHEELS[0].id);
  const [engineId, setEngineId] = useState(ENGINES[0].id);
  const [seatId, setSeatId] = useState(SEATS[0].id);
  const [trimId, setTrimId] = useState(TRIMS[0].id);
  /* Accessoires : sélection multiple (ce sont des articles, pas des variantes) */
  const [accessoryIds, setAccessoryIds] = useState<string[]>([]);

  const color = COLORS.find((c) => c.id === colorId) ?? COLORS[0];
  const wheel = WHEELS.find((w) => w.id === wheelId) ?? WHEELS[0];
  const engine = ENGINES.find((e) => e.id === engineId) ?? ENGINES[0];
  const seat = SEATS.find((s) => s.id === seatId) ?? SEATS[0];
  const trim = TRIMS.find((t) => t.id === trimId) ?? TRIMS[0];
  const accessoryList = ACCESSORIES.filter((a) => accessoryIds.includes(a.id));
  const accessoryTotal = accessoryList.reduce((sum, a) => sum + a.price, 0);

  const interiorTotal = seat.price + trim.price;

  const total = car.price + wheel.price + engine.price + interiorTotal + accessoryTotal;
  const mensualite = (total * (1 - APPORT)) / DUREE;
  const options = wheel.price + engine.price + interiorTotal + accessoryTotal;

  const toggleAccessory = (id: string) =>
    setAccessoryIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const configuration = [
    car.name,
    color.name,
    `${wheel.tyre} ${wheel.size} ${wheel.style}`,
    `${engine.name} · ${engine.power}`,
    `${seat.family} ${seat.name}`,
    trim.name,
    ...accessoryList.map((a) => a.name),
    `Prix ${EUR(total)}`,
  ].join(" · ");

  /* Entrée des panneaux (pas de ScrollTrigger : la section tient dans l'écran) */
  useGSAP(
    () => {
      if (reduced()) return;
      gsap.fromTo(
        ".cfg-in",
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.07, ease: "power3.out" },
      );
    },
    { scope: root },
  );

  /* Changement de configuration : la voiture se repose */
  useGSAP(
    () => {
      if (reduced() || !carRef.current) return;
      gsap.fromTo(
        carRef.current,
        { scale: 0.96, autoAlpha: 0.7 },
        { scale: 1, autoAlpha: 1, duration: 0.7, ease: "power3.out" },
      );
    },
    { dependencies: [car.id, colorId, wheelId, engineId, seatId, trimId], scope: root },
  );

  const micro = "text-[9px] font-semibold uppercase tracking-[0.22em] text-ink/45";
  const blockTitle = "font-display text-base font-bold uppercase tracking-wide text-ink";
  const optionBox = (active: boolean) =>
    `border transition-all duration-300 ${
      active ? "border-brand bg-brand/5" : "border-line hover:border-ink/30"
    }`;

  return (
    <section
      id={id}
      ref={root}
      className={`relative flex min-h-[100svh] flex-col pb-24 ${
        variant === "page" ? "pt-20 md:pt-24" : "pt-12 md:pt-16"
      }`}
    >
      <div className="mx-auto flex w-full min-h-0 max-w-[1600px] flex-1 flex-col gap-3 px-5 md:px-10">
        {/* Bandeau haut : titre + choix du modèle */}
        <div className="cfg-in flex shrink-0 flex-wrap items-end justify-between gap-x-8 gap-y-2">
          <div>
            <p className={micro}>Atelier de configuration</p>
            <h1 className="mt-1 font-display text-[clamp(1.35rem,2.4vw,2.1rem)] font-black uppercase leading-[1.06] text-ink">
              Configurez votre BMW
            </h1>
          </div>

          <div className="no-scrollbar flex max-w-full gap-2 overflow-x-auto pb-0.5">
            {CARS.map((c) => {
              const active = c.id === car.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setParams({ modele: c.id }, { replace: true })}
                  aria-pressed={active}
                  className={`shrink-0 border px-3.5 py-2 text-left transition-colors ${
                    active
                      ? "border-brand bg-brand text-white"
                      : "border-line bg-white text-ink hover:border-ink/40"
                  }`}
                >
                  <span className="block whitespace-nowrap font-display text-sm leading-tight">
                    {c.name}
                  </span>
                  <span
                    className={`mt-0.5 block text-[9px] uppercase tracking-[0.14em] ${
                      active ? "text-white/70" : "text-ink/45"
                    }`}
                  >
                    {EUR(c.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Corps : aperçu + options.
            `lg:grid-rows-1` = minmax(0,1fr) : sans lui la ligne `auto` se cale
            sur le min-content du panneau d'options (le texte ne se comprime pas
            verticalement) et pousse la barre TERMINER hors de l'écran. */}
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.5fr_1fr] lg:grid-rows-1">
          {/* Aperçu */}
          <div className="cfg-in flex min-h-0 min-w-0 flex-col">
            <div className="grain relative flex min-h-0 flex-1 items-center justify-center overflow-hidden border border-line bg-white p-4 lg:p-6">
              <div
                className="absolute inset-0 opacity-55 transition-[background] duration-500"
                style={{
                  background: `radial-gradient(64% 76% at 50% 66%, ${color.hex}66 0%, transparent 70%)`,
                }}
              />
              <img
                src={ROUNDEL}
                alt=""
                aria-hidden="true"
                className="watermark left-1/2 top-6 h-24 w-24 -translate-x-1/2 opacity-[0.06] lg:h-32 lg:w-32"
              />
              <div ref={carRef} className="relative z-10 flex h-full w-full items-center justify-center">
                {car.bbox ? (
                  <div
                    className="relative h-full w-auto max-w-full"
                    style={{ aspectRatio: inkRatio(car.bbox) }}
                  >
                    <img
                      src={car.img}
                      alt={`${car.name} configurée`}
                      className="absolute"
                      style={inkStyle(car.bbox)}
                    />
                  </div>
                ) : (
                  <img
                    src={car.img}
                    alt={`${car.name} configurée`}
                    className="max-h-full max-w-[84%] object-contain"
                  />
                )}
              </div>
              <span className="absolute bottom-0 left-0 z-20 flex items-center gap-2 border-t border-r border-line bg-white/90 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-ink backdrop-blur-sm">
                <span
                  className="h-3 w-3 rounded-full ring-1 ring-ink/15"
                  style={{ background: color.hex }}
                />
                {color.name}
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="cfg-in flex min-h-0 min-w-0 flex-col gap-3 overflow-y-auto border border-line bg-white p-3.5 md:p-4 lg:max-h-[calc(100svh-14rem)]">
            <div>
              <div className="flex items-baseline justify-between">
                <h2 className={blockTitle}>Couleur</h2>
                <span className="text-[9px] uppercase tracking-[0.16em] text-ink/45">
                  {color.name}
                </span>
              </div>
              <div className="mt-2.5 grid grid-cols-8 gap-2">
                {COLORS.map((c) => {
                  const active = c.id === color.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColorId(c.id)}
                      aria-pressed={active}
                      aria-label={c.name}
                      title={c.name}
                      className={`aspect-square rounded-full ring-1 transition-all duration-300 ${
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

            <div className="border-t border-line pt-3">
              <div className="flex items-baseline justify-between">
                <h2 className={blockTitle}>Jantes</h2>
                <span className="text-[9px] uppercase tracking-[0.16em] text-ink/45">
                  {wheel.tyre} · {wheel.size}
                </span>
              </div>
              <div className="mt-2.5 grid grid-cols-4 gap-1.5">
                {WHEELS.map((w) => {
                  const active = w.id === wheel.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWheelId(w.id)}
                      aria-pressed={active}
                      className={`flex flex-col items-center gap-0.5 p-1.5 text-center ${optionBox(active)}`}
                    >
                      <WheelIcon spokes={w.spokes} active={active} className="h-6 w-6" />
                      <span className="text-[8px] font-semibold uppercase tracking-[0.06em] text-ink/70">
                        {w.style}
                      </span>
                      <span className="text-[8px] text-ink/45">
                        {w.price === 0 ? "Inclus" : `+ ${EUR(w.price)}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-line pt-3">
              <div className="flex items-baseline justify-between">
                <h2 className={blockTitle}>Motorisation</h2>
                <span className="text-[9px] uppercase tracking-[0.16em] text-ink/45">
                  {ENGINES.length} options
                </span>
              </div>
              <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                {ENGINES.map((e) => {
                  const active = e.id === engine.id;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setEngineId(e.id)}
                      aria-pressed={active}
                      className={`px-2 py-2 text-left ${optionBox(active)}`}
                    >
                      <span
                        className={`block font-display text-[11px] font-bold leading-tight ${
                          active ? "text-brand" : "text-ink"
                        }`}
                      >
                        {e.name}
                      </span>
                      <span className="mt-0.5 block text-[8px] uppercase tracking-[0.1em] leading-snug text-ink/50">
                        {e.power}
                      </span>
                      <span className="mt-0.5 block text-[8px] font-semibold uppercase tracking-[0.1em] text-ink/55">
                        {e.price === 0 ? "Inclus" : `+ ${EUR(e.price)}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Intérieur — sellerie. Visuels d'exemple du configurateur BMW. */}
            <div className="border-t border-line pt-3">
              <div className="flex items-baseline justify-between">
                <h2 className={blockTitle}>Sellerie</h2>
                <span className="text-[9px] uppercase tracking-[0.16em] text-ink/45">
                  {seat.family} · {seat.name}
                </span>
              </div>
              <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                {SEATS.map((s) => {
                  const active = s.id === seat.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSeatId(s.id)}
                      aria-pressed={active}
                      title={`${s.family} ${s.name}`}
                      className={`flex flex-col items-center gap-1 p-1.5 text-center ${optionBox(active)}`}
                    >
                      <span className="h-8 w-full overflow-hidden bg-mist">
                        <img
                          src={s.img}
                          alt=""
                          aria-hidden="true"
                          className="h-full w-full object-cover"
                          style={{ filter: s.filter }}
                        />
                      </span>
                      <span className="text-[8px] font-semibold uppercase tracking-[0.06em] leading-snug text-ink/70">
                        {s.family}
                      </span>
                      <span className="text-[8px] leading-snug text-ink/50">{s.name}</span>
                      <span className="text-[8px] text-ink/45">
                        {s.price === 0 ? "Inclus" : `+ ${EUR(s.price)}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inserts décoratifs */}
            <div className="border-t border-line pt-3">
              <div className="flex items-baseline justify-between">
                <h2 className={blockTitle}>Inserts décoratifs</h2>
                <span className="text-[9px] uppercase tracking-[0.16em] text-ink/45">{trim.name}</span>
              </div>
              <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                {TRIMS.map((t) => {
                  const active = t.id === trim.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTrimId(t.id)}
                      aria-pressed={active}
                      title={t.name}
                      className={`flex flex-col items-center gap-1 p-1.5 text-center ${optionBox(active)}`}
                    >
                      <span className="h-6 w-full overflow-hidden bg-mist">
                        <img
                          src={t.img}
                          alt=""
                          aria-hidden="true"
                          className="h-full w-full object-cover"
                          style={{ filter: t.filter }}
                        />
                      </span>
                      <span className="text-[8px] leading-snug text-ink/55">{t.name}</span>
                      <span className="text-[8px] text-ink/45">
                        {t.price === 0 ? "Inclus" : `+ ${EUR(t.price)}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accessoires — sélection multiple */}
            <div className="border-t border-line pt-3">
              <div className="flex items-baseline justify-between">
                <h2 className={blockTitle}>Accessoires</h2>
                <span className="text-[9px] uppercase tracking-[0.16em] text-ink/45">
                  {accessoryList.length === 0
                    ? "aucun"
                    : `${accessoryList.length} sélectionné${accessoryList.length > 1 ? "s" : ""}`}
                </span>
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                {ACCESSORIES.map((a) => {
                  const active = accessoryIds.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleAccessory(a.id)}
                      aria-pressed={active}
                      title={`${a.name} — ${a.detail}`}
                      className={`flex items-center gap-2 p-2 text-left ${optionBox(active)}`}
                    >
                      {a.img ? (
                        <span className="h-6 w-6 shrink-0 overflow-hidden bg-mist">
                          <img
                            src={a.img}
                            alt=""
                            aria-hidden="true"
                            className="h-full w-full object-cover"
                          />
                        </span>
                      ) : (
                        <AccessoireIcon
                          name={a.icon}
                          className={`h-6 w-6 shrink-0 ${active ? "text-brand" : "text-ink/55"}`}
                        />
                      )}
                      <span className="min-w-0">
                        <span className="block text-[8px] font-semibold uppercase leading-snug tracking-[0.06em] text-ink/70">
                          {a.name}
                        </span>
                        <span className="block text-[8px] text-ink/45">
                          {a.price === 0 ? "Inclus" : `+ ${EUR(a.price)}`}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Barre de validation (desktop) — fixée en bas de la fenêtre : elle
            reste visible dans la section même sur un écran court.
            Pas de classe `cfg-in` ici : le reveal GSAP écrit `opacity: 1` en
            inline, ce qui écraserait le `opacity-0` de l'état masqué et
            ferait flotter la barre sur toute la page. */}
        <div
          className={`fixed inset-x-0 bottom-0 z-40 hidden border-t border-line bg-page/95 backdrop-blur-md transition-opacity duration-300 lg:block ${
            barVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="mx-auto flex w-full max-w-[1600px] items-end justify-between gap-6 px-5 py-3.5 md:px-10">
            <div className="flex flex-wrap items-baseline gap-x-7 gap-y-1">
              <div>
                <span className={micro}>Prix total configuré</span>
                <p className="font-display text-xl font-bold leading-tight text-ink">
                  {EUR(total)}
                </p>
              </div>
              <div>
                <span className={micro}>Mensualité estimée</span>
                <p className="font-display text-base font-bold leading-tight text-brand">
                  {EUR2(mensualite)} / mois
                </p>
              </div>
              <p className="text-[10px] text-ink/45">
                {DUREE} mois · apport {Math.round(APPORT * 100)} % ·{" "}
                {options === 0 ? "équipement de série" : `${EUR(options)} d'options`}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <SmartLink
                to="/catalogue"
                className="border border-line bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink"
              >
                Catalogue
              </SmartLink>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="group inline-flex items-center gap-3 bg-brand px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-navy"
              >
                Réserver mon essai
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de validation (mobile) — même règle d'affichage que la barre
          desktop, sinon elle resterait collée en bas de toutes les pages. */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-line bg-white/95 px-5 py-3 backdrop-blur-md transition-opacity duration-300 lg:hidden ${
          barVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div>
          <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-ink/45">
            Total configuré
          </span>
          <span className="block font-display text-base font-bold leading-tight text-ink">
            {EUR(total)}
            <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/50">
              {EUR2(mensualite)}/mois
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 bg-brand px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
        >
          Réserver
        </button>
      </div>

      <ContactModal
        open={open}
        onClose={() => setOpen(false)}
        vehicule={car.name}
        colorName={color.name}
        colorHex={color.hex}
        jantes={`${wheel.tyre} · ${wheel.size} ${wheel.style}`}
        moteur={`${engine.name} · ${engine.power}`}
        sellerie={`${seat.family} · ${seat.name}`}
        inserts={trim.name}
        accessoires={accessoryList.length ? accessoryList.map((a) => a.name).join(", ") : ""}
        configuration={configuration}
        total={EUR(total)}
        mensualite={EUR2(mensualite)}
      />
    </section>
  );
}
