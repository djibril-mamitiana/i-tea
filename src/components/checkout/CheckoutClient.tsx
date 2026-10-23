"use client";

import { ArrowLeft, Banknote, Bike, CircleAlert, Gift, LoaderCircle, Lock, ShoppingBag, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { ProductVisual } from "@/components/ProductVisual";
import { activeModes, activePayments, site } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { validateCustomer } from "@/lib/order-validation";
import type { ConfirmedOrder, OrderApiError, OrderMode } from "@/lib/types";

const CUSTOMER_KEY = "itea.customer.v1";
export const LAST_ORDER_KEY = "itea.lastOrder.v1";

type Values = { name: string; phone: string; address: string; notes: string };
type Status = "idle" | "loading" | "error" | "done";

const MODE_ICON = { pickup: Store, delivery: Bike } as const;

const noSubscribe = () => () => {};
const readSavedCustomer = () => {
  try {
    return localStorage.getItem(CUSTOMER_KEY);
  } catch {
    return null;
  }
};

export function CheckoutClient() {
  const router = useRouter();
  const { hydrated, lines, count, totals, mode, setMode, clear, openCart, removeItem, rewards, rewardLines, refreshOffers } = useCart();
  const payments = activePayments();

  // Coordonnées mémorisées sur cet appareil (jamais envoyées ailleurs qu'à la commande).
  const savedRaw = useSyncExternalStore(noSubscribe, readSavedCustomer, () => null);
  const saved = useMemo<Partial<Values>>(() => {
    try {
      const parsed = savedRaw ? JSON.parse(savedRaw) : null;
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }, [savedRaw]);
  const [edits, setEdits] = useState<Partial<Values>>({});
  const values: Values = {
    name: edits.name ?? (typeof saved.name === "string" ? saved.name : ""),
    phone: edits.phone ?? (typeof saved.phone === "string" ? saved.phone : ""),
    address: edits.address ?? (typeof saved.address === "string" ? saved.address : ""),
    notes: edits.notes ?? "",
  };
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverFields, setServerFields] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState(payments[0]?.id ?? "");
  const [status, setStatus] = useState<Status>("idle");
  const [banner, setBanner] = useState<{ message: string; issues?: OrderApiError["issues"] } | null>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const errors = { ...validateCustomer(mode, values), ...serverFields };
  const visible = (field: string) => (touched[field] || touched._all ? errors[field] : undefined);

  const set = (field: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEdits((v) => ({ ...v, [field]: e.target.value }));
    if (serverFields[field]) {
      setServerFields((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };
  const blur = (field: string) => () => setTouched((t) => ({ ...t, [field]: true }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setTouched({ _all: true });
    setBanner(null);

    const localErrors = validateCustomer(mode, values);
    if (Object.keys(localErrors).length) {
      const first = ["name", "phone", "address", "notes"].find((f) => localErrors[f]);
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    if (totals.minOrderMissing > 0) {
      setBanner({ message: `Commande minimum en livraison : ${formatPrice(site.ordering.delivery.minOrder)}.` });
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode,
          paymentMethod,
          website: honeypot.current?.value ?? "",
          customer: {
            name: values.name,
            phone: values.phone,
            address: mode === "delivery" ? values.address : undefined,
            notes: values.notes || undefined,
          },
          items: lines.map(({ line }) => ({ productId: line.productId, qty: line.qty, selections: line.selections })),
          rewards,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { order: ConfirmedOrder; notified: "sent" | "failed" | "none" }
        | OrderApiError
        | null;

      if (res.ok && data && "order" in data) {
        try {
          sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(data));
          localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ name: values.name, phone: values.phone, address: values.address }));
        } catch {
          /* la confirmation reste affichée même sans stockage */
        }
        setStatus("done");
        clear();
        router.push("/commande/confirmation");
        return;
      }

      const err = (data && "error" in data ? data : null) ?? { error: "Une erreur est survenue. Réessaie dans un instant." };
      // Une offre a changé ou ne s'applique plus : on relit les offres, le panier retire seul les cadeaux invalides.
      if (err.code === "offers_changed") void refreshOffers();
      if (err.fields) {
        setServerFields(err.fields);
        const first = Object.keys(err.fields)[0];
        document.getElementById(`f-${first}`)?.focus();
      }
      setBanner({ message: err.error, issues: err.issues });
      setStatus("error");
      requestAnimationFrame(() => bannerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
    } catch {
      setBanner({ message: "Connexion impossible. Vérifie ta connexion internet puis réessaie : ton panier est conservé." });
      setStatus("error");
    }
  }

  /* ---------- États spéciaux ---------- */
  if (!hydrated) {
    return <div className="mx-auto max-w-5xl px-4 py-24 text-center text-muted" role="status">Chargement de ton panier…</div>;
  }

  if (status === "done") {
    return <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted" role="status">Commande enregistrée, redirection…</div>;
  }

  if (count === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
        <div className="grid size-24 place-items-center rounded-full bg-sand">
          <ShoppingBag size={40} aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-extrabold">Ton panier est vide</h1>
        <p className="text-muted">Ajoute quelques gourmandises avant de passer commande.</p>
        <Link href="/#menu" className="btn btn-accent btn-lg mt-2">
          Retour au menu
        </Link>
      </div>
    );
  }

  const submitting = status === "loading";
  const blocked = totals.minOrderMissing > 0;
  const ctaLabel = submitting ? "Envoi en cours…" : `Confirmer la commande · ${formatPrice(totals.total)}`;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-40 pt-6 sm:px-6 lg:px-8 lg:pb-20 lg:pt-10">
      <Link href="/#menu" className="inline-flex min-h-11 items-center gap-2 font-bold text-ink/80 hover:text-ink">
        <ArrowLeft size={18} aria-hidden="true" /> Retour au menu
      </Link>
      <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">Finaliser ma commande</h1>
      <p className="mt-2 text-muted">Pas de compte à créer. Dis-nous juste où et comment te servir.</p>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_24rem]">
        <form id="checkout-form" onSubmit={onSubmit} noValidate className="space-y-8">
          {banner && (
            <div ref={bannerRef} role="alert" className="rounded-2xl border-2 border-danger/30 bg-danger/5 p-4 text-danger">
              <p className="flex items-start gap-2 font-bold">
                <CircleAlert size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
                {banner.message}
              </p>
              {banner.issues && banner.issues.length > 0 && (
                <>
                  <ul className="mt-2 list-disc space-y-1 pl-9 text-sm">
                    {banner.issues.map((i, n) => (
                      <li key={`${i.productId}-${n}`}>{i.message}</li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-2 pl-9">
                    <button
                      type="button"
                      className="btn btn-ink min-h-11 text-sm"
                      onClick={() => {
                        const ids = new Set(banner.issues!.map((i) => i.productId));
                        lines.filter((l) => ids.has(l.line.productId)).forEach((l) => removeItem(l.line.id));
                        setBanner(null);
                        setStatus("idle");
                      }}
                    >
                      Retirer ces articles
                    </button>
                    <button type="button" className="btn min-h-11 bg-white text-sm text-ink shadow-sm" onClick={openCart}>
                      Modifier mon panier
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 1. Réception */}
          <fieldset>
            <legend className="mb-3 text-xl font-extrabold">1. Comment veux-tu être servi ?</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {activeModes().map((m: OrderMode) => {
                const Icon = MODE_ICON[m];
                const checked = mode === m;
                const opt = site.ordering[m];
                return (
                  <label
                    key={m}
                    className={`relative flex cursor-pointer gap-3 rounded-2xl border-2 p-4 transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-accent/50 ${
                      checked ? "border-ink bg-white" : "border-line bg-white/60 hover:border-ink/40"
                    }`}
                  >
                    <input type="radio" name="mode" value={m} checked={checked} onChange={() => setMode(m)} className="sr-only" />
                    <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${checked ? "bg-ink text-cream" : "bg-sand"}`}>
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-bold">{opt.label}</span>
                      <span className="block text-sm text-muted">{opt.description}</span>
                      <span className="mt-1 block text-sm font-bold">
                        {m === "pickup" ? "Gratuit" : totals.deliveryFee > 0 || totals.subtotal === 0 ? formatPrice(site.ordering.delivery.fee) : "Offerte"}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            {blocked && (
              <p className="mt-3 rounded-xl bg-lemon/40 px-4 py-3 text-sm font-semibold" role="status">
                Commande minimum en livraison : {formatPrice(site.ordering.delivery.minOrder)} (encore {formatPrice(totals.minOrderMissing)}). Ajoute un article ou choisis « {site.ordering.pickup.label} ».
              </p>
            )}
          </fieldset>

          {/* 2. Coordonnées */}
          <fieldset className="space-y-4">
            <legend className="mb-1 text-xl font-extrabold">2. Tes coordonnées</legend>
            <Field id="name" label="Prénom ou nom" error={visible("name")}>
              <input
                id="f-name"
                className="field"
                value={values.name}
                onChange={set("name")}
                onBlur={blur("name")}
                autoComplete="name"
                aria-invalid={!!visible("name")}
                aria-describedby={visible("name") ? "err-name" : undefined}
                required
              />
            </Field>
            <Field id="phone" label="Téléphone" hint="Pour te joindre si besoin" error={visible("phone")}>
              <input
                id="f-phone"
                className="field"
                type="tel"
                inputMode="tel"
                value={values.phone}
                onChange={set("phone")}
                onBlur={blur("phone")}
                autoComplete="tel"
                aria-invalid={!!visible("phone")}
                aria-describedby={visible("phone") ? "err-phone" : undefined}
                required
              />
            </Field>
            {mode === "delivery" && (
              <Field id="address" label="Adresse de livraison" hint="Quartier, rue, repère utile…" error={visible("address")}>
                <textarea
                  id="f-address"
                  className="field min-h-24 resize-y"
                  value={values.address}
                  onChange={set("address")}
                  onBlur={blur("address")}
                  autoComplete="street-address"
                  aria-invalid={!!visible("address")}
                  aria-describedby={visible("address") ? "err-address" : undefined}
                  required
                />
              </Field>
            )}
            <Field id="notes" label="Instructions (facultatif)" error={visible("notes")}>
              <textarea
                id="f-notes"
                className="field min-h-20 resize-y"
                value={values.notes}
                onChange={set("notes")}
                onBlur={blur("notes")}
                maxLength={300}
                placeholder="Allergie, étage, code d'entrée…"
              />
            </Field>
            {/* Piège à robots : invisible pour les humains. */}
            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
              <label>
                Ne pas remplir
                <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
          </fieldset>

          {/* 3. Paiement */}
          <fieldset>
            <legend className="mb-3 text-xl font-extrabold">3. Paiement</legend>
            {payments.length === 0 ? (
              <p className="rounded-2xl bg-white p-4 text-danger">
                Aucun moyen de paiement n&apos;est disponible pour le moment. Contacte directement le restaurant.
              </p>
            ) : (
              <div className="grid gap-3">
                {payments.map((p) => (
                  <label
                    key={p.id}
                    className={`relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-accent/50 ${
                      paymentMethod === p.id ? "border-ink bg-white" : "border-line bg-white/60"
                    }`}
                  >
                    <input type="radio" name="payment" value={p.id} checked={paymentMethod === p.id} onChange={() => setPaymentMethod(p.id)} className="sr-only" />
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sand">
                      <Banknote size={22} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-bold">{p.label}</span>
                      <span className="block text-sm text-muted">{p.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>
        </form>

        {/* Récapitulatif */}
        <aside className="rounded-card bg-white p-5 shadow-card lg:sticky lg:top-28" aria-labelledby="recap-title">
          <h2 id="recap-title" className="text-xl font-extrabold">
            Ta commande
          </h2>
          <ul className="mt-3 divide-y divide-line">
            {lines.map(({ line, product, lineTotal, optionLabels }) => (
              <li key={line.id} className="flex gap-3 py-3">
                <ProductVisual item={product} className="size-14 shrink-0 rounded-xl" sizes="56px" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-tight">
                    {line.qty} × {product.name}
                  </p>
                  {optionLabels.length > 0 && <p className="text-xs text-muted">{optionLabels.join(" · ")}</p>}
                </div>
                <p className="shrink-0 text-sm font-bold">{formatPrice(lineTotal)}</p>
              </li>
            ))}
            {rewardLines.map(({ index, item }) => (
              <li key={`reward-${index}`} className="flex gap-3 py-3">
                <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-pink-soft" aria-hidden="true">
                  <Gift size={24} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-tight">{item.name}</p>
                  {item.optionLabels.length > 0 && <p className="text-xs text-muted">{item.optionLabels.join(" · ")}</p>}
                </div>
                <p className="shrink-0 text-sm font-bold text-accent-text">Offert</p>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Sous-total</dt>
              <dd className="font-semibold">{formatPrice(totals.subtotal)}</dd>
            </div>
            {mode === "delivery" && (
              <div className="flex justify-between">
                <dt className="text-muted">Livraison</dt>
                <dd className="font-semibold">{totals.deliveryFee > 0 ? formatPrice(totals.deliveryFee) : "Offerte"}</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between border-t border-line pt-2">
              <dt className="text-lg font-extrabold">Total</dt>
              <dd className="font-display text-3xl font-extrabold">{formatPrice(totals.total)}</dd>
            </div>
          </dl>
          <button type="button" onClick={openCart} className="mt-3 min-h-11 text-sm font-bold text-accent-text underline-offset-4 hover:underline">
            Modifier mon panier
          </button>

          <button
            type="submit"
            form="checkout-form"
            className="btn btn-accent btn-lg mt-3 hidden w-full lg:flex"
            disabled={submitting || blocked || payments.length === 0}
          >
            {submitting ? <LoaderCircle className="animate-spin" size={20} aria-hidden="true" /> : <Lock size={18} aria-hidden="true" />}
            {ctaLabel}
          </button>
          <p className="mt-3 hidden text-center text-xs text-muted lg:block">
            En confirmant, tu acceptes que ces informations servent à préparer ta commande.{" "}
            <Link href="/confidentialite" className="underline">
              Confidentialité
            </Link>
          </p>
        </aside>
      </div>

      {/* Barre de confirmation fixe (mobile / tablette) */}
      <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 px-4 pt-3 backdrop-blur lg:hidden">
        <button
          type="submit"
          form="checkout-form"
          className="btn btn-accent btn-lg w-full"
          disabled={submitting || blocked || payments.length === 0}
        >
          {submitting ? <LoaderCircle className="animate-spin" size={20} aria-hidden="true" /> : <Lock size={18} aria-hidden="true" />}
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={`f-${id}`} className="mb-1.5 block font-bold">
        {label}
        {hint && <span className="ml-2 text-sm font-normal text-muted">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`err-${id}`} className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-danger" role="alert">
          <CircleAlert size={16} aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}
