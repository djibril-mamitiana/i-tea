"use client";

import { Plus, SlidersHorizontal } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useCart } from "./cart/CartProvider";
import { useCatalog } from "./shop/ShopProvider";
import { ProductVisual } from "./ProductVisual";
import { Stepper } from "./ui/Stepper";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { quickAdd, qtyOfProduct, lines, setQty, hydrated } = useCart();
  const { isAvailable } = useCatalog();
  const available = product.available && isAvailable(product.id);
  const customizable = product.groups.length > 0;
  const inCart = hydrated ? qtyOfProduct(product.id) : 0;
  const simpleLine = !customizable ? lines.find((l) => l.line.productId === product.id) : undefined;

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-card bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-pop ${
        available ? "" : "opacity-70"
      }`}
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => quickAdd(product.id)}
          disabled={!available}
          className="block w-full text-left"
          aria-label={available ? `${customizable ? "Personnaliser" : "Ajouter"} ${product.name}` : `${product.name} — indisponible`}
        >
          <ProductVisual item={product} className="aspect-square w-full" priority={priority} />
        </button>
        {product.badge && available && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase tracking-wide text-cream">
            {product.badge}
          </span>
        )}
        {!available && (
          <span className="pointer-events-none absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full bg-ink px-4 py-1.5 text-sm font-bold text-cream">
            Indisponible
          </span>
        )}
        {inCart > 0 && (
          <span
            className="pointer-events-none absolute right-3 top-3 grid h-7 min-w-7 place-items-center rounded-full bg-accent px-2 text-sm font-bold text-ink shadow"
            aria-label={`${inCart} dans le panier`}
          >
            {inCart}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-lg font-bold leading-tight">{product.name}</h3>
        {product.description && <p className="line-clamp-2 text-sm leading-snug text-muted">{product.description}</p>}

        <div className="mt-auto flex flex-col gap-3 pt-3">
          <p className="font-display text-xl font-extrabold">{formatPrice(product.price)}</p>

          {!available ? (
            <button type="button" className="btn btn-ink w-full" disabled>
              Indisponible
            </button>
          ) : simpleLine ? (
            <div className="flex justify-center">
              <Stepper
                qty={simpleLine.line.qty}
                onChange={(q) => setQty(simpleLine.line.id, q)}
                label={product.name}
                removable
                size="sm"
              />
            </div>
          ) : (
            <button type="button" className="btn btn-accent w-full" onClick={() => quickAdd(product.id)}>
              {customizable ? <SlidersHorizontal size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
              {customizable ? "Personnaliser" : "Ajouter"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
