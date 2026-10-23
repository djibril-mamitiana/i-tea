import type { NextRequest } from "next/server";
import { parseOfferInput } from "@/lib/offers";
import { adminJson, dbErrorResponse, requireAdmin } from "@/lib/server/admin-api";
import { deleteOffer, setOfferActive, updateOffer } from "@/lib/server/offers-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 50_000;
const ID_FORMAT = /^[a-z0-9][a-z0-9-]{0,63}$/;

async function readJson(request: NextRequest): Promise<unknown | undefined> {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/** Remplace le contenu d'une offre. */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request, { mutating: true });
  if (denied) return denied;
  const { id } = await params;
  if (!ID_FORMAT.test(id)) return adminJson({ error: "Offre introuvable." }, 404);

  const body = await readJson(request);
  if (body === undefined) return adminJson({ error: "Requête invalide." }, 400);
  const parsed = parseOfferInput(body);
  if (!parsed.ok) return adminJson({ error: parsed.error }, 400);

  try {
    const offer = await updateOffer(id, parsed.value);
    return offer ? adminJson({ offer }) : adminJson({ error: "Offre introuvable." }, 404);
  } catch (err) {
    return dbErrorResponse(err);
  }
}

/** Active ou désactive une offre ({ active: boolean }). */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request, { mutating: true });
  if (denied) return denied;
  const { id } = await params;
  if (!ID_FORMAT.test(id)) return adminJson({ error: "Offre introuvable." }, 404);

  const body = (await readJson(request)) as { active?: unknown } | undefined;
  if (!body || typeof body.active !== "boolean") return adminJson({ error: "Requête invalide." }, 400);

  try {
    const offer = await setOfferActive(id, body.active);
    return offer ? adminJson({ offer }) : adminJson({ error: "Offre introuvable." }, 404);
  } catch (err) {
    return dbErrorResponse(err);
  }
}

/** Supprime une offre. */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request, { mutating: true });
  if (denied) return denied;
  const { id } = await params;
  if (!ID_FORMAT.test(id)) return adminJson({ error: "Offre introuvable." }, 404);

  try {
    return (await deleteOffer(id)) ? adminJson({ ok: true }) : adminJson({ error: "Offre introuvable." }, 404);
  } catch (err) {
    return dbErrorResponse(err);
  }
}
