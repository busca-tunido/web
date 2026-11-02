export function translateApiError(
  error: unknown,
  fallbackMessage = 'Ocurrió un error inesperado. Por favor, reintenta en unos instantes.',
): string {
  if (!error) return fallbackMessage;

  const raw =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: unknown }).message)
          : '';

  const lower = raw.toLowerCase();

  if (lower.includes('unique constraint') || lower.includes('p2002') || lower.includes('already exists')) {
    return 'Este correo electrónico ya está registrado. Si ya tienes una cuenta, puedes iniciar sesión.';
  }

  if (lower.includes('unauthorized') || lower.includes('invalid credentials') || lower.includes('credenciales')) {
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

  if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('econnrefused')) {
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
