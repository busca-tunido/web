import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createError, createSuccess } from '@/lib/api-response';
import type { CityInfo, UniversityInfo } from '@/lib/types';
import { useStudentPensionsFeed } from '@/hooks/use-student-pensions-feed';
import { locationsService } from '@/services/locations.service';
import { pensionsService } from '@/services/pensions.service';

const MOCK_TEST_CITIES: CityInfo[] = [
  {
    id: 'c1',
    name: 'Santiago',
    region: 'Metropolitana',
    foreignStudentRate: 0.12,
    pensionsCount: 45,
    averagePriceClp: 320000,
    imageUrl: 'https://img.test/santiago.jpg',
    latitude: -33.4489,
    longitude: -70.6693,
  },
  {
    id: 'c2',
    name: 'Viña del Mar',
    region: 'Valparaíso',
    foreignStudentRate: 0.18,
    pensionsCount: 38,
    averagePriceClp: 290000,
    imageUrl: 'https://img.test/vina.jpg',
    latitude: -33.0245,
    longitude: -71.5518,
  },
];

const MOCK_TEST_UNIVERSITIES: UniversityInfo[] = [
  {
    id: 'u1',
    name: 'Universidad de Chile',
    acronym: 'UCHILE',
    city: 'Santiago',
    domains: ['uchile.cl'],
    foreignStudentRate: 0.15,
    pensionsNearbyCount: 20,
    imageUrl: 'https://img.test/uchile.jpg',
    latitude: -33.444,
    longitude: -70.655,
  },
];

const MOCK_TEST_PENSION_DTO = {
  id: 'pen-1',
  title: 'Pensión Universitaria Bellavista',
  description: 'Excelente ambiente',
  address: 'Pío Nono 123',
  neighborhood: 'Bellavista',
  city: 'Santiago',
  latitude: -33.432,
  longitude: -70.635,
  baseMonthlyPrice: 280000,
  deposit: 100000,
  averageRating: 4.8,
  ratingAverage: 4.8,
  reviewsCount: 12,
  verificationStatus: 'OFFICIALLY_VERIFIED',
  genderPreference: 'MIXED',
  mealsIncluded: true,
  internetIncluded: true,
  laundryIncluded: true,
  images: ['https://img.test/pen1.jpg'],
  photos: ['https://img.test/pen1.jpg'],
  rooms: [],
  amenities: ['comida-incluida', 'lavanderia'],
};

