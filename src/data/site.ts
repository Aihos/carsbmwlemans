import { VEHICULES } from "./vehicules";

export type BBox = {
  /** largeur du fichier source (px) */
  w: number;
  /** hauteur du fichier source (px) */
  h: number;
  /** première colonne du dessin (marge transparente à gauche) */
  x0: number;
  /** première ligne du dessin (haut du sujet) */
  y0: number;
  /** dernière ligne du dessin (ligne de sol) */
  y1: number;
  /** largeur du dessin utile */
  bw: number;
};

export type Car = {
  id: string;
  name: string;
  motorisation: string;
  price: number;
  /** mensualité affichée sous le nom (€ / mois) */
  monthly: number;
  img: string;
  tag?: string;
  /** si présent : le visuel est recadré sur son dessin utile (PNG détouré) */
  bbox?: BBox;
};

/* Dessin utile des PNG détourés, mesuré sur leur canal alpha. Il permet de
   poser les voitures à la même échelle et sur la même ligne de sol, que le
   fichier ait beaucoup ou peu de vide transparent autour du dessin. */
export const INTRO_BBOX: Record<string, BBox> = {
  "/img/intro/1.png": { w: 446, h: 334, x0: 66, y0: 173, y1: 265, bw: 311 },
  "/img/intro/2.png": { w: 446, h: 334, x0: 52, y0: 167, y1: 259, bw: 343 },
  "/img/intro/3.png": { w: 446, h: 334, x0: 32, y0: 191, y1: 315, bw: 371 },
  "/img/intro/4.png": { w: 386, h: 285, x0: 14, y0: 121, y1: 236, bw: 352 },
  "/img/intro/5.png": { w: 446, h: 334, x0: 25, y0: 132, y1: 252, bw: 386 },
};

/** Hauteur du dessin utile. */
export const inkH = (b: BBox) => b.y1 - b.y0 + 1;

/** Rapport d'aspect de la boîte de dessin, à passer à `aspectRatio`. */
export const inkRatio = (b: BBox) => `${b.bw} / ${inkH(b)}`;

/** Position de l'image dans sa boîte de dessin (le dessin remplit la boîte).
    `maxWidth: none` est indispensable : la preflight Tailwind (max-width:100%)
    rognerait l'échelle et décalerait le dessin dans sa boîte. */
export const inkStyle = (b: BBox) => {
  const bh = inkH(b);
  return {
    left: `${((-b.x0 * 100) / b.bw).toFixed(3)}%`,
    bottom: `${((-((b.h - 1 - b.y1) * 100)) / bh).toFixed(3)}%`,
    width: `${((b.w * 100) / b.bw).toFixed(3)}%`,
    maxWidth: "none",
  };
};


export const COLORS = [
  { id: "silver", name: "Titanium Silver", hex: "#c6cbd1" },
  { id: "white", name: "Alpine White", hex: "#f1f3f5" },
  { id: "black", name: "Sapphire Black", hex: "#15171b" },
  { id: "red", name: "Melbourne Red", hex: "#9c1b26" },
  { id: "blue", name: "Portimao Blue", hex: "#00559d" },
  { id: "green", name: "Isle of Man Green", hex: "#17452f" },
  { id: "frozen", name: "Frozen Grey", hex: "#7d848d" },
  { id: "brooklyn", name: "Brooklyn Grey", hex: "#98a0a8" },
];

export type Wheel = { id: string; name: string; tyre: string; size: string; style: string; price: number; spokes: number };

export const WHEELS: Wheel[] = [
  { id: "w32", name: 'P Zéro 18"', tyre: "Pirelli P Zéro", size: "18\"", style: "Style 32", price: 0, spokes: 5 },
  { id: "w791", name: 'Pilot Sport 19"', tyre: "Michelin Pilot Sport", size: "19\"", style: "Style 791 M", price: 1450, spokes: 10 },
  { id: "w963", name: 'Cup 2 20"', tyre: "Pilot Sport Cup 2", size: "20\"", style: "Style 963 M", price: 3200, spokes: 20 },
  { id: "w796", name: 'Hiver 18"', tyre: "Pneumatique hiver", size: "18\"", style: "Style 796 M", price: 890, spokes: 7 },
];

