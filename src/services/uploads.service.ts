import { apiFetch, settledBatch } from '@/lib/api-client-base';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type { UploadImageResult } from '@/types/api-contracts';

export async function uploadSingleImage(file: File): Promise<ApiResponse<UploadImageResult>> {
  const formData = new FormData();
  formData.append('file', file);

  return apiFetch<UploadImageResult>('/uploads/images', {
    method: 'POST',
    body: formData,
  });
}

export async function uploadImages(formData: FormData): Promise<ApiResponse<{ urls: string[] }>> {
  const files: File[] = [];

  for (const value of formData.values()) {
    if (typeof value !== 'string') {
      files.push(value);
    }
  }

  if (files.length > 1) {
    const uploadPromises = files.map((file) => {
      const singleFd = new FormData();
      singleFd.append('file', file);
      return apiFetch<UploadImageResult>('/uploads/images', {
        method: 'POST',
        body: singleFd,
      });
    });

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

  const payload =
    files.length === 1 && !formData.has('file')
      ? (() => {
          const singleFd = new FormData();
          singleFd.append('file', files[0]);
          return singleFd;
        })()
      : formData;

  const response = await apiFetch<UploadImageResult | { urls?: string[] }>('/uploads/images', {
    method: 'POST',
    body: payload,
  });

  if (isApiSuccess(response)) {
    if ('urls' in response.data && Array.isArray(response.data.urls)) {
      return createSuccess<{ urls: string[] }>({ urls: response.data.urls }, response.statusCode);
    }

    const single = response.data as UploadImageResult;
    const urls = single.url ? [single.url] : [];
    return createSuccess<{ urls: string[] }>({ urls }, response.statusCode);
  }

  return response;
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
