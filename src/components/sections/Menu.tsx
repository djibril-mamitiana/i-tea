"use client";

import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { categories, products } from "@/data/menu";
import { plural } from "@/lib/format";
import { ProductCard } from "../ProductCard";
import { SectionHeading } from "./SectionHeading";

const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

/** Menu complet : catégories défilantes (avec suivi de position) + recherche. */
export function Menu() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(categories[0]?.id ?? "");
  const chipBar = useRef<HTMLDivElement>(null);
  const searching = query.trim().length > 0;

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    return products.filter((p) => {
      const cat = categories.find((c) => c.id === p.categoryId)?.name ?? "";
      return normalize(`${p.name} ${p.description} ${cat}`).includes(q);
    });
  }, [query]);

  // Catégorie visible = celle dont la section traverse le tiers haut de l'écran.
  useEffect(() => {
    if (searching) return;
    const sections = categories
      .map((c) => document.getElementById(`cat-${c.id}`))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id.replace("cat-", ""));
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [searching]);

  // Garde la puce active visible dans la barre horizontale.
  useEffect(() => {
    const bar = chipBar.current;
    const chip = bar?.querySelector<HTMLElement>(`[data-chip="${active}"]`);
    if (!bar || !chip) return;
    bar.scrollTo({ left: chip.offsetLeft - bar.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  return (
    <section id="menu" aria-labelledby="menu-title">
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8 lg:pt-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading id="menu-title" eyebrow="Commander" title="Toute la carte" />
          <div className="relative w-full md:max-w-sm">
            <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une boisson, un snack…"
              aria-label="Rechercher dans le menu"
              className="field pl-12 pr-12"
              enterKeyHint="search"
            />
            {searching && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-sand"
                aria-label="Effacer la recherche"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {!searching && (
        <div className="sticky top-16 z-30 mt-6 border-y border-line/80 bg-cream/95 backdrop-blur-md lg:top-20">
          <div ref={chipBar} className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
            {categories.map((c) => (
              <a
                key={c.id}
                href={`#cat-${c.id}`}
                data-chip={c.id}
                aria-current={active === c.id ? "true" : undefined}
                className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-5 text-[0.95rem] font-bold transition ${
                  active === c.id ? "bg-ink text-cream" : "bg-white text-ink hover:bg-sand"
                }`}
              >
                {c.name}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        {searching ? (
          <div role="region" aria-live="polite" aria-label="Résultats de la recherche">
            <p className="mb-5 text-lg font-bold">
              {results.length} {plural(results.length, "résultat", "résultats")} pour « {query.trim()} »
            </p>
            {results.length > 0 ? (
              <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                {results.map((p) => (
                  <li key={p.id}>
                    <ProductCard product={p} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-card bg-white p-8 text-center shadow-card">
                <p className="text-xl font-extrabold">Rien ne correspond…</p>
                <p className="mt-1 text-muted">Essaie « thé », « poulet » ou « mangue ».</p>
                <button type="button" className="btn btn-ink mt-5" onClick={() => setQuery("")}>
                  Voir toute la carte
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-14">
            {categories.map((c) => {
              const items = products.filter((p) => p.categoryId === c.id);
              if (items.length === 0) return null;
              return (
                <section key={c.id} id={`cat-${c.id}`} aria-labelledby={`title-${c.id}`}>
                  <div className="mb-5 flex items-baseline gap-3">
                    <h3 id={`title-${c.id}`} className="text-3xl font-extrabold">
                      {c.name}
                    </h3>
                    <p className="hidden text-muted sm:block">{c.tagline}</p>
                  </div>
                  <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                    {items.map((p) => (
                      <li key={p.id}>
                        <ProductCard product={p} />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
