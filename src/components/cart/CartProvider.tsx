"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { activeModes, site } from "@/config/site";
import { getProduct } from "@/data/menu";
import { cartReducer, sanitizeLines } from "@/lib/cart-state";
import { computeTotals, priceLine } from "@/lib/pricing";
import type { CartLine, OrderMode, PricedLine, Selections, Totals } from "@/lib/types";

const STORAGE_KEY = "itea.cart.v1";

export interface ProductDialogTarget {
  productId: string;
  /** Ligne à modifier (sinon : nouvel ajout). */
  editLineId?: string;
}

interface CartContextValue {
  hydrated: boolean;
  lines: PricedLine[];
  count: number;
  totals: Totals;
  mode: OrderMode;
  setMode: (mode: OrderMode) => void;
  addItem: (productId: string, selections: Selections, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  replaceItem: (id: string, selections: Selections, qty: number) => void;
  clear: () => void;
  qtyOfProduct: (productId: string) => number;
  /** Interface */
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  dialog: ProductDialogTarget | null;
  openProduct: (target: ProductDialogTarget) => void;
  closeProduct: () => void;
  /** Ajout rapide (produit sans choix) ou ouverture de la personnalisation. */
  quickAdd: (productId: string) => void;
  toast: { id: number; message: string } | null;
  /** Change à chaque ajout : sert à animer l'icône du panier. */
  bump: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    lines: [],
    mode: site.ordering.defaultMode,
    hydrated: false,
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [dialog, setDialog] = useState<ProductDialogTarget | null>(null);
  const [toast, setToast] = useState<CartContextValue["toast"]>(null);
  const [bump, setBump] = useState(0);

  // Récupération du panier après le premier rendu (évite tout écart d'hydratation).
  useEffect(() => {
    let lines: CartLine[] = [];
    let mode: OrderMode = site.ordering.defaultMode;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (saved) {
        lines = sanitizeLines(saved.lines);
        if (activeModes().includes(saved.mode)) mode = saved.mode;
      }
    } catch {
      /* stockage indisponible ou corrompu : on repart d'un panier vide */
    }
    dispatch({ type: "hydrate", lines, mode });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines: state.lines, mode: state.mode }));
    } catch {
      /* quota ou navigation privée : le panier reste utilisable en mémoire */
    }
  }, [state.lines, state.mode, state.hydrated]);

  // Synchronisation entre onglets.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const saved = JSON.parse(e.newValue);
        dispatch({ type: "hydrate", lines: sanitizeLines(saved.lines), mode: activeModes().includes(saved.mode) ? saved.mode : site.ordering.defaultMode });
      } catch {
        /* ignoré */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const lines = useMemo(
    () => state.lines.map(priceLine).filter((l): l is PricedLine => l !== null),
    [state.lines],
  );
  const count = useMemo(() => lines.reduce((n, l) => n + l.line.qty, 0), [lines]);
  const totals = useMemo(
    () => computeTotals(lines.reduce((sum, l) => sum + l.lineTotal, 0), state.mode),
    [lines, state.mode],
  );

  // Verrouille le défilement de la page derrière une modale ouverte.
  useEffect(() => {
    document.body.classList.toggle("scroll-locked", cartOpen || dialog !== null);
    return () => document.body.classList.remove("scroll-locked");
  }, [cartOpen, dialog]);

  // Le toast disparaît seul.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const addItem = useCallback((productId: string, selections: Selections, qty = 1) => {
    const product = getProduct(productId);
    if (!product || !product.available) return;
    dispatch({ type: "add", productId, selections, qty });
    setBump((b) => b + 1);
    setToast({ id: Date.now(), message: `${product.name} ajouté au panier` });
  }, []);

  const quickAdd = useCallback(
    (productId: string) => {
      const product = getProduct(productId);
      if (!product || !product.available) return;
      if (product.groups.length === 0) addItem(productId, {}, 1);
      else setDialog({ productId });
    },
    [addItem],
  );

  const value: CartContextValue = {
    hydrated: state.hydrated,
    lines,
    count,
    totals,
    mode: state.mode,
    setMode: (mode) => dispatch({ type: "mode", mode }),
    addItem,
    setQty: (id, qty) => dispatch({ type: "setQty", id, qty }),
    removeItem: (id) => dispatch({ type: "remove", id }),
    replaceItem: (id, selections, qty) => {
      dispatch({ type: "replace", id, selections, qty });
      setBump((b) => b + 1);
    },
    clear: () => dispatch({ type: "clear" }),
    qtyOfProduct: (productId) => lines.filter((l) => l.line.productId === productId).reduce((n, l) => n + l.line.qty, 0),
    cartOpen,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
    dialog,
    openProduct: (target) => setDialog(target),
    closeProduct: () => setDialog(null),
    quickAdd,
    toast,
    bump,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
