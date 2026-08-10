import RouteCard from './RouteCard.jsx';

const GRID_COLS = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
};

// Renders the API's route order as-is (contract: recommended route first,
// lowest averageCountPerMinute) - no client-side re-sorting.
export default function RouteComparisonList({ routes, onSelectRoute }) {
  const gridClass = GRID_COLS[Math.min(routes.length, 3)] ?? 'md:grid-cols-3';

  return (
    <ul className={`grid grid-cols-1 gap-4 ${gridClass}`}>
      {routes.map((route) => (
        <li key={route.id}>
          <RouteCard route={route} onSelect={onSelectRoute} />
        </li>
      ))}
    </ul>
  );
}
