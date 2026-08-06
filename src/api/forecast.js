import { request } from './client.js';

export function getForecast({ lat, lng, sensorId }) {
  return request('/api/forecast', {
    params: { lat, lng, sensorId },
  });
}
