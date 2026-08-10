import RouteCard from './RouteCard.jsx';

const GRID_COLS = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
};

// Renders the API's route order as-is - no client-side re-sorting. The
// backend ranks by crowd band first, then busiest sensor reading, then
// average (see routeRankingService.js / docs/BACKEND_GAPS.md), so the top
// card is not always the lowest-average route; RouteExposureStats on each
// card shows average, peak and sensor coverage so that's visible rather
// than hidden behind a single number.
export default function RouteComparisonList({ routes, decision, onSelectRoute }) {
  const gridClass = GRID_COLS[Math.min(routes.length, 3)] ?? 'md:grid-cols-3';

  return (
    <ul className={`grid grid-cols-1 gap-4 ${gridClass}`}>
      {routes.map((route) => (
        <li key={route.routeId} className="h-full">
          <RouteCard
            route={route}
            reason={route.recommended ? decision?.message : null}
            onSelect={onSelectRoute}
          />
        </li>
      ))}
    </ul>
  );
}
