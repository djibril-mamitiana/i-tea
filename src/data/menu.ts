import type { Category, OptionGroup, Product, ProductArt } from "../lib/types.ts";

/**
 * ============================================================
 *  CARTE DE I TEA
 *  Noms et prix repris de la carte papier fournie par I TEA.
 *  Les descriptions se limitent à ce qui est écrit sur la carte.
 *  Les illustrations (champ `art`) sont génériques : ajoutez `image`
 *  (chemin d'une vraie photo) sur un produit pour la remplacer.
 *  Les prix sont dans la devise définie dans src/config/site.ts.
 * ============================================================
 */

/* ---------- Illustrations (couleurs de fond des cartes) ---------- */

const BG = { sand: "#F3DFC6", peach: "#F8D9C4", pink: "#FBDCE3", lemon: "#F6E6BE", matcha: "#DDE8D3", gold: "#F6E1B0", coffee: "#EADBC8" };

const cup = (color: string, color2: string, bg: string, extra: Partial<ProductArt> = {}): ProductArt => ({ kind: "cup", color, color2, bg, ...extra });
const bowl = (variant: NonNullable<ProductArt["variant"]>, color: string, bg: string): ProductArt => ({ kind: "bowl", variant, color, bg });

/* ---------- Groupes d'options réutilisables ---------- */

/** Fruit tea et milk tea : 500 ml ou 700 ml (+1 €). */
const teaSize: OptionGroup = {
  id: "size",
  label: "Taille",
  min: 1,
  max: 1,
  options: [
    { id: "500", label: "500 ml", price: 0, default: true },
    { id: "700", label: "700 ml", price: 1 },
  ],
};

/** Toppings : +0,50 € chacun. */
const toppings: OptionGroup = {
  id: "toppings",
  label: "Toppings",
  hint: "Facultatif · +0,50 € chacun",
  min: 0,
  max: 8,
  options: [
    { id: "perles-tapioca", label: "Perles de tapioca", price: 0.5 },
    { id: "popping-litchi", label: "Popping litchi", price: 0.5 },
    { id: "popping-passion", label: "Popping passion", price: 0.5 },
    { id: "popping-peche", label: "Popping pêche", price: 0.5 },
    { id: "popping-mangue", label: "Popping mangue", price: 0.5 },
    { id: "oreo", label: "Oreo", price: 0.5 },
    { id: "caramel", label: "Caramel", price: 0.5 },
    { id: "morceaux-mangue", label: "Morceaux de mangue", price: 0.5 },
  ],
};

/** Crèmes : +1 €. */
const creams: OptionGroup = {
  id: "cream",
  label: "Crèmes",
  hint: "Facultatif · +1,00 €",
  min: 0,
  max: 3,
  options: [
    { id: "creme-oeufs", label: "Crème aux œufs", price: 1 },
    { id: "creme-salee", label: "Crème salée", price: 1 },
    { id: "creme-matcha", label: "Crème matcha", price: 1 },
  ],
};

const crousty: OptionGroup = {
  id: "size",
  label: "Taille",
  min: 1,
  max: 1,
  options: [
    { id: "m", label: "Taille M", price: 0, default: true },
    { id: "l", label: "Taille L", price: 2 },
  ],
};

const boBunChoice: OptionGroup = {
  id: "protein",
  label: "Ton choix",
  hint: "Obligatoire",
  min: 1,
  max: 1,
  options: [
    { id: "crevettes", label: "Crevettes", price: 0 },
    { id: "boeuf", label: "Bœuf", price: 0 },
  ],
};

const teaFlavor: OptionGroup = {
  id: "flavor",
  label: "Ton thé",
  hint: "Obligatoire",
  min: 1,
  max: 1,
  options: [
    { id: "jasmin", label: "Jasmin", price: 0 },
    { id: "citron", label: "Citron", price: 0 },
    { id: "lipton", label: "Lipton", price: 0 },
    { id: "menthe", label: "Menthe", price: 0 },
  ],
};

