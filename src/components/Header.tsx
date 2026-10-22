"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { categories } from "@/data/menu";
import { formatPrice } from "@/lib/format";
import { useCart } from "./cart/CartProvider";
import { Logo } from "./Logo";

export function Header() {
  const { count, totals, openCart, hydrated, bump } = useCart();
  const shown = hydrated ? count : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:h-20 lg:px-8">
        <Logo />

        <nav aria-label="Catégories du menu" className="hidden items-center gap-1 xl:flex">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/#cat-${c.id}`}
              className="whitespace-nowrap rounded-full px-3 py-2 text-[0.95rem] font-semibold text-ink/80 transition hover:bg-sand hover:text-ink"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex min-h-12 items-center gap-2 rounded-full bg-sand px-3.5 font-bold transition hover:bg-line active:scale-95 sm:px-4"
            aria-label={`Ouvrir le panier${shown ? ` : ${shown} article${shown > 1 ? "s" : ""}` : ""}`}
          >
            <span key={bump} className={`relative inline-flex ${bump > 0 ? "animate-bump" : ""}`}>
              <ShoppingBag size={22} aria-hidden="true" />
              {shown > 0 && (
                <span className="absolute -right-2.5 -top-2.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-extrabold text-ink">
                  {shown}
                </span>
              )}
            </span>
            {shown > 0 && <span className="hidden text-sm sm:inline">{formatPrice(totals.subtotal)}</span>}
          </button>
          <Link href="/#menu" className="btn btn-accent min-h-12 px-4 text-[0.95rem] sm:px-6">
            Commander
          </Link>
        </div>
      </div>
    </header>
  );
}
