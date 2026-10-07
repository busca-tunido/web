'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { mapRawPensionToItem } from '@/lib/api-client';
import { isApiSuccess } from '@/lib/api-response';
import { matchesSearchFilters } from '@/lib/filter-matcher';
import { filterPensionsByRatingTier } from '@/lib/rating-tier';
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

  const updatePensionList = useCallback(
    (mappedItems: PensionItem[]) => {
      const currentActiveId = activePinIdRef.current;
      const activePension = currentActiveId
        ? mapPensionsRef.current.find((p) => p.id === currentActiveId)
        : null;

      let updatedList = mappedItems.filter((p) => matchesSearchFilters(p, filters));
      if (
        activePension &&
        matchesSearchFilters(activePension, filters) &&
        !updatedList.some((p) => p.id === activePension.id)
      ) {
        updatedList = [activePension, ...updatedList];
      }
      setMapPensions(updatedList);
    },
    [filters],
  );

  const fetchViewportPensions = useCallback(
    async (bounds: MapBoundsLike): Promise<void> => {
      if (!isMountedRef.current) return;

      const currentList = mapPensionsRef.current;
      const hasAnyVisible = currentList.some((p) => bounds.contains([p.latitude, p.longitude]));

      if (!hasAnyVisible) {
        setIsAreaLoading(true);
      }

      const requestId = ++activeRequestIdRef.current;

      try {
        const res = await pensionsService.fetchPaginatedPensions({
          minLat: bounds.getSouth(),
          maxLat: bounds.getNorth(),
          minLng: bounds.getWest(),
          maxLng: bounds.getEast(),
          city: filters?.city,
          universityId: filters?.universityId,
          search: filters?.query || undefined,
          minPrice: filters?.minPriceClp,
          maxPrice: filters?.maxPriceClp,
          genderPreference:
            filters?.genderPreference === 'ALL' ? undefined : filters?.genderPreference,
          roomType: filters?.roomType,
          hasPrivateBathroom: filters?.hasPrivateBathroom,
          includesMeals: filters?.includesMeals,
          limit: 50,
        });

        if (requestId === activeRequestIdRef.current && isMountedRef.current && isApiSuccess(res)) {
          const rawItems = res.data.items.map((dto) =>
            mapRawPensionToItem(dto as unknown as Record<string, unknown>),
          );
          const filteredByRating = filters?.ratingTier
            ? filterPensionsByRatingTier(rawItems, filters.ratingTier)
            : rawItems;
          const mappedItems = filteredByRating.filter((p) => matchesSearchFilters(p, filters));
          updatePensionList(mappedItems);
        }
      } catch {
      } finally {
        if (requestId === activeRequestIdRef.current && isMountedRef.current) {
          setIsAreaLoading(false);
        }
      }
    },
    [
      updatePensionList,
      filters?.query,
      filters?.city,
      filters?.universityId,
      filters?.minPriceClp,
      filters?.maxPriceClp,
      filters?.genderPreference,
      filters?.ratingTier,
      filters?.roomType,
      filters?.hasPrivateBathroom,
      filters?.includesMeals,
      filters,
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

      try {
        const res = await pensionsService.fetchPaginatedPensions({
          latitude: lat,
          longitude: lng,
          radiusKm,
          city: filters?.city,
          universityId: filters?.universityId,
          search: filters?.query || undefined,
          minPrice: filters?.minPriceClp,
          maxPrice: filters?.maxPriceClp,
          genderPreference:
            filters?.genderPreference === 'ALL' ? undefined : filters?.genderPreference,
          roomType: filters?.roomType,
          hasPrivateBathroom: filters?.hasPrivateBathroom,
          includesMeals: filters?.includesMeals,
          limit: 50,
        });

        if (requestId === activeRequestIdRef.current && isMountedRef.current && isApiSuccess(res)) {
          const rawItems = res.data.items.map((dto) =>
            mapRawPensionToItem(dto as unknown as Record<string, unknown>),
          );
          const filteredByRating = filters?.ratingTier
            ? filterPensionsByRatingTier(rawItems, filters.ratingTier)
            : rawItems;
          const mappedItems = filteredByRating.filter((p) => matchesSearchFilters(p, filters));
          updatePensionList(mappedItems);
        }
      } catch {
      } finally {
        if (requestId === activeRequestIdRef.current && isMountedRef.current) {
          setIsAreaLoading(false);
        }
      }
    },
    [
      updatePensionList,
      filters?.query,
      filters?.city,
      filters?.universityId,
      filters?.minPriceClp,
      filters?.maxPriceClp,
      filters?.genderPreference,
      filters?.ratingTier,
      filters?.roomType,
      filters?.hasPrivateBathroom,
      filters?.includesMeals,
      filters,
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

      try {
        const res = await pensionsService.fetchPaginatedPensions({
          city: cityName,
          universityId: filters?.universityId,
          search: filters?.query || undefined,
          minPrice: filters?.minPriceClp,
          maxPrice: filters?.maxPriceClp,
          genderPreference:
            filters?.genderPreference === 'ALL' ? undefined : filters?.genderPreference,
          roomType: filters?.roomType,
          hasPrivateBathroom: filters?.hasPrivateBathroom,
          includesMeals: filters?.includesMeals,
          limit: 50,
        });

        if (requestId === activeRequestIdRef.current && isMountedRef.current && isApiSuccess(res)) {
          const rawItems = res.data.items.map((dto) =>
            mapRawPensionToItem(dto as unknown as Record<string, unknown>),
          );
          const filteredByRating = filters?.ratingTier
            ? filterPensionsByRatingTier(rawItems, filters.ratingTier)
            : rawItems;
          const mappedItems = filteredByRating.filter((p) => matchesSearchFilters(p, filters));
          updatePensionList(mappedItems);
        }
      } catch {
      } finally {
        if (requestId === activeRequestIdRef.current && isMountedRef.current) {
          setIsAreaLoading(false);
        }
      }
    },
    [
      updatePensionList,
      filters?.query,
      filters?.universityId,
      filters?.minPriceClp,
      filters?.maxPriceClp,
      filters?.genderPreference,
      filters?.ratingTier,
      filters?.roomType,
      filters?.hasPrivateBathroom,
      filters?.includesMeals,
      filters,
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
