import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import { getProduct } from "../src/data/menu.ts";
import { buildOrder } from "../src/lib/order-validation.ts";
import {
  appliesTo,
  defaultOffers,
  fallbackOffers,
  isLive,
  offerProgress,
  parseOfferInput,
  reconcileRewards,
  rewardsEarned,
  sanitizeRewards,
  todayIso,
  validateRewards,
  type Offer,
} from "../src/lib/offers.ts";
import { defaultSelections, roundMoney, unitPrice } from "../src/lib/pricing.ts";
import { getDb, resetDbForTests } from "../src/lib/server/db.ts";
import { createOffer, deleteOffer, getOffer, listLiveOffers, listOffers, setOfferActive, updateOffer } from "../src/lib/server/offers-store.ts";
import type { OrderRequest } from "../src/lib/types.ts";

const NOW = new Date("2026-10-23T10:00:00Z");
const trigger = getProduct(defaultOffers()[0].triggerProductIds[0])!;

const offer = (extra: Partial<Offer> = {}): Offer => ({
  id: "t1",
  kind: "free_item",
  title: "Une boisson, un cadeau",
  description: "",
  active: true,
  startsAt: null,
  endsAt: null,
  modes: ["pickup"],
  triggerProductIds: [trigger.id],
  minQty: 2,
  maxRewards: 2,
  alternatives: [
    { id: "a", label: "Cadeau A", choiceLabel: "Parfum", choices: [{ id: "x", label: "X" }, { id: "y", label: "Y" }] },
    { id: "b", label: "Cadeau B", choices: [] },
  ],
  position: 0,
  ...extra,
});

const lines = (qty: number) => [{ productId: trigger.id, qty }, { productId: "autre", qty: 5 }];

describe("offres de départ", () => {
  test("l'offre d'I Tea : boisson achetée, gourmandise offerte, à emporter", () => {
    const [free, loyalty] = defaultOffers();
    assert.equal(free.kind, "free_item");
    assert.deepEqual(free.modes, ["pickup"]);
    assert.ok(free.triggerProductIds.length >= 8 && free.triggerProductIds.every((id) => getProduct(id)));
    assert.ok(free.triggerProductIds.includes("brown-sugar") && free.triggerProductIds.includes("matcha-latte"));
    assert.ok(!free.triggerProductIds.some((id) => /^(taro|cacao)/.test(id)), "les Special series ne comptent pas");
    assert.deepEqual(free.alternatives.map((a) => a.id), ["bubble-waffle", "taiyakis"]);
    assert.ok(free.alternatives.every((a) => a.choices.length >= 5 && a.productId && getProduct(a.productId)));
    assert.equal(loyalty.kind, "info");
  });

  test("repli sans base : seulement des annonces, aucun cadeau applicable", () => {
    for (const o of fallbackOffers()) assert.ok(o.kind === "info" && !appliesTo(o, "pickup"));
  });
});

describe("validité d'une offre", () => {
  test("active et dans sa période (fuseau du restaurant)", () => {
    assert.equal(todayIso(new Date("2026-10-23T23:30:00Z")), "2026-10-24", "23h30 UTC = minuit passé à Paris");
    assert.ok(isLive(offer(), NOW));
    assert.ok(!isLive(offer({ active: false }), NOW));
    assert.ok(isLive(offer({ startsAt: "2026-10-23" }), NOW), "début inclus");
    assert.ok(!isLive(offer({ startsAt: "2026-10-24" }), NOW));
    assert.ok(isLive(offer({ endsAt: "2026-10-23" }), NOW), "fin incluse");
    assert.ok(!isLive(offer({ endsAt: "2026-10-22" }), NOW));
  });
});

