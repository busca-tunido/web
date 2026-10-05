import { apiFetch } from '@/lib/api-client-base';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type { AuthSessionDto, LoginDto, RegisterDto, UserProfileDto } from '@/types/api-contracts';

type RawAuthResponse = {
  accessToken?: string;
  token?: string;
  user: AuthSessionDto['user'];
};

export async function registerUser(payload: RegisterDto): Promise<ApiResponse<AuthSessionDto>> {
  const response = await apiFetch<RawAuthResponse>('/api/auth/session/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (isApiSuccess(response)) {
    const raw = response.data as unknown as Record<string, unknown>;
    const nested =
      raw && typeof raw === 'object' && 'data' in raw && raw.data
        ? (raw.data as Record<string, unknown>)
        : raw;
    const token =
      (nested?.accessToken as string) ??
      (nested?.token as string) ??
      (raw?.accessToken as string) ??
      (raw?.token as string) ??
      '';
    const user = (nested?.user ?? raw?.user) as AuthSessionDto['user'];

    if (typeof window !== 'undefined' && user) {
      try {
        localStorage.setItem('tunido_token', token);
        localStorage.setItem('tunido_user', JSON.stringify(user));
        sessionStorage.removeItem('tunido_guest');
      } catch {}
    }
    return createSuccess<AuthSessionDto>(
      {
        token,
        user,
      },
      response.statusCode,
    );
  }

  return response;
}

export async function loginWithCredentials(
  payload: LoginDto,
): Promise<ApiResponse<AuthSessionDto>> {
  const response = await apiFetch<RawAuthResponse>('/api/auth/session/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (isApiSuccess(response)) {
    const raw = response.data as unknown as Record<string, unknown>;
    const nested =
      raw && typeof raw === 'object' && 'data' in raw && raw.data
        ? (raw.data as Record<string, unknown>)
        : raw;
    const token =
      (nested?.accessToken as string) ??
      (nested?.token as string) ??
      (raw?.accessToken as string) ??
      (raw?.token as string) ??
      '';
    const user = (nested?.user ?? raw?.user) as AuthSessionDto['user'];

    if (typeof window !== 'undefined' && user) {
      try {
        localStorage.setItem('tunido_token', token);
        localStorage.setItem('tunido_user', JSON.stringify(user));
        sessionStorage.removeItem('tunido_guest');
      } catch {}
    }
    return createSuccess<AuthSessionDto>(
      {
        token,
        user,
      },
      response.statusCode,
    );
  }

  return response;
}

export async function getCurrentUserProfile(): Promise<
  ApiResponse<UserProfileDto & { token?: string }>
> {
  const response = await apiFetch<UserProfileDto & { token?: string }>('/api/auth/session/me', {
    method: 'GET',
  });

  if (isApiSuccess(response) && typeof window !== 'undefined' && response.data?.id) {
    try {
      localStorage.setItem('tunido_user', JSON.stringify(response.data));
      if (response.data.token) {
        localStorage.setItem('tunido_token', response.data.token);
      }
      sessionStorage.removeItem('tunido_guest');
    } catch {}
  }

  return response;
}

export async function checkEmailExists(
  email: string,
): Promise<ApiResponse<{ exists: boolean; role?: string }>> {
  return apiFetch<{ exists: boolean; role?: string }>(
    `/auth/check-email?email=${encodeURIComponent(email.trim().toLowerCase())}`,
    {
      method: 'GET',
    },
  );
}

export function logoutSession(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.removeItem('tunido_token');
    localStorage.removeItem('tunido_user');
    sessionStorage.removeItem('tunido_guest');
    fetch('/api/auth/session/logout', { method: 'POST' }).catch(() => {});
  } catch {}
}

export const authService = {
  registerUser,
  loginWithCredentials,
  getCurrentUserProfile,
  checkEmailExists,
  logoutSession,
};
