import type { Category, Option, OptionGroup, Product } from "../lib/types.ts";

/**
 * ============================================================
 *  CARTE DE I TEA — DONNÉES DE DÉMONSTRATION
 *  Les produits, descriptions et prix ci-dessous sont fictifs :
 *  remplacez-les par la vraie carte (un objet par produit).
 *  Les prix sont dans la devise définie dans src/config/site.ts.
 * ============================================================
 */

/* ---------- Groupes d'options réutilisables ---------- */

const size: OptionGroup = {
  id: "size",
  label: "Taille",
  min: 1,
  max: 1,
  options: [
    { id: "m", label: "Medium", detail: "50 cl", price: 0, default: true },
    { id: "l", label: "Large", detail: "70 cl", price: 1 },
  ],
};

const sugar: OptionGroup = {
  id: "sugar",
  label: "Sucre",
  min: 1,
  max: 1,
  options: [
    { id: "0", label: "0 %", price: 0 },
    { id: "30", label: "30 %", price: 0 },
    { id: "50", label: "50 %", price: 0, default: true },
    { id: "70", label: "70 %", price: 0 },
    { id: "100", label: "100 %", price: 0 },
  ],
};

const ice: OptionGroup = {
  id: "ice",
  label: "Glace",
  min: 1,
  max: 1,
  options: [
    { id: "none", label: "Sans glace", price: 0 },
    { id: "less", label: "Peu de glace", price: 0 },
    { id: "normal", label: "Glace normale", price: 0, default: true },
  ],
};

const baseTopping: OptionGroup = {
  id: "topping",
  label: "Ta garniture",
  hint: "Incluse dans le prix",
  min: 1,
  max: 1,
  options: [
    { id: "pearls", label: "Perles de tapioca", price: 0, default: true },
    { id: "coconut-jelly", label: "Gelée coco", price: 0 },
    { id: "pop-mango", label: "Pop boba mangue", price: 0, available: false },
    { id: "none", label: "Sans garniture", price: 0 },
  ],
};

const extraToppings: OptionGroup = {
  id: "extras",
  label: "Garnitures en plus",
  hint: "Facultatif · jusqu'à 2",
  min: 0,
  max: 2,
  options: [
    { id: "pearls", label: "Perles de tapioca", price: 0.5 },
    { id: "coconut-jelly", label: "Gelée coco", price: 0.5 },
    { id: "cheese-foam", label: "Mousse fromage", price: 0.9 },
  ],
};

const snackSauce: OptionGroup = {
  id: "sauce",
  label: "Ta sauce",
  hint: "Obligatoire",
  min: 1,
  max: 1,
  options: [
    { id: "honey-chili", label: "Miel-piment", price: 0 },
    { id: "garlic", label: "Ail doux", price: 0 },
    { id: "bbq", label: "Barbecue", price: 0 },
  ],
};

const portion: OptionGroup = {
  id: "portion",
  label: "Portion",
  min: 1,
  max: 1,
  options: [
    { id: "regular", label: "Normale", price: 0, default: true },
    { id: "large", label: "Grande", detail: "à partager", price: 2.5 },
  ],
};

/** Construit un groupe de choix à partir de produits existants. */
function pickProduct(
  id: string,
  label: string,
  products: Product[],
  options: { min?: number; max?: number; hint?: string; supplements?: Record<string, number> } = {},
): OptionGroup {
  const { min = 1, max = 1, hint, supplements = {} } = options;
  return {
    id,
    label,
    hint: hint ?? (min > 0 ? "Obligatoire" : undefined),
    min,
    max,
    options: products.map<Option>((p) => ({
      id: p.id,
      label: p.name,
      price: supplements[p.id] ?? 0,
      available: p.available,
    })),
  };
}

/* ---------- Catégories ---------- */

