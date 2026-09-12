'use client';

import {
  Ban,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Droplets,
  Flame,
  Home,
  Moon,
  Shield,
  Sparkles,
  Users,
  VolumeX,
  Wifi,
  Wind,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import type { PensionItem } from '@/lib/types';

type AmenitiesBreakdownModalProps = {
  isOpen: boolean;
  onClose: () => void;
  pension: PensionItem;
};

export function AmenitiesBreakdownModal({
  isOpen,
  onClose,
  pension,
}: AmenitiesBreakdownModalProps) {
  const genderPreferenceLabel =
    pension.genderPreference === 'FEMALE_ONLY'
      ? 'Alojamiento Exclusivo Mujeres'
      : pension.genderPreference === 'MALE_ONLY'
        ? 'Alojamiento Exclusivo Hombres'
        : 'Alojamiento Mixto';

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        id="amenities-breakdown-drawer"
        className="max-h-[92vh] max-w-lg md:max-w-2xl mx-auto md:rounded-3xl bg-card border-border text-foreground flex flex-col overflow-hidden"
      >
        <div className="mx-auto mt-2.5 mb-1 h-1.5 w-12 rounded-full bg-muted-foreground/30 shrink-0" />

        <div className="flex items-center justify-between px-4 py-2 border-b border-border/60">
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition cursor-pointer"
            aria-label="Volver"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Detalle de Comodidades
          </span>
          <div className="w-8" />
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-6">
          <DrawerHeader className="p-0 text-left">
            <DrawerTitle className="text-lg font-bold text-foreground">
              Comodidades y normas de convivencia
            </DrawerTitle>
            <DrawerDescription className="text-xs text-muted-foreground mt-1">
              Detalle completo de los servicios incluidos y reglas del alojamiento en{' '}
              <span className="font-semibold text-foreground">{pension.title}</span>.
            </DrawerDescription>
          </DrawerHeader>

          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                Servicios Básicos Incluidos en la Mensualidad
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-card/80 p-2.5 shadow-2xs">
                <Droplets className="h-4 w-4 text-sky-500 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Agua Potable</p>
                  <p className="text-[10px] text-emerald-600 font-medium">Incluido sin costo</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-card/80 p-2.5 shadow-2xs">
                <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Luz y Electricidad</p>
                  <p className="text-[10px] text-emerald-600 font-medium">Incluido sin costo</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-card/80 p-2.5 shadow-2xs">
                <Flame className="h-4 w-4 text-orange-500 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Gas y Calefont</p>
                  <p className="text-[10px] text-emerald-600 font-medium">Incluido sin costo</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-card/80 p-2.5 shadow-2xs">
                <Wifi className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Internet Fibra Óptica</p>
                  <p className="text-[10px] text-emerald-600 font-medium">
                    {pension.includesWifi ? 'Alta velocidad libre' : 'No incluido'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Comodidades por Área
            </h3>

            <div className="rounded-2xl border border-border bg-muted/20 p-3.5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Home className="h-4 w-4 text-primary" />
                <span>Equipamiento de Dormitorios</span>
              </div>
              <ul className="space-y-2 text-xs text-foreground/85">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Cama con colchón cómodo y juego de sábanas base</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Escritorio amplio con silla ergonómica de estudio</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Clóset individual con cajonera y colgador</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Enchufes accesibles junto al escritorio y velador</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 p-3.5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Users className="h-4 w-4 text-primary" />
                <span>Espacios Comunes y Cocina</span>
              </div>
              <ul className="space-y-2 text-xs text-foreground/85">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Cocina completamente amoblada con microondas y hervidor</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Refrigerador de libre uso con espacio individual designado</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Comedor estudiantil y sala de estar compartida</span>
                </li>
                {pension.includesLaundry && (
                  <li className="flex items-start gap-2">
                    <Wind className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span>Lavadora automática y zona de secado / tendero</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 p-3.5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>Ambiente de Estudio y Tranquilidad</span>
              </div>
              <ul className="space-y-2 text-xs text-foreground/85">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    {pension.includesStudyRoom
                      ? 'Sala de estudio silenciosa exclusiva para residentes'
                      : 'Espacio de estudio independiente en cada dormitorio'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Cobertura de Wi-Fi de alta velocidad en todos los ambientes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Iluminación LED natural y adecuada para lectura nocturna</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 p-3.5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span>Seguridad y Tranquilidad</span>
              </div>
              <ul className="space-y-2 text-xs text-foreground/85">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Cerradura de seguridad en puerta principal y llaves independientes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Entorno barrial seguro con acceso expedito al transporte</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Normas de Convivencia y Reglas de la Casa
            </h3>

            <div className="space-y-2.5 text-xs text-foreground/90">
              <div className="flex items-start gap-3 rounded-xl bg-muted/30 p-2.5">
                <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Horario de Llegada / Acceso</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    {pension.curfewDescription ||
                      'Acceso las 24 horas con llave propia sin toque de queda.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-muted/30 p-2.5">
                <VolumeX className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Horario de Silencio y Estudio</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    23:00 a 07:00 hrs. Prohibido ruidos molestos en favor del descanso y certámenes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-muted/30 p-2.5">
                <Users className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Política de Visitas</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    {pension.visitsPolicy ||
                      'Visitas permitidas en áreas comunes diurnas con previo aviso.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-muted/30 p-2.5">
                <Ban className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Fumadores y Mascotas</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    Espacio 100% libre de humo. No se admiten mascotas por respeto y posibles
                    alergias comunitarias.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-muted/30 p-2.5">
                <Moon className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Preferencia de Convivencia</p>
                  <Badge variant="secondary" className="mt-1 text-[11px] font-semibold">
                    {genderPreferenceLabel}
                  </Badge>
                </div>
              </div>
            </div>
          </section>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
