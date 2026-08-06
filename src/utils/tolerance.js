import { bandRank } from './bandLabels';

export const TOLERANCE_LEVELS = ['LOW', 'MEDIUM', 'HIGH'];

export const DEFAULT_TOLERANCE = 'MEDIUM';

export const CHECK_IN_OPTIONS = [
  { id: 'okay', label: 'Feeling okay today', tolerance: 'HIGH' },
  { id: 'bit-sensitive', label: 'A bit sensitive today', tolerance: 'MEDIUM' },
  { id: 'very-sensitive', label: 'Very sensitive today', tolerance: 'LOW' },
];

export function exceedsTolerance(band, tolerance) {
  return bandRank(band) > bandRank(tolerance);
}
