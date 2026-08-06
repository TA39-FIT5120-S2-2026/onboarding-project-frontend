import { resolveFixture } from './__fixtures__/index.js';

export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

const USE_FIXTURES = import.meta.env.VITE_USE_FIXTURES === 'true';
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const FIXTURE_DELAY_MS = 250;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function request(path, { params } = {}) {
  const query = params
    ? Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    : {};

  if (USE_FIXTURES) {
    await delay(FIXTURE_DELAY_MS);
    const result = resolveFixture(path, query);
    if (result.error) {
      throw new ApiError(result.error.code, result.error.message);
    }
    return result.data;
  }

  const url = new URL(path, BASE_URL || window.location.origin);
  Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url);
  const body = await response.json();

  if (!response.ok) {
    throw new ApiError(
      body.error?.code ?? 'INTERNAL_ERROR',
      body.error?.message ?? 'Something went wrong.',
    );
  }

  return body;
}
