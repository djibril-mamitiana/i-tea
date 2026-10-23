"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { CategoryLink } from "../CategoryLink";
import { ArtSvg } from "../ProductArt";
import { useCatalog } from "../shop/ShopProvider";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "./SectionHeading";

/**
 * Placement des 8 cartes (grille 4 colonnes sur ordinateur). L'ordre du DOM suit la carte du restaurant ;
 * la carte haute (index 3, le bubble tea, dont le gobelet est vertical) est calée en haut à gauche et les
 * autres s'écoulent autour : entrées en large, puis trois cartes standard, puis deux larges.
 */
const TALL = 3;
const WIDE = [0, 6, 7];
const LAYOUT = [
  "sm:col-span-2 min-h-[13rem]",
  "min-h-[13rem]",
  "min-h-[13rem]",
  "sm:col-span-2 lg:col-span-1 lg:col-start-1 lg:row-start-1 lg:row-span-2 min-h-[18rem]",
  "min-h-[13rem]",
  "min-h-[13rem]",
  "min-h-[13rem] lg:col-span-2",
  "min-h-[13rem] lg:col-span-2",
];

/** Raccourcis visuels vers chaque catégorie, générés depuis src/data/menu.ts. */
export function Categories() {
  const { categories, byCategory } = useCatalog();
  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24" aria-labelledby="categories-title">
      <Reveal>
        <SectionHeading id="categories-title" eyebrow="La carte" title={<>Qu&apos;est-ce qui te <span className="display-em text-accent-text">ferait plaisir&nbsp;?</span></>} />
      </Reveal>

      <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {categories.map((c, i) => {
          const n = byCategory(c.id).length;
          const tall = i === TALL;
          const wide = WIDE.includes(i);
          return (
            <li key={c.id} className={LAYOUT[i] ?? "min-h-[13rem]"}>
              <Reveal delay={i * 60} className="h-full">
                <CategoryLink
                  id={c.id}
                  style={{ backgroundColor: c.art.bg }}
                  className="group relative flex h-full min-h-[inherit] overflow-hidden rounded-card p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-pop sm:p-7"
                >
                  <div className="relative z-10 flex max-w-[58%] flex-col">
                    <span className="eyebrow">
                      {n} {n > 1 ? "produits" : "produit"}
                    </span>
                    <span className={`font-display mt-2 text-balance font-bold leading-[1.02] ${tall ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}>
                      {c.shortName ?? c.name}
                    </span>
                    <span className="mt-1.5 text-sm text-ink/70">{c.tagline}</span>
                    <span className="mt-auto inline-flex pt-5">
                      <span className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-cream transition group-hover:bg-ink-2">
                        Découvrir
                        <ArrowUpRight size={16} aria-hidden="true" className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </span>
                  </div>

                  {c.image ? (
                    <div
                      className={`absolute overflow-hidden transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
                        tall ? "inset-x-0 bottom-0 h-[58%]" : "inset-y-0 right-0 w-[48%] sm:w-[44%]"
                      }`}
                      style={{
                        maskImage: tall ? "linear-gradient(to top, #000 62%, transparent)" : "linear-gradient(to right, transparent, #000 42%)",
                        WebkitMaskImage: tall ? "linear-gradient(to top, #000 62%, transparent)" : "linear-gradient(to right, transparent, #000 42%)",
                      }}
                      aria-hidden="true"
                    >
                      <Image src={c.image} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                    </div>
                  ) : (
                    <ArtSvg
                      art={c.art}
                      className={`absolute transition-transform duration-500 ease-out group-hover:-rotate-3 group-hover:scale-105 ${
                        tall
                          ? "-bottom-2 -right-8 h-[80%] w-auto lg:-right-12 lg:h-[66%]"
                          : wide
                            ? "-bottom-8 -right-4 h-[112%] w-auto sm:-right-2"
                            : "-bottom-6 -right-8 h-[96%] w-auto"
                      }`}
                    />
                  )}
                </CategoryLink>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
