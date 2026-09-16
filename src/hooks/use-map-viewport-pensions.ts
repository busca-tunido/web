'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { mapRawPensionToItem } from '@/lib/api-client';
import { isApiSuccess } from '@/lib/api-response';
import type { PensionItem } from '@/lib/types';
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
}): {
  mapPensions: PensionItem[];
  setMapPensions: React.Dispatch<React.SetStateAction<PensionItem[]>>;
  isAreaLoading: boolean;
  handleMapMoveEnd: (bounds: MapBoundsLike) => void;
} {
  const { initialPensions, activePensionId } = options;
  const [mapPensions, setMapPensions] = useState<PensionItem[]>(initialPensions);
  const [isAreaLoading, setIsAreaLoading] = useState<boolean>(false);

  const activePinIdRef = useRef<string | null>(activePensionId);
  activePinIdRef.current = activePensionId;

  const mapPensionsRef = useRef<PensionItem[]>(mapPensions);
  mapPensionsRef.current = mapPensions;

  const moveEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeRequestIdRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

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

  const handleMapMoveEnd = useCallback((bounds: MapBoundsLike): void => {
    if (moveEndTimeoutRef.current) {
      clearTimeout(moveEndTimeoutRef.current);
    }

    moveEndTimeoutRef.current = setTimeout(async () => {
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
          limit: 50,
        });

        if (requestId === activeRequestIdRef.current && isMountedRef.current && isApiSuccess(res)) {
          const mappedItems = res.data.items.map((dto) =>
            mapRawPensionToItem(dto as unknown as Record<string, unknown>),
          );
          const currentActiveId = activePinIdRef.current;
          const activePension = currentActiveId
            ? mapPensionsRef.current.find((p) => p.id === currentActiveId)
            : null;

          let updatedList = mappedItems;
          if (activePension && !mappedItems.some((p) => p.id === activePension.id)) {
            updatedList = [activePension, ...mappedItems];
          }
          setMapPensions(updatedList);
        }
      } catch {
      } finally {
        if (requestId === activeRequestIdRef.current && isMountedRef.current) {
          setIsAreaLoading(false);
        }
      }
    }, 400);
  }, []);

  return {
    mapPensions,
    setMapPensions,
    isAreaLoading,
    handleMapMoveEnd,
  };
}
