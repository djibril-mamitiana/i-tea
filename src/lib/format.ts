import { site } from "../config/site.ts";

const { currency, locale } = site;

const numberFormat = new Intl.NumberFormat(locale, {
  minimumFractionDigits: currency.decimals,
  maximumFractionDigits: currency.decimals,
});

/** Espaces insécables : « 12,50 € » ne se coupe jamais en fin de ligne. */
const NARROW_NBSP = " "; // séparateur de milliers
const NBSP = " "; // entre le montant et la devise

export function formatPrice(amount: number): string {
  const n = numberFormat.format(amount).replace(/ /g, NARROW_NBSP);
  return currency.position === "prefix" ? `${currency.symbol}${NBSP}${n}` : `${n}${NBSP}${currency.symbol}`;
}

/** « +0,50 € » pour un supplément, « Inclus » si gratuit. */
export function formatSupplement(amount: number): string {
  return amount > 0 ? `+${formatPrice(amount)}` : "Inclus";
}

export function plural(n: number, one: string, many: string): string {
  return n > 1 ? many : one;
}
