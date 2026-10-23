"use client";

import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { categories, products } from "@/data/menu";
import { plural } from "@/lib/format";
import { ModeToggle } from "../cart/ModeToggle";
import { CATEGORY_EVENT } from "../CategoryLink";
import { OpenStatus } from "../OpenStatus";
import { ProductCard } from "../ProductCard";
import { ArtSvg } from "../ProductArt";
import { SectionHeading } from "./SectionHeading";

const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
const ALL = "all";

/** Menu complet : filtres de catégories, recherche instantanée, grille de produits. */
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
    requestAnimationFrame(() => document.getElementById("menu-results")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  // Filtre piloté de l'extérieur : liens de catégories (événement) et ancre #cat-… au chargement.
  useEffect(() => {
    const apply = (id: string, scroll: boolean) => {
      if (!categories.some((c) => c.id === id)) return;
      setFilter(id);
      setQuery("");
      if (scroll) requestAnimationFrame(() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    const onEvent = (e: Event) => apply((e as CustomEvent<string>).detail, true);
    const fromHash = () => {
      const m = window.location.hash.match(/^#cat-(.+)$/);
      if (m) apply(m[1], true);
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

  return (
    <section id="menu" aria-labelledby="menu-title">
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8 lg:pt-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading id="menu-title" eyebrow="Commander" title={<>Toute la <span className="display-em text-accent-text">carte</span></>} />
          <div className="relative w-full md:max-w-sm">
            <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un plat, une boisson…"
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

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <ModeToggle />
          <OpenStatus />
        </div>
      </div>

      {!searching && (
        <div className="sticky top-16 z-30 mt-6 border-y border-line/80 bg-cream/95 backdrop-blur-md lg:top-[4.75rem]">
          <div
            role="group"
            aria-label="Filtrer par catégorie"
            className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8"
          >
            {[{ id: ALL, name: "Tout", n: products.length }, ...categories.map((c) => ({ id: c.id, name: c.name, n: products.filter((p) => p.categoryId === c.id).length }))].map(
              (chip) => (
                <button
                  key={chip.id}
                  type="button"
                  aria-pressed={filter === chip.id}
                  onClick={() => chooseFilter(chip.id)}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[0.95rem] font-bold transition ${
                    filter === chip.id ? "bg-ink text-cream" : "bg-white text-ink ring-1 ring-line hover:bg-sand"
                  }`}
                >
                  {chip.name}
                  <span className={`text-xs font-semibold ${filter === chip.id ? "text-cream/70" : "text-muted"}`}>{chip.n}</span>
                </button>
              ),
            )}
          </div>
        </div>
      )}

      <div id="menu-results" className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
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
              <div className="flex flex-col items-center gap-3 rounded-card bg-white px-6 py-12 text-center shadow-card">
                <ArtSvg art={categories[0].art} className="h-32 w-auto opacity-90" />
                <p className="font-display text-2xl font-bold">Rien ne correspond…</p>
                <p className="text-muted">Essaie « poulet », « matcha » ou « nems ».</p>
                <button type="button" className="btn btn-ink mt-2" onClick={() => setQuery("")}>
                  Voir toute la carte
                </button>
              </div>
            )}
          </div>
        ) : (
          <div key={filter} className="animate-rise space-y-14">
            {visibleCategories.map((c) => {
              const items = products.filter((p) => p.categoryId === c.id);
              if (items.length === 0) return null;
              return (
                <section key={c.id} id={`cat-${c.id}`} aria-labelledby={`title-${c.id}`}>
                  <div className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h3 id={`title-${c.id}`} className="font-display text-3xl font-bold sm:text-4xl">
                      {c.name}
                    </h3>
                    <p className="text-muted">{c.tagline}</p>
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
