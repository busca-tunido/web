'use client';

import { Building2, Heart, ShieldCheck, Star } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useMemo } from 'react';
import { FavoritesGuestIncentive } from '@/components/favorites/favorites-guest-incentive';
import { Button } from '@/components/ui/button';
import { PensionCardSkeleton } from '@/components/ui/skeletons/pension-card-skeleton';
import { useNavigation } from '@/contexts/navigation-context';
import { useStudentFavorites } from '@/hooks/use-student-favorites';
import { useAuth } from '@/lib/auth-context';
import type { FavoritePensionSummaryDto, PensionItem } from '@/lib/types';

type FavoritesScreenProps = {
  allPensions: PensionItem[];
  onSelectPension: (pension: PensionItem | FavoritePensionSummaryDto) => void;
  onExplore: () => void;
};

export function FavoritesScreen(props: FavoritesScreenProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { openAuthModal } = useNavigation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <FavoritesGuestIncentive onOpenAuth={openAuthModal} />;
  }

  return <FavoritesContent {...props} />;
}

function FavoritesContent({ allPensions, onSelectPension, onExplore }: FavoritesScreenProps) {
  const { favorites: authFavorites } = useAuth();
  const {
    favorites,
    isFavorite,
    toggleFavorite,
    errorMessage,
    clearError,
    favoritePensions,
    isLoading: isLoadingFavorites,
  } = useStudentFavorites(authFavorites);

  const savedPensions = useMemo(() => {
    const mapById = new Map<string, PensionItem | FavoritePensionSummaryDto>();
    for (const p of allPensions) {
      if (favorites.includes(p.id) || isFavorite(p.id)) {
        mapById.set(p.id, p);
      }
    }
    for (const p of favoritePensions) {
      if (!mapById.has(p.id) && (favorites.includes(p.id) || isFavorite(p.id))) {
        mapById.set(p.id, p);
      }
    }
    return Array.from(mapById.values());
  }, [allPensions, favoritePensions, favorites, isFavorite]);

  const knownCount = Math.max(authFavorites.length, favorites.length);
  const remainingCount = isLoadingFavorites
    ? savedPensions.length === 0
      ? knownCount > 0
        ? knownCount
        : 4
      : Math.max(0, knownCount - savedPensions.length)
    : 0;

  return (
    <div
      id="favorites-screen-view"
      className="flex flex-col gap-6 px-4 md:px-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-12 pt-2"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tus Favoritos</h2>
          <p className="text-xs text-muted-foreground tabular-nums">
            {isLoadingFavorites && remainingCount > 0
              ? knownCount > 0
                ? `Cargando ${knownCount} ${knownCount === 1 ? 'alojamiento guardado' : 'alojamientos guardados'}...`
                : 'Cargando tus alojamientos guardados...'
              : `${savedPensions.length} ${
                  savedPensions.length === 1
                    ? 'alojamiento guardado para postular'
                    : 'alojamientos guardados para postular'
                }`}
          </p>
        </div>
      </div>

      <FavoritesGrid
        savedPensions={savedPensions}
        skeletonCount={remainingCount}
        onSelectPension={onSelectPension}
        onExplore={onExplore}
        toggleFavorite={toggleFavorite}
      />

      {errorMessage && (
        <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-12 left-4 right-4 z-50 flex items-center justify-between rounded-xl bg-destructive text-destructive-foreground px-4 py-3 text-xs font-semibold shadow-lg">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={clearError}
            className="ml-2 text-xs underline cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}

type FavoritesGridProps = {
  savedPensions: (PensionItem | FavoritePensionSummaryDto)[];
  skeletonCount?: number;
  onSelectPension: (pension: PensionItem | FavoritePensionSummaryDto) => void;
  onExplore: () => void;
  toggleFavorite: (id: string) => void;
};

function FavoritesGrid({
  savedPensions,
  skeletonCount = 0,
  onSelectPension,
  onExplore,
  toggleFavorite,
}: FavoritesGridProps) {
  if (savedPensions.length === 0 && skeletonCount === 0) {
    return (
      <div className="my-12 -mt-4 flex flex-col items-center justify-center rounded-2xl border border-border bg-card/60 px-8 pt-8 pb-12 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
          <Heart className="h-6 w-6 -translate-y-0.5" />
        </div>
        <h3 className="text-sm font-semibold text-foreground text-balance">
          Aún no has guardado alojamientos favoritos
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs text-pretty">
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
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {savedPensions.map((pension) => (
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
            <div className="relative w-full aspect-[16/10] overflow-hidden rounded-2xl bg-muted shadow-sm flex items-center justify-center">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

              {(pension.verificationStatus === 'OFFICIALLY_VERIFIED' ||
                pension.verificationStatus === 'COMMUNITY_VERIFIED') && (
                <div className="absolute bottom-3 left-3">
                  <span className="flex items-center gap-1 rounded-full bg-sage/90 px-2.5 py-0.5 text-[11px] font-semibold text-white dark:text-zinc-950 backdrop-blur-md shadow-sm">
                    <ShieldCheck className="h-3 w-3" />
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
                  <span>
                    {pension.ratingAverage > 0 ? pension.ratingAverage.toFixed(1) : 'Nuevo'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-1">
                {pension.neighborhood}, {pension.city}
              </p>

              <div className="mt-0.5 flex items-baseline gap-1">
                <span className="text-base font-bold text-foreground">
                  ${pension.baseMonthlyPrice.toLocaleString('es-CL')} CLP
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
            className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-md hover:text-primary transition-colors shadow-sm border border-border/40 cursor-pointer"
            aria-label="Quitar de favoritos"
            title="Quitar de favoritos"
          >
            <Heart className="h-5 w-5 fill-primary text-primary" />
          </motion.button>
        </motion.div>
      ))}

      {Array.from({ length: skeletonCount }, (_, idx) => (
        <PensionCardSkeleton key={`fav-skel-slot-${idx}`} />
      ))}
    </div>
  );
}
