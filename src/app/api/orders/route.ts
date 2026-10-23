import { NextResponse } from "next/server";
import { buildOrder, parseOrderRequest } from "@/lib/order-validation";
import { notifyRestaurant } from "@/lib/server/notify";
import { listOffers } from "@/lib/server/offers-store";
import { getMenuStatus, getOrderingState } from "@/lib/server/shop-store";
import { PAUSE_DEFAULT_TEXT } from "@/lib/shop";
import { newOrderNumber, OrderNumberTakenError, saveOrder } from "@/lib/server/orders-store";
import type { OrderApiError } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 50_000;

// Limitation simple par IP (en mémoire : suffisant contre les abus basiques,
// à remplacer par un store partagé si le site tourne sur plusieurs instances).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS_PER_WINDOW = 40; // tentatives (même invalides : on laisse corriger un formulaire)
const MAX_ORDERS_PER_WINDOW = 6; // commandes réellement enregistrées

function createLimiter(max: number) {
  const hits = new Map<string, number[]>();
  const recent = (key: string) => (hits.get(key) ?? []).filter((t) => Date.now() - t < WINDOW_MS);
  return {
    isFull: (key: string) => recent(key).length >= max,
    record: (key: string) => {
      if (hits.size > 5000) hits.clear();
      hits.set(key, [...recent(key), Date.now()]);
    },
  };
}

const attempts = createLimiter(MAX_ATTEMPTS_PER_WINDOW);
const saved = createLimiter(MAX_ORDERS_PER_WINDOW);

const error = (status: number, body: OrderApiError) => NextResponse.json(body, { status });
const TOO_MANY = { error: "Trop de commandes en peu de temps. Réessaie dans quelques minutes." };

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (attempts.isFull(ip) || saved.isFull(ip)) return error(429, TOO_MANY);
  attempts.record(ip);

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return error(413, { error: "Requête trop volumineuse." });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return error(400, { error: "Requête invalide." });
  }

  const parsed = parseOrderRequest(body);
  if (!parsed || parsed.website) return error(400, { error: "Requête invalide." });

  const now = new Date();
  // L'état de la boutique vient de la base, jamais du navigateur : pause des commandes, plats en rupture ou retirés,
  // et offres (pour vérifier les cadeaux demandés).
  let offers: Awaited<ReturnType<typeof listOffers>> = [];
  let menuStatus: Awaited<ReturnType<typeof getMenuStatus>> = {};
  try {
    const [ordering, status, liveOffers] = await Promise.all([
      getOrderingState(),
      getMenuStatus(),
      parsed.rewards?.length ? listOffers() : Promise.resolve([]),
    ]);
    if (ordering.paused) return error(503, { error: ordering.message || PAUSE_DEFAULT_TEXT, code: "orders_paused" });
    menuStatus = status;
    offers = liveOffers;
  } catch (err) {
    console.error("[orders] lecture de l'état de la boutique impossible :", err);
    return error(503, { error: "Les commandes en ligne sont momentanément indisponibles. Contacte directement le restaurant." });
  }
  const result = buildOrder(parsed, newOrderNumber(now), now, offers, menuStatus);
  if (!result.ok) return error(result.status, result.error);

  // Numéro déjà pris (très improbable) : on en tire un autre, 3 essais maximum.
  let order = result.order;
  try {
    for (let attempt = 1; ; attempt++) {
      try {
        await saveOrder(order);
        break;
      } catch (err) {
        if (!(err instanceof OrderNumberTakenError) || attempt >= 3) throw err;
        order = { ...order, number: newOrderNumber(now) };
      }
    }
  } catch (err) {
    console.error("[orders] enregistrement impossible :", err);
    return error(503, {
      error: "Les commandes en ligne sont momentanément indisponibles. Contacte directement le restaurant.",
    });
  }

  saved.record(ip);

  // La commande est enregistrée ; la notification est un bonus qui ne doit jamais la faire échouer.
  const notified = await notifyRestaurant(order);

  return NextResponse.json({ order, notified }, { status: 201 });
}
