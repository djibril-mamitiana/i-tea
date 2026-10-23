import type { NextRequest } from "next/server";
import { parseOrderingInput } from "@/lib/shop";
import { adminJson, dbErrorResponse, requireAdmin } from "@/lib/server/admin-api";
import { getOrderingState, setOrderingState } from "@/lib/server/shop-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Pause des commandes en ligne : lecture. */
export async function GET(request: NextRequest) {
  const denied = requireAdmin(request, { mutating: false });
  if (denied) return denied;
  try {
    return adminJson({ ordering: await getOrderingState() });
  } catch (err) {
    return dbErrorResponse(err);
  }
}

/** Pause des commandes en ligne : { paused: boolean, message?: string }. */
export async function PUT(request: NextRequest) {
  const denied = requireAdmin(request, { mutating: true });
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return adminJson({ error: "Requête invalide." }, 400);
  }
  const parsed = parseOrderingInput(body);
  if (!parsed.ok) return adminJson({ error: parsed.error }, 400);

  try {
    return adminJson({ ordering: await setOrderingState(parsed.value) });
  } catch (err) {
    return dbErrorResponse(err);
  }
}
