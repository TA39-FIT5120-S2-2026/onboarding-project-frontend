// Persistent per AC 2.2.1: predictions must never be overstated as fact.
export default function EstimateDisclaimer() {
  return (
    <p className="rounded-lg bg-accent/5 px-3 py-2 text-sm text-ink/80">
      Estimate based on historical patterns.
    </p>
  );
}
