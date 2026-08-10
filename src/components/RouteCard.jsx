import { Footprints } from 'lucide-react';
import IndicatorDetail from './IndicatorDetail.jsx';
import RecommendedBadge from './RecommendedBadge.jsx';
import Card from './ui/Card.jsx';
import Stat from './ui/Stat.jsx';
import Button from './ui/Button.jsx';
import { formatDistance, formatDuration } from '../utils/format.js';

export default function RouteCard({ route, onSelect }) {
  return (
    <Card highlighted={route.recommended} className="flex h-full flex-col">
      {route.recommended && (
        <div className="mb-3">
          <RecommendedBadge />
        </div>
      )}

      <Stat
        icon={Footprints}
        value={formatDuration(route.walkingTimeMinutes)}
        label={formatDistance(route.distanceMetres)}
      />

      <div className="mt-3">
        <IndicatorDetail
          routeId={route.id}
          band={route.band}
          countPerMinute={route.averageCountPerMinute}
        />
      </div>

      {route.reason && <p className="mt-3 text-caption text-ink/70">{route.reason}</p>}

      {onSelect && (
        <Button
          type="button"
          onClick={() => onSelect(route)}
          variant={route.recommended ? 'primary' : 'secondary'}
          fullWidth
          className="mt-auto pt-4"
        >
          Select this route
        </Button>
      )}
    </Card>
  );
}
