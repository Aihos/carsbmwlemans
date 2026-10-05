/* Confirmation de créneau au format PDF, générée dans le navigateur.

   Direction artistique reprise du site : un seul bleu de marque (#00559d), un
   marine pour le texte (#06213f), des filets fins, des libellés en
   micro-capitales et la même famille typographique (Helvetica est le repli
   déclaré du site, jsPDF l'embarque : le document ne dépend d'aucune police
   distante).

   Mise en page : bandeau de marque, bande de référence, deux colonnes
   « Votre demande » / « Créneau demandé », configuration, message, puis
   « Prochaines étapes » — le tout calé au-dessus d'un pied de page fixe.

   Trois pièges jsPDF à garder en tête :
   — l'alignement à droite est mesuré SANS l'interlettrage : un `charSpace`
     encore actif décale le texte au-delà de la marge (les titres du pied de
     page sortaient de la feuille). D'où le `charSpace(0)` systématique avant
     tout texte aligné à droite ;
   — `doc.text()` ne coupe pas les pages tout seul : `placePour()` compare la
     hauteur RÉELLE du bloc à venir à la place restante, et ouvre une page si
     besoin. Un forfait trop large faisait passer « Ce qui se passe maintenant »
     à la page suivante alors qu'il restait la place ;
   — `splitTextToSize()` dépend de la police et du corps courants : on les règle
     AVANT de mesurer.

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
const GAP = 12; // gouttière entre les deux colonnes
const COLW = (COL_W - GAP) / 2; // largeur d'une colonne

/* Rythme vertical, en mm — un seul endroit à toucher pour resserrer. */
const H_TITRE = 8; // titre de section + filet
const H_LIGNE = 4.6; // libellé → valeur, et interligne d'une valeur
const H_ROW = 5.2; // écart entre deux lignes d'une même liste
const BAS_PAGE = 4; // respiration minimum au-dessus du pied de page

const CONCESSION = {
  tel: "02 43 85 00 11",
  mail: "contactlemans@amplitude.net.bmw.fr",
  adresse: "2 boulevard René Cassin, 72016 Le Mans",
};

/** Roundel clair, pour le bandeau (même fichier que l'en-tête du site). */
const LOGO = "/img/logo/logoHeader).svg";

const ETAPES = [
  "Un conseiller vous rappelle pour confirmer votre créneau.",
  "Présentez cette confirmation à l'accueil de la concession.",
  "L'essai dure 30 minutes, sur route, encadré par un conseiller.",
];

/** Date du jour, en clair : « 05 octobre 2026 ». */
const aujourdhui = () =>
  new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(
    new Date(),
  );

/** Le SVG du roundel rastérisé en PNG : jsPDF n'embarque pas de SVG. Renvoie
    null si le navigateur refuse (le bandeau reste alors typographique). */
