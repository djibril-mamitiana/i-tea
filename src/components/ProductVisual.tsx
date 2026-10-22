import Image from "next/image";
import type { Category, Product } from "@/lib/types";
import { ArtSvg } from "./ProductArt";

/**
 * Visuel d'un produit : la vraie photo si `image` est renseigné,
 * sinon l'illustration de démonstration sur fond teinté.
 */
export function ProductVisual({
  item,
  className = "",
  sizes = "(min-width: 1024px) 25vw, 50vw",
  priority = false,
}: {
  item: Pick<Product | Category, "art"> & { image?: string; name: string };
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative isolate overflow-hidden ${className}`} style={{ backgroundColor: item.art.bg }}>
      {item.image ? (
        <Image src={item.image} alt={item.name} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <>
          <div
            className="absolute left-1/2 top-1/2 -z-10 aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50"
            aria-hidden="true"
          />
          <ArtSvg
            art={item.art}
            className="absolute left-[6%] top-[6%] h-[88%] w-[88%] transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-rotate-2"
          />
        </>
      )}
    </div>
  );
}
