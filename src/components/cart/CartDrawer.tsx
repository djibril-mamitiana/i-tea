"use client";

import { ArrowRight, Check, Gift, Pencil, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { site } from "@/config/site";
import { formatPrice, plural } from "@/lib/format";
import { PAUSE_DEFAULT_TEXT } from "@/lib/shop";
import { ProductVisual } from "../ProductVisual";
import { useCatalog } from "../shop/ShopProvider";
import { Sheet } from "../ui/Sheet";
import { Stepper } from "../ui/Stepper";
import { useCart } from "./CartProvider";
import { ModeToggle } from "./ModeToggle";
import { OfferPanel } from "./OfferPanel";

export function CartDrawer() {
  // À l'ouverture du panier, on relit les offres : une offre modifiée ou terminée ne doit pas rester affichée.
  const open = useCart().cartOpen;
  const refresh = useCart().refreshOffers;
  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  const { cartOpen, closeCart, lines, count, totals, mode, setQty, openProduct, quickAdd, rewardLines, removeReward, orderingPaused, orderingMessage } = useCart();
  const { products, isAvailable } = useCatalog();

  const inCart = new Set(lines.map((l) => l.line.productId));
  const suggestions = products.filter((p) => p.upsell && p.available && isAvailable(p.id) && !inCart.has(p.id)).slice(0, 3);
  const isDelivery = mode === "delivery";
  const blocked = totals.minOrderMissing > 0;
  const { freeFrom } = site.ordering.delivery;

  return (
    <Sheet open={cartOpen} onClose={closeCart} variant="drawer" label="Panier">
      <div className="sheet-panel flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[2rem] bg-cream shadow-pop md:h-full md:max-h-none md:w-[28rem] md:rounded-none md:rounded-l-[2rem]">
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="text-2xl font-extrabold">
            Ton panier
            {count > 0 && <span className="ml-2 text-base font-semibold text-muted">{count} {plural(count, "article", "articles")}</span>}
          </h2>
          <button type="button" onClick={closeCart} className="grid size-11 place-items-center rounded-full bg-sand transition hover:bg-line active:scale-90" aria-label="Fermer le panier">
            <X size={22} />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-12 text-center">
            <div className="grid size-24 place-items-center rounded-full bg-sand text-ink">
              <ShoppingBag size={40} aria-hidden="true" />
            </div>
            <h3 className="text-xl font-extrabold">Ton panier est vide</h3>
            <p className="max-w-xs text-muted">Une envie de nems, de pho ou de bubble tea ? Choisis tes favoris, on s&apos;occupe du reste.</p>
            <Link href="/#menu" onClick={closeCart} className="btn btn-accent btn-lg mt-2">
              Découvrir le menu
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
                  <li key={line.id} className="flex gap-3 py-4">
                    <ProductVisual item={product} className="size-20 shrink-0 rounded-2xl" sizes="80px" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold leading-tight">{product.name}</h3>
                        <p className="shrink-0 font-display text-base font-extrabold">{formatPrice(lineTotal)}</p>
                      </div>
                      {optionLabels.length > 0 && <p className="mt-0.5 text-xs leading-snug text-muted">{optionLabels.join(" · ")}</p>}
                      {line.qty > 1 && <p className="mt-0.5 text-xs text-muted">{formatPrice(unitPrice)} l&apos;unité</p>}
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <Stepper qty={line.qty} onChange={(q) => setQty(line.id, q)} label={product.name} removable size="sm" max={site.ordering.maxItemQty} />
                        {product.groups.length > 0 && (
                          <button
                            type="button"
                            onClick={() => openProduct({ productId: product.id, editLineId: line.id })}
                            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-bold text-accent-text hover:bg-sand"
                          >
                            <Pencil size={15} aria-hidden="true" />
                            Modifier
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
                {rewardLines.map(({ index, item }) => (
                  <li key={`reward-${index}`} className="flex gap-3 py-4">
                    <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-pink-soft text-ink" aria-hidden="true">
                      <Gift size={32} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold leading-tight">{item.name}</h3>
                        <p className="shrink-0 font-display text-base font-extrabold text-accent-text">Offert</p>
                      </div>
                      {item.optionLabels.length > 0 && <p className="mt-0.5 text-xs leading-snug text-muted">{item.optionLabels.join(" · ")}</p>}
                      <button
                        type="button"
                        onClick={() => removeReward(index)}
                        className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-bold text-danger hover:bg-sand"
                      >
                        <Trash2 size={15} aria-hidden="true" />
                        Retirer le cadeau
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <OfferPanel />

              {isDelivery && freeFrom !== null && (
                <div className="mt-2 rounded-2xl bg-white p-4 text-sm">
                  {totals.freeDeliveryRemaining === null ? (
                    <p className="flex items-center gap-2 font-bold text-ink-3">
                      <Check size={18} aria-hidden="true" /> Livraison offerte
                    </p>
                  ) : (
                    <>
                      <p>
                        Plus que <strong>{formatPrice(totals.freeDeliveryRemaining)}</strong> pour la livraison offerte.
                      </p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand" role="presentation">
                        <div
                          className="h-full rounded-full bg-accent transition-all duration-500"
                          style={{ width: `${Math.min(100, (totals.subtotal / freeFrom) * 100)}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {suggestions.length > 0 && (
                <section className="mt-6" aria-labelledby="upsell-title">
                  <h3 id="upsell-title" className="mb-3 text-base font-extrabold">
                    Complète ta commande
                  </h3>
                  <ul className="grid gap-2">
                    {suggestions.map((p) => (
                      <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-white p-2 pr-3">
                        <ProductVisual item={p} className="size-14 shrink-0 rounded-xl" sizes="56px" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{p.name}</p>
                          <p className="text-sm text-muted">{formatPrice(p.price)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => quickAdd(p.id)}
                          className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-ink transition hover:bg-accent-deep active:scale-90"
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
                <div className="flex items-baseline justify-between border-t border-line pt-2 text-lg">
                  <dt className="font-extrabold">Total</dt>
                  <dd className="font-display text-2xl font-extrabold">{formatPrice(totals.total)}</dd>
                </div>
              </dl>

              {blocked && (
                <p className="mt-3 rounded-xl bg-lemon/40 px-3 py-2 text-sm font-semibold" role="status">
                  Commande minimum en livraison : {formatPrice(site.ordering.delivery.minOrder)}. Encore {formatPrice(totals.minOrderMissing)}, ou passe en « {site.ordering.pickup.label} ».
                </p>
              )}

              {orderingPaused && (
                <p className="mt-3 rounded-xl bg-lemon/40 px-3 py-2 text-sm font-semibold" role="status">
                  {orderingMessage || PAUSE_DEFAULT_TEXT}
                </p>
              )}

              {blocked || orderingPaused ? (
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
