'use client';

import {
  Archive,
  Ban,
  Bath,
  Bed,
  BookOpen,
  Check,
  ChevronLeft,
  Clock,
  Coffee,
  Disc,
  Droplets,
  Flame,
  Key,
  Monitor,
  Moon,
  PawPrint,
  Printer,
  ShieldCheck,
  Sparkles,
  Sun,
  Trees,
  Users,
  Utensils,
  Video,
  VolumeX,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { isApiSuccess } from '@/lib/api-response';
import type { PensionAmenityCatalogItemDto, PensionItem } from '@/lib/types';
import { pensionsService } from '@/services/pensions.service';

type AmenitiesBreakdownModalProps = {
  isOpen: boolean;
  onClose: () => void;
  pension: PensionItem;
};

const DEFAULT_AMENITIES_CATALOG: readonly PensionAmenityCatalogItemDto[] = [
  {
    slug: 'wifi-alta-velocidad',
    name: 'Wi-Fi fibra óptica alta velocidad',
    category: 'BASIC_UTILITY',
    iconKey: 'wifi',
  },
  {
    slug: 'agua-caliente',
    name: 'Agua caliente 24/7',
    category: 'BASIC_UTILITY',
    iconKey: 'droplet',
  },
  {
    slug: 'luz-incluida',
    name: 'Electricidad incluida en renta',
    category: 'BASIC_UTILITY',
    iconKey: 'zap',
  },
  {
    slug: 'gas-incluido',
    name: 'Gas incluido',
    category: 'BASIC_UTILITY',
    iconKey: 'flame',
  },
  {
    slug: 'calefaccion',
    name: 'Calefacción central o estufa',
    category: 'BASIC_UTILITY',
    iconKey: 'thermometer',
  },
  {
    slug: 'bano-privado',
    name: 'Baño privado en habitación',
    category: 'ROOM_FEATURE',
    iconKey: 'bath',
  },
  {
    slug: 'escritorio-estudio',
    name: 'Escritorio y silla ergonómica',
    category: 'ROOM_FEATURE',
    iconKey: 'monitor',
  },
  {
    slug: 'closet-amplio',
    name: 'Clóset empotrado amplio',
    category: 'ROOM_FEATURE',
    iconKey: 'archive',
  },
  {
    slug: 'cama-plaza-media',
    name: 'Cama 1.5 plazas con colchón nuevo',
    category: 'ROOM_FEATURE',
    iconKey: 'bed',
  },
  {
    slug: 'ventana-exterior',
    name: 'Ventana al exterior con luz natural',
    category: 'ROOM_FEATURE',
    iconKey: 'sun',
  },
  {
    slug: 'cocina-equipada',
    name: 'Cocina compartida full equipada',
    category: 'COMMON_AREA',
    iconKey: 'utensils',
  },
  {
    slug: 'lavadora-secadora',
    name: 'Lavandería (lavadora y secadora)',
    category: 'COMMON_AREA',
    iconKey: 'disc',
  },
  {
    slug: 'living-comedor',
    name: 'Sala de estar y comedor compartido',
    category: 'COMMON_AREA',
    iconKey: 'coffee',
  },
  {
    slug: 'patio-terraza',
    name: 'Terraza / Patio al aire libre',
    category: 'COMMON_AREA',
    iconKey: 'trees',
  },
  {
    slug: 'sala-estudio-cowork',
    name: 'Sala de estudio silenciosa y coworking',
    category: 'STUDY_WORK',
    iconKey: 'book-open',
  },
  {
    slug: 'impresora-scanner',
    name: 'Punto de impresión y escáner',
    category: 'STUDY_WORK',
    iconKey: 'printer',
  },
  {
    slug: 'conserjeria-24-7',
    name: 'Conserjería / Control de acceso 24/7',
    category: 'SAFETY_SECURITY',
    iconKey: 'shield',
  },
  {
    slug: 'camaras-seguridad',
    name: 'Cámaras de vigilancia en accesos',
    category: 'SAFETY_SECURITY',
    iconKey: 'video',
  },
  {
    slug: 'cerradura-digital',
    name: 'Cerradura digital en dormitorios',
    category: 'SAFETY_SECURITY',
    iconKey: 'key',
  },
];

const AMENITY_ICON_MAP: Record<string, typeof Wifi> = {
  wifi: Wifi,
  droplet: Droplets,
  zap: Zap,
  flame: Flame,
  thermometer: Flame,
  bath: Bath,
  monitor: Monitor,
  archive: Archive,
  bed: Bed,
  sun: Sun,
  utensils: Utensils,
  disc: Disc,
  coffee: Coffee,
  trees: Trees,
  'book-open': BookOpen,
  printer: Printer,
  shield: ShieldCheck,
  video: Video,
  key: Key,
};

const CATEGORIES: ReadonlyArray<{
  key: 'BASIC_UTILITY' | 'ROOM_FEATURE' | 'COMMON_AREA' | 'STUDY_WORK' | 'SAFETY_SECURITY';
  title: string;
  icon: typeof Wifi;
}> = [
  { key: 'BASIC_UTILITY', title: 'Servicios Básicos', icon: Zap },
  { key: 'ROOM_FEATURE', title: 'Habitación y Confort', icon: Bed },
  { key: 'COMMON_AREA', title: 'Áreas Comunes', icon: Utensils },
  { key: 'STUDY_WORK', title: 'Estudio y Trabajo', icon: BookOpen },
  { key: 'SAFETY_SECURITY', title: 'Seguridad', icon: ShieldCheck },
];

let cachedAmenitiesCatalog: PensionAmenityCatalogItemDto[] | null = null;

export function AmenitiesBreakdownModal({
  isOpen,
  onClose,
  pension,
}: AmenitiesBreakdownModalProps) {
  const [catalog, setCatalog] = useState<PensionAmenityCatalogItemDto[]>(
    cachedAmenitiesCatalog ?? [...DEFAULT_AMENITIES_CATALOG],
  );

  useEffect(() => {
    if (!isOpen) return;

    if (cachedAmenitiesCatalog && cachedAmenitiesCatalog.length > 0) {
      setCatalog(cachedAmenitiesCatalog);
      return;
    }

    let isMounted = true;
    const loadAmenities = async () => {
      try {
        const res = await (pensionsService.fetchAmenitiesCatalog?.() ?? Promise.resolve(null));
        if (
          isMounted &&
          res &&
          isApiSuccess(res) &&
          Array.isArray(res.data) &&
          res.data.length > 0
        ) {
          cachedAmenitiesCatalog = res.data;
          setCatalog(res.data);
        }
      } catch {
        // Fallback to defaults
      }
    };
    void loadAmenities();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const genderPreferenceLabel =
    pension.genderPreference === 'FEMALE_ONLY'
      ? 'Alojamiento Exclusivo Mujeres'
      : pension.genderPreference === 'MALE_ONLY'
        ? 'Alojamiento Exclusivo Hombres'
        : 'Alojamiento Mixto';

  const rawAmenitySlugs: string[] = Array.isArray(pension.amenitySlugs)
    ? [...pension.amenitySlugs]
    : Array.isArray(pension.amenities)
      ? pension.amenities
          .map((a) => (typeof a === 'string' ? a : a.slug))
          .filter((s): s is string => Boolean(s))
      : [];

  const hasWifi = Boolean(
    pension.internetIncluded ||
      rawAmenitySlugs.includes('wifi-alta-velocidad') ||
      pension.amenities?.some(
        (a) => (typeof a === 'string' ? a : a.slug) === 'wifi-alta-velocidad',
      ),
  );

  const activeSlugs = new Set<string>(rawAmenitySlugs);
  if (hasWifi) {
    activeSlugs.add('wifi-alta-velocidad');
  } else {
    activeSlugs.delete('wifi-alta-velocidad');
  }

  const isAmenityActive = (slug: string): boolean => {
    if (slug === 'wifi-alta-velocidad') return hasWifi;
    if (slug === 'agua-caliente') {
      return Boolean(pension.waterIncluded || activeSlugs.has('agua-caliente'));
    }
    if (slug === 'luz-incluida') {
      return Boolean(pension.electricityIncluded || activeSlugs.has('luz-incluida'));
    }
    if (slug === 'gas-incluido') {
      return Boolean(pension.gasIncluded || activeSlugs.has('gas-incluido'));
    }
    return activeSlugs.has(slug);
  };

  const activeTotalCount = catalog.filter((am) => isAmenityActive(am.slug)).length;

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <DrawerTitle className="text-lg font-bold text-foreground">
                  Servicios y Comodidades
                </DrawerTitle>
                <DrawerDescription className="text-xs text-muted-foreground mt-0.5">
                  Revisa qué servicios están incluidos y cuáles no en{' '}
                  <span className="font-semibold text-foreground">{pension.title}</span>.
                </DrawerDescription>
              </div>
              <Badge
                variant="outline"
                className="text-xs font-semibold shrink-0 self-start sm:self-auto"
              >
                {activeTotalCount} de {catalog.length} incluidos
              </Badge>
            </div>
          </DrawerHeader>

          {CATEGORIES.map((cat) => {
            const items = catalog.filter((a) => a.category === cat.key);
            if (items.length === 0) return null;

            const CategoryIcon = cat.icon;
            const activeCountInCat = items.filter((a) => isAmenityActive(a.slug)).length;

            return (
              <section key={cat.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {cat.title}
                    </h3>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {activeCountInCat} de {items.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {items.map((am) => {
                    const active = isAmenityActive(am.slug);
                    const Icon = (am.iconKey && AMENITY_ICON_MAP[am.iconKey]) || Sparkles;

                    if (active) {
                      return (
                        <div
                          key={am.slug}
                          className="flex items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/5 p-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-semibold text-foreground truncate">
                                {am.name}
                              </span>
                              <span className="text-[10px] text-primary font-medium">
                                Incluido en la mensualidad
                              </span>
                            </div>
                          </div>
                          <Check className="h-4 w-4 text-primary shrink-0 ml-1" />
                        </div>
                      );
                    }

                    return (
                      <div
                        key={am.slug}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/10 p-3 opacity-40 select-none"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground/70">
                            <Icon className="h-4 w-4 text-muted-foreground/70" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium text-muted-foreground truncate">
                              {am.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground/70">
                              No disponible
                            </span>
                          </div>
                        </div>
                        <X className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 ml-1" />
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          <section className="space-y-3 pt-3 border-t border-border/60">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Normas y Reglas de la Casa
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-2.5">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Horario de Acceso</p>
                  <p className="text-[11px] text-muted-foreground">
                    {pension.curfewTime
                      ? `Toque de queda: ${pension.curfewTime} hrs`
                      : 'Acceso libre 24/7 con llave propia'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-2.5">
                <VolumeX className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Horario de Silencio</p>
                  <p className="text-[11px] text-muted-foreground">
                    {pension.quietHoursStart && pension.quietHoursEnd
                      ? `${pension.quietHoursStart} a ${pension.quietHoursEnd} hrs`
                      : '22:00 a 08:00 hrs'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-2.5">
                <Users className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Visitas</p>
                  <p className="text-[11px] text-muted-foreground">
                    {pension.guestsAllowed ? 'Permitidas' : 'No permitidas'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-2.5">
                <PawPrint className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Mascotas</p>
                  <p className="text-[11px] text-muted-foreground">
                    {pension.petsAllowed ? 'Permitidas' : 'No permitidas'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-2.5">
                <Ban className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Fumadores</p>
                  <p className="text-[11px] text-muted-foreground">
                    {pension.smokingAllowed
                      ? 'Permitido en zonas designadas'
                      : 'Espacio libre de humo'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-2.5">
                <Moon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Preferencia de Convivencia</p>
                  <p className="text-[11px] text-muted-foreground">{genderPreferenceLabel}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
