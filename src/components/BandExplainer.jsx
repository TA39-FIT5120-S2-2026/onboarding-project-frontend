import BandIcon from './BandIcon.jsx';
import Card from './ui/Card.jsx';
import { BAND_LABELS, BAND_ORDER } from '../utils/bandLabels.js';

const TEXT_COLOR = {
  LOW: 'text-band-low',
  MEDIUM: 'text-band-medium',
  HIGH: 'text-band-high',
};

// Introduces the three bands before a first-time user meets them on the
// results page, so a count like "162 counts / min" means something the
// first time it's seen, not just a number.
export default function BandExplainer() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {BAND_ORDER.map((band) => (
        <Card key={band} padding="sm" className="flex items-start gap-2.5">
          <BandIcon
            shape={BAND_LABELS[band].icon}
            className={`mt-0.5 h-5 w-5 flex-shrink-0 ${TEXT_COLOR[band]}`}
          />
          <div>
            <p className="font-semibold text-ink">{BAND_LABELS[band].text}</p>
            <p className="text-micro text-ink/60">{BAND_LABELS[band].description}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
