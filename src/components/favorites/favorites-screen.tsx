'use client';

import { Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import type { PensionItem } from '@/lib/types';

type FavoritesScreenProps = {
  allPensions: PensionItem[];
  onSelectPension: (pension: PensionItem) => void;
  onExplore: () => void;
};

export function FavoritesScreen({ allPensions, onSelectPension, onExplore }: FavoritesScreenProps) {
  const { favorites, toggleFavorite } = useAuth();
  const savedPensions = allPensions.filter((p) => favorites.includes(p.id));

  return (
    <div id="favorites-screen-view" className="flex flex-col gap-6 px-4 pb-28 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tus Favoritos</h2>
          <p className="text-xs text-muted-foreground">
            {savedPensions.length}{' '}
            {savedPensions.length === 1
              ? 'alojamiento guardado para postular'
              : 'alojamientos guardados para postular'}
          </p>
        </div>
      </div>

      {savedPensions.length === 0 ? (
        <div className="my-12 flex flex-col items-center justify-center rounded-2xl border border-border bg-card/60 p-8 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
            <Heart className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No tienes favoritos guardados</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Explora las pensiones universitarias y presiona el corazón para guardar las opciones que
            te interesen.
          </p>
          <Button
            onClick={onExplore}
            className="mt-4 bg-primary font-bold text-primary-foreground hover:opacity-90 text-xs shadow-sm"
          >
            Explorar Alojamientos
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-7">
          {savedPensions.map((pension) => (
            <div key={pension.id} className="group relative flex flex-col text-left transition">
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
                    {pension.neighborhood}, {pension.city} • a {pension.distanceToUniversityMeters}m
                    de campus
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
                className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-md hover:text-primary transition active:scale-90 shadow-sm border border-border/40"
                aria-label="Quitar de favoritos"
                title="Quitar de favoritos"
              >
                <Heart className="h-5 w-5 fill-primary text-primary" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
