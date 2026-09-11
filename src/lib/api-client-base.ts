import {
  type ApiError,
  type ApiResponse,
  createError,
  createSuccess,
  isApiSuccess,
} from './api-response';

const envApiBase = process.env.NEXT_PUBLIC_API_URL;
if (!envApiBase) {
  throw new Error('Missing env var: NEXT_PUBLIC_API_URL must be defined in environment (.env).');
}
export const API_BASE_URL: string = envApiBase;

export type RequestConfig = RequestInit & {
  timeoutMs?: number;
};

export type SettledBatchResult<T> = {
  successes: T[];
  errors: ApiError[];
  allSucceeded: boolean;
};

function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return localStorage.getItem('tunido_token');
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  endpoint: string,
  config: RequestConfig = {},
): Promise<ApiResponse<T>> {
  const { timeoutMs = 10000, headers, ...restConfig } = config;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const requestHeaders = new Headers(headers);
  const token = getAuthToken();

  if (token && !requestHeaders.has('Authorization')) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  if (!(restConfig.body instanceof FormData) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const targetUrl = `${API_BASE_URL.replace(/\/+$/, '')}${normalizedEndpoint}`;

  try {
    const response = await fetch(targetUrl, {
      ...restConfig,
      headers: requestHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const responseData = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const statusCode = response.status;
      let errorType: ApiError['errorType'] = 'SERVER_ERROR';

      if (statusCode === 400) {
        errorType = 'VALIDATION_ERROR';
      } else if (statusCode === 401) {
        errorType = 'UNAUTHORIZED';
      } else if (statusCode === 403) {
        errorType = 'FORBIDDEN';
      } else if (statusCode === 404) {
        errorType = 'NOT_FOUND';
      } else if (statusCode === 409) {
        errorType = 'CONFLICT_ERROR';
      }

      const message =
        typeof responseData === 'object' && responseData !== null && 'message' in responseData
          ? String(responseData.message)
          : response.statusText || 'Error en la petición';

      return createError(message, statusCode, errorType, responseData);
    }

    const payload =
      typeof responseData === 'object' && responseData !== null && 'data' in responseData
        ? (responseData.data as T)
        : (responseData as T);

    return createSuccess<T>(payload, response.status);
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof DOMException && error.name === 'AbortError') {
      return createError(
        'La solicitud tardó demasiado tiempo en responder. Intenta de nuevo.',
        408,
        'NETWORK_ERROR',
      );
    }

    const message =
      error instanceof Error ? error.message : 'No pudimos conectar con el servidor de BuscaTuNido';

    return createError(message, 0, 'NETWORK_ERROR', error);
  }
}

export async function settledBatch<T>(
  promises: Promise<ApiResponse<T>>[],
): Promise<SettledBatchResult<T>> {
  const settled = await Promise.allSettled(promises);
  const successes: T[] = [];
  const errors: ApiError[] = [];

  for (const item of settled) {
    if (item.status === 'fulfilled') {
      if (isApiSuccess(item.value)) {
        successes.push(item.value.data);
      } else {
        errors.push(item.value);
      }
    } else {
      errors.push(
        createError(
          item.reason instanceof Error ? item.reason.message : 'Error en petición concurrente',
          0,
          'NETWORK_ERROR',
          item.reason,
        ),
      );
    }
  }

  return {
    successes,
    errors,
    allSucceeded: errors.length === 0,
  };
}
