import type { NextRequest } from "next/server";
import { parseOfferInput } from "@/lib/offers";
import { adminJson, dbErrorResponse, requireAdmin } from "@/lib/server/admin-api";
import { createOffer, listOffers } from "@/lib/server/offers-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 50_000;

/** Toutes les offres (actives ou non) pour l'espace admin. */
export async function GET(request: NextRequest) {
  const denied = requireAdmin(request, { mutating: false });
  if (denied) return denied;
  try {
    return adminJson({ offers: await listOffers() });
  } catch (err) {
    return dbErrorResponse(err);
  }
}

/** Crée une offre. */
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request, { mutating: true });
  if (denied) return denied;

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return adminJson({ error: "Requête trop volumineuse." }, 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return adminJson({ error: "Requête invalide." }, 400);
  }

  const parsed = parseOfferInput(body);
  if (!parsed.ok) return adminJson({ error: parsed.error }, 400);

  try {
    return adminJson({ offer: await createOffer(parsed.value) }, 201);
  } catch (err) {
    return dbErrorResponse(err);
  }
}
