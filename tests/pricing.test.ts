import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { site } from "../src/config/site.ts";
import { categories, products } from "../src/data/menu.ts";
import { buildOrder, parseOrderRequest, validateCustomer } from "../src/lib/order-validation.ts";
import { computeTotals, defaultSelections, lineId, optionLabels, roundMoney, unitPrice, validateSelections } from "../src/lib/pricing.ts";
import type { OrderRequest, Product } from "../src/lib/types.ts";
import { cheapest, findVariant, orderable, synthetic, unavailable } from "./fixtures.ts";

const NOW = new Date("2026-10-21T10:00:00Z");
const PHONE = "06 12 34 56 78";
const ADDRESS = "12 rue des Tests, 75000 Paris";

const entry = (p: Product, qty = 1) => ({ productId: p.id, qty, selections: defaultSelections(p) });

const validRequest = (overrides: Partial<OrderRequest> = {}): OrderRequest => ({
  mode: "pickup",
  paymentMethod: "cash",
  customer: { name: "Test Client", phone: PHONE },
  items: [entry(orderable[0], 2)],
  ...overrides,
});

/** Total attendu d'une ligne, arrondi au centime. */
const expectedLine = (p: Product, qty: number) => roundMoney(unitPrice(p, defaultSelections(p)) * qty);

describe("catalogue", () => {
  test("le catalogue contient des produits commandables", () => {
    assert.ok(orderable.length >= 3, "au moins 3 produits disponibles et commandables");
  });

  test("ids de produits et d'options uniques", () => {
    assert.equal(new Set(products.map((p) => p.id)).size, products.length);
    for (const p of products) {
      const groups = p.groups.map((g) => g.id);
      assert.equal(new Set(groups).size, groups.length, `${p.id}: groupes en double`);
      for (const g of p.groups) {
        const opts = g.options.map((o) => o.id);
        assert.equal(new Set(opts).size, opts.length, `${p.id}/${g.id}: options en double`);
        assert.ok(g.min <= g.max, `${p.id}/${g.id}: min > max`);
        assert.ok(g.options.length >= g.min, `${p.id}/${g.id}: moins d'options que le minimum exigé`);
        assert.ok(g.options.filter((o) => o.default).length <= g.max, `${p.id}/${g.id}: trop d'options par défaut`);
      }
    }
  });

  test("chaque produit appartient à une catégorie existante, avec un prix valide", () => {
    const ids = new Set(categories.map((c) => c.id));
    for (const p of products) {
      assert.ok(ids.has(p.categoryId), `${p.id}: catégorie « ${p.categoryId} » inconnue`);
      assert.ok(Number.isFinite(p.price) && p.price > 0, `${p.id}: prix invalide`);
      assert.equal(roundMoney(p.price), p.price, `${p.id}: prix avec trop de décimales`);
      for (const g of p.groups) {
        for (const o of g.options) {
          assert.ok(Number.isFinite(o.price) && o.price >= 0, `${p.id}/${g.id}/${o.id}: supplément invalide`);
          assert.equal(roundMoney(o.price), o.price, `${p.id}/${g.id}/${o.id}: supplément avec trop de décimales`);
        }
      }
    }
  });

  test("la sélection de l'accueil compte de 3 à 4 produits disponibles", () => {
    const featured = products.filter((p) => p.featured && p.available);
    assert.ok(featured.length >= 3 && featured.length <= 4, `${featured.length} produits mis en avant`);
  });

  test("les sélections par défaut sont valides sauf choix obligatoires sans défaut", () => {
    for (const p of products.filter((x) => x.available)) {
      for (const problem of validateSelections(p, defaultSelections(p))) {
        assert.match(problem, /choisissez/i, `${p.id}: ${problem}`);
      }
    }
  });
});

describe("prix (produit fictif aux prix connus)", () => {
  const base = { ...defaultSelections(synthetic), sauce: ["s1"] };

  test("prix de base avec sélection par défaut", () => {
    assert.deepEqual(validateSelections(synthetic, base), []);
    assert.equal(unitPrice(synthetic, base), 5.5);
  });

  test("taille Grande + 2 suppléments, sans bruit de virgule flottante", () => {
    const price = unitPrice(synthetic, { ...base, size: ["l"], extras: ["a", "b"] });
    assert.equal(price, 5.5 + 1 + 0.5 + 0.9);
    assert.equal(price, 7.9);
  });

  test("le maximum de suppléments est refusé", () => {
    const problems = validateSelections(synthetic, { ...base, extras: ["a", "b", "c"] });
    assert.ok(problems.some((p) => p.includes("2 options maximum")));
  });

  test("une option en rupture est refusée", () => {
    const problems = validateSelections(synthetic, { ...base, extras: ["gone"] });
    assert.ok(problems.some((p) => p.includes("n'est plus disponible")));
  });

  test("un choix obligatoire manquant est signalé", () => {
    const problems = validateSelections(synthetic, defaultSelections(synthetic));
    assert.ok(problems.some((p) => p.startsWith("Sauce") && p.includes("choisissez")));
  });

  test("groupe inconnu, option inconnue et doublons sont refusés", () => {
    assert.ok(validateSelections(synthetic, { ...base, inconnu: ["x"] }).length > 0);
    assert.ok(validateSelections(synthetic, { ...base, size: ["xxl"] }).length > 0);
    assert.ok(validateSelections(synthetic, { ...base, extras: ["a", "a"] }).length > 0);
  });

  test("libellés : les suppléments facultatifs sont préfixés d'un « + »", () => {
    assert.deepEqual(optionLabels(synthetic, { ...base, size: ["l"], extras: ["a"] }), ["Grande", "+ Alpha", "Douce"]);
  });

  test("lineId ne dépend pas de l'ordre des options", () => {
    assert.equal(lineId("x", { extras: ["a", "b"], size: ["m"] }), lineId("x", { size: ["m"], extras: ["b", "a"] }));
  });
});

