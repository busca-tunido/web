'use client';

import { MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { InfinitePensionList } from '@/components/pensions/infinite-pension-list';
import { NearbyCitiesBar } from '@/components/pensions/nearby-cities-bar';
import { Badge } from '@/components/ui/badge';
import type { CityInfo, NearbyCityCount, PensionItem, UniversityInfo } from '@/lib/types';

type ExploreScreenProps = {
  cities: CityInfo[];
  universities: UniversityInfo[];
  featuredPensions: PensionItem[];
  selectedCity: string | null;
  onSelectCity: (cityName: string | null) => void;
  onSelectUniversity: (uni: UniversityInfo) => void;
  onSelectPension: (pension: PensionItem) => void;
  onNavigateToMap: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  isLoadingPensions?: boolean;
  onLoadMorePensions?: () => void;
  nearbyCityCounts?: NearbyCityCount[];
  totalPensions?: number;
  onResetFilters?: () => void;
};

export function ExploreScreen({
  cities,
  universities,
  featuredPensions,
  selectedCity,
  onSelectCity,
  onSelectUniversity,
  onSelectPension,
  onNavigateToMap,
  hasMore = false,
  isLoadingMore = false,
  isLoadingPensions = false,
  onLoadMorePensions = () => {},
  nearbyCityCounts = [],
  totalPensions,
  onResetFilters,
}: ExploreScreenProps) {
  const sortedCities = [...cities].sort((a, b) => {
    if (a.isCurrentCity) return -1;
    if (b.isCurrentCity) return 1;
    return b.foreignStudentRate - a.foreignStudentRate;
  });

  const sortedUniversities = [...universities].sort(
    (a, b) => b.foreignStudentRate - a.foreignStudentRate,
  );

  return (
    <div id="explore-screen-view" className="flex flex-col gap-6 pb-28 pt-2">
      <section>
        <div className="flex items-center justify-between px-5 mb-3">
          <div>
            <h3 className="text-lg font-bold text-foreground tracking-tight">Ciudades</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Principales destinos universitarios de Chile
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToMap}
            className="text-xs font-semibold text-primary hover:opacity-80 transition"
          >
            Ver más
          </button>
        </div>

        <div className="flex gap-3.5 overflow-x-auto px-5 pb-3 scroll-px-5 scrollbar-none snap-x">
          {sortedCities.map((city) => {
            const isSelected = selectedCity?.toLowerCase() === city.name.toLowerCase();
            return (
              <motion.button
                type="button"
                key={city.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => onSelectCity(isSelected ? null : city.name)}
                className={`group relative h-48 w-36 shrink-0 snap-start overflow-hidden rounded-2xl border text-left transition-colors cursor-pointer shadow-sm ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-border/60 hover:border-primary/50'
                }`}
              >
                <Image
                  src={city.imageUrl}
                  alt={city.name}
                  fill
                  unoptimized
                  sizes="144px"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {city.isCurrentCity && (
                  <div className="absolute top-2.5 left-2.5">
                    <Badge className="bg-primary text-primary-foreground font-bold text-[9px] px-2 py-0.5 shadow">
                      Actual
                    </Badge>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3">
                  <h4 className="text-sm font-bold text-white leading-tight">{city.name}</h4>
                  <span className="block text-[11px] text-zinc-200 mt-1">
                    {city.pensionsCount} pensiones
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between px-5 mb-3">
          <div>
            <h3 className="text-lg font-bold text-foreground tracking-tight">Universidades</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Encuentra alojamiento cerca de tu campus
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToMap}
            className="text-xs font-semibold text-primary hover:opacity-80 transition"
          >
            Ver mapa
          </button>
        </div>

        <div className="flex gap-3.5 overflow-x-auto px-5 pb-3 scroll-px-5 scrollbar-none snap-x">
          {sortedUniversities.map((uni) => (
            <motion.button
              type="button"
              key={uni.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => onSelectUniversity(uni)}
              className="group relative h-48 w-44 shrink-0 snap-start overflow-hidden rounded-2xl border border-border/60 bg-card text-left transition-colors hover:border-primary/50 cursor-pointer shadow-sm"
            >
              <Image
                src={uni.imageUrl}
                alt={uni.name}
                fill
                unoptimized
                sizes="176px"
                className="object-cover opacity-80 transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent" />

              <div className="absolute top-2.5 left-2.5">
                <Badge
                  variant="outline"
                  className="border-white/20 bg-black/60 text-white font-bold text-[10px] backdrop-blur-sm"
                >
                  {uni.acronym}
                </Badge>
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <h4 className="text-sm font-bold text-white leading-tight line-clamp-2">
                  {uni.name}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-zinc-300 mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{uni.city}</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {nearbyCityCounts.length > 0 && (
        <NearbyCitiesBar
          cities={nearbyCityCounts}
          selectedCity={selectedCity}
          onSelectCity={onSelectCity}
        />
      )}

      <section>
        <div className="flex items-center justify-between px-5 mb-4">
          <h3 className="text-lg font-bold text-foreground tracking-tight">
            Alojamientos Destacados
          </h3>
          <span className="text-xs text-muted-foreground">
            {totalPensions !== undefined
              ? `${totalPensions} alojamientos`
              : `${featuredPensions.length} alojamientos`}
          </span>
        </div>

        <InfinitePensionList
          items={featuredPensions}
          hasMore={hasMore}
          isLoading={isLoadingPensions}
          isLoadingMore={isLoadingMore}
          onLoadMore={onLoadMorePensions}
          onSelectPension={onSelectPension}
          onResetFilters={onResetFilters}
        />
      </section>
    </div>
  );
}
