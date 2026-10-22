import Link from "next/link";
import { categories, productsByCategory } from "@/data/menu";
import { ProductVisual } from "../ProductVisual";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "./SectionHeading";

/** Raccourcis visuels vers chaque catégorie. Générés depuis src/data/menu.ts. */
export function Categories() {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24" aria-labelledby="categories-title">
      <Reveal>
        <SectionHeading id="categories-title" eyebrow="La carte" title="Qu'est-ce qui te ferait plaisir ?" />
      </Reveal>

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-6">
        {categories.map((c, i) => {
          const n = productsByCategory(c.id).length;
          return (
            <li key={c.id}>
              <Reveal delay={i * 50} className="h-full">
                <Link
                  href={`#cat-${c.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-card bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-pop"
                >
                  <ProductVisual item={{ ...c, name: c.name }} className="aspect-[5/4] w-full" sizes="(min-width: 1280px) 16vw, 45vw" />
                  <span className="flex flex-1 flex-col p-4">
                    <span className="font-display text-lg font-extrabold leading-tight">{c.name}</span>
                    <span className="mt-0.5 text-sm text-muted">{c.tagline}</span>
                    <span className="mt-2 text-xs font-bold uppercase tracking-wide text-accent-text">
                      {n} {n > 1 ? "produits" : "produit"}
                    </span>
                  </span>
                </Link>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
