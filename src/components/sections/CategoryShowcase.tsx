import { ArrowRight } from "lucide-react";
import { getCategory, productsByCategory } from "@/data/menu";
import { formatPrice } from "@/lib/format";
import { CategoryLink } from "../CategoryLink";
import { Photo } from "../Photo";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "./SectionHeading";

type Tone = "cream" | "sand" | "green";
const TONES: Record<Tone, string> = {
  cream: "bg-cream",
  sand: "bg-sand",
  green: "on-dark bg-green text-cream",
};

/**
 * Section éditoriale d'une catégorie : grande photo, texte neutre et aperçu des plats réellement au menu.
 * La mise en page alterne (photo à gauche / à droite) pour donner du rythme.
 */
export function CategoryShowcase({
  categoryId,
  media,
  tone,
  reverse = false,
  copy,
  photoLabel,
}: {
  categoryId: string;
  media: string | null;
  tone: Tone;
  reverse?: boolean;
  copy: { title: string; intro: string };
  photoLabel: string;
}) {
  const category = getCategory(categoryId);
  const items = productsByCategory(categoryId).filter((p) => p.available).slice(0, 5);
  if (!category || items.length === 0) return null;
  const dark = tone === "green";

  return (
    <section id={`rayon-${categoryId}`} className={TONES[tone]} aria-labelledby={`showcase-${categoryId}`}>
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-24">
        <Reveal className={reverse ? "lg:order-2" : ""}>
          <Photo
            src={media}
            alt={copy.title}
            label={photoLabel}
            onDark={dark}
            className="aspect-[4/3] w-full rounded-lg lg:aspect-[5/4]"
          />
        </Reveal>

        <div className={reverse ? "lg:order-1" : ""}>
          <Reveal>
            <SectionHeading id={`showcase-${categoryId}`} eyebrow={category.name} title={copy.title}>
              {copy.intro}
            </SectionHeading>
          </Reveal>

          <Reveal delay={80}>
            <ul className={`mt-8 divide-y ${dark ? "divide-cream/20 border-y border-cream/20" : "divide-line border-y border-line"}`}>
              {items.map((p) => (
                <li key={p.id} className="flex items-baseline justify-between gap-6 py-4">
                  <div className="min-w-0">
                    <p className="font-display text-xl font-medium leading-snug">{p.name}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm opacity-75">{p.description}</p>
                  </div>
                  <p className="shrink-0 font-display text-lg">{formatPrice(p.price)}</p>
                </li>
              ))}
            </ul>
            <CategoryLink
              id={categoryId}
              className={`mt-7 inline-flex min-h-12 items-center gap-2 font-semibold underline decoration-2 underline-offset-[10px] ${
                dark ? "decoration-gold hover:text-gold" : "decoration-accent hover:text-accent"
              }`}
            >
              Voir et commander
              <ArrowRight size={18} aria-hidden="true" />
            </CategoryLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
