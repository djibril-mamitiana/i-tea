"use client";

import { ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useCart } from "./cart/CartProvider";
import { ProductVisual } from "./ProductVisual";

export function FormulaCard({ product }: { product: Product }) {
  const { quickAdd } = useCart();
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card bg-cream text-ink shadow-pop sm:flex-row lg:flex-col">
      <ProductVisual item={product} className="aspect-[4/3] w-full shrink-0 sm:aspect-auto sm:w-2/5 lg:aspect-[4/3] lg:w-full" sizes="(min-width: 1024px) 30vw, 100vw" />
      <div className="flex flex-1 flex-col p-5">
        {product.badge && <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-text">{product.badge}</p>}
        <h3 className="text-2xl font-extrabold leading-tight">{product.name}</h3>
        <p className="mt-1 text-muted">{product.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <p className="font-display text-2xl font-extrabold">{formatPrice(product.price)}</p>
          <button type="button" onClick={() => quickAdd(product.id)} className="btn btn-accent">
            Composer
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
