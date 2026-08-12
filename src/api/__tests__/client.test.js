import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('API client response handling', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_USE_FIXTURES', 'false');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('preserves a structured backend error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          message: 'Invalid coordinates.',
          data: { field: 'origin' },
        }),
      }),
    );
    const { request } = await import('../client.js');

    await expect(request('/api/routes/plan')).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      message: 'Invalid coordinates.',
      data: { field: 'origin' },
    });
  });

  it('turns a non-JSON server failure into an ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      }),
    );
    const { request } = await import('../client.js');

    await expect(request('/api/routes/plan')).rejects.toMatchObject({
      name: 'ApiError',
      status: 502,
      message: 'Something went wrong.',
    });
  });

  it('rejects a malformed successful response instead of throwing a raw parse error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError('Unexpected end of JSON input');
        },
      }),
    );
    const { request } = await import('../client.js');

    await expect(request('/api/routes/plan')).rejects.toMatchObject({
      name: 'ApiError',
      status: 200,
      message: 'The server returned an invalid response.',
    });
  });
});