/** Parfums du taiyaki, tels qu'écrits sur l'affiche du restaurant. */
const taiyakiFlavor: OptionGroup = {
  id: "flavor",
  label: "Ton parfum",
  hint: "Obligatoire",
  min: 1,
  max: 1,
  options: [
    { id: "nutella", label: "Nutella", price: 0 },
    { id: "vanille", label: "Vanille", price: 0 },
    { id: "chocolat", label: "Chocolat", price: 0 },
    { id: "fruits-rouges", label: "Fruits rouges", price: 0 },
    { id: "haricot-rouge", label: "Haricot rouge", price: 0 },
  ],
};

/** Parfums du bubble waffle : ceux du taiyaki + Oreo et Biscoff (affiche du restaurant). */
const waffleFlavor: OptionGroup = {
  ...taiyakiFlavor,
  options: [
    ...taiyakiFlavor.options,
    { id: "oreo", label: "Oreo", price: 0 },
    { id: "biscoff", label: "Biscoff", price: 0 },
  ],
};

/** Nems : porc, poulet ou végé, au même prix (affiche du restaurant). */
const nemsFilling: OptionGroup = {
  id: "filling",
  label: "Ta garniture",
  hint: "Obligatoire",
  min: 1,
  max: 1,
  options: [
    { id: "porc", label: "Porc", price: 0 },
    { id: "poulet", label: "Poulet", price: 0 },
    { id: "vege", label: "Végé", price: 0 },
  ],
};

const taiyakiCount: OptionGroup = {
  id: "pieces",
  label: "Nombre de pièces",
  min: 1,
  max: 1,
  options: [
    { id: "3", label: "3 pièces", price: 0, default: true },
    { id: "4", label: "4 pièces", price: 2 },
  ],
};

const waffleFormula: OptionGroup = {
  id: "formula",
  label: "Formule",
  min: 1,
  max: 1,
  options: [
    { id: "choix", label: "Au choix", price: 0, default: true },
    { id: "glaces", label: "Avec glaces", detail: "3 boules", price: 2 },
  ],
};

/* ---------- Catégories (dans l'ordre de la carte papier) ---------- */

export const categories: Category[] = [
  { id: "entrees", image: "/products/nems.jpg", name: "Entrées", tagline: "Pour commencer", art: { kind: "rolls", color: "#E7A63A", bg: BG.gold } },
  { id: "plats", image: "/products/soupe-pho.jpg", name: "Plats", tagline: "Nouilles, riz, sandwichs, bò bún, phở", art: bowl("soup", "#E8B25C", BG.peach) },
  { id: "desserts", image: "/products/perles-coco.jpg", name: "Desserts", tagline: "Pour finir en douceur", art: { kind: "mochi", color: "#F4C6DA", color2: "#CDB8F5", bg: BG.pink } },
  { id: "bubble-tea", image: "/products/the-au-lait.jpg", name: "Bubble tea", tagline: "Fruit tea et milk tea", art: cup("#C69A6B", "#8A5A36", BG.sand, { topping: "pearls" }) },
  { id: "matcha", image: "/products/matcha-latte.jpg", name: "Matcha & Special series", shortName: "Matcha", tagline: "Matcha, taro et cacao", art: cup("#B8D77A", "#7FA83E", BG.matcha, { topping: "pearls" }) },
  { id: "cafe", image: "/products/cafe-vietnamien-creme-salee.jpg", name: "Cafés", tagline: "De l'expresso au café vietnamien", art: cup("#C9A27A", "#6B4630", BG.coffee, { topping: "foam" }) },
  { id: "gourmandises", image: "/products/taiyaki.jpg", name: "Gourmandises", tagline: "Taiyaki et bubble waffle", art: { kind: "taiyaki", color: "#E8B66B", color2: "#9B5B34", bg: BG.gold } },
  { id: "boissons", name: "Boissons", tagline: "Sodas, thés, bières et autres", art: { kind: "can", color: "#F28C28", color2: "#FFF4E2", bg: BG.matcha } },
];

/* ---------- Entrées ---------- */

