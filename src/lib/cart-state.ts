import { site } from "../config/site.ts";
import { getProduct } from "../data/menu.ts";
import { lineId, validateSelections } from "./pricing.ts";
import type { CartLine, OrderMode, Selections } from "./types.ts";

/** Logique pure du panier (sans React) : testable et réutilisable. */

export interface CartState {
  lines: CartLine[];
  mode: OrderMode;
  hydrated: boolean;
}

export type CartAction =
  | { type: "hydrate"; lines: CartLine[]; mode: OrderMode }
  | { type: "add"; productId: string; selections: Selections; qty: number }
  | { type: "setQty"; id: string; qty: number }
  | { type: "remove"; id: string }
  | { type: "replace"; id: string; selections: Selections; qty: number }
  | { type: "clear" }
  | { type: "mode"; mode: OrderMode };

const MAX_QTY = site.ordering.maxItemQty;
const clampQty = (n: number) => Math.max(1, Math.min(MAX_QTY, Math.floor(n)));

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return { lines: action.lines, mode: action.mode, hydrated: true };
    case "add": {
      const id = lineId(action.productId, action.selections);
      const existing = state.lines.find((l) => l.id === id);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) => (l.id === id ? { ...l, qty: clampQty(l.qty + action.qty) } : l)),
        };
      }
      const line: CartLine = { id, productId: action.productId, qty: clampQty(action.qty), selections: action.selections };
      return { ...state, lines: [...state.lines, line] };
    }
    case "setQty":
      return action.qty < 1
        ? { ...state, lines: state.lines.filter((l) => l.id !== action.id) }
        : { ...state, lines: state.lines.map((l) => (l.id === action.id ? { ...l, qty: clampQty(action.qty) } : l)) };
    case "remove":
      return { ...state, lines: state.lines.filter((l) => l.id !== action.id) };
    case "replace": {
      const old = state.lines.find((l) => l.id === action.id);
      if (!old) return state;
      const newId = lineId(old.productId, action.selections);
      const without = state.lines.filter((l) => l.id !== action.id);
      const merged = without.find((l) => l.id === newId);
      if (merged) {
        // Les nouvelles options correspondent à une autre ligne déjà présente : on fusionne.
        return { ...state, lines: without.map((l) => (l.id === newId ? { ...l, qty: clampQty(l.qty + action.qty) } : l)) };
      }
      // Sinon la ligne garde sa position d'origine.
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.id === action.id ? { id: newId, productId: l.productId, qty: clampQty(action.qty), selections: action.selections } : l,
        ),
      };
    }
    case "clear":
      return { ...state, lines: [] };
    case "mode":
      return { ...state, mode: action.mode };
  }
}

/** Ne garde du panier sauvegardé que ce qui est encore commandable (produit connu, disponible, options valides). */
export function sanitizeLines(lines: unknown): CartLine[] {
  if (!Array.isArray(lines)) return [];
  const clean: CartLine[] = [];
  for (const raw of lines) {
    if (typeof raw !== "object" || raw === null) continue;
    const { productId, qty, selections } = raw as Partial<CartLine>;
    if (typeof productId !== "string" || typeof qty !== "number" || typeof selections !== "object" || !selections) continue;
    if (!Number.isFinite(qty)) continue;
    const product = getProduct(productId);
    if (!product || !product.available) continue;
    if (validateSelections(product, selections).length) continue;
    clean.push({ id: lineId(productId, selections), productId, qty: clampQty(qty), selections });
  }
  return clean;
}
