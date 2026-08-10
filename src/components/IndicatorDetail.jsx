import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SensoryIndicator from './SensoryIndicator.jsx';
import BandIcon from './BandIcon.jsx';
import { formatCount, formatTime } from '../utils/format.js';
import { getRouteDetail } from '../api/routes.js';

export default function IndicatorDetail({ routeId, band, countPerMinute }) {
  const [isOpen, setIsOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const panelId = `indicator-detail-${routeId}`;

  async function handleToggle() {
    const next = !isOpen;
    setIsOpen(next);
    if (next && !detail) {
      setIsLoading(true);
      try {
        const result = await getRouteDetail(routeId);
        setDetail(result);
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full flex-wrap items-center justify-between gap-2 rounded-lg text-left"
      >
        <SensoryIndicator band={band} countPerMinute={countPerMinute} />
        <span className="flex items-center gap-1 text-micro font-medium text-accent">
          {isOpen ? 'Hide sensor detail' : 'Sensor detail'}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </span>
      </button>

      {isOpen && (
        <div id={panelId} className="mt-2 rounded-lg border border-ink/10 bg-white p-3">
          {isLoading && <p className="text-caption text-ink/60">Loading sensor detail…</p>}
          {!isLoading && detail && (
            <>
              <ul className="space-y-2">
                {detail.segments.map((segment) => (
                  <li
                    key={`${segment.streetName}-${segment.sensorId ?? 'no-sensor'}`}
                    className="text-caption"
                  >
                    <p className="font-medium text-ink">{segment.streetName}</p>
                    {segment.band === 'NO_DATA' ? (
                      <p className="mt-0.5 flex items-center gap-1.5 text-ink/70">
                        <BandIcon shape="dash" className="h-3.5 w-3.5" />
                        No sensor data
                      </p>
                    ) : (
                      <p className="mt-0.5 text-ink/70">
                        {segment.sensorName} · {formatCount(segment.countPerMinute)} ·{' '}
                        {formatTime(segment.readingTakenAt)}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-micro text-ink/50">{detail.attribution}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
