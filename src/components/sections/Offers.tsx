import { ArrowRight, Bike, Gift } from "lucide-react";
import { site } from "@/config/site";
import { getProduct } from "@/data/menu";
import { formatPrice } from "@/lib/format";
import { CategoryLink } from "../CategoryLink";
import { ProductVisual } from "../ProductVisual";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "./SectionHeading";

/**
 * L'offre et la carte de fidélité d'I Tea (site.offer, site.loyalty) + la règle de livraison offerte si elle
 * est configurée. Aucune remise inventée, aucun prix barré, aucun compteur d'urgence : seulement ce qui existe.
 */
export function Offers() {
  const { offer, loyalty } = site;
  const { delivery } = site.ordering;
  const freeDelivery = delivery.enabled && delivery.freeFrom !== null;
  if (!offer.enabled && !loyalty.enabled && !freeDelivery) return null;

  const tiles = ["the-au-lait", "bubble-waffle", "taiyaki"].map((id) => getProduct(id)).filter((p) => p !== undefined);

  return (
    <section id="offre" className="relative overflow-hidden bg-ink py-16 text-cream lg:py-24" aria-labelledby="offers-title">
      <div className="absolute -left-32 top-10 size-96 rounded-full bg-ink-2/70" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {offer.enabled && (
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
            <Reveal>
              <SectionHeading
                id="offers-title"
                eyebrow="L'offre de la carte"
                title={
                  <>
                    {offer.lead} <span className="display-em text-pink">= {offer.reward}.</span>
                  </>
                }
                light
              >
                {offer.where}. Les conditions de l&apos;offre sont celles du restaurant.
              </SectionHeading>
              {site.demoMode && (
                <p className="mt-6 max-w-lg rounded-xl border border-dashed border-cream/40 px-4 py-3 text-sm text-cream/80">
                  À confirmer avec I Tea : les affiches annoncent l&apos;offre « {offer.where.toLowerCase()} ». Elle n&apos;est pas
                  calculée automatiquement dans le panier en ligne.
                </p>
              )}
              <div className="mt-8">
                <CategoryLink id="bubble-tea" className="btn btn-accent btn-lg">
                  Choisir mon bubble tea
                  <ArrowRight size={20} aria-hidden="true" />
                </CategoryLink>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <ul className="grid grid-cols-3 gap-3 sm:gap-5" aria-hidden="true">
                {tiles.map((p) => (
                  <li key={p.id}>
                    <ProductVisual item={p} className="aspect-[4/5] rounded-card" sizes="(min-width: 1024px) 15vw, 30vw" />
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        )}

        {(loyalty.enabled || freeDelivery) && (
          <div className={`grid gap-4 lg:grid-cols-2 ${offer.enabled ? "mt-12" : ""}`}>
            {loyalty.enabled && (
              <Reveal className="h-full">
                <div className="flex h-full gap-4 rounded-card bg-white/10 px-5 py-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-pink text-ink">
                    <Gift size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold">{loyalty.title}</h3>
                    <p className="mt-1 font-semibold">{loyalty.rule}</p>
                    <p className="font-semibold text-pink">{loyalty.reward}</p>
                    <p className="mt-2 text-sm text-cream/70">{loyalty.conditions}</p>
                  </div>
                </div>
              </Reveal>
            )}
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
