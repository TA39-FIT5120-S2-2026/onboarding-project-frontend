import { CBD_PLACES } from '../data/cbdPlaces.js';
import FieldError from './FieldError.jsx';

// Native <input list> + <datalist> combobox: keyboard operable and
// screen-reader friendly out of the box, without hand-rolling the
// WAI-ARIA combobox pattern (the single most error-prone pattern to
// get right by hand).
export default function PlaceCombobox({ id, label, value, onChange, error, hint }) {
  const listId = `${id}-options`;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <label htmlFor={id} className="block text-caption font-semibold text-ink">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="mt-0.5 text-micro text-ink/60">
          {hint}
        </p>
      )}
      <input
        id={id}
        type="text"
        list={listId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className="mt-1.5 w-full rounded-lg border border-ink/20 bg-white px-3.5 py-3 text-body text-ink placeholder:text-ink/40"
      />
      <datalist id={listId}>
        {CBD_PLACES.map((place) => (
          <option key={place.id} value={place.name} />
        ))}
      </datalist>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
