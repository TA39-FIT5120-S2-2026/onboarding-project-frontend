import RefugeIcon from './RefugeIcon.jsx';
import { refugeCategoryLabel } from '../utils/refugeCategories.js';

const CATEGORIES = ['park', 'library', 'quiet_space'];

// Chip-style toggle group. The <input> stays real and keyboard-operable
// (just visually hidden with sr-only) so the chip keeps native checkbox
// semantics; has-[:focus-visible] puts the focus ring on the visible chip
// instead of the hidden input.
export default function RefugeFilter({ selected, onChange, counts = {} }) {
  function toggle(category) {
    const next = selected.includes(category)
      ? selected.filter((c) => c !== category)
      : [...selected, category];
    onChange(next);
  }

  return (
    <fieldset>
      <legend className="text-micro font-semibold uppercase tracking-wide text-ink/60">
        Filter by type
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {CATEGORIES.map((category) => {
          const isChecked = selected.includes(category);
          const count = counts[category];
          return (
            <label
              key={category}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-caption font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 ${
                isChecked
                  ? 'border-accent bg-accent text-white'
                  : 'border-ink/20 bg-white text-ink hover:border-accent'
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(category)}
                className="sr-only"
              />
              <RefugeIcon
                category={category}
                className={`h-4 w-4 ${isChecked ? 'text-white' : ''}`}
              />
              {refugeCategoryLabel(category)}
              {count != null && (
                <span className={isChecked ? 'text-white/80' : 'text-ink/50'}>· {count}</span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
