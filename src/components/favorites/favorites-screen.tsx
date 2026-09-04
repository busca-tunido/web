'use client';

import { Heart, Star, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
    <div id="favorites-screen-view" className="flex flex-col gap-4 px-4 pb-28 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Tus Favoritos</h2>
          <p className="text-xs text-zinc-400">
            {savedPensions.length} alojamientos guardados para postular
          </p>
        </div>
      </div>

      {savedPensions.length === 0 ? (
        <div className="my-12 flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-500 mb-3">
            <Heart className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">No tienes favoritos guardados</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs">
            Explora las pensiones universitarias y presiona el corazón para guardar las opciones que
            te interesen.
          </p>
          <Button
            onClick={onExplore}
            className="mt-4 bg-emerald-500 font-bold text-zinc-950 hover:bg-emerald-400 text-xs"
          >
            Explorar Alojamientos
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {savedPensions.map((pension) => (
            <Card
              key={pension.id}
              onClick={() => onSelectPension(pension)}
              className="overflow-hidden rounded-2xl border-zinc-800 bg-zinc-900/60 transition hover:border-zinc-700 cursor-pointer"
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
                      <h4 className="text-xs font-bold text-white line-clamp-1">{pension.title}</h4>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(pension.id);
                        }}
                        className="text-rose-400 hover:text-rose-300 p-1"
                        title="Quitar de favoritos"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                      {pension.neighborhood}, {pension.city}
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
                      <span className="text-[10px] text-zinc-400 ml-1">CLP/mes</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
