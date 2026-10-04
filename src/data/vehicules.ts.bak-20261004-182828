import type { BBox, CatalogueCar, Family } from "./site";

/* ─────────────── Gamme BMW — fiches et visuels produit trois-quarts ───────────────

   Source unique du catalogue (/catalogue) et du carrousel « Nos modèles » de la
   page d'accueil : les 74 fiches ci-dessous couvrent la gamme BMW France, du
   116 à la XM en passant par les BMW i et les BMW M.

   img  : vue trois-quarts produit, détourée, dans public/img/produit/troisquart/
          (WebP à canal alpha, 1128 × 921 px).
   bbox : dessin utile du visuel, mesuré sur son canal alpha
          (ffmpeg -i f.webp -vf alphaextract,bbox). Il sert à poser toutes les
          voitures à la même échelle et sur la même ligne de sol (voir inkStyle()).

   ATTENTION — prix, puissances et kilométrages sont des valeurs proposées en
   concession, à faire valider avant mise en ligne (relecture :
   modeles-bmw-vitrineCars.csv). */

/** slug du visuel, nom commercial, motorisation, énergie, gamme, année, km,
    boîte, prix TTC, badge (chaine vide = aucun). */
type Ligne = [
  slug: string,
  name: string,
  motorisation: string,
  energy: string,
  family: Family,
  year: number,
  km: number,
  gearbox: string,
  price: number,
  tag: string,
];

