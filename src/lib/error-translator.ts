export type ApiErrorCode =
  | 'EMAIL_ALREADY_EXISTS'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'PENSION_NOT_FOUND'
  | 'ROOM_NOT_FOUND'
  | 'REVIEW_NOT_FOUND'
  | 'ALREADY_REVIEWED'
  | 'ALREADY_FAVORITED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'VALIDATION_FAILED'
  | 'CONFLICT'
  | string;

export function translateApiError(
  error: unknown,
  fallbackMessage = 'Ocurrió un error inesperado. Por favor, reintenta en unos instantes.',
): string {
  if (!error) return fallbackMessage;

  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    const errorsList =
      Array.isArray(errorObj.errors) && errorObj.errors.length > 0
        ? errorObj.errors
        : typeof errorObj.details === 'object' &&
            errorObj.details !== null &&
            Array.isArray((errorObj.details as Record<string, unknown>).errors)
          ? (errorObj.details as { errors: unknown[] }).errors
          : undefined;

    if (errorsList && errorsList.length > 0 && typeof errorsList[0] === 'string') {
      return errorsList[0];
    }
  }

  const code =
    typeof error === 'object' && error !== null && 'errorCode' in error
      ? (error as { errorCode: unknown }).errorCode
      : undefined;

  switch (code) {
    case 'EMAIL_ALREADY_EXISTS':
      return 'Este correo ya ha sido registrado. Si ya tienes una cuenta, puedes iniciar sesión.';
    case 'INVALID_CREDENTIALS':
      return 'El correo o la contraseña no coinciden. Por favor revisa los datos e inténtalo de nuevo.';
    case 'FORBIDDEN':
      return 'No tienes permisos para realizar esta acción.';
    case 'PENSION_NOT_FOUND':
    case 'ROOM_NOT_FOUND':
    case 'NOT_FOUND':
      return 'El alojamiento o recurso solicitado ya no está disponible.';
    case 'ALREADY_REVIEWED':
      return 'Ya has publicado una reseña para esta pensión.';
    case 'ALREADY_FAVORITED':
      return 'Esta pensión ya está en tus favoritos.';
    case 'RATE_LIMIT_EXCEEDED':
      return 'Has alcanzado el límite de intentos. Por favor espera unos minutos antes de reintentar.';
    case 'VALIDATION_FAILED': {
      const rawMsg =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: unknown }).message)
          : '';
      if (
        rawMsg &&
        rawMsg.trim() !== '' &&
        rawMsg.toLowerCase() !== 'validation failed' &&
        !rawMsg.toLowerCase().includes('error')
      ) {
        return rawMsg;
      }
      return 'Los datos ingresados no son válidos. Por favor, revisa la información ingresada.';
    }
  }

  const raw =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: unknown }).message)
          : '';

  const lower = raw.toLowerCase();

  if (
    lower.includes('unique constraint') ||
    lower.includes('p2002') ||
    lower.includes('already exists') ||
    lower.includes('conflict') ||
    lower.includes('409')
  ) {
    return 'Este correo ya ha sido registrado. Si ya tienes una cuenta, puedes iniciar sesión.';
  }

  if (
    lower.includes('unauthorized') ||
    lower.includes('invalid credentials') ||
    lower.includes('credenciales')
  ) {
    return 'El correo o la contraseña no coinciden. Por favor revisa los datos e inténtalo de nuevo.';
  }

  if (lower.includes('forbidden') || lower.includes('not have required role')) {
    return 'No tienes permisos de anfitrión para administrar esta pensión.';
  }

  if (lower.includes('not found') || lower.includes('404')) {
    return 'El alojamiento o recurso solicitado ya no está disponible.';
  }

  if (lower.includes('payload too large') || lower.includes('413') || lower.includes('file size')) {
    return 'La imagen seleccionada supera el límite máximo permitido de 5 MB.';
  }

  if (lower.includes('unsupported media') || lower.includes('415') || lower.includes('mime type')) {
    return 'El formato de archivo no es compatible. Por favor sube una imagen JPG, PNG o WEBP.';
  }

  if (
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('econnrefused')
  ) {
    return 'Parece que perdiste la conexión a internet. Revisa tu red y vuelve a intentar.';
  }

  if (lower.includes('password') && lower.includes('8')) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }

  if (raw && raw.length > 5 && raw.length < 200 && !raw.includes('{') && !raw.includes('Error:')) {
    return raw;
  }

  return fallbackMessage;
}
