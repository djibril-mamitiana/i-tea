import { Banknote, BadgeCheck, Bike, Leaf } from "lucide-react";
import { activePayments, site } from "@/config/site";
import { formatPrice } from "@/lib/format";

/** Bandeau compact sous le hero : uniquement ce qui est écrit sur la carte ou configuré dans src/config/site.ts. */
export function ReassuranceBar() {
  const { pickup, delivery } = site.ordering;
  const payments = activePayments();

  const serviceTitle =
    pickup.enabled && delivery.enabled ? "À emporter ou livré" : delivery.enabled ? "Livraison" : "À emporter";
  const serviceText = delivery.enabled
    ? delivery.freeFrom !== null
      ? `Livraison ${formatPrice(delivery.fee)}, offerte dès ${formatPrice(delivery.freeFrom)}`
      : `Livraison ${formatPrice(delivery.fee)}`
    : "Gratuit, à récupérer au restaurant";

  const items = [
    { icon: Leaf, title: "Fait maison", text: "Produits frais" },
    { icon: BadgeCheck, title: site.highlights.halal, text: "Indiqué sur la carte" },
    { icon: Bike, title: serviceTitle, text: serviceText },
    ...(payments.length ? [{ icon: Banknote, title: "Paiement simple", text: payments.map((p) => p.label).join(" · ") }] : []),
  ];

  return (
    <section className="bg-ink text-cream" aria-label="Nos engagements de service">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-5 gap-y-6 px-4 py-7 sm:px-6 lg:grid-cols-4 lg:divide-x lg:divide-white/15 lg:px-8">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-2.5 sm:gap-3 lg:px-6 lg:first:pl-0 lg:last:pr-0">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-accent sm:size-11">
              <Icon size={22} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[0.95rem] font-bold leading-tight sm:text-base">{title}</p>
              <p className="mt-0.5 text-sm leading-snug text-cream/70">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
