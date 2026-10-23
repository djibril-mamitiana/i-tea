import type { Category, OptionGroup, Product } from "../lib/types.ts";

/**
 * ============================================================
 *  CARTE DE I TEA — DONNÉES DE DÉMONSTRATION
 *  Les plats, descriptions et prix ci-dessous sont des EXEMPLES
 *  à remplacer par la vraie carte du restaurant (un objet par
 *  produit). Aucune photo n'est fournie : ajoutez `image` pour
 *  afficher une vraie photo (voir PHOTOS_A_FOURNIR.md).
 *  Les prix sont dans la devise définie dans src/config/site.ts.
 * ============================================================
 */

/* ---------- Groupes d'options réutilisables ---------- */

const portion: OptionGroup = {
  id: "portion",
  label: "Portion",
  min: 1,
  max: 1,
  options: [
    { id: "normale", label: "Normale", price: 0, default: true },
    { id: "grande", label: "Grande", price: 2.5 },
  ],
};

const spice: OptionGroup = {
  id: "spice",
  label: "Piment",
  min: 1,
  max: 1,
  options: [
    { id: "sans", label: "Sans piment", price: 0 },
    { id: "doux", label: "Doux", price: 0, default: true },
    { id: "fort", label: "Fort", price: 0 },
  ],
};

const phoExtras: OptionGroup = {
  id: "extras",
  label: "Suppléments",
  hint: "Facultatif · jusqu'à 3",
  min: 0,
  max: 3,
  options: [
    { id: "boeuf", label: "Bœuf supplémentaire", price: 3 },
    { id: "oeuf", label: "Œuf", price: 1.5 },
    { id: "herbes", label: "Herbes fraîches en plus", price: 0.5 },
  ],
};

const dippingSauce: OptionGroup = {
  id: "sauce",
  label: "Sauce",
  hint: "Obligatoire",
  min: 1,
  max: 1,
  options: [
    { id: "nuoc-cham", label: "Nước chấm", price: 0 },
    { id: "cacahuetes", label: "Sauce aux cacahuètes", price: 0 },
    { id: "piquante", label: "Sauce piquante", price: 0 },
  ],
};

const sandwichFilling: OptionGroup = {
  id: "filling",
  label: "Garniture",
  hint: "Obligatoire",
  min: 1,
  max: 1,
  options: [
    { id: "poulet", label: "Poulet", price: 0 },
    { id: "porc", label: "Porc", price: 0 },
    { id: "vegetarien", label: "Végétarien", price: 0 },
  ],
};

const temperature: OptionGroup = {
  id: "temperature",
  label: "Température",
  min: 1,
  max: 1,
  options: [
    { id: "chaud", label: "Chaud", price: 0, default: true },
    { id: "glace", label: "Glacé", price: 0 },
  ],
};

const sugar: OptionGroup = {
  id: "sugar",
  label: "Sucre",
  min: 1,
  max: 1,
  options: [
    { id: "sans", label: "Sans sucre", price: 0 },
    { id: "leger", label: "Léger", price: 0, default: true },
    { id: "normal", label: "Normal", price: 0 },
  ],
};

const drinkSize: OptionGroup = {
  id: "size",
  label: "Taille",
  min: 1,
  max: 1,
  options: [
    { id: "m", label: "Moyenne", detail: "35 cl", price: 0, default: true },
    { id: "l", label: "Grande", detail: "50 cl", price: 1 },
  ],
};

const coffeeExtra: OptionGroup = {
  id: "side",
  label: "Accompagnement",
  hint: "Facultatif",
  min: 0,
  max: 1,
  options: [{ id: "cafe", label: "Filet de café", price: 0.5 }],
};

/* ---------- Catégories ---------- */

export const categories: Category[] = [
  { id: "cuisine", name: "Cuisine vietnamienne", tagline: "Plats et en-cas" },
  { id: "boissons", name: "Thés et boissons", tagline: "Chaud ou glacé" },
  { id: "desserts", name: "Desserts", tagline: "Douceurs de fin de repas" },
];

