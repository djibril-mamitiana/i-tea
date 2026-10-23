"use client";

import { Bike, Hourglass, LoaderCircle, MapPin, Phone, Printer, StickyNote, Store } from "lucide-react";
import { site } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { advanceLabel, isActive, nextStatus, ORDER_STATUSES, STATUS_LABEL, type OrderStatus } from "@/lib/order-status";
import { printTicket } from "@/lib/ticket";
import type { StoredOrder } from "@/lib/types";

const STATUS_STYLE: Record<OrderStatus, string> = {
  new: "bg-accent text-ink",
  preparing: "bg-lemon text-ink",
  ready: "bg-matcha text-ink",
  completed: "bg-sand text-muted",
  cancelled: "bg-danger/10 text-danger",
};

const timeFormat = new Intl.DateTimeFormat(site.locale, { timeZone: site.timezone, hour: "2-digit", minute: "2-digit" });
const dayFormat = new Intl.DateTimeFormat(site.locale, { timeZone: site.timezone, day: "numeric", month: "short" });

export function formatOrderTime(iso: string): string {
  const date = new Date(iso);
  const sameDay = dayFormat.format(date) === dayFormat.format(new Date());
  return sameDay ? timeFormat.format(date) : `${dayFormat.format(date)} · ${timeFormat.format(date)}`;
}

/** « 12 min », « 2 h 05 » : lisible d'un coup d'œil quand une commande attend depuis longtemps. */
function duration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  return `${h} h ${String(minutes % 60).padStart(2, "0")}`;
}

export function relativeTime(iso: string, now: number): string {
  if (!now) return "";
  const minutes = Math.floor((now - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `il y a ${hours} h` : "";
}

export function OrderCard({
  order,
  now,
  pending,
  onStatus,
}: {
  order: StoredOrder;
  now: number;
  pending: boolean;
  onStatus: (status: OrderStatus) => void;
}) {
  const isDelivery = order.mode === "delivery";
  const next = nextStatus(order.status);
  const advance = advanceLabel(order.status, order.mode);
  const relative = relativeTime(order.createdAt, now);
  const ModeIcon = isDelivery ? Bike : Store;

  // Durée d'attente : une commande oubliée doit se voir. Nouvelle depuis sa création, sinon depuis son dernier changement.
  const since = now ? Math.floor((now - new Date(order.status === "new" ? order.createdAt : order.updatedAt).getTime()) / 60_000) : 0;
  const waiting =
    order.status === "new" && since >= 1
      ? { text: `Attend depuis ${duration(since)}`, tone: since >= 10 ? "bg-danger text-white" : since >= 5 ? "bg-lemon text-ink" : "bg-sand text-ink" }
      : order.status === "preparing" && since >= 1
        ? { text: `En préparation depuis ${duration(since)}`, tone: since >= 25 ? "bg-lemon text-ink" : "bg-sand text-ink" }
        : order.status === "ready" && since >= 1
          ? { text: `Prête depuis ${duration(since)}`, tone: since >= 15 ? "bg-lemon text-ink" : "bg-sand text-ink" }
          : null;

  return (
    <article
      className={`flex w-full flex-col gap-4 rounded-card bg-white p-5 shadow-card ${order.status === "new" ? "ring-2 ring-accent" : ""}`}
      aria-label={`Commande ${order.number}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-extrabold tracking-wide">{order.number}</h3>
          <p className="text-sm text-muted">
            {formatOrderTime(order.createdAt)}
            {relative && ` · ${relative}`}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${STATUS_STYLE[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </header>

      {waiting && (
        <p className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${waiting.tone}`}>
          <Hourglass size={14} aria-hidden="true" />
          {waiting.text}
        </p>
      )}

      <div className="space-y-1.5 text-[0.95rem]">
        <p className="flex items-center gap-2 font-bold">
          <ModeIcon size={18} aria-hidden="true" />
          {isDelivery ? site.ordering.delivery.label : site.ordering.pickup.label}
        </p>
        <p className="font-semibold">{order.customer.name}</p>
        <a href={`tel:${order.customer.phone.replace(/[^\d+]/g, "")}`} className="flex min-h-11 items-center gap-2 font-semibold text-accent-text">
          <Phone size={18} aria-hidden="true" />
          {order.customer.phone}
        </a>
        {isDelivery && order.customer.address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 text-muted underline-offset-4 hover:underline"
          >
            <MapPin size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span className="whitespace-pre-line">{order.customer.address}</span>
          </a>
        )}
        {order.customer.notes && (
          <p className="flex items-start gap-2 rounded-xl bg-lemon/40 px-3 py-2 font-semibold">
            <StickyNote size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            {order.customer.notes}
          </p>
        )}
      </div>

      <ul className="divide-y divide-line border-y border-line">
        {order.items.map((item, i) => (
          <li key={`${item.productId}-${i}`} className="flex justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <p className="font-bold leading-tight">{item.reward ? item.name : `${item.qty} × ${item.name}`}</p>
              {item.optionLabels.length > 0 && <p className="text-sm text-muted">{item.optionLabels.join(" · ")}</p>}
            </div>
            <p className={`shrink-0 text-sm font-semibold ${item.reward ? "text-accent-text" : ""}`}>{item.reward ? "Offert" : formatPrice(item.lineTotal)}</p>
          </li>
        ))}
      </ul>

      <dl className="space-y-1 text-sm">
        {order.totals.deliveryFee > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted">Livraison</dt>
            <dd className="font-semibold">{formatPrice(order.totals.deliveryFee)}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between">
          <dt className="font-bold">Total · {order.paymentLabel}</dt>
          <dd className="font-display text-2xl font-extrabold">{formatPrice(order.totals.total)}</dd>
        </div>
      </dl>

      <footer className="mt-auto flex flex-wrap items-center gap-2">
        {next && advance && (
          <button type="button" className="btn btn-accent flex-1" disabled={pending} onClick={() => onStatus(next)}>
            {pending && <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />}
            {advance}
          </button>
        )}
        {isActive(order.status) && (
          <button
            type="button"
            className="btn min-h-12 bg-sand px-4 text-danger hover:bg-line"
            disabled={pending}
            onClick={() => {
              if (window.confirm(`Annuler la commande ${order.number} ?`)) onStatus("cancelled");
            }}
          >
            Annuler
          </button>
        )}
        <button type="button" className="btn min-h-12 bg-sand px-4 text-ink hover:bg-line" onClick={() => printTicket(order)} aria-label={`Imprimer le ticket de la commande ${order.number}`}>
          <Printer size={18} aria-hidden="true" />
          Ticket
        </button>
        <label className="flex w-full items-center gap-2 text-sm text-muted">
          <span>Corriger le statut</span>
          <select
            className="field min-h-11 flex-1 py-1.5 text-sm"
            value={order.status}
            disabled={pending}
            onChange={(e) => onStatus(e.target.value as OrderStatus)}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
      </footer>
    </article>
  );
}
