"use client";

import { Plus, SlidersHorizontal } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useCart } from "./cart/CartProvider";
import { Photo } from "./Photo";

/** Carte de la sélection : « large » (grande photo) ou « row » (photo carrée à gauche). */
export function SelectionCard({ product, variant, priority = false }: { product: Product; variant: "large" | "row"; priority?: boolean }) {
  const { quickAdd, qtyOfProduct, hydrated } = useCart();
  const customizable = product.groups.length > 0;
  const inCart = hydrated ? qtyOfProduct(product.id) : 0;
  const label = `Photo : ${product.name}`;

  const action = (
    <button type="button" className="btn btn-green" onClick={() => quickAdd(product.id)}>
      {customizable ? <SlidersHorizontal size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
      {customizable ? "Personnaliser" : "Ajouter"}
      {inCart > 0 && <span className="ml-1 rounded-full bg-cream/25 px-2 py-0.5 text-xs">{inCart}</span>}
    </button>
  );

  if (variant === "large") {
    return (
      <article className="group flex h-full flex-col">
        <button type="button" onClick={() => quickAdd(product.id)} className="block w-full text-left" aria-label={`${customizable ? "Personnaliser" : "Ajouter"} ${product.name}`}>
          <Photo
            src={product.image}
            alt={product.name}
            label={label}
            priority={priority}
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="aspect-[4/3] w-full rounded-lg md:aspect-[16/9] lg:aspect-square [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-[1.03]"
          />
        </button>
        <div className="mt-5 flex items-start justify-between gap-6">
          <div>
            <h3 className="font-display text-3xl font-medium leading-tight">{product.name}</h3>
            <p className="mt-1.5 max-w-md text-muted">{product.description}</p>
          </div>
          <p className="shrink-0 font-display text-2xl">{formatPrice(product.price)}</p>
        </div>
        <div className="mt-5">{action}</div>
      </article>
    );
  }

  return (
    <article className="group grid grid-cols-[7.5rem_1fr] gap-5 sm:grid-cols-[10rem_1fr] lg:grid-cols-[11rem_1fr]">
      <button type="button" onClick={() => quickAdd(product.id)} className="block text-left" aria-label={`${customizable ? "Personnaliser" : "Ajouter"} ${product.name}`}>
        <Photo
          src={product.image}
          alt={product.name}
          label={label}
          sizes="160px"
          className="aspect-square w-full rounded-lg [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-[1.04]"
        />
      </button>
      <div className="flex min-w-0 flex-col">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-medium leading-tight sm:text-2xl">{product.name}</h3>
          <p className="shrink-0 font-display text-lg sm:text-xl">{formatPrice(product.price)}</p>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted sm:text-base">{product.description}</p>
        <div className="mt-auto pt-3">{action}</div>
      </div>
    </article>
  );
}
