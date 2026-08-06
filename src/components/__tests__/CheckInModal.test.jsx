import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckInModal from '../CheckInModal.jsx';

function Harness({ onSelect = vi.fn(), onSkip: onSkipProp }) {
  const [isOpen, setIsOpen] = useState(false);
  const onSkip = () => {
    setIsOpen(false);
    onSkipProp?.();
  };
  return (
    <div>
      <button type="button" onClick={() => setIsOpen(true)}>
        Select this route
      </button>
      <CheckInModal isOpen={isOpen} onSelect={onSelect} onSkip={onSkip} />
    </div>
  );
}

describe('CheckInModal (AC 1.3.1, innovation)', () => {
  it('is a labelled, modal dialog with preset options only', () => {
    render(<CheckInModal isOpen onSelect={vi.fn()} onSkip={vi.fn()} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('How are you feeling today?');
    expect(screen.getByRole('button', { name: 'Feeling okay today' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'A bit sensitive today' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Very sensitive today' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('Scenario 1: calls onSelect with the tolerance mapped to the chosen option', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CheckInModal isOpen onSelect={onSelect} onSkip={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Very sensitive today' }));
    expect(onSelect).toHaveBeenCalledWith('LOW');
  });

  it('Scenario 2: Skip is as prominent as the sensitivity options and calls onSkip', async () => {
    const user = userEvent.setup();
    const onSkip = vi.fn();
    render(<CheckInModal isOpen onSelect={vi.fn()} onSkip={onSkip} />);

    const skipButton = screen.getByRole('button', { name: 'Skip' });
    const okayButton = screen.getByRole('button', { name: 'Feeling okay today' });
    expect(skipButton.className).toBe(okayButton.className);

    await user.click(skipButton);
    expect(onSkip).toHaveBeenCalled();
  });

  it('Escape closes the modal and keeps the default (calls onSkip)', async () => {
    const user = userEvent.setup();
    const onSkip = vi.fn();
    render(<CheckInModal isOpen onSelect={vi.fn()} onSkip={onSkip} />);

    await user.keyboard('{Escape}');
    expect(onSkip).toHaveBeenCalled();
  });

  it('moves focus into the modal on open and returns focus to the opener on close', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const opener = screen.getByRole('button', { name: 'Select this route' });
    await user.click(opener);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(document.activeElement).not.toBe(opener);
    expect(document.activeElement?.closest('[role="dialog"]')).not.toBeNull();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(opener);
  });

  it('traps Tab focus inside the modal', async () => {
    const user = userEvent.setup();
    render(<CheckInModal isOpen onSelect={vi.fn()} onSkip={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    const focusables = dialog.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled])',
    );
    const last = focusables[focusables.length - 1];
    last.focus();

    await user.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
  });
});
