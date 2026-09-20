'use client';

import { Calendar, CheckCircle2, History, MessageSquare, Star } from 'lucide-react';
import Image from 'next/image';
import { Suspense, useState } from 'react';
import { HistoryGuestIncentive } from '@/components/history/history-guest-incentive';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HistorySkeleton } from '@/components/ui/skeletons/history-skeleton';
import { useNavigation } from '@/contexts/navigation-context';
import { useStayHistory } from '@/hooks/use-stay-history';
import { useAuth } from '@/lib/auth-context';
import type { StayHistoryItem } from '@/lib/types';
import { UserReviewModal } from './user-review-modal';

type HistoryScreenProps = {
  onExplore?: () => void;
};

export function HistoryScreen(props: HistoryScreenProps) {
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useNavigation();

  if (!isAuthenticated) {
    return <HistoryGuestIncentive onOpenAuth={openAuthModal} />;
  }

  return <HistoryContent {...props} />;
}

function HistoryContent({ onExplore }: HistoryScreenProps) {
  const { stays, formatDateRange } = useStayHistory();
  const [selectedReviewStay, setSelectedReviewStay] = useState<StayHistoryItem | null>(null);

  return (
    <div id="history-screen-view" className="flex flex-col gap-5 px-4 md:px-0 pb-20 md:pb-12 pt-2">
      <div>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Donde me he alojado</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Historial de residencias universitarias verificadas y calificaciones de convivencia
        </p>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-primary">Estudiante Verificado</h4>
            <p className="text-[11px] text-foreground/80">
              Cumplimiento impecable en pagos y convivencia en tus últimas estadías
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<HistorySkeleton />}>
        <HistoryList
          stays={stays}
          onExplore={onExplore}
          onSelectReviewStay={setSelectedReviewStay}
          formatDateRange={formatDateRange}
        />
      </Suspense>

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
  onExplore?: () => void;
  onSelectReviewStay: (stay: StayHistoryItem) => void;
  formatDateRange: (start: string, end: string) => string;
};

function HistoryList({ stays, onExplore, onSelectReviewStay, formatDateRange }: HistoryListProps) {
  if (stays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-xs text-muted-foreground mb-3">Aún no registras estadías finalizadas</p>
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
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {stays.map((stay) => {
        const stayImg =
          stay.imageUrl && stay.imageUrl.trim().length > 0
            ? stay.imageUrl
            : 'https://br-gentle-butterfly-aevuizs0.storage.c-2.us-east-2.aws.neon.tech/uploads/pensions/stay-history-fallback.webp';

        return (
          <div
            key={stay.id}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm flex flex-col"
          >
            <div className="relative h-36 w-full overflow-hidden bg-muted">
              <Image
                src={stayImg}
                alt={stay.pensionTitle}
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, 480px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              <div className="absolute bottom-2.5 left-2.5">
                <Badge className="bg-background/80 text-foreground border border-border text-[10px] backdrop-blur-md">
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
                  <span className="block text-[10px] text-muted-foreground">CLP/mes</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{formatDateRange(stay.startDate, stay.endDate)}</span>
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
    </div>
  );
}
