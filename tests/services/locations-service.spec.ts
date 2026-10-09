import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as apiClient from '@/lib/api-client-base';
import { createError, createSuccess, isApiSuccess } from '@/lib/api-response';
import { locationsService } from '@/services/locations.service';
import * as universitiesService from '@/services/universities.service';

describe('locationsService.fetchCities', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch cities from /cities endpoint with absolute pension counts', async () => {
    vi.spyOn(apiClient, 'apiFetch').mockResolvedValue(
      createSuccess([
        {
          id: 'santiago',
          name: 'Santiago',
          pensionsCount: 35,
          latitude: -33.45,
          longitude: -70.66,
        },
        {
          id: 'concepcion',
          name: 'Concepción',
          pensionsCount: 25,
          latitude: -36.82,
          longitude: -73.05,
        },
      ]),
    );

    const result = await locationsService.fetchCities();

    expect(apiClient.apiFetch).toHaveBeenCalledWith('/cities', { method: 'GET' });
    expect(isApiSuccess(result)).toBe(true);
    if (isApiSuccess(result)) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toMatchObject({
        id: 'santiago',
        name: 'Santiago',
        pensionsCount: 35,
        latitude: -33.45,
        longitude: -70.66,
      });
      expect(result.data[1]).toMatchObject({
        id: 'concepcion',
        name: 'Concepción',
        pensionsCount: 25,
        latitude: -36.82,
        longitude: -73.05,
      });
    }
  });

  it('should fallback to universities when /cities returns empty or fails', async () => {
    vi.spyOn(apiClient, 'apiFetch').mockResolvedValue(createError('Not found', 404));
    vi.spyOn(universitiesService, 'fetchUniversities').mockResolvedValue(
      createSuccess([
        {
          id: 'uni-1',
          name: 'Universidad de Chile',
          acronym: 'UCHILE',
          city: 'Santiago',
          latitude: -33.45,
          longitude: -70.66,
          imageUrl: 'https://example.com/uchile.webp',
        },
      ]),
    );

    const result = await locationsService.fetchCities();

    expect(universitiesService.fetchUniversities).toHaveBeenCalled();
    expect(isApiSuccess(result)).toBe(true);
    if (isApiSuccess(result)) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Santiago');
      expect(result.data[0].pensionsCount).toBe(0);
    }
  });
});
