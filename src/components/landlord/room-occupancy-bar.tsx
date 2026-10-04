'use client';

import { BedDouble } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type RoomOccupancyBarProps = {
  totalRooms: number;
  occupiedRooms: number;
  label?: string;
  showIcon?: boolean;
  className?: string;
};

export function RoomOccupancyBar({
  totalRooms,
  occupiedRooms,
  label = 'Ocupación de Habitaciones',
  showIcon = true,
  className,
}: RoomOccupancyBarProps) {
  const availableRooms = Math.max(0, totalRooms - occupiedRooms);
  const isFullyOccupied = totalRooms > 0 && occupiedRooms >= totalRooms;

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-xl border p-3 transition-colors duration-150 bg-card/60 dark:bg-card/40',
        totalRooms === 0
          ? 'border-border/60 text-muted-foreground'
          : isFullyOccupied
            ? 'border-rose-500/30 bg-rose-500/[0.03]'
            : 'border-border/70',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px] truncate">
          {showIcon && (
            <BedDouble
              className={cn(
                'h-3.5 w-3.5 shrink-0',
                isFullyOccupied ? 'text-rose-500' : 'text-muted-foreground',
              )}
            />
          )}
          <span className="truncate">{label}</span>
        </span>

        {totalRooms === 0 ? (
          <Badge variant="outline" className="text-[10px] text-muted-foreground py-0 font-normal">
            0 habitaciones
          </Badge>
        ) : isFullyOccupied ? (
          <Badge
            variant="outline"
            className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-semibold py-0 shrink-0"
          >
            100% Ocupada
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-[10px] font-medium py-0 shrink-0 text-muted-foreground border-border/80"
          >
            {availableRooms} {availableRooms === 1 ? 'habitación libre' : 'habitaciones libres'}
          </Badge>
        )}
      </div>

      {totalRooms === 0 ? (
        <div className="h-3 w-full rounded-md bg-muted/30 border border-dashed border-border/60 flex items-center justify-center text-[10px] text-muted-foreground">
          Sin habitaciones registradas
        </div>
      ) : (
        <div className="flex h-3 w-full items-stretch gap-1 sm:gap-1.5">
          {Array.from({ length: totalRooms }).map((_, index) => {
            const isOccupied = index < occupiedRooms;
            return (
              <div
                key={index}
                title={
                  isOccupied
                    ? `Habitación ${index + 1}: Ocupada`
                    : `Habitación ${index + 1}: Disponible`
                }
                className={cn(
                  'h-full flex-1 rounded-xs sm:rounded-sm transition-all duration-200',
                  isOccupied
                    ? isFullyOccupied
                      ? 'bg-rose-500'
                      : 'bg-zinc-700 dark:bg-zinc-300'
                    : 'bg-muted/70 dark:bg-muted/30 border border-border/40',
                )}
              />
            );
          })}
        </div>
      )}

      {totalRooms > 0 && (
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5 font-normal">
          <span>
            {isFullyOccupied
              ? 'Todas las habitaciones ocupadas'
              : `${availableRooms} disponible${availableRooms === 1 ? '' : 's'} para postulantes`}
          </span>
          <span>{totalRooms} habitaciones en total</span>
        </div>
      )}
    </div>
  );
}
