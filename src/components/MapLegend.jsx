import Card from './ui/Card.jsx';

// Generic map legend: each entry pairs a small visual swatch (a line
// pattern for route segments, an icon for markers) with its text meaning,
// so every visual distinction on the map is explained in words.
export default function MapLegend({ title = 'Map legend', items }) {
  return (
    <Card padding="sm">
      <p className="text-micro font-semibold uppercase tracking-wide text-ink/60">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-2 text-caption text-ink">
            {item.lineStyle ? (
              <span
                aria-hidden="true"
                className="mt-2 inline-block h-0 w-6 flex-shrink-0"
                style={{
                  borderTopWidth: 3,
                  borderTopColor: item.lineStyle.color,
                  borderTopStyle: item.lineStyle.pattern ?? 'solid',
                }}
              />
            ) : (
              item.icon
            )}
            <span className="min-w-0 break-words">{item.label}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
