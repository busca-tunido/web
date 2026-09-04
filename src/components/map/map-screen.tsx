'use client';

import { ExternalLink, Heart, MapPin, Maximize2, Minimize2, Navigation, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import type { PensionItem } from '@/lib/types';

type MapScreenProps = {
  pensions: PensionItem[];
  selectedPension: PensionItem | null;
  onSelectPension: (pension: PensionItem) => void;
  onOpenPensionDetail: (pension: PensionItem) => void;
};

type DrawerState = 'minimized' | 'half' | 'maximized';

export function MapScreen({
  pensions,
  selectedPension,
  onSelectPension,
  onOpenPensionDetail,
}: MapScreenProps) {
  const { isFavorite, toggleFavorite } = useAuth();
  const [drawerState, setDrawerState] = useState<DrawerState>('half');
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
    if (drawerState === 'minimized') {
      setDrawerState('half');
    }
  };

  const mapPositions = [
    { id: 'pen-1', top: '38%', left: '42%' },
    { id: 'pen-2', top: '64%', left: '55%' },
    { id: 'pen-3', top: '26%', left: '60%' },
    { id: 'pen-4', top: '48%', left: '35%' },
    { id: 'pen-5', top: '22%', left: '25%' },
    { id: 'pen-6', top: '72%', left: '38%' },
    { id: 'pen-7', top: '80%', left: '68%' },
  ];

  return (
    <div
      id="map-screen-container"
      className="relative h-[calc(100vh-135px)] w-full overflow-hidden bg-zinc-950"
    >
      <div className="relative h-full w-full overflow-hidden select-none">
        <div className="absolute inset-0 bg-[#0f172a] opacity-95">
          <svg
            className="h-full w-full opacity-30"
            role="img"
            aria-label="Mapa interactivo de residencias universitarias"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Mapa interactivo de residencias universitarias</title>
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.75" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            <path
              d="M -50 150 Q 150 220 300 180 T 600 240"
              fill="none"
              stroke="#0284c7"
              strokeWidth="12"
              className="opacity-40"
            />
            <path
              d="M 50 -50 Q 180 200 220 500 T 260 800"
              fill="none"
              stroke="#475569"
              strokeWidth="10"
              className="opacity-50"
            />
            <path
              d="M 0 320 Q 200 350 450 300"
              fill="none"
              stroke="#64748b"
              strokeWidth="6"
              className="opacity-40"
            />
            <path
              d="M 120 40 Q 280 260 380 600"
              fill="none"
              stroke="#059669"
              strokeWidth="8"
              className="opacity-30"
            />
          </svg>
        </div>

        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <Badge className="bg-zinc-900/90 text-zinc-100 border border-zinc-700/80 backdrop-blur-md px-3 py-1 text-xs shadow-lg">
            <MapPin className="h-3.5 w-3.5 text-emerald-400 mr-1.5" />
            Santiago & Alrededores • {pensions.length} alojamientos
          </Badge>
        </div>

        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-300 shadow-lg backdrop-blur-md hover:text-white active:scale-95"
            title="Centrar en mi ubicación"
          >
            <Navigation className="h-4 w-4 text-emerald-400" />
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
                className={`group flex items-center rounded-full border px-2.5 py-1 text-xs font-black shadow-2xl transition-all duration-200 active:scale-90 ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-500 text-zinc-950 scale-110 ring-4 ring-emerald-500/30 z-30'
                    : 'border-zinc-700/90 bg-zinc-950/95 text-white hover:border-emerald-400 hover:bg-zinc-900'
                }`}
              >
                <span className="tracking-tight">
                  ${pension.priceMonthlyClp.toLocaleString('es-CL')} CLP
                </span>
              </button>

              {isSelected && (
                <div className="absolute -bottom-1.5 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-emerald-500" />
              )}
            </div>
          );
        })}
      </div>

      <div
        id="collapsible-pension-drawer"
        className={`absolute inset-x-0 bottom-0 z-30 flex flex-col rounded-t-3xl border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl shadow-2xl transition-all duration-300 ease-out ${
          drawerState === 'minimized' ? 'h-20' : drawerState === 'half' ? 'h-[46%]' : 'h-[85%]'
        }`}
      >
        <button
          type="button"
          onClick={() =>
            setDrawerState((prev) =>
              prev === 'minimized' ? 'half' : prev === 'half' ? 'maximized' : 'half',
            )
          }
          className="w-full flex flex-col items-center justify-center pt-2.5 pb-2 cursor-pointer select-none"
          aria-label="Alternar tamaño del panel de pensiones"
        >
          <div className="h-1.5 w-12 rounded-full bg-zinc-700/80" />
          <div className="flex w-full items-center justify-between px-5 pt-1.5">
            <span className="text-xs font-bold text-white">
              {pensions.length} Pensiones disponibles
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-400">
                {drawerState === 'minimized'
                  ? 'Ver lista'
                  : drawerState === 'half'
                    ? 'Maximizar'
                    : 'Reducir'}
              </span>
              <span className="rounded-lg p-1 text-zinc-400">
                {drawerState === 'maximized' ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </span>
            </div>
          </div>
        </button>

        <div
          ref={cardListRef}
          className="flex-1 overflow-y-auto px-4 pb-20 pt-1 flex flex-col gap-3"
        >
          {pensions.map((pension) => {
            const isSelected = pension.id === activePinId;
            const isFav = isFavorite(pension.id);

            return (
              <Card
                key={pension.id}
                id={`pension-card-${pension.id}`}
                onClick={() => {
                  setActivePinId(pension.id);
                  onSelectPension(pension);
                }}
                className={`overflow-hidden rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500/80 bg-zinc-900/90 shadow-lg shadow-emerald-500/10'
                    : 'border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700'
                }`}
              >
                <div className="flex p-3 gap-3">
                  <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-zinc-950">
                    <img
                      src={pension.photos[0]}
                      alt={pension.title}
                      className="h-full w-full object-cover"
                    />
                    {pension.isVerified && (
                      <div className="absolute top-1 left-1">
                        <Badge className="bg-emerald-500 text-zinc-950 font-black text-[9px] px-1 py-0">
                          ✓
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between overflow-hidden">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-white line-clamp-1">
                          {pension.title}
                        </h4>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(pension.id);
                          }}
                          className="text-zinc-400 hover:text-emerald-400 shrink-0"
                        >
                          <Heart
                            className={`h-4 w-4 ${isFav ? 'fill-emerald-400 text-emerald-400' : ''}`}
                          />
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                        {pension.neighborhood} • {pension.distanceToUniversityMeters}m de campus
                      </p>
                    </div>

                    <div className="flex items-end justify-between mt-2">
                      <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                        <Star className="h-3 w-3 fill-amber-400" />
                        <span>{pension.ratingAverage.toFixed(1)}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-white">
                          ${pension.priceMonthlyClp.toLocaleString('es-CL')}
                        </span>
                        <span className="text-[10px] text-zinc-400 ml-1">CLP</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex border-t border-zinc-800/80 bg-zinc-950/40 px-3 py-2 justify-between items-center">
                  <div className="flex gap-1.5">
                    {pension.includesWifi && (
                      <span className="text-[10px] text-zinc-400 bg-zinc-800/60 rounded px-1.5 py-0.5">
                        WiFi
                      </span>
                    )}
                    {pension.includesMeals && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 rounded px-1.5 py-0.5 font-medium">
                        Comida
                      </span>
                    )}
                    {pension.rooms.some((r) => r.hasPrivateBathroom) && (
                      <span className="text-[10px] text-zinc-300 bg-zinc-800/60 rounded px-1.5 py-0.5">
                        Baño Priv.
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPensionDetail(pension);
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    <span>Ver detalle</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
