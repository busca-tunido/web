'use client';

import { Heart, MapPin, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import type { CityInfo, PensionItem, UniversityInfo } from '@/lib/types';

type ExploreScreenProps = {
  cities: CityInfo[];
  universities: UniversityInfo[];
  featuredPensions: PensionItem[];
  selectedCity: string | null;
  onSelectCity: (cityName: string) => void;
  onSelectUniversity: (uni: UniversityInfo) => void;
  onSelectPension: (pension: PensionItem) => void;
  onNavigateToMap: () => void;
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
}: ExploreScreenProps) {
  const { isFavorite, toggleFavorite } = useAuth();

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
            const isSelected = selectedCity === city.name;
            return (
              <motion.button
                type="button"
                key={city.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => onSelectCity(city.name)}
                className={`group relative h-48 w-36 shrink-0 snap-start overflow-hidden rounded-2xl border text-left transition-colors cursor-pointer shadow-sm ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-border/60 hover:border-primary/50'
                }`}
              >
                <img
                  src={city.imageUrl}
                  alt={city.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
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
              Universidades con residencias cercanas
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
          {sortedUniversities.map((uni) => (
            <motion.button
              type="button"
              key={uni.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => onSelectUniversity(uni)}
              className="group relative h-48 w-44 shrink-0 snap-start overflow-hidden rounded-2xl border border-border/60 bg-card text-left transition-colors hover:border-primary/50 cursor-pointer shadow-sm"
            >
              <img
                src={uni.imageUrl}
                alt={uni.name}
                className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-105"
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

      <section className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground tracking-tight">
            Alojamientos Destacados
          </h3>
          <span className="text-xs text-muted-foreground">
            {featuredPensions.length} alojamientos
          </span>
        </div>

        <div className="flex flex-col gap-7">
          {featuredPensions.map((pension) => {
            const isFav = isFavorite(pension.id);
            return (
              <motion.div
                key={pension.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="group relative flex flex-col text-left"
              >
                <button
                  type="button"
                  onClick={() => onSelectPension(pension)}
                  className="w-full flex flex-col text-left cursor-pointer"
                >
                  <div className="relative w-full aspect-[16/10] overflow-hidden rounded-2xl bg-muted shadow-sm">
                    <img
                      src={pension.photos[0]}
                      alt={pension.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
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

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  onClick={() => toggleFavorite(pension.id)}
                  className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/60 text-foreground backdrop-blur-md hover:text-primary transition-colors shadow-sm border border-border/40 cursor-pointer"
                  aria-label="Guardar en favoritos"
                >
                  <Heart
                    className={`h-5 w-5 ${isFav ? 'fill-primary text-primary' : 'stroke-[2]'}`}
                  />
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
