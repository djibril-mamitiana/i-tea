import { getProduct } from "../data/menu.ts";

/**
 * État de la boutique décidé par l'équipe depuis l'admin, sans toucher au code :
 *  - la disponibilité de chaque plat (disponible, en rupture, retiré du site) ;
 *  - la pause des commandes en ligne.
 * Logique pure, partagée par le navigateur et le serveur.
 */

export type ProductState = "available" | "unavailable" | "hidden";

/** Seuls les plats qui s'écartent de « disponible » sont enregistrés : un plat absent de la liste est disponible. */
export type MenuStatus = Record<string, Exclude<ProductState, "available">>;

export const PRODUCT_STATES: readonly ProductState[] = ["available", "unavailable", "hidden"];

export const STATE_LABEL: Record<ProductState, string> = {
  available: "Disponible",
  unavailable: "En rupture",
  hidden: "Retiré du site",
};

export const isProductState = (v: unknown): v is ProductState => typeof v === "string" && (PRODUCT_STATES as readonly string[]).includes(v);

export const stateOf = (status: MenuStatus, productId: string): ProductState => status[productId] ?? "available";

/** Message à montrer au client quand un plat ne peut plus être commandé. */
export function unavailableMessage(name: string, state: ProductState): string {
  return state === "hidden" ? `« ${name} » n'est plus proposé.` : `« ${name} » n'est plus disponible.`;
}

export type ParsedChanges = { ok: true; changes: Record<string, ProductState> } | { ok: false; error: string };

/** Valide des changements de disponibilité saisis dans l'admin ({ productId: état }). */
export function parseMenuChanges(body: unknown): ParsedChanges {
  const raw = typeof body === "object" && body !== null && !Array.isArray(body) ? (body as { changes?: unknown }).changes : undefined;
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return { ok: false, error: "Requête invalide." };
  const entries = Object.entries(raw);
  if (entries.length === 0) return { ok: false, error: "Aucun changement." };
  if (entries.length > 200) return { ok: false, error: "Trop de changements à la fois." };
  const changes: Record<string, ProductState> = {};
  for (const [id, state] of entries) {
    if (!getProduct(id)) return { ok: false, error: "Un plat n'existe pas dans la carte." };
    if (!isProductState(state)) return { ok: false, error: "État de plat invalide." };
    changes[id] = state;
  }
  return { ok: true, changes };
}

/** Applique des changements à un état existant (un retour à « disponible » supprime l'entrée). */
export function applyChanges(status: MenuStatus, changes: Record<string, ProductState>): MenuStatus {
  const next: MenuStatus = { ...status };
  for (const [id, state] of Object.entries(changes)) {
    if (state === "available") delete next[id];
    else next[id] = state;
  }
  return next;
}

/* ---------- Pause des commandes en ligne ---------- */

export interface OrderingState {
  paused: boolean;
  /** Message affiché aux clients pendant la pause (facultatif). */
  message: string;
}

export const DEFAULT_ORDERING: OrderingState = { paused: false, message: "" };

export const PAUSE_DEFAULT_TEXT = "Les commandes en ligne sont momentanément suspendues.";

export function parseOrderingInput(body: unknown): { ok: true; value: OrderingState } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return { ok: false, error: "Requête invalide." };
  const { paused, message } = body as { paused?: unknown; message?: unknown };
  if (typeof paused !== "boolean") return { ok: false, error: "Requête invalide." };
  const text = typeof message === "string" ? message.trim() : "";
  if (text.length > 200) return { ok: false, error: "Le message est trop long (200 caractères maximum)." };
  return { ok: true, value: { paused, message: paused ? text : "" } };
}

/** Relecture tolérante de ce qui est stocké en base. */
export function sanitizeOrdering(raw: unknown): OrderingState {
  if (typeof raw !== "object" || raw === null) return DEFAULT_ORDERING;
  const { paused, message } = raw as { paused?: unknown; message?: unknown };
  return { paused: paused === true, message: typeof message === "string" ? message.slice(0, 200) : "" };
}
