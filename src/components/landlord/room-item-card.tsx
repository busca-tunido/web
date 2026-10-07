'use client';

import { Bath, Edit3, Loader2, PauseCircle, PlayCircle, Sparkles, User, Users } from 'lucide-react';
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
  isActive?: boolean;
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
  onToggleActive?: (roomId: string, isActive: boolean) => Promise<void> | void;
  className?: string;
};

const FALLBACK_ROOM_IMAGE =
  'https://br-gentle-butterfly-aevuizs0.storage.c-2.us-east-2.aws.neon.tech/uploads/rooms/room-fallback.webp';

export function RoomItemCard({
  room,
  onEdit,
  onToggleAvailability,
  onToggleActive,
  className,
}: RoomItemCardProps) {
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
        'group relative overflow-hidden rounded-xl border border-border/70 bg-card p-4 transition-all hover:border-border hover:shadow-2xs text-foreground',
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
                  className="gap-1 border-border/80 text-foreground text-[11px] font-normal"
                >
                  <User className="h-3 w-3 text-muted-foreground" />
                  Individual
                </Badge>
              )}

              {resolvedType === 'SHARED' && (
                <Badge
                  variant="outline"
                  className="gap-1 border-border/80 text-foreground text-[11px] font-normal"
                >
                  <Users className="h-3 w-3 text-muted-foreground" />
                  Compartida ({beds} {beds === 1 ? 'cama' : 'camas'})
                </Badge>
              )}

              {resolvedType === 'STUDIO' && (
                <Badge
                  variant="outline"
                  className="gap-1 border-border/80 text-foreground text-[11px] font-normal"
                >
                  <Sparkles className="h-3 w-3 text-muted-foreground" />
                  Estudio
                </Badge>
              )}

              {isPrivateBath ? (
                <Badge
                  variant="outline"
                  className="gap-1 border-border/80 text-foreground text-[11px] font-normal"
                >
                  <Bath className="h-3 w-3 text-muted-foreground" />
                  Baño privado
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="gap-1 border-border/80 text-muted-foreground text-[11px] font-normal"
                >
                  <Bath className="h-3 w-3 text-muted-foreground" />
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

        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2.5 pt-3 border-t border-border/50 sm:border-t-0 sm:pt-0 shrink-0">
          {room.isActive !== false ? (
            <button
              type="button"
              role="switch"
              aria-checked={isAvailable}
              aria-label={`Cambiar disponibilidad de ${rawTitle}`}
              disabled={isUpdating}
              onClick={handleToggle}
              className="flex min-h-[40px] items-center gap-2 rounded-xl px-2 py-1 text-xs transition-colors hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer disabled:opacity-60"
            >
              <span className="text-xs font-medium text-muted-foreground select-none">
                Disponibilidad
              </span>

              <div
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                  isAvailable ? 'bg-emerald-500' : 'bg-muted-foreground/30',
                )}
              >
                {isUpdating ? (
                  <div
                    className={cn(
                      'flex h-4 w-4 transform items-center justify-center rounded-full bg-white shadow-md transition duration-200 ease-in-out',
                      isAvailable ? 'translate-x-4' : 'translate-x-0',
                    )}
                  >
                    <Loader2 className="h-2.5 w-2.5 animate-spin text-emerald-600" />
                  </div>
                ) : (
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                      isAvailable ? 'translate-x-4' : 'translate-x-0',
                    )}
                  />
                )}
              </div>
            </button>
          ) : (
            <Badge
              variant="outline"
              className="border-border/80 text-muted-foreground text-[10px] py-0.5"
            >
              No activa
            </Badge>
          )}

          <div className="flex items-center gap-1.5">
            {onToggleActive && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onToggleActive(room.id, room.isActive === false)}
                className={cn(
                  'min-h-[36px] px-2.5 text-xs font-semibold rounded-lg cursor-pointer transition',
                  room.isActive === false
                    ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                title={room.isActive === false ? 'Reactivar habitación' : 'Desactivar habitación'}
              >
                {room.isActive === false ? (
                  <>
                    <PlayCircle className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                    <span>Activar</span>
                  </>
                ) : (
                  <>
                    <PauseCircle className="h-3.5 w-3.5 mr-1" />
                    <span>Pausar</span>
                  </>
                )}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEdit(room)}
              className="min-h-[36px] px-3 rounded-lg border-border/80 hover:bg-secondary font-semibold text-xs gap-1.5 shadow-2xs cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Editar</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
