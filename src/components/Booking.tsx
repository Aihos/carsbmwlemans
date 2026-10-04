import { useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { gsap, useGSAP, reduced } from "../lib/anim";
import { VEHICLES } from "../data/site";

type Status = "idle" | "sending" | "ok" | "error";

export default function Booking() {
  const root = useRef<HTMLElement>(null);
  const okRef = useRef<HTMLParagraphElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");
  const [params] = useSearchParams();

  /* Pré-remplissage quand on arrive du configurateur */
  const vehicule = params.get("vehicule") ?? "";
  const configuration = params.get("config") ?? "";
  const sent = status === "ok";

  useGSAP(
    () => {
      if (reduced()) return;
      gsap.fromTo(
        ".bk-card",
        { y: 56, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1.15,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 72%", once: true },
        },
      );
      gsap.fromTo(
        ".bk-row",
        { y: 24, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          stagger: 0.07,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 60%", once: true },
        },
      );
    },
    { scope: root },
  );

  useGSAP(
    () => {
      if (sent && okRef.current && !reduced()) {
        gsap.fromTo(okRef.current, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6 });
      }
    },
    { dependencies: [sent], scope: root },
  );

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form)) as Record<string, string>;

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
        /* Le détail technique reste dans la réponse de l'API et la console :
           le visiteur, lui, n'a besoin que d'un message utile. */
        console.error("[/api/reservation]", data.error);
        setStatus("error");
        setFeedback("L'envoi n'a pas abouti. Merci de réessayer ou de nous appeler au 06 49 01 53 34.");
        return;
      }
      setStatus("ok");
    } catch {
      setStatus("error");
      setFeedback("Connexion impossible. Merci de nous appeler au 06 49 01 53 34.");
    }
  };

  const fieldClass =
    "mt-2 w-full border border-line bg-mist px-4 py-3 text-sm text-ink placeholder:text-ink/35 focus:border-brand focus:outline-none";
  const labelClass = "text-[9px] font-bold uppercase tracking-[0.2em] text-ink/50";

  return (
    <section id="reservation" ref={root} className="grain relative overflow-hidden bg-azure">
      <img
        src="/img/logo/BMW.svg"
        alt=""
        aria-hidden="true"
        data-rotate-slow
        className="watermark -left-24 top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 opacity-25 brightness-0 invert md:-left-16 md:h-[38rem] md:w-[38rem]"
      />

      <div className="relative z-10 mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-20">
          <div className="hidden lg:block">
            <p className="font-display text-[clamp(2.6rem,5vw,5rem)] font-bold uppercase leading-[1.06] text-white">
              Votre
              <br />
              concession
              <br />
              au Mans
            </p>
            <p className="mt-8 max-w-sm text-[13px] leading-relaxed text-white/75">
              Sur les routes de la Sarthe, un essai vaut mille photos. Installez-vous au volant,
              ajustez la configuration avec un conseiller, repartez avec un projet clair.
            </p>
            <ul className="mt-8 grid gap-3 text-[11px] uppercase tracking-[0.16em] text-white/70">
              <li>Essai sur route, sans engagement</li>
              <li>Reprise de votre BMW et financement en concession</li>
              <li>Un conseiller dédié, du lundi au samedi</li>
            </ul>
          </div>

          <div className="bk-card border border-white/40 bg-white p-6 shadow-[0_40px_90px_-50px_rgba(6,33,63,0.8)] md:p-9">
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand">
              Concession BMW Le Mans
            </span>
            <h2 className="mt-3 font-display text-[clamp(1.7rem,4vw,2.6rem)] font-bold uppercase leading-tight text-ink">
              Réserver votre essai
            </h2>
            <p className="mt-3 max-w-md text-[11px] leading-relaxed text-ink/60 md:text-xs">
              Choisissez votre BMW et le créneau qui vous arrange : un conseiller vous confirme le
              rendez-vous par email et par téléphone, et prépare le véhicule de votre essai.
            </p>

            {configuration && (
              <p className="mt-4 border-l-2 border-brand bg-mist px-4 py-3 text-[11px] leading-relaxed text-ink/70">
                <span className={labelClass}>Configuration retenue</span>
                <span className="mt-1 block font-bold text-ink">{configuration}</span>
              </p>
            )}

            <form className="mt-7 grid gap-4" onSubmit={submit}>
              {/* Champ piège anti-spam : invisible pour un visiteur */}
              <input
                type="text"
                name="site"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
              />
              <input type="hidden" name="configuration" value={configuration} />

              <div className="bk-row grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Nom complet</span>
                  <input
                    type="text"
                    name="nom"
                    required
                    autoComplete="name"
                    placeholder="Jean Dupont"
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Modèle BMW souhaité</span>
                  <select name="vehicule" defaultValue={vehicule} className={fieldClass}>
                    {vehicule && !VEHICLES.includes(vehicule) && (
                      <option value={vehicule}>{vehicule}</option>
                    )}
                    {VEHICLES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                    <option value="Autre modèle BMW">Autre modèle BMW</option>
                  </select>
                </label>
              </div>

              <div className="bk-row grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Email</span>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="jean.dupont@email.com"
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Date souhaitée</span>
                  <input type="date" name="date" className={fieldClass} />
                </label>
              </div>

              <div className="bk-row grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Téléphone</span>
                  <input
                    type="tel"
                    name="telephone"
                    autoComplete="tel"
                    placeholder="06 12 34 56 78"
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Créneau souhaité</span>
                  <select name="creneau" className={fieldClass} defaultValue="09h00 – 10h00">
                    <option>09h00 – 10h00</option>
                    <option>10h30 – 11h30</option>
                    <option>14h00 – 15h00</option>
                    <option>16h00 – 17h00</option>
                    <option>17h30 – 18h30</option>
                  </select>
                </label>
              </div>

              <label className="bk-row block">
                <span className={labelClass}>Message</span>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Précisez votre projet : reprise de votre BMW, financement, options…"
                  className={`${fieldClass} resize-none`}
                />
              </label>

              <div className="bk-row mt-1 flex flex-wrap items-center justify-between gap-4">
                <p className="max-w-xs text-[10px] leading-relaxed text-ink/45">
                  Vos données servent uniquement au traitement de votre demande de rendez-vous.
                </p>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="group inline-flex items-center gap-3 bg-ink px-7 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand disabled:cursor-wait disabled:opacity-60"
                >
                  {status === "sending" ? "Envoi en cours…" : sent ? "Demande envoyée" : "Réserver mon essai"}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </button>
              </div>

              <p
                ref={okRef}
                role="status"
                aria-live="polite"
                className={`text-[11px] font-bold text-brand ${sent ? "" : "hidden"}`}
              >
                Merci — votre demande a bien été transmise. Nous confirmons votre créneau
                rapidement.
              </p>

              {status === "error" && (
                <p role="alert" className="text-[11px] font-bold text-[#9c1b26]">
                  {feedback}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
