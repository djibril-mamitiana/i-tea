"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Commandes" },
  { href: "/admin/offres", label: "Offres" },
];

/** Navigation entre les deux parties de l'espace admin. */
export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Espace admin" className="mt-1 flex gap-2">
      {TABS.map((t) => {
        const current = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={current ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full px-5 font-bold transition ${
              current ? "bg-ink text-cream" : "bg-white text-ink hover:bg-cream"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
