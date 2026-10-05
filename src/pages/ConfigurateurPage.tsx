import ConfigurateurComposer from "../components/ConfigurateurComposer";
import { usePageMeta } from "../lib/seo";

/* Page configurateur : le composeur partagé, en grand. Le même composant est
   monté dans la section #configurateur de la page d'accueil. */
export default function ConfigurateurPage() {
  usePageMeta(
    "Configurateur BMW des ventes privées",
    "Composez la BMW que vous essaierez pendant les ventes privées du Mans : teinte extérieure, jantes et motorisation, transmises à la concession avant votre créneau.",
  );

  return <ConfigurateurComposer variant="page" />;
}
