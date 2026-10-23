"use client";

import { Plus, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useCart } from "./cart/CartProvider";
import { ArtSvg } from "./ProductArt";

/** Carte « incontournable » : visuel en arche, titre serif, prix et action bien visibles. */
export function FeaturedCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { quickAdd, qtyOfProduct, hydrated } = useCart();
  const customizable = product.groups.length > 0;
  const inCart = hydrated ? qtyOfProduct(product.id) : 0;

  return (
    <article className="group flex h-full flex-col">
      <button
        type="button"
        onClick={() => quickAdd(product.id)}
        className="relative block w-full text-left"
        aria-label={`${customizable ? "Personnaliser" : "Ajouter"} ${product.name}`}
      >
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2rem] shadow-card transition duration-500 group-hover:shadow-pop"
          style={{ backgroundColor: product.art.bg }}
        >
          {product.image ? (
            <Image src={product.image} alt={product.name} fill sizes="(min-width: 1024px) 30vw, 70vw" priority={priority} className="object-cover" />
          ) : (
            <>
              <div className="absolute left-1/2 top-[18%] aspect-square w-[78%] -translate-x-1/2 rounded-full bg-white/45" aria-hidden="true" />
              <ArtSvg
                art={product.art}
                className="absolute bottom-[2%] left-1/2 h-[88%] w-auto -translate-x-1/2 transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:rotate-2"
              />
            </>
          )}
        </div>
        {product.badge && (
          <span className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-ink px-3.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-cream shadow">
            {product.badge}
          </span>
        )}
        {inCart > 0 && (
          <span
            className="absolute right-3 top-[26%] grid h-8 min-w-8 place-items-center rounded-full bg-accent px-2 text-sm font-extrabold text-ink shadow"
            aria-label={`${inCart} dans le panier`}
          >
            {inCart}
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col px-1 pt-5">
        <h3 className="font-display text-2xl font-bold leading-tight">{product.name}</h3>
        {product.description && <p className="mt-1.5 line-clamp-2 text-muted">{product.description}</p>}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <p className="font-display text-2xl font-bold">{formatPrice(product.price)}</p>
          <button type="button" className="btn btn-accent" onClick={() => quickAdd(product.id)}>
            {customizable ? <SlidersHorizontal size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
            {customizable ? "Personnaliser" : "Ajouter"}
          </button>
        </div>
      </div>
    </article>
  );
}