export type Engine = { id: string; name: string; label: string; power: string; price: number };

export const ENGINES: Engine[] = [
  { id: "e48", name: "V8 4,8 L", label: "Sport", power: "367 ch", price: 0 },
  { id: "e50", name: "V8 5,0 L", label: "M Sport", power: "400 ch", price: 6800 },
  { id: "e54", name: "V8 5,4 L", label: "M Performance", power: "452 ch", price: 12400 },
];

export const BASE_PRICE = 74900;
export const CAR_NAME = "BMW Z4 M40i";

/* ─────────────── Intérieur & accessoires (atelier de configuration) ─────────────── */

export type Interior = {
  id: string;
  /** famille affichée en petit sur la carte */
  family: string;
  name: string;
  price: number;
  /** visuel d'exemple repris du configurateur BMW (public/img/configurateur/) */
  img: string;
  /** nuance appliquée à ce visuel : le fichier d'exemple est unique */
  filter?: string;
};

/* Selleries — visuel d'exemple : « Sellerie Tissu Arktur Anthracite » du
   configurateur BMW (140 × 140). Les autres teintes déclinent ce même visuel
   par filtre CSS, en attendant les photos produit définitives. */
export const SEATS: Interior[] = [
  {
    id: "arktur",
    family: "Tissu",
    name: "Arktur Anthracite",
    price: 0,
    img: "/img/configurateur/sellerie-arktur.webp",
  },
  {
    id: "sensatec",
    family: "Sensatec",
    name: "Noir",
    price: 1200,
    img: "/img/configurateur/sellerie-arktur.webp",
    filter: "brightness(1.45) contrast(1.06)",
  },
  {
    id: "vernasca-cognac",
    family: "Cuir Vernasca",
    name: "Cognac",
    price: 2400,
    img: "/img/configurateur/sellerie-arktur.webp",
    filter: "brightness(2.3) saturate(1.6) sepia(0.45)",
  },
];

/* Inserts décoratifs — visuel d'exemple : « Inserts décoratifs "Quarzsilber"
   mat grainé » du configurateur BMW. */
export const TRIMS: Interior[] = [
  {
    id: "quarzsilber",
    family: "Insert",
    name: "Quarzsilber mat grainé",
    price: 0,
    img: "/img/configurateur/insert-quarzsilber.webp",
  },
  {
    id: "alu-mesh",
    family: "Insert",
    name: "Aluminium M Mesheffect",
    price: 250,
    img: "/img/configurateur/insert-quarzsilber.webp",
    filter: "brightness(1.2) contrast(1.5) saturate(0.15)",
  },
  {
    id: "bois-noir",
    family: "Insert",
    name: "Bois précieux noir brillant",
    price: 600,
    img: "/img/configurateur/insert-quarzsilber.webp",
    filter: "brightness(0.5) sepia(0.55) saturate(2.2)",
  },
];

export type AccessoryIconName = "roofbox" | "bars" | "wheels" | "mat" | "hitch";

export type Accessory = {
  id: string;
  name: string;
  detail: string;
  price: number;
  icon: AccessoryIconName;
  /** photo produit, si le client en fournit une (sinon pictogramme) */
  img?: string;
};

/* Accessoires — noms et prix relevés sur le configurateur BMW (Coffre de toit
   BMW Aero 550, Jeu de roues complètes hiver, barres…). Le configurateur
   n'expose pas de photo produit exploitable pour ces articles : les cartes
   s'appuient sur un pictogramme. Déposer un visuel dans
   public/img/configurateur/ et renseigner `img` pour passer en photo. */