describe('useStudentPensionsFeed', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('concurrent metadata initialization via Promise.allSettled', () => {
    it('loads cities and universities concurrently on mount', async () => {
      vi.spyOn(locationsService, 'fetchCities').mockResolvedValue(
        createSuccess(MOCK_TEST_CITIES),
      );
      vi.spyOn(locationsService, 'fetchUniversities').mockResolvedValue(
        createSuccess(MOCK_TEST_UNIVERSITIES),
      );
      vi.spyOn(pensionsService, 'fetchPaginatedPensions').mockResolvedValue(
        createSuccess({
          items: [MOCK_TEST_PENSION_DTO as never],
          total: 1,
          page: 1,
          limit: 12,
          hasMore: false,
        }),
      );

      const { result } = renderHook(() => useStudentPensionsFeed());

      expect(result.current.isLoadingMetadata).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoadingMetadata).toBe(false);
      });

      expect(result.current.cities).toHaveLength(2);
      expect(result.current.universities).toHaveLength(1);
      expect(result.current.universitiesError).toBe(false);
      expect(result.current.metadataError).toBeNull();
    });

    it('places detected GPS city at the start of the list', async () => {
      vi.spyOn(locationsService, 'fetchCities').mockResolvedValue(
        createSuccess(MOCK_TEST_CITIES),
      );
      vi.spyOn(locationsService, 'fetchUniversities').mockResolvedValue(
        createSuccess(MOCK_TEST_UNIVERSITIES),
      );
      vi.spyOn(pensionsService, 'fetchPaginatedPensions').mockResolvedValue(
        createSuccess({
          items: [],
          total: 0,
          page: 1,
          limit: 12,
          hasMore: false,
        }),
      );

      const { result } = renderHook(() =>
        useStudentPensionsFeed({ currentCity: 'Viña del Mar' }),
      );

      await waitFor(() => {
        expect(result.current.isLoadingMetadata).toBe(false);
      });

      expect(result.current.cities[0].name).toBe('Viña del Mar');
      expect(result.current.cities[0].isCurrentCity).toBe(true);
    });

    it('keeps cities available if universities request fails and provides retry trigger', async () => {
      vi.spyOn(locationsService, 'fetchCities').mockResolvedValue(
        createSuccess(MOCK_TEST_CITIES),
      );
      const uniSpy = vi
        .spyOn(locationsService, 'fetchUniversities')
        .mockRejectedValue(new Error('Network error on universities'));

      vi.spyOn(pensionsService, 'fetchPaginatedPensions').mockResolvedValue(
        createSuccess({
          items: [],
          total: 0,
          page: 1,
          limit: 12,
          hasMore: false,
        }),
      );

      const { result } = renderHook(() => useStudentPensionsFeed());

      await waitFor(() => {
        expect(result.current.isLoadingMetadata).toBe(false);
      });

      expect(result.current.cities).toHaveLength(2);
      expect(result.current.universitiesError).toBe(true);
      expect(result.current.universities).toHaveLength(0);

      uniSpy.mockResolvedValueOnce(createSuccess(MOCK_TEST_UNIVERSITIES));

      await act(async () => {
        await result.current.retryMetadata();
      });

      expect(result.current.universities).toHaveLength(1);
      expect(result.current.universitiesError).toBe(false);
    });

    it('handles total metadata rejection gracefully', async () => {
      vi.spyOn(locationsService, 'fetchCities').mockRejectedValue(
        new Error('Failed to load cities'),
      );
      vi.spyOn(locationsService, 'fetchUniversities').mockRejectedValue(
        new Error('Failed to load universities'),
      );
      vi.spyOn(pensionsService, 'fetchPaginatedPensions').mockResolvedValue(
        createSuccess({
          items: [],
          total: 0,
          page: 1,
          limit: 12,
          hasMore: false,
        }),
      );

      const { result } = renderHook(() => useStudentPensionsFeed());

      await waitFor(() => {
        expect(result.current.isLoadingMetadata).toBe(false);
      });

      expect(result.current.metadataError).toBe('Failed to load cities');
      expect(result.current.universitiesError).toBe(true);
    });
  });

  describe('real paginated feed and dynamic bounds synchronization', () => {
    it('fetches pensions with full active filters', async () => {
      vi.spyOn(locationsService, 'fetchCities').mockResolvedValue(
        createSuccess([]),
      );
      vi.spyOn(locationsService, 'fetchUniversities').mockResolvedValue(
        createSuccess([]),
      );
      const pensionsSpy = vi
        .spyOn(pensionsService, 'fetchPaginatedPensions')
        .mockResolvedValue(
          createSuccess({
            items: [MOCK_TEST_PENSION_DTO as never],
            total: 1,
            page: 1,
            limit: 12,
            hasMore: false,
          }),
        );

      const { result } = renderHook(() =>
        useStudentPensionsFeed({
          filters: {
            query: 'Bellavista',
            city: 'Santiago',
            universityId: 'u1',
            minPriceClp: 200000,
            maxPriceClp: 400000,
            genderPreference: 'MIXED',
            roomType: 'SINGLE',
          },
          sortBy: 'price_asc',
        }),
      );

      await waitFor(() => {
        expect(result.current.isLoadingPensions).toBe(false);
      });

      expect(pensionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          city: 'Santiago',
          universityId: 'u1',
          search: 'Bellavista',
          minPrice: 200000,
          maxPrice: 400000,
          genderPreference: 'MIXED',
          roomType: 'SINGLE',
          sortBy: 'price_asc',
        }),
      );
      expect(result.current.pensions).toHaveLength(1);
      expect(result.current.pensions[0].title).toBe(
        'Pensión Universitaria Bellavista',
      );
    });

    it('queries nearby pensions when user coordinates are present and sortBy is distance', async () => {
      vi.spyOn(locationsService, 'fetchCities').mockResolvedValue(
        createSuccess([]),
      );
      vi.spyOn(locationsService, 'fetchUniversities').mockResolvedValue(
        createSuccess([]),
      );
      const nearbySpy = vi
        .spyOn(pensionsService, 'fetchNearbyPensions')
        .mockResolvedValue(
          createSuccess({
            items: [MOCK_TEST_PENSION_DTO as never],
            total: 1,
            page: 1,
            limit: 12,
            hasMore: false,
          }),
        );

      const { result } = renderHook(() =>
        useStudentPensionsFeed({
          userLocation: { latitude: -33.45, longitude: -70.66 },
          sortBy: 'distance',
          radiusKm: 25,
        }),
      );

      await waitFor(() => {
        expect(result.current.isLoadingPensions).toBe(false);
      });

      expect(nearbySpy).toHaveBeenCalledWith(-33.45, -70.66, 25);
      expect(result.current.pensions).toHaveLength(1);
    });

    it('synchronizes dynamic map bounding box on setBounds', async () => {
      vi.spyOn(locationsService, 'fetchCities').mockResolvedValue(
        createSuccess([]),
      );
      vi.spyOn(locationsService, 'fetchUniversities').mockResolvedValue(
        createSuccess([]),
      );
      const pensionsSpy = vi
        .spyOn(pensionsService, 'fetchPaginatedPensions')
        .mockResolvedValue(
          createSuccess({
            items: [MOCK_TEST_PENSION_DTO as never],
            total: 1,
            page: 1,
            limit: 12,
            hasMore: false,
          }),
        );

      const { result } = renderHook(() => useStudentPensionsFeed());

      await waitFor(() => {
        expect(result.current.isLoadingPensions).toBe(false);
      });

      act(() => {
        result.current.setBounds({
          minLat: -33.5,
          maxLat: -33.4,
          minLng: -70.7,
          maxLng: -70.6,
        });
      });

      await waitFor(() => {
        expect(pensionsSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            minLat: -33.5,
            maxLat: -33.4,
            minLng: -70.7,
            maxLng: -70.6,
          }),
        );
      });
    });

    it('loads next page on loadMore and appends new items', async () => {
      vi.spyOn(locationsService, 'fetchCities').mockResolvedValue(
        createSuccess([]),
      );
      vi.spyOn(locationsService, 'fetchUniversities').mockResolvedValue(
        createSuccess([]),
      );
      const pensionsSpy = vi
        .spyOn(pensionsService, 'fetchPaginatedPensions')
        .mockResolvedValueOnce(
          createSuccess({
            items: [MOCK_TEST_PENSION_DTO as never],
            total: 2,
            page: 1,
            limit: 1,
            hasMore: true,
          }),
        )
        .mockResolvedValueOnce(
          createSuccess({
            items: [
              {
                ...MOCK_TEST_PENSION_DTO,
                id: 'pen-2',
                title: 'Pensión Segunda',
              } as never,
            ],
            total: 2,
            page: 2,
            limit: 1,
            hasMore: false,
          }),
        );

      const { result } = renderHook(() =>
        useStudentPensionsFeed({ limit: 1 }),
      );

      await waitFor(() => {
        expect(result.current.isLoadingPensions).toBe(false);
      });

      expect(result.current.hasMore).toBe(true);
      expect(result.current.pensions).toHaveLength(1);

      await act(async () => {
        await result.current.loadMore();
      });

      expect(pensionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 }),
      );
      expect(result.current.pensions).toHaveLength(2);
      expect(result.current.hasMore).toBe(false);
    });

    it('captures network failure gracefully and supports refetch', async () => {
      vi.spyOn(locationsService, 'fetchCities').mockResolvedValue(
        createSuccess([]),
      );
      vi.spyOn(locationsService, 'fetchUniversities').mockResolvedValue(
        createSuccess([]),
      );
      const pensionsSpy = vi
        .spyOn(pensionsService, 'fetchPaginatedPensions')
        .mockResolvedValueOnce(
          createError('Servidor no disponible', 503),
        );

      const { result } = renderHook(() => useStudentPensionsFeed());

      await waitFor(() => {
        expect(result.current.isLoadingPensions).toBe(false);
      });

      expect(result.current.error).toBe('Servidor no disponible');
      expect(result.current.pensions).toHaveLength(0);

      pensionsSpy.mockResolvedValueOnce(
        createSuccess({
          items: [MOCK_TEST_PENSION_DTO as never],
          total: 1,
          page: 1,
          limit: 12,
          hasMore: false,
        }),
      );

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.pensions).toHaveLength(1);
    });
  });
});
