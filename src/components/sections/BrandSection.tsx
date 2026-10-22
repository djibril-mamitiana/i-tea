import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { BrandScene } from "../art/Scenes";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "./SectionHeading";

const STEPS = [
  { title: "Choisis ta boisson", text: "Bubble tea, thé fruité ou boisson fraîche : tout commence par une envie." },
  { title: "Compose-la", text: "Taille, niveau de sucre, glace et toppings : tu règles chaque détail." },
  { title: "Ajoute une gourmandise", text: "Un snack, un dessert, ou une formule pour tout prendre en une fois." },
  { title: "Récupère ou fais-toi livrer", text: "À emporter au restaurant, ou livrée selon les zones desservies." },
];

/** Section éditoriale : grande composition asymétrique + texte court. Aucune promesse de qualité inventée. */
export function BrandSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-28" aria-labelledby="brand-title">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
        <Reveal className="relative mx-auto w-full max-w-md lg:max-w-none">
          {site.media.brand ? (
            <div className="relative aspect-[6/7] overflow-hidden rounded-t-[999px] rounded-b-[2.5rem] shadow-pop">
              <Image src={site.media.brand} alt="L'univers I Tea" fill sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover" />
            </div>
          ) : (
            <BrandScene className="h-auto w-full" />
          )}
          <p className="absolute -right-2 bottom-8 hidden max-w-[11rem] -rotate-3 rounded-2xl bg-cream px-4 py-3 text-sm font-bold leading-snug shadow-pop sm:block lg:-right-8">
            Ta boisson, ta recette.
          </p>
        </Reveal>

        <div>
          <Reveal>
            <SectionHeading
              id="brand-title"
              eyebrow="L'univers I Tea"
              title={<>Du thé, des fruits et <span className="display-em text-accent-text">beaucoup de personnalité.</span></>}
            >
              Chez I Tea, chaque boisson se compose à ta façon : la base, le sucre, la glace, les toppings. À côté, des
              snacks et des desserts pour faire une vraie pause.
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
              Composer ma boisson
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
