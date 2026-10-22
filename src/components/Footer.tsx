import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { activePayments, site } from "@/config/site";
import { categories } from "@/data/menu";
import { formatPrice } from "@/lib/format";
import { prettyTime, weekHours } from "@/lib/hours";
import { Logo } from "./Logo";

function SocialIcon({ name }: { name: "instagram" | "facebook" | "tiktok" }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "instagram")
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </svg>
    );
  if (name === "facebook")
    return (
      <svg {...common}>
        <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5A.5.5 0 0 1 14 8Z" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 3c.3 2.6 2 4.4 5 4.6" />
    </svg>
  );
}

export function Footer() {
  const { contact, socials, ordering } = site;
  const phoneHref = contact.phone ? `tel:${contact.phone.replace(/[^\d+]/g, "")}` : null;
  const socialLinks = (Object.entries(socials) as [keyof typeof socials, string | null][]).filter(([, url]) => url);
  const hasContact = contact.phone || contact.email || contact.address;
  const payments = activePayments();

  return (
    <footer className="bg-ink pb-28 pt-16 text-cream md:pb-10" id="infos">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs text-cream/75">{site.description}</p>
            {socialLinks.length > 0 && (
              <ul className="mt-5 flex gap-3">
                {socialLinks.map(([name, url]) => (
                  <li key={name}>
                    <a
                      href={url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid size-11 place-items-center rounded-full bg-white/10 transition hover:bg-accent hover:text-ink"
                      aria-label={name.charAt(0).toUpperCase() + name.slice(1)}
                    >
                      <SocialIcon name={name} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="text-lg font-extrabold">Horaires</h2>
            <dl className="mt-4 space-y-1.5 text-cream/80">
              {weekHours().map((h) => (
                <div key={h.day} className="flex justify-between gap-6 text-sm">
                  <dt>{h.name}</dt>
                  <dd className="font-semibold tabular-nums">{h.open && h.close ? `${prettyTime(h.open)} – ${prettyTime(h.close)}` : "Fermé"}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h2 className="text-lg font-extrabold">Nous trouver</h2>
            {hasContact ? (
              <ul className="mt-4 space-y-3 text-cream/80">
                {contact.address && (
                  <li className="flex gap-3">
                    <MapPin size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
                    {contact.mapUrl ? (
                      <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                        {contact.address}
                      </a>
                    ) : (
                      <span>{contact.address}</span>
                    )}
                  </li>
                )}
                {contact.phone && phoneHref && (
                  <li className="flex gap-3">
                    <Phone size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <a href={phoneHref} className="underline-offset-4 hover:underline">
                      {contact.phone}
                    </a>
                  </li>
                )}
                {contact.email && (
                  <li className="flex gap-3">
                    <Mail size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <a href={`mailto:${contact.email}`} className="break-all underline-offset-4 hover:underline">
                      {contact.email}
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <p className="mt-4 text-cream/70">Adresse et coordonnées à venir.</p>
            )}
          </div>

          <div>
            <h2 className="text-lg font-extrabold">Livraison &amp; retrait</h2>
            <ul className="mt-4 space-y-2 text-cream/80">
              {ordering.pickup.enabled && <li>{ordering.pickup.label} : gratuit.</li>}
              {ordering.delivery.enabled && (
                <>
                  <li>
                    Livraison : {formatPrice(ordering.delivery.fee)}
                    {ordering.delivery.freeFrom !== null && `, offerte dès ${formatPrice(ordering.delivery.freeFrom)}`}.
                  </li>
                  {ordering.delivery.minOrder > 0 && <li>Minimum de commande : {formatPrice(ordering.delivery.minOrder)}.</li>}
                  <li>{ordering.delivery.zones}</li>
                </>
              )}
              {payments.map((p) => (
                <li key={p.id}>{p.label}.</li>
              ))}
            </ul>
          </div>
        </div>

        <nav aria-label="Catégories" className="mt-12 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/15 pt-6 text-sm text-cream/75">
          {categories.map((c) => (
            <Link key={c.id} href={`/#cat-${c.id}`} className="hover:text-cream hover:underline">
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="mt-6 flex flex-col gap-3 text-sm text-cream/65 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. Tous droits réservés.
          </p>
          <ul className="flex gap-5">
            <li>
              <Link href="/mentions-legales" className="hover:text-cream hover:underline">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link href="/confidentialite" className="hover:text-cream hover:underline">
                Politique de confidentialité
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
