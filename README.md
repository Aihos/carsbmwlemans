# VitrineCars — BMW Amplitude Automobiles (Le Mans)

Vitrine React + Vite pour la concession BMW Amplitude Automobiles.
Trois pages : accueil one-page animée (`/`), catalogue (`/catalogue`),
configurateur grand format (`/configurateur`). Stack : Vite + React 19 +
TypeScript + Tailwind v4 + GSAP (ScrollTrigger) + react-router.

## Démarrer

```bash
npm install
npm run dev
```

## Direction artistique BMW

### Typographie

BMW Group ne compose pas avec une titraille décorative : tout le site tient sur
une seule famille, **BMWTypeNext Pro** — interlettrage quasi nul sur les grands
corps (la spec BMW est `letterSpacing: 0`), angles vifs, aucun effet.

Le fichier embarqué est la **Regular officielle** :
`public/fonts/BMWTypeNext Pro Regular.otf` — © Bayerische Motoren Werke AG,
police sous licence BMW, à ne pas rediffuser hors du projet.

Ce fichier est statique et unique : il est déclaré sur toute la plage de graisses
(`font-weight: 100 900`) dans `src/index.css`. Conséquence voulue — le navigateur
ne fabrique **jamais** de faux gras, le site entier parle d'une seule voix, ce
qui est exactement la règle BMW.

Pour retrouver la hiérarchie de graisses de la marque : déposer les Light /
Medium / Bold officiels dans `public/fonts/` sous les noms
`BMWTypeNextPro-{Light,Medium,Bold}.otf`, puis décommenter les blocs `@font-face`
correspondants dans `src/index.css`. Aucune classe à toucher.

Aucune police distante n'est chargée : la pile `--font-sans` / `--font-display`
se replie sur Helvetica puis la pile système, et `index.html` ne contient plus
aucun `<link>` Google Fonts. La typographie n'a donc aucune dépendance externe.

`public/fonts/AgokaFamily.otf` n'est plus référencé (titraille du wireframe
d'origine, laissée sur le disque pour historique).

### Vocabulaire

La rédaction suit la segmentation et les appellations de la marque : **BMW M**,
**BMW i** et **BMW Classic** pour les familles du catalogue, **BMW Premium
Selection** pour les occasions, finitions **Sport / M Sport / M Performance**,
teintes extérieures et jantes nommées comme BMW les nomme (Style 32, 791 M,
963 M, 796 M), autonomies annoncées en **km WLTP**, moteurs en **6 cylindres en
ligne** et **V8** (les six-cylindres en ligne sont la signature de la marque).

La devise **Freude am Fahren** ouvre l'accueil (section bleue) ; sa traduction
officielle, **le plaisir de conduire**, porte le hero, le titre des onglets, la
signature du mail et la meta description.

### Page catalogue

`/catalogue` emprunte sa grammaire aux listings Ferrari Approved : canvas clair,
chapeau en micro-capitales puis titre en bas de casse et en graisse Regular
(36 px, `font-weight: 400` — aucune capitalisation décorative), onglets de gamme
soulignés d'un filet, grille aérée à `gap: 16px`, et cartes réduites à
l'essentiel : visuel plein cadre, badge de statut encastré, méta `année ·
kilométrage`, nom, prix, trois caractéristiques à micro-libellés, deux boutons
côte à côte. Aucun bord, aucune ombre, aucun fond de carte — le visuel et la
typographie portent seuls.

Le chrome reste monochrome (onglets, tri, recherche, filets) : l'accent bleu de
marque est réservé au bouton principal, exactement comme le rouge l'est chez
Ferrari. Les noms de modèles ne passent jamais en capitales — « BMW i5 eDrive40 »
doit rester en bas de casse.

### Pied de page

Les quatre blocs du pied de page reprennent la grille de cartes-image de Ferrari :
visuel plein cadre, voile dégradé dense en bas, micro-libellé puis titre posés
dessus — et les liens de navigation conservés à l'intérieur de chaque carte, avec
un filet au survol. Le voile (`from-black/95 via-black/65 to-black/20`) est calibré
pour garantir le contraste du texte quel que soit le cliché ; le bandeau de fond
est passé en encre (`bg-ink`) pour que cartes et pied de page ne fassent qu'un
seul bloc sombre. Les cartes se rangent en 2 colonnes à partir de `md`.

## Formulaire de rendez-vous (Resend)

Le formulaire `#reservation` poste sur `/api/reservation`, qui envoie le mail
via [Resend](https://resend.com). Deux envois par demande :

1. la notification interne, à l'adresse de `MAIL_TO` (ou, si `MAIL_TO` est vide,
   à l'adresse portée par `MAIL_FROM`) ;
2. l'accusé de réception au visiteur, à l'adresse qu'il a saisie.

Le visiteur est donc prévenu immédiatement, et la demande n'est jamais perdue :
`MAIL_TO` n'est plus obligatoire. Si l'accusé de réception est refusé, la demande
interne reste acceptée (l'API renvoie `{ ok: true, accuse: false }`).

1. Créer une clé API sur https://resend.com/api-keys
2. Vérifier le domaine d'envoi sur Resend, puis remplir `.env` (fichier non
   versionné, voir `.env.example`) :

| Variable         | Rôle                                                                 |
| ---------------- | -------------------------------------------------------------------- |
| `RESEND_API_KEY` | clé API Resend — **obligatoire**                                     |
| `MAIL_FROM`      | expéditeur, sur le domaine vérifié — **obligatoire**                 |
| `MAIL_TO`        | adresse(s) qui reçoit les demandes (virgules si plusieurs) — facultatif |

Sans domaine vérifié, Resend n'autorise l'envoi que vers l'adresse du compte :
garder `MAIL_FROM` sur `onboarding@resend.dev` et `MAIL_TO` sur cette adresse.

## API

`api/reservation.ts` est la fonction serverless (Vercel). En développement,
`vite.config.ts` la sert via un middleware : même contrat, même code.

- `POST /api/reservation` — corps JSON `{ nom, email, telephone, vehicule, date, creneau, message, configuration }`
- nom + email valides obligatoires
- limitation de débit (anti-spam-click) : 5 demandes / 15 min par connexion, 2 / 5 min par adresse email ; au-delà, réponse `429` avec un message affiché au visiteur
- réponse `{ ok: true, ref, accuse }` ou `{ error: "..." }`

`vercel.json` réécrit toutes les URLs (hors `/api/`) vers `index.html` pour que
les routes du client fonctionnent au rechargement.

### Déploiement Vercel

Renseigner `RESEND_API_KEY`, `MAIL_TO` et `MAIL_FROM` dans
*Settings → Environment Variables* du projet.

## Build

```bash
npx tsc -b && npm run build
```

## Structure

```
api/reservation.ts        fonction serverless (envoi du mail)
public/                   polices, logos, visuels véhicules
src/components/           sections de l'accueil + Header/Footer/Booking
src/pages/                Home, Catalogue, ConfigurateurPage
src/index.css             thème Tailwind + pile typographique BMW
src/data/site.ts          données véhicules, couleurs, jantes, moteurs, catalogue
src/lib/anim.ts           moteur GSAP (reveals au scroll)
src/lib/seo.ts            titre + meta description par page
```
