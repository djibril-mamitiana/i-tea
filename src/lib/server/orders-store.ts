import { randomInt } from "node:crypto";
import { isOrderStatus, type OrderStatus } from "../order-status.ts";
import type { ConfirmedOrder, StoredOrder } from "../types.ts";
import { getDb, type Row } from "./db.ts";

/** Enregistrement et suivi des commandes (PostgreSQL). */

export class OrderNumberTakenError extends Error {}

export async function saveOrder(order: ConfirmedOrder): Promise<void> {
  const db = await getDb();
  try {
    await db.query(
      `INSERT INTO orders (number, created_at, updated_at, status, mode, customer_name, customer_phone, total, data)
       VALUES ($1, $2, $2, 'new', $3, $4, $5, $6, $7::jsonb)`,
      [
        order.number,
        order.createdAt,
        order.mode,
        order.customer.name,
        order.customer.phone,
        order.totals.total,
        JSON.stringify(order),
      ],
    );
  } catch (err) {
    const { code, message } = err as { code?: string; message?: string };
    // 23505 = violation d'unicité Postgres : ce numéro de commande existe déjà.
    if (code === "23505" || /duplicate key/i.test(message ?? "")) throw new OrderNumberTakenError();
    throw err;
  }
}

function toStoredOrder(row: Row): StoredOrder {
  // JSONB : selon le driver, déjà décodé ou encore sous forme de texte.
  const order = (typeof row.data === "string" ? JSON.parse(row.data) : row.data) as ConfirmedOrder;
  const status = String(row.status);
  return {
    ...order,
    status: isOrderStatus(status) ? status : "new",
    updatedAt: new Date(row.updated_at as string | Date).toISOString(),
  };
}

/** Vues du tableau de bord. */
export type OrderView = "active" | "done" | "cancelled" | "all";

/** `since` : ne garde que les commandes passées à partir de cet instant (historique « aujourd'hui », « 7 jours »…). */
export async function listOrders(view: OrderView, limit = 200, since?: Date): Promise<StoredOrder[]> {
  const db = await getDb();
  const where = {
    active: "status IN ('new', 'preparing', 'ready')",
    done: "status = 'completed'",
    cancelled: "status = 'cancelled'",
    all: "TRUE",
  }[view];
  // À traiter : les nouvelles d'abord, puis par ancienneté (premier arrivé, premier servi). Historique : récentes d'abord.
  const order =
    view === "active"
      ? "CASE status WHEN 'new' THEN 0 WHEN 'preparing' THEN 1 ELSE 2 END, created_at ASC"
      : "created_at DESC";
  const params: unknown[] = [Math.max(1, Math.min(500, Math.floor(limit)))];
  let sinceClause = "";
  if (since) {
    params.push(since.toISOString());
    sinceClause = " AND created_at >= $2::timestamptz";
  }
  const rows = await db.query(`SELECT data, status, updated_at FROM orders WHERE ${where}${sinceClause} ORDER BY ${order} LIMIT $1`, params);
  return rows.map(toStoredOrder);
}

export interface PeriodStats {
  orders: number;
  /** Montant total des commandes (hors annulées), en devise du site. */
  total: number;
}

/** Commandes passées depuis `since` (hors annulées) : nombre et montant. */
export async function statsSince(since: Date): Promise<PeriodStats> {
  const db = await getDb();
  const [row] = await db.query(
    "SELECT COUNT(*)::int AS n, COALESCE(SUM(total), 0)::float8 AS total FROM orders WHERE created_at >= $1::timestamptz AND status <> 'cancelled'",
    [since.toISOString()],
  );
  return { orders: Number(row?.n ?? 0), total: Math.round(Number(row?.total ?? 0) * 100) / 100 };
}

export async function countByStatus(): Promise<Record<OrderStatus, number>> {
  const db = await getDb();
  const rows = await db.query("SELECT status, COUNT(*)::int AS n FROM orders GROUP BY status");
  const counts: Record<OrderStatus, number> = { new: 0, preparing: 0, ready: 0, completed: 0, cancelled: 0 };
  for (const row of rows) {
    const status = String(row.status);
    if (isOrderStatus(status)) counts[status] = Number(row.n);
  }
  return counts;
}

/** Numéros des commandes encore « nouvelles » : sert à déclencher l'alerte sonore de l'admin. */
export async function newOrderNumbers(): Promise<string[]> {
  const db = await getDb();
  const rows = await db.query("SELECT number FROM orders WHERE status = 'new' ORDER BY created_at DESC LIMIT 100");
  return rows.map((r) => String(r.number));
}

export async function getOrder(number: string): Promise<StoredOrder | null> {
  const db = await getDb();
  const rows = await db.query("SELECT data, status, updated_at FROM orders WHERE number = $1", [number]);
  return rows[0] ? toStoredOrder(rows[0]) : null;
}

/** Change le statut. Retourne la commande à jour, ou null si elle n'existe pas. */
export async function updateOrderStatus(number: string, status: OrderStatus): Promise<StoredOrder | null> {
  const db = await getDb();
  const rows = await db.query(
    "UPDATE orders SET status = $1, updated_at = now() WHERE number = $2 RETURNING data, status, updated_at",
    [status, number],
  );
  return rows[0] ? toStoredOrder(rows[0]) : null;
}

// Sans I/O/0/1 pour éviter les confusions à l'oral au téléphone.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Ex. « IT-251021-K7QD » : date + 4 caractères aléatoires. */
export function newOrderNumber(now: Date): string {
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  let suffix = "";
  for (let i = 0; i < 4; i++) suffix += ALPHABET[randomInt(ALPHABET.length)];
  return `IT-${yy}${mm}${dd}-${suffix}`;
}
