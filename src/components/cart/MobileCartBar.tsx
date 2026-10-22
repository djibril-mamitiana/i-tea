"use client";

import { ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import { formatPrice, plural } from "@/lib/format";
import { useCart } from "./CartProvider";

/** Barre de commande fixe en bas de l'écran (mobile) dès que le panier contient quelque chose. */
export function MobileCartBar() {
  const { hydrated, count, totals, openCart, cartOpen, dialog } = useCart();
  const pathname = usePathname();
  if (!hydrated || count === 0 || cartOpen || dialog || pathname.startsWith("/commande")) return null;

  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 px-4 pt-3 md:hidden">
      <button
        type="button"
        onClick={openCart}
        className="btn btn-accent btn-lg w-full animate-rise justify-between shadow-pop"
        aria-label={`Voir le panier : ${count} ${plural(count, "article", "articles")}, ${formatPrice(totals.subtotal)}`}
      >
        <span className="flex items-center gap-3">
          <span className="relative">
            <ShoppingBag size={22} aria-hidden="true" />
            <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-ink text-[11px] font-bold text-cream">
              {count}
            </span>
          </span>
          Voir le panier
        </span>
        <span className="font-display text-lg font-extrabold">{formatPrice(totals.subtotal)}</span>
      </button>
    </div>
  );
}
