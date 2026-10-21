import { useEffect } from "react";

const SITE = "Apex Strata Consulting";

/** Sets the tab title and meta description for a page (single-page app, so done at runtime). */
export function useSeo(title: string | null, description: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE}` : `${SITE} | Geotechnical Engineering for Mining`;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;
  }, [title, description]);
}
