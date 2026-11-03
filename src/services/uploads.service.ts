import { apiFetch, settledBatch, wrapApiResponse } from '@/lib/api-fetch';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type { UploadImageResult } from '@/lib/types';

export async function uploadSingleImage(file: File): Promise<ApiResponse<UploadImageResult>> {
  const formData = new FormData();
  formData.append('file', file);

  const result = await apiFetch.POST('/uploads/images', {
    body: formData as unknown as { file: string },
    bodySerializer(body) {
      return body as unknown as FormData;
    },
  });

  return wrapApiResponse<UploadImageResult>(result, 'Error al subir imagen');
}

export async function uploadImages(formData: FormData): Promise<ApiResponse<{ urls: string[] }>> {
  const files: File[] = [];

  for (const value of formData.values()) {
    if (typeof value !== 'string') {
      files.push(value);
    }
  }

  if (files.length > 1) {
    const uploadPromises = files.map((file) => uploadSingleImage(file));
    const batch = await settledBatch<UploadImageResult>(uploadPromises);

    if (batch.allSucceeded) {
      const urls = batch.successes
        .map((res) => res.url)
        .filter((url): url is string => Boolean(url));
      return createSuccess<{ urls: string[] }>({ urls });
    }

    if (batch.errors.length > 0) {
      return batch.errors[0];
    }
  }

  const singleFile = files[0];
  if (singleFile) {
    const singleRes = await uploadSingleImage(singleFile);
    if (isApiSuccess(singleRes)) {
      return createSuccess<{ urls: string[] }>(
        { urls: [singleRes.data.url] },
        singleRes.statusCode,
      );
    }
    return singleRes;
  }

  const result = await apiFetch.POST('/uploads/images', {
    body: formData as unknown as { file: string },
    bodySerializer(body) {
      return body as unknown as FormData;
    },
  });
  const res = wrapApiResponse<UploadImageResult>(result, 'Error al subir imagen');
  if (isApiSuccess(res)) {
    return createSuccess<{ urls: string[] }>({ urls: [res.data.url] }, res.statusCode);
  }
  return res;
}

export async function uploadMultipleFiles(files: File[]): Promise<ApiResponse<{ urls: string[] }>> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('file', file);
  }
  return uploadImages(formData);
}

export const uploadsService = {
  uploadImages,
  uploadSingleImage,
  uploadMultipleFiles,
};
