"use client";

import { FeaturedCard } from "../FeaturedCard";
import { useCatalog } from "../shop/ShopProvider";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "./SectionHeading";

export function Bestsellers() {
  const { products, isAvailable } = useCatalog();
  const favorites = products.filter((p) => p.popular && p.available && isAvailable(p.id));
  if (favorites.length === 0) return null;

  return (
    <section id="selection" className="bg-sand py-16 lg:py-24" aria-labelledby="fav-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            id="fav-title"
            eyebrow="À goûter"
            title={<>Notre <span className="display-em text-accent-text">sélection</span></>}
          >
            Quelques plats et boissons de la carte, pour commencer. Un tap, et c&apos;est dans ton panier.
          </SectionHeading>
        </Reveal>

        {/* Mobile : carrousel à défilement ; ordinateur : grille décalée façon magazine */}
        <ul className="no-scrollbar -mx-4 mt-12 flex snap-x snap-mandatory scroll-pl-4 gap-5 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:scroll-pl-6 sm:px-6 md:mx-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-14 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3 lg:pb-10">
          {favorites.map((p, i) => (
            <li
              key={p.id}
              className="w-[74vw] max-w-80 shrink-0 snap-start md:w-auto md:max-w-none lg:[&:nth-child(3n+2)]:translate-y-10"
            >
              <Reveal delay={(i % 3) * 80} className="h-full">
                <FeaturedCard product={p} priority={i < 2} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
