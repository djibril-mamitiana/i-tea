import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { getDb } from "./db.ts";

/**
 * Authentification de l'espace admin : un mot de passe unique (ADMIN_PASSWORD) et une session
 * stateless — un cookie httpOnly signé en HMAC-SHA256, valable 12 h. Aucune dépendance externe.
 *
 *  - Changer le mot de passe déconnecte toutes les sessions (la clé de signature en dépend).
 *  - ADMIN_SESSION_SECRET (facultatif) ajoute une clé de signature indépendante du mot de passe.
 */

export const SESSION_COOKIE = "itea_admin";
export const SESSION_TTL_SECONDS = 12 * 60 * 60;
export const MIN_PASSWORD_LENGTH = 10;

export type AdminConfig = { ok: true; password: string } | { ok: false; reason: "missing" | "too-short" };

export function adminConfig(env: NodeJS.ProcessEnv = process.env): AdminConfig {
  const password = env.ADMIN_PASSWORD ?? "";
  if (!password) return { ok: false, reason: "missing" };
  if (password.length < MIN_PASSWORD_LENGTH) return { ok: false, reason: "too-short" };
  return { ok: true, password };
}

const sha256 = (value: string) => createHash("sha256").update(value).digest();

/** Comparaison en temps constant (pas de fuite par le temps de réponse). */
export function passwordMatches(input: string, expected: string): boolean {
  return timingSafeEqual(sha256(input), sha256(expected));
}

const signingKey = (password: string) => process.env.ADMIN_SESSION_SECRET || `itea-admin-session:${password}`;

const sign = (payload: string, password: string) => createHmac("sha256", signingKey(password)).update(payload).digest();

export function createSessionToken(password: string, now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ exp: now + SESSION_TTL_SECONDS * 1000 })).toString("base64url");
  return `${payload}.${sign(payload, password).toString("base64url")}`;
}

export function verifySessionToken(token: string | undefined, password: string, now = Date.now()): boolean {
  if (!token) return false;
  const [payload, signature, ...rest] = token.split(".");
  if (!payload || !signature || rest.length) return false;
  const expected = sign(payload, password);
  const given = Buffer.from(signature, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof exp === "number" && exp > now;
  } catch {
    return false;
  }
}

/** Vrai si le cookie fourni correspond à une session admin valide. */
export function isValidSession(cookieValue: string | undefined): boolean {
  const config = adminConfig();
  return config.ok && verifySessionToken(cookieValue, config.password);
}

/* ---------- Protection contre les essais répétés (stockée en base : fonctionne en serverless) ---------- */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILURES = 8;

export async function isLoginBlocked(ip: string, now = Date.now()): Promise<boolean> {
  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT COUNT(*) AS n FROM admin_login_attempts WHERE ip = ? AND at > ?",
    args: [ip, now - WINDOW_MS],
  });
  return Number(result.rows[0]?.n ?? 0) >= MAX_FAILURES;
}

export async function recordFailedLogin(ip: string, now = Date.now()): Promise<void> {
  const db = await getDb();
  await db.batch(
    [
      { sql: "INSERT INTO admin_login_attempts (ip, at) VALUES (?, ?)", args: [ip, now] },
      { sql: "DELETE FROM admin_login_attempts WHERE at < ?", args: [now - 60 * 60 * 1000] },
    ],
    "write",
  );
}

/** Une action de modification n'est acceptée que depuis une page de ce même site. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
