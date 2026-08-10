import { request } from './client.js';

function toCoordinate({ lat, lng }) {
  return { latitude: lat, longitude: lng };
}

export function planRoute({ origin, destination, crowdTolerance }) {
  return request('/api/routes/plan', {
    method: 'POST',
    body: {
      origin: toCoordinate(origin),
      destination: toCoordinate(destination),
      crowdTolerance,
    },
  });
}

export function validateRoute({ origin, destination }) {
  return request('/api/routes/validate', {
    method: 'POST',
    body: {
      origin: toCoordinate(origin),
      destination: toCoordinate(destination),
    },
  });
}
