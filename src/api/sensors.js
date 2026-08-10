import { request } from './client.js';

export function getLatestSensorReadings() {
  return request('/api/sensors/latest');
}
