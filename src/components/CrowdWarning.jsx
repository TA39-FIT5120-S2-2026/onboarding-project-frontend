import { TriangleAlert } from 'lucide-react';
import Callout from './ui/Callout.jsx';
import { formatTime } from '../utils/format.js';

// Only renders when a HIGH-band segment exists; the "no congested section"
// case is simply this component not being rendered (AC 1.2.3 Scenario 3).
export default function CrowdWarning({ segments, dataLastUpdated }) {
  const highSegments = segments.filter((segment) => segment.band === 'HIGH');
  if (highSegments.length === 0) return null;

  const streetNames = [...new Set(highSegments.map((segment) => segment.streetName))].join(', ');

  return (
    <Callout
      role="alert"
      tone="alert"
      icon={TriangleAlert}
      title={`Busier than usual near ${streetNames}`}
    >
      Pedestrian data last updated {formatTime(dataLastUpdated)}.
    </Callout>
  );
}
