"use client";

import { Menu as MenuIcon, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { useCart } from "./cart/CartProvider";
import { CategoryLink } from "./CategoryLink";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { useCatalog } from "./shop/ShopProvider";

/** Navigation principale : collante, translucide, avec ombre dès que la page défile. */
export function Header() {
  const { count, totals, openCart, hydrated, bump } = useCart();
  const { categories } = useCatalog();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const shown = hydrated ? count : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-[background-color,box-shadow,border-color] duration-300 ${
          scrolled ? "border-line bg-cream/95 shadow-[0_8px_24px_-18px_rgb(48_32_25_/_0.5)]" : "border-transparent bg-cream/80"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:h-[4.75rem] lg:px-8">
          <Logo priority />

          <nav aria-label="Catégories du menu" className="hidden items-center gap-0.5 xl:flex">
            {categories.map((c) => (
              <CategoryLink
                key={c.id}
                id={c.id}
                className="whitespace-nowrap rounded-full px-3 py-2 text-[0.95rem] font-semibold text-ink/80 transition hover:bg-sand hover:text-ink"
              >
                {c.name}
              </CategoryLink>
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
            <Link href="/#menu" className="btn btn-accent min-h-12 px-5 text-[0.95rem] sm:px-6">
              Commander
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid size-12 place-items-center rounded-full bg-sand transition hover:bg-line active:scale-95 xl:hidden"
              aria-label="Ouvrir le menu de navigation"
              aria-haspopup="dialog"
            >
              <MenuIcon size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