const entrees: Product[] = [
  { id: "salade-maison", categoryId: "entrees", name: "Salade maison", description: "", price: 6.5, available: true, art: bowl("salad", "#6FB35F", BG.matcha), groups: [] },
  { id: "tempura", categoryId: "entrees", name: "Tempura", description: "3 pièces", price: 6, available: true, image: "/products/tempura.jpg", art: { kind: "nuggets", color: "#EBB458", bg: BG.gold }, groups: [] },
  { id: "nems", categoryId: "entrees", name: "Nems", description: "3 pièces · porc, poulet ou végé", price: 5.5, available: true, popular: true, image: "/products/nems.jpg", art: { kind: "rolls", color: "#E7A63A", bg: BG.gold }, groups: [nemsFilling] },
  { id: "raviolis-vapeur", categoryId: "entrees", name: "Raviolis vapeurs", description: "5 pièces", price: 5.5, available: true, art: { kind: "gyoza", color: "#F4DFB4", bg: BG.gold }, groups: [] },
  { id: "crepes-vietnamiennes", categoryId: "entrees", name: "Crêpes vietnamiennes", description: "", price: 6.5, available: true, art: { kind: "gyoza", color: "#F2CF6B", bg: BG.lemon }, groups: [] },
  { id: "rouleau-printemps", categoryId: "entrees", name: "Rouleau de printemps", description: "1 pièce", price: 2.9, available: true, upsell: true, art: { kind: "rolls", color: "#F7EAD0", color2: "#C0392B", bg: BG.matcha }, groups: [] },
  { id: "assortiment-fritures", categoryId: "entrees", name: "Assortiment de fritures", description: "6 pièces", price: 9.5, available: true, art: { kind: "nuggets", color: "#E7A63A", bg: BG.gold }, groups: [] },
  { id: "gyozas", categoryId: "entrees", name: "Gyozas", description: "5 pièces", price: 5.5, available: true, image: "/products/gyozas.jpg", art: { kind: "gyoza", color: "#F4DFB4", bg: BG.gold }, groups: [] },
];

/* ---------- Plats ---------- */

const plats: Product[] = [
  { id: "plat-crousty", categoryId: "plats", name: "Plat crousty", description: "Taille M ou L", price: 8, available: true, art: { kind: "nuggets", color: "#E7A63A", bg: BG.gold }, groups: [crousty] },
  { id: "nouilles-legumes", categoryId: "plats", name: "Nouilles sautées aux légumes", description: "", price: 9.5, available: true, image: "/products/nouilles-legumes.jpg", art: bowl("noodles", "#E8B25C", BG.peach), groups: [] },
  { id: "nouilles-boeuf", categoryId: "plats", name: "Nouilles sautées au bœuf", description: "Nouilles sautées, bœuf et légumes croquants", price: 11.5, available: true, image: "/products/nouilles-boeuf.jpg", art: bowl("noodles", "#D99A4E", BG.peach), groups: [] },
  { id: "riz-poulet", categoryId: "plats", name: "Riz au poulet grillé", description: "", price: 12.5, available: true, image: "/products/riz-poulet.jpg", art: bowl("rice", "#C98B4A", BG.lemon), groups: [] },
  { id: "riz-boeuf", categoryId: "plats", name: "Riz au bœuf sauté", description: "", price: 13.5, available: true, art: bowl("rice", "#8A4B2D", BG.lemon), groups: [] },
  { id: "riz-blanc", categoryId: "plats", name: "Riz blanc", description: "", price: 3.5, available: true, art: bowl("rice", "#FFFDF8", BG.lemon), groups: [] },
  { id: "sandwich-poulet", categoryId: "plats", name: "Sandwich au poulet grillé", description: "", price: 7, available: true, art: { kind: "sandwich", color: "#E8C07A", color2: "#C98B4A", bg: BG.sand }, groups: [] },
  { id: "sandwich-boeuf", categoryId: "plats", name: "Sandwich au bœuf sauté", description: "", price: 7.5, available: true, art: { kind: "sandwich", color: "#E8C07A", color2: "#8A4B2D", bg: BG.sand }, groups: [] },
  { id: "sandwich-vege", categoryId: "plats", name: "Sandwich végé", description: "", price: 6.2, available: true, art: { kind: "sandwich", color: "#E8C07A", color2: "#7BC27F", bg: BG.sand }, groups: [] },
  { id: "bibimbap", categoryId: "plats", name: "Bibimbap", description: "Un bol généreux de riz, de légumes et de garnitures savoureuses", badge: "Signature", price: 14, available: true, image: "/products/bibimbap.jpg", art: bowl("bibimbap", "#FFF4E2", BG.peach), groups: [] },
  { id: "bo-bun-poulet", categoryId: "plats", name: "Bò bún poulet", description: "Des vermicelles, des légumes frais et 2 nems croustillants", badge: "Signature", price: 12.5, available: true, popular: true, image: "/products/bo-bun-poulet.jpg", art: bowl("noodles", "#F4E6C4", BG.matcha), groups: [] },
  { id: "bo-bun-crevettes-boeuf", categoryId: "plats", name: "Bò bún crevettes ou bœuf", description: "Des vermicelles, des légumes frais et 2 nems croustillants", badge: "Signature", price: 13.5, available: true, image: "/products/bo-bun-boeuf.jpg", art: bowl("noodles", "#F4E6C4", BG.matcha), groups: [boBunChoice] },
  { id: "bo-bun-vege", categoryId: "plats", name: "Bò bún végé", description: "Des vermicelles, des légumes frais et 2 nems croustillants", badge: "Signature", price: 10.5, available: true, art: bowl("noodles", "#F4E6C4", BG.matcha), groups: [] },
  { id: "soupe-pho", categoryId: "plats", name: "Soupe phở", description: "Un bouillon parfumé de nouilles fondantes et de belles saveurs vietnamiennes", badge: "Signature", price: 14.5, available: true, popular: true, image: "/products/soupe-pho.jpg", art: bowl("soup", "#E8B25C", BG.peach), groups: [] },
];

