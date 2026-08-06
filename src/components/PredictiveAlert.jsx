import { Link } from 'react-router-dom';

export default function PredictiveAlert({ locationName, peakWindow }) {
  return (
    <div role="alert" className="mb-4 rounded-lg border border-band-high/30 bg-band-highBg p-4">
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
          <p className="font-semibold text-band-high">
            Busier than usual expected near {locationName}
          </p>
          <p className="mt-1 text-sm text-ink">
            High pedestrian levels are expected around {peakWindow}. This is an estimate based on
            historical patterns.
          </p>
          <Link
            to="/forecast"
            className="mt-2 inline-block text-sm font-medium text-accent underline"
          >
            View forecast
          </Link>
        </div>
      </div>
    </div>
  );
}
