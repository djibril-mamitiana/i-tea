"use client";

import { useEffect, useRef } from "react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  /** "modal" : centré sur ordinateur. "drawer" : tiroir à droite. "menu" : volet qui descend du haut. */
  variant: "modal" | "drawer" | "menu";
  label: string;
  children: React.ReactNode;
}

/**
 * Boîte de dialogue native (<dialog>) : focus piégé, fermeture à Échap et
 * inertie de l'arrière-plan gérés par le navigateur. Feuille basse sur mobile.
 */
export function Sheet({ open, onClose, variant, label, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const align = {
    drawer: "items-end md:items-stretch md:justify-end",
    modal: "items-end md:items-center md:justify-center",
    menu: "items-start",
  }[variant];
  const dialogClass = { drawer: "from-right", modal: "modal", menu: "from-top" }[variant];

  return (
    <dialog
      ref={ref}
      aria-label={label}
      className={`sheet ${dialogClass}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={onClose}
    >
      {/* Clic hors du panneau = fermeture */}
      <div
        className={`flex h-full w-full ${align}`}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {open && children}
      </div>
    </dialog>
  );
}
