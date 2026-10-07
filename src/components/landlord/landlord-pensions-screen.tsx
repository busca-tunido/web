'use client';

import {
  BedDouble,
  Building2,
  Check,
  ChevronRight,
  Eye,
  GraduationCap,
  Home,
  Loader2,
  MapPin,
  PauseCircle,
  Phone,
  Plus,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { RoomOccupancyBar } from '@/components/landlord/room-occupancy-bar';
import { PensionDetailModal } from '@/components/pensions/pension-detail-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
    togglePensionActive,
  } = useLandlord();

  const [previewPension, setPreviewPension] = useState<PensionItem | null>(null);
  const [defaultContactName, setDefaultContactName] = useState(defaultContact.name);
  const [defaultContactPhone, setDefaultContactPhone] = useState(defaultContact.phone);
  const [contactSaveFeedback, setContactSaveFeedback] = useState(false);
  const [pensionToToggle, setPensionToToggle] = useState<{
    pension: PensionItem;
    targetActive: boolean;
  } | null>(null);
  const [isTogglingActive, setIsTogglingActive] = useState<boolean>(false);

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
  const otherActivePensions = pensions.filter(
    (p) => p.id !== activeSelected?.id && (p.isActive ?? true),
  );
  const otherInactivePensions = pensions.filter(
    (p) => p.id !== activeSelected?.id && p.isActive === false,
  );

  const handleSelectToManage = (
    pension: PensionItem,
    destinationTab: 'pension' | 'rooms' = 'pension',
  ) => {
    setSelectedPension(pension);
    setActiveTab(destinationTab);
  };

  const handleConfirmToggleActive = async () => {
    if (!pensionToToggle || isTogglingActive) return;
    setIsTogglingActive(true);
    try {
      await togglePensionActive(pensionToToggle.pension.id, pensionToToggle.targetActive);
      setPensionToToggle(null);
    } finally {
      setIsTogglingActive(false);
    }
  };

  const renderPensionCard = (prop: PensionItem, isCurrent: boolean) => {
    const rooms = prop.rooms ?? [];
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter((r) => r.isAvailable).length;
    const occupiedRooms = Math.max(0, totalRooms - availableRooms);
    const coverPhoto = prop.photos?.[0];
    const contactInfo = getPensionContact(prop.id);

    return (
      <motion.div
        key={prop.id}
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="w-full"
      >
        <Card
          className={cn(
            'w-full transition-all duration-200 border rounded-xl overflow-hidden bg-card/60 shadow-none',
            isCurrent
              ? 'border-foreground/30 ring-1 ring-border/80'
              : 'border-border/60 hover:border-border/90',
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
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
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
                        className="border-border/80 text-foreground text-[10px] py-0 font-normal"
                      >
                        <ShieldCheck className="h-3 w-3 mr-1 text-muted-foreground" />
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
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-muted-foreground select-none">
                    {prop.isActive ? 'Activa' : 'Pausada'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={prop.isActive ?? true}
                    aria-label={
                      prop.isActive
                        ? `Pausar publicación de ${prop.title}`
                        : `Activar publicación de ${prop.title}`
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      setPensionToToggle({ pension: prop, targetActive: !(prop.isActive ?? true) });
                    }}
                    className={cn(
                      'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      prop.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/30',
                    )}
                  >
                    <span
                      className={cn(
                        'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                        prop.isActive ? 'translate-x-4' : 'translate-x-0',
                      )}
                    />
                  </button>
                </div>

                {isCurrent && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-medium border-border/80 text-foreground py-0.5"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Administrando
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground pt-0.5">
              <div className="flex items-center gap-1 font-semibold text-foreground">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <span>{prop.ratingAverage ? prop.ratingAverage.toFixed(1) : 'Nuevo'}</span>
                <span className="text-muted-foreground font-normal text-[11px]">
                  ({prop.reviewsCount} {prop.reviewsCount === 1 ? 'reseña' : 'reseñas'})
                </span>
              </div>

              <span className="text-border">•</span>

              {prop.nearestUniversityName && (
                <>
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate max-w-[200px] sm:max-w-xs text-foreground font-medium">
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
                  <span className="text-border">•</span>
                </>
              )}

              <div className="flex items-baseline gap-1 font-semibold text-foreground">
                <span>
                  ${prop.priceMonthlyClp ? prop.priceMonthlyClp.toLocaleString('es-CL') : '0'}
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">/ mes</span>
              </div>

              <span className="text-border">•</span>

              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="truncate max-w-[140px]">{contactInfo.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  ({contactInfo.isCustom ? 'Personalizado' : 'Por defecto'})
                </span>
              </div>
            </div>

            <RoomOccupancyBar
              totalRooms={totalRooms}
              occupiedRooms={occupiedRooms}
              label="Ocupación de Habitaciones"
              showIcon
            />

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreviewPension(prop)}
                className="flex-1 sm:flex-none min-h-[40px] px-4 items-center justify-center gap-1.5 rounded-xl border-border bg-background hover:bg-secondary text-xs font-semibold cursor-pointer shadow-none transition"
                title="Ver como estudiante"
                aria-label={`Vista previa de ${prop.title}`}
              >
                <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Vista Previa</span>
              </Button>

              {isCurrent ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('pension')}
                  className="flex-1 sm:flex-none min-h-[40px] px-4 items-center justify-center gap-1.5 rounded-xl border-border bg-muted/40 hover:bg-muted text-foreground text-xs font-semibold cursor-pointer transition"
                >
                  <Home className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>Ficha Actual</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => handleSelectToManage(prop, 'pension')}
                  className="flex-1 sm:flex-none min-h-[40px] px-4 items-center justify-center gap-1.5 rounded-xl bg-foreground text-background hover:opacity-90 text-xs font-semibold cursor-pointer shadow-none transition"
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
      </motion.div>
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

        <Card className="border-border/70 bg-card/60 shadow-none rounded-xl overflow-hidden">
          <CardContent className="p-4 sm:p-5 flex flex-col gap-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <Phone className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                <div>
                  <h2 className="text-xs sm:text-sm font-semibold text-foreground">
                    Datos de Contacto Predeterminados
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Contacto y WhatsApp aplicados por defecto a todas tus pensiones
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
                  className="block text-[11px] font-medium text-foreground mb-1"
                >
                  Nombre del Anfitrión General
                </label>
                <input
                  id="default-contact-name-input"
                  type="text"
                  value={defaultContactName}
                  onChange={(e) => setDefaultContactName(e.target.value)}
                  placeholder="Ej: Propietario Demo"
                  className="min-h-[40px] w-full rounded-lg border border-border/70 bg-background px-3 text-xs font-medium text-foreground focus:border-foreground/40 focus:outline-none transition-colors"
                />
              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="default-contact-phone-input"
                  className="block text-[11px] font-medium text-foreground mb-1"
                >
                  WhatsApp de Contacto (Chile)
                </label>
                <input
                  id="default-contact-phone-input"
                  type="tel"
                  value={defaultContactPhone}
                  onChange={(e) => setDefaultContactPhone(e.target.value)}
                  placeholder="+56 9 8765 4321"
                  className="min-h-[40px] w-full rounded-lg border border-border/70 bg-background px-3 text-xs font-medium text-foreground focus:border-foreground/40 focus:outline-none transition-colors"
                />
              </div>

              <div className="sm:col-span-3">
                <Button
                  type="submit"
                  className="min-h-[40px] w-full rounded-lg bg-foreground text-background font-semibold text-xs hover:opacity-90 transition cursor-pointer shadow-none"
                >
                  Guardar Predeterminados
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {pensions.length === 0 ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-border/80 bg-card/60 my-4 max-w-md mx-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
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
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm sm:text-base font-semibold text-foreground">
                    Pensión Seleccionada
                  </h2>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs font-normal border-border/80 text-muted-foreground"
                >
                  Seleccionada
                </Badge>
              </div>

              {activeSelected && renderPensionCard(activeSelected, true)}
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm sm:text-base font-semibold text-foreground">
                    Pensiones Activas
                  </h2>
                  <Badge
                    variant="outline"
                    className="text-xs font-normal border-border/80 text-muted-foreground"
                  >
                    {otherActivePensions.length}
                  </Badge>
                </div>
              </div>
              {otherActivePensions.length === 0 ? (
                <Card className="border-border/60 bg-card/40 p-6 text-center rounded-2xl">
                  <p className="text-xs text-muted-foreground">
                    No tienes otras pensiones activas registradas. Si adquieres o administras otro
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
                  <AnimatePresence mode="popLayout">
                    {otherActivePensions.map((prop) => renderPensionCard(prop, false))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PauseCircle className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm sm:text-base font-semibold text-foreground">
                    Pensiones Inactivas
                  </h2>
                  <Badge
                    variant="outline"
                    className="text-xs font-normal border-border/80 text-muted-foreground"
                  >
                    {otherInactivePensions.length}
                  </Badge>
                </div>
              </div>
              {otherInactivePensions.length === 0 ? (
                <Card className="border-border/60 bg-card/40 p-6 text-center rounded-2xl">
                  <p className="text-xs text-muted-foreground">
                    No tienes pensiones inactivas o pausadas.
                  </p>
                </Card>
              ) : (
                <div className="flex flex-col gap-4">
                  <AnimatePresence mode="popLayout">
                    {otherInactivePensions.map((prop) => renderPensionCard(prop, false))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={Boolean(pensionToToggle)}
        onOpenChange={(open) => !open && !isTogglingActive && setPensionToToggle(null)}
      >
        <DialogContent className="max-w-md p-5 sm:p-6 bg-background rounded-2xl">
          <DialogHeader className="text-left space-y-1.5">
            <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
              {pensionToToggle?.targetActive
                ? '¿Activar publicación de pensión?'
                : '¿Pausar publicación de pensión?'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {pensionToToggle?.targetActive
                ? `La pensión "${pensionToToggle.pension.title}" volverá a ser visible para todos los estudiantes universitarios en el mapa y búsquedas.`
                : `La pensión "${pensionToToggle?.pension.title}" quedará oculta temporalmente para los estudiantes. No recibirás nuevas solicitudes ni visitas mientras esté pausada.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              disabled={isTogglingActive}
              onClick={() => setPensionToToggle(null)}
              className="w-full sm:w-auto text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={isTogglingActive}
              onClick={handleConfirmToggleActive}
              className={cn(
                'w-full sm:w-auto text-xs font-semibold text-white shadow-none cursor-pointer',
                pensionToToggle?.targetActive
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-foreground text-background hover:opacity-90',
              )}
            >
              {isTogglingActive && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              <span>
                {pensionToToggle?.targetActive ? 'Activar Publicación' : 'Pausar Publicación'}
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
