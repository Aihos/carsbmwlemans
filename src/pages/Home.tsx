import Hero from "../components/Hero";
import Tendances from "../components/Tendances";
import Actualites from "../components/Actualites";
/* import ConfigurateurComposer from "../components/ConfigurateurComposer"; */
import Gallery from "../components/Gallery";
/* import Booking from "../components/Booking"; */
import { usePageMeta } from "../lib/seo";
import BandeauCOnfigurateurMini from "../components/bandeauCOnfigurateurmini";

/* Page d'accueil : une seule page animée, sections ancrées (#actualites,
   #tendances, #configurateur, #galerie, #reservation). Le composeur de la
   section #configurateur est le composant partagé de la page /configurateur
   (même code, même popup de rendez-vous). */
export default function Home({ ready }: { ready: boolean }) {
  usePageMeta(
    "Concession BMW au Mans, Le plaisir de conduire",
    "BMW Ampère Autopassion, concession BMW au Mans : gamme BMW M, BMW i et BMW Classic, configurateur, essais et prise de rendez-vous en ligne.",
  );

  return (
    <>
      <Hero ready={ready} />
      <Tendances />
      <BandeauCOnfigurateurMini />
      <Actualites />
      {/* <ConfigurateurComposer variant="home" /> */}
      <Gallery />
    {/*   <Booking /> */}
    </>
  );
}
