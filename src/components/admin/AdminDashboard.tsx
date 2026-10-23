"use client";

import { Bell, BellOff, CircleAlert, RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { site } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { ACTIVE_STATUSES, type OrderStatus } from "@/lib/order-status";
import type { OrderMode, StoredOrder } from "@/lib/types";
import { useLocalFlag, useNow } from "./hooks";
import { AdminShell } from "./AdminShell";
import { OrderCard } from "./OrderCard";

type View = "active" | "done" | "cancelled";
type Period = "today" | "7d" | "30d" | "all";
type ModeFilter = "all" | OrderMode;

interface ListResponse {
  orders: StoredOrder[];
  counts: Record<OrderStatus, number>;
  newNumbers: string[];
  today: { orders: number; total: number };
  serverTime: string;
}

const POLL_MS = 15_000;

const PERIODS: { id: Period; label: string }[] = [
  { id: "today", label: "Aujourd'hui" },
  { id: "7d", label: "7 jours" },
  { id: "30d", label: "30 jours" },
  { id: "all", label: "Tout" },
];

const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Texte sur lequel porte la recherche : numéro, client, téléphone, plats. */
const searchable = (o: StoredOrder) =>
  normalize([o.number, o.customer.name, o.customer.phone, o.customer.address ?? "", ...o.items.map((i) => i.name)].join(" "));

/** Deux notes courtes : audible sans être agressif en cuisine. */
function playBeep() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [880, 1175].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.22);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + i * 0.22 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.22 + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.22);
      osc.stop(ctx.currentTime + i * 0.22 + 0.22);
    });
    setTimeout(() => ctx.close(), 800);
  } catch {
    /* audio indisponible : l'alerte visuelle suffit */
  }
}

