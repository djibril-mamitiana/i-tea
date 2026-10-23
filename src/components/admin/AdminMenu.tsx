"use client";

import { CircleAlert, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { categories, products } from "@/data/menu";
import { formatPrice } from "@/lib/format";
import { PRODUCT_STATES, STATE_LABEL, stateOf, type MenuStatus, type ProductState } from "@/lib/shop";
import { AdminShell } from "./AdminShell";

const STATE_STYLE: Record<ProductState, string> = {
  available: "bg-matcha text-ink",
  unavailable: "bg-lemon text-ink",
  hidden: "bg-ink text-cream",
};

type Filter = "all" | "unavailable" | "hidden";

/**
 * Carte : l'équipe retire un plat du site ou le met en rupture, sans toucher au code. Le changement est immédiat :
 * un plat en rupture reste visible mais grisé, un plat retiré disparaît du site et ne peut plus être commandé.
 */
export function AdminMenu() {
  const router = useRouter();
  const [status, setStatus] = useState<MenuStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [saving, setSaving] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/menu", { cache: "no-store" });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      const json = await res.json().catch(() => null);
      if (!res.ok || !json) throw new Error(json?.error ?? "Chargement impossible.");
      setStatus(json.status);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    }
  }, [router]);

  useEffect(() => {
    const first = setTimeout(() => void load(), 0);
    return () => clearTimeout(first);
  }, [load]);

  /** Applique tout de suite à l'écran, enregistre, puis relit l'état réel (ou restaure en cas d'échec). */
  async function change(changes: Record<string, ProductState>) {
    if (!status) return;
    const before = status;
    const optimistic = { ...status };
    for (const [id, state] of Object.entries(changes)) {
      if (state === "available") delete optimistic[id];
      else optimistic[id] = state;
    }
    setStatus(optimistic);
    setError(null);
    setSaving((n) => n + 1);
    try {
      const res = await fetch("/api/admin/menu", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ changes }) });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.status) throw new Error(json?.error ?? "Enregistrement impossible.");
      setStatus(json.status);
    } catch (err) {
      setStatus(before);
      setError(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setSaving((n) => n - 1);
    }
  }

  const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const q = normalize(query.trim());

  const sections = useMemo(() => {
    if (!status) return [];
    return categories
      .map((category) => ({
        category,
        items: products.filter(
          (p) =>
            p.categoryId === category.id &&
            (!q || normalize(`${p.name} ${category.name}`).includes(q)) &&
            (filter === "all" || stateOf(status, p.id) === filter),
        ),
      }))
      .filter((s) => s.items.length > 0);
  }, [status, q, filter]);

  const counts = useMemo(() => {
    const all = Object.values(status ?? {});
    return { unavailable: all.filter((s) => s === "unavailable").length, hidden: all.filter((s) => s === "hidden").length };
  }, [status]);

  return (
    <AdminShell width="max-w-5xl">
      <div className="mt-5">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Carte</h1>
        <p className="mt-1 max-w-2xl text-muted">
          Mettez un plat <strong>en rupture</strong> (visible mais grisé, non commandable) ou <strong>retirez-le du site</strong>. C&apos;est immédiat, sans toucher au code,
          et vous pouvez le remettre à tout moment.
        </p>
      </div>

      {error && (
        <div role="alert" className="mt-4 flex items-start gap-2 rounded-2xl border-2 border-danger/30 bg-danger/5 p-4 font-semibold text-danger">
          <CircleAlert size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1 sm:max-w-sm">
          <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input type="search" className="field pl-12" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un plat…" aria-label="Rechercher un plat" />
        </div>
        <div role="group" aria-label="Filtrer par état" className="flex flex-wrap gap-2">
          {(
            [
              ["all", "Tous"],
              ["unavailable", `En rupture · ${counts.unavailable}`],
              ["hidden", `Retirés · ${counts.hidden}`],
            ] as [Filter, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
              className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-bold transition ${filter === id ? "bg-ink text-cream" : "bg-white text-ink hover:bg-cream"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted" role="status" aria-live="polite">
          {saving > 0 ? "Enregistrement…" : status ? "Modifications enregistrées automatiquement." : ""}
        </p>
      </div>

      <div className="mt-6 space-y-8">
        {!status && !error && <p className="py-16 text-center text-muted">Chargement de la carte…</p>}
        {status && sections.length === 0 && (
          <p className="rounded-card bg-white px-6 py-14 text-center text-lg text-muted shadow-card">
            {filter === "all" ? "Aucun plat ne correspond." : "Aucun plat dans cet état."}
          </p>
        )}
        {sections.map(({ category, items }) => {
          const notAvailable = items.filter((p) => stateOf(status!, p.id) !== "available");
          return (
            <section key={category.id} aria-labelledby={`menu-${category.id}`}>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 id={`menu-${category.id}`} className="font-display text-2xl font-extrabold">
                  {category.name} <span className="text-base font-semibold text-muted">· {items.length}</span>
                </h2>
                {notAvailable.length > 0 && (
                  <button
                    type="button"
                    className="min-h-11 text-sm font-bold text-accent-text underline-offset-4 hover:underline"
                    onClick={() => void change(Object.fromEntries(notAvailable.map((p) => [p.id, "available" as const])))}
                  >
                    Tout remettre disponible
                  </button>
                )}
              </div>
              <ul className="divide-y divide-line overflow-hidden rounded-card bg-white shadow-card">
                {items.map((p) => {
                  const state = stateOf(status!, p.id);
                  return (
                    <li key={p.id} className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-5 ${state === "available" ? "" : "bg-sand/50"}`}>
                      <div className="min-w-0">
                        <p className={`font-bold leading-tight ${state === "hidden" ? "text-muted line-through" : ""}`}>{p.name}</p>
                        <p className="text-sm text-muted">{formatPrice(p.price)}</p>
                      </div>
                      <div role="radiogroup" aria-label={`État de ${p.name}`} className="flex rounded-full bg-sand p-1">
                        {PRODUCT_STATES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            role="radio"
                            aria-checked={state === s}
                            onClick={() => state !== s && void change({ [p.id]: s })}
                            className={`min-h-10 rounded-full px-3 text-sm font-bold transition sm:px-4 ${state === s ? STATE_STYLE[s] : "text-muted hover:text-ink"}`}
                          >
                            {STATE_LABEL[s]}
                          </button>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </AdminShell>
  );
}
