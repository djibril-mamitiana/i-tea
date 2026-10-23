"use client";

import { Plus, SlidersHorizontal } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useCart } from "./cart/CartProvider";
import { Photo } from "./Photo";
import { Stepper } from "./ui/Stepper";

/**
 * Carte de la carte : le texte d'abord (nom, description, prix), la photo seulement si elle existe.
 * Pas d'emplacement vide répété sur chaque produit.
 */
export function ProductCard({ product }: { product: Product }) {
  const { quickAdd, qtyOfProduct, lines, setQty, hydrated } = useCart();
  const customizable = product.groups.length > 0;
  const inCart = hydrated ? qtyOfProduct(product.id) : 0;
  const simpleLine = !customizable ? lines.find((l) => l.line.productId === product.id) : undefined;

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-[#fffdf8] transition duration-300 hover:border-ink/35 ${
        product.available ? "" : "opacity-65"
      }`}
    >
      {product.image && (
        <button
          type="button"
          onClick={() => quickAdd(product.id)}
          disabled={!product.available}
          className="block w-full text-left"
          aria-label={product.available ? `${customizable ? "Personnaliser" : "Ajouter"} ${product.name}` : `${product.name} — indisponible`}
        >
          <Photo
            src={product.image}
            alt={product.name}
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 33vw, 100vw"
            className="aspect-[4/3] w-full [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-[1.04]"
          />
        </button>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-medium leading-snug">{product.name}</h3>
          <p className="shrink-0 font-display text-xl">{formatPrice(product.price)}</p>
        </div>
        <p className="mt-1.5 line-clamp-3 text-[0.95rem] leading-snug text-muted">{product.description}</p>
        {product.badge && product.available && (
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent-text">{product.badge}</p>
        )}

        <div className="mt-auto pt-5">
          {!product.available ? (
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Indisponible</p>
          ) : simpleLine ? (
            <Stepper qty={simpleLine.line.qty} onChange={(q) => setQty(simpleLine.line.id, q)} label={product.name} removable size="sm" />
          ) : (
            <button type="button" className="btn btn-green w-full" onClick={() => quickAdd(product.id)}>
              {customizable ? <SlidersHorizontal size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
              {customizable ? "Personnaliser" : "Ajouter"}
              {inCart > 0 && <span className="ml-1 rounded-full bg-cream/25 px-2 py-0.5 text-xs">{inCart}</span>}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
