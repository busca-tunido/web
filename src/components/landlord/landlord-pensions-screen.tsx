'use client';

import { BedDouble, Building2, Check, ChevronRight, Eye, Home, MapPin, Plus } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { PensionDetailModal } from '@/components/pensions/pension-detail-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLandlord } from '@/contexts/landlord-context';
import type { PensionItem } from '@/lib/types';
import { cn } from '@/lib/utils';

export type LandlordPensionsScreenProps = {
  className?: string;
};

export function LandlordPensionsScreen({ className }: LandlordPensionsScreenProps) {
  const { pensions, selectedPension, setSelectedPension, setActiveTab, openCreatePensionModal } =
    useLandlord();

  const [previewPension, setPreviewPension] = useState<PensionItem | null>(null);

  const stats = useMemo(() => {
    const totalPensions = pensions.length;
    const activePensions = pensions.filter((p) => p.isActive).length;
    let totalRooms = 0;
    let totalOccupied = 0;

    for (const p of pensions) {
      const rooms = p.rooms ?? [];
      totalRooms += rooms.length;
      totalOccupied += rooms.filter((r) => !r.isAvailable).length;
    }

    const totalAvailable = Math.max(0, totalRooms - totalOccupied);
    const overallOccupancyRate =
      totalRooms > 0 ? Math.round((totalOccupied / totalRooms) * 100) : 0;

    return {
      totalPensions,
      activePensions,
      totalRooms,
      totalOccupied,
      totalAvailable,
      overallOccupancyRate,
    };
  }, [pensions]);

  const handleSelectToManage = (
    pension: PensionItem,
    destinationTab: 'pension' | 'rooms' = 'pension',
  ) => {
    setSelectedPension(pension);
    setActiveTab(destinationTab);
  };

  return (
    <>
      <div className={cn('flex flex-col gap-6 text-left pb-28 md:pb-12', className)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                Mis Pensiones
              </h1>
              <Badge variant="secondary" className="font-semibold text-xs">
                {pensions.length} {pensions.length === 1 ? 'pensión' : 'pensiones'}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Supervisa tus alojamientos, controla su ocupación y selecciona cuál administrar
            </p>
          </div>

          <Button
            type="button"
            onClick={openCreatePensionModal}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm hover:opacity-95 transition cursor-pointer self-start sm:self-auto px-4"
          >
            <Plus className="h-4 w-4" />
            <span>Registrar Nueva Pensión</span>
          </Button>
        </div>

        {pensions.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="border-border/70 bg-card/60 shadow-2xs">
              <CardContent className="p-3.5 flex flex-col">
                <span className="text-[11px] font-medium text-muted-foreground">Propiedades</span>
                <span className="text-lg font-extrabold text-foreground mt-0.5">
                  {stats.totalPensions}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {stats.activePensions} activas
                </span>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/60 shadow-2xs">
              <CardContent className="p-3.5 flex flex-col">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Ocupación Global
                </span>
                <span className="text-lg font-extrabold text-foreground mt-0.5">
                  {stats.overallOccupancyRate}%
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {stats.totalOccupied} de {stats.totalRooms} habs
                </span>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/60 shadow-2xs">
              <CardContent className="p-3.5 flex flex-col">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Habitaciones Libres
                </span>
                <span className="text-lg font-extrabold text-foreground mt-0.5">
                  {stats.totalAvailable}
                </span>
                <span className="text-[10px] text-muted-foreground">Para nuevos residentes</span>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/60 shadow-2xs">
              <CardContent className="p-3.5 flex flex-col">
                <span className="text-[11px] font-medium text-muted-foreground">
                  En Administración
                </span>
                <span className="text-xs font-bold text-primary truncate mt-1">
                  {selectedPension?.title ?? 'Ninguna'}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {selectedPension?.city ?? 'Sin ciudad'}
                </span>
              </CardContent>
            </Card>
          </div>
        )}

        {pensions.length === 0 ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center rounded-3xl border border-dashed border-border/80 bg-card/60 my-4 max-w-md mx-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-4 shadow-2xs">
              <Building2 className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              Aún no tienes pensiones registradas
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5 mb-6 max-w-sm leading-relaxed">
              Registra tu primera pensión universitaria para comenzar a publicar habitaciones y
              recibir postulaciones de estudiantes verificados.
            </p>
            <Button
              type="button"
              onClick={openCreatePensionModal}
              className="min-h-12 px-6 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs gap-2 cursor-pointer shadow-sm active:scale-[0.98] transition"
            >
              <Plus className="h-4 w-4" />
              <span>Registrar mi primera pensión</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {pensions.map((prop) => {
              const isCurrent = prop.id === selectedPension?.id;
              const rooms = prop.rooms ?? [];
              const totalRooms = rooms.length;
              const availableRooms = rooms.filter((r) => r.isAvailable).length;
              const occupiedRooms = Math.max(0, totalRooms - availableRooms);
              const occupancyRate =
                totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
              const coverPhoto = prop.photos?.[0];

              return (
                <Card
                  key={prop.id}
                  className={cn(
                    'transition-all duration-200 border rounded-2xl overflow-hidden bg-card/70',
                    isCurrent
                      ? 'border-primary/50 shadow-md ring-1 ring-primary/20'
                      : 'border-border/70 hover:border-border/90 hover:shadow-2xs',
                  )}
                >
                  <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-secondary/60">
                          {coverPhoto ? (
                            <Image
                              src={coverPhoto}
                              alt={prop.title}
                              fill
                              unoptimized
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-primary">
                              <Building2 className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        <div className="flex min-w-0 flex-col">
                          <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-foreground truncate">
                              {prop.title}
                            </h2>
                          </div>
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground truncate mt-0.5">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {prop.address ? `${prop.address}, ` : ''}
                            {prop.city ?? 'Chile'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/50 px-2.5 py-0.5 text-xs">
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              prop.isActive
                                ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
                                : 'bg-muted-foreground/40',
                            )}
                          />
                          <span
                            className={cn(
                              'text-[10px] font-semibold leading-none',
                              prop.isActive
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-muted-foreground',
                            )}
                          >
                            {prop.isActive ? 'Activa' : 'Pausada'}
                          </span>
                        </div>

                        {isCurrent && (
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold py-0"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Administrando
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-secondary/30 p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
                          <BedDouble className="h-3.5 w-3.5 text-primary" />
                          Ocupación de Habitaciones
                        </span>
                        <span className="font-bold text-foreground text-[11px]">
                          {occupiedRooms} / {totalRooms} ({occupancyRate}%)
                        </span>
                      </div>

                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${occupancyRate}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                        <span className="font-medium">
                          {availableRooms} {availableRooms === 1 ? 'disponible' : 'disponibles'}
                        </span>
                        <span>{totalRooms} habitaciones en total</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewPension(prop)}
                        className="flex-1 sm:flex-none min-h-[40px] px-4 items-center justify-center gap-1.5 rounded-xl border-border bg-background hover:bg-secondary text-xs font-semibold cursor-pointer shadow-2xs transition"
                        title="Ver como estudiante"
                        aria-label={`Vista previa de ${prop.title}`}
                      >
                        <Eye className="h-4 w-4 text-primary shrink-0" />
                        <span>Vista Previa</span>
                      </Button>

                      {isCurrent ? (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setActiveTab('pension')}
                          className="flex-1 sm:flex-none min-h-[40px] px-4 items-center justify-center gap-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 text-xs font-semibold cursor-pointer transition"
                        >
                          <Home className="h-4 w-4 shrink-0" />
                          <span>Ficha Actual</span>
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => handleSelectToManage(prop, 'pension')}
                          className="flex-1 sm:flex-none min-h-[40px] px-4 items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-xs font-semibold cursor-pointer shadow-2xs transition"
                        >
                          <span>Administrar</span>
                          <ChevronRight className="h-4 w-4 shrink-0" />
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectToManage(prop, 'rooms')}
                        className="flex-1 sm:flex-none min-h-[40px] px-3.5 items-center justify-center gap-1.5 rounded-xl text-muted-foreground hover:text-foreground text-xs font-medium cursor-pointer"
                        title="Ver habitaciones de esta pensión"
                      >
                        <BedDouble className="h-3.5 w-3.5" />
                        <span>Habitaciones</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {previewPension && (
        <PensionDetailModal
          isOpen={!!previewPension}
          onClose={() => setPreviewPension(null)}
          pension={previewPension}
          pensionId={previewPension.id}
        />
      )}
    </>
  );
}
