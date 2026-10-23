"use client";

import { ArrowRight, Check, Pencil, Plus, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { site } from "@/config/site";
import { products } from "@/data/menu";
import { formatPrice, plural } from "@/lib/format";
import { Photo } from "../Photo";
import { Sheet } from "../ui/Sheet";
import { Stepper } from "../ui/Stepper";
import { useCart } from "./CartProvider";
import { ModeToggle } from "./ModeToggle";

export function CartDrawer() {
  const { cartOpen, closeCart, lines, count, totals, mode, setQty, openProduct, quickAdd } = useCart();

  const inCart = new Set(lines.map((l) => l.line.productId));
  const suggestions = products.filter((p) => p.upsell && p.available && !inCart.has(p.id)).slice(0, 3);
  const isDelivery = mode === "delivery";
  const blocked = totals.minOrderMissing > 0;
  const { freeFrom } = site.ordering.delivery;

  return (
    <Sheet open={cartOpen} onClose={closeCart} variant="drawer" label="Panier">
      <div className="sheet-panel flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-lg bg-cream shadow-pop md:h-full md:max-h-none md:w-[28rem] md:rounded-none">
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="font-display text-3xl font-medium">
            Votre panier
            {count > 0 && (
              <span className="ml-3 font-sans text-sm font-medium text-muted">
                {count} {plural(count, "article", "articles")}
              </span>
            )}
          </h2>
          <button type="button" onClick={closeCart} className="grid size-11 place-items-center rounded-lg border border-line bg-white transition hover:border-ink/40 active:scale-90" aria-label="Fermer le panier">
            <X size={21} />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-12 text-center">
            <ShoppingBag size={40} className="text-muted" aria-hidden="true" />
            <h3 className="font-display text-2xl">Votre panier est vide</h3>
            <p className="max-w-xs text-muted">Parcourez la carte et ajoutez vos plats : nous nous occupons du reste.</p>
            <Link href="/#carte" onClick={closeCart} className="btn btn-accent btn-lg mt-2">
              Découvrir la carte
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <div className="mb-4">
                <ModeToggle />
              </div>

              <ul className="divide-y divide-line">
                {lines.map(({ line, product, unitPrice, lineTotal, optionLabels }) => (
                  <li key={line.id} className="flex gap-4 py-5">
                    {product.image && <Photo src={product.image} alt={product.name} sizes="80px" className="size-20 shrink-0 rounded" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-xl font-medium leading-tight">{product.name}</h3>
                        <p className="shrink-0 font-display text-lg">{formatPrice(lineTotal)}</p>
                      </div>
                      {optionLabels.length > 0 && <p className="mt-1 text-xs leading-snug text-muted">{optionLabels.join(" · ")}</p>}
                      {line.qty > 1 && <p className="mt-0.5 text-xs text-muted">{formatPrice(unitPrice)} l&apos;unité</p>}
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <Stepper qty={line.qty} onChange={(q) => setQty(line.id, q)} label={product.name} removable size="sm" max={site.ordering.maxItemQty} />
                        {product.groups.length > 0 && (
                          <button
                            type="button"
                            onClick={() => openProduct({ productId: product.id, editLineId: line.id })}
                            className="inline-flex min-h-11 items-center gap-1.5 rounded px-3 text-sm font-semibold text-accent-text hover:bg-sand"
                          >
                            <Pencil size={15} aria-hidden="true" />
                            Modifier
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {isDelivery && freeFrom !== null && (
                <div className="mt-2 rounded-lg border border-line bg-white p-4 text-sm">
                  {totals.freeDeliveryRemaining === null ? (
                    <p className="flex items-center gap-2 font-semibold text-green">
                      <Check size={18} aria-hidden="true" /> Livraison offerte
                    </p>
                  ) : (
                    <>
                      <p>
                        Plus que <strong>{formatPrice(totals.freeDeliveryRemaining)}</strong> pour la livraison offerte.
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand" role="presentation">
                        <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${Math.min(100, (totals.subtotal / freeFrom) * 100)}%` }} />
                      </div>
                    </>
                  )}
                </div>
              )}

              {suggestions.length > 0 && (
                <section className="mt-7" aria-labelledby="upsell-title">
                  <h3 id="upsell-title" className="mb-3 font-display text-xl font-medium">
                    Complétez votre commande
                  </h3>
                  <ul className="grid gap-2">
                    {suggestions.map((p) => (
                      <li key={p.id} className="flex items-center gap-3 rounded-lg border border-line bg-white p-3 pl-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{p.name}</p>
                          <p className="text-sm text-muted">{formatPrice(p.price)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => quickAdd(p.id)}
                          className="grid size-11 shrink-0 place-items-center rounded-lg bg-green text-cream transition hover:bg-green-2 active:scale-90"
                          aria-label={`Ajouter ${p.name}`}
                        >
                          <Plus size={20} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <footer className="safe-bottom border-t border-line bg-white px-5 pt-4">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Sous-total</dt>
                  <dd className="font-semibold">{formatPrice(totals.subtotal)}</dd>
                </div>
                {isDelivery && (
                  <div className="flex justify-between">
                    <dt className="text-muted">Livraison</dt>
                    <dd className="font-semibold">{totals.deliveryFee > 0 ? formatPrice(totals.deliveryFee) : "Offerte"}</dd>
                  </div>
                )}
                <div className="flex items-baseline justify-between border-t border-line pt-2">
                  <dt className="text-lg font-semibold">Total</dt>
                  <dd className="font-display text-3xl">{formatPrice(totals.total)}</dd>
                </div>
              </dl>

              {blocked && (
                <p className="mt-3 border-l-2 border-gold bg-gold-soft px-3 py-2 text-sm font-medium" role="status">
                  Commande minimum en livraison : {formatPrice(site.ordering.delivery.minOrder)}. Encore {formatPrice(totals.minOrderMissing)}, ou choisissez « {site.ordering.pickup.label} ».
                </p>
              )}

              {blocked ? (
                <button type="button" className="btn btn-accent btn-lg mt-3 w-full" disabled>
                  Commander
                </button>
              ) : (
                <Link href="/commande" onClick={closeCart} className="btn btn-accent btn-lg mt-3 w-full">
                  Commander · {formatPrice(totals.total)}
                  <ArrowRight size={20} aria-hidden="true" />
                </Link>
              )}
            </footer>
          </>
        )}
      </div>
    </Sheet>
  );
}
