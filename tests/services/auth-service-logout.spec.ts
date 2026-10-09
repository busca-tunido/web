import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as logoutRouteHandler } from '@/app/api/auth/session/logout/route';
import { logoutSession } from '@/services/auth.service';

describe('authService.logoutSession', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = 'tunido_role=LANDLORD; path=/';
    document.cookie = 'tunido_token=fake-token; path=/';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('purges storage, clears document cookies and calls session logout with keepalive', async () => {
    localStorage.setItem('tunido_token', 'test-token');
    localStorage.setItem('tunido_user', JSON.stringify({ role: 'LANDLORD' }));
    localStorage.setItem('tunido_favs', JSON.stringify(['pen-1']));
    sessionStorage.setItem('tunido_guest', 'true');

    await logoutSession();

    expect(localStorage.getItem('tunido_token')).toBeNull();
    expect(localStorage.getItem('tunido_user')).toBeNull();
    expect(localStorage.getItem('tunido_favs')).toBeNull();
    expect(sessionStorage.getItem('tunido_guest')).toBeNull();

    expect(fetch).toHaveBeenCalledWith('/api/auth/session/logout', {
      method: 'POST',
      keepalive: true,
    });
  });

  it('logout route handler returns response deleting tunido_token and tunido_role', async () => {
    const response = await logoutRouteHandler();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);

    const tokenCookie = response.cookies.get('tunido_token');
    const roleCookie = response.cookies.get('tunido_role');

    expect(tokenCookie?.maxAge).toBe(0);
    expect(roleCookie?.maxAge).toBe(0);
  });
});
