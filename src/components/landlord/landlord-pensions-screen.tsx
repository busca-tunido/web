'use client';

import {
  BedDouble,
  Building2,
  Check,
  ChevronRight,
  Eye,
  GraduationCap,
  Home,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  Star,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { RoomOccupancyBar } from '@/components/landlord/room-occupancy-bar';
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
  const {
    pensions,
    selectedPension,
    setSelectedPension,
    setActiveTab,
    openCreatePensionModal,
    defaultContact,
    updateDefaultContact,
    getPensionContact,
  } = useLandlord();

  const [previewPension, setPreviewPension] = useState<PensionItem | null>(null);
  const [defaultContactName, setDefaultContactName] = useState(defaultContact.name);
  const [defaultContactPhone, setDefaultContactPhone] = useState(defaultContact.phone);
  const [contactSaveFeedback, setContactSaveFeedback] = useState(false);

  useEffect(() => {
    setDefaultContactName(defaultContact.name);
    setDefaultContactPhone(defaultContact.phone);
  }, [defaultContact]);

  const handleSaveDefaultContact = (e: React.FormEvent) => {
    e.preventDefault();
    updateDefaultContact({
      name: defaultContactName.trim(),
      phone: defaultContactPhone.trim(),
    });
    setContactSaveFeedback(true);
    setTimeout(() => setContactSaveFeedback(false), 3000);
  };

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

  const activeSelected = selectedPension ?? pensions[0] ?? null;
  const otherPensions = pensions.filter((p) => p.id !== activeSelected?.id);

  const handleSelectToManage = (
    pension: PensionItem,
    destinationTab: 'pension' | 'rooms' = 'pension',
  ) => {
    setSelectedPension(pension);
    setActiveTab(destinationTab);
  };

  const renderPensionCard = (prop: PensionItem, isCurrent: boolean) => {
    const rooms = prop.rooms ?? [];
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter((r) => r.isAvailable).length;
    const occupiedRooms = Math.max(0, totalRooms - availableRooms);
    const coverPhoto = prop.photos?.[0];
    const contactInfo = getPensionContact(prop.id);

    return (
      <Card
        key={prop.id}
        className={cn(
          'w-full transition-all duration-200 border rounded-2xl overflow-hidden bg-card/70',
          isCurrent
            ? 'border-primary/50 shadow-md ring-1 ring-primary/20'
            : 'border-border/70 hover:border-border/90 hover:shadow-2xs',
        )}
      >
        <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-secondary/60">
                {coverPhoto ? (
                  <Image
                    src={coverPhoto}
                    alt={prop.title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 56px, 64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-primary">
                    <Building2 className="h-7 w-7" />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                    {prop.title}
                  </h2>
                  {prop.isVerified && (
                    <Badge
                      variant="outline"
                      className="border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] py-0 font-semibold"
                    >
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Verificada
                    </Badge>
                  )}
                </div>

                <span className="flex items-center gap-1 text-xs text-muted-foreground truncate mt-0.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
                  {prop.address ? `${prop.address}, ` : ''}
                  {prop.neighborhood ? `${prop.neighborhood}, ` : ''}
                  {prop.city ?? 'Chile'}
                </span>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
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
                  className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold py-0.5"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Administrando
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="flex items-center gap-1.5 rounded-lg bg-secondary/50 px-2.5 py-1 text-xs">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
              <span className="font-bold text-foreground">
                {prop.ratingAverage ? prop.ratingAverage.toFixed(1) : 'Nuevo'}
              </span>
              <span className="text-muted-foreground text-[11px]">
                ({prop.reviewsCount} {prop.reviewsCount === 1 ? 'reseña' : 'reseñas'})
              </span>
            </div>

            {prop.nearestUniversityName && (
              <div className="flex items-center gap-1.5 rounded-lg bg-secondary/50 px-2.5 py-1 text-xs text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate font-medium text-foreground max-w-[200px] sm:max-w-xs">
                  {prop.nearestUniversityName}
                </span>
                {prop.distanceToUniversityMeters > 0 && (
                  <span className="text-[10px]">
                    (
                    {prop.distanceToUniversityMeters >= 1000
                      ? `${(prop.distanceToUniversityMeters / 1000).toFixed(1)} km`
                      : `${prop.distanceToUniversityMeters}m`}
                    )
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-1 text-xs font-bold text-foreground rounded-lg bg-secondary/50 px-2.5 py-1">
              <span>
                ${prop.priceMonthlyClp ? prop.priceMonthlyClp.toLocaleString('es-CL') : '0'}
              </span>
              <span className="text-[10px] text-muted-foreground font-normal">/ mes</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg bg-secondary/50 px-2.5 py-1 text-xs text-muted-foreground">
              <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate max-w-[150px]">{contactInfo.name}</span>
              <Badge variant="outline" className="text-[9px] py-0 px-1 font-semibold">
                {contactInfo.isCustom ? 'Personalizado' : 'Por Defecto'}
              </Badge>
            </div>
          </div>

          <RoomOccupancyBar
            totalRooms={totalRooms}
            occupiedRooms={occupiedRooms}
            label="Ocupación de Habitaciones"
            showIcon
          />

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
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <Card className="border-border/70 bg-card/60 shadow-2xs">
              <CardContent className="p-3 sm:p-3.5 flex flex-col">
                <span className="text-[11px] font-medium text-muted-foreground truncate">
                  Propiedades
                </span>
                <span className="text-base sm:text-lg font-extrabold text-foreground mt-0.5">
                  {stats.totalPensions}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
                  {stats.activePensions} activas
                </span>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/60 shadow-2xs">
              <CardContent className="p-3 sm:p-3.5 flex flex-col">
                <span className="text-[11px] font-medium text-muted-foreground truncate">
                  Ocupación Global
                </span>
                <span className="text-base sm:text-lg font-extrabold text-foreground mt-0.5">
                  {stats.overallOccupancyRate}%
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {stats.totalOccupied} de {stats.totalRooms} habs
                </span>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/60 shadow-2xs">
              <CardContent className="p-3 sm:p-3.5 flex flex-col">
                <span className="text-[11px] font-medium text-muted-foreground truncate">
                  Habitaciones Libres
                </span>
                <span className="text-base sm:text-lg font-extrabold text-foreground mt-0.5">
                  {stats.totalAvailable}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  Para nuevos residentes
                </span>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="border-border/80 bg-card/70 shadow-2xs rounded-2xl overflow-hidden">
          <CardContent className="p-4 sm:p-5 flex flex-col gap-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-foreground">
                    Datos de Contacto Predeterminados
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Contacto y WhatsApp aplicados por defecto a todas tus pensiones para
                    postulaciones estudiantiles
                  </p>
                </div>
              </div>

              {contactSaveFeedback && (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] self-start sm:self-auto py-0.5 px-2">
                  <Check className="h-3 w-3 mr-1" />
                  ¡Predeterminados guardados!
                </Badge>
              )}
            </div>

            <form
              onSubmit={handleSaveDefaultContact}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1"
            >
              <div className="sm:col-span-5">
                <label
                  htmlFor="default-contact-name-input"
                  className="block text-[11px] font-bold text-foreground mb-1"
                >
                  Nombre del Anfitrión General
                </label>
                <input
                  id="default-contact-name-input"
                  type="text"
                  value={defaultContactName}
                  onChange={(e) => setDefaultContactName(e.target.value)}
                  placeholder="Ej: Propietario Demo"
                  className="min-h-[42px] w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="default-contact-phone-input"
                  className="block text-[11px] font-bold text-foreground mb-1"
                >
                  WhatsApp de Contacto (Chile)
                </label>
                <input
                  id="default-contact-phone-input"
                  type="tel"
                  value={defaultContactPhone}
                  onChange={(e) => setDefaultContactPhone(e.target.value)}
                  placeholder="+56 9 8765 4321"
                  className="min-h-[42px] w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="sm:col-span-3">
                <Button
                  type="submit"
                  className="min-h-[42px] w-full rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition cursor-pointer"
                >
                  Guardar Predeterminados
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

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
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Home className="h-3.5 w-3.5" />
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-foreground">
                    Pensión en Administración Activa
                  </h2>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold"
                >
                  Seleccionada
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground -mt-1.5">
                Esta es la pensión que estás gestionando actualmente en las secciones de Mi Pensión,
                Habitaciones y Reseñas.
              </p>

              {activeSelected && renderPensionCard(activeSelected, true)}
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-foreground">
                    Otras Pensiones Registradas
                  </h2>
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {otherPensions.length}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground -mt-1.5">
                Selecciona otra propiedad para administrarla o consultar su actividad.
              </p>

              {otherPensions.length === 0 ? (
                <Card className="border-border/60 bg-card/40 p-6 text-center rounded-2xl">
                  <p className="text-xs text-muted-foreground">
                    No tienes otras pensiones registradas. Si adquieres o administras otro
                    alojamiento, regístralo aquí.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openCreatePensionModal}
                    className="mt-3 text-xs font-semibold cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Registrar Nueva Pensión
                  </Button>
                </Card>
              ) : (
                <div className="flex flex-col gap-4">
                  {otherPensions.map((prop) => renderPensionCard(prop, false))}
                </div>
              )}
            </div>
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
