import RouteCard from './RouteCard.jsx';

const GRID_COLS = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
};

// Renders the API's route order as-is (backend: recommended route first,
// lowest averagePedestrianCount, via `rank`) - no client-side re-sorting.
export default function RouteComparisonList({ routes, decision, onSelectRoute }) {
  const gridClass = GRID_COLS[Math.min(routes.length, 3)] ?? 'md:grid-cols-3';

  return (
    <ul className={`grid grid-cols-1 gap-4 ${gridClass}`}>
      {routes.map((route) => (
        <li key={route.routeId}>
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
