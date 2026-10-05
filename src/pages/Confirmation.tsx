import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import SmartLink from "../components/SmartLink";
import { EVENT } from "../data/site";
import { readReservation, saveReservation, type Reservation } from "../lib/confirmation";
import { downloadConfirmationPdf } from "../lib/confirmationPdf";
import { usePageMeta } from "../lib/seo";
import { gsap, useGSAP, reduced } from "../lib/anim";

/* Page de confirmation de créneau.
   Elle n'est pas dans la navigation (ni menu, ni pied de page) : on n'y arrive
   qu'en envoyant le formulaire de rendez-vous. Grammaire du site : bandeau bleu
   grainé avec le texte posé dessus, puis un corps sans contenant — filets fins,
   libellés en micro-capitales, bleu de marque réservé aux actions.
   Le récapitulatif arrive par l'état de navigation ; il est recopié en
   sessionStorage pour survivre à un rafraîchissement de l'onglet. */

const label = "text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/45";
const circle =
  "flex h-11 w-11 items-center justify-center rounded-full border border-ink/25 text-[14px] transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-white";

/* Numéro de la concession. Le lien téléphonique est construit à partir de
   l'affichage : un seul endroit à corriger le jour où le numéro change. */
const TEL = "02 43 85 00 11";
const TEL_HREF = `tel:${TEL.replace(/\s/g, "")}`;
const MAIL = "contactlemans@amplitude.net.bmw.fr";

