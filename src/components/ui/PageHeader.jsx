// Consistent page opening: same eyebrow/title/description rhythm on
// every page, instead of five pages each starting differently.
export default function PageHeader({ eyebrow, title, description, action, back }) {
  return (
    <header className="mb-6">
      {back}
      {eyebrow && (
        <p className="text-micro font-semibold uppercase tracking-wide text-accent">{eyebrow}</p>
      )}
      <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-display-sm text-ink">{title}</h1>
        {action}
      </div>
      {description && <p className="mt-2 max-w-prose text-body text-ink/70">{description}</p>}
    </header>
  );
}
