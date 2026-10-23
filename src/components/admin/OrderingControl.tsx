"use client";

import { CircleAlert, LoaderCircle, PauseCircle, PlayCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { OrderingState } from "@/lib/shop";

/**
 * Pause des commandes en ligne : un clic pour arrêter les commandes quand la cuisine est débordée (ou fermée),
 * un clic pour les rouvrir. Pendant la pause, les clients voient un bandeau et ne peuvent plus valider de commande.
 */
export function OrderingControl() {
  const [ordering, setOrdering] = useState<OrderingState | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/shop", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json?.ordering) setOrdering(json.ordering);
      })
      .catch(() => {
        /* le bouton reste masqué si la base est indisponible */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Ferme le panneau par un clic à l'extérieur ou la touche Échap.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!ordering) return null;
  const paused = ordering.paused;

  async function apply(next: boolean) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/shop", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paused: next, message }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ordering) throw new Error(json?.error ?? "Enregistrement impossible.");
      setOrdering(json.ordering);
      setMessage(json.ordering.message);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative" ref={box}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setMessage(ordering.message);
          setError(null);
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`btn min-h-11 px-4 text-sm shadow-sm ${paused ? "bg-danger text-white hover:bg-danger/90" : "bg-white text-ink hover:bg-cream"}`}
      >
        <span className={`size-2.5 rounded-full ${paused ? "bg-white" : "bg-matcha"}`} aria-hidden="true" />
        {paused ? "Commandes en pause" : "Commandes ouvertes"}
      </button>

      {open && (
        <div role="dialog" aria-label="Pause des commandes en ligne" className="absolute right-0 z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-card bg-white p-5 shadow-pop">
          <p className="font-extrabold">{paused ? "Les commandes en ligne sont en pause" : "Mettre les commandes en pause ?"}</p>
          <p className="mt-1 text-sm text-muted">
            {paused
              ? "Les clients voient un bandeau et ne peuvent plus valider de commande."
              : "Les clients verront un bandeau et ne pourront plus valider de commande, jusqu'à ce que vous les rouvriez."}
          </p>
          {!paused && (
            <label className="mt-3 block text-sm font-bold">
              Message pour les clients <span className="font-normal text-muted">(facultatif)</span>
              <input
                className="field mt-1.5 font-normal"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={200}
                placeholder="Reprise des commandes à 18h30"
              />
            </label>
          )}
          {error && (
            <p role="alert" className="mt-3 flex items-start gap-2 text-sm font-semibold text-danger">
              <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
          <button type="button" className={`btn mt-4 w-full ${paused ? "btn-accent" : "btn-ink"}`} disabled={saving} onClick={() => void apply(!paused)}>
            {saving ? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : paused ? <PlayCircle size={18} aria-hidden="true" /> : <PauseCircle size={18} aria-hidden="true" />}
            {paused ? "Rouvrir les commandes" : "Mettre en pause"}
          </button>
        </div>
      )}
    </div>
  );
}
