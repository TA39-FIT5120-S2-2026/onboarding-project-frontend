import BandIcon from './BandIcon.jsx';
import Card from './ui/Card.jsx';
import { BAND_LABELS, BAND_ORDER } from '../utils/bandLabels.js';

export default function BandLegend({ bands = BAND_ORDER }) {
  return (
    <Card padding="sm">
      <p className="text-micro font-semibold uppercase tracking-wide text-ink/60">
        Crowd level legend
      </p>
      <ul className="mt-2 flex flex-wrap gap-4">
        {bands.map((band) => (
          <li key={band} className="flex items-center gap-1.5 text-caption text-ink">
            <BandIcon shape={BAND_LABELS[band].icon} />
            {BAND_LABELS[band].text}
          </li>
        ))}
      </ul>
    </Card>
  );
}
