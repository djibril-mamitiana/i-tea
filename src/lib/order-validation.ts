import { activeModes, activePayments, site } from "../config/site.ts";
import { getProduct } from "../data/menu.ts";
import { computeTotals, lineId, optionLabels, roundMoney, unitPrice, validateSelections } from "./pricing.ts";
import type { ConfirmedOrder, OrderApiError, OrderMode, OrderRequest, Selections } from "./types.ts";

/** Règles de validation des champs client, partagées client/serveur. */
export function validateCustomer(
  mode: OrderMode,
  customer: { name?: string; phone?: string; address?: string; notes?: string },
): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = (customer.name ?? "").trim();
  const phone = (customer.phone ?? "").trim();
  const address = (customer.address ?? "").trim();
  const notes = (customer.notes ?? "").trim();

  if (name.length < 2) errors.name = "Indiquez votre prénom ou votre nom.";
  else if (name.length > 80) errors.name = "Ce nom est trop long.";

  const digits = phone.replace(/[\s.\-()]/g, "");
  if (!phone) errors.phone = "Indiquez votre numéro pour que nous puissions vous joindre.";
  else if (!/^\+?\d{8,15}$/.test(digits)) errors.phone = "Ce numéro ne semble pas valide (8 à 15 chiffres).";

  if (mode === "delivery") {
    if (address.length < 6) errors.address = "Indiquez une adresse de livraison complète.";
    else if (address.length > 250) errors.address = "Cette adresse est trop longue.";
  }
  if (notes.length > 300) errors.notes = "Votre message est trop long (300 caractères maximum).";
  return errors;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Nettoie un corps de requête inconnu en OrderRequest typé (ou null). */
export function parseOrderRequest(body: unknown): OrderRequest | null {
  if (!isRecord(body) || !isRecord(body.customer) || !Array.isArray(body.items)) return null;
  const { mode, customer, items, paymentMethod, website } = body;
  if (mode !== "pickup" && mode !== "delivery") return null;
  if (typeof paymentMethod !== "string") return null;

  const cleanItems: OrderRequest["items"] = [];
  for (const raw of items) {
    if (!isRecord(raw) || typeof raw.productId !== "string" || typeof raw.qty !== "number") return null;
    const selections: Selections = {};
    if (raw.selections !== undefined) {
      if (!isRecord(raw.selections)) return null;
      for (const [key, value] of Object.entries(raw.selections)) {
        if (!Array.isArray(value) || value.some((v) => typeof v !== "string")) return null;
        selections[key] = value as string[];
      }
    }
    cleanItems.push({ productId: raw.productId, qty: raw.qty, selections });
  }

  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  return {
    mode,
    paymentMethod,
    website: str(website),
    customer: {
      name: str(customer.name) ?? "",
      phone: str(customer.phone) ?? "",
      address: str(customer.address),
      notes: str(customer.notes),
    },
    items: cleanItems,
  };
}

export type BuildResult = { ok: true; order: ConfirmedOrder } | { ok: false; status: number; error: OrderApiError };

/**
 * Reconstruit entièrement la commande à partir du catalogue serveur.
 * Aucun prix venant du navigateur n'est utilisé.
 */
export function buildOrder(request: OrderRequest, number: string, now: Date): BuildResult {
  const fail = (status: number, error: OrderApiError): BuildResult => ({ ok: false, status, error });

  if (!activeModes().includes(request.mode)) {
    return fail(400, { error: "Ce mode de réception n'est pas disponible." });
  }

  const payment = activePayments().find((p) => p.id === request.paymentMethod);
  if (!payment) return fail(400, { error: "Ce moyen de paiement n'est pas disponible." });

  const fields = validateCustomer(request.mode, request.customer);
  if (Object.keys(fields).length) return fail(400, { error: "Certaines informations sont à corriger.", fields });

  if (request.items.length === 0) return fail(400, { error: "Votre panier est vide." });
  if (request.items.length > site.ordering.maxCartLines) return fail(400, { error: "Votre panier contient trop d'articles différents." });

  const issues: NonNullable<OrderApiError["issues"]> = [];
  const items: ConfirmedOrder["items"] = [];
  const seen = new Set<string>();
  let subtotal = 0;

  for (const item of request.items) {
    const product = getProduct(item.productId);
    if (!product) {
      issues.push({ productId: item.productId, message: "Ce produit n'existe plus." });
      continue;
    }
    if (!product.available) {
      issues.push({ productId: product.id, message: `« ${product.name} » n'est plus disponible.` });
      continue;
    }
    if (!Number.isInteger(item.qty) || item.qty < 1 || item.qty > site.ordering.maxItemQty) {
      return fail(400, { error: `Quantité invalide pour « ${product.name} » (1 à ${site.ordering.maxItemQty}).` });
    }
    const problems = validateSelections(product, item.selections);
    if (problems.length) {
      issues.push({ productId: product.id, message: `« ${product.name} » : ${problems[0]}` });
      continue;
    }
    const id = lineId(product.id, item.selections);
    if (seen.has(id)) {
      return fail(400, { error: "Votre panier contient des lignes en double. Rechargez la page et réessayez." });
    }
    seen.add(id);

    const price = unitPrice(product, item.selections);
    const lineTotal = roundMoney(price * item.qty);
    subtotal = roundMoney(subtotal + lineTotal);
    items.push({
      productId: product.id,
      name: product.name,
      qty: item.qty,
      unitPrice: price,
      lineTotal,
      optionLabels: optionLabels(product, item.selections),
    });
  }

  if (issues.length) {
    return fail(409, { error: "Certains articles ne peuvent plus être commandés.", issues });
  }

  const totals = computeTotals(subtotal, request.mode);
  if (totals.minOrderMissing > 0) {
    return fail(400, { error: "La commande minimum pour la livraison n'est pas atteinte." });
  }

  const { name, phone, address, notes } = request.customer;
  return {
    ok: true,
    order: {
      number,
      createdAt: now.toISOString(),
      mode: request.mode,
      paymentMethod: payment.id,
      paymentLabel: payment.label,
      customer: {
        name: name.trim(),
        phone: phone.trim(),
        ...(request.mode === "delivery" && address ? { address: address.trim() } : {}),
        ...(notes?.trim() ? { notes: notes.trim() } : {}),
      },
      items,
      totals,
    },
  };
}
