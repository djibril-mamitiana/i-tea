import { site } from "../../config/site.ts";
import { formatPrice } from "../format.ts";
import type { ConfirmedOrder } from "../types.ts";

/**
 * Notification du restaurant. Deux canaux optionnels, activés par variables
 * d'environnement (voir .env.example) :
 *  - ORDER_WEBHOOK_URL : POST JSON {text, order} (Slack, Discord, n8n, Zapier, Make…)
 *  - TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID : message Telegram
 * Si aucun canal n'est configuré, `notifyRestaurant` retourne "none".
 */

export type NotifyResult = "sent" | "failed" | "none";

export function orderToText(order: ConfirmedOrder): string {
  const lines = order.items.map(
    (i) =>
      `• ${i.qty} × ${i.name}${i.optionLabels.length ? ` (${i.optionLabels.join(", ")})` : ""} — ${i.reward ? "OFFERT" : formatPrice(i.lineTotal)}`,
  );
  const mode = order.mode === "delivery" ? `LIVRAISON → ${order.customer.address}` : "À EMPORTER";
  return [
    `🧋 Nouvelle commande ${order.number} — ${site.name}`,
    mode,
    `Client : ${order.customer.name} · ${order.customer.phone}`,
    ...(order.customer.notes ? [`Note : ${order.customer.notes}`] : []),
    "",
    ...lines,
    "",
    ...(order.totals.deliveryFee ? [`Livraison : ${formatPrice(order.totals.deliveryFee)}`] : []),
    `TOTAL : ${formatPrice(order.totals.total)} — ${order.paymentLabel}`,
  ].join("\n");
}

async function post(url: string, body: unknown): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error(`[notify] ${new URL(url).host} a répondu ${res.status}`);
    return res.ok;
  } catch (err) {
    console.error("[notify] échec d'envoi :", err instanceof Error ? err.message : err);
    return false;
  }
}

export async function notifyRestaurant(order: ConfirmedOrder): Promise<NotifyResult> {
  const text = orderToText(order);
  const jobs: Promise<boolean>[] = [];

  const webhook = process.env.ORDER_WEBHOOK_URL;
  if (webhook) {
    // `text` pour Slack/Mattermost, `content` pour Discord, `order` pour les automatisations.
    jobs.push(post(webhook, { text, content: text, order }));
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (token && chatId) {
    jobs.push(post(`https://api.telegram.org/bot${token}/sendMessage`, { chat_id: chatId, text }));
  }

  if (jobs.length === 0) return "none";
  const results = await Promise.all(jobs);
  return results.every(Boolean) ? "sent" : "failed";
}
