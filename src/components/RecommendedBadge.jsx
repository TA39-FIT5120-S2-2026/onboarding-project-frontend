import { Check } from 'lucide-react';

export default function RecommendedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-micro font-semibold uppercase tracking-wide text-white">
      <Check className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={3} />
      Recommended
    </span>
  );
}
