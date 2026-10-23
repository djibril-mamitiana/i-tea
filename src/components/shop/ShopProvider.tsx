"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { categories, products } from "@/data/menu";
import { DEFAULT_ORDERING, stateOf, type MenuStatus, type OrderingState, type ProductState } from "@/lib/shop";

/**
 * État de la boutique décidé depuis l'admin : plats en rupture ou retirés du site, pause des commandes.
 * Lu sur /api/shop ; en cas d'échec, tout est considéré comme disponible (le serveur reste juge à la commande).
 */

interface ShopContextValue {
  menu: MenuStatus;
  ordering: OrderingState;
  /** Vrai une fois la première lecture terminée (réussie ou non). */
  loaded: boolean;
  stateOf: (productId: string) => ProductState;
  refresh: (force?: boolean) => Promise<void>;
}

const ShopContext = createContext<ShopContextValue | null>(null);

export function useShop(): ShopContextValue {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop doit être utilisé dans <ShopProvider>");
  return ctx;
}

const MIN_INTERVAL_MS = 15_000;
const POLL_MS = 60_000;

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ menu: MenuStatus; ordering: OrderingState; loaded: boolean }>({
    menu: {},
    ordering: DEFAULT_ORDERING,
    loaded: false,
  });
  const lastFetch = useRef(0);

  const refresh = useCallback(async (force = false) => {
    if (!force && Date.now() - lastFetch.current < MIN_INTERVAL_MS) return;
    lastFetch.current = Date.now();
    try {
      const res = await fetch("/api/shop", { cache: "no-store" });
      const json = (await res.json().catch(() => null)) as { menu?: MenuStatus; ordering?: OrderingState } | null;
      if (!res.ok || !json?.menu || !json.ordering) throw new Error("état indisponible");
      setState({ menu: json.menu, ordering: json.ordering, loaded: true });
    } catch {
      setState((prev) => (prev.loaded ? prev : { ...prev, loaded: true }));
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(() => void refresh(true), 0);
    const poll = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(first);
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const value = useMemo<ShopContextValue>(
    () => ({ ...state, stateOf: (id) => stateOf(state.menu, id), refresh }),
    [state, refresh],
  );
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

/**
 * La carte telle que la voit le client : sans les plats retirés, et sans les catégories devenues vides.
 * `isAvailable` distingue en plus les plats « en rupture » (visibles mais non commandables).
 */
export function useCatalog() {
  const { menu } = useShop();
  return useMemo(() => {
    const visible = products.filter((p) => stateOf(menu, p.id) !== "hidden");
    const visibleCategories = categories.filter((c) => visible.some((p) => p.categoryId === c.id));
    return {
      products: visible,
      categories: visibleCategories,
      byCategory: (categoryId: string) => visible.filter((p) => p.categoryId === categoryId),
      isAvailable: (productId: string) => stateOf(menu, productId) === "available",
    };
  }, [menu]);
}
