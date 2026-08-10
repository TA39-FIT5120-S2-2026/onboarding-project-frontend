import { TriangleAlert } from 'lucide-react';
import Callout from './ui/Callout.jsx';
import AlternativeRouteCard from './AlternativeRouteCard.jsx';
import { bandLabel } from '../utils/bandLabels.js';
import { formatDistance, formatDuration } from '../utils/format.js';

// Calm, specific wording per ACCESSIBILITY.md: "Busier than your usual
// limit" reads better than alarming language, and the warning must say
// what and where, not just that something is wrong.
export default function ToleranceWarning({ route, tolerance, alternative, onSwitch }) {
  return (
    <Callout
      role="alert"
      tone="alert"
      icon={TriangleAlert}
      title="Busier than your usual limit"
      actions={alternative && <AlternativeRouteCard route={alternative} onSwitch={onSwitch} />}
    >
      Your selected route ({formatDuration(route.walkingTimeMinutes)} ·{' '}
      {formatDistance(route.distanceMetres)}) is busier than your selected tolerance (
      {bandLabel(tolerance).text}).
    </Callout>
  );
}
