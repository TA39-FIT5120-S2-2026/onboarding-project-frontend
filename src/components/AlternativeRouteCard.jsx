import SensoryIndicator from './SensoryIndicator.jsx';
import Button from './ui/Button.jsx';
import { formatDuration } from '../utils/format.js';

export default function AlternativeRouteCard({ route, onSwitch }) {
  return (
    <div className="rounded-lg bg-white p-3">
      <p className="text-caption font-semibold text-ink">Try this route instead</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <span className="font-semibold text-ink">{formatDuration(route.duration.minutes)}</span>
        <SensoryIndicator
          band={route.exposure.sensoryBand}
          countPerMinute={route.exposure.averagePedestrianCount}
        />
      </div>
      <Button type="button" onClick={() => onSwitch(route)} fullWidth className="mt-3">
        Use this route instead
      </Button>
    </div>
  );
}
