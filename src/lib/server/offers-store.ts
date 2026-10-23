import { randomBytes } from "node:crypto";
import { defaultOffers, liveOffers, type Offer, type OfferInput } from "../offers.ts";
import { getDb, type Db, type Row } from "./db.ts";

/** Offres (PostgreSQL). Le détail de chaque offre est stocké en JSONB ; id, ordre et état actif sont aussi en colonnes. */

function toOffer(row: Row): Offer {
  const data = (typeof row.data === "string" ? JSON.parse(row.data) : row.data) as Offer;
  return { ...data, id: String(row.id), position: Number(row.position), active: Boolean(row.active) };
}

const SEEDED_KEY = "offers_seeded";

/**
 * Crée les offres de départ une seule fois (repère dans app_meta). Si l'équipe les supprime ensuite,
 * elles ne reviennent pas. Idempotent : deux démarrages simultanés ne créent pas de doublon.
 */
async function ensureSeeded(db: Db): Promise<void> {
  const [seeded] = await db.query("SELECT 1 AS ok FROM app_meta WHERE key = $1", [SEEDED_KEY]);
  if (seeded) return;
  const now = new Date().toISOString();
  await db.batch([
    ...defaultOffers().map((o) => ({
      text: `INSERT INTO offers (id, position, active, created_at, updated_at, data)
             VALUES ($1, $2, $3, $4, $4, $5::jsonb) ON CONFLICT (id) DO NOTHING`,
      params: [o.id, o.position, o.active, now, JSON.stringify(o)],
    })),
    { text: "INSERT INTO app_meta (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING", params: [SEEDED_KEY, now] },
  ]);
}

/** Toutes les offres, actives ou non, dans l'ordre d'affichage. */
export async function listOffers(): Promise<Offer[]> {
  const db = await getDb();
  await ensureSeeded(db);
  const rows = await db.query("SELECT id, position, active, data FROM offers ORDER BY position ASC, created_at ASC");
  return rows.map(toOffer);
}

/** Offres actuellement en vigueur (actives et dans leur période). */
export async function listLiveOffers(now = new Date()): Promise<Offer[]> {
  return liveOffers(await listOffers(), now);
}

export async function getOffer(id: string): Promise<Offer | null> {
  const db = await getDb();
  const rows = await db.query("SELECT id, position, active, data FROM offers WHERE id = $1", [id]);
  return rows[0] ? toOffer(rows[0]) : null;
}

const newOfferId = () => `o-${randomBytes(5).toString("hex")}`;

export async function createOffer(input: OfferInput): Promise<Offer> {
  const db = await getDb();
  await ensureSeeded(db); // les offres de départ existent avant la première création
  const [last] = await db.query("SELECT COALESCE(MAX(position), -1)::int AS max FROM offers");
  const offer: Offer = { ...input, id: newOfferId(), position: Number(last?.max ?? -1) + 1 };
  const now = new Date().toISOString();
  await db.query("INSERT INTO offers (id, position, active, created_at, updated_at, data) VALUES ($1, $2, $3, $4, $4, $5::jsonb)", [
    offer.id,
    offer.position,
    offer.active,
    now,
    JSON.stringify(offer),
  ]);
  return offer;
}

/** Remplace le contenu d'une offre (l'ordre est conservé). Retourne null si elle n'existe pas. */
export async function updateOffer(id: string, input: OfferInput): Promise<Offer | null> {
  const db = await getDb();
  const current = await getOffer(id);
  if (!current) return null;
  const offer: Offer = { ...input, id, position: current.position };
  await db.query("UPDATE offers SET active = $2, updated_at = now(), data = $3::jsonb WHERE id = $1", [id, offer.active, JSON.stringify(offer)]);
  return offer;
}

/** Active ou désactive une offre. */
export async function setOfferActive(id: string, active: boolean): Promise<Offer | null> {
  const current = await getOffer(id);
  if (!current) return null;
  return updateOffer(id, { ...current, active });
}

export async function deleteOffer(id: string): Promise<boolean> {
  const db = await getDb();
  const rows = await db.query("DELETE FROM offers WHERE id = $1 RETURNING id", [id]);
  return rows.length > 0;
}
