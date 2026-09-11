export type ApiSuccess<T> = {
  status: 'success';
  data: T;
  statusCode: number;
};

export type ApiErrorType =
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'CONFLICT_ERROR'
  | 'UNKNOWN_ERROR';

export type ApiError = {
  status: 'error';
  message: string;
  statusCode: number;
  errorType: ApiErrorType;
  details?: unknown;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.status === 'success';
}

export function isApiError<T>(response: ApiResponse<T>): response is ApiError {
  return response.status === 'error';
}

export function createSuccess<T>(data: T, statusCode = 200): ApiSuccess<T> {
  return {
    status: 'success',
    data,
    statusCode,
  };
}

export function createError(
  message: string,
  statusCode = 500,
  errorType: ApiErrorType = 'SERVER_ERROR',
  details?: unknown,
): ApiError {
  return {
    status: 'error',
    message,
    statusCode,
    errorType,
    details,
  };
}
