import { randomInt } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { ConfirmedOrder } from "../types.ts";

/**
 * Enregistrement des commandes.
 *
 * Implémentation par défaut : un fichier JSON Lines (une commande par ligne)
 * dans `data/orders/orders.jsonl` (ou ORDERS_DIR). Il fonctionne en local et
 * sur un serveur/VPS/Docker avec disque persistant.
 *
 * ⚠️ Sur un hébergement « serverless » (Vercel, Netlify…) le disque est en
 * lecture seule/éphémère : remplacez `saveOrder` par une base de données
 * (Postgres, Supabase, Firebase…). Voir README, section « Base de données ».
 */

const ordersDir = () => process.env.ORDERS_DIR ?? path.join(process.cwd(), "data", "orders");

export async function saveOrder(order: ConfirmedOrder): Promise<void> {
  const dir = ordersDir();
  await mkdir(dir, { recursive: true });
  await appendFile(path.join(dir, "orders.jsonl"), JSON.stringify(order) + "\n", "utf8");
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
