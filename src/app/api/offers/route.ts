import { NextResponse } from "next/server";
import { listLiveOffers } from "@/lib/server/offers-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Offres en vigueur, publiques. Jamais mises en cache : le panier ne doit pas afficher une offre que le serveur refuserait. */
export async function GET() {
  try {
    const offers = await listLiveOffers();
    return NextResponse.json({ offers }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[offers] lecture impossible :", err);
    return NextResponse.json({ error: "Offres momentanément indisponibles." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
