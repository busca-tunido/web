'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { type ApiResponse, isApiSuccess } from '@/lib/api-response';
import type {
  CityInfo,
  NearbyCityCount,
  PaginatedPensionsResponse,
  PensionItem,
  SearchFilters,
  UniversityInfo,
} from '@/lib/types';
import { sortCitiesWithCurrentFirst } from '@/lib/use-user-location';
import { locationsService } from '@/services/locations.service';
import { pensionsService } from '@/services/pensions.service';

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
  initialCities?: CityInfo[];
  initialUniversities?: UniversityInfo[];
  initialPensions?: PensionItem[];
  initialTotal?: number;
  initialCity?: string | null;
  initialGeo?: { latitude?: number | null; longitude?: number | null } | null;
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
    sortBy,
    limit = 12,
    initialBounds = null,
    autoLoad = true,
    initialCities,
    initialUniversities,
    initialPensions,
    initialTotal,
    initialCity = null,
    initialGeo = null,
  } = options;

  const hasHydratedMetadata = Boolean(
    initialCities &&
      initialCities.length > 0 &&
      initialUniversities &&
      initialUniversities.length > 0,
  );
  const hasHydratedPensions = Boolean(initialPensions && initialPensions.length > 0);

  const [cities, setCities] = useState<CityInfo[]>(() => {
    if (!initialCities || initialCities.length === 0) return [];
    if (currentCity) {
      const target =
        initialCities.find(
          (c) => c.name.toLowerCase() === currentCity.toLowerCase() || c.id === currentCity,
        ) ?? null;
      return sortCitiesWithCurrentFirst(initialCities, target);
    }
    return initialCities;
  });
  const [universities, setUniversities] = useState<UniversityInfo[]>(
    () => initialUniversities ?? [],
  );
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(() => !hasHydratedMetadata);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [universitiesError, setUniversitiesError] = useState<boolean>(false);

  const [pensions, setPensions] = useState<PensionItem[]>(() => initialPensions ?? []);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(() => {
    if (!hasHydratedPensions) return false;
    const totalCount = initialTotal ?? initialPensions?.length ?? 0;
    return (initialPensions?.length ?? 0) < totalCount;
  });
  const [total, setTotal] = useState<number>(() => initialTotal ?? initialPensions?.length ?? 0);
  const [isLoadingPensions, setIsLoadingPensions] = useState<boolean>(() => !hasHydratedPensions);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nearbyCityCounts, setNearbyCityCounts] = useState<NearbyCityCount[]>([]);
  const [bounds, setBounds] = useState<MapBounds | null>(initialBounds);

  const activeRequestIdRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const skipInitialMetadataRef = useRef<boolean>(hasHydratedMetadata);
  const skipInitialPensionsRef = useRef<boolean>(hasHydratedPensions);
  const initialCityRef = useRef<string | null>(initialCity);
  const initialGeoRef = useRef<{ latitude?: number | null; longitude?: number | null } | null>(
    initialGeo,
  );

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
        loadedCities = [...val.data];
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
    if (skipInitialMetadataRef.current) {
      skipInitialMetadataRef.current = false;
      return;
    }
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
  const filterNeighborhood = filters?.neighborhood;
  const filterUni = filters?.universityId;
  const filterQuery = filters?.query;
  const filterMinPrice = filters?.minPriceClp;
  const filterMaxPrice = filters?.maxPriceClp;
  const filterGender = filters?.genderPreference;
  const filterRoomType = filters?.roomType;
  const filterHasPrivateBathroom = filters?.hasPrivateBathroom;
  const filterIncludesMeals = filters?.includesMeals;
  const filterAmenities = filters?.amenities;
  const filterAmenitiesKey = filterAmenities?.join(',') ?? '';
  const filterMinBeds = filters?.minBeds;
  const filterOnlyAvailable = filters?.onlyAvailable;
  const filterInternetIncluded = filters?.internetIncluded;
  const filterPetsAllowed = filters?.petsAllowed;
  const filterGuestsAllowed = filters?.guestsAllowed;
  const filterSmokingAllowed = filters?.smokingAllowed;
  const filterNoCurfew = filters?.noCurfew;
  const filterWaterIncluded = filters?.waterIncluded;
  const filterElectricityIncluded = filters?.electricityIncluded;
  const filterGasIncluded = filters?.gasIncluded;
  const filterSortBy = filters?.sortBy;
  const filterRatingTier = filters?.ratingTier;
  const effectiveSortBy = filterSortBy ?? sortBy ?? 'relevance';

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
        const hasExtraFilters = Boolean(
          filterNeighborhood ||
            filterMinPrice !== undefined ||
            filterMaxPrice !== undefined ||
            (filterGender && filterGender !== 'ALL') ||
            filterRoomType ||
            filterHasPrivateBathroom ||
            filterIncludesMeals ||
            filterAmenitiesKey ||
            filterMinBeds ||
            filterOnlyAvailable ||
            filterInternetIncluded ||
            filterPetsAllowed ||
            filterGuestsAllowed ||
            filterSmokingAllowed ||
            filterNoCurfew ||
            filterWaterIncluded ||
            filterElectricityIncluded ||
            filterGasIncluded ||
            filterRatingTier,
        );
        const isNearbyExploration = Boolean(
          userLat !== undefined &&
            userLng !== undefined &&
            !filterCity &&
            !filterUni &&
            !filterQuery &&
            !hasExtraFilters &&
            !bounds &&
            effectiveSortBy === 'distance',
        );

        let res: ApiResponse<PaginatedPensionsResponse>;
        if (isNearbyExploration && userLat !== undefined && userLng !== undefined) {
          res = await pensionsService.fetchNearbyPensions(userLat, userLng, radiusKm);
        } else {
          const parsedAmenities = filterAmenitiesKey ? filterAmenitiesKey.split(',') : undefined;
          res = await pensionsService.fetchPaginatedPensions({
            city: filterCity,
            neighborhood: filterNeighborhood,
            universityId: filterUni,
            search: filterQuery,
            minPrice: filterMinPrice,
            maxPrice: filterMaxPrice,
            genderPreference: filterGender === 'ALL' ? undefined : filterGender,
            roomType: filterRoomType,
            hasPrivateBathroom: filterHasPrivateBathroom,
            includesMeals: filterIncludesMeals,
            amenities: parsedAmenities,
            minBeds: filterMinBeds,
            onlyAvailable: filterOnlyAvailable,
            internetIncluded: filterInternetIncluded,
            petsAllowed: filterPetsAllowed,
            guestsAllowed: filterGuestsAllowed,
            smokingAllowed: filterSmokingAllowed,
            noCurfew: filterNoCurfew,
            waterIncluded: filterWaterIncluded,
            electricityIncluded: filterElectricityIncluded,
            gasIncluded: filterGasIncluded,
            ratingTier: filterRatingTier,
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
            view: 'card',
          });
        }

        if (requestId !== activeRequestIdRef.current || !isMountedRef.current) {
          return;
        }

        if (isApiSuccess(res)) {
          const mappedItems: PensionItem[] = [...res.data.items];

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
      filterAmenitiesKey,
      filterCity,
      filterElectricityIncluded,
      filterGasIncluded,
      filterGender,
      filterGuestsAllowed,
      filterHasPrivateBathroom,
      filterIncludesMeals,
      filterInternetIncluded,
      filterMaxPrice,
      filterMinBeds,
      filterMinPrice,
      filterNeighborhood,
      filterNoCurfew,
      filterOnlyAvailable,
      filterPetsAllowed,
      filterQuery,
      filterRatingTier,
      filterRoomType,
      filterSmokingAllowed,
      filterUni,
      filterWaterIncluded,
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
    if (!autoLoad) return;

    const matchesInitialCity =
      (filterCity ?? '').trim().toLowerCase() ===
      (initialCityRef.current ?? '').trim().toLowerCase();
    const matchesInitialGeo =
      (userLat === undefined && userLng === undefined) ||
      (initialGeoRef.current !== null &&
        initialGeoRef.current.latitude != null &&
        initialGeoRef.current.longitude != null &&
        userLat === initialGeoRef.current.latitude &&
        userLng === initialGeoRef.current.longitude);

    const isDefaultSsrMatchedQuery =
      matchesInitialCity &&
      !filterNeighborhood &&
      !filterUni &&
      !filterQuery &&
      filterMinPrice === undefined &&
      filterMaxPrice === undefined &&
      !filterGender &&
      !filterRoomType &&
      !filterHasPrivateBathroom &&
      !filterIncludesMeals &&
      !filterAmenitiesKey &&
      !filterMinBeds &&
      !filterOnlyAvailable &&
      !filterInternetIncluded &&
      !filterPetsAllowed &&
      !filterGuestsAllowed &&
      !filterSmokingAllowed &&
      !filterNoCurfew &&
      !filterWaterIncluded &&
      !filterElectricityIncluded &&
      !filterGasIncluded &&
      !filterRatingTier &&
      effectiveSortBy === 'relevance' &&
      !bounds &&
      matchesInitialGeo;

    if (skipInitialPensionsRef.current && isDefaultSsrMatchedQuery) {
      skipInitialPensionsRef.current = false;
      return;
    }

    skipInitialPensionsRef.current = false;
    fetchPensionsData(1, false);
  }, [
    autoLoad,
    bounds,
    effectiveSortBy,
    fetchPensionsData,
    filterAmenitiesKey,
    filterCity,
    filterElectricityIncluded,
    filterGasIncluded,
    filterGender,
    filterGuestsAllowed,
    filterHasPrivateBathroom,
    filterIncludesMeals,
    filterInternetIncluded,
    filterMaxPrice,
    filterMinBeds,
    filterMinPrice,
    filterNeighborhood,
    filterNoCurfew,
    filterOnlyAvailable,
    filterPetsAllowed,
    filterQuery,
    filterRatingTier,
    filterRoomType,
    filterSmokingAllowed,
    filterUni,
    filterWaterIncluded,
    userLat,
    userLng,
  ]);

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
