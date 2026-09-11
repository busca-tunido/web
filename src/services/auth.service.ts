import { apiFetch } from '@/lib/api-client-base';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type { AuthSessionDto, LoginDto, RegisterDto, UserProfileDto } from '@/types/api-contracts';

type RawAuthResponse = {
  accessToken?: string;
  token?: string;
  user: AuthSessionDto['user'];
};

export async function registerUser(payload: RegisterDto): Promise<ApiResponse<AuthSessionDto>> {
  const response = await apiFetch<RawAuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (isApiSuccess(response)) {
    const token = response.data.accessToken ?? response.data.token ?? '';
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('tunido_token', token);
        localStorage.setItem('tunido_user', JSON.stringify(response.data.user));
        sessionStorage.removeItem('tunido_guest');
      } catch {}
    }
    return createSuccess<AuthSessionDto>(
      {
        token,
        user: response.data.user,
      },
      response.statusCode,
    );
  }

  return response;
}

export async function loginWithCredentials(
  payload: LoginDto,
): Promise<ApiResponse<AuthSessionDto>> {
  const response = await apiFetch<RawAuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (isApiSuccess(response)) {
    const token = response.data.accessToken ?? response.data.token ?? '';
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('tunido_token', token);
        localStorage.setItem('tunido_user', JSON.stringify(response.data.user));
        sessionStorage.removeItem('tunido_guest');
      } catch {}
    }
    return createSuccess<AuthSessionDto>(
      {
        token,
        user: response.data.user,
      },
      response.statusCode,
    );
  }

  return response;
}

export async function getCurrentUserProfile(): Promise<ApiResponse<UserProfileDto>> {
  return apiFetch<UserProfileDto>('/auth/me', {
    method: 'GET',
  });
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
  } catch {}
}

export const authService = {
  registerUser,
  loginWithCredentials,
  getCurrentUserProfile,
  checkEmailExists,
  logoutSession,
};
