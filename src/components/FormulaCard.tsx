"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ArtSvg } from "./ProductArt";
import { useCart } from "./cart/CartProvider";

/** Carte de formule : grand visuel teinté, contenu lisible, prix et action. */
export function FormulaCard({ product }: { product: Product }) {
  const { quickAdd } = useCart();
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card bg-cream text-ink shadow-pop transition duration-300 hover:-translate-y-1">
      <div className="relative aspect-[5/4] overflow-hidden" style={{ backgroundColor: product.art.bg }}>
        {product.image ? (
          <Image src={product.image} alt={product.name} fill sizes="(min-width: 1024px) 30vw, 90vw" className="object-cover" />
        ) : (
          <>
            <div className="absolute left-1/2 top-1/2 aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50" aria-hidden="true" />
            <ArtSvg
              art={product.art}
              className="absolute inset-0 m-auto h-[92%] w-auto transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-rotate-2"
            />
          </>
        )}
        {product.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-ink px-3.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-cream">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-3xl font-bold leading-tight">{product.name}</h3>
        <p className="mt-2 text-muted">{product.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <p className="font-display text-3xl font-bold">{formatPrice(product.price)}</p>
          <button type="button" onClick={() => quickAdd(product.id)} className="btn btn-accent">
            Composer
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
