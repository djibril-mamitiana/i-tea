"use client";

import { ArrowRight, Bike, Gift } from "lucide-react";
import { site } from "@/config/site";
import { getProduct } from "@/data/menu";
import { formatPrice } from "@/lib/format";
import type { Offer } from "@/lib/offers";
import type { Product } from "@/lib/types";
import { CategoryLink } from "../CategoryLink";
import { useOffers } from "../offers/OffersProvider";
import { ProductVisual } from "../ProductVisual";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "./SectionHeading";

const dayFormat = new Intl.DateTimeFormat(site.locale, { day: "numeric", month: "long", timeZone: "UTC" });
const day = (iso: string) => dayFormat.format(new Date(`${iso}T00:00:00Z`));

/** « Jusqu'au 30 novembre », « Du 1 au 30 novembre »… ou rien si l'offre n'a pas de période. */
function periodNote(offer: Offer): string | null {
  if (offer.startsAt && offer.endsAt) return `Du ${day(offer.startsAt)} au ${day(offer.endsAt)}`;
  if (offer.endsAt) return `Jusqu'au ${day(offer.endsAt)}`;
  if (offer.startsAt) return `À partir du ${day(offer.startsAt)}`;
  return null;
}

/** Les offres « cadeau » ne s'appliquent en ligne que dans certains modes : on le dit clairement. */
function modesNote(offer: Offer): string | null {
  if (offer.kind !== "free_item") return null;
  const { pickup, delivery } = site.ordering;
  if (offer.modes.length === 2) return null;
  return `Commandes en ligne : ${(offer.modes[0] === "pickup" ? pickup.label : delivery.label).toLowerCase()} uniquement.`;
}

/** Photos qui illustrent une offre cadeau : un produit déclencheur, puis les cadeaux (si la carte les connaît). */
function showcase(offer: Offer): Product[] {
  const triggers = offer.triggerProductIds.map((id) => getProduct(id)).filter((p): p is Product => p !== undefined);
  const gifts = offer.alternatives.map((a) => (a.productId ? getProduct(a.productId) : undefined)).filter((p): p is Product => p !== undefined);
  const first = triggers.find((p) => p.image) ?? triggers[0];
  return [...new Set([first, ...gifts].filter((p): p is Product => p !== undefined))].slice(0, 3);
}

/**
 * Offres d'I Tea, gérées depuis l'admin (voir /admin/offres) : la première offre « cadeau » en grand,
 * les autres (annonces, carte de fidélité…) en cartes, puis la livraison offerte si elle est configurée.
 * Aucune remise inventée, aucun prix barré, aucun compteur d'urgence : seulement ce qui existe.
 */
export function Offers() {
  const { offers, status } = useOffers();
  const { delivery } = site.ordering;
  const freeDelivery = delivery.enabled && delivery.freeFrom !== null;
  if (status === "loading") return null;

  const hero = offers.find((o) => o.kind === "free_item");
  const others = offers.filter((o) => o !== hero);
  if (!hero && others.length === 0 && !freeDelivery) return null;

  const [lead, reward] = hero ? hero.title.split(" = ") : [];
  const tiles = hero ? showcase(hero) : [];
  const categoryId = hero?.triggerProductIds.map((id) => getProduct(id)?.categoryId).find(Boolean);
  const heroNotes = hero ? [periodNote(hero), modesNote(hero)].filter(Boolean) : [];

  return (
    <section id="offre" className="relative overflow-hidden bg-ink py-16 text-cream lg:py-24" aria-labelledby="offers-title">
      <div className="absolute -left-32 top-10 size-96 rounded-full bg-ink-2/70" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {hero && (
          <div className={`grid items-center gap-10 ${tiles.length ? "lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16" : ""}`}>
            <Reveal>
              <SectionHeading
                id="offers-title"
                eyebrow="L'offre du moment"
                title={
                  reward ? (
                    <>
                      {lead} <span className="display-em text-pink">= {reward}</span>
                    </>
                  ) : (
                    hero.title
                  )
                }
                light
              >
                {hero.description}
              </SectionHeading>
              {heroNotes.length > 0 && <p className="mt-4 text-sm font-semibold text-cream/75">{heroNotes.join(" · ")}</p>}
              {categoryId && (
                <div className="mt-8">
                  <CategoryLink id={categoryId} className="btn btn-accent btn-lg">
                    Voir les produits concernés
                    <ArrowRight size={20} aria-hidden="true" />
                  </CategoryLink>
                </div>
              )}
            </Reveal>

            {tiles.length > 0 && (
              <Reveal delay={120}>
                <ul className="grid grid-cols-3 gap-3 sm:gap-5" aria-hidden="true">
                  {tiles.map((p) => (
                    <li key={p.id}>
                      <ProductVisual item={p} className="aspect-[4/5] rounded-card" sizes="(min-width: 1024px) 15vw, 30vw" />
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>
        )}

        {(others.length > 0 || freeDelivery) && (
          <div className={`grid gap-4 lg:grid-cols-2 ${hero ? "mt-12" : ""}`}>
            {others.map((offer, i) => (
              <Reveal key={offer.id} className="h-full" delay={i * 60}>
                <article className="flex h-full gap-4 rounded-card bg-white/10 px-5 py-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-pink text-ink">
                    <Gift size={22} aria-hidden="true" />
                  </span>
                  <div>
                    {!hero && i === 0 ? (
                      <h2 id="offers-title" className="text-lg font-bold">
                        {offer.title}
                      </h2>
                    ) : (
                      <h3 className="text-lg font-bold">{offer.title}</h3>
                    )}
                    {offer.description && <p className="mt-1 whitespace-pre-line font-semibold leading-snug text-cream/90">{offer.description}</p>}
                    {[periodNote(offer), modesNote(offer)].filter(Boolean).map((note) => (
                      <p key={note} className="mt-2 text-sm text-cream/70">
                        {note}
                      </p>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
            {freeDelivery && delivery.freeFrom !== null && (
              <Reveal className="h-full">
                <p className="flex h-full items-center gap-4 rounded-card bg-white/10 px-5 py-5 text-base font-semibold">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-matcha text-ink">
                    <Bike size={22} aria-hidden="true" />
                  </span>
                  Livraison offerte dès {formatPrice(delivery.freeFrom)} de commande.
                </p>
              </Reveal>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
