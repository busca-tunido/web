'use client';

import { ChevronDown, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { Suspense, useState } from 'react';
import { NetworkErrorBanner } from '@/components/common/network-error-state';
import { InfinitePensionList } from '@/components/pensions/infinite-pension-list';
import { NearbyCitiesBar } from '@/components/pensions/nearby-cities-bar';
import { Badge } from '@/components/ui/badge';
import { ExploreSkeleton } from '@/components/ui/skeletons/explore-skeleton';
import { PensionCardSkeleton } from '@/components/ui/skeletons/pension-card-skeleton';
import { getCityImageUrl, getUniversityImageUrl } from '@/lib/location-images';
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
  error?: string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
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
  error,
  onRetry,
  isRetrying = false,
}: ExploreScreenProps) {
  const [isExpandedUniversities, setIsExpandedUniversities] = useState(false);

  const sortedCities = [...cities].sort((a, b) => {
    if (a.isCurrentCity) return -1;
    if (b.isCurrentCity) return 1;
    return b.foreignStudentRate - a.foreignStudentRate;
  });

  const sortedUniversities = [...universities].sort(
    (a, b) => b.foreignStudentRate - a.foreignStudentRate,
  );

  return (
    <div id="explore-screen-view" className="flex flex-col gap-8 pb-20 md:pb-12 pt-2">
      <div className="px-5 md:px-0">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Pensiones y Residencias Universitarias en Chile
        </h1>
      </div>

      <section>
        <div className="flex items-center justify-between px-5 md:px-0 mb-3">
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              Ciudades Universitarias
            </h2>
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

        <div className="flex gap-3.5 overflow-x-auto px-5 pb-3 scroll-px-5 scrollbar-none snap-x md:grid md:grid-cols-6 md:px-0 md:gap-4 md:overflow-visible">
          {sortedCities.map((city, index) => {
            const isSelected = selectedCity?.toLowerCase() === city.name.toLowerCase();
            const cityImg =
              city.imageUrl && city.imageUrl.trim().length > 0
                ? city.imageUrl
                : getCityImageUrl(city.name);

            return (
              <motion.button
                type="button"
                key={city.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => onSelectCity(isSelected ? null : city.name)}
                className={`group relative h-48 w-36 md:w-full shrink-0 md:shrink snap-start overflow-hidden rounded-2xl border text-left transition-colors cursor-pointer shadow-sm ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-border/60 hover:border-primary/50'
                }`}
              >
                {cityImg && (
                  <Image
                    src={cityImg}
                    alt={city.name}
                    fill
                    unoptimized
                    loading={index < 3 ? 'eager' : 'lazy'}
                    sizes="144px"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {city.isCurrentCity && (
                  <div className="absolute top-2.5 left-2.5">
                    <Badge className="bg-primary text-primary-foreground font-bold text-[9px] px-2 py-0.5 shadow">
                      Actual
                    </Badge>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-sm font-bold text-white leading-tight">{city.name}</h3>
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
        <div className="flex items-center justify-between px-5 md:px-0 mb-3">
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              Universidades Destacadas
            </h2>
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

        <div className="flex gap-3.5 overflow-x-auto px-5 pb-3 scroll-px-5 scrollbar-none snap-x md:grid md:grid-cols-5 md:px-0 md:gap-4 md:overflow-visible">
          {sortedUniversities.map((uni, index) => {
            const uniImg =
              uni.imageUrl && uni.imageUrl.trim().length > 0
                ? uni.imageUrl
                : getUniversityImageUrl(uni.name, uni.acronym);

            const isDesktopHidden = !isExpandedUniversities && index >= 5;

            return (
              <motion.button
                type="button"
                key={uni.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => onSelectUniversity(uni)}
                className={`group relative h-48 w-44 md:w-full shrink-0 md:shrink snap-start overflow-hidden rounded-2xl border border-border/60 bg-card text-left transition-colors hover:border-primary/50 cursor-pointer shadow-sm ${
                  isDesktopHidden ? 'md:hidden' : ''
                }`}
              >
                {uniImg && (
                  <Image
                    src={uniImg}
                    alt={uni.name}
                    fill
                    unoptimized
                    loading={index < 3 ? 'eager' : 'lazy'}
                    sizes="176px"
                    className="object-cover opacity-80 transition duration-300 group-hover:scale-105"
                  />
                )}
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
                  <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">
                    {uni.name}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-300 mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{uni.city}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {sortedUniversities.length > 5 && (
          <div className="hidden md:flex justify-center mt-3">
            <button
              type="button"
              id="btn-toggle-universities-desktop"
              onClick={() => setIsExpandedUniversities((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary hover:border-primary/40 transition cursor-pointer shadow-xs"
            >
              <span>
                {isExpandedUniversities
                  ? 'Ver menos'
                  : `Ver más (${sortedUniversities.length - 5} más)`}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
                  isExpandedUniversities ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        )}
      </section>

      {nearbyCityCounts.length > 0 && (
        <NearbyCitiesBar
          cities={nearbyCityCounts}
          selectedCity={selectedCity}
          onSelectCity={onSelectCity}
        />
      )}

      {error && (
        <div className="px-5">
          <NetworkErrorBanner message={error} onRetry={onRetry} isRetrying={isRetrying} />
        </div>
      )}

      <Suspense fallback={<ExploreSkeleton />}>
        <PensionListSection
          featuredPensions={featuredPensions}
          totalPensions={totalPensions}
          hasMore={hasMore}
          isLoadingPensions={isLoadingPensions}
          isLoadingMore={isLoadingMore}
          onLoadMorePensions={onLoadMorePensions}
          onSelectPension={onSelectPension}
          onResetFilters={onResetFilters}
        />
      </Suspense>
    </div>
  );
}

type PensionListSectionProps = {
  featuredPensions: PensionItem[];
  totalPensions?: number;
  hasMore: boolean;
  isLoadingPensions: boolean;
  isLoadingMore: boolean;
  onLoadMorePensions: () => void;
  onSelectPension: (pension: PensionItem) => void;
  onResetFilters?: () => void;
};

function PensionListSection({
  featuredPensions,
  totalPensions,
  hasMore,
  isLoadingPensions,
  isLoadingMore,
  onLoadMorePensions,
  onSelectPension,
  onResetFilters,
}: PensionListSectionProps) {
  if (isLoadingPensions && featuredPensions.length === 0) {
    return (
      <div className="px-4 md:px-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
          <PensionCardSkeleton key={`pension-loading-${id}`} />
        ))}
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between px-5 md:px-0 mb-4">
        <h2 className="text-lg font-bold text-foreground tracking-tight">
          Alojamientos Disponibles
        </h2>
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
  );
}
