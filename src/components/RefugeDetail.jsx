import { orUnavailable, formatDistance } from '../utils/format.js';
import { refugeCategoryLabel } from '../utils/refugeCategories.js';

// Any missing field is shown as "Unavailable", never left blank
// (AC 2.1.2 Scenario 2).
export default function RefugeDetail({ refuge }) {
  return (
    <dl className="mt-2 space-y-1 border-t border-ink/10 pt-2 text-sm">
      <div className="flex justify-between gap-2">
        <dt className="text-ink/60">Category</dt>
        <dd className="font-medium text-ink">{refugeCategoryLabel(refuge.category)}</dd>
      </div>
      <div className="flex justify-between gap-2">
        <dt className="text-ink/60">Address</dt>
        <dd className="text-right font-medium text-ink">{orUnavailable(refuge.address)}</dd>
      </div>
      <div className="flex justify-between gap-2">
        <dt className="text-ink/60">Walking distance</dt>
        <dd className="font-medium text-ink">{formatDistance(refuge.walkingDistanceMetres)}</dd>
      </div>
    </dl>
  );
}
