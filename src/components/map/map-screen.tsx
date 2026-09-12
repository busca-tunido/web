'use client';

import { ChevronDown, ChevronUp, Heart, Loader2, Locate, Star } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  type PanInfo,
  useDragControls,
  useMotionValue,
} from 'motion/react';
import Image from 'next/image';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapDrawerSkeleton } from '@/components/ui/skeletons/map-drawer-skeleton';
import { mapRawPensionToItem } from '@/lib/api-client';
import { isApiSuccess } from '@/lib/api-response';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import type { CityInfo, PensionItem, UniversityInfo } from '@/lib/types';
import type { UserCoordinates } from '@/lib/use-user-location';
import { pensionsService } from '@/services/pensions.service';

type MapScreenProps = {
  pensions: PensionItem[];
  cities: CityInfo[];
  selectedPension: PensionItem | null;
  selectedCity: string | null;
  selectedUniversity: UniversityInfo | null;
  userLocation: UserCoordinates | null;
  onRequestLocation: () => void;
  onSelectPension: (pension: PensionItem) => void;
  onOpenPensionDetail: (pension: PensionItem) => void;
};

type DrawerState = 'minimized' | 'half' | 'maximized';

function getTileUrl(theme: 'light' | 'dark') {
  const apiKey = process.env.NEXT_PUBLIC_CARTO_API_KEY;
  const keyParam = apiKey ? `?api_key=${apiKey}` : '';
  return theme === 'dark'
    ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${keyParam}`
    : `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${keyParam}`;
}

export function MapScreen({
  pensions,
  cities,
  selectedPension,
  selectedCity,
  selectedUniversity,
  userLocation,
  onRequestLocation,
  onSelectPension,
  onOpenPensionDetail,
}: MapScreenProps) {
  const { isFavorite, toggleFavorite } = useAuth();
  const { resolvedTheme } = useTheme();

  const [drawerState, setDrawerState] = useState<DrawerState>('minimized');
  const [containerHeight, setContainerHeight] = useState(800);
  const dragControls = useDragControls();

  const [mapPensions, setMapPensions] = useState<PensionItem[]>(pensions);
  const [isAreaLoading, setIsAreaLoading] = useState(false);

  useEffect(() => {
    setMapPensions(pensions);
  }, [pensions]);

  const mapPensionsRef = useRef(mapPensions);
  mapPensionsRef.current = mapPensions;

  const moveEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeRequestIdRef = useRef(0);

  const [activePinId, setActivePinId] = useState<string | null>(selectedPension?.id ?? null);

  const cardListRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const containerHeightRef = useRef(containerHeight);

  useEffect(() => {
    const updateHeight = () => {
      if (mapContainerRef.current) {
        const h = mapContainerRef.current.clientHeight || window.innerHeight;
        setContainerHeight(h);
        containerHeightRef.current = h;
        mapInstanceRef.current?.invalidateSize();
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const maximizedY = Math.max(24, Math.round(containerHeight * 0.05));
  const halfY = Math.round(containerHeight * 0.5);
  const minimizedY = Math.max(halfY + 60, containerHeight - 68);

  const targetY =
    drawerState === 'maximized' ? maximizedY : drawerState === 'half' ? halfY : minimizedY;
  const drawerY = useMotionValue(minimizedY);

  useEffect(() => {
    drawerY.set(targetY);
  }, [targetY, drawerY]);
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null);
  const tileLayerRef = useRef<import('leaflet').TileLayer | null>(null);
  const markersLayerRef = useRef<import('leaflet').LayerGroup | null>(null);
  const userMarkerRef = useRef<import('leaflet').Marker | null>(null);
  const universityMarkerRef = useRef<import('leaflet').Marker | null>(null);
  const leafletModuleRef = useRef<typeof import('leaflet') | null>(null);

  const panToPension = useCallback((lat: number, lng: number) => {
    const map = mapInstanceRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L) return;

    const zoom = map.getZoom();
    const markerPoint = map.project([lat, lng], zoom);
    const height = map.getSize().y || containerHeightRef.current || 800;
    const topBarHeight = 68;
    const drawerTop = height * 0.5;
    const visibleCenterY = (topBarHeight + drawerTop) / 2;
    const yOffset = height / 2 - visibleCenterY;

    const targetCenter = map.unproject(L.point(markerPoint.x, markerPoint.y + yOffset), zoom);
    map.panTo(targetCenter, { animate: true });
  }, []);

  const displayedPensions = useMemo(() => {
    if (!activePinId) return mapPensions;
    const active = mapPensions.find((p) => p.id === activePinId);
    if (!active) return mapPensions;
    const others = mapPensions.filter((p) => p.id !== activePinId);
    return [active, ...others];
  }, [mapPensions, activePinId]);

  const renderMarkers = useCallback(() => {
    const L = leafletModuleRef.current;
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!L || !map || !markersGroup) return;

    markersGroup.clearLayers();

    for (const pension of mapPensions) {
      const isSelected = pension.id === activePinId;
      const formattedPrice = `$${pension.priceMonthlyClp.toLocaleString('es-CL')} CLP`;

      const iconHtml = isSelected
        ? `<div style="width: 100px; transform: translate(-50%, -50%); cursor: pointer;">
             <div class="px-3 py-1 rounded-full text-xs font-bold shadow-lg transition-transform scale-110 bg-primary text-primary-foreground border border-primary ring-4 ring-primary/25 flex items-center justify-center whitespace-nowrap">
               ${formattedPrice}
             </div>
           </div>`
        : `<div style="width: 100px; transform: translate(-50%, -50%); cursor: pointer;">
             <div class="px-2.5 py-1 rounded-full text-xs font-bold shadow-md bg-card text-foreground border border-border hover:border-primary/60 hover:bg-secondary flex items-center justify-center whitespace-nowrap">
               ${formattedPrice}
             </div>
           </div>`;

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: iconHtml,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([pension.latitude, pension.longitude], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 100,
      });

      marker.on('click', () => {
        setActivePinId(pension.id);
        onSelectPension(pension);
        setDrawerState('half');
        if (cardListRef.current) {
          cardListRef.current.scrollTop = 0;
        }
        panToPension(pension.latitude, pension.longitude);
      });

      marker.addTo(markersGroup);
    }
  }, [mapPensions, activePinId, onSelectPension, panToPension]);

  const renderUserMarker = useCallback(() => {
    const L = leafletModuleRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    if (userLocation) {
      const userIconHtml = `
        <div style="position: relative; width: 68px; height: 68px; display: flex; align-items: center; justify-content: center; pointer-events: none;">
          <div style="position: absolute; width: 68px; height: 68px; border-radius: 9999px; background: rgba(0, 122, 255, 0.18); border: 1.5px solid rgba(0, 122, 255, 0.35);"></div>
          <div style="position: relative; width: 18px; height: 18px; border-radius: 9999px; background: #007aff; border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);"></div>
        </div>
      `;

      const userIcon = L.divIcon({
        className: 'custom-div-icon',
        html: userIconHtml,
        iconSize: [68, 68],
        iconAnchor: [34, 34],
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.latitude, userLocation.longitude]);
        userMarkerRef.current.setIcon(userIcon);
      } else {
        userMarkerRef.current = L.marker([userLocation.latitude, userLocation.longitude], {
          icon: userIcon,
          zIndexOffset: 3000,
        }).addTo(map);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userLocation]);

  const renderUniversityMarker = useCallback(() => {
    const L = leafletModuleRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    if (selectedUniversity) {
      const uniIconHtml = `
        <div style="transform: translate(-50%, -100%); cursor: pointer;" class="flex flex-col items-center">
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-xl border-2 border-white ring-2 ring-emerald-500/40 whitespace-nowrap">
            <span>🎓</span>
            <span>${selectedUniversity.acronym}</span>
          </div>
          <div class="w-2 h-2 -mt-1 rotate-45 bg-emerald-600 border-r border-b border-white"></div>
        </div>
      `;
      const uniIcon = L.divIcon({
        className: 'custom-div-icon',
        html: uniIconHtml,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      if (universityMarkerRef.current) {
        universityMarkerRef.current.setLatLng([
          selectedUniversity.latitude,
          selectedUniversity.longitude,
        ]);
        universityMarkerRef.current.setIcon(uniIcon);
      } else {
        universityMarkerRef.current = L.marker(
          [selectedUniversity.latitude, selectedUniversity.longitude],
          {
            icon: uniIcon,
            zIndexOffset: 1500,
          },
        ).addTo(map);
      }
    } else if (universityMarkerRef.current) {
      universityMarkerRef.current.remove();
      universityMarkerRef.current = null;
    }
  }, [selectedUniversity]);

  const initPropsRef = useRef({
    selectedPension,
    selectedUniversity,
    selectedCity,
    userLocation,
    cities,
    resolvedTheme,
  });

  const renderMarkersRef = useRef(renderMarkers);
  renderMarkersRef.current = renderMarkers;

  const renderUserMarkerRef = useRef(renderUserMarker);
  renderUserMarkerRef.current = renderUserMarker;

  const renderUniversityMarkerRef = useRef(renderUniversityMarker);
  renderUniversityMarkerRef.current = renderUniversityMarker;

  const panToPensionRef = useRef(panToPension);
  panToPensionRef.current = panToPension;

  const handleMapMoveEnd = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (moveEndTimeoutRef.current) {
      clearTimeout(moveEndTimeoutRef.current);
    }

    moveEndTimeoutRef.current = setTimeout(async () => {
      const currentMap = mapInstanceRef.current;
      if (!currentMap) return;

      const bounds = currentMap.getBounds();
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

        if (requestId === activeRequestIdRef.current && isApiSuccess(res)) {
          const mappedItems = res.data.items.map((dto) =>
            mapRawPensionToItem(dto as unknown as Record<string, unknown>),
          );
          setMapPensions(mappedItems);
          setActivePinId((prev) => {
            if (!prev) return null;
            const stillExists = mappedItems.some((p) => p.id === prev);
            return stillExists ? prev : null;
          });
        }
      } catch {
      } finally {
        if (requestId === activeRequestIdRef.current) {
          setIsAreaLoading(false);
        }
      }
    }, 400);
  }, []);

  const handleMapMoveEndRef = useRef(handleMapMoveEnd);
  handleMapMoveEndRef.current = handleMapMoveEnd;

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      const L = await import('leaflet');
      if (!isMounted || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;
      leafletModuleRef.current = L;

      let initialLat = -33.4489;
      let initialLng = -70.6693;
      let initialZoom = 13;

      const initProps = initPropsRef.current;
      if (initProps.selectedUniversity) {
        initialLat = initProps.selectedUniversity.latitude;
        initialLng = initProps.selectedUniversity.longitude;
        initialZoom = 15;
      } else if (initProps.selectedCity) {
        const cityMatch = initProps.cities.find(
          (c) => c.name.toLowerCase() === initProps.selectedCity?.toLowerCase(),
        );
        if (cityMatch) {
          initialLat = cityMatch.latitude;
          initialLng = cityMatch.longitude;
          initialZoom = 13;
        }
      } else if (initProps.selectedPension) {
        initialLat = initProps.selectedPension.latitude;
        initialLng = initProps.selectedPension.longitude;
        initialZoom = 15;
      } else if (initProps.userLocation) {
        initialLat = initProps.userLocation.latitude;
        initialLng = initProps.userLocation.longitude;
        initialZoom = 14;
      }

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: initialZoom,
        zoomControl: false,
        attributionControl: false,
      });

      const tileUrl = getTileUrl(initProps.resolvedTheme);

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 20,
        subdomains: 'abcd',
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;

      map.on('moveend', () => {
        handleMapMoveEndRef.current();
      });

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;

      setTimeout(() => {
        if (isMounted && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      renderMarkersRef.current();
      renderUserMarkerRef.current();
      renderUniversityMarkerRef.current();

      const initialPension = initProps.selectedPension;
      if (initialPension && !initProps.selectedCity && !initProps.selectedUniversity) {
        setTimeout(() => {
          if (isMounted) {
            panToPensionRef.current(initialPension.latitude, initialPension.longitude);
          }
        }, 160);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (moveEndTimeoutRef.current) {
        clearTimeout(moveEndTimeoutRef.current);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      tileLayerRef.current = null;
      markersLayerRef.current = null;
      userMarkerRef.current = null;
      universityMarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(getTileUrl(resolvedTheme));
    }
  }, [resolvedTheme]);

  useEffect(() => {
    renderMarkers();
  }, [renderMarkers]);

  useEffect(() => {
    renderUserMarker();
  }, [renderUserMarker]);

  useEffect(() => {
    renderUniversityMarker();
  }, [renderUniversityMarker]);

  useEffect(() => {
    if (selectedPension) {
      setActivePinId(selectedPension.id);
      if (cardListRef.current) {
        cardListRef.current.scrollTop = 0;
      }
      panToPension(selectedPension.latitude, selectedPension.longitude);
    } else {
      setActivePinId(null);
    }
  }, [selectedPension, panToPension]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedUniversity) return;
    setActivePinId(null);
    map.flyTo([selectedUniversity.latitude, selectedUniversity.longitude], 15, {
      duration: 1.2,
    });
  }, [selectedUniversity]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedCity || selectedUniversity) return;
    setActivePinId(null);
    const cityMatch = cities.find((c) => c.name.toLowerCase() === selectedCity.toLowerCase());
    if (cityMatch) {
      map.flyTo([cityMatch.latitude, cityMatch.longitude], 13, {
        duration: 1.2,
      });
    }
  }, [selectedCity, cities, selectedUniversity]);

  const handleCenterOnUser = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.latitude, userLocation.longitude], 15, {
        duration: 1.2,
      });
    } else {
      onRequestLocation();
    }
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const currentY = drawerY.get();
    const vy = info.velocity.y;

    if (vy < -400) {
      if (drawerState === 'minimized') {
        setDrawerState('half');
      } else {
        setDrawerState('maximized');
      }
      return;
    }

    if (vy > 400) {
      if (drawerState === 'maximized') {
        setDrawerState('half');
      } else {
        setDrawerState('minimized');
      }
      return;
    }

    const snapPoints: Array<{ state: DrawerState; y: number }> = [
      { state: 'maximized', y: maximizedY },
      { state: 'half', y: halfY },
      { state: 'minimized', y: minimizedY },
    ];

    let closest = snapPoints[0];
    let minDiff = Math.abs(currentY - snapPoints[0].y);
    for (const p of snapPoints) {
      const diff = Math.abs(currentY - p.y);
      if (diff < minDiff) {
        minDiff = diff;
        closest = p;
      }
    }
    setDrawerState(closest.state);
  };

  const handleToggleDrawer = () => {
    if (drawerState === 'minimized') {
      setDrawerState('half');
    } else if (drawerState === 'half') {
      setDrawerState('maximized');
    } else {
      setDrawerState('minimized');
    }
  };

  const buttonBottomClass =
    drawerState === 'minimized'
      ? 'bottom-20'
      : drawerState === 'half'
        ? 'bottom-[calc(50%+16px)]'
        : 'bottom-20 opacity-0 pointer-events-none';

  return (
    <div
      id="map-screen-container"
      className="relative flex h-full w-full overflow-hidden bg-background select-none"
    >
      <aside
        id="desktop-map-sidebar"
        className="hidden lg:flex w-[440px] xl:w-[480px] 2xl:w-[520px] shrink-0 h-full flex-col border-r border-border/70 bg-card/95 backdrop-blur-xl z-20 overflow-hidden"
      >
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground tracking-tight">
              {displayedPensions.length} Pensiones disponibles
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Explora en el listado o interactúa con los marcadores
            </p>
          </div>
          {selectedCity && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
              {selectedCity}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
          <Suspense fallback={<MapDrawerSkeleton />}>
            <MapDrawerPensionList
              displayedPensions={displayedPensions}
              isAreaLoading={isAreaLoading}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
              onSelectPension={(p) => {
                panToPension(p);
                onSelectPension(p);
              }}
              onOpenPensionDetail={onOpenPensionDetail}
              setActivePinId={setActivePinId}
            />
          </Suspense>
        </div>
      </aside>

      <div className="relative flex-1 h-full w-full overflow-hidden">
        <div ref={mapContainerRef} className="h-full w-full z-0" />

        <AnimatePresence>
          {isAreaLoading && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            >
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/90 border border-border/80 text-xs font-semibold text-foreground shadow-lg backdrop-blur-md">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Buscando en esta zona...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          id="center-user-location-btn"
          onClick={handleCenterOnUser}
          className={`absolute right-4 ${buttonBottomClass} lg:bottom-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-card/95 text-foreground shadow-lg backdrop-blur-md hover:bg-secondary active:scale-90 transition-all duration-300 cursor-pointer`}
          title="Centrar en mi ubicación"
          aria-label="Centrar en mi ubicación"
        >
          <Locate className="h-5 w-5 text-primary" />
        </button>

        <motion.div
          id="collapsible-pension-drawer"
          drag="y"
          dragListener={false}
          dragControls={dragControls}
          dragConstraints={{ top: maximizedY, bottom: minimizedY }}
          dragElastic={0.06}
          style={{ y: drawerY }}
          animate={{ y: targetY }}
          transition={{ type: 'spring', damping: 30, stiffness: 280 }}
          onDragEnd={handleDragEnd}
          className="absolute inset-x-0 top-0 bottom-0 z-30 flex flex-col rounded-t-3xl border-t border-border/70 bg-card/95 backdrop-blur-2xl shadow-2xl overflow-hidden lg:hidden"
        >
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="w-full flex flex-col items-center justify-center pt-2.5 pb-2 select-none shrink-0 cursor-grab active:cursor-grabbing touch-none"
          >
            <button
              type="button"
              onClick={handleToggleDrawer}
              className="w-full flex justify-center py-1 cursor-pointer"
              aria-label="Alternar panel"
            >
              <div className="h-1.5 w-12 rounded-full bg-muted-foreground/40 hover:bg-muted-foreground/60 transition-colors" />
            </button>
            <div className="flex w-full items-center justify-between px-5 pt-0.5">
              <button
                type="button"
                onClick={handleToggleDrawer}
                className="text-sm font-bold text-foreground tracking-tight hover:text-primary transition cursor-pointer text-left"
              >
                {pensions.length} Pensiones disponibles
              </button>
              <div className="flex items-center gap-2 text-xs text-primary font-semibold">
                {drawerState === 'minimized' ? (
                  <button
                    type="button"
                    onClick={() => setDrawerState('half')}
                    className="flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    Ver lista <ChevronUp className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDrawerState('minimized')}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Minimizar <ChevronDown className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div
            ref={cardListRef}
            className="relative flex-1 overflow-y-auto px-5 pb-24 pt-2 flex flex-col gap-6"
          >
            <Suspense fallback={<MapDrawerSkeleton />}>
              <MapDrawerPensionList
                displayedPensions={displayedPensions}
                isAreaLoading={isAreaLoading}
                isFavorite={isFavorite}
                toggleFavorite={toggleFavorite}
                onSelectPension={onSelectPension}
                onOpenPensionDetail={onOpenPensionDetail}
                setActivePinId={setActivePinId}
              />
            </Suspense>
          </div>

          {drawerState === 'maximized' && (
            <div className="absolute bottom-[5.25rem] left-1/2 -translate-x-1/2 z-40">
              <button
                type="button"
                onClick={() => setDrawerState('minimized')}
                className="flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-xs font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                aria-label="Volver al mapa"
              >
                <span>Mapa</span>
                <span role="img" aria-label="mapa">
                  🗺️
                </span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

type MapDrawerPensionListProps = {
  displayedPensions: PensionItem[];
  isAreaLoading: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  onSelectPension: (pension: PensionItem) => void;
  onOpenPensionDetail: (pension: PensionItem) => void;
  setActivePinId: (id: string) => void;
};

function MapDrawerPensionList({
  displayedPensions,
  isAreaLoading,
  isFavorite,
  toggleFavorite,
  onSelectPension,
  onOpenPensionDetail,
  setActivePinId,
}: MapDrawerPensionListProps) {
  if (isAreaLoading && displayedPensions.length === 0) {
    return <MapDrawerSkeleton />;
  }

  return (
    <>
      {displayedPensions.map((pension) => {
        const isFav = isFavorite(pension.id);

        return (
          <div
            key={pension.id}
            id={`pension-item-${pension.id}`}
            className="group relative flex flex-col text-left transition"
          >
            <button
              type="button"
              onClick={() => {
                setActivePinId(pension.id);
                onSelectPension(pension);
                onOpenPensionDetail(pension);
              }}
              className="w-full flex flex-col text-left cursor-pointer"
            >
              <div className="relative w-full aspect-[16/10] overflow-hidden rounded-2xl bg-muted shadow-sm">
                <Image
                  src={pension.photos[0]}
                  alt={pension.title}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, 480px"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {pension.isVerified && (
                  <div className="absolute bottom-3 left-3">
                    <span className="rounded-full bg-background/80 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur-md border border-border/60">
                      Verificada
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-2.5 flex flex-col gap-1 w-full">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-base font-semibold text-foreground leading-snug line-clamp-1 group-hover:text-primary transition">
                    {pension.title}
                  </h4>
                  <div className="flex items-center gap-1 text-sm font-semibold text-foreground shrink-0">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>{pension.ratingAverage.toFixed(1)}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-1">
                  {pension.neighborhood}, {pension.city} • a {pension.distanceToUniversityMeters}m
                  de campus
                </p>

                <div className="mt-0.5 flex items-baseline gap-1">
                  <span className="text-base font-bold text-foreground">
                    ${pension.priceMonthlyClp.toLocaleString('es-CL')} CLP
                  </span>
                  <span className="text-xs text-muted-foreground">/ mes</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => toggleFavorite(pension.id)}
              className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/60 text-foreground backdrop-blur-md hover:text-primary transition active:scale-90 shadow-sm border border-border/40 cursor-pointer"
              aria-label="Guardar en favoritos"
            >
              <Heart className={`h-5 w-5 ${isFav ? 'fill-primary text-primary' : 'stroke-[2]'}`} />
            </button>
          </div>
        );
      })}
    </>
  );
}
