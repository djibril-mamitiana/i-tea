import Link from "next/link";
import { site } from "@/config/site";

/**
 * Signature de la marque : le nom I TEA, en capitales espacées, sans symbole générique.
 * Le « I » porte la couleur d'accent ; la ligne descriptive (cuisine, thés, desserts) rappelle l'univers.
 */
export function Logo({ light = false, descriptor = true }: { light?: boolean; descriptor?: boolean }) {
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 flex-col whitespace-nowrap leading-none"
      aria-label={`${site.name} — accueil`}
    >
      <span className={`font-display text-[1.7rem] font-semibold tracking-[0.2em] ${light ? "text-cream" : "text-ink"}`}>
        <span className={light ? "text-gold" : "text-accent"}>I</span>
        <span className="ml-[0.4em]">TEA</span>
      </span>
      {descriptor && (
        <span className={`mt-2 hidden text-[0.62rem] font-semibold uppercase tracking-[0.22em] sm:block ${light ? "text-cream/70" : "text-muted"}`}>
          {site.descriptor}
        </span>
      )}
    </Link>
  );
}
