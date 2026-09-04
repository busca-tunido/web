'use client';

import { ArrowRight, Heart, MapPin, Star } from 'lucide-react';
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
      <div className="px-5">
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/60 p-5 shadow-sm">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            Comunidad Estudiantil
          </span>
          <h2 className="text-xl font-bold text-white leading-tight mt-1">
            Encuentra tu pensión universitaria
          </h2>
          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
            Alojamientos con precios transparentes y opiniones reales de la comunidad estudiantil.
          </p>
          <button
            type="button"
            onClick={onNavigateToMap}
            className="mt-3.5 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-md hover:bg-emerald-400 transition active:scale-95"
          >
            <span>Ver mapa de precios CLP</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between px-5 mb-3">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Ciudades</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Principales destinos universitarios de Chile
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToMap}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            Ver más
          </button>
        </div>

        <div className="flex gap-3.5 overflow-x-auto px-5 pb-3 scroll-px-5 scrollbar-none snap-x">
          {sortedCities.map((city) => {
            const isSelected = selectedCity === city.name;
            return (
              <button
                type="button"
                key={city.id}
                onClick={() => onSelectCity(city.name)}
                className={`group relative h-48 w-36 shrink-0 snap-start overflow-hidden rounded-2xl border text-left transition active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <img
                  src={city.imageUrl}
                  alt={city.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                {city.isCurrentCity && (
                  <div className="absolute top-2.5 left-2.5">
                    <Badge className="bg-emerald-500 text-zinc-950 font-bold text-[9px] px-1.5 py-0.5 shadow">
                      Actual
                    </Badge>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3">
                  <h4 className="text-sm font-bold text-white leading-tight">{city.name}</h4>
                  <span className="block text-[11px] text-zinc-300 mt-1">
                    {city.pensionsCount} pensiones
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between px-5 mb-3">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Universidades</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Universidades con residencias cercanas</p>
          </div>
          <button
            type="button"
            onClick={onNavigateToMap}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            Ver más
          </button>
        </div>

        <div className="flex gap-3.5 overflow-x-auto px-5 pb-3 scroll-px-5 scrollbar-none snap-x">
          {sortedUniversities.map((uni) => (
            <button
              type="button"
              key={uni.id}
              onClick={() => onSelectUniversity(uni)}
              className="group relative h-48 w-44 shrink-0 snap-start overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900 text-left transition hover:border-zinc-700 active:scale-95 cursor-pointer"
            >
              <img
                src={uni.imageUrl}
                alt={uni.name}
                className="h-full w-full object-cover opacity-60 transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

              <div className="absolute top-2.5 left-2.5">
                <Badge
                  variant="outline"
                  className="border-white/20 bg-zinc-950/70 text-white font-bold text-[10px] backdrop-blur-sm"
                >
                  {uni.acronym}
                </Badge>
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <h4 className="text-xs font-bold text-white leading-tight line-clamp-2">
                  {uni.name}
                </h4>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-zinc-300">
                  <MapPin className="h-3 w-3" />
                  <span>{uni.city}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white tracking-tight">Pensiones Recomendadas</h3>
          <span className="text-xs text-zinc-400">{featuredPensions.length} alojamientos</span>
        </div>

        <div className="flex flex-col gap-6">
          {featuredPensions.map((pension) => {
            const isFav = isFavorite(pension.id);
            return (
              <div key={pension.id} className="group relative flex flex-col text-left transition">
                <button
                  type="button"
                  onClick={() => onSelectPension(pension)}
                  className="w-full flex flex-col text-left cursor-pointer"
                >
                  <div className="relative w-full aspect-[16/10] overflow-hidden rounded-2xl bg-zinc-900">
                    <img
                      src={pension.photos[0]}
                      alt={pension.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {pension.isVerified && (
                      <div className="absolute bottom-3 left-3">
                        <span className="rounded-full bg-zinc-950/80 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 backdrop-blur-md border border-zinc-800">
                          Verificada
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2.5 flex flex-col gap-1 w-full">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-base font-semibold text-white leading-snug line-clamp-1 group-hover:text-emerald-400 transition">
                        {pension.title}
                      </h4>
                      <div className="flex items-center gap-1 text-sm font-semibold text-white shrink-0">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span>{pension.ratingAverage.toFixed(1)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-1">
                      {pension.neighborhood}, {pension.city} • a{' '}
                      {pension.distanceToUniversityMeters}m de campus
                    </p>

                    <div className="mt-0.5 flex items-baseline gap-1">
                      <span className="text-base font-bold text-white">
                        ${pension.priceMonthlyClp.toLocaleString('es-CL')} CLP
                      </span>
                      <span className="text-xs text-zinc-400">/ mes</span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => toggleFavorite(pension.id)}
                  className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:text-emerald-400 transition active:scale-90"
                  aria-label="Guardar en favoritos"
                >
                  <Heart
                    className={`h-5 w-5 ${isFav ? 'fill-emerald-400 text-emerald-400' : 'stroke-[2]'}`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