export default function Confirmation() {
  const location = useLocation();
  const root = useRef<HTMLElement>(null);
  const [pdf, setPdf] = useState<"idle" | "busy">("idle");

  const [data] = useState<Reservation | null>(() => {
    const passe = location.state as Reservation | null;
    return passe?.ref ? passe : readReservation();
  });

  usePageMeta(
    data ? "Demande de créneau enregistrée" : "Aucune demande à afficher",
    data
      ? "Votre demande de rendez-vous pour les ventes privées BMW Amplitude Automobiles est transmise. Téléchargez la confirmation et le récapitulatif de votre créneau."
      : "Cette page récapitule une demande de créneau de rendez-vous, juste après son envoi.",
  );

  /* Le récapitulatif est mémorisé pour l'onglet en cours */
  useEffect(() => {
    if (data) saveReservation(data);
  }, [data]);

  useGSAP(
    () => {
      if (reduced()) return;
      gsap.fromTo(
        ".cf-row",
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.06, ease: "power3.out", delay: 0.15 },
      );
    },
    { scope: root },
  );

  const telecharger = async () => {
    if (!data || pdf === "busy") return;
    setPdf("busy");
    try {
      await downloadConfirmationPdf(data);
    } finally {
      setPdf("idle");
    }
  };

  /* Arrivée directe sur /confirmation (lien partagé, favori, rafraîchissement
     d'un autre onglet) : rien à confirmer, on renvoie vers le site. */
  if (!data) {
    return (
      <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-32">
        <p className="text-[11px] uppercase tracking-[0.14em] text-ink/50">
          Ventes privées · Amplitude Automobiles, Le Mans
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-[clamp(1.6rem,3.4vw,2.6rem)] font-bold uppercase leading-[1.06] text-ink">
          Aucune demande à afficher
        </h1>
        <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink/60">
          Cette page récapitule une demande de créneau, juste après son envoi. Votre demande a
          peut-être déjà été traitée : appelez la concession au {TEL} et nous retrouvons votre
          créneau.
        </p>
        <SmartLink
          to="/"
          className="group mt-9 inline-flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.2em] text-ink"
        >
          Retour à l'accueil
          <span aria-hidden="true" className={circle}>
            →
          </span>
        </SmartLink>
      </section>
    );
  }

  const lignes: { label: string; value: string }[] = [
    { label: "Nom", value: data.nom },
    { label: "Email", value: data.email },
    { label: "Téléphone", value: data.telephone },
    { label: "Modèle BMW", value: data.vehicule },
    { label: "Jour de l'essai", value: data.jour },
    { label: "Créneau", value: data.creneau },
    ...data.options,
    ...(data.options.length === 0 && data.configuration
      ? [{ label: "Configuration", value: data.configuration }]
      : []),
  ].filter((l) => l.value);

  return (
    <section ref={root} className="pb-20 md:pb-28">
      {/* Bandeau : le texte est posé sur l'aplat bleu, comme la section réservation */}
      <div className="grain relative overflow-hidden bg-azure">
        <img
          src="/img/logo/BMW.svg"
          alt=""
          aria-hidden="true"
          data-rotate-slow
          className="watermark -left-24 top-1/2 h-[26rem] w-[26rem] -translate-y-1/2 opacity-20 brightness-0 invert md:-left-16 md:h-[34rem] md:w-[34rem]"
        />
        <div className="relative z-10 mx-auto max-w-[1600px] px-5 py-14 md:px-10 md:py-20">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] text-white/70">
            <span>Ventes privées BMW Le Mans</span>
            <span aria-hidden="true" className="h-px w-6 bg-white/40" />
            <span>13 &amp; 14 novembre 2026</span>
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-[clamp(1.9rem,4.6vw,3.4rem)] font-bold uppercase leading-[1.06] text-white">
            Demande envoyée
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/75 md:text-base">
            Merci {data.nom}, votre demande de créneau est transmise à la concession. Un conseiller
            vous confirme votre horaire par email et par téléphone.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-5 pt-12 md:px-10 md:pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          {/* Récapitulatif */}
          <div>
            <p className={label}>Récapitulatif de votre demande</p>
            <dl className="mt-6 border-t border-line">
              {lignes.map((l) => (
                <div
                  key={l.label}
                  className="cf-row grid gap-1 border-b border-line py-4 sm:grid-cols-[13rem_1fr] sm:items-baseline sm:gap-6"
                >
                  <dt className={label}>{l.label}</dt>
                  <dd className="font-display text-[17px] font-bold leading-snug text-ink">
                    {l.value}
                  </dd>
                </div>
              ))}
            </dl>

            {data.message && (
              <div className="cf-row mt-8">
                <p className={label}>Message transmis</p>
                <p className="mt-3 whitespace-pre-line border-l-2 border-brand bg-mist px-5 py-4 text-[14px] leading-relaxed text-ink/75 md:text-[15px]">
                  {data.message}
                </p>
              </div>
            )}
          </div>

          {/* Référence, suite, téléchargement */}
          <aside className="lg:pt-8">
            <div className="border-l-2 border-brand bg-mist px-5 py-5">
              <p className={label}>Référence de votre demande</p>
              <p className="mt-2 font-display text-3xl font-bold tabular-nums tracking-tight text-ink">
                {data.ref}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink/50">
                À rappeler à la concession si vous avez une question sur votre créneau.
              </p>
            </div>

            <button
              type="button"
              onClick={telecharger}
              disabled={pdf === "busy"}
              className="group mt-7 inline-flex w-full items-center justify-between gap-3 bg-ink px-7 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand disabled:cursor-wait disabled:opacity-60"
            >
              {pdf === "busy" ? "Préparation du PDF…" : "Télécharger la confirmation (PDF)"}
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                ↓
              </span>
            </button>

            <div className="mt-8 border-t border-line pt-6">
              <p className={label}>Et maintenant</p>
              <ul className="mt-4 grid gap-3 text-[13px] leading-relaxed text-ink/60 md:text-[14px]">
                <li>Un conseiller vous rappelle pour fixer l'horaire exact.</li>
                <li>Votre essai dure 30 minutes, sur la route, avec un conseiller.</li>
                <li>Reprise de votre BMW et financement étudiés pendant l'événement.</li>
              </ul>
            </div>

            <div className="mt-8 border-t border-line pt-6">
              <p className={label}>Nous joindre</p>
              <dl className="mt-4 grid gap-3">
                <div>
                  <dt className={label}>Téléphone</dt>
                  <dd className="mt-1">
                    <a
                      href={TEL_HREF}
                      className="font-display text-xl font-bold text-ink transition-colors hover:text-brand"
                    >
                      {TEL}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className={label}>Email</dt>
                  <dd className="mt-1">
                    <a
                      href={`mailto:${MAIL}`}
                      className="text-[14px] font-semibold text-ink transition-colors hover:text-brand"
                    >
                      {MAIL}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className={label}>Concession</dt>
                  <dd className="mt-1 text-[14px] font-semibold text-ink">
                    Amplitude Automobiles · {EVENT.lieu}
                  </dd>
                </div>
              </dl>
            </div>

            <SmartLink
              to="/"
              className="group mt-9 inline-flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.2em] text-ink"
            >
              Retour à l'accueil
              <span aria-hidden="true" className={circle}>
                →
              </span>
            </SmartLink>
          </aside>
        </div>
      </div>
    </section>
  );
}
