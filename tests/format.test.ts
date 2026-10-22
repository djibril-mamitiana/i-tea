import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { formatPrice, formatSupplement } from "../src/lib/format.ts";

describe("format des prix (EUR, 2 décimales)", () => {
  test("virgule décimale, espace insécable avant €", () => {
    assert.equal(formatPrice(5.5), "5,50 €");
    assert.equal(formatPrice(11), "11,00 €");
    assert.equal(formatPrice(0.9), "0,90 €");
  });

  test("séparateur de milliers", () => {
    assert.equal(formatPrice(1234.5), "1 234,50 €");
  });

  test("suppléments", () => {
    assert.equal(formatSupplement(1), "+1,00 €");
    assert.equal(formatSupplement(0), "Inclus");
  });
});
