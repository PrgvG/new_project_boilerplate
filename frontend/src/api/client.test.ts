import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch, apiJson, setOnUnauthorized } from './client';
import { isUser } from '../types/guards';

const mockGetToken = vi.fn();
const mockRemoveToken = vi.fn();

vi.mock('../lib/authStorage', () => ({
  getToken: () => mockGetToken(),
  removeToken: () => mockRemoveToken(),
}));

function createMockResponse(
  init: { ok?: boolean; status?: number; json?: unknown } = {}
): Response {
  const { ok = true, status = 200, json: jsonData = {} } = init;
  return {
    ok,
    status,
    json: () => Promise.resolve(jsonData),
  } as Response;
}

describe('apiFetch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockGetToken.mockReturnValue(null);
    setOnUnauthorized(null);
  });

  it('calls removeToken and onUnauthorized callback on 401', async () => {
    const onUnauthorized = vi.fn();
    setOnUnauthorized(onUnauthorized);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(createMockResponse({ ok: false, status: 401 }))
    );

    await apiFetch('/api/x');

    expect(mockRemoveToken).toHaveBeenCalled();
    expect(onUnauthorized).toHaveBeenCalled();
  });

  it('does not call callback on 401 when setOnUnauthorized was not set', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(createMockResponse({ ok: false, status: 401 }))
    );

    await apiFetch('/api/x');

    expect(mockRemoveToken).toHaveBeenCalled();
    // callback is null, so it should not throw
  });
});

describe('apiJson', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockGetToken.mockReturnValue(null);
  });

  it('returns parsed data when response is ok and guard passes', async () => {
    const data = {
      _id: '1',
      email: 'a@b.com',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(createMockResponse({ ok: true, json: data }))
    );

    const result = await apiJson('/api/user', {}, isUser);

    expect(result).toEqual(data);
  });

  it('throws with error message from body when res.ok is false and body has error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        createMockResponse({
          ok: false,
          status: 400,
          json: { error: 'Invalid email' },
        })
      )
    );

    await expect(apiJson('/api/user', {}, isUser)).rejects.toThrow(
      'Invalid email'
    );
  });

  it('throws Request failed with status when res.ok is false and no error field', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        createMockResponse({
          ok: false,
          status: 500,
          json: {},
        })
      )
    );

    await expect(apiJson('/api/user', {}, isUser)).rejects.toThrow(
      'Request failed: 500'
    );
  });

  it('throws Invalid response shape when guard fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        createMockResponse({
          ok: true,
          json: { invalid: 'shape' },
        })
      )
    );

    await expect(apiJson('/api/user', {}, isUser)).rejects.toThrow(
      'Invalid response shape'
    );
  });
});
