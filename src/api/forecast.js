import { request } from './client.js';

export function getForecast({ lat, lng }) {
  const query = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  });

  return request(`/api/forecast?${query.toString()}`);
}
