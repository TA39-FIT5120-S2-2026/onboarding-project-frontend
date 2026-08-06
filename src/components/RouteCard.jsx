import IndicatorDetail from './IndicatorDetail.jsx';
import RecommendedBadge from './RecommendedBadge.jsx';
import { formatDistance, formatDuration } from '../utils/format.js';

export default function RouteCard({ route, onSelect }) {
  return (
    <div
      className={`rounded-xl border bg-white p-4 ${
        route.recommended ? 'border-accent ring-1 ring-accent' : 'border-ink/10'
      }`}
    >
      {route.recommended && (
        <div className="mb-2">
          <RecommendedBadge />
        </div>
      )}
      <p className="text-lg font-semibold text-ink">
        {formatDuration(route.walkingTimeMinutes)} · {formatDistance(route.distanceMetres)}
      </p>
      <div className="mt-2">
        <IndicatorDetail
          routeId={route.id}
          band={route.band}
          countPerMinute={route.averageCountPerMinute}
        />
      </div>
      {route.reason && <p className="mt-2 text-sm text-ink/70">{route.reason}</p>}
      {onSelect && (
        <button
          type="button"
          onClick={() => onSelect(route)}
          className="mt-3 w-full rounded-lg bg-accent-dark px-3 py-2 text-sm font-medium text-white hover:bg-ink"
        >
          Select this route
        </button>
      )}
    </div>
  );
}
