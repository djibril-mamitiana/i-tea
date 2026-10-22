import { NextResponse, type NextRequest } from "next/server";
import { adminConfig, isSameOrigin, isValidSession, SESSION_COOKIE, SESSION_TTL_SECONDS } from "./admin-auth.ts";
import { DatabaseUnavailableError } from "./db.ts";

/** Utilitaires communs aux routes /api/admin/*. Toutes les réponses sont privées (no-store). */

export function adminJson(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export const clientIp = (request: Request) => request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

/**
 * Vérifie la session (et, pour les modifications, l'origine de la requête).
 * Retourne une réponse d'erreur à renvoyer telle quelle, ou null si tout est en règle.
 */
export function requireAdmin(request: NextRequest, { mutating }: { mutating: boolean }): NextResponse | null {
  if (!adminConfig().ok) return adminJson({ error: "L'espace admin n'est pas configuré." }, 503);
  if (mutating && !isSameOrigin(request)) return adminJson({ error: "Requête refusée." }, 403);
  if (!isValidSession(request.cookies.get(SESSION_COOKIE)?.value)) {
    return adminJson({ error: "Session expirée. Reconnecte-toi." }, 401);
  }
  return null;
}

export function isHttps(request: Request): boolean {
  return request.headers.get("x-forwarded-proto") === "https" || new URL(request.url).protocol === "https:";
}

export function sessionCookie(token: string, request: Request) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "strict" as const,
    secure: isHttps(request),
    path: "/",
    maxAge: token ? SESSION_TTL_SECONDS : 0,
  };
}

/** Transforme une erreur de base de données en réponse lisible. */
export function dbErrorResponse(err: unknown): NextResponse {
  if (err instanceof DatabaseUnavailableError) {
    console.error("[admin] base de données indisponible :", err.message, err.cause ?? "");
    return adminJson({ error: "Base de données indisponible. Vérifie la configuration (voir README)." }, 503);
  }
  console.error("[admin] erreur :", err);
  return adminJson({ error: "Une erreur est survenue." }, 500);
}
