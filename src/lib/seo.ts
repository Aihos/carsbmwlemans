import { useEffect } from "react";

const SITE = "BMW Amplitude Automobiles, Le Mans";

/** Titre de l'onglet + meta description, par page. */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : SITE;
    if (description) {
      let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.name = "description";
        document.head.appendChild(tag);
      }
      tag.content = description;
    }
  }, [title, description]);
}
