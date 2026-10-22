import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { site } from "../src/config/site.ts";
import { getProduct, products } from "../src/data/menu.ts";
import { buildOrder, parseOrderRequest, validateCustomer } from "../src/lib/order-validation.ts";
import { computeTotals, defaultSelections, lineId, unitPrice, validateSelections } from "../src/lib/pricing.ts";
import type { OrderRequest } from "../src/lib/types.ts";

const NOW = new Date("2026-10-21T10:00:00Z");

const validRequest = (overrides: Partial<OrderRequest> = {}): OrderRequest => ({
  mode: "pickup",
  paymentMethod: "cash",
  customer: { name: "Test Client", phone: "+261 34 00 000 00" },
  items: [{ productId: "milk-tea-classique", qty: 2, selections: defaultSelections(getProduct("milk-tea-classique")!) }],
  ...overrides,
});

describe("catalogue", () => {
  test("ids de produits et d'options uniques", () => {
    assert.equal(new Set(products.map((p) => p.id)).size, products.length);
    for (const p of products) {
      const groups = p.groups.map((g) => g.id);
      assert.equal(new Set(groups).size, groups.length, `${p.id}: groupes en double`);
      for (const g of p.groups) {
        const opts = g.options.map((o) => o.id);
        assert.equal(new Set(opts).size, opts.length, `${p.id}/${g.id}: options en double`);
        assert.ok(g.min <= g.max, `${p.id}/${g.id}: min > max`);
      }
    }
  });

  test("les sélections par défaut sont valides sauf choix obligatoires sans défaut", () => {
    for (const p of products.filter((x) => x.available)) {
      const problems = validateSelections(p, defaultSelections(p));
      for (const problem of problems) {
        assert.match(problem, /choisis/i, `${p.id}: ${problem}`);
      }
    }
  });
});

describe("prix", () => {
  const tea = getProduct("milk-tea-classique")!;

  test("prix de base avec sélection par défaut", () => {
    assert.equal(unitPrice(tea, defaultSelections(tea)), tea.price);
  });

  test("taille Large + 2 suppléments", () => {
    const price = unitPrice(tea, { ...defaultSelections(tea), size: ["l"], extras: ["pearls", "cheese-foam"] });
    assert.equal(price, 5.5 + 1 + 0.5 + 0.9);
    assert.equal(price, 7.9, "pas de bruit de virgule flottante");
  });

  test("le maximum de suppléments est refusé", () => {
    const problems = validateSelections(tea, { ...defaultSelections(tea), extras: ["pearls", "cheese-foam", "coconut-jelly"] });
    assert.ok(problems.length > 0);
  });

  test("une option en rupture est refusée", () => {
    const problems = validateSelections(tea, { ...defaultSelections(tea), topping: ["pop-mango"] });
    assert.ok(problems.some((p) => p.includes("plus disponible")));
  });

  test("un choix obligatoire manquant est signalé", () => {
    const nuggets = getProduct("popcorn-chicken")!;
    assert.ok(validateSelections(nuggets, defaultSelections(nuggets)).some((p) => p.includes("Ta sauce")));
  });

  test("lineId ne dépend pas de l'ordre des options", () => {
    assert.equal(
      lineId("x", { extras: ["a", "b"], size: ["m"] }),
      lineId("x", { size: ["m"], extras: ["b", "a"] }),
    );
  });
});

describe("totaux", () => {
  test("retrait : pas de frais", () => {
    const t = computeTotals(10, "pickup");
    assert.equal(t.deliveryFee, 0);
    assert.equal(t.total, 10);
  });

  test("livraison : frais fixes sous le seuil, offerte au-dessus", () => {
    const { fee, freeFrom } = site.ordering.delivery;
    assert.equal(computeTotals(15, "delivery").deliveryFee, fee);
    assert.equal(computeTotals(freeFrom!, "delivery").deliveryFee, 0);
    assert.equal(computeTotals(freeFrom! - 1, "delivery").freeDeliveryRemaining, 1);
    assert.equal(computeTotals(freeFrom! - 0.1, "delivery").freeDeliveryRemaining, 0.1);
  });

  test("livraison : minimum de commande", () => {
    const { minOrder } = site.ordering.delivery;
    assert.equal(computeTotals(minOrder - 1, "delivery").minOrderMissing, 1);
    assert.equal(computeTotals(minOrder, "delivery").minOrderMissing, 0);
  });
});

