'use client';

import { Bath, Edit3, Loader2, Sparkles, User, Users } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type RoomType = 'SINGLE' | 'SHARED' | 'STUDIO';

export type RoomItem = {
  id: string;
  pensionId?: string;
  title?: string;
  name?: string;
  roomNumber?: string;
  description?: string | null;
  type?: RoomType;
  roomType?: RoomType | 'SINGLE' | 'SHARED';
  monthlyPrice?: number;
  priceMonthlyClp?: number;
  deposit?: number | null;
  depositClp?: number | null;
  hasPrivateBathroom?: boolean;
  bathType?: 'PRIVATE' | 'SHARED';
  isAvailable: boolean;
  totalBeds?: number;
  availableBeds?: number;
  bedCount?: number;
  images?: string[];
  photos?: string[];
  thumbnailUrl?: string;
  availableFrom?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type RoomItemCardProps = {
  room: RoomItem;
  onEdit: (room: RoomItem) => void;
  onToggleAvailability: (roomId: string, isAvailable: boolean) => Promise<void>;
  className?: string;
};

const FALLBACK_ROOM_IMAGE =
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80';

export function RoomItemCard({ room, onEdit, onToggleAvailability, className }: RoomItemCardProps) {
  const [isAvailable, setIsAvailable] = useState<boolean>(room.isAvailable);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setIsAvailable(room.isAvailable);
  }, [room.isAvailable]);

  const rawTitle = room.title || room.name || room.roomNumber || 'Habitación';
  const resolvedType: RoomType = room.type ?? (room.roomType === 'SHARED' ? 'SHARED' : 'SINGLE');
  const price = room.monthlyPrice ?? room.priceMonthlyClp ?? 0;
  const isPrivateBath = Boolean(room.hasPrivateBathroom ?? room.bathType === 'PRIVATE');
  const beds = room.totalBeds ?? room.bedCount ?? 1;

  const imageList = room.images?.length
    ? room.images
    : room.photos?.length
      ? room.photos
      : room.thumbnailUrl
        ? [room.thumbnailUrl]
        : [];
  const thumbnail = imageList[0] || FALLBACK_ROOM_IMAGE;

  const formattedPrice = `$${price.toLocaleString('es-CL')} CLP`;

  const handleToggle = async () => {
    if (isUpdating) return;

    const previous = isAvailable;
    const next = !previous;
    setIsAvailable(next);
    setIsUpdating(true);
    setHasError(false);

    try {
      await onToggleAvailability(room.id, next);
    } catch {
      setIsAvailable(previous);
      setHasError(true);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 transition-all hover:border-border hover:shadow-md text-foreground',
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-muted shadow-2xs">
            <Image
              src={thumbnail}
              alt={rawTitle}
              fill
              unoptimized
              sizes="(max-width: 640px) 96px, 112px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div
              className={cn(
                'absolute top-1.5 left-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-xs backdrop-blur-md',
                isAvailable ? 'bg-emerald-500/90 text-white' : 'bg-zinc-900/80 text-zinc-300',
              )}
            >
              {isAvailable ? 'Disponible' : 'Ocupada'}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 min-w-0 flex-1 text-left">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm sm:text-base font-bold text-foreground leading-tight">
                {rawTitle}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {resolvedType === 'SINGLE' && (
                <Badge
                  variant="outline"
                  className="gap-1 border-primary/30 bg-primary/5 text-primary text-[11px] font-medium"
                >
                  <User className="h-3 w-3" />
                  Individual
                </Badge>
              )}

              {resolvedType === 'SHARED' && (
                <Badge
                  variant="outline"
                  className="gap-1 border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-medium"
                >
                  <Users className="h-3 w-3" />
                  Compartida ({beds} {beds === 1 ? 'cama' : 'camas'})
                </Badge>
              )}

              {resolvedType === 'STUDIO' && (
                <Badge
                  variant="outline"
                  className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-medium"
                >
                  <Sparkles className="h-3 w-3" />
                  Estudio
                </Badge>
              )}

              {isPrivateBath ? (
                <Badge
                  variant="secondary"
                  className="gap-1 text-[11px] font-medium text-foreground bg-secondary"
                >
                  <Bath className="h-3 w-3 text-primary" />
                  Baño privado
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="gap-1 text-[11px] font-medium text-muted-foreground"
                >
                  <Bath className="h-3 w-3" />
                  Baño compartido
                </Badge>
              )}
            </div>

            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                {formattedPrice}
              </span>
              <span className="text-xs text-muted-foreground font-medium">/ mes</span>
            </div>

            {hasError && (
              <span className="text-[11px] font-semibold text-destructive animate-in fade-in">
                Error al actualizar. Se restableció el estado previo.
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 pt-3 border-t border-border/50 sm:border-t-0 sm:pt-0 shrink-0">
          <button
            type="button"
            role="switch"
            aria-checked={isAvailable}
            aria-label={`Cambiar disponibilidad de ${rawTitle}`}
            disabled={isUpdating}
            onClick={handleToggle}
            className="flex min-h-12 items-center gap-2.5 rounded-xl px-2 py-1.5 text-xs transition-colors hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer disabled:opacity-60"
          >
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider leading-none">
                Estado
              </span>
              <span
                className={cn(
                  'text-xs font-bold leading-tight',
                  isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground',
                )}
              >
                {isAvailable ? 'Disponible' : 'Ocupada'}
              </span>
            </div>

            <div
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                isAvailable ? 'bg-emerald-500' : 'bg-muted-foreground/30',
              )}
            >
              {isUpdating ? (
                <div
                  className={cn(
                    'flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-md transition duration-200 ease-in-out',
                    isAvailable ? 'translate-x-5' : 'translate-x-0',
                  )}
                >
                  <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />
                </div>
              ) : (
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                    isAvailable ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              )}
            </div>
          </button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit(room)}
            className="min-h-12 px-4 rounded-xl border-border/80 hover:bg-secondary font-semibold text-xs gap-1.5 shadow-2xs cursor-pointer"
          >
            <Edit3 className="h-4 w-4 text-primary" />
            <span>Editar</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