/* ---------- Produits (exemples) ---------- */

export const products: Product[] = [
  {
    id: "pho-bo",
    categoryId: "cuisine",
    name: "Phở bò",
    description: "Soupe de nouilles de riz au bœuf, herbes fraîches.",
    price: 13.5,
    available: true,
    featured: true,
    groups: [portion, spice, phoExtras],
  },
  {
    id: "bun-cha",
    categoryId: "cuisine",
    name: "Bún chả",
    description: "Nouilles de riz, porc grillé, herbes et sauce à tremper.",
    price: 13,
    available: true,
    featured: true,
    groups: [portion, spice],
  },
  {
    id: "goi-cuon",
    categoryId: "cuisine",
    name: "Gỏi cuốn (3 rouleaux)",
    description: "Rouleaux frais aux crevettes et aux herbes, sauce à tremper.",
    price: 6.5,
    available: true,
    featured: true,
    upsell: true,
    groups: [dippingSauce],
  },
  {
    id: "banh-mi",
    categoryId: "cuisine",
    name: "Bánh mì",
    description: "Sandwich vietnamien garni, herbes et légumes marinés.",
    price: 7.5,
    available: true,
    groups: [sandwichFilling, spice],
  },
  {
    id: "nem",
    categoryId: "cuisine",
    name: "Nems (4 pièces)",
    description: "Nems croustillants servis avec salade, herbes et sauce.",
    price: 6,
    available: true,
    upsell: true,
    groups: [dippingSauce],
  },
  {
    id: "bo-bun",
    categoryId: "cuisine",
    name: "Bò bún",
    description: "Vermicelles de riz, bœuf sauté, herbes et cacahuètes.",
    price: 13.5,
    available: false,
    groups: [portion, spice],
  },

  {
    id: "the-jasmin",
    categoryId: "boissons",
    name: "Thé au jasmin",
    description: "Thé parfumé, servi chaud ou glacé.",
    price: 3.5,
    available: true,
    upsell: true,
    groups: [temperature, sugar],
  },
  {
    id: "the-glace-citron",
    categoryId: "boissons",
    name: "Thé glacé au citron",
    description: "Thé noir glacé, citron, légèrement sucré.",
    price: 4,
    available: true,
    groups: [drinkSize, sugar],
  },
  {
    id: "ca-phe-sua-da",
    categoryId: "boissons",
    name: "Cà phê sữa đá",
    description: "Café vietnamien au lait concentré, servi sur glace.",
    price: 4.5,
    available: true,
    featured: true,
    groups: [drinkSize],
  },
  {
    id: "infusion-gingembre",
    categoryId: "boissons",
    name: "Infusion gingembre et miel",
    description: "Infusion chaude au gingembre, adoucie au miel.",
    price: 3.8,
    available: true,
    groups: [],
  },

  {
    id: "che-ba-mau",
    categoryId: "desserts",
    name: "Chè ba màu",
    description: "Dessert vietnamien aux trois couleurs, lait de coco et glace pilée.",
    price: 5.5,
    available: true,
    upsell: true,
    groups: [],
  },
  {
    id: "banh-flan",
    categoryId: "desserts",
    name: "Bánh flan",
    description: "Flan au caramel, texture fondante.",
    price: 4.5,
    available: true,
    upsell: true,
    groups: [coffeeExtra],
  },
  {
    id: "che-chuoi",
    categoryId: "desserts",
    name: "Chè chuối",
    description: "Banane mijotée au lait de coco et aux graines de sésame.",
    price: 5,
    available: true,
    groups: [],
  },
];

const productIndex = new Map(products.map((p) => [p.id, p]));
const categoryIndex = new Map(categories.map((c) => [c.id, c]));

export function getProduct(id: string): Product | undefined {
  return productIndex.get(id);
}

export function getCategory(id: string): Category | undefined {
  return categoryIndex.get(id);
}

export function productsByCategory(categoryId: string): Product[] {
  return products.filter((p) => p.categoryId === categoryId);
}
