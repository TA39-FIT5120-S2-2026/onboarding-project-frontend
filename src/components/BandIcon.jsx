const SHAPES = {
  circle: <circle cx="8" cy="8" r="6" />,
  triangle: <polygon points="8,2 14,14 2,14" />,
  square: <rect x="3" y="3" width="10" height="10" />,
  dash: <rect x="2" y="7" width="12" height="2" rx="1" />,
};

// Shape, not colour, is what makes a band identifiable in greyscale.
export default function BandIcon({ shape, className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden="true">
      {SHAPES[shape] ?? SHAPES.dash}
    </svg>
  );
}
