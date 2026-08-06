export default function RecommendedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden="true">
        <path d="M6.5 11.1 3.4 8l-1.1 1.1L6.5 13.3 14 5.8l-1.1-1.1z" />
      </svg>
      Recommended
    </span>
  );
}