describe("cadeaux gagnés", () => {
  test("un cadeau par tranche d'achats, plafonné", () => {
    const o = offer();
    assert.equal(rewardsEarned(o, lines(1), "pickup"), 0);
    assert.equal(rewardsEarned(o, lines(2), "pickup"), 1);
    assert.equal(rewardsEarned(o, lines(5), "pickup"), 2);
    assert.equal(rewardsEarned(o, lines(40), "pickup"), 2, "plafond maxRewards");
  });

  test("seuls les produits de l'offre comptent, et seulement dans les modes prévus", () => {
    const o = offer();
    assert.equal(rewardsEarned(o, [{ productId: "autre", qty: 9 }], "pickup"), 0);
    assert.equal(rewardsEarned(o, lines(4), "delivery"), 0);
    assert.equal(rewardsEarned(offer({ modes: ["pickup", "delivery"] }), lines(4), "delivery"), 2);
    assert.equal(rewardsEarned(offer({ kind: "info" }), lines(4), "pickup"), 0);
  });

  test("progression : cadeaux disponibles et produits manquants", () => {
    const [p0] = offerProgress([offer()], lines(1), [], "pickup");
    assert.deepEqual({ earned: p0.earned, remaining: p0.remaining, toUnlock: p0.toUnlock }, { earned: 0, remaining: 0, toUnlock: 1 });
    const [p1] = offerProgress([offer()], lines(2), [{ offerId: "t1", alternativeId: "b" }], "pickup");
    assert.deepEqual({ earned: p1.earned, claimed: p1.claimed, remaining: p1.remaining, toUnlock: p1.toUnlock }, { earned: 1, claimed: 1, remaining: 0, toUnlock: 2 });
    const [p2] = offerProgress([offer()], lines(4), [], "pickup");
    assert.equal(p2.toUnlock, 0, "maximum atteint");
    assert.deepEqual(offerProgress([offer()], lines(2), [], "delivery"), [], "offre non applicable en livraison");
  });
});

describe("vérification des cadeaux (serveur)", () => {
  const check = (selections: Parameters<typeof validateRewards>[0]["selections"], extra: Partial<Parameters<typeof validateRewards>[0]> = {}) =>
    validateRewards({ offers: [offer()], selections, lines: lines(2), mode: "pickup", now: NOW, ...extra });

  test("cadeau valide : ligne à 0 €, marquée offerte", () => {
    const r = check([{ offerId: "t1", alternativeId: "a", choiceId: "y" }]);
    assert.ok(r.ok);
    if (r.ok) {
      assert.deepEqual(r.items, [
        { productId: "offer:t1:a", name: "Offert : Cadeau A", qty: 1, unitPrice: 0, lineTotal: 0, optionLabels: ["Y"], reward: true, offerId: "t1" },
      ]);
    }
    assert.ok(check([{ offerId: "t1", alternativeId: "b" }]).ok, "cadeau sans choix");
  });

  test("refus : offre inconnue, terminée, désactivée ou hors mode", () => {
    const sel = [{ offerId: "t1", alternativeId: "b" }];
    assert.ok(!check([{ offerId: "nope", alternativeId: "b" }]).ok);
    assert.ok(!check(sel, { offers: [offer({ active: false })] }).ok);
    assert.ok(!check(sel, { offers: [offer({ endsAt: "2026-10-22" })] }).ok);
    assert.ok(!check(sel, { mode: "delivery" }).ok);
  });

  test("refus : cadeau inconnu, choix manquant, invalide ou superflu", () => {
    assert.ok(!check([{ offerId: "t1", alternativeId: "zzz" }]).ok);
    assert.ok(!check([{ offerId: "t1", alternativeId: "a" }]).ok, "parfum obligatoire");
    assert.ok(!check([{ offerId: "t1", alternativeId: "a", choiceId: "inconnu" }]).ok);
    assert.ok(!check([{ offerId: "t1", alternativeId: "b", choiceId: "x" }]).ok, "ce cadeau n'a pas de choix");
  });

  test("refus : plus de cadeaux que ce que le panier a gagné", () => {
    const one = { offerId: "t1", alternativeId: "b" };
    assert.ok(!check([one, one]).ok, "2 cadeaux pour 2 achats (1 seul gagné)");
    assert.ok(validateRewards({ offers: [offer()], selections: [one, one], lines: lines(4), mode: "pickup", now: NOW }).ok);
    assert.ok(!validateRewards({ offers: [offer()], selections: [one], lines: [{ productId: "autre", qty: 9 }], mode: "pickup", now: NOW }).ok);
  });

  test("côté navigateur : les cadeaux invalides sont retirés, l'ordre est conservé", () => {
    const sels = [
      { offerId: "t1", alternativeId: "a", choiceId: "x" },
      { offerId: "t1", alternativeId: "b" },
      { offerId: "t1", alternativeId: "b" },
      { offerId: "fantome", alternativeId: "b" },
      { offerId: "t1", alternativeId: "a" },
    ];
    assert.deepEqual(reconcileRewards([offer()], sels, lines(4), "pickup", NOW), sels.slice(0, 2).concat([]));
    assert.deepEqual(reconcileRewards([offer()], sels, lines(2), "pickup", NOW), [sels[0]], "un seul cadeau gagné");
    assert.deepEqual(reconcileRewards([offer()], sels, lines(1), "pickup", NOW), []);
  });

  test("forme des données reçues", () => {
    assert.deepEqual(sanitizeRewards("n'importe quoi"), []);
    assert.deepEqual(sanitizeRewards([null, 3, { offerId: 1 }, { offerId: "o", alternativeId: "a", choiceId: 5 }, { offerId: "o", alternativeId: "a", choiceId: "c" }]), [
      { offerId: "o", alternativeId: "a" },
      { offerId: "o", alternativeId: "a", choiceId: "c" },
    ]);
  });
});

