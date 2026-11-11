'use client';

import { Award, Building2, Heart, MapPin, ShieldCheck, Star } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { memo } from 'react';
import type { PensionItem } from '@/lib/types';

type PensionCardProps = {
  pension: PensionItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelectPension: (pension: PensionItem) => void;
};

function areEqual(prev: PensionCardProps, next: PensionCardProps): boolean {
  return (
    prev.pension.id === next.pension.id &&
    prev.isFavorite === next.isFavorite &&
    prev.pension.ratingAverage === next.pension.ratingAverage &&
    prev.pension.baseMonthlyPrice === next.pension.baseMonthlyPrice
  );
}

function PensionCardComponent({
  pension,
  isFavorite,
  onToggleFavorite,
  onSelectPension,
}: PensionCardProps) {
  const isHighRelevance = (pension.relevanceScore ?? 0) >= 75;
  const titleId = `pension-title-${pension.id}`;

  return (
    <motion.article
      aria-labelledby={titleId}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col text-left"
    >
      <button
        type="button"
        onClick={() => onSelectPension(pension)}
        className="w-full flex flex-col text-left cursor-pointer focus:outline-none"
        aria-label={`Ver detalles de ${pension.title}`}
      >
        <motion.div
          layoutId={`pension-hero-${pension.id}`}
          className="relative w-full aspect-[16/10] overflow-hidden rounded-2xl bg-muted shadow-sm group-hover:shadow-md transition-shadow duration-300 flex items-center justify-center"
        >
          {pension.images?.[0]?.url ? (
            <Image
              src={pension.images[0].url}
              alt={pension.title}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, 480px"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <Building2 className="h-10 w-10 text-muted-foreground/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {(pension.verificationStatus === 'OFFICIALLY_VERIFIED' ||
              pension.verificationStatus === 'COMMUNITY_VERIFIED') && (
              <span className="flex items-center gap-1 rounded-full bg-sage/90 px-2.5 py-0.5 text-xs font-semibold text-white dark:text-zinc-950 shadow-sm leading-none">
                <ShieldCheck className="h-3 w-3" />
                Verificada
              </span>
            )}
            {isHighRelevance && (
              <span className="flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-0.5 text-xs font-semibold text-primary-foreground shadow-sm leading-none">
                <Award className="h-3 w-3" />
                Recomendada
              </span>
            )}
          </div>
        </motion.div>
      </button>

      <div className="mt-2.5 flex flex-col gap-1 w-full">
        <div className="flex items-start justify-between gap-2">
          <h3
            id={titleId}
            className="text-base font-semibold text-foreground leading-snug line-clamp-2 text-balance group-hover:text-primary transition"
          >
            <button
              type="button"
              onClick={() => onSelectPension(pension)}
              className="text-left font-semibold text-foreground group-hover:text-primary transition cursor-pointer focus:outline-none"
            >
              {pension.title}
            </button>
          </h3>
          <div className="flex items-center gap-1 text-sm font-semibold text-foreground shrink-0">
            {pension.ratingAverage > 0 ? (
              <>
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="tabular-nums">{pension.ratingAverage.toFixed(1)}</span>
              </>
            ) : (
              <>
                <Star className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-normal">Sin reseñas</span>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelectPension(pension)}
          className="flex flex-col gap-1 text-left cursor-pointer focus:outline-none"
        >
          <div className="flex items-center gap-1 text-xs text-muted-foreground line-clamp-1">
            <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span>
              {pension.neighborhood}, {pension.city}
              {pension.distanceKm !== undefined && (
                <>
                  {' '}
                  • a <span className="tabular-nums">{pension.distanceKm}</span> km
                </>
              )}
              {Boolean(pension._count?.rooms || pension.rooms?.length) && (
                <>
                  {' '}
                  • {pension._count?.rooms ?? pension.rooms?.length}{' '}
                  {(pension._count?.rooms ?? pension.rooms?.length) === 1 ? 'hab.' : 'habs.'}
                </>
              )}
            </span>
          </div>

          <div className="mt-2 pt-1 flex items-baseline gap-1">
            <span className="text-lg font-black text-foreground tabular-nums">
              ${pension.baseMonthlyPrice.toLocaleString('es-CL')} CLP
            </span>
            <span className="text-xs font-medium text-muted-foreground">/ mes</span>
          </div>
        </button>
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.75 }}
        whileHover={{ scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(pension.id);
        }}
        className="absolute top-2.5 right-2.5 z-10 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-md hover:text-primary transition-colors shadow-sm border border-border/40 cursor-pointer origin-center"
        aria-label="Guardar en favoritos"
      >
        <motion.div
          animate={isFavorite ? { scale: [1, 1.25, 1] } : { scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-primary text-primary' : 'stroke-[2]'}`} />
        </motion.div>
      </motion.button>
    </motion.article>
  );
}

export const PensionCard = memo(PensionCardComponent, areEqual);
