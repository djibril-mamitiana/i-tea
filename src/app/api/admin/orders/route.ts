import type { NextRequest } from "next/server";
import { adminJson, dbErrorResponse, requireAdmin } from "@/lib/server/admin-api";
import { countByStatus, listOrders, newOrderNumbers, type OrderView } from "@/lib/server/orders-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VIEWS: OrderView[] = ["active", "done", "cancelled", "all"];

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request, { mutating: false });
  if (denied) return denied;

  const param = request.nextUrl.searchParams.get("view") ?? "active";
  const view = VIEWS.find((v) => v === param);
  if (!view) return adminJson({ error: "Vue inconnue." }, 400);

  try {
    const [orders, counts, newNumbers] = await Promise.all([listOrders(view), countByStatus(), newOrderNumbers()]);
    return adminJson({ orders, counts, newNumbers, serverTime: new Date().toISOString() });
  } catch (err) {
    return dbErrorResponse(err);
  }
}
