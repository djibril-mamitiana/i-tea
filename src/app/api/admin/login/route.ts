import type { NextRequest } from "next/server";
import { adminJson, clientIp, dbErrorResponse, sessionCookie } from "@/lib/server/admin-api";
import {
  adminConfig,
  createSessionToken,
  isLoginBlocked,
  isSameOrigin,
  passwordMatches,
  recordFailedLogin,
} from "@/lib/server/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const config = adminConfig();
  if (!config.ok) {
    return adminJson(
      {
        error:
          config.reason === "missing"
            ? "L'espace admin n'est pas configuré : définis la variable ADMIN_PASSWORD."
            : "Le mot de passe admin est trop court (10 caractères minimum).",
      },
      503,
    );
  }
  if (!isSameOrigin(request)) return adminJson({ error: "Requête refusée." }, 403);

  const raw = await request.text();
  let password = "";
  try {
    const body = raw.length < 2000 ? JSON.parse(raw) : null;
    if (typeof body?.password === "string") password = body.password;
  } catch {
    /* corps invalide : traité comme un mot de passe vide */
  }

  const ip = clientIp(request);
  try {
    if (await isLoginBlocked(ip)) {
      return adminJson({ error: "Trop de tentatives. Réessaie dans 10 minutes." }, 429);
    }

    if (!password || !passwordMatches(password, config.password)) {
      await recordFailedLogin(ip);
      await new Promise((resolve) => setTimeout(resolve, 400)); // ralentit les essais automatisés
      return adminJson({ error: "Mot de passe incorrect." }, 401);
    }
  } catch (err) {
    return dbErrorResponse(err);
  }

  const response = adminJson({ ok: true });
  response.cookies.set(sessionCookie(createSessionToken(config.password), request));
  return response;
}
