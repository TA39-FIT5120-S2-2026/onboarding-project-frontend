import { TriangleAlert } from 'lucide-react';
import Callout from './ui/Callout.jsx';
import { formatTime } from '../utils/format.js';

// Only renders when a HIGH-band section exists; the "no congested section"
// case is simply this component not being rendered (AC 1.2.3 Scenario 3).
export default function CrowdWarning({ sections, latestReadingAt }) {
  const highSections = sections.filter((section) => section.sensoryBand === 'HIGH');
  if (highSections.length === 0) return null;

  const names = [
    ...new Set(highSections.flatMap((section) => section.sensors.map((sensor) => sensor.name))),
  ];
  const label = names.length > 0 ? names.join(', ') : `sections ${highSections.map((s) => s.sectionId).join(', ')}`;

  return (
    <Callout role="alert" tone="alert" icon={TriangleAlert} title={`Busier than usual near ${label}`}>
      Pedestrian data last updated {formatTime(latestReadingAt)}.
    </Callout>
  );
}
