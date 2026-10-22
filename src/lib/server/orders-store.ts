import { randomInt } from "node:crypto";
import type { Row } from "@libsql/client";
import { isOrderStatus, type OrderStatus } from "../order-status.ts";
import type { ConfirmedOrder, StoredOrder } from "../types.ts";
import { getDb } from "./db.ts";

/** Enregistrement et suivi des commandes (base libSQL / Turso). */

export class OrderNumberTakenError extends Error {}

export async function saveOrder(order: ConfirmedOrder): Promise<void> {
  const db = await getDb();
  try {
    await db.execute({
      sql: `INSERT INTO orders (number, created_at, updated_at, status, mode, customer_name, customer_phone, total, data)
            VALUES (?, ?, ?, 'new', ?, ?, ?, ?, ?)`,
      args: [
        order.number,
        order.createdAt,
        order.createdAt,
        order.mode,
        order.customer.name,
        order.customer.phone,
        order.totals.total,
        JSON.stringify(order),
      ],
    });
  } catch (err) {
    if (/UNIQUE|PRIMARY KEY|constraint/i.test(String((err as Error)?.message))) throw new OrderNumberTakenError();
    throw err;
  }
}

function toStoredOrder(row: Row): StoredOrder {
  const order = JSON.parse(String(row.data)) as ConfirmedOrder;
  const status = String(row.status);
  return { ...order, status: isOrderStatus(status) ? status : "new", updatedAt: String(row.updated_at) };
}

/** Vues du tableau de bord. */
export type OrderView = "active" | "done" | "cancelled" | "all";

export async function listOrders(view: OrderView, limit = 200): Promise<StoredOrder[]> {
  const db = await getDb();
  const where = { active: "status IN ('new','preparing','ready')", done: "status = 'completed'", cancelled: "status = 'cancelled'", all: "1=1" }[view];
  // À traiter : les nouvelles d'abord, puis par ancienneté (premier arrivé, premier servi). Historique : récentes d'abord.
  const order =
    view === "active"
      ? "CASE status WHEN 'new' THEN 0 WHEN 'preparing' THEN 1 ELSE 2 END, created_at ASC"
      : "created_at DESC";
  const result = await db.execute({
    sql: `SELECT data, status, updated_at FROM orders WHERE ${where} ORDER BY ${order} LIMIT ?`,
    args: [Math.max(1, Math.min(500, Math.floor(limit)))],
  });
  return result.rows.map(toStoredOrder);
}

export async function countByStatus(): Promise<Record<OrderStatus, number>> {
  const db = await getDb();
  const result = await db.execute("SELECT status, COUNT(*) AS n FROM orders GROUP BY status");
  const counts: Record<OrderStatus, number> = { new: 0, preparing: 0, ready: 0, completed: 0, cancelled: 0 };
  for (const row of result.rows) {
    const status = String(row.status);
    if (isOrderStatus(status)) counts[status] = Number(row.n);
  }
  return counts;
}

/** Numéros des commandes encore « nouvelles » : sert à déclencher l'alerte sonore de l'admin. */
export async function newOrderNumbers(): Promise<string[]> {
  const db = await getDb();
  const result = await db.execute("SELECT number FROM orders WHERE status = 'new' ORDER BY created_at DESC LIMIT 100");
  return result.rows.map((r) => String(r.number));
}

export async function getOrder(number: string): Promise<StoredOrder | null> {
  const db = await getDb();
  const result = await db.execute({ sql: "SELECT data, status, updated_at FROM orders WHERE number = ?", args: [number] });
  return result.rows[0] ? toStoredOrder(result.rows[0]) : null;
}

/** Change le statut. Retourne la commande à jour, ou null si elle n'existe pas. */
export async function updateOrderStatus(number: string, status: OrderStatus): Promise<StoredOrder | null> {
  const db = await getDb();
  const result = await db.execute({
    sql: "UPDATE orders SET status = ?, updated_at = ? WHERE number = ?",
    args: [status, new Date().toISOString(), number],
  });
  if (result.rowsAffected === 0) return null;
  return getOrder(number);
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
