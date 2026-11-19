'use client';

import {
  Bath,
  BedDouble,
  Check,
  Home,
  MapPin,
  Sparkles,
  User,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PriceHistogramRangeSlider } from '@/components/search/price-histogram-range-slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { usePriceHistogram } from '@/hooks/use-price-histogram';
import { isApiSuccess } from '@/lib/api-response';
import { countActiveFilters } from '@/lib/filter-chips';
import type { CityInfo, PensionAmenityCatalogItemDto, SearchFilters } from '@/lib/types';
import { pensionsService } from '@/services/pensions.service';

const REDUNDANT_CATALOG_SLUGS = new Set([
  'bano-privado',
  'comida-incluida',
  'pension-completa',
  'media-pension',
  'desayuno-incluido',
  'alimentacion-incluida',
]);

type FilterDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
  cities?: readonly CityInfo[];
  userLocation?: { latitude: number; longitude: number } | null;
};

export function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onApply,
  cities = [],
  userLocation,
}: FilterDrawerProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [amenitiesCatalog, setAmenitiesCatalog] = useState<PensionAmenityCatalogItemDto[]>([]);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (!isOpen || amenitiesCatalog.length > 0) return;
    let isMounted = true;
    const loadCatalog = async () => {
      const res = await pensionsService.fetchAmenitiesCatalog();
      if (isMounted && isApiSuccess(res) && Array.isArray(res.data)) {
        setAmenitiesCatalog(res.data.filter((item) => !REDUNDANT_CATALOG_SLUGS.has(item.slug)));
      }
    };
    void loadCatalog();
    return () => {
      isMounted = false;
    };
  }, [isOpen, amenitiesCatalog.length]);

  const { data: histogramData, isLoading: isHistogramLoading } = usePriceHistogram({
    filters: localFilters,
    userLocation,
    enabled: isOpen,
  });

  const minBound = histogramData?.minPrice ?? 100000;
  const maxBound = histogramData?.maxPrice ?? 600000;
  const currentMin = localFilters.minPriceClp ?? minBound;
  const currentMax = localFilters.maxPriceClp ?? maxBound;

  const handlePriceChange = (range: { min: number; max: number }) => {
    setLocalFilters((prev) => ({
      ...prev,
      minPriceClp: range.min <= minBound ? undefined : range.min,
      maxPriceClp: range.max >= maxBound ? undefined : range.max,
    }));
  };

  const toggleAmenity = (slug: string) => {
    setLocalFilters((prev) => {
      const current = prev.amenities ?? [];
      const exists = current.includes(slug);
      const next = exists ? current.filter((item) => item !== slug) : [...current, slug];
      return {
        ...prev,
        amenities: next.length > 0 ? next : undefined,
      };
    });
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

  const activeFilterCount = useMemo(
    () => countActiveFilters(localFilters, { includeCity: true, includeSort: true }),
    [localFilters],
  );

  const handleReset = () => {
    setLocalFilters({
      query: localFilters.query,
      universityId: localFilters.universityId,
      city: undefined,
      neighborhood: undefined,
      minPriceClp: undefined,
      maxPriceClp: undefined,
      roomType: undefined,
      hasPrivateBathroom: undefined,
      includesMeals: undefined,
      amenities: undefined,
      minBeds: undefined,
      onlyAvailable: undefined,
      genderPreference: undefined,
      sortBy: undefined,
      ratingTier: undefined,
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const sortedCities = useMemo(() => {
    return [...cities]
      .filter((c) => (c.pensionsCount ?? 0) > 0)
      .sort((a, b) => (b.pensionsCount ?? 0) - (a.pensionsCount ?? 0));
  }, [cities]);

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveModalContent
        id="filter-drawer-content"
        showClose={false}
        showDragHandle={false}
        className="max-w-lg md:max-w-2xl mx-auto bg-card border-border text-foreground md:rounded-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden"
      >
        <div className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex flex-col gap-2">
          <div className="mx-auto w-10 h-1 shrink-0 rounded-full bg-muted-foreground/30 md:hidden" />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center h-10 w-10 min-h-[48px] min-w-[48px] rounded-full hover:bg-muted text-foreground transition-colors cursor-pointer"
              aria-label="Cerrar filtros"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <ResponsiveModalTitle className="font-semibold text-base text-foreground">
                Filtros
              </ResponsiveModalTitle>
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="h-5 px-1.5 text-xs font-semibold rounded-full bg-primary/10 text-primary border-primary/20 tabular-nums"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </div>
            <button
              type="button"
              onClick={handleReset}
              disabled={activeFilterCount === 0}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-2 py-1 min-h-[48px] flex items-center justify-center cursor-pointer"
            >
              Limpiar
            </button>
          </div>
          <ResponsiveModalDescription className="sr-only">
            Ajusta los filtros de búsqueda de pensiones
          </ResponsiveModalDescription>
        </div>

        <div className="flex-1 max-h-[82vh] overflow-y-auto scrollbar-subtle pr-2 p-4 md:p-6 flex flex-col gap-6 divide-y divide-border">
          <div className="flex flex-col gap-3 pb-2">
            <h3 className="text-base font-semibold text-foreground">Ordenar por</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'relevance' as const, label: 'Relevancia' },
                { id: 'price_asc' as const, label: 'Más baratas' },
                { id: 'price_desc' as const, label: 'Mayor precio' },
              ].map((opt) => {
                const isSelected =
                  opt.id === 'relevance'
                    ? !localFilters.sortBy || localFilters.sortBy === 'relevance'
                    : localFilters.sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        sortBy: opt.id === 'relevance' ? undefined : opt.id,
                      }))
                    }
                    className={`flex items-center justify-center p-3 min-h-[48px] rounded-xl border text-xs font-semibold transition active:scale-95 cursor-pointer ${
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

          <div className="flex flex-col gap-4 pt-6 pb-2">
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
            <h3 className="text-base font-semibold text-foreground">Disponibilidad y Capacidad</h3>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    onlyAvailable: prev.onlyAvailable ? undefined : true,
                  }))
                }
                className={`flex items-center gap-2 px-4 py-3 min-h-[48px] rounded-full border text-xs font-semibold transition active:scale-95 cursor-pointer ${
                  localFilters.onlyAvailable
                    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                    : 'border-border bg-card text-foreground hover:bg-muted hover:border-muted-foreground/30'
                }`}
              >
                <Check className="h-4 w-4" />
                <span>Piezas libres</span>
              </button>
            </div>

            <div className="pt-1">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Camas disponibles mínimas
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: undefined, label: 'Cualquiera' },
                  { value: 1, label: '1+ cama' },
                  { value: 2, label: '2+ camas' },
                  { value: 3, label: '3+ camas' },
                ].map((opt) => {
                  const isSelected = localFilters.minBeds === opt.value;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          minBeds: prev.minBeds === opt.value ? undefined : opt.value,
                        }))
                      }
                      className={`flex items-center justify-center gap-1.5 p-2.5 min-h-[44px] rounded-xl border text-xs font-semibold transition active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                          : 'border-border bg-card text-foreground hover:bg-muted hover:border-muted-foreground/30'
                      }`}
                    >
                      {opt.value !== undefined && <BedDouble className="h-3.5 w-3.5 shrink-0" />}
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-6 pb-2">
            <h3 className="text-base font-semibold text-foreground">Tipo de Alojamiento</h3>
            <div className="flex flex-wrap gap-2.5">
              {[
                {
                  id: 'SINGLE' as const,
                  label: 'Pieza Individual',
                  icon: User,
                },
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
                    className={`flex items-center gap-2 px-4 py-3 min-h-[48px] rounded-full border text-xs font-semibold transition active:scale-95 cursor-pointer ${
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
            <h3 className="text-base font-semibold text-foreground">Comodidades y Servicios</h3>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    hasPrivateBathroom: prev.hasPrivateBathroom ? undefined : true,
                  }))
                }
                className={`flex items-center gap-2 px-4 py-3 min-h-[48px] rounded-full border text-xs font-semibold transition active:scale-95 cursor-pointer ${
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
                    includesMeals: prev.includesMeals ? undefined : true,
                  }))
                }
                className={`flex items-center gap-2 px-4 py-3 min-h-[48px] rounded-full border text-xs font-semibold transition active:scale-95 cursor-pointer ${
                  localFilters.includesMeals
                    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                    : 'border-border bg-card text-foreground hover:bg-muted hover:border-muted-foreground/30'
                }`}
              >
                <Utensils className="h-4 w-4" />
                <span>Comida incluida</span>
              </button>

              {amenitiesCatalog.map((amenity) => {
                const isSelected = Boolean(localFilters.amenities?.includes(amenity.slug));
                return (
                  <button
                    key={amenity.slug}
                    type="button"
                    onClick={() => toggleAmenity(amenity.slug)}
                    className={`flex items-center gap-2 px-4 py-3 min-h-[48px] rounded-full border text-xs font-semibold transition active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                        : 'border-border bg-card text-foreground hover:bg-muted hover:border-muted-foreground/30'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{amenity.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-6 pb-2">
            <h3 className="text-base font-semibold text-foreground">Ubicación</h3>
            {sortedCities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {sortedCities.map((cityItem) => {
                  const isSelected =
                    localFilters.city?.toLowerCase() === cityItem.name.toLowerCase();
                  return (
                    <button
                      key={cityItem.id}
                      type="button"
                      onClick={() =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          city: isSelected ? undefined : cityItem.name,
                        }))
                      }
                      className={`flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-full border text-xs font-semibold transition cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                          : 'border-border bg-card text-foreground hover:bg-muted'
                      }`}
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{cityItem.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
            <div>
              <label
                htmlFor="filter-neighborhood-input"
                className="block text-xs font-medium text-muted-foreground mb-1.5"
              >
                Barrio o comuna
              </label>
              <input
                id="filter-neighborhood-input"
                type="text"
                maxLength={60}
                value={localFilters.neighborhood ?? ''}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    neighborhood: e.target.value || undefined,
                  }))
                }
                placeholder="Ej: República, San Joaquín, Providencia..."
                className="min-h-[44px] w-full rounded-xl border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-6 pb-2">
            <h3 className="text-base font-semibold text-foreground">
              Reglas de Convivencia y Género
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ANY' as const, label: 'Mixto' },
                { id: 'FEMALE_ONLY' as const, label: 'Solo Mujeres' },
                { id: 'MALE_ONLY' as const, label: 'Solo Hombres' },
              ].map((opt) => {
                const isSelected =
                  opt.id === 'ANY'
                    ? localFilters.genderPreference === 'ANY' ||
                      localFilters.genderPreference === 'MIXED'
                    : localFilters.genderPreference === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        genderPreference: isSelected ? undefined : opt.id,
                      }))
                    }
                    className={`flex items-center justify-center p-3 min-h-[48px] rounded-xl border text-xs font-semibold transition active:scale-95 cursor-pointer ${
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

          <div className="flex flex-col gap-3 pt-6 pb-2">
            <h3 className="text-base font-semibold text-foreground">
              Calificación de la Comunidad
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: 'high' as const,
                  label: 'Favoritas',
                  subtitle: 'Top valoradas',
                  colorClass: 'text-[#2d5e49] dark:text-[#72bca0]',
                  activeBorderClass:
                    'border-[#2d5e49] bg-[#2d5e49]/15 text-[#2d5e49] dark:text-[#72bca0] ring-1 ring-[#2d5e49]',
                },
                {
                  id: 'medium' as const,
                  label: 'Buenas reseñas',
                  subtitle: 'Buenas opiniones',
                  colorClass: 'text-[#945d0c] dark:text-[#e09d32]',
                  activeBorderClass:
                    'border-[#a26510] bg-[#a26510]/15 text-[#945d0c] dark:text-[#e09d32] ring-1 ring-[#a26510]',
                },
                {
                  id: 'low' as const,
                  label: 'Otras alternativas',
                  subtitle: 'Nuevas o por evaluar',
                  colorClass: 'text-[#57534e] dark:text-[#a8a29e]',
                  activeBorderClass:
                    'border-[#78716c] bg-[#78716c]/15 text-[#57534e] dark:text-[#a8a29e] ring-1 ring-[#78716c]',
                },
              ].map((opt) => {
                const isSelected = localFilters.ratingTier === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        ratingTier: prev.ratingTier === opt.id ? undefined : opt.id,
                      }))
                    }
                    className={`flex flex-col items-center justify-center p-3 min-h-[48px] rounded-xl border text-xs font-semibold text-center transition active:scale-95 cursor-pointer ${
                      isSelected
                        ? opt.activeBorderClass
                        : `border-border bg-card ${opt.colorClass} hover:bg-muted hover:border-muted-foreground/30`
                    }`}
                  >
                    <span className="font-bold text-xs sm:text-sm leading-tight">{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{opt.subtitle}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-20 border-t border-border bg-card px-4 pt-3 pb-[max(env(safe-area-inset-bottom),1rem)] flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            className="text-xs font-semibold underline underline-offset-4 text-foreground hover:bg-muted min-h-[48px] px-4 cursor-pointer"
          >
            Limpiar todo
          </Button>
          <Button
            id="btn-apply-filters"
            type="button"
            onClick={handleApply}
            className="flex-1 md:flex-initial md:min-w-[200px] bg-primary hover:bg-primary/90 text-primary-foreground font-bold min-h-[48px] text-sm rounded-xl shadow-sm px-6 cursor-pointer"
          >
            {typeof matchingCount === 'number'
              ? `Mostrar ${matchingCount} ${matchingCount === 1 ? 'alojamiento' : 'alojamientos'}`
              : 'Mostrar alojamientos'}
          </Button>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
