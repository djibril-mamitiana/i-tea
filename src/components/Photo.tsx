import Image from "next/image";
import { site } from "@/config/site";

/**
 * Photographie culinaire. Avec `src`, l'image est optimisée par next/image (AVIF/WebP, dimensions réservées).
 * Sans `src`, un emplacement « photo à venir » clairement identifié s'affiche : jamais d'illustration
 * présentée comme une photo du restaurant. Le cadrage est donné par `className` (ex. « aspect-[4/5] »).
 */
export function Photo({
  src,
  alt,
  label,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  onDark = false,
  className = "",
}: {
  src?: string | null;
  alt: string;
  /** Description de la photo attendue (affichée sur l'emplacement en mode démo). */
  label?: string;
  sizes?: string;
  priority?: boolean;
  onDark?: boolean;
  className?: string;
}) {
  // « relative » seulement si l'appelant ne positionne pas déjà le conteneur (absolute, fixed, sticky).
  const position = /(?:^|\s)(?:absolute|fixed|sticky)(?:\s|$)/.test(className) ? "" : "relative";
  if (src) {
    return (
      <div className={`${position} overflow-hidden ${className}`}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  return (
    <div
      className={`photo-placeholder ${position} overflow-hidden ${onDark ? "is-dark" : ""} ${className}`}
      role="img"
      aria-label={`Emplacement de photo : ${label ?? alt}`}
    >
      {site.demoMode && (
        <div className="absolute inset-0 grid place-items-center p-5 text-center">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em]">Photo à venir</p>
            {label && <p className="mx-auto mt-1.5 max-w-[16rem] text-sm leading-snug">{label}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
