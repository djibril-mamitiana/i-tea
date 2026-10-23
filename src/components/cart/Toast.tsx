"use client";

import { Check } from "lucide-react";
import { useCart } from "./CartProvider";

/** Retour immédiat à chaque ajout. Annoncé aux lecteurs d'écran (aria-live). */
export function Toast() {
  const { toast, openCart, cartOpen, dialog } = useCart();
  const visible = toast && !cartOpen && !dialog;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 md:bottom-8" role="status" aria-live="polite">
      {visible && (
        <div
          key={toast.id}
          className="pointer-events-auto flex max-w-md animate-rise items-center gap-3 rounded-lg bg-ink py-2 pl-4 pr-2 text-sm font-semibold text-cream shadow-pop"
        >
          <span className="grid size-6 shrink-0 place-items-center rounded bg-gold text-ink">
            <Check size={14} strokeWidth={3.5} aria-hidden="true" />
          </span>
          <span className="truncate">{toast.message}</span>
          <button type="button" onClick={openCart} className="min-h-10 shrink-0 rounded bg-accent px-4 font-semibold text-cream hover:bg-accent-deep">
            Voir
          </button>
        </div>
      )}
    </div>
  );
}