export function AdminDashboard() {
  const router = useRouter();
  const now = useNow();
  const [soundOn, setSoundOn] = useLocalFlag("itea.admin.sound");
  const [view, setView] = useState<View>("active");
  const [period, setPeriod] = useState<Period>("today");
  const [query, setQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<ModeFilter>("all");
  const [data, setData] = useState<ListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const knownNew = useRef<Set<string> | null>(null);
  const soundRef = useRef(soundOn);
  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);

  const load = useCallback(
    async (target: View, targetPeriod: Period) => {
      try {
        // Les commandes à traiter s'affichent toutes ; la période ne s'applique qu'à l'historique.
        const periodParam = target === "active" ? "all" : targetPeriod;
        const res = await fetch(`/api/admin/orders?view=${target}&period=${periodParam}`, { cache: "no-store" });
        if (res.status === 401) {
          router.refresh(); // session expirée : retour à l'écran de connexion
          return;
        }
        const json = await res.json().catch(() => null);
        if (!res.ok || !json) throw new Error(json?.error ?? "Chargement impossible.");

        // Alerte sur les nouvelles commandes (pas au tout premier chargement).
        const incoming = new Set<string>(json.newNumbers);
        if (knownNew.current && [...incoming].some((n) => !knownNew.current!.has(n)) && soundRef.current) playBeep();
        knownNew.current = incoming;

        setData(json);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Chargement impossible.");
      }
    },
    [router],
  );

  // Chargement initial, au changement d'onglet ou de période, puis actualisation automatique.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") void load(view, period);
    };
    const first = setTimeout(refresh, 0);
    const id = setInterval(refresh, POLL_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearTimeout(first);
      clearInterval(id);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [view, period, load]);

  // Le titre de l'onglet signale les commandes à traiter, même fenêtre en arrière-plan.
  const newCount = data?.counts.new ?? 0;
  useEffect(() => {
    document.title = newCount > 0 ? `(${newCount}) Nouvelle${newCount > 1 ? "s" : ""} commande${newCount > 1 ? "s" : ""} | I Tea Admin` : "Admin | I Tea";
  }, [newCount]);

  async function refreshNow() {
    setRefreshing(true);
    await load(view, period);
    setRefreshing(false);
  }

  async function changeStatus(number: string, status: OrderStatus) {
    setActionError(null);
    setPending((p) => new Set(p).add(number));
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(number)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? "Mise à jour impossible.");
      }
      await load(view, period);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Mise à jour impossible.");
    } finally {
      setPending((p) => {
        const next = new Set(p);
        next.delete(number);
        return next;
      });
    }
  }

  const q = normalize(query.trim());
  const shown = useMemo(
    () => (data?.orders ?? []).filter((o) => (modeFilter === "all" || o.mode === modeFilter) && (!q || searchable(o).includes(q))),
    [data, modeFilter, q],
  );
  const filtering = q !== "" || modeFilter !== "all";

  const counts = data?.counts;
  const activeCount = counts ? ACTIVE_STATUSES.reduce((n, s) => n + counts[s], 0) : 0;
  const tabs: { id: View; label: string; count: number | null }[] = [
    { id: "active", label: "À traiter", count: counts ? activeCount : null },
    { id: "done", label: "Terminées", count: counts?.completed ?? null },
    { id: "cancelled", label: "Annulées", count: counts?.cancelled ?? null },
  ];
  const empty = {
    active: "Aucune commande à traiter pour le moment. Cette page se met à jour toute seule.",
    done: "Aucune commande terminée sur cette période.",
    cancelled: "Aucune commande annulée sur cette période.",
  }[view];

  return (
    <AdminShell>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Commandes {site.name}</h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn min-h-11 bg-white px-4 text-sm text-ink shadow-sm hover:bg-cream"
            onClick={() => {
              const next = !soundOn;
              setSoundOn(next);
              if (next) playBeep(); // un test audible, et le geste de l'utilisateur débloque le son
            }}
            aria-pressed={soundOn}
          >
            {soundOn ? <Bell size={18} aria-hidden="true" /> : <BellOff size={18} aria-hidden="true" />}
            Alerte sonore : {soundOn ? "activée" : "désactivée"}
          </button>
          <button type="button" className="btn min-h-11 bg-white px-4 text-sm text-ink shadow-sm hover:bg-cream" onClick={() => void refreshNow()} disabled={refreshing}>
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} aria-hidden="true" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Aujourd'hui en un coup d'œil */}
      <dl className="mt-5 grid grid-cols-3 gap-3" aria-label="Aujourd'hui">
        <Stat label="Nouvelles" value={data ? String(data.counts.new) : "–"} accent={newCount > 0} hint="à accepter" />
        <Stat label="Commandes aujourd'hui" value={data ? String(data.today.orders) : "–"} hint={`${activeCount} en cours`} />
        <Stat label="Montant du jour" value={data ? formatPrice(data.today.total) : "–"} hint="hors annulées" />
      </dl>

      <div role="tablist" aria-label="Filtrer les commandes" className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={view === t.id}
            onClick={() => setView(t.id)}
            className={`inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full px-5 font-bold transition ${
              view === t.id ? "bg-ink text-cream" : "bg-white text-ink hover:bg-cream"
            }`}
          >
            {t.label}
            {t.count !== null && (
              <span
                className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs font-extrabold ${
                  t.id === "active" && newCount > 0 ? "bg-accent text-ink" : view === t.id ? "bg-white/20" : "bg-sand"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Recherche et filtres */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1 sm:max-w-sm">
          <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            className="field pl-12"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Numéro, client, téléphone, plat…"
            aria-label="Rechercher une commande"
          />
        </div>
        <div role="group" aria-label="Mode de réception" className="flex gap-2">
          {(
            [
              ["all", "Tous"],
              ["pickup", site.ordering.pickup.label],
              ["delivery", site.ordering.delivery.label],
            ] as [ModeFilter, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={modeFilter === id}
              onClick={() => setModeFilter(id)}
              className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-bold transition ${modeFilter === id ? "bg-ink text-cream" : "bg-white text-ink hover:bg-cream"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {view !== "active" && (
          <label className="flex items-center gap-2 text-sm font-bold">
            Période
            <select className="field min-h-11 w-auto py-1.5 text-sm font-semibold" value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
              {PERIODS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {(error || actionError) && (
        <div role="alert" className="mt-4 flex items-start gap-2 rounded-2xl border-2 border-danger/30 bg-danger/5 p-4 font-semibold text-danger">
          <CircleAlert size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
          {actionError ?? error}
        </div>
      )}

      <section className="mt-6" aria-live="polite" aria-busy={!data}>
        {!data && !error && <p className="py-16 text-center text-muted">Chargement des commandes…</p>}
        {data && shown.length === 0 && (
          <p className="rounded-card bg-white px-6 py-16 text-center text-lg text-muted shadow-card">
            {filtering && data.orders.length > 0 ? "Aucune commande ne correspond à cette recherche." : empty}
          </p>
        )}
        {data && shown.length > 0 && (
          <>
            {filtering && (
              <p className="mb-3 text-sm text-muted">
                {shown.length} commande{shown.length > 1 ? "s" : ""} sur {data.orders.length}
              </p>
            )}
            <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {shown.map((order) => (
                <li key={order.number} className="flex">
                  <OrderCard order={order} now={now} pending={pending.has(order.number)} onStatus={(status) => void changeStatus(order.number, status)} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </AdminShell>
  );
}

function Stat({ label, value, hint, accent = false }: { label: string; value: string; hint: string; accent?: boolean }) {
  return (
    <div className={`rounded-card p-4 shadow-card sm:p-5 ${accent ? "bg-accent text-ink" : "bg-white"}`}>
      <dt className="text-xs font-bold uppercase tracking-wide opacity-70 sm:text-sm">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-extrabold leading-none sm:text-4xl">{value}</dd>
      <p className="mt-1.5 text-xs opacity-70 sm:text-sm">{hint}</p>
    </div>
  );
}
