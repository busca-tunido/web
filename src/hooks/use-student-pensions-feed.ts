'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { mapRawPensionToItem } from '@/lib/api-client';
import { type ApiResponse, isApiSuccess } from '@/lib/api-response';
import type {
  CityInfo,
  NearbyCityCount,
  PensionItem,
  SearchFilters,
  UniversityInfo,
} from '@/lib/types';
import { sortCitiesWithCurrentFirst } from '@/lib/use-user-location';
import { locationsService } from '@/services/locations.service';
import { pensionsService } from '@/services/pensions.service';
import type { PaginatedPensionsResponse } from '@/types/api-contracts';

export type MapBounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

export type UseStudentPensionsFeedOptions = {
  filters?: SearchFilters;
  userLocation?: { latitude: number; longitude: number } | null;
  currentCity?: string | null;
  radiusKm?: number;
  sortBy?: 'relevance' | 'distance' | 'price_asc' | 'price_desc' | 'rating';
  limit?: number;
  initialBounds?: MapBounds | null;
  autoLoad?: boolean;
};

export type UseStudentPensionsFeedReturn = {
  cities: CityInfo[];
  universities: UniversityInfo[];
  isLoadingMetadata: boolean;
  metadataError: string | null;
  universitiesError: boolean;
  retryMetadata: () => Promise<void>;

  pensions: PensionItem[];
  total: number;
  hasMore: boolean;
  isLoadingPensions: boolean;
  isLoadingMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
  nearbyCityCounts: NearbyCityCount[];

  bounds: MapBounds | null;
  setBounds: (bounds: MapBounds | null) => void;
};

