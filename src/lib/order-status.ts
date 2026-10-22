/** Cycle de vie d'une commande. Partagé entre l'admin (navigateur) et le serveur. */

export const ORDER_STATUSES = ["new", "preparing", "ready", "completed", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Nouvelle",
  preparing: "En préparation",
  ready: "Prête",
  completed: "Terminée",
  cancelled: "Annulée",
};

/** Statuts d'une commande « en cours » (à traiter par le restaurant). */
export const ACTIVE_STATUSES: readonly OrderStatus[] = ["new", "preparing", "ready"];

export const isOrderStatus = (value: unknown): value is OrderStatus =>
  typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value);

export const isActive = (status: OrderStatus) => ACTIVE_STATUSES.includes(status);

/** Étape suivante du flux normal : nouvelle → en préparation → prête → terminée. */
export function nextStatus(status: OrderStatus): OrderStatus | null {
  const flow: Partial<Record<OrderStatus, OrderStatus>> = { new: "preparing", preparing: "ready", ready: "completed" };
  return flow[status] ?? null;
}

/** Libellé du bouton d'avancement, selon le mode de réception. */
export function advanceLabel(status: OrderStatus, mode: "pickup" | "delivery"): string | null {
  switch (status) {
    case "new":
      return "Démarrer la préparation";
    case "preparing":
      return "Marquer comme prête";
    case "ready":
      return mode === "delivery" ? "Marquer comme livrée" : "Marquer comme remise";
    default:
      return null;
  }
}
