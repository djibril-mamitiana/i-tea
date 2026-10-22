"use client";

import { Minus, Plus, Trash2 } from "lucide-react";

interface StepperProps {
  qty: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
  label: string;
  /** À qty = 1, le « − » devient une corbeille (suppression). */
  removable?: boolean;
  size?: "md" | "sm";
}

export function Stepper({ qty, onChange, min = 1, max = 20, label, removable = false, size = "md" }: StepperProps) {
  const dim = size === "sm" ? "size-11" : "size-12";
  const showTrash = removable && qty <= min;
  return (
    <div className="inline-flex items-center rounded-full bg-sand p-1" role="group" aria-label={`Quantité : ${label}`}>
      <button
        type="button"
        className={`${dim} grid place-items-center rounded-full bg-white text-ink shadow-sm transition active:scale-90 hover:bg-cream disabled:opacity-40`}
        onClick={() => onChange(showTrash ? 0 : qty - 1)}
        disabled={!removable && qty <= min}
        aria-label={showTrash ? `Retirer ${label}` : `Diminuer la quantité de ${label}`}
      >
        {showTrash ? <Trash2 size={18} /> : <Minus size={18} />}
      </button>
      <span className="min-w-9 text-center text-base font-bold tabular-nums" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        className={`${dim} grid place-items-center rounded-full bg-white text-ink shadow-sm transition active:scale-90 hover:bg-cream disabled:opacity-40`}
        onClick={() => onChange(qty + 1)}
        disabled={qty >= max}
        aria-label={`Augmenter la quantité de ${label}`}
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
