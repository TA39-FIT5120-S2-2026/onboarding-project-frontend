import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlaceCombobox from '../PlaceCombobox.jsx';

function setup(props = {}) {
  const onChange = vi.fn();
  const utils = render(
    <PlaceCombobox id="origin" label="Origin" value="" onChange={onChange} {...props} />,
  );
  return { onChange, ...utils };
}

describe('PlaceCombobox', () => {
  it('is a labelled combobox with an accessible name', () => {
    setup();
    const input = screen.getByRole('combobox', { name: 'Origin' });
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('typing a partial name like "flinders" opens a listbox with a match', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <PlaceCombobox id="origin" label="Origin" value="" onChange={onChange} />,
    );

    await user.type(screen.getByRole('combobox'), 'flinders');
    // Controlled input: re-render with the value the mock onChange would
    // have applied, since userEvent.type fires real onChange events.
    rerender(<PlaceCombobox id="origin" label="Origin" value="flinders" onChange={onChange} />);

    const listbox = await screen.findByRole('listbox');
    expect(listbox).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /flinders street station/i })).toBeInTheDocument();
  });

  it('ArrowDown moves aria-activedescendant onto the first option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <PlaceCombobox id="origin" label="Origin" value="" onChange={onChange} />,
    );

    const input = screen.getByRole('combobox');
    await user.type(input, 'bourke');
    rerender(<PlaceCombobox id="origin" label="Origin" value="bourke" onChange={onChange} />);

    await user.keyboard('{ArrowDown}');

    const activeId = input.getAttribute('aria-activedescendant');
    expect(activeId).toBeTruthy();
    const activeOption = document.getElementById(activeId);
    expect(activeOption).toHaveAttribute('aria-selected', 'true');
  });

  it('Enter on the active option commits it via onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <PlaceCombobox id="origin" label="Origin" value="" onChange={onChange} />,
    );

    const input = screen.getByRole('combobox');
    await user.type(input, 'bourke street mall');
    rerender(
      <PlaceCombobox id="origin" label="Origin" value="bourke street mall" onChange={onChange} />,
    );

    await user.keyboard('{ArrowDown}{Enter}');

    expect(onChange).toHaveBeenLastCalledWith('Bourke Street Mall');
  });

  it('Escape closes the listbox', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <PlaceCombobox id="origin" label="Origin" value="" onChange={onChange} />,
    );

    const input = screen.getByRole('combobox');
    await user.type(input, 'bourke');
    rerender(<PlaceCombobox id="origin" label="Origin" value="bourke" onChange={onChange} />);
    expect(await screen.findByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows an error message linked to the input via aria-describedby', () => {
    setup({ error: 'Enter a location from the suggestions.' });
    expect(screen.getByText('Enter a location from the suggestions.')).toBeInTheDocument();
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')).toContain('origin-error');
  });
});
