'use client';

import { Calendar, CheckCircle2, History, MessageSquare, Star } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
          <History className="h-5 w-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">Donde me he alojado</h2>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Historial de residencias universitarias verificadas y calificaciones de convivencia
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-emerald-300">Estudiante Verificado</h4>
            <p className="text-[11px] text-zinc-300">
              Cumplimiento impecable en pagos y convivencia en tus últimas estadías
            </p>
          </div>
        </div>
      </div>

      {stays.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-xs text-zinc-400 mb-3">Aún no registras estadías finalizadas</p>
          {onExplore && (
            <Button onClick={onExplore} className="bg-emerald-500 text-zinc-950 font-bold text-xs">
              Explorar Pensiones
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {stays.map((stay) => (
            <Card
              key={stay.id}
              className="overflow-hidden rounded-2xl border-zinc-800 bg-zinc-900/70"
            >
              <div className="relative h-32 w-full overflow-hidden bg-zinc-950">
                <img
                  src={stay.imageUrl}
                  alt={stay.pensionTitle}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/20" />
                <div className="absolute bottom-2.5 left-2.5">
                  <Badge className="bg-zinc-900/90 text-zinc-200 border border-zinc-700 text-[10px]">
                    {stay.pensionCity}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-3.5 flex flex-col gap-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{stay.pensionTitle}</h4>
                    <p className="text-xs text-zinc-400">{stay.roomTitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400">
                      ${stay.monthlyPaidClp.toLocaleString('es-CL')}
                    </span>
                    <span className="block text-[10px] text-zinc-500">CLP/mes</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                  <span>
                    {stay.startDate} hasta {stay.endDate}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-800 pt-2.5">
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span>Tu reseña: {stay.ratingGiven}/5 estrellas</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-zinc-800 text-[11px] text-zinc-300 hover:text-white"
                  >
                    <MessageSquare className="mr-1 h-3 w-3" /> Ver reseña
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
