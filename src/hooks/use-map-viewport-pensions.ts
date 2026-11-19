'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isApiSuccess } from '@/lib/api-response';
import { markServerFilteredPensions, matchesSearchFilters } from '@/lib/filter-matcher';
import type { PensionItem, SearchFilters } from '@/lib/types';
import { pensionsService } from '@/services/pensions.service';

export type MapBoundsLike = {
  getSouth: () => number;
  getNorth: () => number;
  getWest: () => number;
  getEast: () => number;
  contains: (latLng: [number, number]) => boolean;
};

export function useMapViewportPensions(options: {
  initialPensions: PensionItem[];
  activePensionId: string | null;
  filters?: SearchFilters;
}): {
  mapPensions: PensionItem[];
  setMapPensions: React.Dispatch<React.SetStateAction<PensionItem[]>>;
  isAreaLoading: boolean;
  handleMapMoveEnd: (bounds: MapBoundsLike, moveOptions?: { immediate?: boolean }) => void;
  fetchPensionsAroundLocation: (lat: number, lng: number, radiusKm?: number) => Promise<void>;
  fetchPensionsForCity: (cityName: string) => Promise<void>;
  fetchViewportPensions: (bounds: MapBoundsLike) => Promise<void>;
} {
  const { initialPensions, activePensionId, filters } = options;
  const [mapPensions, setMapPensions] = useState<PensionItem[]>(() =>
    initialPensions.filter((p) => matchesSearchFilters(p, filters)),
  );
  const [isAreaLoading, setIsAreaLoading] = useState<boolean>(false);

  const activePinIdRef = useRef<string | null>(activePensionId);
  activePinIdRef.current = activePensionId;

  const mapPensionsRef = useRef<PensionItem[]>(mapPensions);
  mapPensionsRef.current = mapPensions;

  const filtersRef = useRef<SearchFilters | undefined>(filters);
  filtersRef.current = filters;

  const moveEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeRequestIdRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const lastBoundsRef = useRef<MapBoundsLike | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (moveEndTimeoutRef.current) {
        clearTimeout(moveEndTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setMapPensions((prev) => {
      const currentActiveId = activePinIdRef.current;
      const activePension = currentActiveId ? prev.find((p) => p.id === currentActiveId) : null;
      const filteredInitial = initialPensions.filter((p) => matchesSearchFilters(p, filters));
      if (
        activePension &&
        matchesSearchFilters(activePension, filters) &&
        !filteredInitial.some((p) => p.id === activePension.id)
      ) {
        return [activePension, ...filteredInitial];
      }
      return filteredInitial;
    });
  }, [initialPensions, filters]);

  useEffect(() => {
    setMapPensions((prev) => prev.filter((p) => matchesSearchFilters(p, filters)));
  }, [filters]);

  const applyServerPensionList = useCallback(
    (items: readonly PensionItem[], activeFilters?: SearchFilters) => {
      const mapped = [...items];
      markServerFilteredPensions(mapped, activeFilters);

      const currentActiveId = activePinIdRef.current;
      const activePension = currentActiveId
        ? mapPensionsRef.current.find((p) => p.id === currentActiveId)
        : null;

      if (
        activePension &&
        matchesSearchFilters(activePension, activeFilters) &&
        !mapped.some((p) => p.id === activePension.id)
      ) {
        setMapPensions([activePension, ...mapped]);
      } else {
        setMapPensions(mapped);
      }
    },
    [],
  );

  const filterQuery = filters?.query || undefined;
  const filterCity = filters?.city;
  const filterNeighborhood = filters?.neighborhood;
  const filterUni = filters?.universityId;
  const filterMinPrice = filters?.minPriceClp;
  const filterMaxPrice = filters?.maxPriceClp;
  const filterGender = filters?.genderPreference === 'ALL' ? undefined : filters?.genderPreference;
  const filterRoomType = filters?.roomType;
  const filterHasPrivateBath = filters?.hasPrivateBathroom;
  const filterIncludesMeals = filters?.includesMeals;
  const filterAmenitiesKey = filters?.amenities?.join(',') ?? '';
  const filterMinBeds = filters?.minBeds;
  const filterOnlyAvailable = filters?.onlyAvailable;
  const filterSortBy = filters?.sortBy;
  const filterRatingTier = filters?.ratingTier;

  const fetchViewportPensions = useCallback(
    async (bounds: MapBoundsLike): Promise<void> => {
      if (!isMountedRef.current) return;

      const currentList = mapPensionsRef.current;
      const hasAnyVisible = currentList.some((p) => bounds.contains([p.latitude, p.longitude]));

      if (!hasAnyVisible) {
        setIsAreaLoading(true);
      }

      const requestId = ++activeRequestIdRef.current;
      const parsedAmenities = filterAmenitiesKey ? filterAmenitiesKey.split(',') : undefined;

      try {
        const res = await pensionsService.fetchPaginatedPensions({
          minLat: bounds.getSouth(),
          maxLat: bounds.getNorth(),
          minLng: bounds.getWest(),
          maxLng: bounds.getEast(),
          city: filterCity,
          neighborhood: filterNeighborhood,
          universityId: filterUni,
          search: filterQuery,
          minPrice: filterMinPrice,
          maxPrice: filterMaxPrice,
          genderPreference: filterGender,
          roomType: filterRoomType,
          hasPrivateBathroom: filterHasPrivateBath,
          includesMeals: filterIncludesMeals,
          amenities: parsedAmenities,
          minBeds: filterMinBeds,
          onlyAvailable: filterOnlyAvailable,
          sortBy: filterSortBy,
          ratingTier: filterRatingTier,
          view: 'map',
          limit: 50,
        });

        if (requestId === activeRequestIdRef.current && isMountedRef.current && isApiSuccess(res)) {
          applyServerPensionList(res.data.items, filtersRef.current);
        }
      } catch {
      } finally {
        if (requestId === activeRequestIdRef.current && isMountedRef.current) {
          setIsAreaLoading(false);
        }
      }
    },
    [
      applyServerPensionList,
      filterAmenitiesKey,
      filterCity,
      filterGender,
      filterHasPrivateBath,
      filterIncludesMeals,
      filterMaxPrice,
      filterMinBeds,
      filterMinPrice,
      filterNeighborhood,
      filterOnlyAvailable,
      filterQuery,
      filterRatingTier,
      filterRoomType,
      filterSortBy,
      filterUni,
    ],
  );

  const fetchPensionsAroundLocation = useCallback(
    async (lat: number, lng: number, radiusKm = 25): Promise<void> => {
      if (moveEndTimeoutRef.current) {
        clearTimeout(moveEndTimeoutRef.current);
        moveEndTimeoutRef.current = null;
      }
      setIsAreaLoading(true);
      const requestId = ++activeRequestIdRef.current;
      const parsedAmenities = filterAmenitiesKey ? filterAmenitiesKey.split(',') : undefined;

      try {
        const res = await pensionsService.fetchPaginatedPensions({
          latitude: lat,
          longitude: lng,
          radiusKm,
          city: filterCity,
          neighborhood: filterNeighborhood,
          universityId: filterUni,
          search: filterQuery,
          minPrice: filterMinPrice,
          maxPrice: filterMaxPrice,
          genderPreference: filterGender,
          roomType: filterRoomType,
          hasPrivateBathroom: filterHasPrivateBath,
          includesMeals: filterIncludesMeals,
          amenities: parsedAmenities,
          minBeds: filterMinBeds,
          onlyAvailable: filterOnlyAvailable,
          sortBy: filterSortBy,
          ratingTier: filterRatingTier,
          view: 'map',
          limit: 50,
        });

        if (requestId === activeRequestIdRef.current && isMountedRef.current && isApiSuccess(res)) {
          applyServerPensionList(res.data.items, filtersRef.current);
        }
      } catch {
      } finally {
        if (requestId === activeRequestIdRef.current && isMountedRef.current) {
          setIsAreaLoading(false);
        }
      }
    },
    [
      applyServerPensionList,
      filterAmenitiesKey,
      filterCity,
      filterGender,
      filterHasPrivateBath,
      filterIncludesMeals,
      filterMaxPrice,
      filterMinBeds,
      filterMinPrice,
      filterNeighborhood,
      filterOnlyAvailable,
      filterQuery,
      filterRatingTier,
      filterRoomType,
      filterSortBy,
      filterUni,
    ],
  );

  const fetchPensionsForCity = useCallback(
    async (cityName: string): Promise<void> => {
      if (moveEndTimeoutRef.current) {
        clearTimeout(moveEndTimeoutRef.current);
        moveEndTimeoutRef.current = null;
      }
      setIsAreaLoading(true);
      const requestId = ++activeRequestIdRef.current;
      const parsedAmenities = filterAmenitiesKey ? filterAmenitiesKey.split(',') : undefined;

      try {
        const res = await pensionsService.fetchPaginatedPensions({
          city: cityName,
          neighborhood: filterNeighborhood,
          universityId: filterUni,
          search: filterQuery,
          minPrice: filterMinPrice,
          maxPrice: filterMaxPrice,
          genderPreference: filterGender,
          roomType: filterRoomType,
          hasPrivateBathroom: filterHasPrivateBath,
          includesMeals: filterIncludesMeals,
          amenities: parsedAmenities,
          minBeds: filterMinBeds,
          onlyAvailable: filterOnlyAvailable,
          sortBy: filterSortBy,
          ratingTier: filterRatingTier,
          view: 'map',
          limit: 50,
        });

        if (requestId === activeRequestIdRef.current && isMountedRef.current && isApiSuccess(res)) {
          applyServerPensionList(res.data.items, {
            ...(filtersRef.current ?? { query: '' }),
            city: cityName,
          });
        }
      } catch {
      } finally {
        if (requestId === activeRequestIdRef.current && isMountedRef.current) {
          setIsAreaLoading(false);
        }
      }
    },
    [
      applyServerPensionList,
      filterAmenitiesKey,
      filterGender,
      filterHasPrivateBath,
      filterIncludesMeals,
      filterMaxPrice,
      filterMinBeds,
      filterMinPrice,
      filterNeighborhood,
      filterOnlyAvailable,
      filterQuery,
      filterRatingTier,
      filterRoomType,
      filterSortBy,
      filterUni,
    ],
  );

  const handleMapMoveEnd = useCallback(
    (bounds: MapBoundsLike, moveOptions?: { immediate?: boolean }): void => {
      lastBoundsRef.current = bounds;
      if (moveEndTimeoutRef.current) {
        clearTimeout(moveEndTimeoutRef.current);
        moveEndTimeoutRef.current = null;
      }

      if (moveOptions?.immediate) {
        void fetchViewportPensions(bounds);
      } else {
        moveEndTimeoutRef.current = setTimeout(() => {
          void fetchViewportPensions(bounds);
        }, 400);
      }
    },
    [fetchViewportPensions],
  );

  useEffect(() => {
    if (lastBoundsRef.current) {
      void fetchViewportPensions(lastBoundsRef.current);
    }
  }, [fetchViewportPensions]);

  return {
    mapPensions,
    setMapPensions,
    isAreaLoading,
    handleMapMoveEnd,
    fetchPensionsAroundLocation,
    fetchPensionsForCity,
    fetchViewportPensions,
  };
}
