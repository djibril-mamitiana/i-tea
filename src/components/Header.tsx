"use client";

import { Menu as MenuIcon, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { navLinks } from "@/lib/nav";
import { useCart } from "./cart/CartProvider";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

/** Navigation principale : collante, sobre, avec un filet qui apparaît dès que la page défile. */
export function Header() {
  const { count, totals, openCart, hydrated, bump } = useCart();
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
        className={`sticky top-0 z-40 border-b bg-cream/95 backdrop-blur-md transition-[border-color] duration-300 ${
          scrolled ? "border-line" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
          <Logo />

          <nav aria-label="Navigation principale" className="hidden items-center gap-9 lg:flex">
            {navLinks().map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[0.95rem] font-medium text-ink/85 underline-offset-[10px] transition hover:text-ink hover:underline hover:decoration-accent hover:decoration-2"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex min-h-12 items-center gap-2 rounded-lg border border-line bg-white px-3.5 font-semibold transition hover:border-ink/40 active:scale-95 sm:px-4"
              aria-label={`Ouvrir le panier${shown ? ` : ${shown} article${shown > 1 ? "s" : ""}` : ""}`}
            >
              <span key={bump} className={`relative inline-flex ${bump > 0 ? "animate-bump" : ""}`}>
                <ShoppingBag size={21} aria-hidden="true" />
                {shown > 0 && (
                  <span className="absolute -right-2.5 -top-2.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-cream">
                    {shown}
                  </span>
                )}
              </span>
              {shown > 0 && <span className="hidden text-sm sm:inline">{formatPrice(totals.subtotal)}</span>}
            </button>
            <Link href="/#carte" className="btn btn-accent hidden min-h-12 px-6 sm:inline-flex">
              Commander
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid size-12 place-items-center rounded-lg border border-line bg-white transition hover:border-ink/40 active:scale-95 lg:hidden"
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