/* ---------- Desserts ---------- */

const desserts: Product[] = [
  { id: "litchis", categoryId: "desserts", name: "Litchis", description: "6 pièces", price: 4, available: true, art: { kind: "mochi", color: "#FFF4EA", color2: "#F4C6DA", bg: BG.pink }, groups: [] },
  { id: "perles-coco", categoryId: "desserts", name: "Perles de coco", description: "2 pièces", price: 3.5, available: true, upsell: true, image: "/products/perles-coco.jpg", art: { kind: "mochi", color: "#FFF4EA", color2: "#EFE2CC", bg: BG.sand }, groups: [] },
  { id: "nougat-sesame", categoryId: "desserts", name: "Nougat au sésame", description: "", price: 4.5, available: true, art: { kind: "mochi", color: "#E8B66B", color2: "#C58A50", bg: BG.gold }, groups: [] },
  { id: "tapioca-mangue-banane", categoryId: "desserts", name: "Tapioca mangue / banane / fruit du jacquier", description: "", price: 4.5, available: true, art: cup("#FFD66B", "#F5A623", BG.lemon, { topping: "pearls", garnish: "orange" }), groups: [] },
  { id: "dessert-3-couleurs", categoryId: "desserts", name: "Dessert vietnamien 3 couleurs", description: "", price: 4.5, available: true, art: cup("#8FD18C", "#E8537A", BG.matcha, { topping: "jelly" }), groups: [] },
  { id: "pudding-soja", categoryId: "desserts", name: "Pudding de soja singapourien", description: "Perles de tapioca, pêche, litchi, fruit de la passion, mangue et fruit du jacquier", price: 4.5, available: true, art: { kind: "cake", color: "#FFF1D6", color2: "#C58A50", bg: BG.sand }, groups: [] },
];

/* ---------- Bubble tea : fruit tea et milk tea (500 ml 6 €, 700 ml 7 €) ---------- */

const drinkGroups = [teaSize, toppings, creams];
const SIZES = "500 ml ou 700 ml";

