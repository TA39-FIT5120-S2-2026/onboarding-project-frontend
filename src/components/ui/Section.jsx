// Consistent vertical rhythm between blocks on a page.
export default function Section({ title, children, className = '' }) {
  return (
    <section className={`mt-8 first:mt-0 ${className}`}>
      {title && <h2 className="text-heading-sm text-ink">{title}</h2>}
      <div className={title ? 'mt-3' : ''}>{children}</div>
    </section>
  );
}
