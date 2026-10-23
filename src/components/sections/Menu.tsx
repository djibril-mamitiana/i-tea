"use client";

import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { categories, products } from "@/data/menu";
import { plural } from "@/lib/format";
import { ModeToggle } from "../cart/ModeToggle";
import { CATEGORY_EVENT } from "../CategoryLink";
import { OpenStatus } from "../OpenStatus";
import { ProductCard } from "../ProductCard";
import { SectionHeading } from "./SectionHeading";

const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
const ALL = "all";
const GRID = "grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3";

/** La carte complète : filtres de catégories, recherche instantanée (insensible aux accents), commande. */
export function Menu() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>(ALL);
  const searching = query.trim().length > 0;

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    return products.filter((p) => {
      const cat = categories.find((c) => c.id === p.categoryId)?.name ?? "";
      return normalize(`${p.name} ${p.description} ${cat}`).includes(q);
    });
  }, [query]);

  const scrollToResults = () => {
    requestAnimationFrame(() => document.getElementById("carte-resultats")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  // Filtre piloté de l'extérieur : liens de catégories (événement) et ancre #cat-… au chargement.
  useEffect(() => {
    const apply = (id: string) => {
      if (!categories.some((c) => c.id === id)) return;
      setFilter(id);
      setQuery("");
      requestAnimationFrame(() => document.getElementById("carte")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    const onEvent = (e: Event) => apply((e as CustomEvent<string>).detail);
    const fromHash = () => {
      const m = window.location.hash.match(/^#cat-(.+)$/);
      if (m) apply(m[1]);
    };
    window.addEventListener(CATEGORY_EVENT, onEvent);
    window.addEventListener("hashchange", fromHash);
    const first = setTimeout(fromHash, 0);
    return () => {
      clearTimeout(first);
      window.removeEventListener(CATEGORY_EVENT, onEvent);
      window.removeEventListener("hashchange", fromHash);
    };
  }, []);

  const chooseFilter = (id: string) => {
    setFilter(id);
    scrollToResults();
  };

  const visibleCategories = filter === ALL ? categories : categories.filter((c) => c.id === filter);
  const chips = [{ id: ALL, name: "Tout", n: products.length }, ...categories.map((c) => ({ id: c.id, name: c.name, n: products.filter((p) => p.categoryId === c.id).length }))];

  return (
    <section id="carte" className="bg-cream" aria-labelledby="carte-title">
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8 lg:pt-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading id="carte-title" eyebrow="Commander" title="La carte" />
          <div className="relative w-full md:max-w-sm">
            <Search size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un plat, une boisson…"
              aria-label="Rechercher dans la carte"
              className="field pl-12 pr-12"
              enterKeyHint="search"
            />
            {searching && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded text-muted hover:bg-sand"
                aria-label="Effacer la recherche"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <ModeToggle />
          <OpenStatus />
        </div>
      </div>

      {!searching && (
        <div className="sticky top-16 z-30 mt-6 border-y border-line bg-cream/95 backdrop-blur-md lg:top-20">
          <div role="group" aria-label="Filtrer par catégorie" className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
            {chips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                aria-pressed={filter === chip.id}
                onClick={() => chooseFilter(chip.id)}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-4 text-[0.95rem] font-semibold transition ${
                  filter === chip.id ? "border-green bg-green text-cream" : "border-line bg-[#fffdf8] text-ink hover:border-ink/40"
                }`}
              >
                {chip.name}
                <span className={`text-xs font-medium ${filter === chip.id ? "text-cream/70" : "text-muted"}`}>{chip.n}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div id="carte-resultats" className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        {searching ? (
          <div role="region" aria-live="polite" aria-label="Résultats de la recherche">
            <p className="mb-5 text-lg font-semibold">
              {results.length} {plural(results.length, "résultat", "résultats")} pour « {query.trim()} »
            </p>
            {results.length > 0 ? (
              <ul className={GRID}>
                {results.map((p) => (
                  <li key={p.id}>
                    <ProductCard product={p} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-lg border border-line bg-[#fffdf8] px-6 py-12 text-center">
                <p className="font-display text-2xl">Aucun résultat</p>
                <p className="mt-1 text-muted">Essayez un autre mot, ou parcourez toute la carte.</p>
                <button type="button" className="btn btn-green mt-5" onClick={() => setQuery("")}>
                  Voir toute la carte
                </button>
              </div>
            )}
          </div>
        ) : (
          <div key={filter} className="animate-rise space-y-16">
            {visibleCategories.map((c) => {
              const items = products.filter((p) => p.categoryId === c.id);
              if (items.length === 0) return null;
              return (
                <section key={c.id} id={`cat-${c.id}`} aria-labelledby={`title-${c.id}`}>
                  <div className="mb-7 flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-line pb-4">
                    <h3 id={`title-${c.id}`} className="font-display text-3xl font-medium sm:text-4xl">
                      {c.name}
                    </h3>
                    <p className="text-muted">{c.tagline}</p>
                  </div>
                  <ul className={GRID}>
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
