import AlternativeRouteCard from './AlternativeRouteCard.jsx';
import { bandLabel } from '../utils/bandLabels.js';
import { formatDistance, formatDuration } from '../utils/format.js';

// Calm, specific wording per ACCESSIBILITY.md: "Busier than your usual
// limit" reads better than alarming language, and the warning must say
// what and where, not just that something is wrong.
export default function ToleranceWarning({ route, tolerance, alternative, onSwitch }) {
  return (
    <div role="alert" className="rounded-lg border border-band-high/30 bg-band-highBg p-4">
      <div className="flex items-start gap-2">
        <svg
          viewBox="0 0 16 16"
          className="mt-0.5 h-4 w-4 flex-shrink-0 text-band-high"
          fill="currentColor"
          aria-hidden="true"
        >
          <rect x="1" y="1" width="14" height="14" rx="2" />
        </svg>
        <div>
          <p className="font-semibold text-band-high">Busier than your usual limit</p>
          <p className="mt-1 text-sm text-ink">
            Your selected route ({formatDuration(route.walkingTimeMinutes)} ·{' '}
            {formatDistance(route.distanceMetres)}) is busier than your selected tolerance (
            {bandLabel(tolerance).text}).
          </p>
        </div>
      </div>

      {alternative && <AlternativeRouteCard route={alternative} onSwitch={onSwitch} />}
    </div>
  );
}
