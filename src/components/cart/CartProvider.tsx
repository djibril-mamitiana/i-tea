"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { activeModes, site } from "@/config/site";
import { getProduct } from "@/data/menu";
import { cartReducer, sanitizeLines } from "@/lib/cart-state";
import { liveOffers, offerProgress, reconcileRewards, rewardItem, sanitizeRewards, type OfferProgress } from "@/lib/offers";
import { computeTotals, priceLine } from "@/lib/pricing";
import type { CartLine, ConfirmedOrder, OrderMode, PricedLine, RewardSelection, Selections, Totals } from "@/lib/types";
import { stateOf, unavailableMessage } from "@/lib/shop";
import { useOffers } from "../offers/OffersProvider";
import { useShop } from "../shop/ShopProvider";

const STORAGE_KEY = "itea.cart.v1";

/** Un cadeau d'offre tel qu'affiché dans le panier : gratuit, avec son libellé et son choix. */
export interface RewardLineView {
  index: number;
  item: ConfirmedOrder["items"][number];
}

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
  /** Offres : cadeaux choisis (envoyés à la commande), leur affichage, et la progression de chaque offre. */
  rewards: RewardSelection[];
  rewardLines: RewardLineView[];
  offerProgress: OfferProgress[];
  claimReward: (selection: RewardSelection) => void;
  removeReward: (index: number) => void;
  refreshOffers: () => Promise<void>;
  /** Pause des commandes en ligne décidée dans l'admin. */
  orderingPaused: boolean;
  orderingMessage: string;
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
  const { offers: allOffers, status: offersStatus, refresh } = useOffers();
  const { menu, ordering, loaded: shopLoaded } = useShop();
  // Un cadeau lié à un plat en rupture ou retiré n'est plus proposé.
  const offers = useMemo(
    () => allOffers.map((o) => ({ ...o, alternatives: o.alternatives.filter((a) => !a.productId || stateOf(menu, a.productId) === "available") })),
    [allOffers, menu],
  );
  const [state, dispatch] = useReducer(cartReducer, {
    lines: [],
    rewards: [],
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
    let rewards: RewardSelection[] = [];
    let mode: OrderMode = site.ordering.defaultMode;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (saved) {
        lines = sanitizeLines(saved.lines);
        rewards = sanitizeRewards(saved.rewards);
        if (activeModes().includes(saved.mode)) mode = saved.mode;
      }
    } catch {
      /* stockage indisponible ou corrompu : on repart d'un panier vide */
    }
    dispatch({ type: "hydrate", lines, mode, rewards });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines: state.lines, rewards: state.rewards, mode: state.mode }));
    } catch {
      /* quota ou navigation privée : le panier reste utilisable en mémoire */
    }
  }, [state.lines, state.rewards, state.mode, state.hydrated]);

  // Synchronisation entre onglets.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const saved = JSON.parse(e.newValue);
        dispatch({
          type: "hydrate",
          lines: sanitizeLines(saved.lines),
          rewards: sanitizeRewards(saved.rewards),
          mode: activeModes().includes(saved.mode) ? saved.mode : site.ordering.defaultMode,
        });
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

  // Un plat devenu indisponible (rupture ou retrait décidés dans l'admin) quitte le panier, avec un message.
  useEffect(() => {
    if (!state.hydrated || !shopLoaded) return;
    const gone = state.lines.filter((l) => stateOf(menu, l.productId) !== "available");
    if (gone.length === 0) return;
    for (const l of gone) dispatch({ type: "remove", id: l.id });
    const names = gone.map((l) => getProduct(l.productId)?.name ?? "Un plat");
    const message = `${names.join(", ")} retiré${gone.length > 1 ? "s" : ""} de ton panier : plus disponible`;
    queueMicrotask(() => setToast({ id: Date.now(), message }));
  }, [state.hydrated, state.lines, shopLoaded, menu]);

  // Offres : un cadeau ne reste dans le panier que tant que l'offre est valable et que les achats le justifient.
  const cartQty = useMemo(() => state.lines.map((l) => ({ productId: l.productId, qty: l.qty })), [state.lines]);
  useEffect(() => {
    if (!state.hydrated || offersStatus !== "ready") return;
    const kept = reconcileRewards(offers, state.rewards, cartQty, state.mode, new Date());
    if (kept.length !== state.rewards.length) dispatch({ type: "setRewards", rewards: kept });
  }, [state.hydrated, state.rewards, state.mode, offers, offersStatus, cartQty]);

  const progress = useMemo(
    () => offerProgress(liveOffers(offers, new Date()), cartQty, state.rewards, state.mode),
    [offers, cartQty, state.rewards, state.mode],
  );
  const rewardLines = useMemo<RewardLineView[]>(() => {
    const live = liveOffers(offers, new Date());
    return state.rewards.flatMap((sel, index) => {
      const offer = live.find((o) => o.id === sel.offerId);
      const alt = offer?.alternatives.find((a) => a.id === sel.alternativeId);
      if (!offer || !alt) return [];
      return [{ index, item: rewardItem(offer, alt, alt.choices.find((c) => c.id === sel.choiceId)) }];
    });
  }, [offers, state.rewards]);

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

  const addItem = useCallback(
    (productId: string, selections: Selections, qty = 1) => {
      const product = getProduct(productId);
      if (!product || !product.available) return;
      const state = stateOf(menu, productId);
      if (state !== "available") {
        setToast({ id: Date.now(), message: unavailableMessage(product.name, state) });
        return;
      }
      dispatch({ type: "add", productId, selections, qty });
      setBump((b) => b + 1);
      setToast({ id: Date.now(), message: `${product.name} ajouté au panier` });
    },
    [menu],
  );

  const quickAdd = useCallback(
    (productId: string) => {
      const product = getProduct(productId);
      if (!product || !product.available) return;
      const state = stateOf(menu, productId);
      if (state !== "available") {
        setToast({ id: Date.now(), message: unavailableMessage(product.name, state) });
        return;
      }
      if (product.groups.length === 0) addItem(productId, {}, 1);
      else setDialog({ productId });
    },
    [addItem, menu],
  );

  const value: CartContextValue = {
    hydrated: state.hydrated,
    lines,
    count,
    totals,
    mode: state.mode,
    setMode: (mode) => dispatch({ type: "mode", mode }),
    rewards: state.rewards,
    rewardLines,
    offerProgress: progress,
    claimReward: (selection) => {
      dispatch({ type: "claimReward", selection });
      setBump((b) => b + 1);
      setToast({ id: Date.now(), message: "Cadeau ajouté à ton panier" });
    },
    removeReward: (index) => dispatch({ type: "removeReward", index }),
    refreshOffers: () => refresh(true),
    orderingPaused: ordering.paused,
    orderingMessage: ordering.message,
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
