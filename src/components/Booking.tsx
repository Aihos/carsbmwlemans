import { useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { gsap, useGSAP, reduced } from "../lib/anim";
import { VEHICLES } from "../data/site";
import { jourLisible, refSuivi, saveReservation, type Reservation } from "../lib/confirmation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type Status = "idle" | "sending" | "error";

export default function Booking() {
  const root = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");
  const [params] = useSearchParams();

  /* Pré-remplissage quand on arrive du configurateur */
  const vehicule = params.get("vehicule") ?? "";
  const configuration = params.get("config") ?? "";

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
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        ref?: string | null;
      };

      if (!res.ok || !data.ok) {
        /* Le détail technique reste dans la réponse de l'API et la console :
           le visiteur, lui, n'a besoin que d'un message utile. */
        console.error("[/api/reservation]", data.error);
        setStatus("error");
        setFeedback("L'envoi n'a pas abouti. Merci de réessayer ou de nous appeler au 02 43 85 00 11.");
        return;
      }

      /* Demande acceptée : le visiteur part sur la page de confirmation, qui
         porte le récapitulatif et le téléchargement PDF. Le champ piège
         anti-spam n'est jamais transmis. */
      const rec: Reservation = {
        ref: refSuivi(data.ref),
        nom: payload.nom ?? "",
        email: payload.email ?? "",
        telephone: payload.telephone ?? "",
        vehicule: payload.vehicule ?? "",
        jour: jourLisible(payload.date ?? ""),
        creneau: payload.creneau ?? "",
        message: payload.message ?? "",
        configuration: payload.configuration ?? "",
        options: [],
      };
      saveReservation(rec);
      navigate("/confirmation", { state: rec });
    } catch {
      setStatus("error");
      setFeedback("Connexion impossible. Merci de nous appeler au 02 43 85 00 11.");
    }
  };

  const fieldClass =
    "mt-2 w-full border border-line bg-mist px-4 py-3 text-sm text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none";
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
              Vos
              <br />
              ventes
              <br />
              privées
            </p>
            <p className="mt-8 max-w-sm text-[15px] leading-relaxed text-white/75 md:text-base">
              Sur les routes de la Sarthe, un essai vaut mille photos. Installez-vous au volant,
              arbitrez la configuration avec un conseiller, repartez avec un projet écrit.
            </p>
            <ul className="mt-8 grid gap-3 text-[11px] uppercase tracking-[0.16em] text-white/70">
              <li>Essai sur route, sur créneau réservé</li>
              <li>Reprise bonifiée pendant les deux jours</li>
              <li>Un conseiller par invité, du lundi au samedi</li>
            </ul>
          </div>

          <div className="bk-card border border-white/40 bg-white p-6 shadow-[0_40px_90px_-50px_rgba(6,33,63,0.8)] md:p-9">
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand">
              Ventes privées BMW Le Mans
            </span>
            <h2 className="mt-3 font-display text-[clamp(1.7rem,4vw,2.6rem)] font-bold uppercase leading-tight text-ink">
              Réserver votre créneau
            </h2>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink/60 md:text-[15px]">
              Choisissez la BMW que vous voulez essayer et l'horaire qui vous arrange : un conseiller
              vous confirme votre créneau par email et par téléphone, et prépare le véhicule.
            </p>

            {configuration && (
              <p className="mt-4 border-l-2 border-ink bg-mist px-4 py-3 text-[13px] leading-relaxed text-ink/70 md:text-[14px]">
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
                  <Select name="vehicule" defaultValue={vehicule}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicule && !VEHICLES.includes(vehicule) && (
                        <SelectItem value={vehicule}>{vehicule}</SelectItem>
                      )}
                      {VEHICLES.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                      <SelectItem value="Autre modèle BMW">Autre modèle BMW</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Select name="creneau" defaultValue="09h00 – 10h00">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09h00 – 10h00">09h00 – 10h00</SelectItem>
                      <SelectItem value="10h30 – 11h30">10h30 – 11h30</SelectItem>
                      <SelectItem value="14h00 – 15h00">14h00 – 15h00</SelectItem>
                      <SelectItem value="16h00 – 17h00">16h00 – 17h00</SelectItem>
                      <SelectItem value="17h30 – 18h30">17h30 – 18h30</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              </div>

              <label className="bk-row block">
                <span className={labelClass}>Message</span>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Précisez votre projet : reprise de votre BMW, financement, modèle souhaité…"
                  className={`${fieldClass} resize-none`}
                />
              </label>

              <div className="bk-row mt-1 flex flex-wrap items-center justify-between gap-4">
                <p className="max-w-xs text-[12px] leading-relaxed text-ink/45">
                  Vos données servent uniquement au traitement de votre demande de rendez-vous.
                </p>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="group inline-flex items-center gap-3 bg-ink px-7 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand disabled:cursor-wait disabled:opacity-60"
                >
                  {status === "sending" ? "Envoi en cours…" : "Confirmer mon créneau"}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </button>
              </div>

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