export const ACCESSORIES: Accessory[] = [
  {
    id: "coffre-toit",
    name: "Coffre de toit BMW Aero 550",
    detail: "460 l · ouvrable des deux côtés",
    price: 690,
    icon: "roofbox",
  },
  {
    id: "barres",
    name: "Barres de toit",
    detail: "aluminium, verrouillables",
    price: 250,
    icon: "bars",
  },
  {
    id: "roues-hiver",
    name: 'Jeu de roues complètes hiver 18"',
    detail: "jante BMW + pneumatique hiver",
    price: 1900,
    icon: "wheels",
    img: "/img/configurateur/jante-867.webp",
  },
  {
    id: "tapis",
    name: "Tapis de sol BMW",
    detail: "sur mesure, 4 pièces",
    price: 120,
    icon: "mat",
  },
  {
    id: "attelage",
    name: "Attelage électrique escamotable",
    detail: "déverrouillage électrique",
    price: 1250,
    icon: "hitch",
  },
];

/** Logo BMW de la concession (roundel) */
export const ROUNDEL = "../public/img/logo/BMW.svg";

export const EUR = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export const EUR2 = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

/* ─────────────────────────── Ventes privées ───────────────────────────

   L'événement que porte tout le site. Changer ces valeurs ici les change
   partout : le hero, la popup de rendez-vous, la galerie et le pied de page
   lisent cet objet. Dates, horaires et lieu sont les seules informations
   inventées du projet — le reste vient de la concession. */
export const EVENT = {
  label: "Ventes privées Ampère Autopassion",
  dates: "Vendredi 13 et samedi 14 novembre 2026",
  jours: ["Vendredi 13 novembre", "Samedi 14 novembre"],
  horaires: "Vendredi 9h – 19h · Samedi 9h – 18h",
  lieu: "2 boulevard René Cassin, 72016 Le Mans",
  invitation: "Sur invitation",
};

/* Navigation principale, routes réelles (react-router) */
export const NAV = [
  { label: "Catalogue", to: "/catalogue" },
  { label: "Configurateur", to: "/configurateur" },
  { label: "Actualités", to: "/actualites" },
];

/* ─────────────────────────── Catalogue ─────────────────────────── */

export type Family = "BMW M" | "BMW i" | "BMW Série";

export type CatalogueCar = {
  id: string;
  name: string;
  motorisation: string;
  energy: string;
  family: Family;
  year: number;
  km: number;
  gearbox: string;
  price: number;
  monthly: number;
  img: string;
  bbox?: BBox;
  tag?: string;
};

export const CATALOGUE: CatalogueCar[] = VEHICULES;

/* Les six modèles mis en avant par le carrousel « Nos modèles » de l'accueil,
   et proposés dans le configurateur : une sélection courte, un par univers
   (roadster, sportive, berline électrique, SUV électrique, SUV hybride, break M).
   Le premier est le modèle ouvert par défaut par le configurateur. */
const SHOWCASE = [
  "bmw-z4-m40i",
  "bmw-m2-m-xdrive",
  "bmw-i5-edrive40-berline",
  "bmw-ix3-50-xdrive",
  "bmw-x5-50e-xdrive",
  "bmw-m5-touring",
];

export const CARS: Car[] = SHOWCASE.map((id) => CATALOGUE.find((c) => c.id === id)!);

/* Tous les véhicules du catalogue ont leur visuel produit : le configurateur
   propose la gamme entière, pas seulement la sélection de l'accueil. */
export const CONFIGURABLES: CatalogueCar[] = CATALOGUE;

export const FAMILIES: Family[] = ["BMW M", "BMW i", "BMW Série"];

export const SORTS = [
  { id: "price-asc", label: "Prix croissant" },
  { id: "price-desc", label: "Prix décroissant" },
  { id: "year-desc", label: "Année récente" },
  { id: "km-asc", label: "Kilométrage" },
];

/** Tous les véhicules proposés dans le formulaire de rendez-vous. */
export const VEHICLES = Array.from(new Set(CATALOGUE.map((c) => c.name)));