const bubbleTeas: Product[] = [
  { id: "peach-ice-tea", categoryId: "bubble-tea", name: "Peach ice tea", description: `Fruit tea · ${SIZES}`, price: 6, available: true, art: cup("#FFC59A", "#FF9A6B", BG.peach, { topping: "jelly", garnish: "orange" }), groups: drinkGroups },
  { id: "lychee-ice-tea", categoryId: "bubble-tea", name: "Lychee ice tea", description: `Fruit tea · ${SIZES}`, price: 6, available: true, art: cup("#FFD2DC", "#F59BB3", BG.pink, { topping: "jelly" }), groups: drinkGroups },
  { id: "passion-fruit-tea", categoryId: "bubble-tea", name: "Passion fruit tea", description: `Thé noir, fruit de la passion, popping · ${SIZES}`, price: 6, available: true, art: cup("#FFE27A", "#F5B731", BG.lemon, { topping: "jelly", garnish: "lemon" }), groups: drinkGroups },
  { id: "mango-ice-tea", categoryId: "bubble-tea", name: "Mango ice tea", description: `Fruit tea · ${SIZES}`, price: 6, available: true, art: cup("#FFC94D", "#FF9F1C", BG.lemon, { topping: "jelly" }), groups: drinkGroups },
  { id: "strawberry-tea", categoryId: "bubble-tea", name: "Strawberry tea", description: `Fruit tea · ${SIZES}`, price: 6, available: true, art: cup("#FF9DB1", "#E8537A", BG.pink, { topping: "jelly", garnish: "strawberry" }), groups: drinkGroups },
  { id: "the-au-lait", categoryId: "bubble-tea", name: "Thé au lait", description: `Milk tea, perles de tapioca · ${SIZES}`, price: 6, available: true, popular: true, image: "/products/the-au-lait.jpg", art: cup("#D9B48A", "#A9744A", BG.sand, { topping: "pearls" }), groups: drinkGroups },
  { id: "brown-sugar", categoryId: "bubble-tea", name: "Brown sugar", description: `Milk tea, perles de tapioca · ${SIZES}`, price: 6, available: true, art: cup("#F6E7D3", "#A9693A", "#EACBA3", { topping: "pearls", streaks: true }), groups: drinkGroups },
];

/* ---------- Matcha et Special series (7 €) ---------- */

const matchaGroups = [toppings, creams];

