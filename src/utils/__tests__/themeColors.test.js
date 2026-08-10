import { describe, it, expect } from 'vitest';
import { BAND_COLORS } from '../bandLabels.js';
import { BAND_COLORS as THEME_BAND_COLORS } from '../../theme/colors.js';

// bandLabels.js re-exports from theme/colors.js rather than duplicating
// hex values - this pins that down so the two can never silently drift
// apart again (they used to be two separately hand-maintained copies).
describe('band colours stay single-sourced', () => {
  it('bandLabels.BAND_COLORS is exactly theme/colors.js BAND_COLORS', () => {
    expect(BAND_COLORS).toBe(THEME_BAND_COLORS);
  });

  it('every band has a colour', () => {
    ['LOW', 'MEDIUM', 'HIGH', 'NO_DATA'].forEach((band) => {
      expect(BAND_COLORS[band]).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });
});
