import { formatDistance } from '../utils/format.js';

const MODE_LABELS = {
  train: 'Train',
  tram: 'Tram',
};

export default function AccessPointCard({ label, accessPoint }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white px-3 py-2">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/60">{label}</p>
      {accessPoint ? (
        <p className="text-sm text-ink">
          {MODE_LABELS[accessPoint.mode] ?? accessPoint.mode} · {accessPoint.name} ·{' '}
          {formatDistance(accessPoint.distanceMetres)}
        </p>
      ) : (
        <p className="text-sm text-ink/70">No tram or train stop within 300 m</p>
      )}
    </div>
  );
}