export const categories: Category[] = [
  {
    id: "bubble-tea",
    name: "Bubble tea",
    tagline: "Thé, lait et perles",
    art: { kind: "cup", color: "#C69A6B", color2: "#8A5A36", topping: "pearls", bg: "#F6E3CC" },
  },
  {
    id: "the-fruite",
    name: "Thés fruités",
    tagline: "Frais et pétillants",
    art: { kind: "cup", color: "#FFB27A", color2: "#FF7A4D", topping: "jelly", garnish: "orange", bg: "#FFE0CC" },
  },
  {
    id: "boissons-fraiches",
    name: "Boissons fraîches",
    tagline: "Smoothies et limonades",
    art: { kind: "cup", color: "#FF8FA3", color2: "#E8537A", topping: "none", garnish: "strawberry", bg: "#FFD9E0" },
  },
  {
    id: "snacks",
    name: "Snacks",
    tagline: "Croustillants et salés",
    art: { kind: "nuggets", color: "#E7A63A", bg: "#FBE7B5" },
  },
  {
    id: "desserts",
    name: "Desserts",
    tagline: "Pour finir en douceur",
    art: { kind: "mochi", color: "#F4C6DA", color2: "#CDB8F5", bg: "#EADFFB" },
  },
  {
    id: "formules",
    name: "Formules",
    tagline: "Boisson + gourmandise",
    art: { kind: "combo", color: "#A8CF5C", color2: "#E7A63A", topping: "pearls", bg: "#E1F0C4" },
  },
];

/* ---------- Boissons ---------- */

const bubbleTeas: Product[] = [
  {
    id: "milk-tea-classique",
    categoryId: "bubble-tea",
    name: "Milk tea classique",
    description: "Thé noir corsé, lait onctueux, perles de tapioca.",
    price: 5.5,
    available: true,
    popular: true,
    art: { kind: "cup", color: "#D9B48A", color2: "#A9744A", topping: "pearls", bg: "#F6E3CC" },
    groups: [size, sugar, ice, baseTopping, extraToppings],
  },
  {
    id: "brown-sugar",
    categoryId: "bubble-tea",
    name: "Brown sugar boba",
    description: "Perles caramélisées, lait frais, sirop de sucre brun.",
    price: 6.5,
    available: true,
    popular: true,
    badge: "Signature",
    art: { kind: "cup", color: "#F3E3CF", color2: "#9B5B34", topping: "pearls", bg: "#F2D9BC" },
    groups: [size, sugar, ice, extraToppings],
  },
  {
    id: "matcha-boba",
    categoryId: "bubble-tea",
    name: "Matcha latte boba",
    description: "Matcha vert intense, lait, perles de tapioca.",
    price: 6.9,
    available: true,
    popular: true,
    art: { kind: "cup", color: "#B8D77A", color2: "#7FA83E", topping: "pearls", bg: "#E1F0C4" },
    groups: [size, sugar, ice, baseTopping, extraToppings],
  },
  {
    id: "taro",
    categoryId: "bubble-tea",
    name: "Taro milk tea",
    description: "Crème de taro violette, lait, douceur de vanille.",
    price: 6.5,
    available: true,
    art: { kind: "cup", color: "#D9C7F5", color2: "#B197E6", topping: "pearls", bg: "#EADFFB" },
    groups: [size, sugar, ice, baseTopping, extraToppings],
  },
  {
    id: "thai-tea",
    categoryId: "bubble-tea",
    name: "Thai milk tea",
    description: "Thé épicé orangé, lait concentré, perles.",
    price: 5.9,
    available: false,
    art: { kind: "cup", color: "#FFB067", color2: "#E27A2B", topping: "pearls", bg: "#FFE0CC" },
    groups: [size, sugar, ice, baseTopping],
  },
];

