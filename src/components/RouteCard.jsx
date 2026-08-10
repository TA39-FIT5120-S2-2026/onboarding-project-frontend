import { Footprints } from 'lucide-react';
import IndicatorDetail from './IndicatorDetail.jsx';
import RouteExposureStats from './RouteExposureStats.jsx';
import RecommendedBadge from './RecommendedBadge.jsx';
import Card from './ui/Card.jsx';
import Stat from './ui/Stat.jsx';
import Button from './ui/Button.jsx';
import { formatDistance, formatDuration } from '../utils/format.js';

export default function RouteCard({ route, reason, onSelect }) {
  return (
    <Card highlighted={route.recommended} className="flex h-full flex-col">
      {route.recommended && (
        <div className="mb-3">
          <RecommendedBadge />
        </div>
      )}

      <Stat
        icon={Footprints}
        value={formatDuration(route.duration.minutes)}
        label={formatDistance(route.distance.meters)}
      />

      <div className="mt-3">
        <IndicatorDetail routeId={route.routeId} exposure={route.exposure} showCount={false} />
      </div>

      <div className="mt-3 border-t border-ink/10 pt-3">
        <RouteExposureStats exposure={route.exposure} />
      </div>

      {reason && <p className="mt-3 text-caption text-ink/70">{reason}</p>}

      {onSelect && (
        <div className="mt-auto pt-4">
          <Button
            type="button"
            onClick={() => onSelect(route)}
            variant={route.recommended ? 'primary' : 'secondary'}
            fullWidth
          >
            Select this route
          </Button>
        </div>
      )}
    </Card>
  );
}