const matchas: Product[] = [
  { id: "matcha-latte", categoryId: "matcha", name: "Matcha latte", description: "", price: 7, available: true, popular: true, image: "/products/matcha-latte.jpg", art: cup("#B8D77A", "#7FA83E", BG.matcha), groups: matchaGroups },
  { id: "matcha-creme-oeufs", categoryId: "matcha", name: "Matcha crème aux œufs", description: "Un matcha latte onctueux, surmonté d'une crème aux œufs douce et gourmande", price: 7, available: true, image: "/products/matcha-creme-oeufs.jpg", art: cup("#B8D77A", "#7FA83E", BG.matcha, { topping: "foam", foam: "#FFF1B8" }), groups: matchaGroups },
  { id: "matcha-creme-salee", categoryId: "matcha", name: "Matcha crème salée", description: "", price: 7, available: true, image: "/products/matcha-creme-salee.jpg", art: cup("#B8D77A", "#7FA83E", BG.matcha, { topping: "foam" }), groups: matchaGroups },
  { id: "matcha-caramel-creme-salee", categoryId: "matcha", name: "Matcha caramel crème salée", description: "", price: 7, available: true, art: cup("#C9D98A", "#C58A50", BG.matcha, { topping: "foam" }), groups: matchaGroups },
  { id: "fruity-matcha", categoryId: "matcha", name: "Fruity matcha", description: "Fraise, passion, ananas, mangue", price: 7, available: true, art: cup("#E4EE9C", "#F59BB3", BG.matcha, { garnish: "strawberry" }), groups: matchaGroups },
  { id: "coconut-matcha-cloud", categoryId: "matcha", name: "Coconut matcha cloud", description: "", price: 7, available: true, art: cup("#B8D77A", "#7FA83E", BG.matcha, { topping: "foam", foam: "#FFFDF8" }), groups: matchaGroups },
  { id: "matcha-oreo", categoryId: "matcha", name: "Matcha Oreo", description: "", price: 7, available: true, art: cup("#C5DB93", "#5B6B3A", BG.matcha, { topping: "pearls" }), groups: matchaGroups },
  { id: "matcha-cold-whisk", categoryId: "matcha", name: "Matcha cold whisk crème aux œufs", description: "", price: 7, available: true, art: cup("#B8D77A", "#7FA83E", BG.matcha, { topping: "foam", foam: "#FFF1B8" }), groups: matchaGroups },
  { id: "taro-latte", categoryId: "matcha", name: "Taro latte", description: "Special series", price: 7, available: true, art: cup("#D9C7F5", "#B197E6", BG.pink), groups: matchaGroups },
  { id: "taro-creme-salee", categoryId: "matcha", name: "Taro crème salée", description: "Special series", price: 7, available: true, art: cup("#D9C7F5", "#B197E6", BG.pink, { topping: "foam" }), groups: matchaGroups },
  { id: "taro-creme-oeufs", categoryId: "matcha", name: "Taro crème aux œufs", description: "Douceur du taro et crème onctueuse", price: 7, available: true, image: "/products/taro-creme-oeufs.jpg", art: cup("#D9C7F5", "#B197E6", BG.pink, { topping: "foam", foam: "#FFF1B8" }), groups: matchaGroups },
  { id: "cacao-latte", categoryId: "matcha", name: "Cacao latte", description: "Special series", price: 7, available: true, art: cup("#C9A27A", "#6B4630", BG.coffee), groups: matchaGroups },
  { id: "cacao-creme-salee", categoryId: "matcha", name: "Cacao crème salée", description: "Special series", price: 7, available: true, art: cup("#C9A27A", "#6B4630", BG.coffee, { topping: "foam" }), groups: matchaGroups },
  { id: "cacao-creme-oeufs", categoryId: "matcha", name: "Cacao crème aux œufs", description: "Special series", price: 7, available: true, art: cup("#C9A27A", "#6B4630", BG.coffee, { topping: "foam", foam: "#FFF1B8" }), groups: matchaGroups },
];

/* ---------- Cafés ---------- */

const cafes: Product[] = [
  { id: "cafe-expresso", categoryId: "cafe", name: "Café expresso", description: "", price: 2.5, available: true, art: cup("#8A5A36", "#3A2216", BG.coffee), groups: [] },
  { id: "cafe-allonge", categoryId: "cafe", name: "Café allongé", description: "", price: 3, available: true, art: cup("#8A5A36", "#3A2216", BG.coffee), groups: [] },
  { id: "cappuccino", categoryId: "cafe", name: "Cappuccino", description: "", price: 3.9, available: true, art: cup("#D9B48A", "#8A5A36", BG.coffee, { topping: "foam" }), groups: [] },
  { id: "cafe-vietnamien", categoryId: "cafe", name: "Café vietnamien", description: "", price: 6, available: true, art: cup("#C9A27A", "#5A3A28", BG.coffee), groups: [] },
  { id: "cafe-latte-creme-salee", categoryId: "cafe", name: "Café latte crème salée", description: "", price: 6, available: true, art: cup("#D9B48A", "#8A5A36", BG.coffee, { topping: "foam" }), groups: [] },
  { id: "cafe-vietnamien-creme-salee", categoryId: "cafe", name: "Café vietnamien à la crème salée", description: "", price: 6, available: true, image: "/products/cafe-vietnamien-creme-salee.jpg", art: cup("#C9A27A", "#5A3A28", BG.coffee, { topping: "foam" }), groups: [] },
  { id: "cafe-vietnamien-oeufs", categoryId: "cafe", name: "Café vietnamien aux œufs", description: "", price: 6, available: true, image: "/products/cafe-vietnamien-oeufs.jpg", art: cup("#C9A27A", "#5A3A28", BG.coffee, { topping: "foam", foam: "#FFF1B8" }), groups: [] },
  { id: "cafe-oreo", categoryId: "cafe", name: "Café Oreo", description: "", price: 6, available: true, art: cup("#CBB9A8", "#4A3A32", BG.coffee, { topping: "pearls" }), groups: [] },
];

