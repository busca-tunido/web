'use client';

import { Heart, MapPin, Sparkles, Star } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import type { PensionItem } from '@/lib/types';

type PensionCardProps = {
  pension: PensionItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelectPension: (pension: PensionItem) => void;
};

export function PensionCard({
  pension,
  isFavorite,
  onToggleFavorite,
  onSelectPension,
}: PensionCardProps) {
  const isHighRelevance = (pension.relevanceScore ?? 0) >= 75;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col text-left"
    >
      <button
        type="button"
        onClick={() => onSelectPension(pension)}
        className="w-full flex flex-col text-left cursor-pointer focus:outline-none"
      >
        <div className="relative w-full aspect-[16/10] overflow-hidden rounded-2xl bg-muted shadow-sm">
          <Image
            src={pension.photos[0]}
            alt={pension.title}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, 480px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {pension.isVerified && (
              <span className="rounded-full bg-background/85 px-2.5 py-0.5 text-[11px] font-semibold text-foreground backdrop-blur-md border border-border/60 shadow-sm">
                Verificada
              </span>
            )}
            {isHighRelevance && (
              <span className="flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground backdrop-blur-md shadow-sm">
                <Sparkles className="h-3 w-3" />
                Recomendada
              </span>
            )}
          </div>
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

          <div className="flex items-center gap-1 text-xs text-muted-foreground line-clamp-1">
            <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span>
              {pension.neighborhood}, {pension.city}
              {pension.distanceKm !== undefined ? (
                <> • a {pension.distanceKm} km</>
              ) : (
                <> • a {pension.distanceToUniversityMeters}m de campus</>
              )}
            </span>
          </div>

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
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(pension.id);
        }}
        className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-md hover:text-primary transition-colors shadow-sm border border-border/40 cursor-pointer"
        aria-label="Guardar en favoritos"
      >
        <Heart className={`h-5 w-5 ${isFavorite ? 'fill-primary text-primary' : 'stroke-[2]'}`} />
      </motion.button>
    </motion.div>
  );
}
