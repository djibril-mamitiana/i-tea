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
        <h1 className="text-3xl font-extrabold">Aucune commande récente</h1>
        <p className="text-muted">Nous ne retrouvons pas de commande à afficher sur cet appareil.</p>
        <Link href="/#menu" className="btn btn-accent btn-lg mt-2">
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
      ? "Le restaurant a bien reçu ta commande."
      : site.demoMode
        ? "Mode démo : aucun canal de notification n'est configuré (voir le README). La commande est tout de même enregistrée côté serveur."
        : "Ta commande est enregistrée. Si tu n'as pas de nouvelles, contacte le restaurant.";

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6">
      <div className="rounded-card bg-ink p-8 text-center text-cream shadow-pop sm:p-12">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-matcha text-ink">
          <Check size={34} strokeWidth={3.5} aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-4xl font-extrabold sm:text-5xl">Merci {order.customer.name.split(" ")[0]} !</h1>
        <p className="mt-2 text-lg text-cream/80">Ta commande est enregistrée.</p>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-peach">Numéro de commande</p>
        <p className="mt-1 font-display text-4xl font-extrabold tracking-wide text-accent" aria-label={`Numéro ${order.number}`}>
          {order.number}
        </p>
        <p className="mt-4 text-sm text-cream/75">{notifyMessage}</p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-card bg-white p-6 shadow-card" aria-labelledby="recap">
          <h2 id="recap" className="text-xl font-extrabold">
            Récapitulatif
          </h2>
          <ul className="mt-3 divide-y divide-line">
            {order.items.map((i, n) => (
              <li key={`${i.productId}-${n}`} className="flex justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-bold leading-tight">{i.reward ? i.name : `${i.qty} × ${i.name}`}</p>
                  {i.optionLabels.length > 0 && <p className="text-xs text-muted">{i.optionLabels.join(" · ")}</p>}
                </div>
                <p className={`shrink-0 text-sm font-bold ${i.reward ? "text-accent-text" : ""}`}>{i.reward ? "Offert" : formatPrice(i.lineTotal)}</p>
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
              <dt className="text-lg font-extrabold">Total</dt>
              <dd className="font-display text-2xl font-extrabold">{formatPrice(order.totals.total)}</dd>
            </div>
          </dl>
        </section>

        <section className="space-y-6">
          <div className="rounded-card bg-white p-6 shadow-card">
            <h2 className="flex items-center gap-2 text-xl font-extrabold">
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
            <h2 className="text-xl font-extrabold">Et maintenant ?</h2>
            <ol className="mt-3 space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-cream">1</span>
                Garde ton téléphone à portée : le restaurant peut t&apos;appeler au besoin.
              </li>
              <li className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-cream">2</span>
                {isDelivery ? "Ta commande sera livrée à l'adresse indiquée." : "Passe récupérer ta commande au restaurant."}
              </li>
              <li className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-cream">3</span>
                {order.paymentMethod === "cash" ? `Tu règles ${formatPrice(order.totals.total)} à la réception.` : "Le paiement est traité selon le moyen choisi."}
              </li>
            </ol>
          </div>
        </section>
      </div>

      <div className="mt-8 text-center">
        <Link href="/#menu" className="btn btn-ink btn-lg">
          Commander autre chose
        </Link>
      </div>
    </div>
  );
}
