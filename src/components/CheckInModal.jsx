import { useRef } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { CHECK_IN_OPTIONS } from '../utils/tolerance.js';

export default function CheckInModal({ isOpen, onSelect, onSkip, isBusy }) {
  const containerRef = useRef(null);

  useFocusTrap({ isOpen, onClose: onSkip, containerRef });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 md:items-center">
      <button
        type="button"
        aria-label="Close"
        className="fixed inset-0 h-full w-full cursor-default"
        onClick={onSkip}
        tabIndex={-1}
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkin-heading"
        className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-2">
          <h2 id="checkin-heading" className="text-heading-sm text-ink">
            How are you feeling today?
          </h2>
          <button
            type="button"
            onClick={onSkip}
            aria-label="Close check-in"
            className="rounded-full p-1 text-ink/60 hover:bg-ink/5 hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-1 text-caption text-ink/70">
          This helps us choose routes that match your sensitivity right now. Optional.
        </p>

        <div className="mt-4 space-y-2">
          {CHECK_IN_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={isBusy}
              onClick={() => onSelect(option.tolerance)}
              className="w-full rounded-lg border border-ink/15 px-4 py-3 text-left font-medium text-ink hover:border-accent hover:bg-accent/5 disabled:opacity-60"
            >
              {option.label}
            </button>
          ))}
          <button
            type="button"
            disabled={isBusy}
            onClick={onSkip}
            className="w-full rounded-lg border border-ink/15 px-4 py-3 text-left font-medium text-ink hover:border-accent hover:bg-accent/5 disabled:opacity-60"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
