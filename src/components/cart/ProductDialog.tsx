"use client";

import { Check, X } from "lucide-react";
import { useRef, useState } from "react";
import { site } from "@/config/site";
import { getProduct } from "@/data/menu";
import { formatPrice, formatSupplement } from "@/lib/format";
import { defaultSelections, unitPrice } from "@/lib/pricing";
import type { CartLine, OptionGroup, Product, Selections } from "@/lib/types";
import { ProductVisual } from "../ProductVisual";
import { Sheet } from "../ui/Sheet";
import { Stepper } from "../ui/Stepper";
import { useCart } from "./CartProvider";

/** Modale de personnalisation : s'ouvre sans quitter la page. */
export function ProductDialog() {
  const { dialog, closeProduct, lines, addItem, replaceItem } = useCart();
  const product = dialog ? getProduct(dialog.productId) : undefined;
  const editLine = dialog?.editLineId ? lines.find((l) => l.line.id === dialog.editLineId)?.line : undefined;

  return (
    <Sheet open={!!product} onClose={closeProduct} variant="modal" label={product ? `Personnaliser ${product.name}` : "Personnalisation"}>
      {product && (
        <ProductForm
          key={`${product.id}:${editLine?.id ?? "new"}`}
          product={product}
          editLine={editLine}
          onClose={closeProduct}
          onSubmit={(selections, qty) => {
            if (editLine) replaceItem(editLine.id, selections, qty);
            else addItem(product.id, selections, qty);
            closeProduct();
          }}
        />
      )}
    </Sheet>
  );
}

