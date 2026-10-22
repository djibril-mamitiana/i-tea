"use client";

import { Bike, Store } from "lucide-react";
import { activeModes, site } from "@/config/site";
import type { OrderMode } from "@/lib/types";
import { useCart } from "./CartProvider";

const ICONS = { pickup: Store, delivery: Bike } as const;

/** Choix livraison / retrait. Masqué s'il n'existe qu'un seul mode. */
export function ModeToggle({ onDark = false, className = "" }: { onDark?: boolean; className?: string }) {
  const { mode, setMode } = useCart();
  const modes = activeModes();
  if (modes.length < 2) return null;

  return (
    <div
      role="radiogroup"
      aria-label="Mode de réception"
      className={`inline-flex rounded-full p-1 ${onDark ? "bg-white/10" : "bg-sand"} ${className}`}
    >
      {modes.map((m: OrderMode) => {
        const Icon = ICONS[m];
        const active = mode === m;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setMode(m)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-bold transition ${
              active
                ? onDark
                  ? "bg-cream text-ink shadow"
                  : "bg-ink text-cream shadow"
                : onDark
                  ? "text-cream/80 hover:text-cream"
                  : "text-ink/70 hover:text-ink"
            }`}
          >
            <Icon size={16} aria-hidden="true" />
            {site.ordering[m].label}
          </button>
        );
      })}
    </div>
  );
}
