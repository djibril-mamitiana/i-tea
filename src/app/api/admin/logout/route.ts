import type { NextRequest } from "next/server";
import { adminJson, sessionCookie } from "@/lib/server/admin-api";
import { isSameOrigin } from "@/lib/server/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return adminJson({ error: "Requête refusée." }, 403);
  const response = adminJson({ ok: true });
  response.cookies.set(sessionCookie("", request));
  return response;
}
