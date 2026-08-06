import SensoryIndicator from './SensoryIndicator.jsx';
import { formatDuration } from '../utils/format.js';

export default function AlternativeRouteCard({ route, onSwitch }) {
  return (
    <div className="mt-3 rounded-lg bg-white p-3">
      <p className="text-sm font-medium text-ink">Try this route instead</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="font-semibold text-ink">{formatDuration(route.walkingTimeMinutes)}</span>
        <SensoryIndicator band={route.band} countPerMinute={route.averageCountPerMinute} />
      </div>
      <button
        type="button"
        onClick={() => onSwitch(route)}
        className="mt-3 w-full rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-dark"
      >
        Use this route instead
      </button>
    </div>
  );
}
