import { request } from './client.js';

export function getRefuges({ lat, lng, types = [] }) {
  const query = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  });

  if (types.length > 0) {
    query.set('types', types.join(','));
  }

  return request(`/api/refuges?${query.toString()}`);
}
