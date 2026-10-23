"use client";

import { Bell, BellOff, CircleAlert, LogOut, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { ACTIVE_STATUSES, type OrderStatus } from "@/lib/order-status";
import type { StoredOrder } from "@/lib/types";
import { Logo } from "../Logo";
import { useLocalFlag, useNow } from "./hooks";
import { OrderCard } from "./OrderCard";

type View = "active" | "done" | "cancelled";

interface ListResponse {
  orders: StoredOrder[];
  counts: Record<OrderStatus, number>;
  newNumbers: string[];
  serverTime: string;
}

const POLL_MS = 15_000;

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
    async (target: View) => {
      try {
        const res = await fetch(`/api/admin/orders?view=${target}`, { cache: "no-store" });
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

  // Chargement initial, au changement d'onglet, puis actualisation automatique.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") void load(view);
    };
    const first = setTimeout(refresh, 0);
    const id = setInterval(refresh, POLL_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearTimeout(first);
      clearInterval(id);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [view, load]);

  // Le titre de l'onglet signale les commandes à traiter, même fenêtre en arrière-plan.
  const newCount = data?.counts.new ?? 0;
  useEffect(() => {
    document.title = newCount > 0 ? `(${newCount}) Nouvelle${newCount > 1 ? "s" : ""} commande${newCount > 1 ? "s" : ""} | I Tea Admin` : "Admin | I Tea";
  }, [newCount]);

  async function refreshNow() {
    setRefreshing(true);
    await load(view);
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
      await load(view);
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

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    router.refresh();
  }

  const counts = data?.counts;
  const activeCount = counts ? ACTIVE_STATUSES.reduce((n, s) => n + counts[s], 0) : 0;
  const tabs: { id: View; label: string; count: number | null }[] = [
    { id: "active", label: "À traiter", count: counts ? activeCount : null },
    { id: "done", label: "Terminées", count: counts?.completed ?? null },
    { id: "cancelled", label: "Annulées", count: counts?.cancelled ?? null },
  ];
  const empty = {
    active: "Aucune commande à traiter pour le moment. Cette page se met à jour toute seule.",
    done: "Aucune commande terminée.",
    cancelled: "Aucune commande annulée.",
  }[view];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3 py-5">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase tracking-wider text-cream">Admin</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
          <button
            type="button"
            className="btn min-h-11 bg-white px-4 text-sm text-ink shadow-sm hover:bg-cream"
            onClick={() => void refreshNow()}
            disabled={refreshing}
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} aria-hidden="true" />
            Actualiser
          </button>
          <button type="button" className="btn min-h-11 bg-ink px-4 text-sm text-cream hover:bg-ink-2" onClick={logout}>
            <LogOut size={18} aria-hidden="true" />
            Déconnexion
          </button>
        </div>
      </header>

      <h1 className="text-3xl font-semibold sm:text-4xl">Commandes {site.name}</h1>

      <div role="tablist" aria-label="Filtrer les commandes" className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={view === t.id}
            onClick={() => setView(t.id)}
            className={`inline-flex min-h-12 shrink-0 items-center gap-2 rounded px-5 font-bold transition ${
              view === t.id ? "bg-ink text-cream" : "bg-white text-ink hover:bg-cream"
            }`}
          >
            {t.label}
            {t.count !== null && (
              <span
                className={`grid h-6 min-w-6 place-items-center rounded px-1.5 text-xs font-semibold ${
                  t.id === "active" && newCount > 0 ? "bg-accent text-cream" : view === t.id ? "bg-white/20" : "bg-sand"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {(error || actionError) && (
        <div role="alert" className="mt-4 flex items-start gap-2 rounded-2xl border-2 border-danger/30 bg-danger/5 p-4 font-semibold text-danger">
          <CircleAlert size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
          {actionError ?? error}
        </div>
      )}

      <section className="mt-6" aria-live="polite" aria-busy={!data}>
        {!data && !error && <p className="py-16 text-center text-muted">Chargement des commandes…</p>}
        {data && data.orders.length === 0 && (
          <p className="rounded-card bg-white px-6 py-16 text-center text-lg text-muted shadow-card">{empty}</p>
        )}
        {data && data.orders.length > 0 && (
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data.orders.map((order) => (
              <li key={order.number} className="flex">
                <OrderCard
                  order={order}
                  now={now}
                  pending={pending.has(order.number)}
                  onStatus={(status) => void changeStatus(order.number, status)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
