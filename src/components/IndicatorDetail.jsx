import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SensoryIndicator from './SensoryIndicator.jsx';
import BandIcon from './BandIcon.jsx';
import { formatCount, formatTime } from '../utils/format.js';

const ATTRIBUTION = 'City of Melbourne, CC BY 4.0';

export default function IndicatorDetail({ routeId, exposure }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = `indicator-detail-${routeId}`;

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full flex-wrap items-center justify-between gap-2 rounded-lg text-left"
      >
        <SensoryIndicator band={exposure.sensoryBand} countPerMinute={exposure.averagePedestrianCount} />
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
          {exposure.sensors.length === 0 ? (
            <p className="flex items-center gap-1.5 text-caption text-ink/70">
              <BandIcon shape="dash" className="h-3.5 w-3.5" />
              No sensor data
            </p>
          ) : (
            <ul className="space-y-2">
              {exposure.sensors.map((sensor) => (
                <li key={sensor.locationId} className="text-caption">
                  <p className="font-medium text-ink">{sensor.name}</p>
                  <p className="mt-0.5 text-ink/70">
                    {sensor.sensorName} · {formatCount(sensor.pedestrianCount)} ·{' '}
                    {formatTime(sensor.timestamp)}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-micro text-ink/50">{exposure.dataSource ?? ATTRIBUTION}</p>
        </div>
      )}
    </div>
  );
}
