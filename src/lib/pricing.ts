import { site } from "../config/site.ts";
import { getProduct } from "../data/menu.ts";
import type { CartLine, OrderMode, PricedLine, Product, Selections, Totals } from "./types.ts";

/**
 * Moteur de prix UNIQUE : utilisé par le navigateur (affichage) et par le
 * serveur (validation des commandes). Ne jamais dupliquer ces règles.
 */

/** Arrondi à la précision de la devise : évite les 17,700000000000003 des flottants. */
export const roundMoney = (n: number) => {
  const f = 10 ** site.currency.decimals;
  return Math.round(n * f) / f;
};

/** Sélection par défaut d'un produit (options marquées `default`). */
export function defaultSelections(product: Product): Selections {
  const selections: Selections = {};
  for (const group of product.groups) {
    const defaults = group.options.filter((o) => o.default && o.available !== false).map((o) => o.id);
    if (defaults.length) selections[group.id] = defaults.slice(0, group.max);
  }
  return selections;
}

/** Retourne la liste des problèmes de la sélection (vide = valide). */
export function validateSelections(product: Product, selections: Selections): string[] {
  const problems: string[] = [];
  const groupIds = new Set(product.groups.map((g) => g.id));

  for (const key of Object.keys(selections)) {
    if (!groupIds.has(key)) problems.push(`Option inconnue : ${key}`);
  }

  for (const group of product.groups) {
    const chosen = selections[group.id] ?? [];
    if (new Set(chosen).size !== chosen.length) {
      problems.push(`${group.label} : choix en double`);
      continue;
    }
    if (chosen.length < group.min) {
      problems.push(group.min === 1 ? `${group.label} : choisis une option` : `${group.label} : choisis ${group.min} options`);
    }
    if (chosen.length > group.max) {
      problems.push(`${group.label} : ${group.max} option${group.max > 1 ? "s" : ""} maximum`);
    }
    for (const id of chosen) {
      const option = group.options.find((o) => o.id === id);
      if (!option) problems.push(`${group.label} : option inconnue`);
      else if (option.available === false) problems.push(`${group.label} : « ${option.label} » n'est plus disponible`);
    }
  }
  return problems;
}

export function unitPrice(product: Product, selections: Selections): number {
  let total = product.price;
  for (const group of product.groups) {
    for (const id of selections[group.id] ?? []) {
      total += group.options.find((o) => o.id === id)?.price ?? 0;
    }
  }
  return roundMoney(total);
}

export function optionLabels(product: Product, selections: Selections): string[] {
  const labels: string[] = [];
  for (const group of product.groups) {
    const chosen = selections[group.id] ?? [];
    // Les choix par défaut « neutres » (sucre 50 %, glace normale…) restent affichés :
    // le restaurant doit pouvoir préparer exactement ce qui est commandé.
    for (const id of chosen) {
      const option = group.options.find((o) => o.id === id);
      if (!option) continue;
      labels.push(group.id === "sugar" ? `Sucre ${option.label}` : option.label);
    }
  }
  return labels;
}

/** Identifiant déterministe : mêmes options = même ligne de panier. */
export function lineId(productId: string, selections: Selections): string {
  const parts = Object.keys(selections)
    .sort()
    .filter((k) => selections[k].length)
    .map((k) => `${k}=${[...selections[k]].sort().join("+")}`);
  return [productId, ...parts].join("|");
}

/** Valorise une ligne. Retourne null si le produit n'existe plus. */
export function priceLine(line: CartLine): PricedLine | null {
  const product = getProduct(line.productId);
  if (!product) return null;
  const price = unitPrice(product, line.selections);
  return {
    line,
    product,
    unitPrice: price,
    lineTotal: roundMoney(price * line.qty),
    optionLabels: optionLabels(product, line.selections),
  };
}

export function computeTotals(rawSubtotal: number, mode: OrderMode): Totals {
  const subtotal = roundMoney(rawSubtotal);
  const { delivery } = site.ordering;
  const isDelivery = mode === "delivery";
  const freeFrom = delivery.freeFrom;

  const free = isDelivery && freeFrom !== null && subtotal >= freeFrom;
  const deliveryFee = isDelivery && subtotal > 0 && !free ? delivery.fee : 0;

  return {
    subtotal,
    deliveryFee,
    total: roundMoney(subtotal + deliveryFee),
    freeDeliveryRemaining:
      isDelivery && freeFrom !== null && subtotal > 0 && !free ? roundMoney(freeFrom - subtotal) : null,
    minOrderMissing: isDelivery && subtotal > 0 && subtotal < delivery.minOrder ? roundMoney(delivery.minOrder - subtotal) : 0,
  };
}
