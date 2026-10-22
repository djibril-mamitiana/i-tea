import type { OrderStatus } from "./order-status.ts";

/** Types partagés entre le navigateur et le serveur. */

export type OrderMode = "pickup" | "delivery";

/** Une illustration de démonstration (remplacée par `image` dès que vous avez de vraies photos). */
export type ArtKind =
  | "cup"
  | "nuggets"
  | "fries"
  | "gyoza"
  | "bao"
  | "mochi"
  | "cake"
  | "waffle"
  | "combo";

export interface ProductArt {
  kind: ArtKind;
  /** Couleur principale du liquide / de l'aliment. */
  color: string;
  /** Couleur secondaire (dégradé du liquide, garniture…). */
  color2?: string;
  topping?: "pearls" | "jelly" | "foam" | "none";
  garnish?: "orange" | "strawberry" | "mint" | "lemon" | "none";
  /** Fond doux de la carte. */
  bg: string;
}

export interface Option {
  id: string;
  label: string;
  /** Précision affichée sous le libellé (ex. « 70 cl »). */
  detail?: string;
  /** Supplément en devise du site (0 si inclus). */
  price: number;
  /** Présélectionné à l'ouverture de la personnalisation. */
  default?: boolean;
  /** `false` = grisé et non sélectionnable (rupture). */
  available?: boolean;
}

export interface OptionGroup {
  id: string;
  label: string;
  hint?: string;
  /** Nombre minimum de choix (0 = facultatif). */
  min: number;
  /** Nombre maximum de choix (1 = choix unique). */
  max: number;
  options: Option[];
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  /** Prix de base, avant options. */
  price: number;
  available: boolean;
  /** Mis en avant dans « Les incontournables ». */
  popular?: boolean;
  /** Proposé en complément dans le panier. */
  upsell?: boolean;
  badge?: string;
  /** Chemin d'une vraie photo (ex. /products/brown-sugar.jpg). */
  image?: string;
  art: ProductArt;
  groups: OptionGroup[];
}

export interface Category {
  id: string;
  name: string;
  tagline: string;
  art: ProductArt;
}

/** Choix du client : id de groupe → ids d'options. */
export type Selections = Record<string, string[]>;

export interface CartLine {
  /** Identifiant stable : produit + options (fusionne les lignes identiques). */
  id: string;
  productId: string;
  qty: number;
  selections: Selections;
}

export interface PricedLine {
  line: CartLine;
  product: Product;
  unitPrice: number;
  lineTotal: number;
  /** Libellés lisibles des options (« Large », « Perles », …). */
  optionLabels: string[];
}

export interface Totals {
  subtotal: number;
  deliveryFee: number;
  total: number;
  /** Montant restant avant la livraison offerte (null si pas applicable). */
  freeDeliveryRemaining: number | null;
  /** Commande minimum non atteinte (livraison) : montant manquant, sinon 0. */
  minOrderMissing: number;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  address?: string;
  notes?: string;
}

export interface OrderRequest {
  mode: OrderMode;
  customer: OrderCustomer;
  items: { productId: string; qty: number; selections: Selections }[];
  paymentMethod: string;
  /** Champ piège anti-robots : doit rester vide. */
  website?: string;
}

export interface ConfirmedOrder {
  number: string;
  createdAt: string;
  mode: OrderMode;
  customer: OrderCustomer;
  paymentMethod: string;
  paymentLabel: string;
  items: {
    productId: string;
    name: string;
    qty: number;
    unitPrice: number;
    lineTotal: number;
    optionLabels: string[];
  }[];
  totals: Totals;
}

/** Commande telle qu'enregistrée en base : la commande confirmée + son suivi. */
export interface StoredOrder extends ConfirmedOrder {
  status: OrderStatus;
  updatedAt: string;
}

export type OrderApiError = {
  error: string;
  /** Erreurs de champs (clé = nom du champ). */
  fields?: Record<string, string>;
  /** Lignes devenues indisponibles ou dont le prix a changé. */
  issues?: { productId: string; message: string }[];
};
