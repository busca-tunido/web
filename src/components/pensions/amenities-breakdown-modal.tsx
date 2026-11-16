'use client';

import {
  Archive,
  Bath,
  Bed,
  BookOpen,
  Check,
  CheckCircle2,
  Coffee,
  Disc,
  Droplets,
  Flame,
  Key,
  Monitor,
  Printer,
  ShieldCheck,
  Sun,
  Trees,
  Utensils,
  Video,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { isApiSuccess } from '@/lib/api-response';
import type { PensionAmenityCatalogItemDto, PensionItem } from '@/lib/types';
import { pensionsService } from '@/services/pensions.service';

type AmenitiesBreakdownModalProps = {
  isOpen: boolean;
  onClose: () => void;
  pension: PensionItem;
};

const REDUNDANT_UTILITY_SLUGS = new Set(['wifi-alta-velocidad', 'luz-incluida', 'gas-incluido']);

const BASIC_UTILITIES = [
  {
    key: 'waterIncluded' as const,
    name: 'Agua Potable',
    icon: Droplets,
  },
  {
    key: 'electricityIncluded' as const,
    name: 'Electricidad / Luz',
    icon: Zap,
  },
  {
    key: 'gasIncluded' as const,
    name: 'Gas / Calefón',
    icon: Flame,
  },
  {
    key: 'internetIncluded' as const,
    name: 'Internet Wi-Fi',
    icon: Wifi,
  },
] as const;

const DEFAULT_AMENITIES_CATALOG: readonly PensionAmenityCatalogItemDto[] = [
  {
    slug: 'agua-caliente',
    name: 'Agua caliente 24/7',
    category: 'ROOM_FEATURE',
    iconKey: 'droplet',
  },
  {
    slug: 'calefaccion',
    name: 'Calefacción central o estufa',
    category: 'ROOM_FEATURE',
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

const AMENITY_CATEGORIES: ReadonlyArray<{
  key: 'ROOM_FEATURE' | 'COMMON_AREA' | 'STUDY_WORK' | 'SAFETY_SECURITY';
  title: string;
  icon: typeof Bed;
}> = [
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
          const sanitized = res.data
            .filter((a) => !REDUNDANT_UTILITY_SLUGS.has(a.slug))
            .map((a) =>
              a.slug === 'agua-caliente' || a.slug === 'calefaccion'
                ? { ...a, category: 'ROOM_FEATURE' as const }
                : a,
            );
          cachedAmenitiesCatalog = sanitized;
          setCatalog(sanitized);
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

  const rawAmenitySlugs: string[] = Array.isArray(pension.amenitySlugs)
    ? [...pension.amenitySlugs]
    : Array.isArray(pension.amenities)
      ? pension.amenities
          .map((a) => (typeof a === 'string' ? a : a.slug))
          .filter((s): s is string => Boolean(s))
      : [];

  const activeSlugs = new Set<string>(rawAmenitySlugs);

  const isAmenityActive = (slug: string): boolean => {
    if (slug === 'agua-caliente') {
      return Boolean(activeSlugs.has('agua-caliente') || pension.waterIncluded);
    }
    return activeSlugs.has(slug);
  };

  const activeBasicCount = BASIC_UTILITIES.filter((u) => Boolean(pension[u.key])).length;
  const activeAmenitiesCount = catalog.filter((am) => isAmenityActive(am.slug)).length;
  const totalActive = activeBasicCount + activeAmenitiesCount;
  const totalItems = BASIC_UTILITIES.length + catalog.length;

  const sortedBasicUtilities = [...BASIC_UTILITIES].sort(
    (a, b) => Number(Boolean(pension[b.key])) - Number(Boolean(pension[a.key])),
  );

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveModalContent
        id="amenities-breakdown-drawer"
        showClose={false}
        className="max-w-lg md:max-w-2xl md:max-h-[82vh] mx-auto md:rounded-3xl bg-card border-border text-foreground flex flex-col overflow-hidden"
      >
        <ResponsiveModalHeader className="px-5 py-4 border-b border-border/60 shrink-0 text-left">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <ResponsiveModalTitle className="text-lg font-bold text-foreground">
                Servicios y Comodidades
              </ResponsiveModalTitle>
              <ResponsiveModalDescription className="text-xs text-muted-foreground mt-0.5 truncate">
                {pension.title}
              </ResponsiveModalDescription>
            </div>
            <Badge
              variant="outline"
              className="text-xs font-semibold shrink-0 border-primary/30 bg-primary/10 text-primary"
            >
              {totalActive} de {totalItems} incluidos
            </Badge>
          </div>
        </ResponsiveModalHeader>

        <div className="overflow-y-auto scrollbar-subtle flex-1 min-h-0 px-5 py-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-6 space-y-6">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Servicios Básicos
                </h3>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">
                {activeBasicCount} de {BASIC_UTILITIES.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {sortedBasicUtilities.map((utility) => (
                <AmenityStatusRow
                  key={utility.key}
                  icon={utility.icon}
                  label={utility.name}
                  active={Boolean(pension[utility.key])}
                />
              ))}
            </div>
          </section>

          {AMENITY_CATEGORIES.map((cat) => {
            const items = catalog.filter((a) => a.category === cat.key);
            if (items.length === 0) return null;

            const CategoryIcon = cat.icon;
            const activeCountInCat = items.filter((a) => isAmenityActive(a.slug)).length;
            const sortedItems = [...items].sort(
              (a, b) => Number(isAmenityActive(b.slug)) - Number(isAmenityActive(a.slug)),
            );

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
                  {sortedItems.map((am) => (
                    <AmenityStatusRow
                      key={am.slug}
                      icon={(am.iconKey && AMENITY_ICON_MAP[am.iconKey]) || CheckCircle2}
                      label={am.name}
                      active={isAmenityActive(am.slug)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

type AmenityStatusRowProps = {
  icon: typeof Zap;
  label: string;
  active: boolean;
};

function AmenityStatusRow({ icon: Icon, label, active }: AmenityStatusRowProps) {
  if (active) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2.5 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold text-foreground truncate">{label}</span>
        </div>
        <Check className="h-4 w-4 text-primary shrink-0 ml-1" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 opacity-55 select-none">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/40 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-xs font-medium text-muted-foreground truncate">{label}</span>
      </div>
      <X className="h-4 w-4 text-muted-foreground/70 shrink-0 ml-1" />
    </div>
  );
}