describe("prix (catalogue)", () => {
  test("choisir une autre option d'un groupe à choix unique modifie le prix du supplément exact", () => {
    const { product, group, base, alt, altOption } = findVariant();
    const current = group.options.find((o) => (base[group.id] ?? []).includes(o.id));
    const delta = roundMoney(altOption.price - (current?.price ?? 0));
    assert.equal(unitPrice(product, alt), roundMoney(unitPrice(product, base) + delta));
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
    assert.equal(computeTotals(freeFrom! - 1, "delivery").deliveryFee, fee);
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
      assert.equal(result.order.totals.total, expectedLine(orderable[0], 2));
      assert.equal(result.order.items[0].unitPrice, unitPrice(orderable[0], defaultSelections(orderable[0])));
    }
  });

  test("un prix envoyé par le navigateur est ignoré", () => {
    const tampered = { ...validRequest(), items: [{ ...validRequest().items[0], unitPrice: 0.01, price: 0.01 }] };
    const parsed = parseOrderRequest(tampered);
    assert.ok(parsed);
    const result = buildOrder(parsed!, "IT-TEST", NOW);
    assert.ok(result.ok);
    if (result.ok) assert.equal(result.order.totals.total, expectedLine(orderable[0], 2));
  });

  test("montants arrondis au centime", () => {
    const product = orderable[0];
    const result = buildOrder(validRequest({ items: [entry(product, 3)] }), "IT-TEST", NOW);
    assert.ok(result.ok);
    if (result.ok) {
      const exact = Number((unitPrice(product, defaultSelections(product)) * 3).toFixed(2));
      assert.equal(result.order.items[0].lineTotal, exact);
      assert.equal(result.order.totals.total, exact);
    }
  });

  test("produit indisponible → 409", { skip: unavailable ? false : "aucun produit indisponible dans le catalogue" }, () => {
    const result = buildOrder(validRequest({ items: [{ productId: unavailable!.id, qty: 1, selections: {} }] }), "IT-TEST", NOW);
    assert.ok(!result.ok);
    if (!result.ok) assert.equal(result.status, 409);
  });

  test("produit inconnu → 409", () => {
    const result = buildOrder(validRequest({ items: [{ productId: "nope", qty: 1, selections: {} }] }), "IT-TEST", NOW);
    assert.ok(!result.ok);
    if (!result.ok) assert.equal(result.status, 409);
  });

  test("options invalides refusées", () => {
    const { product, group, base } = findVariant();
    const items = [{ productId: product.id, qty: 1, selections: { ...base, [group.id]: ["xxl"] } }];
    assert.ok(!buildOrder(validRequest({ items }), "IT-TEST", NOW).ok);
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
    const noAddress = buildOrder(validRequest({ mode: "delivery" }), "IT-TEST", NOW);
    assert.ok(!noAddress.ok);

    const { minOrder } = site.ordering.delivery;
    assert.ok(cheapest.price < minOrder, "le produit le moins cher doit rester sous le minimum de livraison pour ce test");
    const small = validRequest({
      mode: "delivery",
      customer: { name: "Test", phone: PHONE, address: ADDRESS },
      items: [entry(cheapest, 1)],
    });
    assert.ok(!buildOrder(small, "IT-TEST", NOW).ok, "sous le minimum de livraison");
  });

  test("livraison valide : frais ajoutés selon la règle du site", () => {
    const { minOrder } = site.ordering.delivery;
    const qty = Math.ceil(minOrder / expectedLine(cheapest, 1));
    const req = validRequest({
      mode: "delivery",
      customer: { name: "Test", phone: PHONE, address: ADDRESS },
      items: [entry(cheapest, qty)],
    });
    const result = buildOrder(req, "IT-TEST", NOW);
    assert.ok(result.ok);
    if (result.ok) {
      const subtotal = expectedLine(cheapest, qty);
      const { fee, freeFrom } = site.ordering.delivery;
      const expectedFee = freeFrom !== null && subtotal >= freeFrom ? 0 : fee;
      assert.equal(result.order.totals.deliveryFee, expectedFee);
      assert.equal(result.order.totals.total, roundMoney(subtotal + expectedFee));
    }
  });

  test("champs client", () => {
    assert.ok(validateCustomer("pickup", { name: "", phone: "" }).name);
    assert.ok(validateCustomer("pickup", { name: "Ok", phone: "12" }).phone);
    assert.deepEqual(validateCustomer("pickup", { name: "Ok", phone: PHONE }), {});
    assert.ok(validateCustomer("delivery", { name: "Ok", phone: PHONE, address: "x" }).address);
  });

  test("corps de requête malformé", () => {
    assert.equal(parseOrderRequest(null), null);
    assert.equal(parseOrderRequest({ mode: "teleport", customer: {}, items: [], paymentMethod: "cash" }), null);
    assert.equal(parseOrderRequest({ mode: "pickup", customer: {}, items: [{ productId: 1 }], paymentMethod: "cash" }), null);
  });
});
