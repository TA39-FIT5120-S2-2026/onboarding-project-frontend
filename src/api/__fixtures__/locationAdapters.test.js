import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../client.js', () => ({ request: vi.fn() }));

import { request } from '../client.js';
import { getRefuges } from '../refuges.js';
import { getForecast } from '../forecast.js';

describe('location API adapters', () => {
  beforeEach(() => request.mockReset());

  it('sends refuge coordinates and selected categories', async () => {
    request.mockResolvedValue({ refuges: [], searchRadiusMetres: 500 });
    await getRefuges({
      lat: -37.8136,
      lng: 144.9648,
      types: ['park', 'library'],
    });
    expect(request).toHaveBeenCalledWith(
      '/api/refuges?lat=-37.8136&lng=144.9648&types=park%2Clibrary',
    );
  });

  it('sends forecast coordinates', async () => {
    request.mockResolvedValue({ sufficientHistory: false });
    await getForecast({ lat: -37.8103, lng: 144.9628 });
    expect(request).toHaveBeenCalledWith('/api/forecast?lat=-37.8103&lng=144.9628');
  });
});
