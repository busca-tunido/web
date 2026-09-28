'use client';

import { Crosshair, Hand, MapPin, Minus, Plus, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { env } from '@/env';
import { useTheme } from '@/lib/theme-context';
import { cn } from '@/lib/utils';

export type PensionLocationPickerMapProps = {
  latitude: number;
  longitude: number;
  city: string;
  neighborhood?: string;
  address?: string;
  onLocationChange: (latitude: number, longitude: number) => void;
  className?: string;
};

function getTileUrl(theme: 'light' | 'dark'): string {
  const apiKey = env.NEXT_PUBLIC_CARTO_API_KEY;
  const keyParam = apiKey ? `?key=${apiKey}` : '';
  return theme === 'dark'
    ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${keyParam}`
    : `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${keyParam}`;
}

function createPickerMarkerIcon(L: typeof import('leaflet')): import('leaflet').DivIcon {
  const houseSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  `;

  const html = `
    <div style="width: 48px; height: 48px; transform: translate(-50%, -50%); cursor: grab;" class="flex items-center justify-center group" title="Arrastra o haz clic para ubicar">
      <div class="relative flex items-center justify-center">
        <span class="absolute -top-1 -right-1 flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </span>
        <div style="width: 46px; height: 46px;" class="rounded-full bg-primary text-primary-foreground border-2 border-white dark:border-zinc-900 shadow-2xl ring-4 ring-primary/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
          ${houseSvg}
        </div>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-div-icon',
    html,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export function PensionLocationPickerMap({
  latitude,
  longitude,
  city,
  neighborhood,
  address,
  onLocationChange,
  className,
}: PensionLocationPickerMapProps) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const markerRef = useRef<import('leaflet').Marker | null>(null);
  const tileLayerRef = useRef<import('leaflet').TileLayer | null>(null);

  const onLocationChangeRef = useRef(onLocationChange);
  onLocationChangeRef.current = onLocationChange;

  const currentCoordsRef = useRef({ latitude, longitude });
  currentCoordsRef.current = { latitude, longitude };

  useEffect(() => {
    let isMounted = true;
    let observer: ResizeObserver | null = null;
    const timers: NodeJS.Timeout[] = [];

    async function initMap() {
      const L = await import('leaflet');
      if (!isMounted || !containerRef.current) return;
      if (mapRef.current) return;

      const { latitude: initLat, longitude: initLng } = currentCoordsRef.current;

      const map = L.map(containerRef.current, {
        center: [initLat, initLng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
        dragging: true,
        touchZoom: true,
      });

      const tileUrl = getTileUrl(resolvedTheme);
      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 20,
        subdomains: 'abcd',
      }).addTo(map);

      const markerIcon = createPickerMarkerIcon(L);
      const marker = L.marker([initLat, initLng], {
        icon: markerIcon,
        draggable: true,
        autoPan: true,
        zIndexOffset: 1000,
      }).addTo(map);

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        const roundedLat = Number(position.lat.toFixed(6));
        const roundedLng = Number(position.lng.toFixed(6));
        currentCoordsRef.current = { latitude: roundedLat, longitude: roundedLng };
        onLocationChangeRef.current(roundedLat, roundedLng);
      });

      map.on('click', (e) => {
        const roundedLat = Number(e.latlng.lat.toFixed(6));
        const roundedLng = Number(e.latlng.lng.toFixed(6));
        marker.setLatLng([roundedLat, roundedLng]);
        currentCoordsRef.current = { latitude: roundedLat, longitude: roundedLng };
        onLocationChangeRef.current(roundedLat, roundedLng);
      });

      tileLayerRef.current = tileLayer;
      markerRef.current = marker;
      mapRef.current = map;

      const scheduleInvalidate = (delayMs: number) => {
        const timer = setTimeout(() => {
          if (isMounted && mapRef.current) {
            mapRef.current.invalidateSize();
          }
        }, delayMs);
        timers.push(timer);
      };

      scheduleInvalidate(100);
      scheduleInvalidate(250);
      scheduleInvalidate(500);

      if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
        observer = new ResizeObserver(() => {
          if (isMounted && mapRef.current) {
            mapRef.current.invalidateSize();
          }
        });
        observer.observe(containerRef.current);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      for (const t of timers) {
        clearTimeout(t);
      }
      if (observer) {
        observer.disconnect();
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
      tileLayerRef.current = null;
    };
  }, [resolvedTheme]);

  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(getTileUrl(resolvedTheme));
    }
  }, [resolvedTheme]);

  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      const currentPos = markerRef.current.getLatLng();
      const distance = Math.hypot(currentPos.lat - latitude, currentPos.lng - longitude);

      if (distance > 0.0001) {
        markerRef.current.setLatLng([latitude, longitude]);
        mapRef.current.setView([latitude, longitude], mapRef.current.getZoom() || 15, {
          animate: true,
        });
        mapRef.current.invalidateSize();
      }
    }
  }, [latitude, longitude]);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  const handleRecenter = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setView([latitude, longitude], 15, { animate: true });
      markerRef.current?.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const displaySubtitle = [address, neighborhood, city].filter(Boolean).join(', ');

  return (
    <div
      className={cn(
        'relative w-full rounded-2xl overflow-hidden border border-border/80 shadow-xs bg-muted/40',
        className,
      )}
    >
      <div className="relative h-64 sm:h-72 w-full">
        <div ref={containerRef} className="h-full w-full z-0 cursor-crosshair" />

        <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-md border border-border/80 shadow-md text-xs font-semibold text-foreground">
            <Hand className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Haz clic o arrastra el pin</span>
          </div>
          {displaySubtitle && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card/80 backdrop-blur-md border border-border/60 text-[10px] text-muted-foreground truncate max-w-xs">
              <MapPin className="h-3 w-3 text-primary shrink-0" />
              <span className="truncate">{displaySubtitle}</span>
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
          <div className="flex flex-col rounded-xl bg-card/90 backdrop-blur-md border border-border/80 shadow-md overflow-hidden">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-2 hover:bg-secondary text-foreground active:scale-95 transition cursor-pointer"
              aria-label="Acercar mapa"
              title="Acercar"
            >
              <Plus className="h-4 w-4" />
            </button>
            <div className="h-px w-full bg-border/60" />
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-2 hover:bg-secondary text-foreground active:scale-95 transition cursor-pointer"
              aria-label="Alejar mapa"
              title="Alejar"
            >
              <Minus className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleRecenter}
            className="p-2 rounded-xl bg-card/90 backdrop-blur-md border border-border/80 shadow-md text-foreground hover:bg-secondary active:scale-95 transition cursor-pointer flex items-center justify-center"
            aria-label="Centrar en ubicación actual"
            title="Centrar mapa"
          >
            <RotateCcw className="h-4 w-4 text-primary" />
          </button>
        </div>

        <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-10 flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/90 backdrop-blur-md border border-border/80 shadow-md text-[11px] font-mono font-medium text-foreground">
            <Crosshair className="h-3 w-3 text-primary shrink-0" />
            <span>
              {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
