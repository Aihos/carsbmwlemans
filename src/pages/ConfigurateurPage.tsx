import ConfigurateurComposer from "../components/ConfigurateurComposer";
import { usePageMeta } from "../lib/seo";

/* Page configurateur : le composeur partagé, en grand. Le même composant est
   monté dans la section #configurateur de la page d'accueil. */
export default function ConfigurateurPage() {
  usePageMeta(
    "Configurateur BMW",
    "Composez votre BMW : couleur, jantes, motorisation. Envoyez votre configuration à la concession BMW du Mans pour un rendez-vous.",
  );

  return <ConfigurateurComposer variant="page" />;
}
