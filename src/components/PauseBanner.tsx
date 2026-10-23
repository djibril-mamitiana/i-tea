"use client";

import { PauseCircle } from "lucide-react";
import { PAUSE_DEFAULT_TEXT } from "@/lib/shop";
import { useShop } from "./shop/ShopProvider";

/** Bandeau affiché pendant la pause des commandes en ligne (décidée par l'équipe dans l'admin). */
export function PauseBanner() {
  const { ordering } = useShop();
  if (!ordering.paused) return null;
  return (
    <div role="status" className="bg-ink px-4 py-2.5 text-center text-sm font-semibold text-cream">
      <PauseCircle size={16} className="mr-2 inline-block align-[-3px]" aria-hidden="true" />
      {ordering.message || PAUSE_DEFAULT_TEXT}
    </div>
  );
}
