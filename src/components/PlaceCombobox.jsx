import { useId, useRef, useState } from 'react';
import { searchPlaces } from '../data/cbdPlaces.js';
import FieldError from './FieldError.jsx';

// Hand-built ARIA 1.2 editable combobox, not <input list>+<datalist>:
// native datalist can't fuzzy-match, can't be styled, exposes no
// aria-activedescendant, and gives no "no matches" state - all three are
// requirements here. This still degrades to a plain text input in a real
// form if JS keyboard handling is ever bypassed; findPlaceByName resolves
// on submit either way.
export default function PlaceCombobox({ id, label, value, onChange, error, hint }) {
  const reactId = useId();
  const listId = `${id}-options`;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const statusId = `${id}-status`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);

  const options = value.trim() ? searchPlaces(value) : [];
  const activeId = activeIndex >= 0 && options[activeIndex] ? `${reactId}-opt-${activeIndex}` : undefined;

  function openWith(nextOptions) {
    setIsOpen(nextOptions.length > 0);
    setActiveIndex(-1);
  }

  function commit(place) {
    onChange(place.name);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleChange(event) {
    const next = event.target.value;
    onChange(next);
    openWith(next.trim() ? searchPlaces(next) : []);
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen && options.length > 0) {
        setIsOpen(true);
        setActiveIndex(0);
        return;
      }
      if (options.length > 0) {
        setActiveIndex((prev) => (prev + 1) % options.length);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (options.length > 0) {
        setActiveIndex((prev) => (prev <= 0 ? options.length - 1 : prev - 1));
      }
      return;
    }

    if (event.key === 'Home' && isOpen && options.length > 0) {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === 'End' && isOpen && options.length > 0) {
      event.preventDefault();
      setActiveIndex(options.length - 1);
      return;
    }

    if (event.key === 'Enter') {
      if (isOpen && activeIndex >= 0 && options[activeIndex]) {
        event.preventDefault();
        commit(options[activeIndex]);
      }
      return;
    }

    if (event.key === 'Escape') {
      if (isOpen) {
        event.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
      } else if (value) {
        onChange('');
      }
      return;
    }

    if (event.key === 'Tab' && isOpen && activeIndex >= 0 && options[activeIndex]) {
      commit(options[activeIndex]);
    }
  }

  function handleBlur() {
    setIsOpen(false);
    setActiveIndex(-1);
  }

  const statusText = !isOpen
    ? ''
    : options.length === 0
      ? 'No matching places'
      : `${options.length} place${options.length === 1 ? '' : 's'} available`;

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
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => openWith(value.trim() ? searchPlaces(value) : [])}
          autoComplete="off"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className="mt-1.5 w-full rounded-lg border border-ink/20 bg-white px-3.5 py-3 text-body text-ink placeholder:text-ink/40"
        />
        {isOpen && options.length > 0 && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-ink/15 bg-white shadow-lg"
          >
            {options.map((place, index) => (
              <li
                key={place.id}
                id={`${reactId}-opt-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                // onMouseDown (not onClick) so the input's blur handler
                // doesn't close the list before the click registers.
                onMouseDown={(event) => {
                  event.preventDefault();
                  commit(place);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`cursor-pointer px-3.5 py-2.5 text-body ${
                  index === activeIndex ? 'bg-accent/10 text-accent' : 'text-ink'
                }`}
              >
                {place.name}
                {(place.nearCbd || place.farFromCbd) && (
                  <span className="ml-1.5 text-micro text-ink/50">outside our coverage area</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p id={statusId} role="status" aria-live="polite" className="sr-only">
        {statusText}
      </p>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
