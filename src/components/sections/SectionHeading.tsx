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
      <p className={`eyebrow flex items-center gap-2 ${light ? "!text-peach" : ""}`}>
        <span className={`h-px w-8 ${light ? "bg-peach" : "bg-accent"}`} aria-hidden="true" />
        {eyebrow}
      </p>
      <h2 id={id} className="display-lg mt-3">
        {title}
      </h2>
      {children && <p className={`mt-4 text-lg leading-relaxed ${light ? "text-cream/75" : "text-muted"}`}>{children}</p>}
    </div>
  );
}
