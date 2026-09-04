'use client';

import {
  ArrowRight,
  GraduationCap,
  Heart,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
      <div className="px-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-900 p-4 shadow-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge
              variant="outline"
              className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px] px-2"
            >
              Comunidad Estudiantil
            </Badge>
            <span className="text-[11px] text-zinc-400">Chile 2026</span>
          </div>
          <h2 className="text-lg font-bold text-white leading-tight">
            Encuentra tu próximo hogar universitario
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Pensiones verificadas con precios transparentes y opiniones de alumnos foráneos.
          </p>
          <button
            type="button"
            onClick={onNavigateToMap}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-zinc-950 shadow-md hover:bg-emerald-400 transition active:scale-95"
          >
            <span>Ver mapa de precios CLP</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between px-4 mb-3">
          <div>
            <h3 className="text-base font-bold text-white">Ciudades</h3>
            <p className="text-[11px] text-zinc-400">
              {sortedCities[0]?.name} (tu ubicación) primero, luego por estudiantes foráneos
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

        <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none snap-x">
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
                    : 'border-zinc-800 hover:border-zinc-700'
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
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                    <Users className="h-3 w-3" />
                    <span>{(city.foreignStudentRate * 100).toFixed(0)}% foráneos</span>
                  </div>
                  <span className="block text-[10px] text-zinc-400 mt-0.5">
                    {city.pensionsCount} pensiones
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between px-4 mb-3">
          <div>
            <h3 className="text-base font-bold text-white">Universidades</h3>
            <p className="text-[11px] text-zinc-400">
              Ordenadas por mayor tasa de alumnos foráneos registrados
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

        <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none snap-x">
          {sortedUniversities.map((uni) => (
            <button
              type="button"
              key={uni.id}
              onClick={() => onSelectUniversity(uni)}
              className="group relative h-48 w-44 shrink-0 snap-start overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 text-left transition hover:border-zinc-700 active:scale-95 cursor-pointer"
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
                <div className="mt-1 flex items-center gap-1 text-[10px] text-zinc-400">
                  <MapPin className="h-3 w-3" />
                  <span>{uni.city}</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                  <GraduationCap className="h-3 w-3" />
                  <span>{(uni.foreignStudentRate * 100).toFixed(0)}% foráneos</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Pensiones Recomendadas</h3>
          </div>
          <span className="text-[11px] text-zinc-500 font-medium">
            {featuredPensions.length} alojamientos
          </span>
        </div>

        <div className="flex flex-col gap-3.5">
          {featuredPensions.map((pension) => {
            const isFav = isFavorite(pension.id);
            return (
              <Card
                key={pension.id}
                className="group overflow-hidden rounded-2xl border-zinc-800/80 bg-zinc-900/60 backdrop-blur transition hover:border-zinc-700 cursor-pointer"
                onClick={() => onSelectPension(pension)}
              >
                <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
                  <img
                    src={pension.photos[0]}
                    alt={pension.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/20" />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(pension.id);
                    }}
                    className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950/70 text-white backdrop-blur-md hover:text-emerald-400"
                  >
                    <Heart
                      className={`h-4 w-4 ${isFav ? 'fill-emerald-400 text-emerald-400' : ''}`}
                    />
                  </button>

                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                    {pension.isVerified && (
                      <Badge className="bg-emerald-500 text-zinc-950 font-bold text-[10px] gap-1 px-1.5 py-0.5">
                        <ShieldCheck className="h-3 w-3" /> Verificada
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-zinc-900/80 text-white text-[10px]">
                      {pension.city}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
                        {pension.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {pension.neighborhood} • {pension.distanceToUniversityMeters}m de campus
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-white">
                        ${pension.priceMonthlyClp.toLocaleString('es-CL')}
                      </div>
                      <span className="text-[10px] text-zinc-400">CLP/mes</span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between border-t border-zinc-800/80 pt-2 text-[11px]">
                    <div className="flex items-center gap-1 text-amber-400 font-semibold">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span>{pension.ratingAverage.toFixed(1)}</span>
                      <span className="text-zinc-500 font-normal">({pension.reviewsCount})</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400">
                      Ver disponibilidad &rarr;
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
