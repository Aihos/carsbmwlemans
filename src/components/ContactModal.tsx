import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { VEHICLES, EVENT } from "../data/site";

type Status = "idle" | "sending" | "ok" | "error";

type Props = {
  open: boolean;
  onClose: () => void;
  /* Deux usages, un seul composant :
     — avec `vehicule` : récapitulatif de la configuration composée (bouton
       « Réserver mon essai » du configurateur) ;
     — sans : demande de rendez-vous générique (bouton « Réserver » de
       l'en-tête), le formulaire reprend les champs de la section
       « Réserver votre essai » de la page d'accueil, modèle au choix. */
  vehicule?: string;
  colorName?: string;
  colorHex?: string;
  jantes?: string;
  moteur?: string;
  sellerie?: string;
  inserts?: string;
  accessoires?: string;
  configuration?: string;
  total?: string;
  mensualite?: string;
  /** Modèle pré-sélectionné dans le formulaire générique (lien « Réserver un
      essai » d'une carte modèle). Ignoré en mode configuration, qui a déjà
      son véhicule. */
  defaultVehicule?: string;
};

/* Visuel du bandeau, un essai sur la côte, comme la galerie. */
const BANNER = "/img/d.webp";

/* Popup de rendez-vous.
   Même grammaire que les blocs actualités : un visuel plein cadre, le texte posé
   dessus (micro-libellé + filet + titre), puis un corps sans aucun contenant —
   plus de carte blanche bordée, plus de panneau bleu, plus de champ encadré.
   Filets fins, libellés en micro-capitales et respiration portent la mise en
   page ; le bleu de marque reste réservé à l'action principale. Le détail
   technique de l'envoi est celui de /api/reservation (Resend). */
