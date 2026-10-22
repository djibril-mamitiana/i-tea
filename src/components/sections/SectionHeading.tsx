export function SectionHeading({
  id,
  eyebrow,
  title,
  children,
  light = false,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
  light?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      <p className={`text-sm font-bold uppercase tracking-[0.14em] ${light ? "text-peach" : "text-accent-text"}`}>{eyebrow}</p>
      <h2 id={id} className="mt-2 text-4xl font-extrabold leading-[1.02] sm:text-5xl">
        {title}
      </h2>
      {children && <p className={`mt-3 text-lg ${light ? "text-cream/75" : "text-muted"}`}>{children}</p>}
    </div>
  );
}
