import Link from "next/link";
import { site } from "@/config/site";
import { categories } from "@/data/menu";
import { CategoryLink } from "./CategoryLink";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialLinks";

/** Pied de page sobre : marque, carte, informations. Les détails pratiques sont dans la section « Infos pratiques ». */
export function Footer() {
  const { contact } = site;
  const linkClass = "inline-flex min-h-9 items-center text-cream/80 transition hover:text-cream hover:underline underline-offset-4";

  return (
    <footer className="bg-ink pb-28 pt-16 text-cream md:pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo light className="size-24" />
            <p className="mt-5 max-w-sm leading-relaxed text-cream/75">{site.description}</p>
            <div className="mt-6">
              <SocialLinks onDark />
            </div>
          </div>

          <nav aria-label="La carte">
            <h2 className="text-lg font-bold">La carte</h2>
            <ul className="mt-3 space-y-0.5">
              {categories.map((c) => (
                <li key={c.id}>
                  <CategoryLink id={c.id} className={linkClass}>
                    {c.name}
                  </CategoryLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Informations">
            <h2 className="text-lg font-bold">Infos</h2>
            <ul className="mt-3 space-y-0.5">
              <li>
                <Link href="/#infos" className={linkClass}>
                  Horaires et infos pratiques
                </Link>
              </li>
              {contact.address && (
                <li className="py-1 text-cream/80">
                  {contact.mapUrl ? (
                    <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-cream hover:underline">
                      {contact.address}
                    </a>
                  ) : (
                    contact.address
                  )}
                  {contact.addressNote && <span className="block text-sm text-cream/60">{contact.addressNote}</span>}
                </li>
              )}
              {[contact.phone, contact.landline].filter((n): n is string => Boolean(n)).map((number) => (
                <li key={number}>
                  <a href={`tel:${number.replace(/[^\d+]/g, "")}`} className={linkClass}>
                    {number}
                  </a>
                </li>
              ))}
              {contact.email && (
                <li>
                  <a href={`mailto:${contact.email}`} className={`${linkClass} break-all`}>
                    {contact.email}
                  </a>
                </li>
              )}
              <li>
                <Link href="/mentions-legales" className={linkClass}>
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className={linkClass}>
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mt-12 border-t border-white/15 pt-6 text-sm text-cream/60">
          © {new Date().getFullYear()} {site.name}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
