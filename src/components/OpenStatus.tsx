"use client";

import { useEffect, useState } from "react";
import { getOpenStatus, type OpenStatus as Status } from "@/lib/hours";

/** Calculé côté navigateur après montage : jamais d'écart d'hydratation. */
export function OpenStatus({ onDark = false }: { onDark?: boolean }) {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    const update = () => setStatus(getOpenStatus());
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!status) return <span className="inline-block h-5 w-32" aria-hidden="true" />;
  return (
    <span className={`inline-flex items-center gap-2 text-sm font-semibold ${onDark ? "text-cream" : "text-ink"}`}>
      <span className={`size-2.5 rounded-full ${status.open ? (onDark ? "bg-gold" : "bg-green-2") : "bg-accent"}`} aria-hidden="true" />
      {status.open ? `Ouvert jusqu'à ${status.until}` : `Fermé${status.next ? ` · ${status.next}` : ""}`}
    </span>
  );
}
