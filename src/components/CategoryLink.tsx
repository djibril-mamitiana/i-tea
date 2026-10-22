"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const CATEGORY_EVENT = "itea:category";

/**
 * Lien vers une catégorie du menu. Sur l'accueil, il filtre le menu sur place (sans recharger) ;
 * depuis une autre page, il revient à l'accueil avec l'ancre #cat-… que le menu applique au chargement.
 */
export function CategoryLink({
  id,
  className,
  children,
  onNavigate,
  ...rest
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
  onNavigate?: () => void;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">) {
  const pathname = usePathname();
  return (
    <Link
      href={`/#cat-${id}`}
      className={className}
      onClick={(e) => {
        if (pathname === "/") {
          e.preventDefault();
          history.replaceState(null, "", `#cat-${id}`);
          window.dispatchEvent(new CustomEvent(CATEGORY_EVENT, { detail: id }));
        }
        onNavigate?.();
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
