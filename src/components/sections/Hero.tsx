import { ArrowRight, Banknote, Store } from "lucide-react";
import Link from "next/link";
import { activePayments, site } from "@/config/site";
import type { ProductArt } from "@/lib/types";
import { ArtSvg } from "../ProductArt";

const center: ProductArt = { kind: "cup", color: "#F3E3CF", color2: "#9B5B34", topping: "pearls", garnish: "none", bg: "" };
const left: ProductArt = { kind: "cup", color: "#B8D77A", color2: "#7FA83E", topping: "pearls", garnish: "none", bg: "" };
const right: ProductArt = { kind: "cup", color: "#FFC59A", color2: "#FF9A6B", topping: "jelly", garnish: "orange", bg: "" };

export function Hero() {
  const payment = activePayments()[0];
  return (
    <section className="relative isolate overflow-hidden bg-ink text-cream" aria-labelledby="hero-title">
      {/* Décor : deux grands disques de couleur, rien de plus. */}
      <div className="absolute -right-24 -top-24 -z-10 size-[28rem] rounded-full bg-ink-2" aria-hidden="true" />
      <div className="absolute -bottom-40 -left-32 -z-10 size-[26rem] rounded-full bg-ink-2/70" aria-hidden="true" />

      <div className="mx-auto grid max-w-7xl items-center gap-4 px-4 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-8 lg:py-16">
        <div className="animate-rise">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-cream/90">
            <span className="size-2 rounded-full bg-matcha" aria-hidden="true" />
            Bubble tea · Thés fruités · Snacks
          </p>
          <h1 id="hero-title" className="mt-5 text-[3.1rem] font-extrabold leading-[0.92] sm:text-7xl lg:text-[5.5rem]">
            Ton thé,
            <br />
            version <span className="text-accent">gourmande.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-cream/80">
            Compose ta boisson à ta façon : sucre, glace, garnitures. On la prépare, tu la savoures.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="#menu" className="btn btn-accent btn-lg">
              Commander maintenant
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <Link href="#categories" className="btn btn-ghost btn-lg text-cream">
              Découvrir le menu
            </Link>
          </div>

          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-cream/80">
            <li className="inline-flex items-center gap-2">
              <Store size={18} aria-hidden="true" />
              {site.ordering.pickup.enabled && site.ordering.delivery.enabled
                ? "À emporter ou livré"
                : site.ordering.delivery.enabled
                  ? "Livraison"
                  : "À emporter"}
            </li>
            {payment && (
              <li className="inline-flex items-center gap-2">
                <Banknote size={18} aria-hidden="true" />
                {payment.label}
              </li>
            )}
          </ul>
        </div>

        {/* Composition produits */}
        <div className="relative mx-auto mt-4 aspect-[6/5] w-full max-w-lg lg:mt-0 lg:max-w-none" aria-hidden="true">
          <div className="absolute inset-x-[22%] bottom-0 top-[2%] rounded-t-full bg-peach/95" />
          <div className="absolute bottom-0 left-[1%] aspect-[5/6] h-[60%]" style={{ ["--r" as string]: "-9deg" }}>
            <div className="h-full animate-float" style={{ animationDelay: "-2s" }}>
              <ArtSvg art={left} className="h-full w-auto drop-shadow-xl" />
            </div>
          </div>
          <div className="absolute bottom-0 right-[1%] aspect-[5/6] h-[56%]" style={{ ["--r" as string]: "8deg" }}>
            <div className="h-full animate-float" style={{ animationDelay: "-4s" }}>
              <ArtSvg art={right} className="h-full w-auto drop-shadow-xl" />
            </div>
          </div>
          <div className="absolute bottom-0 left-1/2 aspect-[5/6] h-[84%] -translate-x-1/2">
            <div className="h-full animate-float" style={{ ["--r" as string]: "0deg" }}>
              <ArtSvg art={center} className="h-full w-auto drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
