import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { LeafPair, Sakura } from "../art/Brand";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "./SectionHeading";

const STEPS = [
  { title: "Choisis ton plat ou ta boisson", text: "Entrées, plats, bubble teas, matcha, cafés ou gourmandises : tout commence par une envie." },
  { title: "Personnalise", text: "Taille, toppings, crèmes, garniture : quand la carte propose un choix, tu le fais ici." },
  { title: "Complète ta commande", text: "Une entrée, un dessert ou une boisson en plus, en un tap." },
  { title: "Récupère ou fais-toi livrer", text: "À emporter au restaurant, ou livrée selon les zones desservies." },
];

/** Section éditoriale : le logo d'I Tea dans une arche + texte court. Seuls des faits écrits sur la carte sont avancés. */
export function BrandSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-28" aria-labelledby="brand-title">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
        <Reveal className="relative mx-auto w-full max-w-md lg:max-w-none">
          {site.media.brand ? (
            <>
              {/* Fin contour vert décalé : l'écho du cercle vert qui entoure le logo */}
              <div className="absolute -inset-3 rounded-t-[999px] rounded-b-[2.9rem] border-2 border-leaf/30" aria-hidden="true" />
              <div className="relative aspect-[6/7] overflow-hidden rounded-t-[999px] rounded-b-[2.5rem] shadow-pop ring-4 ring-gold/70">
                <Image src={site.media.brand} alt="La salle d'I Tea" fill sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover" />
              </div>
              <Image
                src={site.logo}
                alt={`Logo ${site.name}`}
                width={240}
                height={240}
                className="absolute -bottom-4 -left-2 size-28 rounded-full shadow-pop ring-4 ring-cream outline outline-2 outline-offset-4 outline-gold sm:-left-4 sm:size-32"
              />
              <Sakura size={36} rotate={-12} className="pointer-events-none absolute -bottom-9 left-1 z-10 sm:left-0" />
              <Sakura size={44} rotate={24} className="pointer-events-none absolute -bottom-11 left-16 z-10 sm:left-20" />
              <Sakura size={30} rotate={8} className="pointer-events-none absolute -bottom-7 left-32 z-10 sm:left-40" />
              <LeafPair className="pointer-events-none absolute -right-5 top-10 hidden h-24 text-leaf sm:block" />
            </>
          ) : (
            <div className="relative aspect-[6/7] overflow-hidden rounded-t-[999px] rounded-b-[2.5rem] bg-pink-soft">
              <div className="absolute -left-10 top-1/3 size-48 rounded-full bg-matcha-soft" aria-hidden="true" />
              <div className="absolute -right-12 bottom-8 size-56 rounded-full bg-caramel-soft" aria-hidden="true" />
              <Image
                src={site.logo}
                alt={`Logo ${site.name}`}
                width={640}
                height={640}
                sizes="(min-width: 1024px) 30vw, 80vw"
                className="absolute left-1/2 top-[56%] w-[84%] -translate-x-1/2 -translate-y-1/2 rounded-full shadow-pop"
              />
            </div>
          )}
          <p className="absolute -right-2 bottom-8 hidden max-w-[11rem] -rotate-3 rounded-2xl bg-cream px-4 py-3 text-sm font-bold leading-snug shadow-pop sm:block lg:-right-8">
            {site.highlights.homemade}
          </p>
        </Reveal>

        <div>
          <Reveal>
            <SectionHeading
              id="brand-title"
              eyebrow="L'univers I Tea"
              title={<>Faits maison, <span className="display-em text-orange">avec des produits frais.</span></>}
            >
              La carte d&apos;I Tea réunit de la cuisine vietnamienne, des bubble teas, du matcha, des cafés et des
              gourmandises. {site.highlights.halal}.
            </SectionHeading>
          </Reveal>

          <ol className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <Reveal delay={i * 70}>
                  <span className="font-display text-4xl font-bold text-accent/80" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-1 text-xl font-bold leading-tight">{s.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted">{s.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>

          <Reveal className="mt-10">
            <Link href="#menu" className="btn btn-ink btn-lg">
              Voir toute la carte
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
