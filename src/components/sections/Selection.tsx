import { products } from "@/data/menu";
import { site } from "@/config/site";
import { SelectionCard } from "../SelectionCard";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "./SectionHeading";

/** Trois ou quatre produits réellement au menu (champ `featured`), en composition asymétrique. Aucune popularité n'est affirmée. */
export function Selection() {
  const featured = products.filter((p) => p.featured && p.available).slice(0, 4);
  if (featured.length === 0) return null;
  const [first, ...others] = featured;
  const { eyebrow, title } = site.sections.selection;

  return (
    <section id="selection" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-28" aria-labelledby="selection-title">
      <Reveal>
        <SectionHeading id="selection-title" eyebrow={eyebrow} title={title} />
      </Reveal>

      <div className="mt-8 grid gap-10 sm:mt-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
        <Reveal>
          <SelectionCard product={first} variant="large" priority />
        </Reveal>
        <ul className="flex flex-col gap-9 lg:gap-10">
          {others.map((p, i) => (
            <li key={p.id} className="lg:border-t lg:border-line lg:pt-10 lg:first:border-t-0 lg:first:pt-0">
              <Reveal delay={i * 90}>
                <SelectionCard product={p} variant="row" />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
