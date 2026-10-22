import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { site } from "../src/config/site.ts";
import { getProduct } from "../src/data/menu.ts";
import { cartReducer, sanitizeLines, type CartState } from "../src/lib/cart-state.ts";
import { defaultSelections, lineId } from "../src/lib/pricing.ts";

const empty: CartState = { lines: [], mode: "pickup", hydrated: true };
const tea = getProduct("milk-tea-classique")!;
const base = defaultSelections(tea);
const large = { ...base, size: ["l"] };

describe("panier", () => {
  test("ajout puis fusion des lignes identiques", () => {
    let s = cartReducer(empty, { type: "add", productId: tea.id, selections: base, qty: 1 });
    s = cartReducer(s, { type: "add", productId: tea.id, selections: { ...base }, qty: 2 });
    assert.equal(s.lines.length, 1);
    assert.equal(s.lines[0].qty, 3);
  });

  test("des options différentes donnent des lignes distinctes", () => {
    let s = cartReducer(empty, { type: "add", productId: tea.id, selections: base, qty: 1 });
    s = cartReducer(s, { type: "add", productId: tea.id, selections: large, qty: 1 });
    assert.equal(s.lines.length, 2);
  });

  test("la quantité est plafonnée", () => {
    const s = cartReducer(empty, { type: "add", productId: tea.id, selections: base, qty: 999 });
    assert.equal(s.lines[0].qty, site.ordering.maxItemQty);
  });

  test("setQty à 0 supprime la ligne", () => {
    let s = cartReducer(empty, { type: "add", productId: tea.id, selections: base, qty: 2 });
    s = cartReducer(s, { type: "setQty", id: s.lines[0].id, qty: 0 });
    assert.equal(s.lines.length, 0);
  });

  test("modifier une ligne conserve sa position", () => {
    let s = cartReducer(empty, { type: "add", productId: tea.id, selections: base, qty: 1 });
    s = cartReducer(s, { type: "add", productId: "cheesecake", selections: {}, qty: 1 });
    s = cartReducer(s, { type: "replace", id: s.lines[0].id, selections: large, qty: 2 });
    assert.equal(s.lines.length, 2);
    assert.equal(s.lines[0].productId, tea.id);
    assert.equal(s.lines[0].qty, 2);
    assert.equal(s.lines[0].id, lineId(tea.id, large));
  });

  test("modifier vers des options déjà présentes fusionne les quantités", () => {
    let s = cartReducer(empty, { type: "add", productId: tea.id, selections: base, qty: 1 });
    s = cartReducer(s, { type: "add", productId: tea.id, selections: large, qty: 2 });
    s = cartReducer(s, { type: "replace", id: lineId(tea.id, base), selections: large, qty: 1 });
    assert.equal(s.lines.length, 1);
    assert.equal(s.lines[0].qty, 3);
  });

  test("clear et changement de mode", () => {
    let s = cartReducer(empty, { type: "add", productId: tea.id, selections: base, qty: 1 });
    s = cartReducer(s, { type: "mode", mode: "delivery" });
    s = cartReducer(s, { type: "clear" });
    assert.equal(s.lines.length, 0);
    assert.equal(s.mode, "delivery");
  });
});

describe("restauration du panier sauvegardé", () => {
  const good = { productId: tea.id, qty: 2, selections: base };

  test("garde les lignes valides", () => {
    assert.equal(sanitizeLines([good]).length, 1);
  });

  test("écarte produits inconnus, indisponibles et options périmées", () => {
    const lines = sanitizeLines([
      good,
      { productId: "disparu", qty: 1, selections: {} },
      { productId: "thai-tea", qty: 1, selections: {} },
      { productId: tea.id, qty: 1, selections: { ...base, size: ["xxl"] } },
    ]);
    assert.equal(lines.length, 1);
  });

  test("données corrompues ignorées", () => {
    assert.deepEqual(sanitizeLines("nope"), []);
    assert.deepEqual(sanitizeLines([null, 3, { productId: 1 }, { productId: tea.id, qty: "2", selections: {} }]), []);
    assert.equal(sanitizeLines([{ ...good, qty: Infinity }]).length, 0);
  });

  test("la quantité sauvegardée est ramenée dans les bornes", () => {
    assert.equal(sanitizeLines([{ ...good, qty: 500 }])[0].qty, site.ordering.maxItemQty);
    assert.equal(sanitizeLines([{ ...good, qty: -4 }])[0].qty, 1);
  });
});
