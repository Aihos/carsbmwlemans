/* Récapitulatif de la demande de créneau, pour la page /confirmation.

   Les deux formulaires du site (section « Réserver votre créneau » de
   l'accueil, popup de rendez-vous de l'en-tête) postent à /api/reservation.
   Au succès, ils routent vers /confirmation en passant ce récapitulatif, qui
   est AUSSI écrit en sessionStorage : un rafraîchissement de l'onglet ne doit
   pas vider la confirmation sous les yeux du visiteur. */

export type ReservationOption = { label: string; value: string };

export type Reservation = {
  /** référence de suivi affichée au visiteur : « VP-XXXXXXXX » */
  ref: string;
  nom: string;
  email: string;
  telephone: string;
  vehicule: string;
  /** jour de l'essai en clair : « Vendredi 13 novembre 2026 » */
  jour: string;
  creneau: string;
  message: string;
  /** configuration composée, en une ligne (configurateur) */
  configuration: string;
  /** détail de la configuration composée (couleur, jantes, sellerie…) */
  options: ReservationOption[];
};

const CLE = "ohia:reservation";

/** « 2026-11-13 » → « Vendredi 13 novembre 2026 ».
    Un champ date natif renvoie une ISO : on la rend lisible. Une valeur déjà
    rédigée (« Vendredi 13 novembre 2026 », le cas de la popup) passe telle
    quelle. Le calcul est fait en local, jamais décalé par le fuseau. */
export function jourLisible(v: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim());
  if (!m) return v.trim();
  const [, y, mo, d] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d));
  const jour = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  return jour.charAt(0).toUpperCase() + jour.slice(1);
}

/** Référence de suivi courte, lettre A-Z et chiffres : « VP-3F8K2A1B ».
    Elle est dérivée de l'identifiant Resend quand le serveur le renvoie, ce
    qui permet de retrouver la demande dans la console d'envoi ; sinon on
    fabrique une référence à partir de l'horloge, pour que le visiteur ait
    toujours quelque chose à citer au téléphone. */
export function refSuivi(id?: string | null): string {
  const base = (id ?? "").replace(/[^a-z0-9]/gi, "");
  const short = base ? base.slice(0, 8) : Math.floor(Date.now() / 1000).toString(36) + "2026";
  return `VP-${short.toUpperCase().slice(0, 8)}`;
}

export function saveReservation(r: Reservation) {
  try {
    sessionStorage.setItem(CLE, JSON.stringify(r));
  } catch {
    /* Navigation privée : la confirmation reste utilisable sans persistance. */
  }
}

export function readReservation(): Reservation | null {
  try {
    const raw = sessionStorage.getItem(CLE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Reservation;
    return parsed && parsed.ref && parsed.nom ? parsed : null;
  } catch {
    return null;
  }
}
