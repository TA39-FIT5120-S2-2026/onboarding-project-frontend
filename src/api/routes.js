import { request } from './client.js';

function coord({ lat, lng }) {
  return `${lat},${lng}`;
}

export function getRoutes({ origin, destination, tolerance }) {
  return request('/api/routes', {
    params: {
      origin: coord(origin),
      destination: coord(destination),
      tolerance,
    },
  });
}

export function getRouteDetail(id) {
  return request(`/api/routes/${id}`);
}
