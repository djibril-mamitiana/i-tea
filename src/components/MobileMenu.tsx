"use client";

import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { activePayments, site } from "@/config/site";
import { navLinks } from "@/lib/nav";
import { Logo } from "./Logo";
import { OpenStatus } from "./OpenStatus";
import { Sheet } from "./ui/Sheet";

/** Menu de navigation compact pour téléphone : grandes cibles, accès direct à la commande. */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const payment = activePayments()[0];
  return (
    <Sheet open={open} onClose={onClose} variant="menu" label="Menu de navigation">
      <div className="sheet-panel max-h-[92dvh] w-full overflow-y-auto rounded-b-lg bg-cream shadow-pop">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <Logo descriptor={false} />
          <button
            type="button"
            onClick={onClose}
            className="grid size-12 place-items-center rounded-lg border border-line bg-white transition hover:border-ink/40 active:scale-95"
            aria-label="Fermer le menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav aria-label="Navigation principale" className="px-4 pb-2 sm:px-6">
          <ul className="divide-y divide-line border-t border-line">
            {navLinks().map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={onClose} className="flex min-h-16 items-center justify-between gap-4 font-display text-3xl font-medium">
                  {l.label}
                  <ArrowRight size={20} className="text-accent" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-4 px-4 pb-6 pt-4 sm:px-6">
          <Link href="/#carte" onClick={onClose} className="btn btn-accent btn-lg w-full">
            Commander
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-muted">
            <OpenStatus />
            {payment && <span>{payment.label}</span>}
          </div>
          {site.contact.phone && <p className="text-sm text-muted">{site.contact.phone}</p>}
        </div>
      </div>
    </Sheet>
  );
}
