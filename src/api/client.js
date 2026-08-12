import { resolveFixture } from './__fixtures__/index.js';

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const USE_FIXTURES = import.meta.env.VITE_USE_FIXTURES === 'true';
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const FIXTURE_DELAY_MS = 250;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function request(path, { method = 'GET', body } = {}) {
  if (USE_FIXTURES) {
    await delay(FIXTURE_DELAY_MS);
    const result = resolveFixture(path, body);
    if (result.error) {
      throw new ApiError(result.error.message, result.error.status, result.error.data ?? null);
    }
    return result.data;
  }

  const url = new URL(path, BASE_URL || window.location.origin);
  const response = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let payload;

  try {
    payload = await response.json();
  } catch {
    throw new ApiError(
      response.ok
        ? 'The server returned an invalid response.'
        : 'Something went wrong.',
      response.status,
    );
  }

  if (!response.ok || payload?.success === false) {
    throw new ApiError(
      payload?.message ?? 'Something went wrong.',
      response.status,
      payload?.data ?? null,
    );
  }

  return payload?.data;
}
