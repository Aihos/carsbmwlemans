/* Confirmation de créneau au format PDF, générée dans le navigateur.

   Direction artistique reprise du site : un seul bleu de marque (#00559d), un
   marine pour le texte (#06213f), des filets fins, des libellés en
   micro-capitales et la même famille typographique (Helvetica est le repli
   déclaré du site, jsPDF l'embarque : le document ne dépend d'aucune police
   distante).

   jsPDF n'est chargé qu'au clic (import dynamique) : la page de confirmation
   ne paie pas ces ~350 ko au chargement. */

import type { Reservation } from "./confirmation";

const INK: [number, number, number] = [6, 33, 63];
const BRAND: [number, number, number] = [0, 85, 157];
const GREY: [number, number, number] = [90, 107, 128];
const LINE: [number, number, number] = [201, 217, 236];
const MIST: [number, number, number] = [246, 250, 254];

const PAGE_W = 210;
const PAGE_H = 297;
const M = 16; // marge
const COL_R = PAGE_W - M; // bord droit utile
const COL_W = COL_R - M; // largeur utile

const CONCESSION = {
  tel: "02 43 85 00 11",
  mail: "contactlemans@amplitude.net.bmw.fr",
  adresse: "2 boulevard René Cassin, 72016 Le Mans",
  horaires: "Vendredi 13 novembre 9h – 19h · Samedi 14 novembre 9h – 18h",
};

/** Date du jour, en clair : « 05 octobre 2026 ». */
const aujourdhui = () =>
  new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(
    new Date(),
  );

export async function downloadConfirmationPdf(r: Reservation) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });

  /* ─────────── Bandeau ─────────── */
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, PAGE_W, 44, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setCharSpace(0.6);
  doc.setTextColor(255, 255, 255);
  doc.text("VENTES PRIVÉES BMW · AMPÈRE AUTOPASSION, LE MANS", M, 17);

  doc.setCharSpace(0);
  doc.setFontSize(19);
  doc.text("CONFIRMATION DE VOTRE DEMANDE", M, 30);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(215, 232, 248);
  doc.text("Vendredi 13 et samedi 14 novembre 2026 · 2 boulevard René Cassin, Le Mans", M, 38);

  /* ─────────── Bandeau de référence ─────────── */
  let y = 58;

  doc.setFillColor(...MIST);
  doc.rect(M, y - 8, COL_W, 22, "F");
  doc.setFillColor(...BRAND);
  doc.rect(M, y - 8, 2.2, 22, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setCharSpace(0.8);
  doc.setTextColor(...GREY);
  doc.text("RÉFÉRENCE DE VOTRE DEMANDE", M + 7, y);

  doc.setCharSpace(0);
  doc.setFontSize(15);
  doc.setTextColor(...INK);
  doc.text(r.ref, M + 7, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GREY);
  doc.text(`Transmise le ${aujourdhui()}`, COL_R, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...INK);
  doc.text("Enregistrée", COL_R, y + 8, { align: "right" });

  y += 30;

  /* ─────────── Bloc générique : libellé / valeur ─────────── */
  const groupe = (titre: string, lignes: { label: string; value: string }[]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setCharSpace(0.8);
    doc.setTextColor(...BRAND);
    doc.text(titre.toUpperCase(), M, y);
    doc.setCharSpace(0);
    y += 2.5;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.line(M, y, COL_R, y);
    y += 7;

    for (const { label, value } of lignes) {
      if (!value) continue;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...GREY);
      doc.text(label.toUpperCase(), M, y);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...INK);
      const valeur = doc.splitTextToSize(value, COL_W - 62) as string[];
      doc.text(valeur, M + 62, y);
      y += 6.4 * valeur.length + 2.6;
    }
    y += 6;
  };

  groupe("Votre demande", [
    { label: "Nom", value: r.nom },
    { label: "Email", value: r.email },
    { label: "Téléphone", value: r.telephone },
  ]);

  groupe("Créneau demandé", [
    { label: "Modèle BMW", value: r.vehicule },
    { label: "Jour", value: r.jour },
    { label: "Créneau", value: r.creneau },
  ]);

  if (r.options.length > 0 || r.configuration) {
    groupe(
      "Configuration",
      r.options.length > 0 ? r.options : [{ label: "Détail", value: r.configuration }],
    );
  }

  if (r.message) {
    groupe("Message transmis", [{ label: "Message", value: r.message }]);
  }

  /* ─────────── Pied de page ─────────── */
  const pied = PAGE_H - 42;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.line(M, pied, COL_R, pied);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setCharSpace(0.8);
  doc.setTextColor(...INK);
  doc.text("VOTRE CONCESSION", M, pied + 8);
  doc.setCharSpace(0);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  doc.text(`Téléphone ${CONCESSION.tel}`, M, pied + 15);
  doc.text(CONCESSION.mail, M, pied + 20);
  doc.text(CONCESSION.adresse, M, pied + 25);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setCharSpace(0.8);
  doc.setTextColor(...INK);
  doc.text("HORAIRES DE L'ÉVÉNEMENT", COL_R, pied + 8, { align: "right" });
  doc.setCharSpace(0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  doc.text("Vendredi 13 : 9h – 19h", COL_R, pied + 15, { align: "right" });
  doc.text("Samedi 14 : 9h – 18h", COL_R, pied + 20, { align: "right" });

  doc.setFontSize(7.5);
  doc.setTextColor(...GREY);
  doc.text(
    `Document remis au visiteur à titre de récapitulatif. Votre créneau est réservé dès confirmation par un conseiller. Référence ${r.ref}.`,
    M,
    pied + 34,
    { maxWidth: COL_W },
  );

  doc.save(`confirmation-ventes-privees-${r.ref}.pdf`);
}