/* ---------- Gourmandises ---------- */

const gourmandises: Product[] = [
  { id: "taiyaki", categoryId: "gourmandises", name: "Taiyaki", description: "Gaufre en forme de poisson · 3 ou 4 pièces", price: 7, available: true, popular: true, image: "/products/taiyaki.jpg", art: { kind: "taiyaki", color: "#E8B66B", color2: "#9B5B34", bg: BG.gold }, groups: [taiyakiCount, taiyakiFlavor] },
  { id: "bubble-waffle", categoryId: "gourmandises", name: "Bubble waffle", description: "Au choix ou avec 3 boules de glace", price: 6, available: true, image: "/products/bubble-waffle.jpg", art: { kind: "waffle", color: "#E8B66B", color2: "#8A5A36", bg: BG.sand }, groups: [waffleFormula, waffleFlavor] },
];

/* ---------- Boissons ---------- */

const plain = (id: string, name: string, price: number, art: ProductArt, extra: Partial<Product> = {}): Product => ({
  id,
  categoryId: "boissons",
  name,
  description: "",
  price,
  available: true,
  art,
  groups: [],
  ...extra,
});

const boissons: Product[] = [
  plain("soda-cannette", "Soda en cannette", 2.5, { kind: "can", color: "#E8453C", color2: "#FFF4E2", bg: BG.peach }, { upsell: true }),
  plain("eau", "Eau", 2.5, { kind: "can", color: "#6FB6E8", color2: "#FFFFFF", bg: BG.matcha }),
  plain("red-bull", "Red bull", 3.5, { kind: "can", color: "#2F5DA8", color2: "#C9D8F0", bg: BG.matcha }),
  plain("monster", "Monster", 3.5, { kind: "can", color: "#262626", color2: "#7BC27F", bg: BG.matcha }),
  plain("limonade-hata", "Limonade Hata", 4, { kind: "can", color: "#E4F2A8", color2: "#7BC27F", bg: BG.lemon }),
  plain("biere-tsingtao", "Bière Tsingtao", 4, { kind: "can", color: "#3E8E5A", color2: "#F5E9C8", bg: BG.lemon }, { description: "Réservée aux personnes majeures" }),
  plain("biere-asahi", "Bière Asahi", 4, { kind: "can", color: "#C9CDD3", color2: "#2B2B2B", bg: BG.lemon }, { description: "Réservée aux personnes majeures" }),
  plain("the", "Thé", 3.5, cup("#F2C27A", "#D9903A", BG.lemon, { garnish: "lemon" }), { description: "Jasmin, citron, Lipton ou menthe", upsell: true, groups: [teaFlavor] }),
  plain("boisson-soja", "Boisson au soja", 3.5, { kind: "can", color: "#F6E7D3", color2: "#C58A50", bg: BG.sand }),
  plain("basil-seeds", "Basil seeds", 3.5, { kind: "can", color: "#7BC27F", color2: "#FFF4E2", bg: BG.matcha }),
  plain("mogu-mogu", "Mogu Mogu", 3.5, { kind: "can", color: "#F59BB3", color2: "#FFF4E2", bg: BG.pink }),
  plain("perrier", "Perrier", 3.5, { kind: "can", color: "#2E8B57", color2: "#E4F2A8", bg: BG.matcha }),
  plain("eau-de-coco", "Eau de coco", 3.5, { kind: "can", color: "#FFF4E2", color2: "#7BC27F", bg: BG.matcha }),
  plain("aloe-vera", "Aloe Vera", 3.5, { kind: "can", color: "#B8D77A", color2: "#FFFFFF", bg: BG.matcha }),
];

export const products: Product[] = [
  ...entrees,
  ...plats,
  ...desserts,
  ...bubbleTeas,
  ...matchas,
  ...cafes,
  ...gourmandises,
  ...boissons,
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
