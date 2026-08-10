import BandIcon from './BandIcon.jsx';
import { bandLabel } from '../utils/bandLabels.js';
import { formatCount } from '../utils/format.js';

const BAND_STYLES = {
  LOW: 'bg-band-lowBg text-band-low',
  MEDIUM: 'bg-band-mediumBg text-band-medium',
  HIGH: 'bg-band-highBg text-band-high',
  NO_DATA: 'bg-band-noDataBg text-band-noData',
};

// Band always comes from the API - this component only renders the value
// it is given, it never computes a band from a count.
export default function SensoryIndicator({ band, countPerMinute, showCount = true }) {
  const { text, icon } = bandLabel(band);
  const colorClasses = BAND_STYLES[band] ?? BAND_STYLES.NO_DATA;

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-semibold ${colorClasses}`}
      >
        <BandIcon shape={icon} />
        {text}
      </span>
      {showCount && countPerMinute != null && (
        <span className="text-caption text-ink/70">{formatCount(countPerMinute)}</span>
      )}
    </span>
  );
}