async function logoPng(): Promise<string | null> {
  try {
    const res = await fetch(LOGO);
    if (!res.ok) return null;
    const url = URL.createObjectURL(new Blob([await res.text()], { type: "image/svg+xml" }));
    const img = new Image();
    img.src = url;
    await new Promise<void>((ok, ko) => {
      img.onload = () => ok();
      img.onerror = () => ko(new Error("logo"));
    });
    const taille = 512;
    const canvas = document.createElement("canvas");
    canvas.width = taille;
    canvas.height = taille;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, taille, taille);
    URL.revokeObjectURL(url);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

export async function downloadConfirmationPdf(r: Reservation) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const logo = await logoPng();

  /* Le pied de page est fixe : le contenu doit s'arrêter avant. */
  const pied = PAGE_H - 46;
  const limite = pied - BAS_PAGE;
  let y = 0;

  /** Ouvre une page si `h` millimètres ne tiennent plus sous `y`. */
  const placePour = (h: number) => {
    if (y + h > limite) {
      doc.addPage();
      y = 30;
    }
  };

  /* `droite` est indispensable pour la colonne de droite : sans alignement, le
     texte part de x = COL_R vers la droite et sort de la feuille. */
  const titre = (texte: string, x: number, yy: number, espace = 0.8, droite = false) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setCharSpace(espace);
    doc.setTextColor(...BRAND);
    doc.text(texte.toUpperCase(), x, yy, droite ? { align: "right" } : undefined);
    doc.setCharSpace(0);
  };

  /** Filet de section + titre. */
  const section = (texte: string, x = M, w = COL_W) => {
    titre(texte, x, y);
    y += 2.5;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.25);
    doc.line(x, y, x + w, y);
    y += 5.5;
  };

  /** Une ligne « libellé au-dessus, valeur en dessous ». Renvoie sa hauteur. */
  const ligne = (label: string, value: string, x: number, w: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setCharSpace(0.6);
    doc.setTextColor(...GREY);
    doc.text(label.toUpperCase(), x, y);
    doc.setCharSpace(0);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    const bloc = doc.splitTextToSize(value || "—", w) as string[];
    doc.text(bloc, x, y + H_LIGNE);
    return H_LIGNE + bloc.length * H_LIGNE;
  };

  /** Hauteur qu'occuperait une liste de lignes, sans rien dessiner. */
  const hauteurLignes = (rows: { label: string; value: string }[], w: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    return rows.reduce((h, row) => {
      const bloc = doc.splitTextToSize(row.value || "—", w) as string[];
      return h + H_LIGNE + bloc.length * H_LIGNE + H_ROW;
    }, 0);
  };

  /** Dessine une liste de lignes dans une colonne, à partir de `y`. */
  const lignes = (rows: { label: string; value: string }[], x: number, w: number) => {
    for (const row of rows) {
      const av = y;
      const hh = ligne(row.label, row.value, x, w);
      y = av + hh + H_ROW;
    }
  };

  /* ─────────── Bandeau ─────────── */
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, PAGE_W, 46, "F");

  if (logo) doc.addImage(logo, "PNG", COL_R - 26, 11, 26, 26);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setCharSpace(0.6);
  doc.setTextColor(190, 214, 238);
  doc.text("VENTES PRIVÉES BMW · AMPÈRE AUTOPASSION, LE MANS", M, 18);

  doc.setCharSpace(0);
  doc.setFontSize(19);
  doc.setTextColor(255, 255, 255);
  doc.text("CONFIRMATION DE VOTRE DEMANDE", M, 30);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(215, 232, 248);
  doc.text("Vendredi 13 et samedi 14 novembre 2026 · Le Mans", M, 39);

  /* ─────────── Bande de référence ─────────── */
  y = 56;

  doc.setFillColor(...MIST);
  doc.rect(M, y, COL_W, 24, "F");
  doc.setFillColor(...BRAND);
  doc.rect(M, y, 2.4, 24, "F");

  titre("Référence de votre demande", M + 8, y + 9.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text(r.ref, M + 8, y + 19);

  /* Colonne de droite : alignement à droite, donc SANS interlettrage. */
  doc.setCharSpace(0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GREY);
  doc.text(`Transmise le ${aujourdhui()}`, COL_R - 7, y + 9.5, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND);
  doc.text("Enregistrée", COL_R - 7, y + 19, { align: "right" });

  /* ─────────── Deux colonnes : demandeur / créneau ─────────── */
  y = 88;

  const demandeur = [
    { label: "Nom", value: r.nom },
    { label: "Email", value: r.email },
    { label: "Téléphone", value: r.telephone },
  ];
  const creneau = [
    { label: "Modèle BMW", value: r.vehicule },
    { label: "Jour", value: r.jour },
    { label: "Créneau", value: r.creneau },
  ];

  const yDepart = y;
  section("Votre demande", M, COLW);
  lignes(demandeur, M, COLW);
  const yFinGauche = y;

  y = yDepart;
  section("Créneau demandé", M + COLW + GAP, COLW);
  lignes(creneau, M + COLW + GAP, COLW);
  const yFinDroite = y;

  y =
    Math.max(
      yFinGauche,
      yFinDroite,
      yDepart + H_TITRE + Math.max(hauteurLignes(demandeur, COLW), hauteurLignes(creneau, COLW)),
    ) + 3;

  /* ─────────── Configuration composée (configurateur) ─────────── */
  const options = r.options.length > 0 ? r.options : [];
  const aConfiguration = options.length > 0 || Boolean(r.configuration);

  if (aConfiguration) {
    if (options.length > 0) {
      const moitie = Math.ceil(options.length / 2);
      const colonnes = [options.slice(0, moitie), options.slice(moitie)];
      const h = Math.max(...colonnes.map((c) => hauteurLignes(c, COLW)));
      placePour(H_TITRE + h + 1);
      section("Configuration composée");

      const yTop = y;
      let bas = y;
      colonnes.forEach((colonne, i) => {
        if (colonne.length === 0) return;
        y = yTop;
        lignes(colonne, i === 0 ? M : M + COLW + GAP, COLW);
        bas = Math.max(bas, y);
      });
      y = bas + 1;
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      const bloc = doc.splitTextToSize(r.configuration, COL_W) as string[];
      placePour(H_TITRE + bloc.length * H_LIGNE + 5);
      section("Configuration composée");
      doc.setTextColor(...INK);
      doc.text(bloc, M, y);
      y += bloc.length * H_LIGNE + 5;
    }
  }

  /* ─────────── Message du visiteur ─────────── */
  if (r.message) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    const bloc = doc.splitTextToSize(r.message, COL_W) as string[];
    placePour(H_TITRE + bloc.length * H_LIGNE + 5);
    section("Message transmis");
    doc.setTextColor(...INK);
    doc.text(bloc, M, y);
    y += bloc.length * H_LIGNE + 5;
  }

  /* ─────────── Prochaines étapes ─────────── */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const hauteurEtapes = ETAPES.reduce((h, etape) => {
    const bloc = doc.splitTextToSize(etape, COL_W - 10) as string[];
    return h + bloc.length * H_LIGNE + 2.8;
  }, H_TITRE);
  placePour(hauteurEtapes);
  section("Ce qui se passe maintenant");

  doc.setFontSize(9);
  ETAPES.forEach((etape, i) => {
    doc.setFont("helvetica", "bold");
    doc.setCharSpace(0);
    doc.setTextColor(...BRAND);
    doc.text(String(i + 1).padStart(2, "0"), M, y + 0.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    const bloc = doc.splitTextToSize(etape, COL_W - 10) as string[];
    doc.text(bloc, M + 10, y);
    y += bloc.length * H_LIGNE + 2.8;
  });

  /* ─────────── Pied de page ─────────── */
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.line(M, pied, COL_R, pied);

  titre("Votre concession", M, pied + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  doc.text(`Téléphone ${CONCESSION.tel}`, M, pied + 15);
  doc.text(CONCESSION.mail, M, pied + 20);
  doc.text(CONCESSION.adresse, M, pied + 25);

  /* Titre de droite : interlettrage désactivé ET aligné à droite, sinon jsPDF le
     pousse hors de la feuille. */
  titre("Horaires de l'événement", COL_R, pied + 8, 0, true);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  doc.text("Vendredi 13 novembre : 9h – 19h", COL_R, pied + 15, { align: "right" });
  doc.text("Samedi 14 novembre : 9h – 18h", COL_R, pied + 20, { align: "right" });

  doc.setFontSize(7.5);
  doc.setTextColor(...GREY);
  doc.text(
    `Document remis au visiteur à titre de récapitulatif. Votre créneau est réservé dès confirmation par un conseiller. Référence ${r.ref}.`,
    M,
    pied + 33,
    { maxWidth: COL_W },
  );

  doc.save(`confirmation-ventes-privees-${r.ref}.pdf`);
}
