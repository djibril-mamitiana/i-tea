import { site } from "../config/site.ts";
import { formatPrice } from "./format.ts";
import type { ConfirmedOrder } from "./types.ts";

/** Ticket de commande imprimable (cuisine / remise au client), pensé pour une imprimante à tickets de 80 mm ou une feuille A4. */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const stamp = new Intl.DateTimeFormat(site.locale, {
  timeZone: site.timezone,
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function ticketHtml(order: ConfirmedOrder): string {
  const isDelivery = order.mode === "delivery";
  const items = order.items
    .map((i) =>
      i.reward
        ? `<li class="gift"><strong>${esc(i.name.toUpperCase())}</strong> — OFFERT${i.optionLabels.length ? `<div class="opt">${esc(i.optionLabels.join(", "))}</div>` : ""}</li>`
        : `<li><strong>${i.qty} ×</strong> ${esc(i.name)}${i.optionLabels.length ? `<div class="opt">${esc(i.optionLabels.join(", "))}</div>` : ""}</li>`,
    )
    .join("");

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>${esc(order.number)}</title>
<style>
  @page { margin: 6mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 15px/1.35 "Courier New", monospace; color: #000; max-width: 76mm; }
  h1 { margin: 0; font-size: 22px; text-align: center; letter-spacing: .08em; }
  .num { text-align: center; font-size: 18px; font-weight: 700; margin: 6px 0 2px; }
  .meta { text-align: center; margin-bottom: 4px; }
  .mode { display: block; text-align: center; font-size: 20px; font-weight: 700; border: 2px solid #000; padding: 3px 0; margin: 8px 0; }
  hr { border: 0; border-top: 1px dashed #000; margin: 8px 0; }
  ul { list-style: none; margin: 0; padding: 0; }
  li { margin: 7px 0; font-size: 17px; }
  li .opt { font-size: 14px; padding-left: 22px; }
  li.gift { border: 1px solid #000; padding: 3px 5px; }
  .note { border: 1px solid #000; padding: 4px 6px; margin-top: 6px; }
  .total { display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; }
  .pay { text-align: center; margin-top: 4px; }
</style></head><body>
  <h1>${esc(site.name.toUpperCase())}</h1>
  <div class="num">${esc(order.number)}</div>
  <div class="meta">${esc(stamp.format(new Date(order.createdAt)))}</div>
  <span class="mode">${isDelivery ? "LIVRAISON" : "À EMPORTER"}</span>
  <div><strong>${esc(order.customer.name)}</strong></div>
  <div>${esc(order.customer.phone)}</div>
  ${isDelivery && order.customer.address ? `<div>${esc(order.customer.address).replace(/\n/g, "<br>")}</div>` : ""}
  ${order.customer.notes ? `<div class="note">Note : ${esc(order.customer.notes)}</div>` : ""}
  <hr><ul>${items}</ul><hr>
  ${order.totals.deliveryFee > 0 ? `<div class="total" style="font-size:15px;font-weight:400"><span>Livraison</span><span>${esc(formatPrice(order.totals.deliveryFee))}</span></div>` : ""}
  <div class="total"><span>TOTAL</span><span>${esc(formatPrice(order.totals.total))}</span></div>
  <div class="pay">${esc(order.paymentLabel)}</div>
</body></html>`;
}

/** Ouvre la fenêtre d'impression du navigateur sur le ticket (iframe invisible : aucune fenêtre bloquée par le navigateur). */
export function printTicket(order: ConfirmedOrder): void {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) {
    frame.remove();
    return;
  }
  doc.open();
  doc.write(ticketHtml(order));
  doc.close();
  const cleanup = () => setTimeout(() => frame.remove(), 1000);
  win.addEventListener("afterprint", cleanup);
  // Laisse au navigateur le temps de mettre en page le ticket avant d'imprimer.
  setTimeout(() => {
    win.focus();
    win.print();
    cleanup();
  }, 150);
}
