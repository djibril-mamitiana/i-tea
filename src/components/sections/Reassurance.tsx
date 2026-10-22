import { Banknote, Bike, Clock, GlassWater, Store } from "lucide-react";
import { activePayments, site } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { hoursSummary, weekHours } from "@/lib/hours";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "./SectionHeading";

/** Uniquement des informations réellement configurées dans src/config/site.ts. */
export function Reassurance() {
  const { pickup, delivery } = site.ordering;
  const payments = activePayments();
  const open = weekHours().find((h) => h.open && h.close);

  const tiles = [
    {
      icon: GlassWater,
      title: "Fait à ta façon",
      text: "Taille, sucre, glace, garnitures : chaque boisson se personnalise avant d'être ajoutée.",
    },
    {
      icon: delivery.enabled ? Bike : Store,
      title: [pickup.enabled && "À emporter", delivery.enabled && "livraison"].filter(Boolean).join(" ou ").replace(/^./, (c) => c.toUpperCase()),
      text: delivery.enabled
        ? delivery.freeFrom !== null
          ? `Livraison ${formatPrice(delivery.fee)}, offerte dès ${formatPrice(delivery.freeFrom)}. ${delivery.zones}`
          : `Livraison ${formatPrice(delivery.fee)}. ${delivery.zones}`
        : pickup.description,
    },
    ...(payments.length
      ? [
          {
            icon: Banknote,
            title: "Paiement simple",
            text: payments.map((p) => `${p.label} : ${p.description.charAt(0).toLowerCase()}${p.description.slice(1)}`).join(" "),
          },
        ]
      : []),
    ...(open ? [{ icon: Clock, title: "Horaires", text: hoursSummary() }] : []),
  ];

  return (
    <section className="bg-sand py-16 lg:py-24" aria-labelledby="trust-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading id="trust-title" eyebrow="Bon à savoir" title="Commander, c'est simple." />
        </Reveal>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map(({ icon: Icon, title, text }, i) => (
            <li key={title}>
              <Reveal delay={i * 60} className="h-full">
                <div className="h-full rounded-card bg-white p-6 shadow-card">
                  <span className="grid size-12 place-items-center rounded-2xl bg-ink text-cream">
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-xl font-extrabold">{title}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted">{text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
