'use client';

import { Calendar, CheckCircle2, History, MessageSquare, Star } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MOCK_STAY_HISTORY } from '@/lib/mock-data';

type HistoryScreenProps = {
  onExplore?: () => void;
};

export function HistoryScreen({ onExplore }: HistoryScreenProps) {
  const [stays] = useState(MOCK_STAY_HISTORY);

  return (
    <div id="history-screen-view" className="flex flex-col gap-4 px-4 pb-28 pt-2">
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

      {stays.length === 0 ? (
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
      ) : (
        <div className="flex flex-col gap-3">
          {stays.map((stay) => (
            <div
              key={stay.id}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm flex flex-col"
            >
              <div className="relative h-36 w-full overflow-hidden bg-muted">
                <img
                  src={stay.imageUrl}
                  alt={stay.pensionTitle}
                  className="h-full w-full object-cover"
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
                  <span>
                    {stay.startDate} hasta {stay.endDate}
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
                    className="h-8 border-border text-[11px] text-foreground hover:bg-secondary"
                  >
                    <MessageSquare className="mr-1 h-3 w-3" /> Ver reseña
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
