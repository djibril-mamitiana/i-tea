import type { NextRequest } from "next/server";
import { site } from "@/config/site";
import { startOfDay } from "@/lib/day";
import { adminJson, dbErrorResponse, requireAdmin } from "@/lib/server/admin-api";
import { countByStatus, listOrders, newOrderNumbers, statsSince, type OrderView } from "@/lib/server/orders-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VIEWS: OrderView[] = ["active", "done", "cancelled", "all"];

/** Périodes de l'historique : « today » = depuis minuit (heure du restaurant), puis 7 ou 30 jours glissants. */
const DAY_MS = 24 * 60 * 60 * 1000;
function periodStart(period: string | null, now: Date): Date | undefined {
  switch (period) {
    case "today":
      return startOfDay(now, site.timezone);
    case "7d":
      return new Date(now.getTime() - 7 * DAY_MS);
    case "30d":
      return new Date(now.getTime() - 30 * DAY_MS);
    default:
      return undefined;
  }
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request, { mutating: false });
  if (denied) return denied;

  const param = request.nextUrl.searchParams.get("view") ?? "active";
  const view = VIEWS.find((v) => v === param);
  if (!view) return adminJson({ error: "Vue inconnue." }, 400);
  const now = new Date();
  const since = periodStart(request.nextUrl.searchParams.get("period"), now);

  try {
    const [orders, counts, newNumbers, today] = await Promise.all([
      listOrders(view, 200, since),
      countByStatus(),
      newOrderNumbers(),
      statsSince(startOfDay(now, site.timezone)),
    ]);
    return adminJson({ orders, counts, newNumbers, today, serverTime: now.toISOString() });
  } catch (err) {
    return dbErrorResponse(err);
  }
}
