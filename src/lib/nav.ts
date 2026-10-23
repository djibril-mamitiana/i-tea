import { site } from "../config/site.ts";

/** La section « Notre histoire » n'existe que si un texte réel est fourni (ou en mode démo, comme emplacement). */
export const hasStory = () => site.story.paragraphs.length > 0 || site.demoMode;

export interface NavLink {
  label: string;
  href: string;
}

/** Liens de navigation : uniquement des destinations qui existent réellement sur la page d'accueil. */
export function navLinks(): NavLink[] {
  return [
    { label: "La carte", href: "/#carte" },
    ...(hasStory() ? [{ label: "Notre histoire", href: "/#histoire" }] : []),
    { label: "Contact", href: "/#contact" },
  ];
}
