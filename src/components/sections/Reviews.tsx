import { ExternalLink, Quote, Star } from "lucide-react";
import { site } from "@/config/site";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "./SectionHeading";

/**
 * Avis clients. N'affiche que de vrais avis fournis dans `site.reviews.items`.
 * Sans avis : rien en production ; en mode démo, un emplacement explicite (jamais de faux témoignage).
 */
export function Reviews() {
  const { items, seeMoreUrl } = site.reviews;
  if (items.length === 0 && !site.demoMode) return null;

  return (
    <section className="bg-seigaiha bg-sand py-16 lg:py-24" aria-labelledby="reviews-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading id="reviews-title" eyebrow="Ils en parlent" title={<>Ce que disent <span className="display-em text-orange">nos clients</span></>} />
        </Reveal>

        {items.length > 0 ? (
          <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((r, i) => (
              <li key={`${r.author}-${i}`}>
                <Reveal delay={i * 70} className="h-full">
                  <figure className="flex h-full flex-col rounded-card bg-white p-7 shadow-card">
                    <Quote size={28} className="text-accent" aria-hidden="true" />
                    {r.rating && (
                      <p className="mt-3 flex gap-0.5" aria-label={`Note : ${r.rating} sur 5`}>
                        {Array.from({ length: 5 }, (_, n) => (
                          <Star key={n} size={18} className={n < r.rating! ? "fill-accent text-accent" : "text-line"} aria-hidden="true" />
                        ))}
                      </p>
                    )}
                    <blockquote className="mt-3 flex-1 text-lg leading-relaxed">{r.text}</blockquote>
                    <figcaption className="mt-5 border-t border-line pt-4 text-sm">
                      <span className="font-bold">{r.author}</span>
                      {(r.source || r.date) && <span className="text-muted"> · {[r.source, r.date].filter(Boolean).join(" · ")}</span>}
                    </figcaption>
                  </figure>
                </Reveal>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-3" role="note" aria-label="Emplacement réservé aux avis clients">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex min-h-48 flex-col justify-between rounded-card border-2 border-dashed border-ink/20 p-7">
                <Quote size={28} className="text-ink/25" aria-hidden="true" />
                <p className="text-muted">
                  {i === 0
                    ? "Emplacement réservé : ici, un vrai avis client, copié tel quel avec son auteur et sa source."
                    : "Aucun avis n'est inventé : cette section reste vide tant que de vrais avis ne sont pas ajoutés."}
                </p>
                {i === 0 && <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-text">À renseigner dans site.reviews</p>}
              </div>
            ))}
          </div>
        )}

        {seeMoreUrl && items.length > 0 && (
          <Reveal className="mt-8">
            <a href={seeMoreUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ink">
              Voir tous les avis
              <ExternalLink size={18} aria-hidden="true" />
            </a>
          </Reveal>
        )}
      </div>
    </section>
  );
}
