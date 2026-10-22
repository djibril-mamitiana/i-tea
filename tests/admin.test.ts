import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import { ACTIVE_STATUSES, advanceLabel, isActive, isOrderStatus, nextStatus, ORDER_STATUSES } from "../src/lib/order-status.ts";
import type { ConfirmedOrder } from "../src/lib/types.ts";
import {
  adminConfig,
  createSessionToken,
  isLoginBlocked,
  isSameOrigin,
  MIN_PASSWORD_LENGTH,
  passwordMatches,
  recordFailedLogin,
  SESSION_TTL_SECONDS,
  verifySessionToken,
} from "../src/lib/server/admin-auth.ts";
import { getDb, resetDbForTests } from "../src/lib/server/db.ts";
import {
  countByStatus,
  getOrder,
  listOrders,
  newOrderNumber,
  newOrderNumbers,
  OrderNumberTakenError,
  saveOrder,
  updateOrderStatus,
} from "../src/lib/server/orders-store.ts";

const PASSWORD = "une phrase de passe longue";

describe("statuts de commande", () => {
  test("flux normal : nouvelle → préparation → prête → terminée", () => {
    assert.equal(nextStatus("new"), "preparing");
    assert.equal(nextStatus("preparing"), "ready");
    assert.equal(nextStatus("ready"), "completed");
    assert.equal(nextStatus("completed"), null);
    assert.equal(nextStatus("cancelled"), null);
  });

  test("statuts actifs et validation", () => {
    assert.deepEqual([...ACTIVE_STATUSES], ["new", "preparing", "ready"]);
    assert.ok(isActive("preparing") && !isActive("completed") && !isActive("cancelled"));
    for (const s of ORDER_STATUSES) assert.ok(isOrderStatus(s));
    assert.ok(!isOrderStatus("shipped") && !isOrderStatus(undefined) && !isOrderStatus(3));
  });

  test("libellé du dernier bouton selon le mode", () => {
    assert.match(advanceLabel("ready", "delivery")!, /livrée/);
    assert.match(advanceLabel("ready", "pickup")!, /remise/);
    assert.equal(advanceLabel("completed", "pickup"), null);
  });
});

describe("authentification admin", () => {
  test("configuration : absent, trop court, valide", () => {
    assert.deepEqual(adminConfig({} as NodeJS.ProcessEnv), { ok: false, reason: "missing" });
    assert.deepEqual(adminConfig({ ADMIN_PASSWORD: "court" } as unknown as NodeJS.ProcessEnv), { ok: false, reason: "too-short" });
    assert.ok("x".repeat(MIN_PASSWORD_LENGTH).length === MIN_PASSWORD_LENGTH);
    assert.deepEqual(adminConfig({ ADMIN_PASSWORD: PASSWORD } as unknown as NodeJS.ProcessEnv), { ok: true, password: PASSWORD });
  });

  test("comparaison du mot de passe", () => {
    assert.ok(passwordMatches(PASSWORD, PASSWORD));
    assert.ok(!passwordMatches("autre chose", PASSWORD));
    assert.ok(!passwordMatches("", PASSWORD));
  });

  test("session valide, puis expirée", () => {
    const now = 1_000_000;
    const token = createSessionToken(PASSWORD, now);
    assert.ok(verifySessionToken(token, PASSWORD, now + 1000));
    assert.ok(!verifySessionToken(token, PASSWORD, now + SESSION_TTL_SECONDS * 1000 + 1));
  });

  test("jeton falsifié ou signé avec un autre mot de passe refusé", () => {
    const token = createSessionToken(PASSWORD);
    const [payload, signature] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ exp: Date.now() + 10 * 365 * 24 * 3600 * 1000 })).toString("base64url");
    assert.ok(!verifySessionToken(`${forged}.${signature}`, PASSWORD), "payload modifié");
    assert.ok(!verifySessionToken(`${payload}.${signature.slice(1)}A`, PASSWORD), "signature modifiée");
    assert.ok(!verifySessionToken(token, "un autre mot de passe"), "ancien mot de passe");
    for (const bad of [undefined, "", "abc", "a.b.c", ".", `${payload}.`]) assert.ok(!verifySessionToken(bad, PASSWORD), String(bad));
  });

  test("origine : seules les requêtes du même site passent", () => {
    const req = (headers: Record<string, string>) => new Request("http://localhost/api", { method: "POST", headers });
    assert.ok(isSameOrigin(req({ origin: "https://i-tea.vercel.app", host: "i-tea.vercel.app" })));
    assert.ok(!isSameOrigin(req({ origin: "https://evil.example", host: "i-tea.vercel.app" })));
    assert.ok(!isSameOrigin(req({ host: "i-tea.vercel.app" })), "sans Origin : refusé");
    assert.ok(!isSameOrigin(req({ origin: "pas une url", host: "i-tea.vercel.app" })));
  });
});

