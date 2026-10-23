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

export interface Review {
  author: string;
  text: string;
  /** Note de 1 à 5, si la plateforme d'origine en fournit une. */
  rating?: 1 | 2 | 3 | 4 | 5;
  /** Origine de l'avis (ex. « Google »). */
  source?: string;
  /** Date lisible (ex. « Octobre 2026 »). */
  date?: string;
}

export interface Story {
  /** Titre de la section (ex. « Notre histoire »). */
  title: string | null;
  /** Paragraphes validés par la restauratrice. Rien n'est inventé : vide = section remplacée par un emplacement. */
  paragraphs: string[];
  /** Signature (ex. « Prénom, fondatrice »), uniquement si elle est réelle. */
  signature: string | null;
}

export const site = {
  /** Nom exact de la marque : toujours I TEA, en capitales. */
  name: "I TEA",
  /** Ligne descriptive affichée sous le logo et dans le héros. */
  descriptor: "Cuisine vietnamienne · Thés · Desserts",
  /** Accroche du héros, à faire valider par la restauratrice (alternatives dans le README). */
  tagline: "Cuisine vietnamienne, thés et douceurs.",
  /** Affiche le bandeau « menu de démonstration ». Passez à false au lancement. */
  demoMode: true,
  description:
    "I TEA réunit cuisine vietnamienne, thés et desserts. Découvrez la carte et commandez en ligne, à emporter ou en livraison.",
  /** URL publique du site (SEO, partages). Surchargée par NEXT_PUBLIC_SITE_URL. */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    // Sur Vercel, l'adresse de production est fournie automatiquement.
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
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

  /**
   * Photographies de l'accueil. `null` = emplacement « photo à venir » clairement identifié.
   * Placez vos fichiers dans /public/media puis indiquez leur chemin (ex. "/media/hero.jpg").
   * La liste complète des photos attendues (format, cadrage) est dans PHOTOS_A_FOURNIR.md.
   */
  media: {
    /** Plein cadre, paysage, 2000 px de large minimum. */
    hero: null as string | null,
    /** Section « La cuisine vietnamienne », paysage ou portrait. */
    cuisine: null as string | null,
    /** Section « Le thé et les boissons ». */
    boissons: null as string | null,
    /** Section « Les desserts ». */
    desserts: null as string | null,
    /** Portrait de la restauratrice (section « Notre histoire »). */
    histoire: null as string | null,
  },

  /** Titres et introductions des sections de l'accueil (textes neutres, à adapter par I TEA). */
  sections: {
    selection: { eyebrow: "À découvrir", title: "Notre sélection" },
    cuisine: {
      title: "La cuisine vietnamienne",
      intro: "Les plats de la carte I TEA, à commander en ligne pour les emporter ou pour être livré.",
    },
    boissons: {
      title: "Le thé et les boissons",
      intro: "Les thés et les boissons de la carte, à personnaliser selon vos goûts lorsque l'option existe.",
    },
    desserts: {
      title: "Les desserts",
      intro: "Les desserts de la carte, pour terminer le repas sur une note sucrée.",
    },
  },

  /** Texte de la section « Notre histoire » : uniquement des faits fournis et validés par I TEA. */
  story: {
    title: null,
    paragraphs: [],
    signature: null,
  } as Story,

  /**
   * Avis clients : uniquement de VRAIS avis, copiés tels quels avec leur source.
   * Tant que la liste est vide, la section n'est pas affichée en production
   * (en mode démo, un emplacement explicite la remplace).
   */
  reviews: {
    items: [] as Review[],
    /** Lien « Voir tous les avis » (page Google, etc.). */
    seeMoreUrl: null as string | null,
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
      description: "Vous récupérez votre commande au restaurant.",
    },
    delivery: {
      enabled: true,
      label: "Livraison",
      description: "Nous vous livrons à l'adresse indiquée.",
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
      description: "Vous réglez directement à la remise de votre commande.",
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
