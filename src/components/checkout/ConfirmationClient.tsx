"use client";

import { Bike, Check, Store } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { site } from "@/config/site";
import { formatPrice } from "@/lib/format";
import type { ConfirmedOrder } from "@/lib/types";
import { LAST_ORDER_KEY } from "./CheckoutClient";

type Stored = { order: ConfirmedOrder; notified: "sent" | "failed" | "none" };

const noSubscribe = () => () => {};
const readOrder = () => {
  try {
    return sessionStorage.getItem(LAST_ORDER_KEY);
  } catch {
    return null;
  }
};

export function ConfirmationClient() {
  // On arrive toujours en haut de la confirmation, quelle que soit la position sur le checkout.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // `undefined` côté serveur / avant hydratation, puis la valeur réelle du navigateur.
  const raw = useSyncExternalStore(noSubscribe, readOrder, () => undefined);
  const data = useMemo<Stored | null | undefined>(() => {
    if (raw === undefined) return undefined;
    try {
      return raw ? (JSON.parse(raw) as Stored) : null;
    } catch {
      return null;
    }
  }, [raw]);

  if (data === undefined) {
    return <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted" role="status">Chargement…</div>;
  }

  if (!data) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold">Aucune commande récente</h1>
        <p className="text-muted">Nous ne retrouvons pas de commande à afficher sur cet appareil.</p>
        <Link href="/#carte" className="btn btn-accent btn-lg mt-2">
          Retour au menu
        </Link>
      </div>
    );
  }

  const { order, notified } = data;
  const isDelivery = order.mode === "delivery";
  const ModeIcon = isDelivery ? Bike : Store;

  const notifyMessage =
    notified === "sent"
      ? "Le restaurant a bien reçu votre commande."
      : site.demoMode
        ? "Mode démo : aucun canal de notification n'est configuré (voir le README). La commande est tout de même enregistrée côté serveur."
        : "Votre commande est enregistrée. Sans nouvelles, contactez le restaurant.";

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6">
      <div className="on-dark rounded-lg bg-green p-8 text-center text-cream sm:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-gold text-ink">
          <Check size={34} strokeWidth={3.5} aria-hidden="true" />
        </span>
        <h1 className="display-lg mt-5">Merci {order.customer.name.split(" ")[0]} !</h1>
        <p className="mt-2 text-lg text-cream/80">Votre commande est enregistrée.</p>
        <p className="mt-6 eyebrow">Numéro de commande</p>
        <p className="mt-1 font-display text-4xl tracking-wide text-gold" aria-label={`Numéro ${order.number}`}>
          {order.number}
        </p>
        <p className="mt-4 text-sm text-cream/75">{notifyMessage}</p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-card bg-white p-6 shadow-card" aria-labelledby="recap">
          <h2 id="recap" className="text-xl font-semibold">
            Récapitulatif
          </h2>
          <ul className="mt-3 divide-y divide-line">
            {order.items.map((i, n) => (
              <li key={`${i.productId}-${n}`} className="flex justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-bold leading-tight">
                    {i.qty} × {i.name}
                  </p>
                  {i.optionLabels.length > 0 && <p className="text-xs text-muted">{i.optionLabels.join(" · ")}</p>}
                </div>
                <p className="shrink-0 text-sm font-bold">{formatPrice(i.lineTotal)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Sous-total</dt>
              <dd className="font-semibold">{formatPrice(order.totals.subtotal)}</dd>
            </div>
            {isDelivery && (
              <div className="flex justify-between">
                <dt className="text-muted">Livraison</dt>
                <dd className="font-semibold">{order.totals.deliveryFee > 0 ? formatPrice(order.totals.deliveryFee) : "Offerte"}</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between border-t border-line pt-2">
              <dt className="text-lg font-semibold">Total</dt>
              <dd className="font-display text-2xl font-semibold">{formatPrice(order.totals.total)}</dd>
            </div>
          </dl>
        </section>

        <section className="space-y-6">
          <div className="rounded-card bg-white p-6 shadow-card">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <ModeIcon size={22} aria-hidden="true" />
              {isDelivery ? "Livraison" : "À emporter"}
            </h2>
            {isDelivery && order.customer.address && <p className="mt-2 whitespace-pre-line text-muted">{order.customer.address}</p>}
            <p className="mt-2 text-sm text-muted">
              {order.customer.name} · {order.customer.phone}
            </p>
            {order.customer.notes && <p className="mt-2 text-sm italic text-muted">« {order.customer.notes} »</p>}
            <p className="mt-3 text-sm font-semibold">{order.paymentLabel}</p>
          </div>

          <div className="rounded-card bg-sand p-6">
            <h2 className="text-xl font-semibold">Et maintenant ?</h2>
            <ol className="mt-3 space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-cream">1</span>
                Gardez votre téléphone à portée : le restaurant peut vous appeler au besoin.
              </li>
              <li className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-cream">2</span>
                {isDelivery ? "Votre commande sera livrée à l'adresse indiquée." : "Venez récupérer votre commande au restaurant."}
              </li>
              <li className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-cream">3</span>
                {order.paymentMethod === "cash" ? `Vous réglez ${formatPrice(order.totals.total)} à la réception.` : "Le paiement est traité selon le moyen choisi."}
              </li>
            </ol>
          </div>
        </section>
      </div>

      <div className="mt-8 text-center">
        <Link href="/#carte" className="btn btn-ink btn-lg">
          Commander autre chose
        </Link>
      </div>
    </div>
  );
}
