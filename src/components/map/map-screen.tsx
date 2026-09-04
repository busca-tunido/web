'use client';

import { ChevronDown, ChevronUp, Heart, Locate, Maximize2, Minimize2, Star } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import type { CityInfo, PensionItem, UniversityInfo } from '@/lib/types';
import type { UserCoordinates } from '@/lib/use-user-location';

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

  const [drawerState, setDrawerState] = useState<DrawerState>('minimized');
  const [activePinId, setActivePinId] = useState<string | null>(
    selectedPension?.id ?? pensions[0]?.id ?? null,
  );

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null);
  const tileLayerRef = useRef<import('leaflet').TileLayer | null>(null);
  const markersLayerRef = useRef<import('leaflet').LayerGroup | null>(null);
  const userMarkerRef = useRef<import('leaflet').Marker | null>(null);
  const universityMarkerRef = useRef<import('leaflet').Marker | null>(null);
  const leafletModuleRef = useRef<typeof import('leaflet') | null>(null);

  const activePension =
    pensions.find((p) => p.id === activePinId) ?? selectedPension ?? pensions[0] ?? null;

  const renderMarkers = useCallback(() => {
    const L = leafletModuleRef.current;
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!L || !map || !markersGroup) return;

    markersGroup.clearLayers();

    for (const pension of pensions) {
      const isSelected = pension.id === activePinId;
      const formattedPrice = `$${pension.priceMonthlyClp.toLocaleString('es-CL')} CLP`;

      const iconHtml = isSelected
        ? `<div style="transform: translate(-50%, -50%); cursor: pointer;">
             <div class="px-3 py-1 rounded-full text-xs font-bold shadow-lg transition-transform scale-110 bg-primary text-primary-foreground border border-primary ring-4 ring-primary/25 flex items-center justify-center whitespace-nowrap">
               ${formattedPrice}
             </div>
           </div>`
        : `<div style="transform: translate(-50%, -50%); cursor: pointer;">
             <div class="px-2.5 py-1 rounded-full text-xs font-bold shadow-md bg-card text-foreground border border-border hover:border-primary/60 hover:bg-secondary flex items-center justify-center whitespace-nowrap">
               ${formattedPrice}
             </div>
           </div>`;

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: iconHtml,
        iconSize: [120, 32],
        iconAnchor: [60, 16],
      });

      const marker = L.marker([pension.latitude, pension.longitude], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 100,
      });

      marker.on('click', () => {
        setActivePinId(pension.id);
        onSelectPension(pension);
        setDrawerState('half');
      });

      marker.addTo(markersGroup);
    }
  }, [pensions, activePinId, onSelectPension]);

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
        iconSize: [120, 36],
        iconAnchor: [60, 36],
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

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      const L = await import('leaflet');
      if (!isMounted || !mapContainerRef.current) return;
      leafletModuleRef.current = L;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      let initialLat = -33.4489;
      let initialLng = -70.6693;
      let initialZoom = 13;

      if (selectedUniversity) {
        initialLat = selectedUniversity.latitude;
        initialLng = selectedUniversity.longitude;
        initialZoom = 15;
      } else if (selectedCity) {
        const cityMatch = cities.find((c) => c.name.toLowerCase() === selectedCity.toLowerCase());
        if (cityMatch) {
          initialLat = cityMatch.latitude;
          initialLng = cityMatch.longitude;
          initialZoom = 13;
        }
      } else if (userLocation) {
        initialLat = userLocation.latitude;
        initialLng = userLocation.longitude;
        initialZoom = 14;
      }

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: initialZoom,
        zoomControl: false,
        attributionControl: false,
      });

      const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;

      setTimeout(() => {
        if (isMounted && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      renderMarkers();
      renderUserMarker();
      renderUniversityMarker();
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      tileLayerRef.current = null;
      markersLayerRef.current = null;
      userMarkerRef.current = null;
      universityMarkerRef.current = null;
    };
  }, [
    cities,
    renderMarkers,
    renderUserMarker,
    renderUniversityMarker,
    selectedCity,
    selectedUniversity,
    userLocation,
  ]);

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
    }
  }, [selectedPension]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedUniversity) return;
    map.flyTo([selectedUniversity.latitude, selectedUniversity.longitude], 15, {
      duration: 1.2,
    });
  }, [selectedUniversity]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedCity || selectedUniversity) return;
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
        ? 'bottom-[356px]'
        : 'bottom-20 opacity-0 pointer-events-none';

  return (
    <div
      id="map-screen-container"
      className="relative h-[calc(100vh-135px)] w-full overflow-hidden bg-background select-none"
    >
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      <button
        type="button"
        id="center-user-location-btn"
        onClick={handleCenterOnUser}
        className={`absolute right-4 ${buttonBottomClass} z-[400] flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-card/95 text-foreground shadow-lg backdrop-blur-md hover:bg-secondary active:scale-90 transition-all duration-300 cursor-pointer`}
        title="Centrar en mi ubicación"
        aria-label="Centrar en mi ubicación"
      >
        <Locate className="h-5 w-5 text-primary" />
      </button>

      <div
        id="collapsible-pension-drawer"
        className={`absolute inset-x-0 bottom-0 z-[500] flex flex-col rounded-t-3xl border-t border-border/70 bg-card/95 backdrop-blur-2xl shadow-2xl transition-all duration-300 ease-out ${
          drawerState === 'minimized' ? 'h-16' : drawerState === 'half' ? 'h-[340px]' : 'h-[88%]'
        }`}
      >
        <div className="w-full flex flex-col items-center justify-center pt-2.5 pb-2 select-none">
          <button
            type="button"
            onClick={handleToggleDrawer}
            className="w-full flex justify-center py-1 cursor-pointer"
            aria-label="Alternar panel"
          >
            <div className="h-1.5 w-12 rounded-full bg-muted-foreground/40" />
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
              {drawerState === 'minimized' && (
                <button
                  type="button"
                  onClick={() => setDrawerState('half')}
                  className="flex items-center gap-1 hover:underline cursor-pointer"
                >
                  Ver lista <ChevronUp className="h-4 w-4" />
                </button>
              )}
              {drawerState === 'half' && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDrawerState('maximized')}
                    className="flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    Ver todas <Maximize2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerState('minimized')}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Minimizar <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {drawerState === 'maximized' && (
                <button
                  type="button"
                  onClick={() => setDrawerState('minimized')}
                  className="flex items-center gap-1 hover:underline cursor-pointer"
                >
                  Minimizar <Minimize2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {drawerState === 'half' && activePension && (
          <div className="px-5 pt-2 pb-5 flex-1 flex flex-col justify-between">
            <div className="group relative flex gap-3.5 items-center p-2 rounded-2xl border border-border/60 bg-secondary/30 hover:bg-secondary/60 transition">
              <button
                type="button"
                onClick={() => onOpenPensionDetail(activePension)}
                className="flex-1 flex gap-3.5 items-center text-left cursor-pointer min-w-0"
              >
                <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={activePension.photos[0]}
                    alt={activePension.title}
                    fill
                    unoptimized
                    sizes="112px"
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                  {activePension.isVerified && (
                    <span className="absolute bottom-1.5 left-1.5 rounded bg-background/85 px-1.5 py-0.5 text-[9px] font-semibold text-foreground backdrop-blur-sm">
                      Verificada
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-1 pr-8">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition">
                      {activePension.title}
                    </h4>
                    <div className="flex items-center gap-1 text-xs font-semibold text-foreground shrink-0">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{activePension.ratingAverage.toFixed(1)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {activePension.neighborhood}, {activePension.city}
                  </p>

                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    a {activePension.distanceToUniversityMeters}m de campus
                  </p>

                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-sm font-bold text-foreground">
                      ${activePension.priceMonthlyClp.toLocaleString('es-CL')} CLP
                    </span>
                    <span className="text-[10px] text-muted-foreground">/ mes</span>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => toggleFavorite(activePension.id)}
                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-md hover:text-primary transition active:scale-90 cursor-pointer"
                aria-label="Guardar en favoritos"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isFavorite(activePension.id) ? 'fill-primary text-primary' : 'stroke-[2]'
                  }`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onOpenPensionDetail(activePension)}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs text-center shadow hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
            >
              Ver detalles de esta pensión
            </button>
          </div>
        )}

        {drawerState === 'maximized' && (
          <div className="relative flex-1 overflow-y-auto px-5 pb-24 pt-2 flex flex-col gap-6">
            {pensions.map((pension) => {
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
                        {pension.neighborhood}, {pension.city} • a{' '}
                        {pension.distanceToUniversityMeters}m de campus
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
                    <Heart
                      className={`h-5 w-5 ${isFav ? 'fill-primary text-primary' : 'stroke-[2]'}`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {drawerState === 'maximized' && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[600]">
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
      </div>
    </div>
  );
}
