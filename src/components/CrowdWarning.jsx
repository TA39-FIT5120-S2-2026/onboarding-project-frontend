import { formatTime } from '../utils/format.js';

// Only renders when a HIGH-band segment exists; the "no congested section"
// case is simply this component not being rendered (AC 1.2.3 Scenario 3).
export default function CrowdWarning({ segments, dataLastUpdated }) {
  const highSegments = segments.filter((segment) => segment.band === 'HIGH');
  if (highSegments.length === 0) return null;

  const streetNames = [...new Set(highSegments.map((segment) => segment.streetName))].join(', ');

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
          <p className="font-semibold text-band-high">Busier than usual near {streetNames}</p>
          <p className="mt-1 text-sm text-ink">
            Pedestrian data last updated {formatTime(dataLastUpdated)}.
          </p>
        </div>
      </div>
    </div>
  );
}
