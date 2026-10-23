import { ArrowRight, BadgeCheck, Bike, Leaf } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { HeroScene } from "../art/Scenes";

/** Collage de trois vraies photos : une grande arche, une arche haute et un médaillon, avec le logo en repère. */
function HeroCollage({ photos }: { photos: { src: string; alt: string }[] }) {
  const [a, b, c] = photos;
  return (
    <div className="relative mx-auto aspect-[6/5] w-full max-w-2xl lg:max-w-none">
      <div className="absolute bottom-[5%] left-0 top-[3%] w-[52%] overflow-hidden rounded-t-[999px] rounded-b-[2rem] shadow-pop">
        <Image src={a.src} alt={a.alt} fill priority sizes="(min-width: 1024px) 28vw, 52vw" className="object-cover" />
      </div>
      <div className="absolute right-0 top-0 aspect-[4/5] w-[42%] overflow-hidden rounded-t-[999px] rounded-b-[1.5rem] shadow-pop">
        <Image src={b.src} alt={b.alt} fill priority sizes="(min-width: 1024px) 24vw, 42vw" className="object-cover" />
      </div>
      <div className="absolute bottom-[3%] right-[7%] aspect-square w-[33%] overflow-hidden rounded-full shadow-pop ring-4 ring-cream">
        <Image src={c.src} alt={c.alt} fill sizes="(min-width: 1024px) 18vw, 33vw" className="object-cover" />
      </div>
      <Image
        src={site.logo}
        alt=""
        width={200}
        height={200}
        aria-hidden="true"
        className="absolute bottom-0 left-[38%] size-20 rounded-full shadow-pop ring-4 ring-cream sm:size-28"
      />
    </div>
  );
}

/** Première impression : titre éditorial à gauche, grande composition à droite qui déborde du cadre. */
export function Hero() {
  const { pickup, delivery } = site.ordering;
  const serviceLabel =
    pickup.enabled && delivery.enabled ? "À emporter ou livré" : delivery.enabled ? "Livraison" : "À emporter";

  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      {/* grand disque de fond, décalé : il donne de la profondeur sans charger la page */}
      <div className="absolute -right-32 -top-24 -z-10 size-[26rem] rounded-full bg-caramel-soft/70 lg:-right-40 lg:-top-40 lg:size-[44rem]" aria-hidden="true" />

      <div className="mx-auto grid max-w-7xl items-center gap-2 px-4 pb-10 pt-6 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-6 lg:px-8 lg:pb-20 lg:pt-8">
        <div className="animate-rise">
          <p className="eyebrow flex items-center gap-2">
            <span className="h-px w-8 shrink-0 bg-accent" aria-hidden="true" />
            {site.descriptor}
          </p>
          <h1 id="hero-title" className="display-xl mt-5">
            Ton plat.
            <br />
            Ton thé.
            <br />
            <span className="display-em text-accent-text">Ton moment.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            Cuisine vietnamienne, bubble teas, matcha, cafés et gourmandises, faits maison avec des produits frais.
            Commande en ligne : à emporter ou livrée.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="#menu" className="btn btn-accent btn-lg">
              Commander maintenant
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <Link href="#categories" className="btn btn-ghost btn-lg">
              Découvrir la carte
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-ink/80">
            <li className="inline-flex items-center gap-2">
              <BadgeCheck size={18} className="text-accent-text" aria-hidden="true" />
              {site.highlights.halal}
            </li>
            <li className="inline-flex items-center gap-2">
              <Leaf size={18} className="text-accent-text" aria-hidden="true" />
              {site.highlights.homemade}
            </li>
            <li className="inline-flex items-center gap-2">
              <Bike size={18} className="text-accent-text" aria-hidden="true" />
              {serviceLabel}
            </li>
          </ul>
        </div>

        {/* Visuel : la photo fournie dans site.media.hero, sinon l'illustration de démonstration */}
        <div className="relative mx-auto w-full max-w-2xl lg:max-w-none lg:-mr-4">
          {site.media.hero ? (
            <div className="relative aspect-[6/5] overflow-hidden rounded-t-[999px] rounded-b-[2.5rem] shadow-pop">
              <Image src={site.media.hero} alt="Plats et boissons I Tea" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
            </div>
          ) : site.media.heroPhotos.length >= 3 ? (
            <HeroCollage photos={site.media.heroPhotos} />
          ) : (
            <HeroScene className="h-auto w-full" />
          )}
        </div>
      </div>
    </section>
  );
}
