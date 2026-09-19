'use client';

import { Bath, ChefHat, Home, Shirt, User, Users, Utensils, Wifi, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PriceHistogramRangeSlider } from '@/components/search/price-histogram-range-slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import { DEFAULT_PRICE_HISTOGRAM, usePriceHistogram } from '@/hooks/use-price-histogram';
import type { SearchFilters } from '@/lib/types';

type FilterDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
};

export function FilterDrawer({ isOpen, onClose, filters, onApply }: FilterDrawerProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [extraAmenities, setExtraAmenities] = useState<{
    kitchen: boolean;
    laundry: boolean;
    wifi: boolean;
  }>({
    kitchen: false,
    laundry: false,
    wifi: false,
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const { data: histogramData, isLoading: isHistogramLoading } = usePriceHistogram({
    city: localFilters.city,
  });

  const minBound = histogramData?.minPrice ?? DEFAULT_PRICE_HISTOGRAM.minPrice;
  const maxBound = histogramData?.maxPrice ?? DEFAULT_PRICE_HISTOGRAM.maxPrice;
  const currentMin = localFilters.minPriceClp ?? minBound;
  const currentMax = localFilters.maxPriceClp ?? maxBound;

  const handlePriceChange = (range: { min: number; max: number }) => {
    setLocalFilters((prev) => ({
      ...prev,
      minPriceClp: range.min <= minBound ? undefined : range.min,
      maxPriceClp: range.max >= maxBound ? undefined : range.max,
    }));
  };

  const matchingCount = useMemo(() => {
    if (!histogramData) return undefined;
    if (!histogramData.bins || histogramData.bins.length === 0) {
      return histogramData.totalListings;
    }
    const min = localFilters.minPriceClp ?? minBound;
    const max = localFilters.maxPriceClp ?? maxBound;

    return histogramData.bins
      .filter((bin) => bin.max >= min && bin.min <= max)
      .reduce((acc, bin) => acc + bin.count, 0);
  }, [histogramData, localFilters.minPriceClp, localFilters.maxPriceClp, minBound, maxBound]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (localFilters.minPriceClp !== undefined || localFilters.maxPriceClp !== undefined) {
      count += 1;
    }
    if (localFilters.roomType) count += 1;
    if (localFilters.hasPrivateBathroom) count += 1;
    if (localFilters.includesMeals) count += 1;
    if (extraAmenities.kitchen) count += 1;
    if (extraAmenities.laundry) count += 1;
    if (extraAmenities.wifi) count += 1;
    if (localFilters.genderPreference && localFilters.genderPreference !== 'ALL') {
      count += 1;
    }
    return count;
  }, [localFilters, extraAmenities]);

  const handleReset = () => {
    const reset: SearchFilters = {
      query: localFilters.query,
      city: localFilters.city,
      universityId: localFilters.universityId,
      minPriceClp: undefined,
      maxPriceClp: undefined,
      roomType: undefined,
      hasPrivateBathroom: undefined,
      includesMeals: undefined,
      minBeds: undefined,
      genderPreference: 'ALL',
      sortBy: localFilters.sortBy,
    };
    setLocalFilters(reset);
    setExtraAmenities({
      kitchen: false,
      laundry: false,
      wifi: false,
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        id="filter-drawer-content"
        className="max-w-lg md:max-w-2xl mx-auto bg-card border-border text-foreground md:rounded-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden"
      >
        <div className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex flex-col gap-2">
          <div className="mx-auto w-10 h-1 shrink-0 rounded-full bg-muted-foreground/30" />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center h-10 w-10 min-h-[48px] min-w-[48px] rounded-full hover:bg-muted text-foreground transition-colors"
              aria-label="Cerrar filtros"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <DrawerTitle className="font-semibold text-base text-foreground">Filtros</DrawerTitle>
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="h-5 px-1.5 text-xs font-semibold rounded-full bg-primary/10 text-primary border-primary/20"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </div>
            <button
              type="button"
              onClick={handleReset}
              disabled={activeFilterCount === 0}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-2 py-1 min-h-[48px] flex items-center justify-center"
            >
              Limpiar
            </button>
          </div>
          <DrawerDescription className="sr-only">
            Ajusta los filtros de búsqueda de pensiones
          </DrawerDescription>
        </div>

        <div className="flex-1 max-h-[82vh] overflow-y-auto pr-1 p-4 md:p-6 flex flex-col gap-6 divide-y divide-border">
          <div className="flex flex-col gap-4 pb-2">
            <div>
              <h3 className="text-base font-semibold text-foreground">Rango de Precios</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Precio mensual por pensión, incluye servicios
              </p>
            </div>
            <PriceHistogramRangeSlider
              minBound={minBound}
              maxBound={maxBound}
              minValue={currentMin}
              maxValue={currentMax}
              bins={histogramData?.bins ?? []}
              isLoading={isHistogramLoading}
              onChange={handlePriceChange}
            />
          </div>

          <div className="flex flex-col gap-3 pt-6 pb-2">
            <h3 className="text-base font-semibold text-foreground">Tipo de Alojamiento</h3>
            <div className="flex flex-wrap gap-2.5">
              {[
                { id: 'SINGLE' as const, label: 'Pieza Individual', icon: User },
                {
                  id: 'SHARED' as const,
                  label: 'Pieza Compartida',
                  icon: Users,
                },
                { id: 'STUDIO' as const, label: 'Estudio', icon: Home },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = localFilters.roomType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        roomType: prev.roomType === item.id ? undefined : item.id,
                      }))
                    }
                    className={`flex items-center gap-2 px-4 py-3 min-h-[48px] rounded-full border text-xs font-semibold transition active:scale-95 ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                        : 'border-border bg-card text-foreground hover:bg-muted hover:border-muted-foreground/30'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-6 pb-2">
            <h3 className="text-base font-semibold text-foreground">Comodidades Clave</h3>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    hasPrivateBathroom: !prev.hasPrivateBathroom ? true : undefined,
                  }))
                }
                className={`flex items-center gap-2 px-4 py-3 min-h-[48px] rounded-full border text-xs font-semibold transition active:scale-95 ${
                  localFilters.hasPrivateBathroom
                    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                    : 'border-border bg-card text-foreground hover:bg-muted hover:border-muted-foreground/30'
                }`}
              >
                <Bath className="h-4 w-4" />
                <span>Baño privado</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    includesMeals: !prev.includesMeals ? true : undefined,
                  }))
                }
                className={`flex items-center gap-2 px-4 py-3 min-h-[48px] rounded-full border text-xs font-semibold transition active:scale-95 ${
                  localFilters.includesMeals
                    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                    : 'border-border bg-card text-foreground hover:bg-muted hover:border-muted-foreground/30'
                }`}
              >
                <Utensils className="h-4 w-4" />
                <span>Comida incluida</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setExtraAmenities((prev) => ({
                    ...prev,
                    kitchen: !prev.kitchen,
                  }))
                }
                className={`flex items-center gap-2 px-4 py-3 min-h-[48px] rounded-full border text-xs font-semibold transition active:scale-95 ${
                  extraAmenities.kitchen
                    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                    : 'border-border bg-card text-foreground hover:bg-muted hover:border-muted-foreground/30'
                }`}
              >
                <ChefHat className="h-4 w-4" />
                <span>Cocina equipada</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setExtraAmenities((prev) => ({
                    ...prev,
                    laundry: !prev.laundry,
                  }))
                }
                className={`flex items-center gap-2 px-4 py-3 min-h-[48px] rounded-full border text-xs font-semibold transition active:scale-95 ${
                  extraAmenities.laundry
                    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                    : 'border-border bg-card text-foreground hover:bg-muted hover:border-muted-foreground/30'
                }`}
              >
                <Shirt className="h-4 w-4" />
                <span>Lavandería</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setExtraAmenities((prev) => ({
                    ...prev,
                    wifi: !prev.wifi,
                  }))
                }
                className={`flex items-center gap-2 px-4 py-3 min-h-[48px] rounded-full border text-xs font-semibold transition active:scale-95 ${
                  extraAmenities.wifi
                    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                    : 'border-border bg-card text-foreground hover:bg-muted hover:border-muted-foreground/30'
                }`}
              >
                <Wifi className="h-4 w-4" />
                <span>WiFi fibra</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-6 pb-2">
            <h3 className="text-base font-semibold text-foreground">
              Reglas de Convivencia y Género
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'MIXED' as const, label: 'Mixto' },
                { id: 'FEMALE_ONLY' as const, label: 'Solo Mujeres' },
                { id: 'MALE_ONLY' as const, label: 'Solo Hombres' },
              ].map((opt) => {
                const isSelected = localFilters.genderPreference === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        genderPreference: prev.genderPreference === opt.id ? 'ALL' : opt.id,
                      }))
                    }
                    className={`flex items-center justify-center p-3 min-h-[48px] rounded-xl border text-xs font-semibold transition active:scale-95 ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                        : 'border-border bg-card text-foreground hover:bg-muted hover:border-muted-foreground/30'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-20 border-t border-border bg-card p-4 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-xs font-semibold underline underline-offset-4 text-foreground hover:bg-muted min-h-[48px] px-4"
          >
            Limpiar todo
          </Button>
          <Button
            id="btn-apply-filters"
            onClick={handleApply}
            className="flex-1 md:flex-initial md:min-w-[200px] bg-primary hover:bg-primary/90 text-primary-foreground font-bold min-h-[48px] text-sm rounded-xl shadow-sm px-6"
          >
            {typeof matchingCount === 'number'
              ? `Mostrar ${matchingCount} ${matchingCount === 1 ? 'alojamiento' : 'alojamientos'}`
              : 'Mostrar alojamientos'}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
