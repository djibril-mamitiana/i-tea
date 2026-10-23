import { site } from "../config/site.ts";
import { getProduct, products } from "../data/menu.ts";
import { stateOf, unavailableMessage, type MenuStatus } from "./shop.ts";
import type { ConfirmedOrder, OrderMode, RewardSelection } from "./types.ts";

/**
 * Offres d'I Tea. Logique pure, partagée par le navigateur (affichage, panier) et le serveur (validation).
 *
 *  - « info »      : une annonce affichée sur le site (ex. la carte de fidélité). Aucun effet sur le panier.
 *  - « free_item » : acheter N produits parmi une liste donne droit à un cadeau, au choix parmi plusieurs
 *                    (ex. « 1 bubble waffle ou 2 taiyakis offerts »). Le cadeau coûte 0 € ; le serveur vérifie
 *                    chaque commande et ne fait jamais confiance au navigateur.
 */

export type { RewardSelection };

export type OfferKind = "info" | "free_item";

export interface RewardChoice {
  id: string;
  label: string;
}

/** Un cadeau possible (ex. « 2 taiyakis »), avec son éventuel choix (ex. le parfum). */
export interface RewardAlternative {
  id: string;
  label: string;
  /** Intitulé du choix demandé au client (ex. « Parfum »). */
  choiceLabel?: string;
  choices: RewardChoice[];
  /** Produit de la carte dont la photo illustre ce cadeau (facultatif). */
  productId?: string;
}

export interface Offer {
  id: string;
  kind: OfferKind;
  title: string;
  description: string;
  active: boolean;
  /** Dates incluses, au format AAAA-MM-JJ (fuseau du restaurant). */
  startsAt: string | null;
  endsAt: string | null;
  /** Modes de commande en ligne concernés (les annonces s'affichent toujours). */
  modes: OrderMode[];
  /** free_item : produits dont l'achat déclenche l'offre. */
  triggerProductIds: string[];
  /** free_item : nombre de produits à acheter pour un cadeau. */
  minQty: number;
  /** free_item : nombre maximal de cadeaux par commande. */
  maxRewards: number;
  alternatives: RewardAlternative[];
  position: number;
}

/** Ce que le panier gagne ou peut encore gagner grâce à une offre. */
export interface OfferProgress {
  offer: Offer;
  /** Produits éligibles dans le panier. */
  qualQty: number;
  earned: number;
  claimed: number;
  remaining: number;
  /** Produits éligibles à ajouter pour débloquer le prochain cadeau (0 si le maximum est atteint). */
  toUnlock: number;
}

type CartQty = { productId: string; qty: number };

/* ---------- Dates ---------- */

const dayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: site.timezone, year: "numeric", month: "2-digit", day: "2-digit" });

/** Date du jour AAAA-MM-JJ dans le fuseau du restaurant. */
export const todayIso = (now: Date) => dayFormat.format(now);

export const isIsoDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

/** Active et dans sa période de validité. */
export function isLive(offer: Offer, now: Date): boolean {
  if (!offer.active) return false;
  const today = todayIso(now);
  if (offer.startsAt && today < offer.startsAt) return false;
  if (offer.endsAt && today > offer.endsAt) return false;
  return true;
}

export const liveOffers = (offers: Offer[], now: Date) =>
  offers.filter((o) => isLive(o, now)).sort((a, b) => a.position - b.position);

/* ---------- Calcul des cadeaux ---------- */

const qualifyingQty = (offer: Offer, lines: CartQty[]) =>
  lines.reduce((n, l) => (offer.triggerProductIds.includes(l.productId) ? n + l.qty : n), 0);

/** Cadeau applicable à une commande de ce mode : une offre « free_item » complète. */
export const appliesTo = (offer: Offer, mode: OrderMode) =>
  offer.kind === "free_item" &&
  offer.modes.includes(mode) &&
  offer.triggerProductIds.length > 0 &&
  offer.alternatives.length > 0 &&
  offer.minQty >= 1;

/** Nombre de cadeaux auxquels le panier donne droit. */
export function rewardsEarned(offer: Offer, lines: CartQty[], mode: OrderMode): number {
  if (!appliesTo(offer, mode)) return 0;
  return Math.min(offer.maxRewards, Math.floor(qualifyingQty(offer, lines) / offer.minQty));
}

