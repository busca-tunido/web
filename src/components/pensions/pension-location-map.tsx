'use client';

import { ExternalLink, MapPin, Minus, Plus, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { env } from '@/env';
import { useTheme } from '@/lib/theme-context';

export type PensionLocationMapProps = {
  latitude: number;
  longitude: number;
  title: string;
  city: string;
  neighborhood?: string;
  address?: string;
};

function getTileUrl(theme: 'light' | 'dark'): string {
  const apiKey = env.NEXT_PUBLIC_CARTO_API_KEY;
  const keyParam = apiKey ? `?key=${apiKey}` : '';
  return theme === 'dark'
    ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${keyParam}`
    : `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${keyParam}`;
}

function createHouseMarkerIcon(
  L: typeof import('leaflet'),
  title: string,
): import('leaflet').DivIcon {
  const houseSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  `;
  const html = `
    <div style="width: 44px; height: 44px; transform: translate(-50%, -50%); cursor: pointer;" class="flex items-center justify-center" title="${title}">
      <div style="width: 44px; height: 44px; min-width: 44px; min-height: 44px; aspect-ratio: 1 / 1;" class="w-11 h-11 shrink-0 aspect-square rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-2 border-white dark:border-zinc-900 shadow-2xl ring-4 ring-black/15 dark:ring-white/20 flex items-center justify-center transition-transform hover:scale-110">
        ${houseSvg}
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

export function PensionLocationMap({
  latitude,
  longitude,
  title,
  city,
  neighborhood,
  address,
}: PensionLocationMapProps) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const markerRef = useRef<import('leaflet').Marker | null>(null);
  const tileLayerRef = useRef<import('leaflet').TileLayer | null>(null);

  const hasValidCoords =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude) &&
    (latitude !== 0 || longitude !== 0);

  const latestPropsRef = useRef({ latitude, longitude, title, resolvedTheme });
  latestPropsRef.current = { latitude, longitude, title, resolvedTheme };

  useEffect(() => {
    let isMounted = true;
    let observer: ResizeObserver | null = null;
    const timers: NodeJS.Timeout[] = [];

    async function initMap() {
      const L = await import('leaflet');
      if (!isMounted || !containerRef.current) return;
      if (mapRef.current) return;

      const {
        latitude: currentLat,
        longitude: currentLng,
        resolvedTheme: currentTheme,
        title: currentTitle,
      } = latestPropsRef.current;

      const map = L.map(containerRef.current, {
        center: [currentLat, currentLng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: true,
        touchZoom: true,
      });

      const tileUrl = getTileUrl(currentTheme);
      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 20,
        subdomains: 'abcd',
      }).addTo(map);

      const markerIcon = createHouseMarkerIcon(L, currentTitle);
      const marker = L.marker([currentLat, currentLng], {
        icon: markerIcon,
        zIndexOffset: 1000,
      }).addTo(map);

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
      scheduleInvalidate(450);

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
  }, []);

  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(getTileUrl(resolvedTheme));
    }
  }, [resolvedTheme]);

  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([latitude, longitude], 15, { animate: true });
      markerRef.current.setLatLng([latitude, longitude]);
      mapRef.current.invalidateSize();
    }
  }, [latitude, longitude]);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  const handleRecenter = useCallback(() => {
    mapRef.current?.setView([latitude, longitude], 15, { animate: true });
  }, [latitude, longitude]);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${address ? `${address}, ` : ''}${neighborhood ? `${neighborhood}, ` : ''}${city}, Chile`,
  )}`;

  const locationSubtitle = `${neighborhood ? `${neighborhood}, ` : ''}${city}, Chile`;

  if (!hasValidCoords) {
    return null;
  }

  return (
    <section className="mb-6 pt-1">
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <h4 className="text-base font-bold text-foreground tracking-tight">Dónde vas a estar</h4>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <MapPin className="h-3 w-3 text-primary shrink-0" />
            <span>{locationSubtitle}</span>
          </p>
        </div>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 transition"
        >
          <span>Cómo llegar</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="relative h-64 sm:h-72 md:h-80 w-full rounded-2xl overflow-hidden border border-border/80 shadow-sm bg-muted/40 mt-3">
        <div ref={containerRef} className="h-full w-full z-0" />

        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-md border border-border/80 shadow-md text-xs font-semibold text-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{neighborhood || city}</span>
          </div>
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
            aria-label="Centrar en pensión"
            title="Centrar en pensión"
          >
            <RotateCcw className="h-4 w-4 text-primary" />
          </button>
        </div>

        <div className="absolute bottom-3 right-3 z-10">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card/90 backdrop-blur-md border border-border/80 shadow-md text-[11px] font-semibold text-foreground hover:bg-secondary hover:text-primary transition"
          >
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
            <span>Google Maps</span>
          </a>
        </div>
      </div>
    </section>
  );
}