export default function ContactModal({
  open,
  onClose,
  vehicule,
  colorName,
  colorHex,
  jantes,
  moteur,
  sellerie,
  inserts,
  accessoires,
  configuration,
  total,
  mensualite,
  defaultVehicule,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");
  const firstField = useRef<HTMLInputElement>(null);

  const configured = Boolean(vehicule);

  /* Échap ferme, scroll verrouillé, focus dans le premier champ */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const timer = window.setTimeout(() => firstField.current?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = previous;
      window.clearTimeout(timer);
    };
  }, [open, onClose]);

  /* Nouvelle ouverture : on repart d'un formulaire vierge */
  useEffect(() => {
    if (open) {
      setStatus("idle");
      setFeedback("");
    }
  }, [open]);

  if (!open) return null;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setStatus("sending");
    setFeedback("");
    try {
      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        console.error("[/api/reservation]", data.error);
        setStatus("error");
        setFeedback(
          "L'envoi n'a pas abouti. Merci de réessayer ou de nous appeler au 02 43 85 00 11.",
        );
        return;
      }
      setStatus("ok");
    } catch {
      setStatus("error");
      setFeedback("Connexion impossible. Merci de nous appeler au 02 43 85 00 11.");
    }
  };

  /* Chrome monochrome : micro-capitales, filets, rien de plus */
  const meta = "flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em]";
  const label = "text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/45";
  const field =
    "w-full border-b border-line bg-transparent pb-2 pt-1 text-[15px] text-ink transition-colors placeholder:text-ink/30 focus:border-ink focus:outline-none";
  const circle =
    "flex h-11 w-11 items-center justify-center rounded-full border border-ink/25 text-[14px] transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-white";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-ink/75 px-4 py-6 backdrop-blur-[3px] md:items-center md:py-10"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-titre"
        className="relative max-h-[calc(100svh-3rem)] w-full max-w-[1040px] overflow-y-auto bg-white shadow-[0_60px_140px_-60px_rgba(6,33,63,0.75)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-0 top-0 z-20 flex h-11 w-11 items-center justify-center bg-ink/35 text-lg text-white backdrop-blur-sm transition-colors hover:bg-ink"
        >
          ✕
        </button>

        {/* Bandeau : le texte est posé sur l'image, comme les grands visuels actualités */}
        <div className="relative flex min-h-[210px] items-end overflow-hidden bg-ink md:min-h-[235px]">
          <img
            src={BANNER}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/45 to-ink/10"
          />

          <div className="relative z-10 w-full px-6 pb-7 pt-16 text-white md:px-10 md:pb-9">
            <p className={`${meta} text-white/70`}>
              <span>{configured ? "Votre configuration" : "Ventes privées BMW Le Mans"}</span>
              <span aria-hidden="true" className="h-px w-6 bg-white/40" />
              <span>13 &amp; 14 novembre</span>
            </p>
            <h2
              id="contact-titre"
              className="mt-3 max-w-2xl font-display text-[clamp(1.55rem,3.4vw,2.5rem)] font-black uppercase leading-[1.06]"
            >
              {configured ? `Essai ${vehicule}` : "Réserver votre créneau"}
            </h2>
            <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-white/75 md:text-[15px]">
              {configured
                ? "Votre configuration est prête. Laissez-nous vos coordonnées : la concession vous rappelle pour votre essai pendant les ventes privées."
                : `${EVENT.dates} : la concession reçoit sur créneau. Dites-nous quel modèle vous voulez essayer, un conseiller vous fixe votre horaire.`}
            </p>
          </div>
        </div>

        {/* Corps : formulaire + rappel, séparés par un simple filet */}
        <div className="grid gap-10 px-6 py-7 md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:px-10 md:py-8">
          {status === "ok" ? (
            <div className="md:col-span-2">
              <p className={`${label} text-brand`}>Demande envoyée</p>
              <p className="mt-4 max-w-2xl font-display text-[clamp(1.4rem,2.8vw,2.1rem)] font-black uppercase leading-[1.06] text-ink">
                Merci, nous nous occupons de la suite.
              </p>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink/60 md:text-base">
                {configured
                  ? `Votre configuration ${vehicule} est transmise à la concession. Nous vous recontactons très vite pour votre rendez-vous pendant les ventes privées.`
                  : "Votre demande de créneau est transmise à la concession. Nous vous recontactons très vite pour confirmer votre horaire."}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="group mt-8 inline-flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.2em] text-ink"
              >
                Fermer
                <span aria-hidden="true" className={circle}>
                  →
                </span>
              </button>
            </div>
          ) : (
            <>
              <form className="grid gap-x-8 gap-y-5 sm:grid-cols-2" onSubmit={submit}>
                {/* Champ piège anti-spam */}
                <input
                  type="text"
                  name="site"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
                />
                {configured ? (
                  <>
                    <input type="hidden" name="vehicule" value={vehicule} />
                    <input type="hidden" name="configuration" value={configuration} />
                    {sellerie && <input type="hidden" name="sellerie" value={sellerie} />}
                    {inserts && <input type="hidden" name="inserts" value={inserts} />}
                    {accessoires && (
                      <input type="hidden" name="accessoires" value={accessoires} />
                    )}
                  </>
                ) : (
                  <input type="hidden" name="configuration" value="" />
                )}

                <label className={`block${configured ? " sm:col-span-2" : ""}`}>
                  <span className={label}>Nom complet *</span>
                  <input
                    ref={firstField}
                    type="text"
                    name="nom"
                    required
                    autoComplete="name"
                    placeholder="Jean Dupont"
                    className={`mt-2 ${field}`}
                  />
                </label>

                {!configured && (
                  <label className="block">
                    <span className={label}>Modèle BMW</span>
                    <span className="relative mt-2 block">
                      <select
                        name="vehicule"
                        defaultValue={defaultVehicule ?? VEHICLES[0]}
                        className={`${field} appearance-none pr-6`}
                      >
                        {defaultVehicule && !VEHICLES.includes(defaultVehicule) && (
                          <option value={defaultVehicule}>{defaultVehicule}</option>
                        )}
                        {VEHICLES.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                        <option value="Autre modèle BMW">Autre modèle BMW</option>
                      </select>
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[9px] text-ink/40"
                      >
                        ▾
                      </span>
                    </span>
                  </label>
                )}

                <label className="block">
                  <span className={label}>Email *</span>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="jean.dupont@email.com"
                    className={`mt-2 ${field}`}
                  />
                </label>

                <label className="block">
                  <span className={label}>Téléphone</span>
                  <input
                    type="tel"
                    name="telephone"
                    autoComplete="tel"
                    placeholder="06 12 34 56 78"
                    className={`mt-2 ${field}`}
                  />
                </label>

                <label className="block">
                  <span className={label}>Date souhaitée</span>
                  <input type="date" name="date" className={`mt-2 ${field}`} />
                </label>

                <label className="block">
                  <span className={label}>Créneau</span>
                  <span className="relative mt-2 block">
                    <select
                      name="creneau"
                      defaultValue="09h00 – 10h00"
                      className={`${field} appearance-none pr-6`}
                    >
                      <option>09h00 – 10h00</option>
                      <option>10h30 – 11h30</option>
                      <option>14h00 – 15h00</option>
                      <option>16h00 – 17h00</option>
                      <option>17h30 – 18h30</option>
                    </select>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[9px] text-ink/40"
                    >
                      ▾
                    </span>
                  </span>
                </label>

                <label className="block sm:col-span-2">
                  <span className={label}>Message</span>
                  <textarea
                    name="message"
                    rows={3}
                    placeholder="Reprise, financement, disponibilité…"
                    className={`mt-2 ${field} resize-none`}
                  />
                </label>

                {status === "error" && (
                  <p role="alert" className="text-[11px] font-semibold text-[#9c1b26] sm:col-span-2">
                    {feedback}
                  </p>
                )}

                <div className="mt-2 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 sm:col-span-2">
                  <p className="max-w-[17rem] text-[12px] leading-relaxed text-ink/45">
                    Vos données servent uniquement à traiter votre demande.
                  </p>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="group inline-flex items-center gap-3 bg-ink px-7 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand disabled:cursor-wait disabled:opacity-60"
                  >
                    {status === "sending" ? "Envoi en cours…" : "Confirmer mon créneau"}
                    <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                </div>
              </form>

              {/* Colonne de rappel, configuration ou coordonnées */}
              <aside className="border-t border-line pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0">
                {configured ? (
                  <>
                    <p className={label}>Votre configuration</p>
                    <p className="mt-3 font-display text-2xl font-bold uppercase leading-tight text-ink">
                      {vehicule}
                    </p>

                    <dl className="mt-6 grid gap-4">
                      <div>
                        <dt className={label}>Couleur</dt>
                        <dd className="mt-1 flex items-center gap-2.5 text-[14px] font-semibold text-ink">
                          <span
                            aria-hidden="true"
                            className="h-4 w-4 shrink-0 rounded-full ring-1 ring-ink/20"
                            style={{ background: colorHex }}
                          />
                          {colorName}
                        </dd>
                      </div>
                      <div>
                        <dt className={label}>Jantes</dt>
                        <dd className="mt-1 text-[14px] font-semibold text-ink">{jantes}</dd>
                      </div>
                      <div>
                        <dt className={label}>Motorisation</dt>
                        <dd className="mt-1 text-[14px] font-semibold text-ink">{moteur}</dd>
                      </div>
                      {sellerie && (
                        <div>
                          <dt className={label}>Sellerie</dt>
                          <dd className="mt-1 text-[14px] font-semibold text-ink">{sellerie}</dd>
                        </div>
                      )}
                      {inserts && (
                        <div>
                          <dt className={label}>Inserts décoratifs</dt>
                          <dd className="mt-1 text-[14px] font-semibold text-ink">{inserts}</dd>
                        </div>
                      )}
                      {accessoires && (
                        <div>
                          <dt className={label}>Accessoires</dt>
                          <dd className="mt-1 text-[14px] font-semibold text-ink">{accessoires}</dd>
                        </div>
                      )}
                    </dl>

                    <div className="mt-7 border-t border-line pt-5">
                      <p className={label}>Prix total configuré</p>
                      <p className="mt-1.5 font-display text-3xl font-bold text-ink">{total}</p>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-ink/50">
                        soit {mensualite} / mois, 48 mois, apport 10 %, hors assurance.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className={label}>Nous joindre</p>
                    <dl className="mt-4 grid gap-4">
                      <div>
                        <dt className={label}>Téléphone</dt>
                        <dd className="mt-1">
                          <a
                            href="tel:+33243850011"
                            className="font-display text-xl font-bold text-ink transition-colors hover:text-brand"
                          >
                            02 43 85 00 11
                          </a>
                        </dd>
                      </div>
                      <div>
                        <dt className={label}>Email</dt>
                        <dd className="mt-1">
                          <a
                            href="mailto:contactlemans@amplitude.net.bmw.fr"
                            className="text-[14px] font-semibold text-ink transition-colors hover:text-brand"
                          >
                            contactlemans@amplitude.net.bmw.fr
                          </a>
                        </dd>
                      </div>
                      <div>
                        <dt className={label}>Concession</dt>
                        <dd className="mt-1 text-[14px] font-semibold text-ink">
                          Ampère Autopassion · Le Mans, Sarthe
                        </dd>
                      </div>
                    </dl>

                    <ul className="mt-7 grid gap-3 border-t border-line pt-5 text-[11px] uppercase tracking-[0.14em] text-ink/60">
                      <li>Essai sur route, sur créneau réservé</li>
                      <li>Reprise bonifiée pendant les deux jours</li>
                      <li>Un conseiller par invité, du lundi au samedi</li>
                    </ul>
                  </>
                )}
              </aside>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
