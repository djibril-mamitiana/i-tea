/** Titre de section : filet + petite capitale, puis titre serif. Sur fond sombre (`.on-dark`), les couleurs s'adaptent. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-2xl ${className}`}>
      {eyebrow && (
        <p className="eyebrow flex items-center gap-3">
          <span className="h-px w-10 bg-current opacity-60" aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <h2 id={id} className="display-lg mt-3">
        {title}
      </h2>
      {children && <p className="mt-4 text-lg leading-relaxed opacity-80">{children}</p>}
    </div>
  );
}
