import { request } from './client.js';

export function getRefuges({ lat, lng, types }) {
  return request('/api/refuges', {
    params: {
      lat,
      lng,
      types: types && types.length ? types.join(',') : undefined,
    },
  });
}
