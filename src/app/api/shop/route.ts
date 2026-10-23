import { NextResponse } from "next/server";
import { DEFAULT_ORDERING } from "@/lib/shop";
import { getMenuStatus, getOrderingState } from "@/lib/server/shop-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** État public de la boutique : plats en rupture ou retirés, et pause des commandes. Jamais mis en cache. */
export async function GET() {
  try {
    const [menu, ordering] = await Promise.all([getMenuStatus(), getOrderingState()]);
    return NextResponse.json({ menu, ordering }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[shop] lecture impossible :", err);
    // Sans base : tout est considéré comme disponible (les commandes échoueront de toute façon côté serveur).
    return NextResponse.json({ menu: {}, ordering: DEFAULT_ORDERING, degraded: true }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
