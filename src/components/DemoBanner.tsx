import { site } from "@/config/site";

/** Rappelle que la carte est fictive tant que `site.demoMode` est actif. */
export function DemoBanner() {
  if (!site.demoMode) return null;
  return (
    <div className="bg-lemon px-4 py-1.5 text-center text-xs font-semibold text-ink sm:text-sm">
      Version de démonstration : produits, prix et horaires fictifs, à remplacer par la vraie carte.
    </div>
  );
}
