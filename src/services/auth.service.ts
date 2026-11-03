import { apiFetch, wrapApiResponse } from '@/lib/api-fetch';
import { type ApiResponse, createError, createSuccess } from '@/lib/api-response';
import type { CheckEmailResponseDto, LoginDto, RegisterDto, UserProfileDto } from '@/lib/types';

export type AuthSessionDto = {
  token: string;
  accessToken?: string;
  user: UserProfileDto;
};

export async function registerUser(payload: RegisterDto): Promise<ApiResponse<AuthSessionDto>> {
  try {
    const res = await fetch('/api/auth/session/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const raw = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      return createError(
        typeof raw.message === 'string' ? raw.message : 'Error al registrar usuario',
        res.status,
      );
    }

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
    const user = (nested?.user ?? raw?.user) as UserProfileDto;

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
        accessToken: token,
        user,
      },
      res.status,
    );
  } catch (error) {
    return createError('Error de red al registrar usuario', 0, 'NETWORK_ERROR', error);
  }
}

export async function loginWithCredentials(
  payload: LoginDto,
): Promise<ApiResponse<AuthSessionDto>> {
  try {
    const res = await fetch('/api/auth/session/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const raw = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      return createError(
        typeof raw.message === 'string' ? raw.message : 'Error al iniciar sesión',
        res.status,
      );
    }

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
    const user = (nested?.user ?? raw?.user) as UserProfileDto;

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
        accessToken: token,
        user,
      },
      res.status,
    );
  } catch (error) {
    return createError('Error de red al iniciar sesión', 0, 'NETWORK_ERROR', error);
  }
}

export async function getCurrentUserProfile(): Promise<
  ApiResponse<UserProfileDto & { token?: string }>
> {
  try {
    const res = await fetch('/api/auth/session/me', {
      method: 'GET',
    });
    const raw = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      return createError(
        typeof raw.message === 'string' ? raw.message : 'Error al obtener sesión',
        res.status,
      );
    }
    const data = (raw.data ?? raw) as UserProfileDto & { token?: string };
    if (typeof window !== 'undefined' && data?.id) {
      try {
        localStorage.setItem('tunido_user', JSON.stringify(data));
        if (data.token) {
          localStorage.setItem('tunido_token', data.token);
        }
        sessionStorage.removeItem('tunido_guest');
      } catch {}
    }
    return createSuccess(data, res.status);
  } catch (error) {
    return createError('Error de red al obtener sesión', 0, 'NETWORK_ERROR', error);
  }
}

export async function checkEmailExists(email: string): Promise<ApiResponse<CheckEmailResponseDto>> {
  const result = await apiFetch.GET('/auth/check-email', {
    params: {
      query: { email: email.trim().toLowerCase() },
    },
  });
  return wrapApiResponse<CheckEmailResponseDto>(result, 'Error al verificar correo');
}

export async function logoutSession(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.removeItem('tunido_token');
    localStorage.removeItem('tunido_user');
    localStorage.removeItem('tunido_favs');
    sessionStorage.removeItem('tunido_guest');
    await fetch('/api/auth/session/logout', {
      method: 'POST',
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export const authService = {
  registerUser,
  loginWithCredentials,
  getCurrentUserProfile,
  checkEmailExists,
  logoutSession,
};