/* ─────────────────────────── Actualités ─────────────────────────── */

export type News = {
  id: string;
  /** libellé affiché sur la carte et utilisé comme filtre de la page /actualites */
  category: string;
  /** date de publication (ISO), affichée « 03 OCT » sur la page /actualites */
  date: string;
  title: string;
  excerpt: string;
  img: string;
  alt: string;
  to: string;
};

/* Actualités — jeu de démonstration, à remplacer par les vraies parutions.
   Les quatre premières composent le carrousel de la page d'accueil
   (`NEWS_HIGHLIGHT`), les douze alimentent la page /actualites. */
export const NEWS: News[] = [
  {
    id: "skytop",
    category: "BMW M",
    date: "2026-11-12",
    title: "La Skytop sera exposée pendant les ventes privées",
    excerpt:
      "Cinquante exemplaires dans le monde, un V8 de 625 ch et une silhouette qui cite la 507 de 1957. L'objet le plus rare jamais produit par la M sera au showroom pendant les deux jours, sur rendez-vous.",
    img: "/img/troisquart/BMW-Skytop-2025-Rear_Three-Quarter.60c0a162.webp",
    alt: "BMW Skytop, trois-quarts arrière",
    to: "/catalogue",
  },
  {
    id: "vision-m-next",
    category: "Innovation",
    date: "2026-11-08",
    title: "Vision M Next : le concept à voir pendant l'événement",
    excerpt:
      "Hybridation, transmission intégrale et plus de 600 ch : le concept qui annonce l'électrification de la gamme M sans renoncer au plaisir de conduire. Il reste exposé pendant les deux jours.",
    img: "/img/troisquart/BMW-Vision_M_Next_Concept-2019-wallpaper.webp",
    alt: "BMW Vision M Next, concept",
    to: "/catalogue",
  },
  {
    id: "classic-503",
    category: "BMW Classic",
    date: "2026-11-04",
    title: "La 503 Coupé de 1956 sort d'atelier pour les ventes privées",
    excerpt:
      "Douze mois de restauration, un V8 d'origine reconstruit pièce par pièce et une première sortie sur les routes de la Sarthe. La 503 se visite à l'atelier, sur rendez-vous, pendant l'événement.",
    img: "/img/BMW-503_Coupe-1956-Side_Profile.83b9c17e.webp",
    alt: "BMW 503 Coupé 1956, profil",
    to: "/catalogue",
  },
  {
    id: "ix5",
    category: "BMW i",
    date: "2026-10-31",
    title: "iX5 : les précommandes s'ouvrent pendant l'événement",
    excerpt:
      "620 km d'autonomie annoncés, recharge à 350 kW et dernière génération de cellules : le iX5 ouvre la voie aux BMW i de demain. Les précommandes se prennent en concession pendant les deux jours.",
    img: "/img/BMW-iX5-2027-Side_Profile.5ae9ad71.webp",
    alt: "BMW iX5, profil",
    to: "/catalogue",
  },
  {
    id: "serie7",
    category: "Gamme",
    date: "2026-10-27",
    title: "Série 7 : le vaisseau amiral exposé au showroom",
    excerpt:
      "Six cylindres, suspension pneumatique et banquette arrière façon salon : la Série 7 figure dans la sélection des ventes privées et reste disponible à l'essai sur créneau.",
    img: "/img/troisquart/BMW-7-Series-2027-wallpaper.webp",
    alt: "BMW Série 7, trois-quarts avant",
    to: "/catalogue",
  },
  {
    id: "m2",
    category: "BMW M",
    date: "2026-10-23",
    title: "BMW M2 : 480 ch, et un essai encadré sur les routes de la Sarthe",
    excerpt:
      "La M2 reste la plus compacte des BMW M, et la plus joueuse. Notre exemplaire de démonstration se conduit pendant l'événement, essai encadré, sur créneau réservé.",
    img: "/img/troisquart/BMW-M2-2025-wallpaper.webp",
    alt: "BMW M2, trois-quarts",
    to: "/catalogue",
  },
  {
    id: "news-i5",
    category: "BMW i",
    date: "2026-10-19",
    title: "i5 eDrive40 : 582 km WLTP, essai libre pendant l'événement",
    excerpt:
      "Berline électrique, 340 ch et recharge rapide : l'i5 eDrive40 est dans la sélection exposée. Une heure au volant suffit à comprendre où va la marque.",
    img: "/img/BMW-i5-2024-Side_Profile.17799284.webp",
    alt: "BMW i5 eDrive40, profil",
    to: "/catalogue",
  },
  {
    id: "news-ix2",
    category: "BMW i",
    date: "2026-10-15",
    title: "iX2 xDrive30 : un 0 km démonstration rejoint la vente privée",
    excerpt:
      "4 200 km au compteur, électrique, toutes options : le iX2 xDrive30 fait partie des véhicules repris en conditions privées pendant les deux jours. Financement et reprise étudiés sur place.",
    img: "/img/BMW-iX2-2024-Side_Profile.e5efc40a.webp",
    alt: "BMW iX2 xDrive30, profil",
    to: "/catalogue",
  },
  {
    id: "news-e30",
    category: "BMW Classic",
    date: "2026-10-11",
    title: "Une 325i cabriolet de 1990 entre en collection pour l'événement",
    excerpt:
      "Cent vingt et un mille kilomètres, un six cylindres en ligne et une capote d'origine : cette E30 rejoint les pièces BMW Classic suivies par nos ateliers et sera exposée le week-end.",
    img: "/img/c.webp",
    alt: "BMW 325i cabriolet de 1990",
    to: "/catalogue",
  },
  {
    id: "news-i8",
    category: "Innovation",
    date: "2026-10-07",
    title: "i8 : l'hybride qui a ouvert la voie, exposée à l'atelier",
    excerpt:
      "Châssis carbone, trois cylindres suralimenté et moteur électrique : dix ans après, l'i8 reste la démonstration la plus élégante du savoir-faire BMW i, visible pendant les ventes privées.",
    img: "/img/b%20(2).webp",
    alt: "BMW i8, profil",
    to: "/catalogue",
  },
  {
    id: "news-z8",
    category: "BMW Classic",
    date: "2026-10-04",
    title: "Z8 : le roadster qui prolonge la 507, à voir sur rendez-vous",
    excerpt:
      "Un V8 atmosphérique, une ligne signée par les ateliers de design et une cote qui ne faiblit pas. Le Z8 est visible pendant l'événement, entretien complet effectué.",
    img: "/img/A.webp",
    alt: "BMW Z8, profil",
    to: "/catalogue",
  },
  {
    id: "news-serie4",
    category: "Gamme",
    date: "2026-10-02",
    title: "Série 4 Coupé : finition M Sport dans la sélection exposée",
    excerpt:
      "Le coupé en finition M Sport, avec ses jantes M et son châssis raffermi, est la porte d'entrée la plus directe vers la grammaire de la gamme M. Il fait partie des véhicules repris en tarif privé.",
    img: "/img/e.webp",
    alt: "BMW Série 4 Coupé, profil",
    to: "/catalogue",
  },
];

/** Les quatre actualités mises en avant dans le carrousel de la page d'accueil. */
export const NEWS_HIGHLIGHT: News[] = NEWS.slice(0, 4);

/** Filtres de la page /actualites : « Tout » puis les catégories réellement présentes. */
export const NEWS_TAGS: string[] = [
  "Tout",
  ...Array.from(new Set(NEWS.map((n) => n.category))),
];



export const GALLERY = [
  "/img/troisquart/BMW-Vision_M_Next_Concept-2019-wallpaper.webp",
  "/img/d.webp",
  "/img/troisquart/BMW-Skytop-2025-Rear_Three-Quarter.60c0a162.webp",
  "/img/troisquart/BMW-7-Series-2027-wallpaper.webp",
];
