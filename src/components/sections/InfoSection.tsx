import { Clock, Mail, MapPin, Phone, Store } from "lucide-react";
import { activePayments, site } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { prettyTime, weekHours } from "@/lib/hours";
import { OpenStatus } from "../OpenStatus";
import { SocialLinks } from "../SocialLinks";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "./SectionHeading";

const Card = ({ icon: Icon, title, children, note }: { icon: typeof Clock; title: string; children: React.ReactNode; note?: string }) => (
  <div className="flex h-full flex-col rounded-card bg-white p-7 shadow-card">
    <span className="grid size-12 place-items-center rounded-2xl bg-ink text-accent">
      <Icon size={24} aria-hidden="true" />
    </span>
    <h3 className="mt-4 font-display text-2xl font-bold">{title}</h3>
    <div className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-muted">{children}</div>
    {note && <p className="mt-4 rounded-xl bg-lemon/60 px-3 py-2 text-xs font-semibold text-ink">{note}</p>}
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
    <section id="infos" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24" aria-labelledby="infos-title">
      <Reveal>
        <SectionHeading id="infos-title" eyebrow="Infos pratiques" title={<>Venir, <span className="display-em text-accent-text">commander</span>, se faire livrer</>} />
      </Reveal>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        <Reveal className="h-full">
          <Card icon={Clock} title="Horaires" note={demoNote}>
            <dl className="space-y-1.5">
              {weekHours().map((h) => (
                <div key={h.day} className="flex justify-between gap-6">
                  <dt>{h.name}</dt>
                  <dd className="font-semibold tabular-nums text-ink">{h.open && h.close ? `${prettyTime(h.open)} – ${prettyTime(h.close)}` : "Fermé"}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4">
              <OpenStatus />
            </div>
          </Card>
        </Reveal>

        <Reveal className="h-full" delay={80}>
          <Card icon={Store} title="Retrait, livraison, paiement" note={demoNote}>
            <ul className="space-y-2.5">
              {pickup.enabled && (
                <li>
                  <strong className="text-ink">{pickup.label}</strong> : {pickup.description} Gratuit.
                </li>
              )}
              {delivery.enabled && (
                <li>
                  <strong className="text-ink">{delivery.label}</strong> : {formatPrice(delivery.fee)}
                  {delivery.freeFrom !== null && `, offerte dès ${formatPrice(delivery.freeFrom)}`}
                  {delivery.minOrder > 0 && `. Commande minimum : ${formatPrice(delivery.minOrder)}`}. {delivery.zones}
                </li>
              )}
              {payments.map((p) => (
                <li key={p.id}>
                  <strong className="text-ink">{p.label}</strong> : {p.description}
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>

        {(hasContact || hasSocials || site.demoMode) && (
          <Reveal className="h-full" delay={160}>
            <Card icon={MapPin} title="Nous trouver" note={!hasContact && site.demoMode ? "Adresse et coordonnées à renseigner dans src/config/site.ts." : undefined}>
              {hasContact ? (
                <ul className="space-y-3">
                  {contact.address && (
                    <li className="flex gap-3">
                      <MapPin size={18} className="mt-0.5 shrink-0 text-accent-text" aria-hidden="true" />
                      {contact.mapUrl ? (
                        <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline-offset-4 hover:underline">
                          {contact.address}
                        </a>
                      ) : (
                        <span className="font-semibold text-ink">{contact.address}</span>
                      )}
                    </li>
                  )}
                  {contact.phone && (
                    <li className="flex gap-3">
                      <Phone size={18} className="mt-0.5 shrink-0 text-accent-text" aria-hidden="true" />
                      <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="font-semibold text-ink underline-offset-4 hover:underline">
                        {contact.phone}
                      </a>
                    </li>
                  )}
                  {contact.email && (
                    <li className="flex gap-3">
                      <Mail size={18} className="mt-0.5 shrink-0 text-accent-text" aria-hidden="true" />
                      <a href={`mailto:${contact.email}`} className="break-all font-semibold text-ink underline-offset-4 hover:underline">
                        {contact.email}
                      </a>
                    </li>
                  )}
                </ul>
              ) : (
                <p>Adresse et coordonnées bientôt disponibles.</p>
              )}
              {hasSocials && (
                <div className="mt-5">
                  <SocialLinks />
                </div>
              )}
            </Card>
          </Reveal>
        )}
      </div>
    </section>
  );
}
