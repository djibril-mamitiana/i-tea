import { products } from "../src/data/menu.ts";
import { defaultSelections, validateSelections } from "../src/lib/pricing.ts";
import type { Option, OptionGroup, Product, Selections } from "../src/lib/types.ts";

/**
 * Données de test choisies selon les caractéristiques du catalogue, jamais par nom de produit :
 * la vraie carte pourra remplacer la démo sans casser les tests.
 */

/** Produits commandables tels quels : disponibles, avec une sélection par défaut valide. */
export const orderable: Product[] = products.filter((p) => p.available && validateSelections(p, defaultSelections(p)).length === 0);

/** Un produit indisponible, s'il y en a un dans le catalogue. */
export const unavailable: Product | undefined = products.find((p) => !p.available);

export const cheapest: Product = [...orderable].sort((a, b) => a.price - b.price)[0];

export interface Variant {
  product: Product;
  group: OptionGroup;
  base: Selections;
  /** Même produit avec une autre option du groupe à choix unique. */
  alt: Selections;
  altOption: Option;
}

/** Premier produit commandable qui propose un choix unique (taille, portion, température…). */
export function findVariant(): Variant {
  for (const product of orderable) {
    const base = defaultSelections(product);
    for (const group of product.groups) {
      if (group.max !== 1) continue;
      const altOption = group.options.find((o) => o.available !== false && !(base[group.id] ?? []).includes(o.id));
      if (altOption) return { product, group, base, alt: { ...base, [group.id]: [altOption.id] }, altOption };
    }
  }
  throw new Error("Le catalogue doit contenir au moins un produit commandable avec un choix d'option unique (ex. une taille).");
}

/** Produit fictif aux prix fixes : sert à tester le moteur de prix indépendamment du catalogue. */
export const synthetic: Product = {
  id: "synthetic",
  categoryId: "test",
  name: "Produit de test",
  description: "",
  price: 5.5,
  available: true,
  art: { kind: "cup", color: "#ffffff", bg: "#ffffff" },
  groups: [
    {
      id: "size",
      label: "Taille",
      min: 1,
      max: 1,
      options: [
        { id: "m", label: "Moyenne", price: 0, default: true },
        { id: "l", label: "Grande", price: 1 },
      ],
    },
    {
      id: "extras",
      label: "Suppléments",
      min: 0,
      max: 2,
      options: [
        { id: "a", label: "Alpha", price: 0.5 },
        { id: "b", label: "Bêta", price: 0.9 },
        { id: "c", label: "Gamma", price: 0.3 },
        { id: "gone", label: "Épuisé", price: 1, available: false },
      ],
    },
    {
      id: "sauce",
      label: "Sauce",
      min: 1,
      max: 1,
      options: [
        { id: "s1", label: "Douce", price: 0 },
        { id: "s2", label: "Forte", price: 0 },
      ],
    },
  ],
};
