'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { mapRawPensionToItem } from '@/lib/api-client';
import { isApiSuccess } from '@/lib/api-response';
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
  const [mapPensions, setMapPensions] = useState<PensionItem[]>(initialPensions);
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
      if (activePension && !initialPensions.some((p) => p.id === activePension.id)) {
        return [activePension, ...initialPensions];
      }
      return initialPensions;
    });
  }, [initialPensions]);

  const updatePensionList = useCallback((mappedItems: PensionItem[]) => {
    const currentActiveId = activePinIdRef.current;
    const activePension = currentActiveId
      ? mapPensionsRef.current.find((p) => p.id === currentActiveId)
      : null;

    let updatedList = mappedItems;
    if (activePension && !mappedItems.some((p) => p.id === activePension.id)) {
      updatedList = [activePension, ...mappedItems];
    }
    setMapPensions(updatedList);
  }, []);

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
          search: filters?.query || undefined,
          minPrice: filters?.minPriceClp,
          maxPrice: filters?.maxPriceClp,
          roomType: filters?.roomType,
          limit: 50,
        });

        if (requestId === activeRequestIdRef.current && isMountedRef.current && isApiSuccess(res)) {
          const mappedItems = res.data.items.map((dto) =>
            mapRawPensionToItem(dto as unknown as Record<string, unknown>),
          );
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
      filters?.minPriceClp,
      filters?.maxPriceClp,
      filters?.roomType,
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
          search: filters?.query || undefined,
          minPrice: filters?.minPriceClp,
          maxPrice: filters?.maxPriceClp,
          roomType: filters?.roomType,
          limit: 50,
        });

        if (requestId === activeRequestIdRef.current && isMountedRef.current && isApiSuccess(res)) {
          const mappedItems = res.data.items.map((dto) =>
            mapRawPensionToItem(dto as unknown as Record<string, unknown>),
          );
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
      filters?.minPriceClp,
      filters?.maxPriceClp,
      filters?.roomType,
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
          search: filters?.query || undefined,
          minPrice: filters?.minPriceClp,
          maxPrice: filters?.maxPriceClp,
          roomType: filters?.roomType,
          limit: 50,
        });

        if (requestId === activeRequestIdRef.current && isMountedRef.current && isApiSuccess(res)) {
          const mappedItems = res.data.items.map((dto) =>
            mapRawPensionToItem(dto as unknown as Record<string, unknown>),
          );
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
      filters?.minPriceClp,
      filters?.maxPriceClp,
      filters?.roomType,
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
