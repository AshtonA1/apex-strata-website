import { useEffect } from "react";

export const SITE_NAME = "Apex Strata Consulting";

/** One list used by BOTH the browser (tab title) and the build-time pre-renderer (static HTML). */
export const PAGES = {
  home: {
    path: "/",
    title: null as string | null,
    description:
      "Apex Strata Consulting delivers practical, data-driven geotechnical solutions for safer, smarter mining: ground control, slope design, numerical modelling and geotechnical investigations.",
  },
  services: {
    path: "/services",
    title: "Services",
    description:
      "Geotechnical investigations and core logging, ground control recommendations, numerical modelling, TSF and heap leach designs, audits and on-site training for mining operations.",
  },
  projects: {
    path: "/projects",
    title: "Projects",
    description:
      "Selected geotechnical projects across Zimbabwe's mining sector: open pit design, heap leach pads, TSF review, shaft stability and ground control.",
  },
  about: {
    path: "/about",
    title: "About Us",
    description:
      "Apex Strata Consulting is a specialized geotechnical engineering consultancy for the mining and civil sectors: our mission, vision, core values and what sets us apart.",
  },
  contact: {
    path: "/contact",
    title: "Contact",
    description:
      "Contact Apex Strata Consulting for geotechnical investigations, ground control, slope design and numerical modelling for your mining operation.",
  },
} as const;

export type PageKey = keyof typeof PAGES;

export const fullTitle = (key: PageKey) => {
  const t = PAGES[key].title;
  return t ? `${t} | ${SITE_NAME}` : `${SITE_NAME} | Geotechnical Engineering for Mining`;
};

/** Sets the tab title and meta description for a page (kept in sync with the pre-rendered HTML). */
export function useSeo(key: PageKey) {
  useEffect(() => {
    document.title = fullTitle(key);
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = PAGES[key].description;
  }, [key]);
}
