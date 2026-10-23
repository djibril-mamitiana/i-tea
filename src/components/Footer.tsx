import Link from "next/link";
import { site } from "@/config/site";
import { navLinks } from "@/lib/nav";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialLinks";

/** Pied de page sobre : la marque, la navigation, les mentions. Les détails pratiques sont dans la section Contact. */
export function Footer() {
  const { contact } = site;
  const linkClass = "inline-flex min-h-9 items-center text-cream/80 underline-offset-4 transition hover:text-cream hover:underline";

  return (
    <footer className="on-dark bg-ink pb-28 pt-16 text-cream md:pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-6 max-w-sm leading-relaxed text-cream/75">{site.description}</p>
            <div className="mt-6">
              <SocialLinks onDark />
            </div>
          </div>

          <nav aria-label="Navigation">
            <h2 className="eyebrow">Naviguer</h2>
            <ul className="mt-4 space-y-0.5">
              {navLinks().map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Informations légales et contact">
            <h2 className="eyebrow">Informations</h2>
            <ul className="mt-4 space-y-0.5">
              {contact.phone && (
                <li>
                  <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className={linkClass}>
                    {contact.phone}
                  </a>
                </li>
              )}
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

        <p className="mt-14 border-t border-cream/15 pt-6 text-sm text-cream/60">
          © {new Date().getFullYear()} {site.name}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
