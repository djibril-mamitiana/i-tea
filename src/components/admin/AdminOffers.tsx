"use client";

import { CircleAlert, Gift, LoaderCircle, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { site } from "@/config/site";
import { categories, products } from "@/data/menu";
import { todayIso, type Offer, type OfferKind } from "@/lib/offers";
import type { OrderMode } from "@/lib/types";
import { Logo } from "../Logo";
import { AdminNav } from "./AdminNav";

/** Une offre en cours de saisie : textes et listes sous une forme simple à éditer. */
interface Draft {
  id: string | null;
  kind: OfferKind;
  title: string;
  description: string;
  active: boolean;
  startsAt: string;
  endsAt: string;
  modes: OrderMode[];
  triggerProductIds: string[];
  minQty: number;
  maxRewards: number;
  alternatives: { label: string; choiceLabel: string; choicesText: string; productId: string }[];
}

const emptyAlternative = () => ({ label: "", choiceLabel: "", choicesText: "", productId: "" });

const newDraft = (kind: OfferKind): Draft => ({
  id: null,
  kind,
  title: "",
  description: "",
  active: true,
  startsAt: "",
  endsAt: "",
  modes: ["pickup"],
  triggerProductIds: [],
  minQty: 1,
  maxRewards: 1,
  alternatives: kind === "free_item" ? [emptyAlternative()] : [],
});

const toDraft = (o: Offer): Draft => ({
  id: o.id,
  kind: o.kind,
  title: o.title,
  description: o.description,
  active: o.active,
  startsAt: o.startsAt ?? "",
  endsAt: o.endsAt ?? "",
  modes: o.modes,
  triggerProductIds: o.triggerProductIds,
  minQty: o.minQty,
  maxRewards: o.maxRewards,
  alternatives: o.alternatives.map((a) => ({
    label: a.label,
    choiceLabel: a.choiceLabel ?? "",
    choicesText: a.choices.map((c) => c.label).join("\n"),
    productId: a.productId ?? "",
  })),
});

const toBody = (d: Draft) => ({
  kind: d.kind,
  title: d.title,
  description: d.description,
  active: d.active,
  startsAt: d.startsAt || null,
  endsAt: d.endsAt || null,
  modes: d.modes,
  triggerProductIds: d.triggerProductIds,
  minQty: d.minQty,
  maxRewards: d.maxRewards,
  alternatives: d.alternatives.map((a) => ({
    label: a.label,
    choiceLabel: a.choiceLabel,
    choices: a.choicesText.split("\n").map((l) => l.trim()).filter(Boolean),
    productId: a.productId,
  })),
});

type Status = { label: string; tone: string };

function statusOf(o: Offer, now: Date): Status {
  const today = todayIso(now);
  if (!o.active) return { label: "Désactivée", tone: "bg-sand text-muted" };
  if (o.endsAt && today > o.endsAt) return { label: "Terminée", tone: "bg-sand text-muted" };
  if (o.startsAt && today < o.startsAt) return { label: "À venir", tone: "bg-lemon text-ink" };
  return { label: "En ligne", tone: "bg-matcha text-ink" };
}

const modeLabel = (m: OrderMode) => (m === "pickup" ? site.ordering.pickup.label : site.ordering.delivery.label);

export function AdminOffers() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [now] = useState(() => new Date());

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/offers", { cache: "no-store" });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      const json = await res.json().catch(() => null);
      if (!res.ok || !json) throw new Error(json?.error ?? "Chargement impossible.");
      setOffers(json.offers);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    }
  }, [router]);

  useEffect(() => {
    const first = setTimeout(() => void load(), 0);
    return () => clearTimeout(first);
  }, [load]);

  async function call(url: string, init: RequestInit): Promise<{ ok: boolean; json: { error?: string } | null }> {
    const res = await fetch(url, { ...init, headers: { "content-type": "application/json" } });
    if (res.status === 401) {
      router.refresh();
      return { ok: false, json: { error: "Session expirée. Reconnecte-toi." } };
    }
    return { ok: res.ok, json: await res.json().catch(() => null) };
  }

  async function save() {
    if (!draft || saving) return;
    setSaving(true);
    setFormError(null);
    const { ok, json } = await call(draft.id ? `/api/admin/offers/${draft.id}` : "/api/admin/offers", {
      method: draft.id ? "PUT" : "POST",
      body: JSON.stringify(toBody(draft)),
    });
    setSaving(false);
    if (!ok) {
      setFormError(json?.error ?? "Enregistrement impossible.");
      return;
    }
    setDraft(null);
    await load();
  }

  async function toggle(o: Offer) {
    setBusy(o.id);
    setError(null);
    const { ok, json } = await call(`/api/admin/offers/${o.id}`, { method: "PATCH", body: JSON.stringify({ active: !o.active }) });
    setBusy(null);
    if (!ok) setError(json?.error ?? "Mise à jour impossible.");
    else await load();
  }

  async function remove(o: Offer) {
    if (!window.confirm(`Supprimer l'offre « ${o.title} » ? Cette action est définitive.`)) return;
    setBusy(o.id);
    setError(null);
    const { ok, json } = await call(`/api/admin/offers/${o.id}`, { method: "DELETE" });
    setBusy(null);
    if (!ok) setError(json?.error ?? "Suppression impossible.");
    else await load();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3 py-5">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase tracking-wider text-cream">Admin</span>
        </div>
        <button type="button" className="btn min-h-11 bg-ink px-4 text-sm text-cream hover:bg-ink-2" onClick={logout}>
          <LogOut size={18} aria-hidden="true" />
          Déconnexion
        </button>
      </header>

      <AdminNav />
      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold sm:text-4xl">Offres {site.name}</h1>
          <p className="mt-1 max-w-2xl text-muted">
            Les offres en ligne s&apos;affichent sur le site. Une offre « produit offert » s&apos;applique aussi dans le panier : le client choisit son cadeau,
            et le serveur vérifie chaque commande.
          </p>
        </div>
        {!draft && (
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-accent min-h-12" onClick={() => setDraft(newDraft("free_item"))}>
              <Plus size={18} aria-hidden="true" />
              Nouvelle offre produit offert
            </button>
            <button type="button" className="btn min-h-12 bg-white text-ink shadow-sm hover:bg-cream" onClick={() => setDraft(newDraft("info"))}>
              <Plus size={18} aria-hidden="true" />
              Nouvelle annonce
            </button>
          </div>
        )}
      </div>

      {error && (
        <div role="alert" className="mt-4 flex items-start gap-2 rounded-2xl border-2 border-danger/30 bg-danger/5 p-4 font-semibold text-danger">
          <CircleAlert size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {draft && (
        <OfferForm draft={draft} setDraft={setDraft} onSave={save} onCancel={() => { setDraft(null); setFormError(null); }} saving={saving} error={formError} />
      )}

      <section className="mt-6" aria-busy={!offers}>
        {!offers && !error && <p className="py-16 text-center text-muted">Chargement des offres…</p>}
        {offers && offers.length === 0 && (
          <p className="rounded-card bg-white px-6 py-16 text-center text-lg text-muted shadow-card">Aucune offre pour le moment.</p>
        )}
        {offers && offers.length > 0 && (
          <ul className="grid gap-4">
            {offers.map((o) => {
              const status = statusOf(o, now);
              return (
                <li key={o.id} className="rounded-card bg-white p-5 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${status.tone}`}>{status.label}</span>
                        <span className="rounded-full bg-sand px-3 py-1 text-xs font-bold text-muted">
                          {o.kind === "free_item" ? "Produit offert" : "Annonce"}
                        </span>
                      </p>
                      <h2 className="mt-2 font-display text-xl font-extrabold leading-tight">{o.title}</h2>
                      {o.description && <p className="mt-1 whitespace-pre-line text-muted">{o.description}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="btn min-h-11 bg-sand px-4 text-sm text-ink hover:bg-line" disabled={busy === o.id} onClick={() => void toggle(o)}>
                        {o.active ? "Désactiver" : "Activer"}
                      </button>
                      <button type="button" className="btn min-h-11 bg-sand px-4 text-sm text-ink hover:bg-line" onClick={() => { setDraft(toDraft(o)); setFormError(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                        <Pencil size={16} aria-hidden="true" />
                        Modifier
                      </button>
                      <button type="button" className="btn min-h-11 bg-sand px-4 text-sm text-danger hover:bg-line" disabled={busy === o.id} onClick={() => void remove(o)}>
                        <Trash2 size={16} aria-hidden="true" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                  <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                    {(o.startsAt || o.endsAt) && (
                      <div className="flex gap-2">
                        <dt className="text-muted">Période :</dt>
                        <dd className="font-semibold">{o.startsAt ?? "…"} → {o.endsAt ?? "…"}</dd>
                      </div>
                    )}
                    {o.kind === "free_item" && (
                      <>
                        <div className="flex gap-2">
                          <dt className="text-muted">Commandes en ligne :</dt>
                          <dd className="font-semibold">{o.modes.map(modeLabel).join(", ")}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="text-muted">Déclenchée par :</dt>
                          <dd className="font-semibold">{o.triggerProductIds.length} produits · {o.minQty} acheté{o.minQty > 1 ? "s" : ""} = 1 cadeau (max {o.maxRewards})</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="text-muted">Cadeaux au choix :</dt>
                          <dd className="font-semibold">{o.alternatives.map((a) => a.label).join(" · ")}</dd>
                        </div>
                      </>
                    )}
                  </dl>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ---------- Formulaire ---------- */

function OfferForm({
  draft,
  setDraft,
  onSave,
  onCancel,
  saving,
  error,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}) {
  const free = draft.kind === "free_item";
  const patch = (changes: Partial<Draft>) => setDraft({ ...draft, ...changes });
  const toggleMode = (m: OrderMode) =>
    patch({ modes: draft.modes.includes(m) ? draft.modes.filter((x) => x !== m) : [...draft.modes, m] });

  const grouped = useMemo(
    () => categories.map((c) => ({ category: c, items: products.filter((p) => p.categoryId === c.id) })).filter((g) => g.items.length > 0),
    [],
  );
  const toggleProducts = (ids: string[], on: boolean) =>
    patch({
      triggerProductIds: on
        ? [...new Set([...draft.triggerProductIds, ...ids])]
        : draft.triggerProductIds.filter((id) => !ids.includes(id)),
    });
  const setAlt = (i: number, changes: Partial<Draft["alternatives"][number]>) =>
    patch({ alternatives: draft.alternatives.map((a, n) => (n === i ? { ...a, ...changes } : a)) });

  return (
    <form
      className="mt-6 space-y-6 rounded-card bg-white p-5 shadow-card sm:p-7"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
      aria-labelledby="offer-form-title"
    >
      <h2 id="offer-form-title" className="flex items-center gap-2 font-display text-2xl font-extrabold">
        <Gift size={24} aria-hidden="true" />
        {draft.id ? "Modifier l'offre" : free ? "Nouvelle offre produit offert" : "Nouvelle annonce"}
      </h2>

      <div className="grid gap-4">
        <label className="block font-bold">
          Titre
          <input
            className="field mt-1.5 font-normal"
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value })}
            maxLength={120}
            placeholder={free ? "1 café acheté = 1 dessert offert" : "Fermé le 25 décembre"}
            required
          />
        </label>
        <label className="block font-bold">
          Description <span className="font-normal text-muted">(facultatif)</span>
          <textarea
            className="field mt-1.5 min-h-24 font-normal"
            value={draft.description}
            onChange={(e) => patch({ description: e.target.value })}
            maxLength={600}
            placeholder={free ? "À emporter. Les conditions de l'offre sont celles du restaurant." : ""}
          />
        </label>
      </div>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-bold">Période (facultatif)</legend>
        <label className="block text-sm font-bold">
          Début
          <input type="date" className="field mt-1.5 font-normal" value={draft.startsAt} onChange={(e) => patch({ startsAt: e.target.value })} />
        </label>
        <label className="block text-sm font-bold">
          Fin (incluse)
          <input type="date" className="field mt-1.5 font-normal" value={draft.endsAt} onChange={(e) => patch({ endsAt: e.target.value })} />
        </label>
      </fieldset>

      {free && (
        <>
          <fieldset>
            <legend className="mb-2 font-bold">S&apos;applique aux commandes en ligne</legend>
            <div className="flex flex-wrap gap-3">
              {(["pickup", "delivery"] as OrderMode[]).map((m) => (
                <label key={m} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border-2 border-line px-4 font-semibold has-[:checked]:border-ink">
                  <input type="checkbox" className="size-5 accent-[var(--color-ink)]" checked={draft.modes.includes(m)} onChange={() => toggleMode(m)} />
                  {modeLabel(m)}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-1 font-bold">Produits qui déclenchent l&apos;offre</legend>
            <p className="mb-2 text-sm text-muted">{draft.triggerProductIds.length} produit{draft.triggerProductIds.length > 1 ? "s" : ""} sélectionné{draft.triggerProductIds.length > 1 ? "s" : ""}.</p>
            <div className="max-h-80 space-y-4 overflow-y-auto rounded-xl border-2 border-line p-3">
              {grouped.map(({ category, items }) => {
                const ids = items.map((p) => p.id);
                const all = ids.every((id) => draft.triggerProductIds.includes(id));
                return (
                  <div key={category.id}>
                    <label className="flex min-h-9 cursor-pointer items-center gap-2 font-extrabold">
                      <input type="checkbox" className="size-5 accent-[var(--color-ink)]" checked={all} onChange={(e) => toggleProducts(ids, e.target.checked)} />
                      {category.name}
                    </label>
                    <div className="ml-7 grid gap-x-4 sm:grid-cols-2">
                      {items.map((p) => (
                        <label key={p.id} className="flex min-h-9 cursor-pointer items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            className="size-4 accent-[var(--color-ink)]"
                            checked={draft.triggerProductIds.includes(p.id)}
                            onChange={(e) => toggleProducts([p.id], e.target.checked)}
                          />
                          {p.name}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block font-bold">
              Produits à acheter pour 1 cadeau
              <input type="number" min={1} max={20} className="field mt-1.5 font-normal" value={draft.minQty} onChange={(e) => patch({ minQty: Number(e.target.value) })} />
            </label>
            <label className="block font-bold">
              Cadeaux maximum par commande
              <input type="number" min={1} max={10} className="field mt-1.5 font-normal" value={draft.maxRewards} onChange={(e) => patch({ maxRewards: Number(e.target.value) })} />
            </label>
          </div>

          <fieldset>
            <legend className="mb-1 font-bold">Cadeaux au choix</legend>
            <p className="mb-3 text-sm text-muted">Le client choisit l&apos;un d&apos;eux. Chaque cadeau est gratuit ; vous pouvez lui demander un choix (par exemple le parfum).</p>
            <div className="space-y-4">
              {draft.alternatives.map((a, i) => (
                <div key={i} className="space-y-3 rounded-xl border-2 border-line p-4">
                  <div className="flex items-start gap-3">
                    <label className="block flex-1 text-sm font-bold">
                      Nom du cadeau
                      <input className="field mt-1.5 font-normal" value={a.label} onChange={(e) => setAlt(i, { label: e.target.value })} maxLength={80} placeholder="1 bubble waffle" />
                    </label>
                    {draft.alternatives.length > 1 && (
                      <button
                        type="button"
                        className="mt-7 grid size-11 shrink-0 place-items-center rounded-full bg-sand text-danger hover:bg-line"
                        onClick={() => patch({ alternatives: draft.alternatives.filter((_, n) => n !== i) })}
                        aria-label={`Retirer le cadeau ${a.label || i + 1}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  <label className="block text-sm font-bold">
                    Intitulé du choix <span className="font-normal text-muted">(facultatif)</span>
                    <input className="field mt-1.5 font-normal" value={a.choiceLabel} onChange={(e) => setAlt(i, { choiceLabel: e.target.value })} maxLength={40} placeholder="Parfum" />
                  </label>
                  <label className="block text-sm font-bold">
                    Choix proposés <span className="font-normal text-muted">(un par ligne)</span>
                    <textarea className="field mt-1.5 min-h-24 font-normal" value={a.choicesText} onChange={(e) => setAlt(i, { choicesText: e.target.value })} placeholder={"Nutella\nVanille\nChocolat"} />
                  </label>
                  <label className="block text-sm font-bold">
                    Photo du produit de la carte <span className="font-normal text-muted">(facultatif)</span>
                    <select className="field mt-1.5 font-normal" value={a.productId} onChange={(e) => setAlt(i, { productId: e.target.value })}>
                      <option value="">Aucune</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ))}
            </div>
            {draft.alternatives.length < 6 && (
              <button type="button" className="btn mt-3 min-h-11 bg-sand text-sm text-ink hover:bg-line" onClick={() => patch({ alternatives: [...draft.alternatives, emptyAlternative()] })}>
                <Plus size={16} aria-hidden="true" />
                Ajouter un cadeau au choix
              </button>
            )}
          </fieldset>
        </>
      )}

      <label className="flex min-h-11 cursor-pointer items-center gap-3 font-bold">
        <input type="checkbox" className="size-5 accent-[var(--color-ink)]" checked={draft.active} onChange={(e) => patch({ active: e.target.checked })} />
        Offre active (visible sur le site{free ? " et applicable dans le panier" : ""})
      </label>

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border-2 border-danger/30 bg-danger/5 p-3 font-semibold text-danger">
          <CircleAlert size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn btn-accent min-h-12" disabled={saving}>
          {saving && <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />}
          Enregistrer
        </button>
        <button type="button" className="btn min-h-12 bg-sand text-ink hover:bg-line" onClick={onCancel}>
          Annuler
        </button>
      </div>
    </form>
  );
}
