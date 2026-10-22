import { products } from "@/data/menu";
import { ProductCard } from "../ProductCard";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "./SectionHeading";

export function Bestsellers() {
  const favorites = products.filter((p) => p.popular && p.available);
  if (favorites.length === 0) return null;

  return (
    <section id="incontournables" className="bg-sand py-16 lg:py-24" aria-labelledby="fav-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading id="fav-title" eyebrow="Les favoris" title="Les incontournables de I Tea">
            Ceux que l&apos;on commande les yeux fermés. Un tap, c&apos;est dans ton panier.
          </SectionHeading>
        </Reveal>

        <ul className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory scroll-pl-4 gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:scroll-pl-6 sm:px-6 md:mx-0 md:scroll-pl-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
          {favorites.map((p, i) => (
            <li key={p.id} className="w-[68vw] max-w-72 shrink-0 snap-start md:w-auto md:max-w-none">
              <ProductCard product={p} priority={i < 2} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
