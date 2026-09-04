'use client';

import { Heart, MapPin, Maximize2, Minimize2, Navigation, Star } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import type { PensionItem } from '@/lib/types';

type MapScreenProps = {
  pensions: PensionItem[];
  selectedPension: PensionItem | null;
  onSelectPension: (pension: PensionItem) => void;
  onOpenPensionDetail: (pension: PensionItem) => void;
};

type DrawerState = 'minimized' | 'maximized';

export function MapScreen({
  pensions,
  selectedPension,
  onSelectPension,
  onOpenPensionDetail,
}: MapScreenProps) {
  const { isFavorite, toggleFavorite } = useAuth();
  const [drawerState, setDrawerState] = useState<DrawerState>('minimized');
  const [activePinId, setActivePinId] = useState<string | null>(pensions[0]?.id ?? null);
  const cardListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedPension) {
      setActivePinId(selectedPension.id);
    }
  }, [selectedPension]);

  const handlePinClick = (pension: PensionItem) => {
    setActivePinId(pension.id);
    onSelectPension(pension);
  };

  const mapPositions = [
    { id: 'pen-1', top: '34%', left: '42%' },
    { id: 'pen-2', top: '50%', left: '55%' },
    { id: 'pen-3', top: '22%', left: '60%' },
    { id: 'pen-4', top: '42%', left: '32%' },
    { id: 'pen-5', top: '18%', left: '25%' },
    { id: 'pen-6', top: '56%', left: '38%' },
    { id: 'pen-7', top: '28%', left: '72%' },
  ];

  return (
    <div
      id="map-screen-container"
      className="relative h-[calc(100vh-135px)] w-full overflow-hidden bg-background"
    >
      <div className="relative h-full w-full overflow-hidden select-none">
        <div className="absolute inset-0 bg-muted/30">
          <svg
            className="h-full w-full opacity-60 dark:opacity-35"
            role="img"
            aria-label="Mapa interactivo de residencias universitarias"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Mapa interactivo de residencias universitarias</title>
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  className="stroke-border"
                  strokeWidth="0.75"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            <path
              d="M -50 150 Q 150 220 300 180 T 600 240"
              fill="none"
              className="stroke-primary/40"
              strokeWidth="12"
            />
            <path
              d="M 50 -50 Q 180 200 220 500 T 260 800"
              fill="none"
              className="stroke-border"
              strokeWidth="10"
            />
            <path
              d="M 0 320 Q 200 350 450 300"
              fill="none"
              className="stroke-border/70"
              strokeWidth="6"
            />
            <path
              d="M 120 40 Q 280 260 380 600"
              fill="none"
              className="stroke-primary/30"
              strokeWidth="8"
            />
          </svg>
        </div>

        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <Badge className="bg-card/90 text-foreground border border-border backdrop-blur-md px-3 py-1.5 text-xs shadow-md">
            <MapPin className="h-3.5 w-3.5 text-primary mr-1.5" />
            Santiago • {pensions.length} alojamientos
          </Badge>
        </div>

        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/90 text-foreground shadow-md backdrop-blur-md hover:bg-secondary active:scale-95 transition"
            title="Centrar en mi ubicación"
          >
            <Navigation className="h-4 w-4 text-primary" />
          </button>
        </div>

        {pensions.map((pension, index) => {
          const pos = mapPositions[index % mapPositions.length];
          const isSelected = pension.id === activePinId;
          return (
            <div
              key={pension.id}
              style={{ top: pos.top, left: pos.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-200"
            >
              <button
                type="button"
                id={`map-price-pin-${pension.id}`}
                onClick={() => handlePinClick(pension)}
                className={`group flex items-center rounded-full border px-3 py-1 text-xs font-bold shadow-md transition-all duration-200 active:scale-90 ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground scale-110 ring-4 ring-primary/20 z-30'
                    : 'border-border bg-card/95 text-foreground hover:border-primary hover:bg-secondary'
                }`}
              >
                <span className="tracking-tight">
                  ${pension.priceMonthlyClp.toLocaleString('es-CL')} CLP
                </span>
              </button>

              {isSelected && (
                <div className="absolute -bottom-1.5 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-primary" />
              )}
            </div>
          );
        })}
      </div>

      <div
        id="collapsible-pension-drawer"
        className={`absolute inset-x-0 bottom-0 z-30 flex flex-col rounded-t-3xl border-t border-border/70 bg-card/95 backdrop-blur-2xl shadow-2xl transition-all duration-300 ease-out ${
          drawerState === 'minimized' ? 'h-[400px]' : 'h-[88%]'
        }`}
      >
        <button
          type="button"
          onClick={() =>
            setDrawerState((prev) => (prev === 'minimized' ? 'maximized' : 'minimized'))
          }
          className="w-full flex flex-col items-center justify-center pt-3 pb-2 cursor-pointer select-none"
          aria-label="Alternar tamaño del panel de pensiones"
        >
          <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
          <div className="flex w-full items-center justify-between px-5 pt-2">
            <span className="text-sm font-bold text-foreground tracking-tight">
              {pensions.length} Pensiones disponibles
            </span>
            <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
              <span>{drawerState === 'minimized' ? 'Ver todas' : 'Minimizar'}</span>
              {drawerState === 'maximized' ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </div>
          </div>
        </button>

        <div
          ref={cardListRef}
          className="flex-1 overflow-y-auto px-5 pb-24 pt-2 flex flex-col gap-6"
        >
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
                  className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/60 text-foreground backdrop-blur-md hover:text-primary transition active:scale-90 shadow-sm border border-border/40"
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
      </div>
    </div>
  );
}
