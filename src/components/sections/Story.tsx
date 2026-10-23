import { site } from "@/config/site";
import { hasStory } from "@/lib/nav";
import { Photo } from "../Photo";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "./SectionHeading";

/**
 * « Notre histoire » : uniquement des faits fournis et validés par I TEA (site.story).
 * Sans texte réel, la section n'existe pas en production ; en mode démo, un emplacement explicite la remplace.
 */
export function Story() {
  if (!hasStory()) return null;
  const { story, media } = site;
  const real = story.paragraphs.length > 0;

  return (
    <section id="histoire" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-28" aria-labelledby="story-title">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
        <Reveal>
          <Photo
            src={media.histoire}
            alt="La restauratrice de I TEA"
            label="Portrait de la restauratrice dans son restaurant, lumière naturelle, format portrait 4:5"
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="mx-auto aspect-[4/5] w-full max-w-md rounded-lg lg:max-w-none"
          />
        </Reveal>

        <div>
          <Reveal>
            <SectionHeading id="story-title" eyebrow="Notre histoire" title={story.title ?? "À la table de I TEA"} />
          </Reveal>
          <Reveal delay={80}>
            {real ? (
              <div className="mt-6 max-w-xl space-y-4 text-lg leading-relaxed text-ink/90">
                {story.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {story.signature && <p className="pt-2 font-display text-xl italic text-accent-text">{story.signature}</p>}
              </div>
            ) : (
              <div className="mt-6 max-w-xl rounded-lg border border-dashed border-ink/30 p-6" role="note">
                <p className="text-lg leading-relaxed text-muted">
                  Emplacement réservé : ici, la présentation de la restauratrice, de sa cuisine et de l&apos;esprit de I TEA,
                  avec ses propres mots.
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent-text">
                  Texte à fournir · site.story dans src/config/site.ts
                </p>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