function ProductForm({
  product,
  editLine,
  onClose,
  onSubmit,
}: {
  product: Product;
  editLine?: CartLine;
  onClose: () => void;
  onSubmit: (selections: Selections, qty: number) => void;
}) {
  const [selections, setSelections] = useState<Selections>(() => editLine?.selections ?? defaultSelections(product));
  const [qty, setQty] = useState(editLine?.qty ?? 1);
  const [showErrors, setShowErrors] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const missing = product.groups.filter((g) => (selections[g.id]?.length ?? 0) < g.min);
  const unit = unitPrice(product, selections);
  const total = unit * qty;

  const toggle = (group: OptionGroup, optionId: string) => {
    setSelections((prev) => {
      const current = prev[group.id] ?? [];
      const isOn = current.includes(optionId);
      let next: string[];
      if (group.max === 1) next = isOn && group.min === 0 ? [] : [optionId];
      else if (isOn) next = current.filter((id) => id !== optionId);
      else next = current.length < group.max ? [...current, optionId] : current;
      return { ...prev, [group.id]: next };
    });
  };

  const submit = () => {
    if (missing.length) {
      setShowErrors(true);
      scroller.current?.querySelector(`[data-group="${missing[0].id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    onSubmit(selections, qty);
  };

  return (
    <div className="sheet-panel relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[2rem] bg-cream shadow-pop md:h-[min(40rem,88dvh)] md:w-[calc(100%-3rem)] md:max-w-4xl md:flex-row md:rounded-[2rem]">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-10 grid size-11 place-items-center rounded-full bg-white/90 text-ink shadow transition hover:bg-white active:scale-90"
        aria-label="Fermer"
      >
        <X size={22} />
      </button>

      <ProductVisual item={product} className="h-40 w-full shrink-0 md:h-auto md:w-[34%]" sizes="(min-width: 768px) 320px, 100vw" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div ref={scroller} className="relative min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-5">
          <h2 className="pr-10 font-display text-3xl font-bold leading-tight">{product.name}</h2>
          <p className="mt-1 text-sm text-muted">{product.description}</p>
          <p className="mt-2 font-display text-xl font-bold text-accent-text">{formatPrice(product.price)}</p>

          <div className="mt-5 space-y-6">
            {product.groups.map((group, index) => (
              <GroupField
                key={group.id}
                step={index + 1}
                group={group}
                chosen={selections[group.id] ?? []}
                invalid={showErrors && missing.includes(group)}
                onToggle={(id) => toggle(group, id)}
              />
            ))}
          </div>
        </div>

        <footer className="safe-bottom flex items-center gap-3 border-t border-line bg-cream px-5 pt-3">
          <Stepper qty={qty} onChange={setQty} label={product.name} max={site.ordering.maxItemQty} size="sm" />
          {/* Le prix final ne doit jamais être tronqué, même sur un petit téléphone. */}
          <button type="button" className="btn btn-accent relative min-h-14 min-w-0 flex-1 gap-1.5 px-4 sm:px-6" onClick={submit}>
            <span className="truncate">
              {editLine ? (
                "Mettre à jour"
              ) : (
                <>
                  Ajouter<span className="hidden min-[420px]:inline"> au panier</span>
                </>
              )}
            </span>
            <span aria-hidden="true">—</span>
            <span className="sr-only">, </span>
            <span className="shrink-0">{formatPrice(total)}</span>
          </button>
        </footer>
      </div>
    </div>
  );
}

function GroupField({
  step,
  group,
  chosen,
  invalid,
  onToggle,
}: {
  step: number;
  group: OptionGroup;
  chosen: string[];
  invalid: boolean;
  onToggle: (optionId: string) => void;
}) {
  const multi = group.max > 1;
  const full = multi && chosen.length >= group.max;
  // Choix gratuits et courts (sucre, glace…) : puces compactes plutôt que lignes.
  const compact = group.max === 1 && group.options.length >= 3 && group.options.every((o) => o.price === 0 && !o.detail);

  return (
    <fieldset data-group={group.id} className="min-w-0">
      <legend className="mb-2.5 flex w-full flex-wrap items-center gap-x-2.5 gap-y-0.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-extrabold text-cream" aria-hidden="true">
          {step}
        </span>
        <span className="font-display text-xl font-bold leading-none">{group.label}</span>
        <span className="text-sm text-muted">
          {group.hint ?? (group.min > 0 ? "Obligatoire" : "Facultatif")}
        </span>
      </legend>
      {invalid && (
        <p className="mb-2 text-sm font-semibold text-danger" role="alert">
          {group.min > 1 ? `Choisis ${group.min} options pour continuer.` : "Fais un choix pour continuer."}
        </p>
      )}
      <div className={compact ? "flex flex-wrap gap-2" : "grid gap-2"}>
        {group.options.map((option) => {
          const checked = chosen.includes(option.id);
          const unavailable = option.available === false;
          const blocked = unavailable || (multi && full && !checked);
          return (
            <label
              key={option.id}
              className={`relative flex items-center gap-3 border-2 transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-accent/50 ${
                compact ? "min-h-11 rounded-full px-4" : "min-h-14 rounded-2xl px-4 py-2"
              } ${
                checked ? (compact ? "border-ink bg-ink text-cream" : "border-ink bg-matcha-soft") : "border-line bg-white"
              } ${blocked ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:border-ink/50"}`}
            >
              <input
                type={multi ? "checkbox" : "radio"}
                name={group.id}
                className="sr-only"
                checked={checked}
                disabled={blocked}
                onChange={() => onToggle(option.id)}
              />
              {!compact && (
                <span
                  className={`grid size-6 shrink-0 place-items-center border-2 ${multi ? "rounded-md" : "rounded-full"} ${
                    checked ? "border-ink bg-ink text-cream" : "border-ink/30 bg-white"
                  }`}
                  aria-hidden="true"
                >
                  {checked && <Check size={14} strokeWidth={3.5} />}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-[0.95rem] font-semibold leading-tight">
                  {option.label}
                  {unavailable && <span className="font-normal"> — épuisé</span>}
                </span>
                {option.detail && !compact && <span className="block text-xs text-muted">{option.detail}</span>}
              </span>
              {!compact && (
                <span className={`shrink-0 text-sm font-bold ${option.price > 0 ? "" : "text-muted"}`}>
                  {group.max === 1 && option.price === 0 ? "" : formatSupplement(option.price)}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
