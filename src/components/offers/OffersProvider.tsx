"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { fallbackOffers, type Offer } from "@/lib/offers";

/**
 * Offres en vigueur, lues sur /api/offers. Si la base est injoignable, seules des annonces (sans cadeau)
 * sont affichées : le serveur ne pourrait de toute façon pas vérifier un cadeau.
 */

type Status = "loading" | "ready" | "fallback";

interface OffersContextValue {
  offers: Offer[];
  status: Status;
  /** Relit les offres (ex. à l'ouverture du panier). Ignoré s'il y a eu une lecture il y a moins de 20 s. */
  refresh: (force?: boolean) => Promise<void>;
}

const OffersContext = createContext<OffersContextValue | null>(null);

export function useOffers(): OffersContextValue {
  const ctx = useContext(OffersContext);
  if (!ctx) throw new Error("useOffers doit être utilisé dans <OffersProvider>");
  return ctx;
}

const MIN_INTERVAL_MS = 20_000;

export function OffersProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ offers: Offer[]; status: Status }>({ offers: [], status: "loading" });
  const lastFetch = useRef(0);

  const refresh = useCallback(async (force = false) => {
    if (!force && Date.now() - lastFetch.current < MIN_INTERVAL_MS) return;
    lastFetch.current = Date.now();
    try {
      const res = await fetch("/api/offers", { cache: "no-store" });
      const json = (await res.json().catch(() => null)) as { offers?: Offer[] } | null;
      if (!res.ok || !json || !Array.isArray(json.offers)) throw new Error("offres indisponibles");
      setState({ offers: json.offers, status: "ready" });
    } catch {
      setState((prev) => (prev.status === "ready" ? prev : { offers: fallbackOffers(), status: "fallback" }));
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(() => void refresh(true), 0);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(first);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const value = useMemo<OffersContextValue>(() => ({ ...state, refresh }), [state, refresh]);
  return <OffersContext.Provider value={value}>{children}</OffersContext.Provider>;
}