describe("commande avec cadeau", () => {
  const request = (extra: Partial<OrderRequest> = {}): OrderRequest => ({
    mode: "pickup",
    paymentMethod: "cash",
    customer: { name: "Test Client", phone: "06 12 34 56 78" },
    items: [{ productId: trigger.id, qty: 2, selections: defaultSelections(trigger) }],
    rewards: [{ offerId: "t1", alternativeId: "a", choiceId: "x" }],
    ...extra,
  });
  const paid = roundMoney(unitPrice(trigger, defaultSelections(trigger)) * 2);

  test("le cadeau s'ajoute à 0 € : le total ne change pas", () => {
    const r = buildOrder(request(), "IT-TEST", NOW, [offer()]);
    assert.ok(r.ok);
    if (r.ok) {
      assert.equal(r.order.items.length, 2);
      assert.equal(r.order.items[1].reward, true);
      assert.equal(r.order.items[1].lineTotal, 0);
      assert.equal(r.order.totals.subtotal, paid);
      assert.equal(r.order.totals.total, paid);
    }
  });

  test("un cadeau non gagné, inconnu ou hors mode est refusé (409)", () => {
    const fewer = request({ items: [{ productId: trigger.id, qty: 1, selections: defaultSelections(trigger) }] });
    for (const [label, res] of [
      ["panier insuffisant", buildOrder(fewer, "IT-TEST", NOW, [offer()])],
      ["offre inconnue côté serveur", buildOrder(request(), "IT-TEST", NOW, [])],
      ["offre désactivée", buildOrder(request(), "IT-TEST", NOW, [offer({ active: false })])],
      ["livraison", buildOrder(request({ mode: "delivery", customer: { name: "Test", phone: "0612345678", address: "12 rue des Tests, Paris" } }), "IT-TEST", NOW, [offer()])],
    ] as const) {
      assert.ok(!res.ok, label);
      if (!res.ok) {
        assert.equal(res.status, 409, label);
        assert.equal(res.error.code, "offers_changed", label);
      }
    }
  });

  test("sans cadeau demandé, rien n'est ajouté", () => {
    const r = buildOrder(request({ rewards: [] }), "IT-TEST", NOW, [offer()]);
    assert.ok(r.ok && r.order.items.length === 1);
  });
});

describe("saisie d'une offre dans l'admin", () => {
  const valid = {
    kind: "free_item",
    title: "  1 café acheté = 1 dessert offert ",
    description: "À emporter.",
    active: true,
    startsAt: "2026-11-01",
    endsAt: "2026-11-30",
    modes: ["pickup", "pickup", "bidon"],
    triggerProductIds: [trigger.id, trigger.id],
    minQty: 1,
    maxRewards: 1,
    alternatives: [
      { label: "Un dessert", choiceLabel: "Dessert", choices: ["Litchis", "Perles de coco", "Litchis"], productId: "litchis" },
      { label: "Un thé" },
    ],
  };

  test("offre valide : nettoyée et identifiants stables", () => {
    const r = parseOfferInput(valid);
    assert.ok(r.ok);
    if (r.ok) {
      assert.equal(r.value.title, "1 café acheté = 1 dessert offert");
      assert.deepEqual(r.value.modes, ["pickup"]);
      assert.deepEqual(r.value.triggerProductIds, [trigger.id]);
      assert.deepEqual(r.value.alternatives.map((a) => a.id), ["un-dessert", "un-the"]);
      assert.deepEqual(r.value.alternatives[0].choices.map((c) => c.id), ["litchis", "perles-de-coco", "litchis-3"]);
      assert.deepEqual(r.value.alternatives[1].choices, []);
    }
  });

  test("une annonce n'a besoin ni de produits ni de cadeaux", () => {
    const r = parseOfferInput({ kind: "info", title: "Fermé le 25 décembre", description: "", active: true });
    assert.ok(r.ok && r.value.kind === "info" && r.value.alternatives.length === 0);
  });

  test("entrées invalides refusées avec un message clair", () => {
    const bad: [string, unknown][] = [
      ["corps vide", null],
      ["type absent", { ...valid, kind: "autre" }],
      ["titre trop court", { ...valid, title: "ab" }],
      ["dates inversées", { ...valid, startsAt: "2026-12-01", endsAt: "2026-11-01" }],
      ["date invalide", { ...valid, startsAt: "demain" }],
      ["aucun mode", { ...valid, modes: [] }],
      ["aucun produit", { ...valid, triggerProductIds: [] }],
      ["produit inconnu", { ...valid, triggerProductIds: ["fantome"] }],
      ["quantité nulle", { ...valid, minQty: 0 }],
      ["trop de cadeaux", { ...valid, maxRewards: 11 }],
      ["aucun cadeau", { ...valid, alternatives: [] }],
      ["cadeau sans nom", { ...valid, alternatives: [{ label: "" }] }],
      ["illustration inconnue", { ...valid, alternatives: [{ label: "Un dessert", productId: "fantome" }] }],
    ];
    for (const [label, body] of bad) {
      const r = parseOfferInput(body);
      assert.ok(!r.ok, label);
      if (!r.ok) assert.ok(r.error.length > 5, label);
    }
  });
});