const fruitTeas: Product[] = [
  {
    id: "oolong-peche",
    categoryId: "the-fruite",
    name: "Oolong pêche",
    description: "Thé oolong floral, pêche juteuse, glaçons.",
    price: 5.5,
    available: true,
    popular: true,
    art: { kind: "cup", color: "#FFC59A", color2: "#FF9A6B", topping: "jelly", garnish: "orange", bg: "#FFE0CC" },
    groups: [size, sugar, ice, extraToppings],
  },
  {
    id: "litchi-rose",
    categoryId: "the-fruite",
    name: "Thé litchi rose",
    description: "Thé vert léger, litchi, pétales de rose.",
    price: 5.5,
    available: true,
    art: { kind: "cup", color: "#FFD2DC", color2: "#F59BB3", topping: "jelly", garnish: "strawberry", bg: "#FFD9E0" },
    groups: [size, sugar, ice, extraToppings],
  },
  {
    id: "passion-vert",
    categoryId: "the-fruite",
    name: "Thé vert passion",
    description: "Thé vert, fruit de la passion, gelée coco.",
    price: 5.5,
    available: true,
    art: { kind: "cup", color: "#FFE27A", color2: "#F5B731", topping: "jelly", garnish: "lemon", bg: "#FFF1B8" },
    groups: [size, sugar, ice, extraToppings],
  },
  {
    id: "ice-tea-citron",
    categoryId: "the-fruite",
    name: "Ice tea citron",
    description: "Thé noir glacé, citron frais, menthe.",
    price: 3.9,
    available: true,
    upsell: true,
    art: { kind: "cup", color: "#F2C27A", color2: "#D9903A", topping: "none", garnish: "lemon", bg: "#FFF1B8" },
    groups: [size, sugar, ice],
  },
];

const freshDrinks: Product[] = [
  {
    id: "smoothie-mangue",
    categoryId: "boissons-fraiches",
    name: "Smoothie mangue",
    description: "Mangue mûre mixée, une pointe de citron vert.",
    price: 5.9,
    available: true,
    art: { kind: "cup", color: "#FFC94D", color2: "#FF9F1C", topping: "none", garnish: "orange", bg: "#FFF1B8" },
    groups: [size, ice],
  },
  {
    id: "smoothie-fraise",
    categoryId: "boissons-fraiches",
    name: "Smoothie fraise",
    description: "Fraises mixées, yaourt, glace pilée.",
    price: 5.9,
    available: true,
    art: { kind: "cup", color: "#FF9DB1", color2: "#E8537A", topping: "none", garnish: "strawberry", bg: "#FFD9E0" },
    groups: [size, ice],
  },
  {
    id: "limonade-menthe",
    categoryId: "boissons-fraiches",
    name: "Limonade menthe",
    description: "Citron pressé, menthe fraîche, eau pétillante.",
    price: 4.2,
    available: true,
    upsell: true,
    art: { kind: "cup", color: "#E4F2A8", color2: "#B9D95A", topping: "none", garnish: "mint", bg: "#E1F0C4" },
    groups: [size, sugar, ice],
  },
];

/* ---------- Snacks ---------- */

const snacks: Product[] = [
  {
    id: "popcorn-chicken",
    categoryId: "snacks",
    name: "Popcorn chicken",
    description: "Bouchées de poulet croustillantes, sauce au choix.",
    price: 6.9,
    available: true,
    popular: true,
    art: { kind: "nuggets", color: "#E7A63A", bg: "#FBE7B5" },
    groups: [portion, snackSauce],
  },
  {
    id: "gyoza",
    categoryId: "snacks",
    name: "Gyoza poêlés",
    description: "Six raviolis dorés, farce poulet-légumes.",
    price: 5.9,
    available: true,
    art: { kind: "gyoza", color: "#F4DFB4", bg: "#FBE7B5" },
    groups: [snackSauce],
  },
  {
    id: "frites-patate-douce",
    categoryId: "snacks",
    name: "Frites de patate douce",
    description: "Dorées, légèrement salées.",
    price: 4.5,
    available: true,
    upsell: true,
    art: { kind: "fries", color: "#F0A04B", bg: "#FFE0CC" },
    groups: [portion, snackSauce],
  },
  {
    id: "bao-poulet",
    categoryId: "snacks",
    name: "Bao poulet croustillant",
    description: "Pain vapeur moelleux, poulet croustillant, sauce maison.",
    price: 6.5,
    available: true,
    art: { kind: "bao", color: "#FFF4E2", color2: "#E7A63A", bg: "#F6E3CC" },
    groups: [],
  },
];

/* ---------- Desserts ---------- */