export function offerProgress(offers: Offer[], lines: CartQty[], selections: RewardSelection[], mode: OrderMode): OfferProgress[] {
  return offers
    .filter((o) => appliesTo(o, mode))
    .map((offer) => {
      const qualQty = qualifyingQty(offer, lines);
      const earned = Math.min(offer.maxRewards, Math.floor(qualQty / offer.minQty));
      const claimed = selections.filter((s) => s.offerId === offer.id).length;
      return {
        offer,
        qualQty,
        earned,
        claimed,
        remaining: Math.max(0, earned - claimed),
        toUnlock: earned >= offer.maxRewards ? 0 : offer.minQty - (qualQty % offer.minQty),
      };
    });
}

/* ---------- Cadeaux choisis ---------- */

export type RewardCheck =
  | { ok: true; items: ConfirmedOrder["items"] }
  | { ok: false; error: string };

/** Ligne de commande d'un cadeau : prix 0, marquée `reward`. */
export function rewardItem(offer: Offer, alt: RewardAlternative, choice: RewardChoice | undefined): ConfirmedOrder["items"][number] {
  return {
    productId: `offer:${offer.id}:${alt.id}`,
    name: `Offert : ${alt.label}`,
    qty: 1,
    unitPrice: 0,
    lineTotal: 0,
    optionLabels: choice ? [choice.label] : [],
    reward: true,
    offerId: offer.id,
  };
}

/**
 * Vérifie les cadeaux demandés contre les offres en vigueur et le panier réel.
 * Chaque cadeau doit correspondre à une offre valable, à un cadeau et à un choix existants, et leur nombre
 * ne peut pas dépasser ce que le panier a gagné.
 */
export function validateRewards(args: {
  offers: Offer[];
  selections: RewardSelection[];
  lines: CartQty[];
  mode: OrderMode;
  now: Date;
  /** Plats en rupture ou retirés : un cadeau lié à un tel plat est refusé. */
  menuStatus?: MenuStatus;
}): RewardCheck {
  const { offers, selections, lines, mode, now, menuStatus = {} } = args;
  const live = liveOffers(offers, now);
  const used = new Map<string, number>();
  const items: ConfirmedOrder["items"] = [];

  for (const sel of selections) {
    const offer = live.find((o) => o.id === sel.offerId);
    if (!offer || !appliesTo(offer, mode)) return { ok: false, error: "Une offre de ton panier n'est plus valable." };
    const alt = offer.alternatives.find((a) => a.id === sel.alternativeId);
    if (!alt) return { ok: false, error: `Le cadeau choisi pour « ${offer.title} » n'existe plus.` };

    let choice: RewardChoice | undefined;
    if (alt.choices.length > 0) {
      choice = alt.choices.find((c) => c.id === sel.choiceId);
      if (!choice) return { ok: false, error: `Choisis ${alt.choiceLabel ? `ton ${alt.choiceLabel.toLowerCase()}` : "une option"} pour « ${alt.label} ».` };
    } else if (sel.choiceId) {
      return { ok: false, error: `Le cadeau « ${alt.label} » ne comporte pas de choix.` };
    }

    if (alt.productId && stateOf(menuStatus, alt.productId) !== "available") {
      return { ok: false, error: unavailableMessage(alt.label, stateOf(menuStatus, alt.productId)) };
    }

    const count = (used.get(offer.id) ?? 0) + 1;
    used.set(offer.id, count);
    if (count > rewardsEarned(offer, lines, mode)) {
      return { ok: false, error: `Ton panier ne donne pas droit à ce cadeau (« ${offer.title} »).` };
    }
    items.push(rewardItem(offer, alt, choice));
  }
  return { ok: true, items };
}

/** Côté navigateur : retire les cadeaux devenus invalides (offre terminée, panier modifié…), en gardant l'ordre. */
export function reconcileRewards(offers: Offer[], selections: RewardSelection[], lines: CartQty[], mode: OrderMode, now: Date): RewardSelection[] {
  const live = liveOffers(offers, now);
  const used = new Map<string, number>();
  const kept: RewardSelection[] = [];
  for (const sel of selections) {
    const offer = live.find((o) => o.id === sel.offerId);
    if (!offer || !appliesTo(offer, mode)) continue;
    const alt = offer.alternatives.find((a) => a.id === sel.alternativeId);
    if (!alt) continue;
    if (alt.choices.length > 0 ? !alt.choices.some((c) => c.id === sel.choiceId) : sel.choiceId) continue;
    const count = (used.get(offer.id) ?? 0) + 1;
    if (count > rewardsEarned(offer, lines, mode)) continue;
    used.set(offer.id, count);
    kept.push(sel);
  }
  return kept;
}

