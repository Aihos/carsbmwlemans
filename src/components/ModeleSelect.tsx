import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { CONFIGURABLES, EUR } from "../data/site";

/* Sélecteur de modèle du configurateur — Combobox façon shadcn/ui, calqué sur
   le composant Select du projet (mêmes bordure, ombre, typographie et angles
   vifs : aucun arrondi) : déclencheur en forme de champ, panneau avec champ de
   recherche en tête, ligne surlignée au survol et au clavier, coche sur le
   modèle retenu. Radix Select n'embarque pas de recherche : d'où ce composant
   dédié, plutôt qu'un Select sans filtre.

   shadcn n'est pas installé sur ce projet (pas de Radix ni de cmdk) : le
   composant est écrit ici, sans dépendance, pour ne pas alourdir le bundle ni
   le package.json. Le panneau est monté dans un portail (comme le fait Radix) :
   la page multiplie les `transform` GSAP, qui créent autant de contextes
   d'empilement — un panneau posé dans le flux du bandeau passerait sous la
   colonne d'options. Le portail le sort de cet arbre, en `position: fixed`.

   La liste vient de CONFIGURABLES, c'est-à-dire tout le catalogue. */

type Props = {
  /** id du modèle retenu */
  value: string;
  onChange: (id: string) => void;
};

const norm = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

type Pos = { left: number; top: number; width: number };

export default function ModeleSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [pos, setPos] = useState<Pos | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const car = CONFIGURABLES.find((c) => c.id === value) ?? CONFIGURABLES[0];

  const list = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return CONFIGURABLES;
    return CONFIGURABLES.filter((c) =>
      norm(`${c.name} ${c.motorisation} ${c.energy} ${c.family}`).includes(q),
    );
  }, [query]);

  /* Ouverture : recherche vierge, focus dans le champ, panneau calé sous le
     déclencheur, fermeture au clic extérieur et à Échap. Le panneau étant dans
     un portail, on surveille le défilement et le redimensionnement pour le
     garder collé au déclencheur. */
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setHighlight(0);

    /* Le déclencheur peut être en bas de la fenêtre (feuille mobile) : le
       panneau s'ouvre alors vers le haut au lieu de sortir de l'écran. Sa
       hauteur réelle n'est connue qu'après son rendu — d'où le second passage
       une image plus tard. */
    const place = () => {
      const r = triggerRef.current?.getBoundingClientRect();
      if (!r) return;
      const h = panelRef.current?.offsetHeight ?? 336;
      const roomBelow = window.innerHeight - r.bottom - 6;
      const above = roomBelow < h && r.top - 6 - h > 0;
      setPos({ left: r.left, top: above ? r.top - 6 - h : r.bottom + 6, width: r.width });
    };
    place();
    const frame = window.requestAnimationFrame(place);

    const timer = window.setTimeout(() => inputRef.current?.focus(), 20);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !panelRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  /* La liste change : la surbrillance repart du haut. */
  useEffect(() => setHighlight(0), [query]);

  /* La ligne surlignée reste visible dans la liste. */
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[data-hl="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [highlight, list]);

  const choose = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, list.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const c = list[highlight];
      if (c) choose(c.id);
    }
  };

  return (
    <div className="relative w-full sm:w-80">
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Choisir un modèle"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        className="flex w-full items-center justify-between gap-3 border border-line bg-white px-3 py-2 text-left transition-colors hover:border-ink/40 focus-visible:border-ink focus-visible:outline-none"
      >
        <span className="min-w-0">
          <span className="block truncate font-display text-sm leading-tight text-ink">
            {car.name}
          </span>
          <span className="mt-0.5 block text-[10px] uppercase tracking-[0.14em] text-ink/45">
            {EUR(car.price)}
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`shrink-0 text-[10px] text-ink/50 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "fixed", left: pos.left, top: pos.top, width: pos.width }}
            className="z-[120] overflow-hidden border border-line bg-white shadow-[0_16px_40px_-14px_rgba(6,33,63,0.4)]"
          >
            <div className="flex items-center gap-2 border-b border-line px-3">
              <span aria-hidden="true" className="text-[13px] text-ink/40">
                ⌕
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Rechercher un modèle…"
                aria-label="Rechercher un modèle"
                className="w-full bg-transparent py-2.5 text-[14px] text-ink placeholder:text-ink/35 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  aria-label="Effacer la recherche"
                  className="shrink-0 text-[12px] text-ink/40 transition-colors hover:text-ink"
                >
                  ✕
                </button>
              )}
            </div>

            <ul
              ref={listRef}
              role="listbox"
              aria-label="Modèles BMW"
              className="max-h-72 overflow-y-auto py-1"
            >
              {list.length === 0 && (
                <li className="px-3 py-6 text-center text-[13px] text-ink/50">
                  Aucun modèle ne correspond
                </li>
              )}
              {list.map((c, i) => {
                const selected = c.id === value;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      data-hl={i === highlight}
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => choose(c.id)}
                      className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[14px] transition-colors ${
                        i === highlight ? "bg-mist" : ""
                      } ${selected ? "font-semibold text-ink" : "text-ink/80"}`}
                    >
                      <span className="min-w-0 truncate">{c.name}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="text-[11px] text-ink/45">{EUR(c.price)}</span>
                        <span
                          aria-hidden="true"
                          className={`text-[12px] text-brand ${selected ? "" : "opacity-0"}`}
                        >
                          ✓
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}
