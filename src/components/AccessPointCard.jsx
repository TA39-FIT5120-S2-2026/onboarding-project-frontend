import { TrainFront, TramFront } from 'lucide-react';
import { formatDistance } from '../utils/format.js';

const MODE = {
  train: { label: 'Train', icon: TrainFront },
  tram: { label: 'Tram', icon: TramFront },
};

export default function AccessPointCard({ label, accessPoint }) {
  const mode = accessPoint
    ? (MODE[accessPoint.mode] ?? { label: accessPoint.mode, icon: TrainFront })
    : null;

  return (
    <div className="rounded-lg border border-ink/10 bg-white px-3.5 py-3">
      <p className="text-micro font-semibold uppercase tracking-wide text-ink/60">{label}</p>
      {accessPoint ? (
        <p className="mt-1 flex items-center gap-1.5 text-caption text-ink">
          <mode.icon className="h-4 w-4 flex-shrink-0 text-accent" aria-hidden="true" />
          {mode.label} · {accessPoint.name} · {formatDistance(accessPoint.distanceMetres)}
        </p>
      ) : (
        <p className="mt-1 text-caption text-ink/70">No tram or train stop within 300 m</p>
      )}
    </div>
  );
}
