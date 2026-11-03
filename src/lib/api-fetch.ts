import createClient, { type Middleware } from 'openapi-fetch';
import { env } from '@/env';
import {
  type ApiError,
  type ApiResponse,
  createError,
  createSuccess,
  isApiSuccess,
} from './api-response';
import type { components, paths } from './api-schema';

export const API_BASE_URL: string = env.NEXT_PUBLIC_API_URL;

export type SettledBatchResult<T> = {
  successes: T[];
  errors: ApiError[];
  allSucceeded: boolean;
};

export function formatFriendlyErrorMessage(statusCode: number, rawMessage?: string): string {
  if (statusCode >= 500) {
    return 'Hubo un inconveniente con el servidor. Por favor, intenta de nuevo más tarde.';
  }

  if (statusCode === 401) {
    return 'Credenciales incorrectas. Verifica tu correo y contraseña.';
  }

  if (statusCode === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }

  if (statusCode === 404) {
    return 'El recurso solicitado no fue encontrado.';
  }

  if (statusCode === 409) {
    if (
      rawMessage?.toLowerCase().includes('email') ||
      rawMessage?.toLowerCase().includes('correo')
    ) {
      return 'Ya existe una cuenta registrada con este correo electrónico.';
    }
    if (
      rawMessage?.toLowerCase().includes('review') ||
      rawMessage?.toLowerCase().includes('reseña')
    ) {
      return 'Ya has publicado una reseña para esta pensión.';
    }
    return 'Ya existe un registro con estos datos.';
  }

  if (statusCode === 400) {
    if (
      rawMessage &&
      !rawMessage.includes('\n') &&
      !rawMessage.includes('{') &&
      rawMessage.length < 120 &&
      !rawMessage.toLowerCase().includes('error')
    ) {
      return rawMessage;
    }
    return 'Los datos ingresados no son válidos. Por favor, revisa la información ingresada.';
  }

  if (
    rawMessage &&
    !rawMessage.includes('\n') &&
    !rawMessage.includes('{') &&
    rawMessage.length < 100
  ) {
    return rawMessage;
  }

  return 'Ocurrió un error inesperado al procesar la solicitud.';
}

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('tunido_token');
        if (token && !request.headers.has('Authorization')) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      } catch {}
    }
    return request;
  },
  async onResponse({ response }) {
    if (response.status === 401 && typeof window !== 'undefined') {
      try {
        localStorage.removeItem('tunido_token');
        localStorage.removeItem('tunido_user');
        localStorage.removeItem('tunido_favs');
        window.dispatchEvent(new CustomEvent('tunido_auth_unauthorized'));
      } catch {}
    }
    return response;
  },
};

export const apiFetch = createClient<paths>({
  baseUrl: API_BASE_URL,
});

apiFetch.use(authMiddleware);

export function wrapApiResponse<T>(
  result: {
    readonly data?: unknown;
    readonly error?: unknown;
    readonly response: Response;
  },
  defaultErrorMessage = 'Ocurrió un error inesperado al procesar la solicitud.',
): ApiResponse<T> {
  if (result.error || !result.data || !result.response.ok) {
    const errorEnvelope = result.error as components['schemas']['ErrorEnvelopeDto'] | undefined;
    const statusCode = result.response.status || errorEnvelope?.statusCode || 500;
    const rawMessage = errorEnvelope?.message || result.response.statusText;
    const message = formatFriendlyErrorMessage(statusCode, rawMessage) || defaultErrorMessage;

    let errorType: ApiError['errorType'] = 'SERVER_ERROR';
    if (statusCode === 400) errorType = 'VALIDATION_ERROR';
    else if (statusCode === 401) errorType = 'UNAUTHORIZED';
    else if (statusCode === 403) errorType = 'FORBIDDEN';
    else if (statusCode === 404) errorType = 'NOT_FOUND';
    else if (statusCode === 409) errorType = 'CONFLICT_ERROR';

    return createError(message, statusCode, errorType, result.error);
  }

  const envelope = result.data as { readonly data?: unknown } | null | undefined;
  const payload = (
    envelope && typeof envelope === 'object' && 'data' in envelope ? envelope.data : envelope
  ) as T;

  return createSuccess<T>(payload, result.response.status);
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

export { createClient };
