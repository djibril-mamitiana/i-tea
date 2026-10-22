import type { NextRequest } from "next/server";
import { isOrderStatus } from "@/lib/order-status";
import { adminJson, dbErrorResponse, requireAdmin } from "@/lib/server/admin-api";
import { updateOrderStatus } from "@/lib/server/orders-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NUMBER_FORMAT = /^IT-\d{6}-[A-Z0-9]{4}$/;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ number: string }> }) {
  const denied = requireAdmin(request, { mutating: true });
  if (denied) return denied;

  const { number } = await params;
  if (!NUMBER_FORMAT.test(number)) return adminJson({ error: "Numéro de commande invalide." }, 400);

  let status: unknown;
  try {
    status = (await request.json())?.status;
  } catch {
    return adminJson({ error: "Requête invalide." }, 400);
  }
  if (!isOrderStatus(status)) return adminJson({ error: "Statut invalide." }, 400);

  try {
    const order = await updateOrderStatus(number, status);
    if (!order) return adminJson({ error: "Commande introuvable." }, 404);
    return adminJson({ order });
  } catch (err) {
    return dbErrorResponse(err);
  }
}
