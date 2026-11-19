'use client';

import { Building2, Calendar, History, MessageSquare, Star } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { NetworkErrorState } from '@/components/common/network-error-state';
import { HistoryGuestIncentive } from '@/components/history/history-guest-incentive';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FullScreenImageViewer } from '@/components/ui/fullscreen-image-viewer';
import { HistoryCardsSkeleton, HistorySkeleton } from '@/components/ui/skeletons/history-skeleton';
import { useNavigation } from '@/contexts/navigation-context';
import { useStayHistory } from '@/hooks/use-stay-history';
import { useAuth } from '@/lib/auth-context';
import { shouldBypassImageOptimization } from '@/lib/image-utils';
import { assertNever, deriveAuthProtectedViewState } from '@/lib/student-view-state';
import type { StayHistoryItem } from '@/lib/types';
import { UserReviewModal } from './user-review-modal';

type HistoryScreenProps = {
  onExplore?: () => void;
};

export function HistoryScreen(props: HistoryScreenProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { openAuthModal } = useNavigation();

  const viewState = deriveAuthProtectedViewState({
    isAuthLoading: isLoading,
    isAuthenticated,
    data: props,
  });

  switch (viewState.status) {
    case 'resolving_auth':
    case 'loading':
      return <HistorySkeleton count={3} />;
    case 'guest':
      return <HistoryGuestIncentive onOpenAuth={openAuthModal} />;
    case 'error':
      return <NetworkErrorState message={viewState.message} />;
    case 'empty':
      return null;
    case 'ready':
      return <HistoryContent {...viewState.data} />;
    default:
      return assertNever(viewState);
  }
}

function HistoryContent({ onExplore }: HistoryScreenProps) {
  const { stays, isLoading, expectedCount, error, formatDateRange, refreshStays } =
    useStayHistory();
  const [selectedReviewStay, setSelectedReviewStay] = useState<StayHistoryItem | null>(null);

  return (
    <div
      id="history-screen-view"
      className="flex flex-col gap-5 px-4 md:px-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-12 pt-2"
    >
      <div>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight text-foreground text-balance">
            Historial de Estadías Universitarias
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1 text-pretty">
          Historial de residencias universitarias verificadas y calificaciones de convivencia
        </p>
      </div>

      <HistoryList
        stays={stays}
        isLoading={isLoading}
        expectedCount={expectedCount}
        error={error}
        onRetry={refreshStays}
        onExplore={onExplore}
        onSelectReviewStay={setSelectedReviewStay}
        formatDateRange={formatDateRange}
      />

      <UserReviewModal
        isOpen={Boolean(selectedReviewStay)}
        onClose={() => setSelectedReviewStay(null)}
        stay={selectedReviewStay}
      />
    </div>
  );
}

type HistoryListProps = {
  stays: StayHistoryItem[];
  isLoading: boolean;
  expectedCount?: number;
  error?: string | null;
  onRetry?: () => void;
  onExplore?: () => void;
  onSelectReviewStay: (stay: StayHistoryItem) => void;
  formatDateRange: (
    start?: string | null,
    end?: string | null,
    durationCategory?: string | null,
  ) => string;
};

type HistoryListState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'ready'; items: StayHistoryItem[] };

function deriveHistoryListState(
  stays: StayHistoryItem[],
  isLoading: boolean,
  error?: string | null,
): HistoryListState {
  if (isLoading) return { status: 'loading' };
  if (error && stays.length === 0) return { status: 'error', message: error };
  if (stays.length === 0) return { status: 'empty' };
  return { status: 'ready', items: stays };
}

function HistoryList({
  stays,
  isLoading,
  expectedCount = 3,
  error = null,
  onRetry,
  onExplore,
  onSelectReviewStay,
  formatDateRange,
}: HistoryListProps) {
  const [viewerData, setViewerData] = useState<{
    url: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  const listState = deriveHistoryListState(stays, isLoading, error);

  switch (listState.status) {
    case 'loading':
      return <HistoryCardsSkeleton count={expectedCount} />;
    case 'error':
      return <NetworkErrorState message={listState.message} onRetry={onRetry} />;
    case 'empty':
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-xs text-muted-foreground mb-3">
            Aún no registras estadías finalizadas
          </p>
          {onExplore && (
            <Button
              onClick={onExplore}
              className="bg-primary text-primary-foreground font-bold text-xs"
            >
              Explorar Pensiones
            </Button>
          )}
        </div>
      );
    case 'ready':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {listState.items.map((stay) => {
            const hasImg = Boolean(stay.imageUrl && stay.imageUrl.trim().length > 0);

            return (
              <div
                key={stay.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm flex flex-col"
              >
                <div className="relative h-36 w-full overflow-hidden bg-muted flex items-center justify-center">
                  {hasImg ? (
                    <button
                      type="button"
                      onClick={() =>
                        setViewerData({
                          url: stay.imageUrl as string,
                          title: stay.pensionTitle,
                          subtitle: `${stay.roomTitle} • ${stay.pensionCity}`,
                        })
                      }
                      className="group relative h-full w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label={`Ver foto de ${stay.pensionTitle} a pantalla completa`}
                    >
                      <Image
                        src={stay.imageUrl as string}
                        alt={stay.pensionTitle}
                        fill
                        unoptimized={shouldBypassImageOptimization(stay.imageUrl)}
                        sizes="(max-width: 640px) 100vw, 480px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </button>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted/40 text-muted-foreground">
                      <Building2 className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                  <div className="absolute bottom-2.5 left-2.5 pointer-events-none">
                    <Badge className="bg-background/80 text-foreground border border-border text-xs backdrop-blur-md">
                      {stay.pensionCity}
                    </Badge>
                  </div>
                </div>

                <div className="p-3.5 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{stay.pensionTitle}</h4>
                      <p className="text-xs text-muted-foreground">{stay.roomTitle}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-primary">
                        ${stay.monthlyPaidClp.toLocaleString('es-CL')}
                      </span>
                      <span className="block text-xs text-muted-foreground">CLP/mes</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>
                      {formatDateRange(
                        undefined,
                        undefined,
                        stay.stayDurationCategory ?? stay.review?.stayDurationCategory,
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-2.5">
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                      <Star className="h-3.5 w-3.5 fill-amber-500" />
                      <span>Tu reseña: {stay.ratingGiven}/5 estrellas</span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectReviewStay(stay)}
                      className="h-8 border-border text-[11px] text-foreground hover:bg-secondary cursor-pointer"
                    >
                      <MessageSquare className="mr-1 h-3 w-3" /> Ver reseña
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {viewerData && (
            <FullScreenImageViewer
              isOpen={Boolean(viewerData)}
              onClose={() => setViewerData(null)}
              images={[viewerData.url]}
              title={viewerData.title}
              subtitle={viewerData.subtitle}
            />
          )}
        </div>
      );
    default:
      return assertNever(listState);
  }
}
