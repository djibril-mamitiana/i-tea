import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import { getProduct, products } from "../src/data/menu.ts";
import { startOfDay } from "../src/lib/day.ts";
import { buildOrder } from "../src/lib/order-validation.ts";
import { defaultOffers, validateRewards } from "../src/lib/offers.ts";
import { defaultSelections } from "../src/lib/pricing.ts";
import { getDb, resetDbForTests } from "../src/lib/server/db.ts";
import { listOrders, saveOrder, statsSince } from "../src/lib/server/orders-store.ts";
import { applyMenuChanges, getMenuStatus, getOrderingState, setOrderingState } from "../src/lib/server/shop-store.ts";
import {
  applyChanges,
  DEFAULT_ORDERING,
  parseMenuChanges,
  parseOrderingInput,
  sanitizeOrdering,
  stateOf,
  unavailableMessage,
} from "../src/lib/shop.ts";
import type { ConfirmedOrder, OrderRequest } from "../src/lib/types.ts";
import { orderable } from "./fixtures.ts";

const NOW = new Date("2026-10-23T10:00:00Z");

describe("disponibilité des plats", () => {
  const a = products[0].id;
  const b = products[1].id;

  test("un plat absent de la liste est disponible", () => {
    assert.equal(stateOf({}, a), "available");
    assert.equal(stateOf({ [a]: "hidden" }, a), "hidden");
    assert.equal(stateOf({ [a]: "hidden" }, b), "available");
  });

  test("changements : validation et application", () => {
    assert.deepEqual(parseMenuChanges({ changes: { [a]: "unavailable", [b]: "available" } }), { ok: true, changes: { [a]: "unavailable", [b]: "available" } });
    for (const bad of [null, {}, { changes: {} }, { changes: [] }, { changes: { fantome: "hidden" } }, { changes: { [a]: "casse" } }, { changes: { [a]: 3 } }]) {
      assert.equal(parseMenuChanges(bad).ok, false, JSON.stringify(bad));
    }
    const status = applyChanges({ [a]: "hidden", [b]: "unavailable" }, { [a]: "available", [b]: "hidden" });
    assert.deepEqual(status, { [b]: "hidden" }, "revenir à « disponible » supprime l'entrée");
  });

  test("messages clairs pour le client", () => {
    assert.equal(unavailableMessage("Nems", "hidden"), "« Nems » n'est plus proposé.");
    assert.equal(unavailableMessage("Nems", "unavailable"), "« Nems » n'est plus disponible.");
  });
});

describe("commande : plats en rupture ou retirés", () => {
  const [first, second] = orderable;
  const request = (items = [first, second]): OrderRequest => ({
    mode: "pickup",
    paymentMethod: "cash",
    customer: { name: "Test Client", phone: "06 12 34 56 78" },
    items: items.map((p) => ({ productId: p.id, qty: 1, selections: defaultSelections(p) })),
  });

  test("sans restriction, tout passe", () => {
    assert.ok(buildOrder(request(), "IT-TEST", NOW, [], {}).ok);
  });

  test("un plat en rupture ou retiré est refusé (409) avec un message précis, les autres sont signalés intacts", () => {
    for (const state of ["unavailable", "hidden"] as const) {
      const r = buildOrder(request(), "IT-TEST", NOW, [], { [first.id]: state });
      assert.ok(!r.ok, state);
      if (!r.ok) {
        assert.equal(r.status, 409);
        assert.deepEqual(r.error.issues?.map((i) => i.productId), [first.id]);
        assert.equal(r.error.issues![0].message, state === "hidden" ? `« ${first.name} » n'est plus proposé.` : `« ${first.name} » n'est plus disponible.`);
      }
    }
  });

  test("le contrôle ne touche pas aux autres plats du panier", () => {
    assert.ok(buildOrder(request([second]), "IT-TEST", NOW, [], { [first.id]: "hidden" }).ok);
  });

  test("un cadeau lié à un plat en rupture est refusé", () => {
    const [offer] = defaultOffers();
    const trigger = getProduct(offer.triggerProductIds[0])!;
    const check = (menuStatus: Record<string, "unavailable" | "hidden">) =>
      validateRewards({
        offers: [offer],
        selections: [{ offerId: offer.id, alternativeId: "taiyakis", choiceId: "nutella" }],
        lines: [{ productId: trigger.id, qty: 1 }],
        mode: "pickup",
        now: NOW,
        menuStatus,
      });
    assert.ok(check({}).ok);
    assert.ok(!check({ taiyaki: "unavailable" }).ok);
    assert.ok(!check({ taiyaki: "hidden" }).ok);
    assert.ok(check({ "bubble-waffle": "hidden" }).ok, "l'autre cadeau n'est pas concerné");
  });
});

