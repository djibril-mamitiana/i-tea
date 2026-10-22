import type { Metadata } from "next";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Mentions légales" };

export default function LegalPage() {
  const { contact } = site;
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-extrabold">Mentions légales</h1>
      {site.demoMode && (
        <p className="mt-4 rounded-2xl bg-lemon/50 p-4 text-sm font-semibold">
          Page modèle à compléter avec les informations légales réelles du restaurant avant la mise en ligne
          (dénomination, forme juridique, SIRET, responsable de publication, hébergeur).
        </p>
      )}
      <div className="mt-8 space-y-6 leading-relaxed">
        <section>
          <h2 className="text-2xl font-extrabold">Éditeur du site</h2>
          <p className="mt-2 text-muted">
            {site.name}
            {contact.address && <> — {contact.address}</>}
            {contact.phone && <> — {contact.phone}</>}
            {contact.email && <> — {contact.email}</>}
          </p>
          <p className="mt-2 text-muted">Raison sociale, numéro d&apos;immatriculation et responsable de publication : à renseigner.</p>
        </section>
        <section>
          <h2 className="text-2xl font-extrabold">Hébergement</h2>
          <p className="mt-2 text-muted">Nom et coordonnées de l&apos;hébergeur : à renseigner.</p>
        </section>
        <section>
          <h2 className="text-2xl font-extrabold">Propriété intellectuelle</h2>
          <p className="mt-2 text-muted">
            Les textes, logos et visuels de ce site appartiennent à {site.name} ou sont utilisés avec autorisation. Les
            illustrations de produits affichées en version de démonstration ne sont pas des photographies du restaurant.
          </p>
        </section>
      </div>
    </article>
  );
}
