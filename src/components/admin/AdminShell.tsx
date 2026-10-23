"use client";

import { ExternalLink, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Logo } from "../Logo";
import { AdminNav } from "./AdminNav";
import { OrderingControl } from "./OrderingControl";

/** Cadre commun de l'espace admin : logo, pause des commandes, lien vers le site, déconnexion, navigation. */
export function AdminShell({ children, width = "max-w-7xl" }: { children: React.ReactNode; width?: string }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    router.refresh();
  }

  return (
    <div className={`mx-auto ${width} px-4 pb-16 sm:px-6 lg:px-8`}>
      <header className="flex flex-wrap items-center justify-between gap-3 py-5">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase tracking-wider text-cream">Admin</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrderingControl />
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn min-h-11 bg-white px-4 text-sm text-ink shadow-sm hover:bg-cream"
          >
            <ExternalLink size={16} aria-hidden="true" />
            Voir le site
          </a>
          <button type="button" className="btn min-h-11 bg-ink px-4 text-sm text-cream hover:bg-ink-2" onClick={logout}>
            <LogOut size={18} aria-hidden="true" />
            Déconnexion
          </button>
        </div>
      </header>
      <AdminNav />
      {children}
    </div>
  );
}