const mochiFlavors: OptionGroup = {
  id: "flavor",
  label: "Ton parfum",
  hint: "Obligatoire",
  min: 1,
  max: 1,
  options: [
    { id: "strawberry", label: "Fraise", price: 0 },
    { id: "matcha", label: "Matcha", price: 0 },
    { id: "mango", label: "Mangue", price: 0 },
    { id: "sesame", label: "Sésame noir", price: 0, available: false },
  ],
};

const desserts: Product[] = [
  {
    id: "mochi",
    categoryId: "desserts",
    name: "Mochi glacés (3)",
    description: "Trois petites bouchées de riz fondantes et glacées.",
    price: 4.5,
    available: true,
    upsell: true,
    art: { kind: "mochi", color: "#F4C6DA", color2: "#CDB8F5", bg: "#EADFFB" },
    groups: [mochiFlavors],
  },
  {
    id: "cheesecake",
    categoryId: "desserts",
    name: "Cheesecake fruits rouges",
    description: "Crémeux, base biscuitée, coulis de fruits rouges.",
    price: 4.9,
    available: true,
    upsell: true,
    art: { kind: "cake", color: "#FFF1D6", color2: "#E8537A", bg: "#FFD9E0" },
    groups: [],
  },
  {
    id: "gaufre-bubble",
    categoryId: "desserts",
    name: "Gaufre bubble",
    description: "Gaufre à la bulle, chantilly, perles et sirop.",
    price: 5.5,
    available: true,
    art: { kind: "waffle", color: "#E8B66B", color2: "#8A5A36", bg: "#F6E3CC" },
    groups: [
      {
        id: "syrup",
        label: "Ton sirop",
        hint: "Obligatoire",
        min: 1,
        max: 1,
        options: [
          { id: "caramel", label: "Caramel", price: 0 },
          { id: "chocolate", label: "Chocolat", price: 0 },
          { id: "strawberry", label: "Fraise", price: 0 },
        ],
      },
    ],
  },
];

/* ---------- Formules ---------- */

const allDrinks = [...bubbleTeas, ...fruitTeas, ...freshDrinks];
const mainSnacks = snacks.filter((p) => p.id !== "bao-poulet");

const formulas: Product[] = [
  {
    id: "duo-bubble",
    categoryId: "formules",
    name: "Duo Bubble",
    description: "1 boisson au choix + 1 snack au choix.",
    price: 10.9,
    available: true,
    popular: true,
    badge: "Formule",
    art: { kind: "combo", color: "#D9B48A", color2: "#E7A63A", topping: "pearls", bg: "#E1F0C4" },
    groups: [
      pickProduct("drink", "Ta boisson", allDrinks, { supplements: { "matcha-boba": 0.5, "brown-sugar": 0.5 } }),
      pickProduct("snack", "Ton snack", snacks),
      sugar,
      ice,
    ],
  },
  {
    id: "formule-gourmande",
    categoryId: "formules",
    name: "Formule gourmande",
    description: "1 boisson au choix + 1 dessert au choix.",
    price: 8.9,
    available: true,
    art: { kind: "combo", color: "#F4C6DA", color2: "#CDB8F5", topping: "pearls", bg: "#EADFFB" },
    groups: [
      pickProduct("drink", "Ta boisson", allDrinks, { supplements: { "matcha-boba": 0.5, "brown-sugar": 0.5 } }),
      pickProduct("dessert", "Ton dessert", desserts),
      sugar,
      ice,
    ],
  },
  {
    id: "box-partage",
    categoryId: "formules",
    name: "Box à partager",
    description: "2 boissons + 1 snack à partager + 1 dessert.",
    price: 21.9,
    available: true,
    badge: "À deux",
    art: { kind: "combo", color: "#FFB27A", color2: "#E7A63A", topping: "pearls", bg: "#FFE0CC" },
    groups: [
      pickProduct("drinks", "Tes 2 boissons", allDrinks, {
        min: 2,
        max: 2,
        hint: "Choisis-en 2",
      }),
      pickProduct("snack", "Ton snack", mainSnacks),
      pickProduct("dessert", "Ton dessert", desserts),
    ],
  },
];

export const products: Product[] = [
  ...bubbleTeas,
  ...fruitTeas,
  ...freshDrinks,
  ...snacks,
  ...desserts,
  ...formulas,
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