describe("commandes en base (PostgreSQL, via PGlite en mémoire)", () => {
  const makeOrder = (number: string, createdAt: string, extra: Partial<ConfirmedOrder> = {}): ConfirmedOrder => ({
    number,
    createdAt,
    mode: "pickup",
    paymentMethod: "cash",
    paymentLabel: "Paiement à la réception",
    customer: { name: "Test Client", phone: "0612345678" },
    items: [{ productId: "cheesecake", name: "Cheesecake", qty: 2, unitPrice: 4.9, lineTotal: 9.8, optionLabels: [] }],
    totals: { subtotal: 9.8, deliveryFee: 0, total: 9.8, freeDeliveryRemaining: null, minOrderMissing: 0 },
    ...extra,
  });

  before(async () => {
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

  test("enregistrement puis relecture identique, statut « nouvelle »", async () => {
    const order = makeOrder("IT-261022-AAAA", "2026-10-22T10:00:00.000Z", { customer: { name: "Élodie Ñ", phone: "+33 6 12 34 56 78", notes: "Sonner 2 fois" } });
    await saveOrder(order);
    const stored = await getOrder("IT-261022-AAAA");
    assert.ok(stored);
    assert.equal(stored.status, "new");
    assert.deepEqual({ ...stored, status: undefined, updatedAt: undefined }, { ...order, status: undefined, updatedAt: undefined });
  });

  test("numéro déjà utilisé → erreur dédiée, sans écraser", async () => {
    await assert.rejects(() => saveOrder(makeOrder("IT-261022-AAAA", "2026-10-22T11:00:00.000Z")), OrderNumberTakenError);
    assert.equal((await getOrder("IT-261022-AAAA"))!.createdAt, "2026-10-22T10:00:00.000Z");
  });

  test("changement de statut, commande inconnue, vues et compteurs", async () => {
    await saveOrder(makeOrder("IT-261022-BBBB", "2026-10-22T10:05:00.000Z"));
    await saveOrder(makeOrder("IT-261022-CCCC", "2026-10-22T10:10:00.000Z"));
    await saveOrder(makeOrder("IT-261022-DDDD", "2026-10-22T10:15:00.000Z"));

    assert.equal((await updateOrderStatus("IT-261022-BBBB", "preparing"))!.status, "preparing");
    assert.equal((await updateOrderStatus("IT-261022-CCCC", "completed"))!.status, "completed");
    assert.equal((await updateOrderStatus("IT-261022-DDDD", "cancelled"))!.status, "cancelled");
    assert.equal(await updateOrderStatus("IT-000000-ZZZZ", "ready"), null);

    // À traiter : nouvelles d'abord, puis en préparation.
    assert.deepEqual((await listOrders("active")).map((o) => o.number), ["IT-261022-AAAA", "IT-261022-BBBB"]);
    assert.deepEqual((await listOrders("done")).map((o) => o.number), ["IT-261022-CCCC"]);
    assert.deepEqual((await listOrders("cancelled")).map((o) => o.number), ["IT-261022-DDDD"]);
    // Historique : récentes d'abord.
    assert.deepEqual((await listOrders("all")).map((o) => o.number), ["IT-261022-DDDD", "IT-261022-CCCC", "IT-261022-BBBB", "IT-261022-AAAA"]);

    assert.deepEqual(await countByStatus(), { new: 1, preparing: 1, ready: 0, completed: 1, cancelled: 1 });
    assert.deepEqual(await newOrderNumbers(), ["IT-261022-AAAA"]);
  });

  test("les caractères spéciaux ne sont pas interprétés comme du SQL", async () => {
    const nasty = "Robert'); DROP TABLE orders;--";
    await saveOrder(makeOrder("IT-261022-EEEE", "2026-10-22T12:00:00.000Z", { customer: { name: nasty, phone: "0612345678" } }));
    assert.equal((await getOrder("IT-261022-EEEE"))!.customer.name, nasty);
    assert.ok((await listOrders("all")).length >= 5);
  });

  test("blocage des essais de connexion répétés (8 échecs / 10 min / IP)", async () => {
    const now = Date.now();
    assert.equal(await isLoginBlocked("1.2.3.4", now), false);
    for (let i = 0; i < 8; i++) await recordFailedLogin("1.2.3.4", now + i);
    assert.equal(await isLoginBlocked("1.2.3.4", now + 100), true);
    assert.equal(await isLoginBlocked("9.9.9.9", now + 100), false, "autre IP non bloquée");
    assert.equal(await isLoginBlocked("1.2.3.4", now + 11 * 60 * 1000), false, "débloqué après 10 min");
  });

  test("la base refuse un statut inconnu (contrainte CHECK)", async () => {
    const db = await getDb();
    await assert.rejects(() => db.query("UPDATE orders SET status = $1 WHERE number = $2", ["expediee", "IT-261022-AAAA"]));
    assert.equal((await getOrder("IT-261022-AAAA"))!.status, "new");
  });

  test("dates relues en ISO 8601 (timestamptz)", async () => {
    const stored = await getOrder("IT-261022-AAAA");
    assert.match(stored!.updatedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    assert.equal(stored!.createdAt, "2026-10-22T10:00:00.000Z");
  });

  test("format des numéros de commande", () => {
    assert.match(newOrderNumber(new Date("2026-10-22T10:00:00")), /^IT-261022-[A-HJ-NP-Z2-9]{4}$/);
  });
});