describe("pause des commandes", () => {
  test("saisie : le message n'est gardé que pendant la pause", () => {
    assert.deepEqual(parseOrderingInput({ paused: true, message: "  Fermeture exceptionnelle  " }), { ok: true, value: { paused: true, message: "Fermeture exceptionnelle" } });
    assert.deepEqual(parseOrderingInput({ paused: false, message: "ancien message" }), { ok: true, value: { paused: false, message: "" } });
    for (const bad of [null, {}, { paused: "oui" }, { paused: true, message: "x".repeat(201) }]) assert.equal(parseOrderingInput(bad).ok, false, JSON.stringify(bad));
  });

  test("relecture tolérante", () => {
    assert.deepEqual(sanitizeOrdering(null), DEFAULT_ORDERING);
    assert.deepEqual(sanitizeOrdering({ paused: "true" }), DEFAULT_ORDERING);
    assert.deepEqual(sanitizeOrdering({ paused: true, message: "Fermé" }), { paused: true, message: "Fermé" });
  });
});

describe("début de journée", () => {
  test("minuit à Paris, heure d'été puis heure d'hiver", () => {
    assert.equal(startOfDay(new Date("2026-10-23T10:00:00Z"), "Europe/Paris").toISOString(), "2026-10-22T22:00:00.000Z");
    assert.equal(startOfDay(new Date("2026-10-23T23:30:00Z"), "Europe/Paris").toISOString(), "2026-10-23T22:00:00.000Z", "après minuit à Paris : jour suivant");
    assert.equal(startOfDay(new Date("2026-10-26T10:00:00Z"), "Europe/Paris").toISOString(), "2026-10-25T23:00:00.000Z", "après le passage à l'heure d'hiver");
    assert.equal(startOfDay(new Date("2026-03-29T12:00:00Z"), "Europe/Paris").toISOString(), "2026-03-28T23:00:00.000Z", "jour du passage à l'heure d'été");
    assert.equal(startOfDay(new Date("2026-10-23T10:00:00Z"), "UTC").toISOString(), "2026-10-23T00:00:00.000Z");
  });
});

describe("état de la boutique en base (PGlite en mémoire)", () => {
  const makeOrder = (number: string, createdAt: string, total: number): ConfirmedOrder => ({
    number,
    createdAt,
    mode: "pickup",
    paymentMethod: "cash",
    paymentLabel: "Paiement à la réception",
    customer: { name: "Test", phone: "0612345678" },
    items: [{ productId: "x", name: "X", qty: 1, unitPrice: total, lineTotal: total, optionLabels: [] }],
    totals: { subtotal: total, deliveryFee: 0, total, freeDeliveryRemaining: null, minOrderMissing: 0 },
  });

  before(() => {
    delete process.env.DATABASE_URL;
    delete process.env.POSTGRES_URL;
    delete process.env.VERCEL;
    process.env.PGLITE_DATA_DIR = "memory://";
    resetDbForTests();
  });

  after(async () => {
    await (await getDb()).close();
    resetDbForTests();
  });

  test("plats : enregistrement, relecture, retour à « disponible »", async () => {
    assert.deepEqual(await getMenuStatus(), {});
    assert.deepEqual(await applyMenuChanges({ nems: "unavailable", gyozas: "hidden" }), { nems: "unavailable", gyozas: "hidden" });
    assert.deepEqual(await applyMenuChanges({ nems: "hidden", gyozas: "available" }), { nems: "hidden" }, "mise à jour + suppression");
    assert.deepEqual(await getMenuStatus(), { nems: "hidden" });
    await assert.rejects(async () => (await getDb()).query("INSERT INTO menu_status VALUES ($1, $2, now())", ["x", "casse"]), "la base refuse un état inconnu");
  });

  test("pause : état par défaut, activation, relecture", async () => {
    assert.deepEqual(await getOrderingState(), DEFAULT_ORDERING);
    await setOrderingState({ paused: true, message: "Rush en cuisine" });
    assert.deepEqual(await getOrderingState(), { paused: true, message: "Rush en cuisine" });
    await setOrderingState({ paused: false, message: "" });
    assert.deepEqual(await getOrderingState(), DEFAULT_ORDERING);
  });

  test("statistiques du jour et historique par période", async () => {
    await saveOrder(makeOrder("IT-261023-AAAA", "2026-10-23T08:00:00.000Z", 12.5));
    await saveOrder(makeOrder("IT-261023-BBBB", "2026-10-23T09:00:00.000Z", 7.3));
    await saveOrder(makeOrder("IT-261022-CCCC", "2026-10-22T10:00:00.000Z", 20));
    await saveOrder(makeOrder("IT-261023-DDDD", "2026-10-23T09:30:00.000Z", 50));
    const db = await getDb();
    await db.query("UPDATE orders SET status = 'cancelled' WHERE number = $1", ["IT-261023-DDDD"]);

    const midnight = startOfDay(NOW, "Europe/Paris");
    assert.deepEqual(await statsSince(midnight), { orders: 2, total: 19.8 }, "annulées exclues, arrondi au centime");
    assert.deepEqual((await listOrders("all", 50, midnight)).map((o) => o.number).sort(), ["IT-261023-AAAA", "IT-261023-BBBB", "IT-261023-DDDD"]);
    assert.equal((await listOrders("all", 50)).length, 4, "sans période : tout l'historique");
    assert.deepEqual((await listOrders("cancelled", 50, midnight)).map((o) => o.number), ["IT-261023-DDDD"]);
  });
});
