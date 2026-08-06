import RefugeIcon from './RefugeIcon.jsx';
import { refugeCategoryLabel } from '../utils/refugeCategories.js';

const CATEGORIES = ['park', 'library', 'quiet_space'];

export default function RefugeFilter({ selected, onChange }) {
  function toggle(category) {
    const next = selected.includes(category)
      ? selected.filter((c) => c !== category)
      : [...selected, category];
    onChange(next);
  }

  return (
    <fieldset className="rounded-lg border border-ink/10 bg-white p-3">
      <legend className="px-1 text-xs font-medium uppercase tracking-wide text-ink/60">
        Filter by type
      </legend>
      <div className="mt-1 flex flex-wrap gap-4">
        {CATEGORIES.map((category) => (
          <label key={category} className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={selected.includes(category)}
              onChange={() => toggle(category)}
              className="h-4 w-4 rounded border-ink/30 text-accent"
            />
            <RefugeIcon category={category} />
            {refugeCategoryLabel(category)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