const LIGNES: Ligne[] = [
  ["bmw-116", "BMW 116", "3 cylindres · 122 ch", "Essence", "BMW Série", 2026, 0, "Automatique", 38950, ""],
  ["bmw-120d", "BMW 120d", "4 cylindres diesel · 163 ch", "Diesel", "BMW Série", 2026, 0, "Automatique", 45400, ""],
  ["bmw-216-122-ch-gran-coup", "BMW 216 Gran Coupé", "3 cylindres · 122 ch", "Essence", "BMW Série", 2026, 0, "Automatique", 41500, ""],
  ["bmw-220d-coup", "BMW 220d Coupé", "4 cylindres diesel · 190 ch", "Diesel", "BMW Série", 2026, 0, "Automatique", 48900, "NEUF · EN STOCK"],
  ["bmw-220i-active-tourer", "BMW 220i Active Tourer", "4 cylindres · 156 ch", "Essence", "BMW Série", 2026, 0, "Automatique", 44900, ""],
  ["bmw-225e-xdrive-active-tourer", "BMW 225e xDrive Active Tourer", "Hybride rechargeable · 245 ch", "Hybride rechargeable", "BMW Série", 2026, 0, "Automatique", 51400, ""],
  ["bmw-318d-touring", "BMW 318d Touring", "4 cylindres diesel · 150 ch", "Diesel", "BMW Série", 2026, 0, "Automatique", 53900, ""],
  ["bmw-318i-touring", "BMW 318i Touring", "4 cylindres · 156 ch", "Essence", "BMW Série", 2026, 0, "Automatique", 51900, ""],
  ["bmw-320-berline", "BMW 320 Berline", "4 cylindres · 156 ch", "Essence", "BMW Série", 2026, 0, "Automatique", 49900, "NEUF · EN STOCK"],
  ["bmw-330e-berline", "BMW 330e Berline", "Hybride rechargeable · 292 ch", "Hybride rechargeable", "BMW Série", 2026, 0, "Automatique", 59900, ""],
  ["bmw-330e-touring", "BMW 330e Touring", "Hybride rechargeable · 292 ch", "Hybride rechargeable", "BMW Série", 2026, 0, "Automatique", 61900, ""],
  ["bmw-420d-cabriolet", "BMW 420d Cabriolet", "4 cylindres diesel · 190 ch", "Diesel", "BMW Série", 2026, 0, "Automatique", 66900, ""],
  ["bmw-420d-xdrive-coup", "BMW 420d xDrive Coupé", "4 cylindres diesel · 190 ch", "Diesel", "BMW Série", 2026, 0, "Automatique", 61900, ""],
  ["bmw-420d-xdrive-gran-coup", "BMW 420d xDrive Gran Coupé", "4 cylindres diesel · 190 ch", "Diesel", "BMW Série", 2026, 0, "Automatique", 63400, ""],
  ["bmw-420i-cabriolet", "BMW 420i Cabriolet", "4 cylindres · 184 ch", "Essence", "BMW Série", 2026, 0, "Automatique", 64400, ""],
  ["bmw-420i-coup", "BMW 420i Coupé", "4 cylindres · 184 ch", "Essence", "BMW Série", 2026, 0, "Automatique", 56900, ""],
  ["bmw-420i-gran-coup", "BMW 420i Gran Coupé", "4 cylindres · 184 ch", "Essence", "BMW Série", 2026, 0, "Automatique", 58400, ""],
  ["bmw-520d-berline", "BMW 520d Berline", "4 cylindres diesel · 197 ch", "Diesel", "BMW Série", 2026, 0, "Automatique", 66400, ""],
  ["bmw-520d-touring", "BMW 520d Touring", "4 cylindres diesel · 197 ch", "Diesel", "BMW Série", 2026, 0, "Automatique", 68900, ""],
  ["bmw-520i-berline", "BMW 520i Berline", "4 cylindres · 208 ch", "Essence", "BMW Série", 2026, 0, "Automatique", 63900, ""],
  ["bmw-520i-touring", "BMW 520i Touring", "4 cylindres · 208 ch", "Essence", "BMW Série", 2026, 0, "Automatique", 66400, ""],
  ["bmw-530e-berline", "BMW 530e Berline", "Hybride rechargeable · 299 ch", "Hybride rechargeable", "BMW Série", 2026, 0, "Automatique", 72900, ""],
  ["bmw-530e-touring", "BMW 530e Touring", "Hybride rechargeable · 299 ch", "Hybride rechargeable", "BMW Série", 2026, 0, "Automatique", 75400, ""],
  ["bmw-750e-xdrive", "BMW 750e xDrive", "6 cylindres · hybride rechargeable · 489 ch", "Hybride rechargeable", "BMW Série", 2026, 0, "Automatique", 137500, ""],
  ["bmw-x1-sdrive20i", "BMW X1 sDrive20i", "4 cylindres · 156 ch", "Essence", "BMW Série", 2025, 3100, "Automatique", 47400, "0 KM DÉMONSTRATION"],
  ["bmw-x1-xdrive25e", "BMW X1 xDrive25e", "Hybride rechargeable · 245 ch", "Hybride rechargeable", "BMW Série", 2026, 0, "Automatique", 54900, ""],
  ["bmw-x1-xdrive30e", "BMW X1 xDrive30e", "Hybride rechargeable · 326 ch", "Hybride rechargeable", "BMW Série", 2026, 0, "Automatique", 58400, ""],
  ["bmw-x2-sdrive20i", "BMW X2 sDrive20i", "4 cylindres · 156 ch", "Essence", "BMW Série", 2026, 0, "Automatique", 50400, ""],
  ["bmw-x2-sdrive20d", "BMW X2 sDrive20d", "4 cylindres diesel · 163 ch", "Diesel", "BMW Série", 2026, 0, "Automatique", 52900, ""],
  ["bmw-x3-30e-xdrive", "BMW X3 30e xDrive", "Hybride rechargeable · 299 ch", "Hybride rechargeable", "BMW Série", 2026, 0, "Automatique", 74900, ""],
  ["bmw-x5-50e-xdrive", "BMW X5 50e xDrive", "Hybride rechargeable · 489 ch", "Hybride rechargeable", "BMW Série", 2026, 0, "Automatique", 106900, "NEUF · EN STOCK"],
  ["bmw-m135-xdrive", "BMW M135 xDrive", "4 cylindres · 300 ch", "Essence", "BMW M", 2026, 0, "Automatique", 59900, ""],
  ["bmw-m235-xdrive-300-ch-gran-coup", "BMW M235 xDrive Gran Coupé", "4 cylindres · 300 ch", "Essence", "BMW M", 2026, 0, "Automatique", 61400, ""],
  ["bmw-m240i-xdrive-coup", "BMW M240i xDrive Coupé", "6 cylindres en ligne · 374 ch", "Essence", "BMW M", 2026, 0, "Automatique", 72900, ""],
  ["bmw-m2-m-xdrive", "BMW M2", "6 cylindres en ligne · 480 ch", "Essence", "BMW M", 2026, 0, "Automatique", 79900, "NEUF · EN STOCK"],
  ["bmw-m340d-xdrive-touring", "BMW M340d xDrive Touring", "6 cylindres diesel · 340 ch", "Diesel", "BMW M", 2026, 0, "Automatique", 81400, ""],
  ["bmw-m340i-xdrive-touring", "BMW M340i xDrive Touring", "6 cylindres en ligne · 374 ch", "Essence", "BMW M", 2026, 0, "Automatique", 79900, ""],
  ["bmw-m350-xdrive-berline", "BMW M350 xDrive", "6 cylindres en ligne · 398 ch", "Essence", "BMW M", 2026, 0, "Automatique", 71900, "PRÉCOMMANDE"],
  ["bmw-m3-competition-m-xdrive-berline", "BMW M3 Competition M xDrive", "6 cylindres en ligne · 530 ch", "Essence", "BMW M", 2026, 0, "Automatique", 122400, ""],
  ["bmw-m3-competition-m-xdrive-touring", "BMW M3 Competition M xDrive Touring", "6 cylindres en ligne · 530 ch", "Essence", "BMW M", 2025, 6800, "Automatique", 124900, "0 KM DÉMONSTRATION"],
  ["bmw-m4-competition-m-xdrive-coup", "BMW M4 Competition M xDrive Coupé", "6 cylindres en ligne · 530 ch", "Essence", "BMW M", 2026, 0, "Automatique", 126900, ""],
  ["bmw-m4-competition-m-xdrive-cabriolet", "BMW M4 Competition M xDrive Cabriolet", "6 cylindres en ligne · 530 ch", "Essence", "BMW M", 2026, 0, "Automatique", 138000, ""],
  ["bmw-m440i-xdrive-coup", "BMW M440i xDrive Coupé", "6 cylindres en ligne · 374 ch", "Essence", "BMW M", 2026, 0, "Automatique", 82400, ""],
  ["bmw-m440i-xdrive-gran-coup", "BMW M440i xDrive Gran Coupé", "6 cylindres en ligne · 374 ch", "Essence", "BMW M", 2026, 0, "Automatique", 84900, ""],
  ["bmw-m440i-xdrive-cabriolet", "BMW M440i xDrive Cabriolet", "6 cylindres en ligne · 374 ch", "Essence", "BMW M", 2026, 0, "Automatique", 89900, ""],
  ["bmw-m440d-xdrive-coup", "BMW M440d xDrive Coupé", "6 cylindres diesel · 340 ch", "Diesel", "BMW M", 2026, 0, "Automatique", 83900, ""],
  ["bmw-m440d-xdrive-cabriolet", "BMW M440d xDrive Cabriolet", "6 cylindres diesel · 340 ch", "Diesel", "BMW M", 2026, 0, "Automatique", 91400, ""],
  ["bmw-m5-berline", "BMW M5", "V8 hybride rechargeable · 727 ch", "Hybride rechargeable", "BMW M", 2026, 0, "Automatique", 155000, "SUR COMMANDE"],
  ["bmw-m5-touring", "BMW M5 Touring", "V8 hybride rechargeable · 727 ch", "Hybride rechargeable", "BMW M", 2026, 0, "Automatique", 158500, "SUR COMMANDE"],
  ["bmw-m760e-xdrive", "BMW M760e xDrive", "6 cylindres · hybride rechargeable · 571 ch", "Hybride rechargeable", "BMW M", 2026, 0, "Automatique", 155500, ""],
  ["bmw-x1-m35i-xdrive", "BMW X1 M35i xDrive", "4 cylindres · 300 ch", "Essence", "BMW M", 2026, 0, "Automatique", 66400, ""],
  ["bmw-x2-m35i-xdrive", "BMW X2 M35i xDrive", "4 cylindres · 300 ch", "Essence", "BMW M", 2026, 0, "Automatique", 67900, ""],
  ["bmw-x3-m50-xdrive", "BMW X3 M50 xDrive", "6 cylindres en ligne · 443 ch", "Essence", "BMW M", 2026, 0, "Automatique", 88900, ""],
  ["bmw-x5-m60e-xdrive", "BMW X5 M60e xDrive", "Hybride rechargeable · 489 ch", "Hybride rechargeable", "BMW M", 2026, 0, "Automatique", 128900, ""],
  ["bmw-xm-label", "BMW XM Label", "V8 hybride rechargeable · 748 ch", "Hybride rechargeable", "BMW M", 2026, 0, "Automatique", 199000, "SUR COMMANDE"],
  ["bmw-z4-m40i", "BMW Z4 M40i", "6 cylindres en ligne · 340 ch", "Essence", "BMW M", 2026, 0, "Automatique", 74900, "NEUF · EN STOCK"],
  ["bmw-z4-sdrive20i", "BMW Z4 sDrive20i", "4 cylindres · 197 ch", "Essence", "BMW M", 2026, 0, "Automatique", 63900, ""],
  ["bmw-i3-50-xdrive-berline", "BMW i3 50 xDrive", "Électrique · 469 ch · 805 km WLTP", "Électrique", "BMW i", 2026, 0, "Automatique", 62900, "PRÉCOMMANDE"],
  ["bmw-i3-m60-xdrive-berline", "BMW i3 M60 xDrive", "Électrique · 620 ch · 750 km WLTP", "Électrique", "BMW i", 2026, 0, "Automatique", 82900, ""],
  ["bmw-i4-edrive35", "BMW i4 eDrive35", "Électrique · 286 ch · 483 km WLTP", "Électrique", "BMW i", 2026, 0, "Automatique", 62900, ""],
  ["bmw-i4-edrive40", "BMW i4 eDrive40", "Électrique · 340 ch · 590 km WLTP", "Électrique", "BMW i", 2026, 0, "Automatique", 66900, ""],
  ["bmw-i4-m60-xdrive", "BMW i4 M60 xDrive", "Électrique · 544 ch · 551 km WLTP", "Électrique", "BMW i", 2026, 0, "Automatique", 84900, ""],
  ["bmw-i5-edrive40-berline", "BMW i5 eDrive40", "Électrique · 340 ch · 582 km WLTP", "Électrique", "BMW i", 2026, 0, "Automatique", 78900, "NEUF · EN STOCK"],
  ["bmw-i5-edrive40-touring", "BMW i5 eDrive40 Touring", "Électrique · 340 ch · 560 km WLTP", "Électrique", "BMW i", 2026, 0, "Automatique", 81400, ""],
  ["bmw-i5-m60-xdrive-berline", "BMW i5 M60 xDrive", "Électrique · 601 ch · 516 km WLTP", "Électrique", "BMW i", 2026, 0, "Automatique", 111900, ""],
  ["bmw-i7-50-xdrive", "BMW i7 50 xDrive", "Électrique · 455 ch · 610 km WLTP", "Électrique", "BMW i", 2026, 0, "Automatique", 138900, ""],
  ["bmw-ix1-edrive20", "BMW iX1 eDrive20", "Électrique · 204 ch · 478 km WLTP", "Électrique", "BMW i", 2026, 0, "Automatique", 51900, ""],
  ["bmw-ix1-xdrive30", "BMW iX1 xDrive30", "Électrique · 313 ch · 440 km WLTP", "Électrique", "BMW i", 2026, 0, "Automatique", 56400, ""],
  ["bmw-ix2-edrive20", "BMW iX2 eDrive20", "Électrique · 204 ch · 478 km WLTP", "Électrique", "BMW i", 2026, 0, "Automatique", 52900, ""],
  ["bmw-ix2-xdrive30", "BMW iX2 xDrive30", "Électrique · 313 ch · 449 km WLTP", "Électrique", "BMW i", 2025, 4200, "Automatique", 58400, "0 KM DÉMONSTRATION"],
  ["bmw-ix3-50-xdrive", "BMW iX3 50 xDrive", "Électrique · 469 ch · 805 km WLTP", "Électrique", "BMW i", 2026, 0, "Automatique", 69900, "PRÉCOMMANDE"],
  ["bmw-ix5-60-xdrive", "BMW iX5 60 xDrive", "Électrique · 544 ch · 700 km WLTP", "Électrique", "BMW i", 2026, 0, "Automatique", 92000, ""],
  ["bmw-ix-xdrive60", "BMW iX xDrive60", "Électrique · 544 ch · 701 km WLTP", "Électrique", "BMW i", 2026, 0, "Automatique", 108900, ""],
  ["bmw-ix-m70-xdrive", "BMW iX M70 xDrive", "Électrique · 659 ch · 600 km WLTP", "Électrique", "BMW i", 2026, 0, "Automatique", 141900, ""],
];

