const MAX_RAW_FILE_SIZE = 25 * 1024 * 1024;
const MAX_UPLOAD_FILE_SIZE = 8 * 1024 * 1024;
const MAX_DIMENSION = 1920;

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/heic',
  'image/gif',
]);

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No se seleccionó ningún archivo.' };
  }

  const fileType = file.type.toLowerCase();
  if (fileType && !ALLOWED_TYPES.has(fileType)) {
    return {
      valid: false,
      error: 'Formato no compatible. Solo se permiten imágenes JPEG, PNG, WebP, AVIF o GIF.',
    };
  }

  if (file.size > MAX_RAW_FILE_SIZE) {
    return {
      valid: false,
      error:
        'La imagen es demasiado pesada (máximo 25 MB). Por favor elige una imagen más pequeña.',
    };
  }

  return { valid: true };
}

export async function prepareImageForUpload(file: File): Promise<File> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (typeof window === 'undefined') {
    return file;
  }

  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    if (file.size > MAX_UPLOAD_FILE_SIZE) {
      throw new Error('El archivo supera el tamaño máximo permitido de 8 MB.');
    }
    return file;
  }

  if (file.size < 1.5 * 1024 * 1024) {
    return file;
  }

  try {
    const objectUrl = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = (e) => reject(e);
      image.src = objectUrl;
    });

    URL.revokeObjectURL(objectUrl);

    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      if (width > height) {
        height = Math.round((height * MAX_DIMENSION) / width);
        width = MAX_DIMENSION;
      } else {
        width = Math.round((width * MAX_DIMENSION) / height);
        height = MAX_DIMENSION;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return file;
    }

    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.85);
    });

    if (blob && blob.size < file.size) {
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
    }

    if (file.size > MAX_UPLOAD_FILE_SIZE) {
      throw new Error('La imagen optimizada supera el límite de 8 MB. Selecciona otra foto.');
    }

    return file;
  } catch (err) {
    if (err instanceof Error && err.message.includes('8 MB')) {
      throw err;
    }
    if (file.size > MAX_UPLOAD_FILE_SIZE) {
      throw new Error('La imagen supera el límite de 8 MB permitidos.');
    }
    return file;
  }
}