export function useStudentPensionsFeed(
  options: UseStudentPensionsFeedOptions = {},
): UseStudentPensionsFeedReturn {
  const {
    filters,
    userLocation,
    currentCity,
    radiusKm = 30,
    sortBy = 'relevance',
    limit = 12,
    initialBounds = null,
    autoLoad = true,
  } = options;

  const [cities, setCities] = useState<CityInfo[]>([]);
  const [universities, setUniversities] = useState<UniversityInfo[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(true);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [universitiesError, setUniversitiesError] = useState<boolean>(false);

  const [pensions, setPensions] = useState<PensionItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [isLoadingPensions, setIsLoadingPensions] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nearbyCityCounts, setNearbyCityCounts] = useState<NearbyCityCount[]>([]);
  const [bounds, setBounds] = useState<MapBounds | null>(initialBounds);

  const activeRequestIdRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  const loadMetadata = useCallback(async (): Promise<void> => {
    setIsLoadingMetadata(true);
    setMetadataError(null);

    const [citiesResult, universitiesResult] = await Promise.allSettled([
      locationsService.fetchCities(),
      locationsService.fetchUniversities(),
    ]);

    let loadedCities: CityInfo[] = [];

    if (citiesResult.status === 'fulfilled') {
      const val = citiesResult.value;
      if (isApiSuccess(val)) {
        loadedCities = val.data;
      } else if (Array.isArray(val)) {
        loadedCities = val;
      } else if ('message' in val && typeof val.message === 'string') {
        setMetadataError(val.message);
      }
    } else {
      setMetadataError(
        citiesResult.reason instanceof Error
          ? citiesResult.reason.message
          : 'Error al cargar ciudades',
      );
    }

    if (loadedCities.length > 0) {
      if (currentCity) {
        const target =
          loadedCities.find(
            (c) => c.name.toLowerCase() === currentCity.toLowerCase() || c.id === currentCity,
          ) ?? null;
        setCities(sortCitiesWithCurrentFirst(loadedCities, target));
      } else {
        setCities(loadedCities);
      }
    }

    if (universitiesResult.status === 'fulfilled') {
      const val = universitiesResult.value;
      if (isApiSuccess(val)) {
        setUniversities(val.data as unknown as UniversityInfo[]);
        setUniversitiesError(false);
      } else if (Array.isArray(val)) {
        setUniversities(val as unknown as UniversityInfo[]);
        setUniversitiesError(false);
      } else {
        setUniversitiesError(true);
      }
    } else {
      setUniversitiesError(true);
    }

    setIsLoadingMetadata(false);
  }, [currentCity]);

  useEffect(() => {
    loadMetadata();
  }, [loadMetadata]);

  useEffect(() => {
    if (!currentCity) return;
    setCities((prev) => {
      if (prev.length === 0) return prev;
      const target =
        prev.find(
          (c) => c.name.toLowerCase() === currentCity.toLowerCase() || c.id === currentCity,
        ) ?? null;
      return sortCitiesWithCurrentFirst(prev, target);
    });
  }, [currentCity]);

  const filterCity = filters?.city;
  const filterUni = filters?.universityId;
  const filterQuery = filters?.query;
  const filterMinPrice = filters?.minPriceClp;
  const filterMaxPrice = filters?.maxPriceClp;
  const filterGender = filters?.genderPreference;
  const filterRoomType = filters?.roomType;
  const filterSortBy = filters?.sortBy;
  const effectiveSortBy = sortBy ?? filterSortBy ?? 'relevance';

  const userLat = userLocation?.latitude;
  const userLng = userLocation?.longitude;

  const minLat = bounds?.minLat;
  const maxLat = bounds?.maxLat;
  const minLng = bounds?.minLng;
  const maxLng = bounds?.maxLng;

  const fetchPensionsData = useCallback(
    async (pageIndex: number, isLoadMore = false): Promise<void> => {
      const requestId = ++activeRequestIdRef.current;
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoadingPensions(true);
      }
      setError(null);

      try {
        const isNearbyExploration = Boolean(
          userLat !== undefined &&
            userLng !== undefined &&
            !filterCity &&
            !filterUni &&
            !filterQuery &&
            !bounds &&
            effectiveSortBy === 'distance',
        );

        let res: ApiResponse<PaginatedPensionsResponse>;
        if (isNearbyExploration && userLat !== undefined && userLng !== undefined) {
          res = await pensionsService.fetchNearbyPensions(userLat, userLng, radiusKm);
        } else {
          res = await pensionsService.fetchPaginatedPensions({
            city: filterCity,
            universityId: filterUni,
            search: filterQuery,
            minPrice: filterMinPrice,
            maxPrice: filterMaxPrice,
            genderPreference: filterGender === 'ALL' ? undefined : filterGender,
            roomType: filterRoomType,
            sortBy: effectiveSortBy,
            page: pageIndex,
            limit,
            minLat,
            maxLat,
            minLng,
            maxLng,
            latitude: userLat,
            longitude: userLng,
            radiusKm,
          });
        }

        if (requestId !== activeRequestIdRef.current || !isMountedRef.current) {
          return;
        }

        if (isApiSuccess(res)) {
          const mappedItems: PensionItem[] = res.data.items.map((dto) =>
            mapRawPensionToItem(dto as unknown as Record<string, unknown>),
          );

          if (isLoadMore) {
            setPensions((prev) => {
              const existing = new Set(prev.map((p) => p.id));
              const newOnes = mappedItems.filter((p) => !existing.has(p.id));
              return [...prev, ...newOnes];
            });
          } else {
            setPensions(mappedItems);
          }

          setTotal(res.data.total ?? mappedItems.length);
          setHasMore(res.data.hasMore ?? false);
          setPage(pageIndex);
          if (res.data.nearbyCityCounts) {
            setNearbyCityCounts(
              res.data.nearbyCityCounts.map((c) => ({
                city: c.city,
                count: c.count,
                distanceKm: c.distanceKm ?? 0,
              })),
            );
          }
        } else {
          setError(res.message || 'No pudimos conectar con el servidor');
        }
      } catch (err) {
        if (requestId === activeRequestIdRef.current && isMountedRef.current) {
          setError(err instanceof Error ? err.message : 'No pudimos conectar con el servidor');
        }
      } finally {
        if (requestId === activeRequestIdRef.current && isMountedRef.current) {
          setIsLoadingPensions(false);
          setIsLoadingMore(false);
        }
      }
    },
    [
      bounds,
      effectiveSortBy,
      filterCity,
      filterGender,
      filterMaxPrice,
      filterMinPrice,
      filterQuery,
      filterRoomType,
      filterUni,
      limit,
      maxLat,
      maxLng,
      minLat,
      minLng,
      radiusKm,
      userLat,
      userLng,
    ],
  );

  useEffect(() => {
    if (autoLoad) {
      fetchPensionsData(1, false);
    }
  }, [autoLoad, fetchPensionsData]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (isLoadingPensions || isLoadingMore || !hasMore) {
      return;
    }
    await fetchPensionsData(page + 1, true);
  }, [fetchPensionsData, hasMore, isLoadingMore, isLoadingPensions, page]);

  const refetch = useCallback(async (): Promise<void> => {
    await fetchPensionsData(1, false);
  }, [fetchPensionsData]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    cities,
    universities,
    isLoadingMetadata,
    metadataError,
    universitiesError,
    retryMetadata: loadMetadata,
    pensions,
    total,
    hasMore,
    isLoadingPensions,
    isLoadingMore,
    error,
    loadMore,
    refetch,
    nearbyCityCounts,
    bounds,
    setBounds,
  };
}