/** Dessin utile de chaque visuel : x0, y0 (haut), y1 (ligne de sol), largeur. */
const MESURES: Record<string, [number, number, number, number]> = {
  "bmw-116": [225, 344, 655, 729],
  "bmw-120d": [226, 344, 655, 728],
  "bmw-216-122-ch-gran-coup": [225, 346, 655, 740],
  "bmw-220d-coup": [210, 357, 657, 750],
  "bmw-220i-active-tourer": [181, 307, 672, 797],
  "bmw-225e-xdrive-active-tourer": [181, 307, 672, 797],
  "bmw-318d-touring": [192, 356, 664, 769],
  "bmw-318i-touring": [192, 356, 664, 769],
  "bmw-320-berline": [232, 352, 646, 753],
  "bmw-330e-berline": [193, 354, 664, 766],
  "bmw-330e-touring": [194, 351, 664, 764],
  "bmw-420d-cabriolet": [192, 371, 662, 768],
  "bmw-420d-xdrive-coup": [192, 362, 662, 768],
  "bmw-420d-xdrive-gran-coup": [191, 352, 662, 770],
  "bmw-420i-cabriolet": [192, 371, 662, 768],
  "bmw-420i-coup": [194, 358, 662, 763],
  "bmw-420i-gran-coup": [190, 353, 661, 771],
  "bmw-520d-berline": [217, 349, 656, 774],
  "bmw-520d-touring": [215, 352, 657, 776],
  "bmw-520i-berline": [215, 352, 657, 775],
  "bmw-520i-touring": [215, 352, 657, 776],
  "bmw-530e-berline": [217, 349, 657, 774],
  "bmw-530e-touring": [215, 352, 656, 776],
  "bmw-750e-xdrive": [200, 363, 668, 820],
  "bmw-x1-sdrive20i": [216, 327, 668, 720],
  "bmw-x1-xdrive25e": [216, 327, 668, 719],
  "bmw-x1-xdrive30e": [216, 323, 668, 720],
  "bmw-x2-sdrive20i": [231, 313, 658, 776],
  "bmw-x2-sdrive20d": [236, 309, 657, 770],
  "bmw-x3-30e-xdrive": [211, 301, 661, 793],
  "bmw-x5-50e-xdrive": [220, 307, 654, 791],
  "bmw-m135-xdrive": [225, 348, 655, 729],
  "bmw-m235-xdrive-300-ch-gran-coup": [225, 350, 655, 740],
  "bmw-m240i-xdrive-coup": [210, 357, 657, 750],
  "bmw-m2-m-xdrive": [199, 356, 657, 766],
  "bmw-m340d-xdrive-touring": [192, 356, 664, 769],
  "bmw-m340i-xdrive-touring": [192, 356, 664, 769],
  "bmw-m350-xdrive-berline": [232, 352, 646, 753],
  "bmw-m3-competition-m-xdrive-berline": [189, 357, 665, 773],
  "bmw-m3-competition-m-xdrive-touring": [189, 356, 665, 773],
  "bmw-m4-competition-m-xdrive-coup": [189, 361, 662, 771],
  "bmw-m4-competition-m-xdrive-cabriolet": [189, 370, 662, 771],
  "bmw-m440i-xdrive-coup": [192, 362, 662, 768],
  "bmw-m440i-xdrive-gran-coup": [191, 356, 662, 771],
  "bmw-m440i-xdrive-cabriolet": [192, 371, 662, 768],
  "bmw-m440d-xdrive-coup": [192, 362, 662, 768],
  "bmw-m440d-xdrive-cabriolet": [192, 371, 662, 768],
  "bmw-m5-berline": [214, 351, 659, 783],
  "bmw-m5-touring": [214, 352, 659, 783],
  "bmw-m760e-xdrive": [199, 363, 668, 824],
  "bmw-x1-m35i-xdrive": [216, 327, 668, 720],
  "bmw-x2-m35i-xdrive": [231, 313, 659, 775],
  "bmw-x3-m50-xdrive": [211, 301, 661, 792],
  "bmw-x5-m60e-xdrive": [220, 307, 654, 791],
  "bmw-xm-label": [202, 307, 666, 808],
  "bmw-z4-m40i": [203, 366, 659, 774],
  "bmw-z4-sdrive20i": [202, 365, 658, 776],
  "bmw-i3-50-xdrive-berline": [238, 356, 652, 748],
  "bmw-i3-m60-xdrive-berline": [238, 356, 652, 748],
  "bmw-i4-edrive35": [191, 356, 663, 771],
  "bmw-i4-edrive40": [192, 356, 662, 769],
  "bmw-i4-m60-xdrive": [191, 356, 662, 771],
  "bmw-i5-edrive40-berline": [215, 353, 658, 776],
  "bmw-i5-edrive40-touring": [215, 349, 656, 776],
  "bmw-i5-m60-xdrive-berline": [215, 349, 657, 776],
  "bmw-i7-50-xdrive": [199, 363, 668, 824],
  "bmw-ix1-edrive20": [217, 329, 668, 718],
  "bmw-ix1-xdrive30": [216, 329, 668, 720],
  "bmw-ix2-edrive20": [236, 313, 657, 770],
  "bmw-ix2-xdrive30": [231, 313, 659, 776],
  "bmw-ix3-50-xdrive": [169, 308, 674, 801],
  "bmw-ix5-60-xdrive": [220, 307, 654, 791],
  "bmw-ix-xdrive60": [215, 304, 660, 790],
  "bmw-ix-m70-xdrive": [215, 304, 660, 790],
};

/** Cadre commun à tous les visuels produit (px). */
const CADRE = { w: 1128, h: 921 } as const;

const bbox = (slug: string): BBox => {
  const [x0, y0, y1, bw] = MESURES[slug];
  return { ...CADRE, x0, y0, y1, bw };
};

/** Mensualité indicative (60 mois, apport 10 pour cent). */
const financed = (price: number) => Math.round(price * 0.013285 * 100) / 100;

export const VEHICULES: CatalogueCar[] = LIGNES.map(
  ([slug, name, motorisation, energy, family, year, km, gearbox, price, tag]) => ({
    id: slug,
    name,
    motorisation,
    energy,
    family,
    year,
    km,
    gearbox,
    price,
    monthly: financed(price),
    img: `/img/produit/troisquart/${slug}.webp`,
    bbox: bbox(slug),
    ...(tag ? { tag } : {}),
  }),
);
