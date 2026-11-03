import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch } from '@/lib/api-fetch';
import { isApiSuccess } from '@/lib/api-response';
import { locationsService } from '@/services/locations.service';

describe('locationsService.fetchCities', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch cities from /cities endpoint with absolute pension counts', async () => {
    vi.spyOn(apiFetch, 'GET').mockResolvedValue({
      data: {
        success: true,
        statusCode: 200,
        timestamp: '',
        data: [
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
        ],
      },
      error: undefined,
      response: new Response(null, { status: 200 }),
    } as any);

    const result = await locationsService.fetchCities();

    expect(apiFetch.GET).toHaveBeenCalledWith('/cities');
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

  it('should return clean empty state when /cities fails without synthetic fallback', async () => {
    vi.spyOn(apiFetch, 'GET').mockResolvedValue({
      data: undefined,
      error: {
        success: false,
        statusCode: 404,
        timestamp: '',
        path: '/cities',
        message: 'Not found',
        errorCode: 'NOT_FOUND',
      },
      response: new Response(null, { status: 404 }),
    } as any);

    const result = await locationsService.fetchCities();

    expect(isApiSuccess(result)).toBe(true);
    if (isApiSuccess(result)) {
      expect(result.data).toEqual([]);
    }
  });
});
