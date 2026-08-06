import { REFUGE_CATEGORY_PATHS } from '../utils/refugeCategories.js';

export default function RefugeIcon({ category, className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden="true">
      <path d={REFUGE_CATEGORY_PATHS[category] ?? REFUGE_CATEGORY_PATHS.quiet_space} />
    </svg>
  );
}
