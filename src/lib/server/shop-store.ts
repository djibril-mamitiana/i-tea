import { DEFAULT_ORDERING, sanitizeOrdering, type MenuStatus, type OrderingState, type ProductState } from "../shop.ts";
import { getDb } from "./db.ts";

/** État de la boutique en base : disponibilité des plats et pause des commandes en ligne. */

const ORDERING_KEY = "ordering";

/** Plats en rupture ou retirés (un plat absent est disponible). */
export async function getMenuStatus(): Promise<MenuStatus> {
  const db = await getDb();
  const rows = await db.query("SELECT product_id, state FROM menu_status");
  const status: MenuStatus = {};
  for (const row of rows) {
    const state = String(row.state);
    if (state === "unavailable" || state === "hidden") status[String(row.product_id)] = state;
  }
  return status;
}

/** Applique des changements en une seule transaction et retourne le nouvel état. */
export async function applyMenuChanges(changes: Record<string, ProductState>): Promise<MenuStatus> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.batch(
    Object.entries(changes).map(([id, state]) =>
      state === "available"
        ? { text: "DELETE FROM menu_status WHERE product_id = $1", params: [id] }
        : {
            text: `INSERT INTO menu_status (product_id, state, updated_at) VALUES ($1, $2, $3)
                   ON CONFLICT (product_id) DO UPDATE SET state = EXCLUDED.state, updated_at = EXCLUDED.updated_at`,
            params: [id, state, now],
          },
    ),
  );
  return getMenuStatus();
}

export async function getOrderingState(): Promise<OrderingState> {
  const db = await getDb();
  const [row] = await db.query("SELECT value FROM app_meta WHERE key = $1", [ORDERING_KEY]);
  if (!row) return DEFAULT_ORDERING;
  try {
    return sanitizeOrdering(JSON.parse(String(row.value)));
  } catch {
    return DEFAULT_ORDERING;
  }
}

export async function setOrderingState(state: OrderingState): Promise<OrderingState> {
  const db = await getDb();
  await db.query(
    `INSERT INTO app_meta (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [ORDERING_KEY, JSON.stringify(state)],
  );
  return state;
}
