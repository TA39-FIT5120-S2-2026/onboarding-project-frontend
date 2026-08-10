import { formatCount } from '../utils/format.js';

// The backend ranks routes by band, then by the single busiest sensor
// reading, then by average - not by average alone (see
// docs/BACKEND_GAPS.md). A route recommended on a busiest-reading
// technicality can have far fewer sensors along it than an alternative, so
// showing only one number would overstate how much can be trusted from a
// single-sensor route. This never re-ranks or recomputes anything - all
// three values come straight from exposure, exactly as the API sent them.
function coverageText(matchedSensorCount) {
  if (matchedSensorCount === 0) {
    return 'No sensors along this route. Crowd level unknown.';
  }
  if (matchedSensorCount <= 2) {
    return `Based on ${matchedSensorCount} sensor${matchedSensorCount === 1 ? '' : 's'}, so this is a partial picture of the route.`;
  }
  return `Based on ${matchedSensorCount} sensors along this route.`;
}

export default function RouteExposureStats({ exposure }) {
  const typical = exposure.averagePedestrianCount != null ? Math.round(exposure.averagePedestrianCount) : null;
  const busiest = exposure.maximumPedestrianCount != null ? Math.round(exposure.maximumPedestrianCount) : null;

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-caption font-semibold text-ink">{formatCount(typical)}</p>
          <p className="text-micro text-ink/60">Typical (average)</p>
        </div>
        <div>
          <p className="text-caption font-semibold text-ink">{formatCount(busiest)}</p>
          <p className="text-micro text-ink/60">Busiest reading</p>
        </div>
        <div>
          <p className="text-caption font-semibold text-ink">{exposure.matchedSensorCount}</p>
          <p className="text-micro text-ink/60">Sensors on route</p>
        </div>
      </div>
      <p className="mt-2 text-micro text-ink/60">{coverageText(exposure.matchedSensorCount)}</p>
    </div>
  );
}
