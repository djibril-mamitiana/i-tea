import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { activePayments, site } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { hasStory } from "@/lib/nav";
import { Photo } from "../Photo";

/**
 * Première impression : la photographie occupe la place principale.
 * Avec `site.media.hero`, elle est plein cadre sous un dégradé vert ; sans photo, un grand emplacement
 * clairement identifié occupe la moitié droite. Titre court, une présentation, un appel à l'action.
 */
export function Hero() {
  const [lead, ...rest] = site.tagline.split(",");
  const emphasis = rest.join(",").trim();
  const { pickup, delivery } = site.ordering;
  const payment = activePayments()[0];

  const facts = [
    "Commande en ligne",
    pickup.enabled && delivery.enabled ? `${pickup.label} ou ${delivery.label.toLowerCase()}` : delivery.enabled ? delivery.label : pickup.label,
    delivery.enabled && delivery.freeFrom !== null ? `Livraison offerte dès ${formatPrice(delivery.freeFrom)}` : null,
    payment?.label ?? null,
  ].filter(Boolean) as string[];

  const fullBleed = Boolean(site.media.hero);

  return (
    <section className="on-dark relative isolate overflow-hidden bg-green text-cream" aria-labelledby="hero-title">
      {fullBleed ? (
        <>
          <Photo src={site.media.hero} alt="Plats et boissons de I TEA" priority sizes="100vw" className="absolute inset-0 -z-20" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-green via-green/80 to-green/10 max-lg:to-green/50" aria-hidden="true" />
        </>
      ) : (
        <Photo
          alt="Plat signature de I TEA"
          label="Plat signature en gros plan, lumière naturelle, format paysage 16:9"
          onDark
          className="absolute inset-y-0 right-0 -z-10 hidden w-[56%] lg:block"
        />
      )}

      <div className="mx-auto grid max-w-7xl px-4 sm:px-6 lg:min-h-[38rem] lg:grid-cols-2 lg:px-8">
        <div className="flex flex-col justify-center py-14 sm:py-20 lg:py-28 lg:pr-10">
          <p className="eyebrow">{site.descriptor}</p>
          <h1 id="hero-title" className="display-xl mt-5 max-w-2xl">
            {lead}
            {emphasis && (
              <>
                , <span className="display-em text-gold">{emphasis}</span>
              </>
            )}
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-cream/85">
            {site.name} réunit la cuisine vietnamienne, la culture du thé et les desserts. Découvrez la carte et
            commandez en ligne.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Link href="#carte" className="btn btn-accent btn-lg">
              Découvrir la carte
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
            {hasStory() && (
              <Link href="#histoire" className="inline-flex min-h-12 items-center font-semibold underline decoration-gold decoration-2 underline-offset-[10px] hover:text-gold">
                Notre histoire
              </Link>
            )}
          </div>
        </div>

        {/* Mobile, sans photo : l'emplacement passe sous le texte */}
        {!fullBleed && (
          <Photo
            alt="Plat signature de I TEA"
            label="Plat signature en gros plan, lumière naturelle, format paysage 16:9"
            onDark
            className="-mx-4 mb-0 aspect-[4/3] sm:-mx-6 lg:hidden"
          />
        )}
      </div>

      <div className="border-t border-cream/15">
        <ul className="mx-auto flex max-w-7xl flex-col gap-1.5 px-4 py-4 text-sm text-cream/80 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-1 sm:px-6 lg:gap-x-0 lg:px-8">
          {facts.map((f, i) => (
            <li key={f} className="inline-flex items-center">
              {i > 0 && <span className="mx-5 hidden h-3 w-px bg-cream/30 lg:block" aria-hidden="true" />}
              {f}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
