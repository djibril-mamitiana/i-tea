import { mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * Base de données : PostgreSQL.
 *
 *  - Production / Vercel : une base Postgres, par exemple Neon → variable DATABASE_URL
 *    (la variable POSTGRES_URL, posée par certaines intégrations Vercel, est aussi acceptée).
 *  - Développement / serveur à disque persistant : sans variable, un Postgres embarqué (PGlite)
 *    stocké dans `data/pglite` — même SQL, aucune installation, aucun compte nécessaire.
 *
 * Les tables sont créées automatiquement au premier accès.
 */

export type Row = Record<string, unknown>;

export interface Statement {
  text: string;
  params?: unknown[];
}

export interface Db {
  query(text: string, params?: unknown[]): Promise<Row[]>;
  /** Exécute plusieurs instructions dans une seule transaction. */
  batch(statements: Statement[]): Promise<void>;
  /** Ferme la connexion (utile aux tests et aux scripts ; sans effet avec le driver HTTP de Neon). */
  close(): Promise<void>;
}

export class DatabaseUnavailableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "DatabaseUnavailableError";
  }
}

const SCHEMA: Statement[] = [
  // Verrou : deux démarrages simultanés (serverless) ne créent pas les tables en même temps.
  { text: "SELECT pg_advisory_xact_lock(727274)" },
  {
    text: `CREATE TABLE IF NOT EXISTS orders (
      number         TEXT PRIMARY KEY,
      created_at     TIMESTAMPTZ NOT NULL,
      updated_at     TIMESTAMPTZ NOT NULL,
      status         TEXT NOT NULL DEFAULT 'new'
                     CHECK (status IN ('new', 'preparing', 'ready', 'completed', 'cancelled')),
      mode           TEXT NOT NULL CHECK (mode IN ('pickup', 'delivery')),
      customer_name  TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      total          NUMERIC(10, 2) NOT NULL,
      data           JSONB NOT NULL
    )`,
  },
  { text: "CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at)" },
  { text: "CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status, created_at)" },
  { text: "CREATE TABLE IF NOT EXISTS admin_login_attempts (ip TEXT NOT NULL, at BIGINT NOT NULL)" },
  { text: "CREATE INDEX IF NOT EXISTS idx_login_attempts ON admin_login_attempts (ip, at)" },
  // Offres gérées depuis l'admin (voir src/lib/offers.ts) : le détail est dans la colonne JSONB `data`.
  {
    text: `CREATE TABLE IF NOT EXISTS offers (
      id         TEXT PRIMARY KEY,
      position   INTEGER NOT NULL DEFAULT 0,
      active     BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      data       JSONB NOT NULL
    )`,
  },
  // Petits repères internes (ex. « les offres de départ ont été créées », pause des commandes).
  { text: "CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)" },
  // Plats en rupture ou retirés du site (un plat absent de cette table est disponible).
  {
    text: `CREATE TABLE IF NOT EXISTS menu_status (
      product_id TEXT PRIMARY KEY,
      state      TEXT NOT NULL CHECK (state IN ('unavailable', 'hidden')),
      updated_at TIMESTAMPTZ NOT NULL
    )`,
  },
];

type Source = { kind: "postgres"; url: string } | { kind: "pglite"; dir: string };

function resolveSource(): Source {
  const url = (process.env.DATABASE_URL ?? process.env.POSTGRES_URL)?.trim();
  if (url) {
    if (!/^postgres(ql)?:\/\//i.test(url)) {
      throw new DatabaseUnavailableError("DATABASE_URL doit être une URL PostgreSQL (postgresql://…).");
    }
    return { kind: "postgres", url };
  }
  if (process.env.VERCEL) {
    throw new DatabaseUnavailableError(
      "DATABASE_URL est manquant : sur Vercel, une base Postgres (ex. Neon) est nécessaire (voir README).",
    );
  }
  return { kind: "pglite", dir: process.env.PGLITE_DATA_DIR ?? "./data/pglite" };
}

async function connect(source: Source): Promise<Db> {
  if (source.kind === "postgres") {
    // Driver Neon : requêtes HTTP, adapté au serverless (aucune connexion à maintenir ouverte).
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(source.url);
    return {
      query: async (text, params = []) => (await sql.query(text, params)) as Row[],
      batch: async (statements) => {
        await sql.transaction(statements.map((s) => sql.query(s.text, s.params ?? [])));
      },
      close: async () => {},
    };
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const inMemory = source.dir.startsWith("memory:");
  if (!inMemory) await mkdir(path.resolve(source.dir), { recursive: true });
  const pg = new PGlite(inMemory ? source.dir : path.resolve(source.dir));
  await pg.waitReady;
  return {
    query: async (text, params = []) => (await pg.query<Row>(text, params)).rows,
    batch: async (statements) => {
      await pg.transaction(async (tx) => {
        for (const s of statements) await tx.query(s.text, s.params ?? []);
      });
    },
    close: () => pg.close(),
  };
}

async function init(): Promise<Db> {
  try {
    const db = await connect(resolveSource());
    // Une requête légère suffit à constater que le schéma est déjà en place.
    const [present] = await db.query(
      "SELECT to_regclass('orders') AS orders, to_regclass('admin_login_attempts') AS attempts, to_regclass('offers') AS offers, to_regclass('app_meta') AS meta, to_regclass('menu_status') AS menu",
    );
    // Les instructions de SCHEMA sont idempotentes : une base plus ancienne reçoit simplement les tables manquantes.
    if (!present?.orders || !present?.attempts || !present?.offers || !present?.meta || !present?.menu) await db.batch(SCHEMA);
    return db;
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) throw err;
    throw new DatabaseUnavailableError("Connexion à la base de données impossible.", { cause: err });
  }
}

const globalForDb = globalThis as unknown as { __iteaDb?: Promise<Db> };

/** Client partagé (mis en cache, y compris entre rechargements à chaud en développement). */
export function getDb(): Promise<Db> {
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