/** Forme seulement (données du navigateur ou du corps d'une requête) : la validité est vérifiée ailleurs. */
export function sanitizeRewards(raw: unknown): RewardSelection[] {
  if (!Array.isArray(raw)) return [];
  const clean: RewardSelection[] = [];
  for (const r of raw.slice(0, 20)) {
    if (typeof r !== "object" || r === null) continue;
    const { offerId, alternativeId, choiceId } = r as Record<string, unknown>;
    if (typeof offerId !== "string" || typeof alternativeId !== "string") continue;
    clean.push({ offerId, alternativeId, ...(typeof choiceId === "string" ? { choiceId } : {}) });
  }
  return clean;
}

/* ---------- Saisie depuis l'admin ---------- */

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

const uniqueIds = (labels: string[], fallback: string) => {
  const seen = new Set<string>();
  return labels.map((label, i) => {
    let id = slugify(label) || `${fallback}-${i + 1}`;
    while (seen.has(id)) id = `${id.slice(0, 36)}-${i + 1}`;
    seen.add(id);
    return id;
  });
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export type OfferInput = Omit<Offer, "id" | "position">;
export type ParsedOffer = { ok: true; value: OfferInput } | { ok: false; error: string };

/** Nettoie et valide une offre saisie dans l'admin. Retourne un message clair en cas de problème. */
export function parseOfferInput(body: unknown): ParsedOffer {
  const fail = (error: string): ParsedOffer => ({ ok: false, error });
  if (!isRecord(body)) return fail("Requête invalide.");

  if (body.kind !== "info" && body.kind !== "free_item") return fail("Choisis le type d'offre.");
  const kind: OfferKind = body.kind;

  const title = text(body.title);
  if (title.length < 3) return fail("Donne un titre à l'offre (3 caractères minimum).");
  if (title.length > 120) return fail("Le titre est trop long (120 caractères maximum).");
  const description = text(body.description);
  if (description.length > 600) return fail("La description est trop longue (600 caractères maximum).");

  const startsAt = body.startsAt ? body.startsAt : null;
  const endsAt = body.endsAt ? body.endsAt : null;
  if (startsAt !== null && !isIsoDate(startsAt)) return fail("La date de début n'est pas valide.");
  if (endsAt !== null && !isIsoDate(endsAt)) return fail("La date de fin n'est pas valide.");
  if (startsAt && endsAt && startsAt > endsAt) return fail("La date de fin est avant la date de début.");

  const modes = Array.isArray(body.modes) ? (body.modes.filter((m) => m === "pickup" || m === "delivery") as OrderMode[]) : [];
  const uniqueModes = [...new Set(modes)];
  if (kind === "free_item" && uniqueModes.length === 0) return fail("Choisis au moins un mode de commande (à emporter ou livraison).");

  const base = {
    kind,
    title,
    description,
    active: body.active === true,
    startsAt: startsAt as string | null,
    endsAt: endsAt as string | null,
    modes: uniqueModes.length ? uniqueModes : (["pickup", "delivery"] as OrderMode[]),
  };

  if (kind === "info") {
    return { ok: true, value: { ...base, triggerProductIds: [], minQty: 1, maxRewards: 1, alternatives: [] } };
  }

  const triggers = Array.isArray(body.triggerProductIds) ? body.triggerProductIds : [];
  const triggerProductIds = [...new Set(triggers.filter((id): id is string => typeof id === "string"))];
  if (triggerProductIds.length === 0) return fail("Choisis au moins un produit qui déclenche l'offre.");
  if (triggerProductIds.length > 100) return fail("Trop de produits sélectionnés.");
  const unknown = triggerProductIds.find((id) => !getProduct(id));
  if (unknown) return fail("Un produit sélectionné n'existe plus dans la carte.");

  const minQty = Number(body.minQty);
  if (!Number.isInteger(minQty) || minQty < 1 || minQty > 20) return fail("Le nombre de produits à acheter doit être entre 1 et 20.");
  const maxRewards = Number(body.maxRewards);
  if (!Number.isInteger(maxRewards) || maxRewards < 1 || maxRewards > 10) return fail("Le nombre de cadeaux par commande doit être entre 1 et 10.");

  const rawAlts = Array.isArray(body.alternatives) ? body.alternatives : [];
  if (rawAlts.length === 0) return fail("Ajoute au moins un cadeau.");
  if (rawAlts.length > 6) return fail("Six cadeaux au maximum.");

  const labels = rawAlts.map((a) => (isRecord(a) ? text(a.label) : ""));
  if (labels.some((l) => l.length < 2)) return fail("Chaque cadeau doit avoir un nom (2 caractères minimum).");
  if (labels.some((l) => l.length > 80)) return fail("Un nom de cadeau est trop long (80 caractères maximum).");
  const altIds = uniqueIds(labels, "cadeau");

  const alternatives: RewardAlternative[] = [];
  for (let i = 0; i < rawAlts.length; i++) {
    const a = rawAlts[i] as Record<string, unknown>;
    const choiceLabel = text(a.choiceLabel);
    if (choiceLabel.length > 40) return fail("L'intitulé du choix est trop long (40 caractères maximum).");
    const rawChoices = Array.isArray(a.choices) ? a.choices : [];
    const choiceLabels = rawChoices.map((c) => (typeof c === "string" ? c.trim() : isRecord(c) ? text(c.label) : "")).filter(Boolean);
    if (choiceLabels.length > 30) return fail("Trente choix au maximum par cadeau.");
    if (choiceLabels.some((l) => l.length > 60)) return fail("Un choix est trop long (60 caractères maximum).");
    const choiceIds = uniqueIds(choiceLabels, "choix");
    const productId = text(a.productId);
    if (productId && !getProduct(productId)) return fail("Le produit choisi pour illustrer un cadeau n'existe plus.");
    alternatives.push({
      id: altIds[i],
      label: labels[i],
      ...(choiceLabels.length && choiceLabel ? { choiceLabel } : {}),
      choices: choiceLabels.map((label, n) => ({ id: choiceIds[n], label })),
      ...(productId ? { productId } : {}),
    });
  }

  return { ok: true, value: { ...base, triggerProductIds, minQty, maxRewards, alternatives } };
}

/* ---------- Offres de départ (reprises des documents d'I Tea) ---------- */

const flavorsOf = (productId: string): RewardChoice[] =>
  (getProduct(productId)?.groups.find((g) => g.id === "flavor")?.options ?? []).map((o) => ({ id: o.id, label: o.label }));

/**
 * Offres créées au premier lancement, à partir de ce qu'I Tea annonce sur sa carte et ses affiches :
 * l'offre « boisson achetée = gourmandise offerte » (commandes à emporter) et la carte de fidélité (annonce).
 * L'équipe les modifie ou les supprime ensuite depuis l'admin.
 */
export function defaultOffers(): Offer[] {
  const triggers = products
    .filter((p) => p.categoryId === "bubble-tea" || (p.categoryId === "matcha" && /matcha/i.test(p.name)))
    .map((p) => p.id);
  const { offer, loyalty } = site;
  return [
    {
      id: "boisson-gourmandise",
      kind: "free_item",
      title: `${offer.lead} = ${offer.reward}`,
      description: `${offer.where}. Les conditions de l'offre sont celles du restaurant.`,
      active: true,
      startsAt: null,
      endsAt: null,
      modes: ["pickup"],
      triggerProductIds: triggers,
      minQty: 1,
      maxRewards: 1,
      alternatives: [
        { id: "bubble-waffle", label: "1 bubble waffle", choiceLabel: "Parfum", choices: flavorsOf("bubble-waffle"), productId: "bubble-waffle" },
        { id: "taiyakis", label: "2 taiyakis", choiceLabel: "Parfum", choices: flavorsOf("taiyaki"), productId: "taiyaki" },
      ],
      position: 0,
    },
    {
      id: "carte-fidelite",
      kind: "info",
      title: loyalty.title,
      description: `${loyalty.rule} ${loyalty.reward} ${loyalty.conditions}`,
      active: true,
      startsAt: null,
      endsAt: null,
      modes: ["pickup", "delivery"],
      triggerProductIds: [],
      minQty: 1,
      maxRewards: 1,
      alternatives: [],
      position: 1,
    },
  ];
}

/** Offres affichées si la base est injoignable : des annonces seulement (aucun cadeau ne peut être vérifié). */
export function fallbackOffers(): Offer[] {
  return defaultOffers().map((o) => ({ ...o, kind: "info" as const, triggerProductIds: [], alternatives: [] }));
}
