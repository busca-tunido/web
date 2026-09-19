'use client';

import {
  AlertCircle,
  BedDouble,
  Building2,
  DollarSign,
  DoorOpen,
  Plus,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { RoomEditorDrawer } from '@/components/landlord/room-editor-drawer';
import { type RoomItem, RoomItemCard } from '@/components/landlord/room-item-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLandlord } from '@/contexts/landlord-context';
import { isApiSuccess } from '@/lib/api-response';
import type { PensionItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { fetchPensionRooms, updateRoom } from '@/services/rooms.service';
import type { RoomDto } from '@/types/api-contracts';

export type LandlordRoomsScreenProps = {
  pensionId?: string;
  selectedPension?: PensionItem | null;
  className?: string;
};

function mapDtoToRoomItem(dto: RoomDto): RoomItem {
  return {
    id: dto.id,
    pensionId: dto.pensionId,
    title: dto.name,
    name: dto.name,
    description: dto.description,
    monthlyPrice: dto.monthlyPrice,
    priceMonthlyClp: dto.monthlyPrice,
    isAvailable: dto.isAvailable,
    bathType: dto.bathType,
    hasPrivateBathroom: dto.bathType === 'PRIVATE',
    availableFrom: dto.availableFrom,
    images: dto.images ?? [],
  };
}

export function LandlordRoomsScreen({
  pensionId: propPensionId,
  selectedPension: propSelectedPension,
  className,
}: LandlordRoomsScreenProps = {}) {
  const landlordContext = useLandlord();
  const effectivePension = propSelectedPension ?? landlordContext.selectedPension;
  const effectivePensionId = propPensionId ?? effectivePension?.id ?? '';

  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<RoomItem | null>(null);

  const loadRooms = useCallback(async () => {
    if (!effectivePensionId) {
      setRooms([]);
      setIsLoadingRooms(false);
      return;
    }

    setIsLoadingRooms(true);
    setErrorMessage(null);

    try {
      const response = await fetchPensionRooms(effectivePensionId);
      if (isApiSuccess(response)) {
        const rawItems = Array.isArray(response.data) ? response.data : [];
        setRooms(rawItems.map(mapDtoToRoomItem));
      } else {
        setErrorMessage(response.message || 'No fue posible cargar las habitaciones.');
      }
    } catch {
      setErrorMessage('Ocurrió un error al cargar las habitaciones.');
    } finally {
      setIsLoadingRooms(false);
    }
  }, [effectivePensionId]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleOpenCreateDrawer = () => {
    setEditingRoom(null);
    setIsDrawerOpen(true);
  };

  const handleEditRoom = (room: RoomItem) => {
    setEditingRoom(room);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingRoom(null);
  };

  const handleDrawerSuccess = () => {
    loadRooms();
  };

  const handleToggleAvailability = async (roomId: string, isAvailable: boolean) => {
    setRooms((prev) => prev.map((room) => (room.id === roomId ? { ...room, isAvailable } : room)));

    const response = await updateRoom(roomId, { isAvailable });
    if (!isApiSuccess(response)) {
      setRooms((prev) =>
        prev.map((room) => (room.id === roomId ? { ...room, isAvailable: !isAvailable } : room)),
      );
      throw new Error(response.message || 'No fue posible actualizar la disponibilidad.');
    }
  };

  const isInitialLoading = landlordContext.isLoading && !effectivePension;

  if (isInitialLoading || (isLoadingRooms && rooms.length === 0 && !errorMessage)) {
    return (
      <div className={cn('space-y-6 w-full animate-pulse', className)}>
        <div className="h-44 w-full rounded-2xl bg-muted/50" />
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 rounded-lg bg-muted/50" />
          <div className="h-12 w-36 rounded-xl bg-muted/50" />
        </div>
        <div className="space-y-3">
          <div className="h-32 w-full rounded-2xl bg-muted/40" />
          <div className="h-32 w-full rounded-2xl bg-muted/40" />
        </div>
      </div>
    );
  }

  if (!effectivePension && !effectivePensionId) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-border/80 bg-card my-6',
          className,
        )}
      >
        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
          <Building2 className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">No hay ninguna pensión seleccionada</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Selecciona una de tus propiedades o registra una nueva pensión para administrar sus
          habitaciones.
        </p>
      </div>
    );
  }

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => !r.isAvailable).length;
  const availableRooms = rooms.filter((r) => r.isAvailable).length;
  const occupancyPercentage = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const projectedRevenue = rooms
    .filter((r) => !r.isAvailable)
    .reduce((sum, r) => sum + (r.monthlyPrice ?? r.priceMonthlyClp ?? 0), 0);

  const formattedRevenue = `$${projectedRevenue.toLocaleString('es-CL')} CLP`;

  return (
    <div className={cn('space-y-5 w-full', className)}>
      <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-xs text-foreground">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Métricas de Ocupación</h2>
                <p className="text-[11px] text-muted-foreground">
                  Rendimiento mensual de la propiedad
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="gap-1 bg-secondary text-foreground text-xs font-semibold px-2.5 py-1"
            >
              <BedDouble className="h-3.5 w-3.5 text-primary" />
              {totalRooms} {totalRooms === 1 ? 'habitación' : 'habitaciones'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="flex flex-col justify-between rounded-xl border border-border/60 bg-muted/30 p-3.5 gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  Tasa de Ocupación
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {occupancyPercentage}%
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
                    style={{ width: `${occupancyPercentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                  <span>
                    {occupiedRooms} de {totalRooms} ocupadas
                  </span>
                  <span>{availableRooms} disponibles</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-border/60 bg-muted/30 p-3.5 gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  Ingreso Mensual Proyectado
                </span>
                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                    {formattedRevenue}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">/ mes</span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  Calculado en base a habitaciones actualmente ocupadas
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {errorMessage && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 flex items-center justify-between gap-3 text-destructive animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="text-xs font-medium">{errorMessage}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={loadRooms}
            className="min-h-9 px-2.5 text-xs font-semibold text-destructive hover:bg-destructive/15 gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Habitaciones Registradas
          </h1>
          <p className="text-xs text-muted-foreground">
            Configura precios, disponibilidad y características de cada pieza.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleOpenCreateDrawer}
          className="min-h-12 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold px-4 gap-2 cursor-pointer shadow-xs active:scale-[0.98] transition shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Agregar Habitación</span>
        </Button>
      </div>

      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-border/80 bg-card/60 my-2">
          <div className="h-12 w-12 rounded-2xl bg-secondary text-muted-foreground flex items-center justify-center mb-3">
            <DoorOpen className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Aún no tienes habitaciones registradas
          </h3>
          <p className="text-xs text-muted-foreground mt-1 mb-5 max-w-sm">
            Publica las piezas de tu pensión para que los estudiantes universitarios puedan postular
            y arrendarlas.
          </p>
          <Button
            type="button"
            onClick={handleOpenCreateDrawer}
            className="min-h-12 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold px-5 gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar tu primera habitación</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => (
            <RoomItemCard
              key={room.id}
              room={room}
              onEdit={handleEditRoom}
              onToggleAvailability={handleToggleAvailability}
            />
          ))}
        </div>
      )}

      <RoomEditorDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        pensionId={effectivePensionId}
        roomToEdit={editingRoom}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  );
}
