import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";

/** Le logo rond d'I Tea (fichier fourni par le restaurant, fond transparent aux coins). */
export function LogoMark({ className = "size-12", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src={site.logo}
      alt=""
      width={160}
      height={160}
      priority={priority}
      className={`shrink-0 rounded-full ${className}`}
      aria-hidden="true"
    />
  );
}

/** Le nom est déjà écrit dans le logo : il reste dans l'étiquette accessible du lien. */
export function Logo({ className = "size-12 sm:size-14 lg:size-16", priority = false }: { light?: boolean; className?: string; priority?: boolean }) {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center rounded-full" aria-label={`${site.name} — accueil`}>
      <LogoMark className={className} priority={priority} />
    </Link>
  );
}
