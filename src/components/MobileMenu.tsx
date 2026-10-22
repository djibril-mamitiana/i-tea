"use client";

import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { activePayments, site } from "@/config/site";
import { categories, productsByCategory } from "@/data/menu";
import { CategoryLink } from "./CategoryLink";
import { Logo } from "./Logo";
import { OpenStatus } from "./OpenStatus";
import { Sheet } from "./ui/Sheet";

/** Menu de navigation compact pour téléphone : grandes cibles, accès direct à la commande. */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const payment = activePayments()[0];
  return (
    <Sheet open={open} onClose={onClose} variant="menu" label="Menu de navigation">
      <div className="sheet-panel max-h-[92dvh] w-full overflow-y-auto rounded-b-[2rem] bg-cream shadow-pop">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            className="grid size-12 place-items-center rounded-full bg-sand transition hover:bg-line active:scale-95"
            aria-label="Fermer le menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav aria-label="Catégories" className="px-4 pb-2 sm:px-6">
          <ul className="divide-y divide-line">
            {categories.map((c) => (
              <li key={c.id}>
                <CategoryLink
                  id={c.id}
                  onNavigate={onClose}
                  className="flex min-h-14 items-center justify-between gap-4 py-2 font-display text-2xl font-bold"
                >
                  <span>{c.name}</span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-muted">
                    {productsByCategory(c.id).length}
                    <ArrowRight size={18} aria-hidden="true" />
                  </span>
                </CategoryLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-4 px-4 pb-6 pt-4 sm:px-6">
          <Link href="/#menu" onClick={onClose} className="btn btn-accent btn-lg w-full">
            Commander maintenant
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-muted">
            <OpenStatus />
            {payment && <span>{payment.label}</span>}
          </div>
          <p className="text-sm text-muted">
            <Link href="/#infos" onClick={onClose} className="font-semibold text-ink underline underline-offset-4">
              Horaires et infos pratiques
            </Link>
            {site.contact.phone && <> · {site.contact.phone}</>}
          </p>
        </div>
      </div>
    </Sheet>
  );
}