describe("validation côté serveur", () => {
  test("commande valide : prix recalculés depuis le catalogue", () => {
    const result = buildOrder(validRequest(), "IT-TEST", NOW);
    assert.ok(result.ok);
    if (result.ok) {
      assert.equal(result.order.totals.total, 11);
      assert.equal(result.order.items[0].unitPrice, 5.5);
    }
  });

  test("un prix envoyé par le navigateur est ignoré", () => {
    const tampered = { ...validRequest(), items: [{ ...validRequest().items[0], unitPrice: 1, price: 1 }] };
    const parsed = parseOrderRequest(tampered);
    assert.ok(parsed);
    const result = buildOrder(parsed!, "IT-TEST", NOW);
    assert.ok(result.ok);
    if (result.ok) assert.equal(result.order.totals.total, 11);
  });

  test("montants arrondis au centime (3 × 5,90 €)", () => {
    const smoothie = getProduct("smoothie-mangue")!;
    const req = validRequest({ items: [{ productId: smoothie.id, qty: 3, selections: defaultSelections(smoothie) }] });
    const result = buildOrder(req, "IT-TEST", NOW);
    assert.ok(result.ok);
    if (result.ok) {
      assert.equal(result.order.items[0].lineTotal, 17.7);
      assert.equal(result.order.totals.total, 17.7);
    }
  });

  test("produit indisponible → 409", () => {
    const result = buildOrder(validRequest({ items: [{ productId: "thai-tea", qty: 1, selections: {} }] }), "IT-TEST", NOW);
    assert.ok(!result.ok);
    if (!result.ok) assert.equal(result.status, 409);
  });

  test("produit inconnu → 409", () => {
    const result = buildOrder(validRequest({ items: [{ productId: "nope", qty: 1, selections: {} }] }), "IT-TEST", NOW);
    assert.ok(!result.ok);
    if (!result.ok) assert.equal(result.status, 409);
  });

  test("quantités invalides", () => {
    for (const qty of [0, -1, 1.5, 999]) {
      const items = [{ ...validRequest().items[0], qty }];
      assert.ok(!buildOrder(validRequest({ items }), "IT-TEST", NOW).ok, `qty=${qty}`);
    }
  });

  test("panier vide", () => {
    assert.ok(!buildOrder(validRequest({ items: [] }), "IT-TEST", NOW).ok);
  });

  test("moyen de paiement non intégré refusé", () => {
    for (const method of ["card", "wallet", "bitcoin"]) {
      assert.ok(!buildOrder(validRequest({ paymentMethod: method }), "IT-TEST", NOW).ok, method);
    }
  });

  test("livraison : adresse obligatoire et minimum de commande", () => {
    const delivery = validRequest({ mode: "delivery" });
    const noAddress = buildOrder(delivery, "IT-TEST", NOW);
    assert.ok(!noAddress.ok);

    const small = validRequest({
      mode: "delivery",
      customer: { name: "Test", phone: "0340000000", address: "Lot 12 rue des Tests" },
      items: [{ productId: "limonade-menthe", qty: 1, selections: defaultSelections(getProduct("limonade-menthe")!) }],
    });
    const result = buildOrder(small, "IT-TEST", NOW);
    assert.ok(!result.ok, "4,20 € < minimum de livraison");
  });

  test("livraison valide : frais ajoutés", () => {
    const req = validRequest({
      mode: "delivery",
      customer: { name: "Test", phone: "0340000000", address: "Lot 12 rue des Tests" },
    });
    const result = buildOrder(req, "IT-TEST", NOW);
    assert.ok(result.ok);
    if (result.ok) {
      assert.equal(result.order.totals.deliveryFee, site.ordering.delivery.fee);
      assert.equal(result.order.totals.total, 11 + site.ordering.delivery.fee);
      assert.equal(result.order.totals.total, 13.9);
    }
  });

  test("champs client", () => {
    assert.ok(validateCustomer("pickup", { name: "", phone: "" }).name);
    assert.ok(validateCustomer("pickup", { name: "Ok", phone: "12" }).phone);
    assert.deepEqual(validateCustomer("pickup", { name: "Ok", phone: "+261 34 00 000 00" }), {});
    assert.ok(validateCustomer("delivery", { name: "Ok", phone: "0340000000", address: "x" }).address);
  });

  test("corps de requête malformé", () => {
    assert.equal(parseOrderRequest(null), null);
    assert.equal(parseOrderRequest({ mode: "teleport", customer: {}, items: [], paymentMethod: "cash" }), null);
    assert.equal(parseOrderRequest({ mode: "pickup", customer: {}, items: [{ productId: 1 }], paymentMethod: "cash" }), null);
  });
});
