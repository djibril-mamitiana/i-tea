"use client";

import { Gift } from "lucide-react";
import { useState } from "react";
import { getProduct } from "@/data/menu";
import { plural } from "@/lib/format";
import type { OfferProgress } from "@/lib/offers";
import { CategoryLink } from "../CategoryLink";
import { useCart } from "./CartProvider";

/**
 * Offres du panier : un cadeau débloqué se choisit ici (cadeau, puis son choix, ex. le parfum) ;
 * tant qu'une offre n'est pas débloquée, une ligne indique ce qu'il manque.
 */
export function OfferPanel() {
  const { offerProgress, closeCart } = useCart();
  if (offerProgress.length === 0) return null;

  return (
    <section className="mt-4 space-y-3" aria-labelledby="offers-cart-title">
      <h3 id="offers-cart-title" className="sr-only">
        Offres
      </h3>
      {offerProgress.map((p) =>
        p.remaining > 0 ? (
          <RewardPicker key={p.offer.id} progress={p} />
        ) : p.toUnlock > 0 ? (
          <Teaser key={p.offer.id} progress={p} onNavigate={closeCart} />
        ) : null,
      )}
    </section>
  );
}

function Teaser({ progress, onNavigate }: { progress: OfferProgress; onNavigate: () => void }) {
  const { offer, toUnlock } = progress;
  const categoryId = offer.triggerProductIds.map((id) => getProduct(id)?.categoryId).find(Boolean);
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-3 text-sm">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sand" aria-hidden="true">
        <Gift size={18} />
      </span>
      <p className="leading-snug">
        <strong>{offer.title}.</strong> Encore {toUnlock} {plural(toUnlock, "produit", "produits")} de l&apos;offre pour débloquer ton cadeau.{" "}
        {categoryId && (
          <CategoryLink id={categoryId} onNavigate={onNavigate} className="font-bold text-accent-text underline underline-offset-4">
            Voir les produits
          </CategoryLink>
        )}
      </p>
    </div>
  );
}

function RewardPicker({ progress }: { progress: OfferProgress }) {
  const { claimReward } = useCart();
  const { offer, remaining } = progress;
  const [altId, setAltId] = useState(offer.alternatives[0]?.id ?? "");
  const [choiceId, setChoiceId] = useState("");

  const alt = offer.alternatives.find((a) => a.id === altId) ?? offer.alternatives[0];
  if (!alt) return null;
  const needsChoice = alt.choices.length > 0;
  const canClaim = !needsChoice || alt.choices.some((c) => c.id === choiceId);

  return (
    <div className="rounded-2xl border-2 border-accent bg-white p-4">
      <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-accent-text">
        <Gift size={18} aria-hidden="true" />
        {remaining > 1 ? `${remaining} cadeaux débloqués` : "Cadeau débloqué"}
      </p>
      <p className="mt-1 font-bold leading-snug">{offer.title}</p>

      <fieldset className="mt-3">
        <legend className="sr-only">Choisis ton cadeau</legend>
        <div className="grid gap-2">
          {offer.alternatives.map((a) => (
            <label
              key={a.id}
              className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2 text-sm font-semibold has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-accent/50 ${
                alt.id === a.id ? "border-ink bg-cream" : "border-line bg-white"
              }`}
            >
              <input
                type="radio"
                name={`reward-${offer.id}`}
                className="sr-only"
                checked={alt.id === a.id}
                onChange={() => {
                  setAltId(a.id);
                  setChoiceId("");
                }}
              />
              <span className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${alt.id === a.id ? "border-ink bg-ink" : "border-line"}`} aria-hidden="true">
                {alt.id === a.id && <span className="size-2 rounded-full bg-cream" />}
              </span>
              {a.label}
            </label>
          ))}
        </div>
      </fieldset>

      {needsChoice && (
        <label className="mt-3 block text-sm font-bold">
          {alt.choiceLabel ?? "Ton choix"}
          <select className="field mt-1.5 min-h-12" value={choiceId} onChange={(e) => setChoiceId(e.target.value)}>
            <option value="">Choisir…</option>
            {alt.choices.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <button
        type="button"
        className="btn btn-accent mt-3 w-full"
        disabled={!canClaim}
        onClick={() => {
          claimReward({ offerId: offer.id, alternativeId: alt.id, ...(needsChoice ? { choiceId } : {}) });
          setChoiceId("");
        }}
      >
        <Gift size={18} aria-hidden="true" />
        Ajouter mon cadeau
      </button>
    </div>
  );
}
