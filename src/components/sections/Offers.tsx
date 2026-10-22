import { Bike } from "lucide-react";
import { site } from "@/config/site";
import { productsByCategory } from "@/data/menu";
import { formatPrice } from "@/lib/format";
import { FormulaCard } from "../FormulaCard";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "./SectionHeading";

/**
 * Formules (produits de la catégorie « formules ») + règle de livraison offerte si elle est configurée.
 * Aucune remise, aucun prix barré, aucun compteur d'urgence : seulement ce qui existe.
 */
export function Offers() {
  const formulas = productsByCategory("formules").filter((p) => p.available);
  const { delivery } = site.ordering;
  const freeDelivery = delivery.enabled && delivery.freeFrom !== null;
  if (formulas.length === 0 && !freeDelivery) return null;

  return (
    <section id="formules" className="relative overflow-hidden bg-ink py-16 text-cream lg:py-24" aria-labelledby="offers-title">
      <div className="absolute -left-32 top-10 size-96 rounded-full bg-ink-2/70" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            id="offers-title"
            eyebrow="Formules"
            title={<>Une boisson, <span className="display-em text-pink">une gourmandise.</span></>}
            light
          >
            Des formules pensées pour boire et manger sans te compliquer la vie.
          </SectionHeading>
        </Reveal>

        <ul className="mt-12 grid gap-6 lg:grid-cols-3">
          {formulas.map((p, i) => (
            <li key={p.id}>
              <Reveal delay={i * 90} className="h-full">
                <FormulaCard product={p} />
              </Reveal>
            </li>
          ))}
        </ul>

        {freeDelivery && delivery.freeFrom !== null && (
          <Reveal className="mt-8">
            <p className="flex items-center gap-4 rounded-card bg-white/10 px-5 py-4 text-base font-semibold">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-matcha text-ink">
                <Bike size={22} aria-hidden="true" />
              </span>
              Livraison offerte dès {formatPrice(delivery.freeFrom)} de commande.
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
