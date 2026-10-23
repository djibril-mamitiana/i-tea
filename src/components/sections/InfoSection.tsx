import { Mail, MapPin, Phone } from "lucide-react";
import { activePayments, site } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { prettyTime, weekHours } from "@/lib/hours";
import { OpenStatus } from "../OpenStatus";
import { SocialLinks } from "../SocialLinks";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "./SectionHeading";

const Column = ({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) => (
  <div className="border-t border-cream/25 pt-6">
    <h3 className="font-display text-2xl font-medium">{title}</h3>
    <div className="mt-4 space-y-2 text-[0.95rem] leading-relaxed text-cream/85">{children}</div>
    {note && <p className="mt-5 border-l-2 border-gold pl-3 text-xs leading-snug text-cream/70">{note}</p>}
  </div>
);

/** Horaires, conditions de retrait / livraison, paiement et coordonnées. Rien n'est affiché s'il n'est pas configuré. */
export function InfoSection() {
  const { contact, ordering } = site;
  const { pickup, delivery } = ordering;
  const payments = activePayments();
  const hasContact = contact.phone || contact.email || contact.address;
  const hasSocials = Object.values(site.socials).some(Boolean);
  const demoNote = site.demoMode ? "Informations de démonstration, à remplacer dans src/config/site.ts." : undefined;

  return (
    <section id="contact" className="on-dark bg-green text-cream" aria-labelledby="contact-title">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <SectionHeading id="contact-title" eyebrow="Informations pratiques" title="Venir, commander, se faire livrer" />
        </Reveal>

        <div className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          <Reveal>
            <Column title="Horaires" note={demoNote}>
              <dl className="space-y-1.5">
                {weekHours().map((h) => (
                  <div key={h.day} className="flex justify-between gap-6">
                    <dt>{h.name}</dt>
                    <dd className="font-medium tabular-nums text-cream">{h.open && h.close ? `${prettyTime(h.open)} – ${prettyTime(h.close)}` : "Fermé"}</dd>
                  </div>
                ))}
              </dl>
              <div className="pt-3">
                <OpenStatus onDark />
              </div>
            </Column>
          </Reveal>

          <Reveal delay={80}>
            <Column title="Commander" note={demoNote}>
              <ul className="space-y-3">
                {pickup.enabled && (
                  <li>
                    <strong className="font-semibold text-cream">{pickup.label}</strong> : {pickup.description} Gratuit.
                  </li>
                )}
                {delivery.enabled && (
                  <li>
                    <strong className="font-semibold text-cream">{delivery.label}</strong> : {formatPrice(delivery.fee)}
                    {delivery.freeFrom !== null && `, offerte dès ${formatPrice(delivery.freeFrom)}`}
                    {delivery.minOrder > 0 && `. Commande minimum : ${formatPrice(delivery.minOrder)}`}. {delivery.zones}
                  </li>
                )}
                {payments.map((p) => (
                  <li key={p.id}>
                    <strong className="font-semibold text-cream">{p.label}</strong> : {p.description}
                  </li>
                ))}
              </ul>
            </Column>
          </Reveal>

          {(hasContact || hasSocials || site.demoMode) && (
            <Reveal delay={160}>
              <Column title="Nous trouver" note={!hasContact && site.demoMode ? "Adresse et coordonnées à renseigner dans src/config/site.ts." : undefined}>
                {hasContact ? (
                  <ul className="space-y-3">
                    {contact.address && (
                      <li className="flex gap-3">
                        <MapPin size={18} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
                        {contact.mapUrl ? (
                          <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-cream underline-offset-4 hover:underline">
                            {contact.address}
                          </a>
                        ) : (
                          <span className="font-medium text-cream">{contact.address}</span>
                        )}
                      </li>
                    )}
                    {contact.phone && (
                      <li className="flex gap-3">
                        <Phone size={18} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
                        <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="font-medium text-cream underline-offset-4 hover:underline">
                          {contact.phone}
                        </a>
                      </li>
                    )}
                    {contact.email && (
                      <li className="flex gap-3">
                        <Mail size={18} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
                        <a href={`mailto:${contact.email}`} className="break-all font-medium text-cream underline-offset-4 hover:underline">
                          {contact.email}
                        </a>
                      </li>
                    )}
                  </ul>
                ) : (
                  <p>Adresse et coordonnées bientôt disponibles.</p>
                )}
                {hasSocials && (
                  <div className="pt-3">
                    <SocialLinks onDark />
                  </div>
                )}
              </Column>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
