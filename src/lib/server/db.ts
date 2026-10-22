import { mkdir } from "node:fs/promises";
import path from "node:path";
import type { Client } from "@libsql/client";

/**
 * Base de données : libSQL (SQLite), un seul moteur pour le local et la production.
 *
 *  - Production / Vercel : une base Turso → TURSO_DATABASE_URL (libsql://…) + TURSO_AUTH_TOKEN.
 *  - Développement / serveur à disque persistant : sans variable, un fichier `data/itea.db`.
 *
 * Les tables sont créées automatiquement au premier accès.
 */

export class DatabaseUnavailableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "DatabaseUnavailableError";
  }
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS orders (
    number TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    mode TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    total REAL NOT NULL,
    data TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status, created_at)`,
  `CREATE TABLE IF NOT EXISTS admin_login_attempts (
    ip TEXT NOT NULL,
    at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_login_attempts ON admin_login_attempts (ip, at)`,
];

function resolveUrl(): string {
  const configured = process.env.TURSO_DATABASE_URL?.trim();
  if (configured) return configured;
  if (process.env.VERCEL) {
    throw new DatabaseUnavailableError(
      "TURSO_DATABASE_URL est manquant : sur Vercel, une base de données Turso est nécessaire (voir README).",
    );
  }
  return "file:./data/itea.db";
}

async function connect(): Promise<Client> {
  const url = resolveUrl();

  if (url.startsWith("file:")) {
    // Fichier local : on crée le dossier au besoin (sauf base en mémoire).
    const file = url.slice("file:".length);
    if (file && !file.startsWith(":memory:")) await mkdir(path.dirname(path.resolve(file)), { recursive: true });
    const { createClient } = await import("@libsql/client");
    return createClient({ url });
  }

  // Base distante : client 100 % JavaScript (fetch), sans module natif — idéal pour Vercel.
  const { createClient } = await import("@libsql/client/web");
  return createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
}

async function init(): Promise<Client> {
  try {
    const client = await connect();
    await client.batch(SCHEMA, "write");
    return client;
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) throw err;
    throw new DatabaseUnavailableError("Connexion à la base de données impossible.", { cause: err });
  }
}

const globalForDb = globalThis as unknown as { __iteaDb?: Promise<Client> };

/** Client partagé (mis en cache, y compris entre rechargements à chaud en développement). */
export function getDb(): Promise<Client> {
  if (!globalForDb.__iteaDb) {
    globalForDb.__iteaDb = init().catch((err) => {
      globalForDb.__iteaDb = undefined; // permet de réessayer à la requête suivante
      throw err;
    });
  }
  return globalForDb.__iteaDb;
}

/** Pour les tests : oublie la connexion en cache. */
export function resetDbForTests(): void {
  globalForDb.__iteaDb = undefined;
}
