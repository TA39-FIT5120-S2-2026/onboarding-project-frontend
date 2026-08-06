import { describe, it, expect } from 'vitest';
import { BAND_LABELS, bandLabel, bandRank } from '../bandLabels.js';

describe('bandLabels', () => {
  it('gives every band a distinct text label and icon shape (never colour alone)', () => {
    const shapes = new Set(Object.values(BAND_LABELS).map((b) => b.icon));
    const texts = new Set(Object.values(BAND_LABELS).map((b) => b.text));
    expect(shapes.size).toBe(4);
    expect(texts.size).toBe(4);
  });

  it('NO_DATA is never rendered with the Low label or icon', () => {
    expect(bandLabel('NO_DATA').text).not.toBe('Low');
    expect(bandLabel('NO_DATA').icon).not.toBe(BAND_LABELS.LOW.icon);
  });

  it('ranks bands LOW < MEDIUM < HIGH for tolerance comparisons', () => {
    expect(bandRank('LOW')).toBeLessThan(bandRank('MEDIUM'));
    expect(bandRank('MEDIUM')).toBeLessThan(bandRank('HIGH'));
  });

  it('falls back to the NO_DATA label for an unrecognised band', () => {
    expect(bandLabel(undefined)).toEqual(BAND_LABELS.NO_DATA);
  });
});