describe("offres en base (PostgreSQL, via PGlite en mémoire)", () => {
  before(() => {
    // Jamais la vraie base : sans DATABASE_URL, le Postgres embarqué est utilisé, ici en mémoire.
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

  const input = () => {
    const parsed = parseOfferInput({
      kind: "free_item",
      title: "Un thé acheté = un dessert offert",
      description: "",
      active: true,
      modes: ["pickup"],
      triggerProductIds: [trigger.id],
      minQty: 1,
      maxRewards: 1,
      alternatives: [{ label: "Un dessert", choiceLabel: "Dessert", choices: ["Litchis"] }],
    });
    assert.ok(parsed.ok);
    return parsed.ok ? parsed.value : (undefined as never);
  };

  test("les offres de départ sont créées une seule fois", async () => {
    const first = await listOffers();
    assert.deepEqual(first.map((o) => o.id), ["boisson-gourmandise", "carte-fidelite"]);
    assert.deepEqual((await listOffers()).map((o) => o.id), ["boisson-gourmandise", "carte-fidelite"], "pas de doublon au second appel");
  });

  test("création, lecture, modification, activation, suppression", async () => {
    const created = await createOffer(input());
    assert.match(created.id, /^o-[0-9a-f]{10}$/);
    assert.equal(created.position, 2, "ajoutée à la suite");
    assert.deepEqual(await getOffer(created.id), created);

    const updated = await updateOffer(created.id, { ...input(), title: "Titre modifié", minQty: 2 });
    assert.equal(updated!.title, "Titre modifié");
    assert.equal(updated!.position, 2, "l'ordre est conservé");
    assert.equal((await getOffer(created.id))!.minQty, 2);

    assert.equal((await setOfferActive(created.id, false))!.active, false);
    assert.equal(await updateOffer("o-inconnu", input()), null);
    assert.equal(await setOfferActive("o-inconnu", true), null);

    assert.equal(await deleteOffer(created.id), true);
    assert.equal(await getOffer(created.id), null);
    assert.equal(await deleteOffer(created.id), false);
  });

  test("une offre de départ supprimée ne revient pas", async () => {
    assert.equal(await deleteOffer("carte-fidelite"), true);
    assert.deepEqual((await listOffers()).map((o) => o.id), ["boisson-gourmandise"]);
  });

  test("seules les offres actives et dans leur période sont en vigueur", async () => {
    const past = await createOffer({ ...input(), title: "Offre passée", endsAt: "2026-01-01" });
    const future = await createOffer({ ...input(), title: "Offre à venir", startsAt: "2027-01-01" });
    const off = await createOffer({ ...input(), title: "Offre coupée", active: false });
    const live = (await listLiveOffers(NOW)).map((o) => o.id);
    assert.deepEqual(live, ["boisson-gourmandise"]);
    assert.ok(![past.id, future.id, off.id].some((id) => live.includes(id)));
  });

  test("les caractères spéciaux ne sont pas interprétés comme du SQL", async () => {
    const nasty = "Robert'); DROP TABLE offers;--";
    const o = await createOffer({ ...input(), title: nasty });
    assert.equal((await getOffer(o.id))!.title, nasty);
    assert.ok((await listOffers()).length >= 2);
  });
});
