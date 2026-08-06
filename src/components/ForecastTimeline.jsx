import SensoryIndicator from './SensoryIndicator.jsx';

// "Now" is drawn as a solid filled bar; predicted bars are outlined and
// tagged "est." - the legend spells the distinction out in words too, so
// it never rests on fill alone (AC 2.2.1: visually distinguished from live
// readings, and predictions always labelled as estimates).
export default function ForecastTimeline({ timeline, liveCount }) {
  const maxValue = Math.max(liveCount ?? 0, ...timeline.map((point) => point.predictedCount), 1);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 text-sm text-ink/70">
        {liveCount != null && (
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-3 w-3 rounded-sm bg-accent" />
            Now (live)
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-3 w-3 rounded-sm border-2 border-dashed border-ink/50"
          />
          Estimated
        </span>
      </div>

      <div className="mt-3 flex h-40 items-end gap-3" aria-hidden="true">
        {liveCount != null && (
          <div className="flex flex-1 flex-col items-center justify-end gap-1">
            <div
              className="w-full rounded-t bg-accent"
              style={{ height: `${Math.max((liveCount / maxValue) * 100, 4)}%` }}
            />
            <span className="text-xs font-medium text-ink">Now</span>
          </div>
        )}
        {timeline.map((point) => (
          <div
            key={point.minutesAhead}
            className="flex flex-1 flex-col items-center justify-end gap-1"
          >
            <div
              className="w-full rounded-t border-2 border-dashed border-ink/50 bg-ink/5"
              style={{ height: `${Math.max((point.predictedCount / maxValue) * 100, 4)}%` }}
            />
            <span className="text-xs text-ink/60">+{point.minutesAhead}m</span>
          </div>
        ))}
      </div>

      <ul className="mt-3 space-y-1">
        {liveCount != null && (
          <li className="flex items-center justify-between gap-2 text-sm">
            <span className="font-medium text-ink">Now (live)</span>
            <span className="text-ink">{liveCount} counts / min</span>
          </li>
        )}
        {timeline.map((point) => (
          <li key={point.minutesAhead} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-ink/70">In {point.minutesAhead} minutes (est.)</span>
            <SensoryIndicator band={point.band} countPerMinute={point.predictedCount} />
          </li>
        ))}
      </ul>
    </div>
  );
}
