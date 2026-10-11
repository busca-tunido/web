'use client';

import {
  AlertCircle,
  BedDouble,
  Building2,
  DollarSign,
  DoorOpen,
  PauseCircle,
  Plus,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RoomEditorDrawer } from '@/components/landlord/room-editor-drawer';
import { type RoomItem, RoomItemCard } from '@/components/landlord/room-item-card';
import { RoomOccupancyBar } from '@/components/landlord/room-occupancy-bar';
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

function mapDtoToRoomItem(dto: RoomDto, isInactive = false): RoomItem {
  return {
    id: dto.id,
    pensionId: dto.pensionId,
    title: dto.name,
    name: dto.name,
    description: dto.description,
    monthlyPrice: dto.monthlyPrice,
    priceMonthlyClp: dto.monthlyPrice,
    isAvailable: dto.isAvailable,
    isActive: !isInactive,
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

  const [inactiveRoomIds, setInactiveRoomIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem(`landlord_inactive_rooms_${effectivePensionId}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !effectivePensionId) return;
    try {
      const stored = localStorage.getItem(`landlord_inactive_rooms_${effectivePensionId}`);
      setInactiveRoomIds(stored ? new Set(JSON.parse(stored)) : new Set());
    } catch {
      setInactiveRoomIds(new Set());
    }
  }, [effectivePensionId]);

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
        setRooms(rawItems.map((dto) => mapDtoToRoomItem(dto, inactiveRoomIds.has(dto.id))));
      } else {
        setErrorMessage(response.message || 'No fue posible cargar las habitaciones.');
      }
    } catch {
      setErrorMessage('Ocurrió un error al cargar las habitaciones.');
    } finally {
      setIsLoadingRooms(false);
    }
  }, [effectivePensionId, inactiveRoomIds]);

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

  const handleToggleActive = (roomId: string, nextActive: boolean) => {
    setInactiveRoomIds((prev) => {
      const next = new Set(prev);
      if (nextActive) {
        next.delete(roomId);
      } else {
        next.add(roomId);
      }
      try {
        localStorage.setItem(
          `landlord_inactive_rooms_${effectivePensionId}`,
          JSON.stringify(Array.from(next)),
        );
      } catch {}
      return next;
    });

    setRooms((prev) =>
      prev.map((room) => (room.id === roomId ? { ...room, isActive: nextActive } : room)),
    );
  };

  const totalRooms = rooms.length;
  const activeRooms = useMemo(() => rooms.filter((r) => r.isActive !== false), [rooms]);
  const occupiedRooms = useMemo(() => activeRooms.filter((r) => !r.isAvailable), [activeRooms]);
  const availableRooms = useMemo(() => activeRooms.filter((r) => r.isAvailable), [activeRooms]);
  const inactiveRooms = useMemo(() => rooms.filter((r) => r.isActive === false), [rooms]);

  const projectedRevenue = useMemo(
    () => occupiedRooms.reduce((sum, r) => sum + (r.monthlyPrice ?? r.priceMonthlyClp ?? 0), 0),
    [occupiedRooms],
  );

  const formattedRevenue = `$${projectedRevenue.toLocaleString('es-CL')} CLP`;

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
        <div className="h-12 w-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mb-3">
          <Building2 className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">No hay ninguna pensión seleccionada</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Selecciona una de tus propiedades o registra una nueva pensión para administrar sus
          habitaciones.
        </p>
        <Button
          type="button"
          onClick={landlordContext.openCreatePensionModal}
          className="mt-4 min-h-12 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold px-6 gap-2 cursor-pointer shadow-sm active:scale-[0.98] transition"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Pensión</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-5 w-full', className)}>
      <Card className="overflow-hidden rounded-xl border border-border/70 bg-card p-5 shadow-none text-foreground">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
              <div>
                <h2 className="text-sm font-semibold text-foreground">Métricas de Ocupación</h2>
                <p className="text-[11px] text-muted-foreground">
                  Rendimiento mensual de la propiedad
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="gap-1 border-border/80 text-foreground text-xs font-normal px-2.5 py-0.5"
            >
              <BedDouble className="h-3.5 w-3.5 text-muted-foreground" />
              {totalRooms} {totalRooms === 1 ? 'habitación' : 'habitaciones'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <RoomOccupancyBar
              totalRooms={totalRooms}
              occupiedRooms={occupiedRooms.length}
              label="Tasa de Ocupación"
              showIcon={false}
            />

            <div className="flex flex-col justify-between rounded-lg border border-border/60 bg-muted/20 p-3.5 gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Ingreso Mensual Proyectado
                </span>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
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
          <div className="h-12 w-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mb-3">
            <DoorOpen className="h-6 w-6 text-muted-foreground" />
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
              <div className="flex items-center gap-2">
                <DoorOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-bold text-foreground">Habitaciones Disponibles</h2>
              </div>
              <Badge
                variant="outline"
                className="text-xs font-semibold border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              >
                {availableRooms.length}
              </Badge>
            </div>

            {availableRooms.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 p-6 text-center bg-card/40">
                <p className="text-xs text-muted-foreground">
                  No hay habitaciones disponibles en este momento.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                  {availableRooms.map((room) => (
                    <motion.div
                      key={room.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="w-full"
                    >
                      <RoomItemCard
                        room={room}
                        onEdit={handleEditRoom}
                        onToggleAvailability={handleToggleAvailability}
                        onToggleActive={handleToggleActive}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
              <div className="flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-bold text-foreground">Habitaciones Ocupadas</h2>
              </div>
              <Badge
                variant="outline"
                className="text-xs font-semibold border-border/80 text-muted-foreground"
              >
                {occupiedRooms.length}
              </Badge>
            </div>

            {occupiedRooms.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 p-6 text-center bg-card/40">
                <p className="text-xs text-muted-foreground">
                  No hay habitaciones ocupadas actualmente.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                  {occupiedRooms.map((room) => (
                    <motion.div
                      key={room.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="w-full"
                    >
                      <RoomItemCard
                        room={room}
                        onEdit={handleEditRoom}
                        onToggleAvailability={handleToggleAvailability}
                        onToggleActive={handleToggleActive}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="col-span-full flex flex-col gap-3.5 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
              <div className="flex items-center gap-2">
                <PauseCircle className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-bold text-foreground">Habitaciones No Activas</h2>
              </div>
              <Badge
                variant="outline"
                className="text-xs font-semibold border-border/80 text-muted-foreground"
              >
                {inactiveRooms.length}
              </Badge>
            </div>

            {inactiveRooms.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 p-5 text-center bg-card/40">
                <p className="text-xs text-muted-foreground">
                  No tienes habitaciones no activas o fuera de servicio.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <AnimatePresence mode="popLayout">
                  {inactiveRooms.map((room) => (
                    <motion.div
                      key={room.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="w-full"
                    >
                      <RoomItemCard
                        room={room}
                        onEdit={handleEditRoom}
                        onToggleAvailability={handleToggleAvailability}
                        onToggleActive={handleToggleActive}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
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
