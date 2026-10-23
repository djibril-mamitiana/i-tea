import type { NextRequest } from "next/server";
import { parseMenuChanges } from "@/lib/shop";
import { adminJson, dbErrorResponse, requireAdmin } from "@/lib/server/admin-api";
import { applyMenuChanges, getMenuStatus } from "@/lib/server/shop-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Plats en rupture ou retirés du site. */
export async function GET(request: NextRequest) {
  const denied = requireAdmin(request, { mutating: false });
  if (denied) return denied;
  try {
    return adminJson({ status: await getMenuStatus() });
  } catch (err) {
    return dbErrorResponse(err);
  }
}

/** Applique des changements de disponibilité : { changes: { productId: "available" | "unavailable" | "hidden" } }. */
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request, { mutating: true });
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return adminJson({ error: "Requête invalide." }, 400);
  }
  const parsed = parseMenuChanges(body);
  if (!parsed.ok) return adminJson({ error: parsed.error }, 400);

  try {
    return adminJson({ status: await applyMenuChanges(parsed.changes) });
  } catch (err) {
    return dbErrorResponse(err);
  }
}
