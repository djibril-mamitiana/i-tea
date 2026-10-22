import type { OrderMode } from "../lib/types.ts";

/**
 * ============================================================
 *  CONFIGURATION DU RESTAURANT — le seul fichier à éditer pour
 *  les infos pratiques (contact, horaires, livraison, paiement).
 *  Les produits et prix sont dans src/data/menu.ts
 * ============================================================
 */

export interface DayHours {
  /** 0 = dimanche … 6 = samedi */
  day: number;
  /** "HH:MM" — null = fermé */
  open: string | null;
  close: string | null;
}

export interface PaymentMethod {
  id: string;
  label: string;
  description: string;
  /** Visible par les clients. */
  enabled: boolean;
  /**
   * `true` uniquement si le paiement est réellement opérationnel
   * (le paiement à la réception n'a besoin d'aucune intégration).
   * Une méthode `enabled` mais non `integrated` est ignorée par le serveur.
   */
  integrated: boolean;
}

export const site = {
  name: "I Tea",
  /** Affiche le bandeau « menu de démonstration ». Passez à false au lancement. */
  demoMode: true,
  description:
    "I Tea : bubble tea, thés fruités, snacks et desserts. Compose ta boisson, commande en ligne en livraison ou à emporter.",
  /** URL publique du site (SEO, partages). Surchargée par NEXT_PUBLIC_SITE_URL. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "fr-FR",
  timezone: "Europe/Paris",

  /**
   * Devise. Tous les prix de src/data/menu.ts sont exprimés dans cette devise.
   * Exemples : { code: "EUR", symbol: "€", position: "suffix", decimals: 2 }
   *            { code: "MGA", symbol: "Ar", position: "suffix", decimals: 0 }
   */
  currency: { code: "EUR", symbol: "€", position: "suffix" as "prefix" | "suffix", decimals: 2 },

  /** Laissez `null` pour masquer une information tant qu'elle n'est pas fournie. */
  contact: {
    phone: null as string | null,
    whatsapp: null as string | null,
    email: null as string | null,
    address: null as string | null,
    mapUrl: null as string | null,
  },

  socials: {
    instagram: null as string | null,
    facebook: null as string | null,
    tiktok: null as string | null,
  },

  /** Horaires d'ouverture (de démonstration). */
  hours: [
    { day: 1, open: "10:00", close: "21:00" },
    { day: 2, open: "10:00", close: "21:00" },
    { day: 3, open: "10:00", close: "21:00" },
    { day: 4, open: "10:00", close: "21:00" },
    { day: 5, open: "10:00", close: "22:00" },
    { day: 6, open: "10:00", close: "22:00" },
    { day: 0, open: "12:00", close: "20:00" },
  ] as DayHours[],

  ordering: {
    pickup: {
      enabled: true,
      label: "À emporter",
      description: "Tu passes récupérer ta commande au restaurant.",
    },
    delivery: {
      enabled: true,
      label: "Livraison",
      description: "On t'apporte ta commande à l'adresse indiquée.",
      /** Frais de livraison fixes. */
      fee: 2.9,
      /** Livraison offerte à partir de ce sous-total (null = jamais). */
      freeFrom: 25 as number | null,
      /** Sous-total minimum pour la livraison (0 = aucun). */
      minOrder: 10,
      /** Texte libre : zones desservies. */
      zones: "Zones desservies à préciser par le restaurant.",
    },
    defaultMode: "pickup" as OrderMode,
    maxItemQty: 20,
    maxCartLines: 30,
  },

  /**
   * Moyens de paiement. Seul le paiement à la réception est opérationnel :
   * il ne nécessite aucune intégration. Les autres sont déclarés ici pour
   * être activés le jour où leur intégration existe (voir README).
   */
  payments: [
    {
      id: "cash",
      label: "Paiement à la réception",
      description: "Tu règles directement à la remise de ta commande.",
      enabled: true,
      integrated: true,
    },
    {
      id: "wallet",
      label: "Paiement mobile",
      description: "Apple Pay, Google Pay…",
      enabled: false,
      integrated: false,
    },
    {
      id: "card",
      label: "Carte bancaire",
      description: "Paiement sécurisé en ligne.",
      enabled: false,
      integrated: false,
    },
  ] as PaymentMethod[],
};

export type Site = typeof site;

/** Moyens de paiement réellement proposables aux clients. */
export function activePayments(): PaymentMethod[] {
  return site.payments.filter((p) => p.enabled && p.integrated);
}

/** Modes de réception activés. */
export function activeModes(): OrderMode[] {
  const modes: OrderMode[] = [];
  if (site.ordering.pickup.enabled) modes.push("pickup");
  if (site.ordering.delivery.enabled) modes.push("delivery");
  return modes;
}
