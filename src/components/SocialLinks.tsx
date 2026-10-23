import { site } from "@/config/site";

type Network = "instagram" | "facebook" | "tiktok";

function Icon({ name }: { name: Network }) {
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

/** Réseaux sociaux configurés dans site.socials (rien n'est affiché pour les liens non renseignés). */
export function SocialLinks({ onDark = false }: { onDark?: boolean }) {
  const links = (Object.entries(site.socials) as [Network, string | null][]).filter(([, url]) => url);
  if (links.length === 0) return null;
  return (
    <ul className="flex gap-3">
      {links.map(([name, url]) => (
        <li key={name}>
          <a
            href={url!}
            target="_blank"
            rel="noopener noreferrer"
            className={`grid size-11 place-items-center rounded-lg border transition ${
              onDark ? "border-cream/30 hover:border-gold hover:text-gold" : "border-line hover:border-ink/50"
            }`}
            aria-label={name.charAt(0).toUpperCase() + name.slice(1)}
          >
            <Icon name={name} />
          </a>
        </li>
      ))}
    </ul>
  );
}
