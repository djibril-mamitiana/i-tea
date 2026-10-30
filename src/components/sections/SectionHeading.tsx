import { LeafPair } from "../art/Brand";

/** Titre de section : petite paire de feuilles du logo, titre en vert (cream sur fond sombre), accent orange en italique. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  children,
  light = false,
  className = "",
}: {
  id?: string;
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={`max-w-2xl ${className}`}>
      <p className={`eyebrow flex items-center gap-2.5 ${light ? "!text-blossom" : ""}`}>
        <LeafPair className={`h-7 w-3.5 shrink-0 ${light ? "text-blossom" : "text-leaf"}`} />
        {eyebrow}
      </p>
      <h2 id={id} className={`display-lg mt-3 ${light ? "text-cream" : "text-leaf"}`}>
        {title}
      </h2>
      {children && <p className={`mt-4 text-lg leading-relaxed ${light ? "text-cream/80" : "text-muted"}`}>{children}</p>}
    </div>
  );
}
