'use client';

import {
  AlertCircle,
  Archive,
  Ban,
  Bath,
  Bed,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coffee,
  Disc,
  Droplets,
  Eye,
  Flame,
  Key,
  LayoutGrid,
  Loader2,
  MessageCircle,
  MessageSquare,
  Monitor,
  Moon,
  PawPrint,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Save,
  ShieldCheck,
  Sun,
  Trash2,
  Trees,
  User,
  Users,
  Utensils,
  Video,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LandlordProposalsDrawer } from '@/components/landlord/landlord-proposals-drawer';
import { PensionDetailModal } from '@/components/pensions/pension-detail-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLandlord } from '@/contexts/landlord-context';
import { isApiSuccess } from '@/lib/api-response';
import { filterAlphabeticName, formatChileanPhone } from '@/lib/format-utils';
import type {
  GenderPreference,
  PensionAmenityCatalogItemDto,
  PensionDetailDto,
  PensionItem,
  UpdatePensionDto,
} from '@/lib/types';
import { cn } from '@/lib/utils';
import { pensionsService } from '@/services/pensions.service';

export type LandlordPensionScreenProps = {
  pension?: PensionItem | PensionDetailDto | null;
  pensionId?: string;
  onPensionUpdated?: (updated: PensionDetailDto) => void;
  className?: string;
};

type GenderPref = GenderPreference;

type FormState = {
  waterIncluded: boolean;
  electricityIncluded: boolean;
  gasIncluded: boolean;
  internetIncluded: boolean;
  selectedAmenitySlugs: string[];
  guestsAllowed: boolean;
  smokingAllowed: boolean;
  petsAllowed: boolean;
  curfewTime: string;
  hasCurfew: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  genderPreference: GenderPref;
  useCustomContact: boolean;
  contactName: string;
  contactPhone: string;
};

const REDUNDANT_UTILITY_SLUGS = new Set(['wifi-alta-velocidad', 'luz-incluida', 'gas-incluido']);

const CATEGORY_LABELS: Record<string, string> = {
  ROOM_FEATURE: 'Habitación y Confort',
  COMMON_AREA: 'Áreas Comunes',
  STUDY_WORK: 'Estudio y Trabajo',
  SAFETY_SECURITY: 'Seguridad',
};

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

function normalizePhoneToDisplay(rawPhone?: string | null): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('569') && digits.length === 11) {
    const rest = digits.slice(3);
    return `+56 9 ${rest.slice(0, 4)} ${rest.slice(4)}`;
  }
  if (digits.startsWith('9') && digits.length === 9) {
    return `+56 9 ${digits.slice(1, 5)} ${digits.slice(5)}`;
  }
  return rawPhone;
}

function _normalizePhoneForSave(phoneInput: string): string {
  const trimmed = phoneInput.trim();
  if (!trimmed) return '';
  const digits = trimmed.replace(/\D/g, '');
  if (digits.startsWith('569') && digits.length >= 11) {
    return `+${digits.slice(0, 11)}`;
  }
  if (digits.startsWith('9') && digits.length === 9) {
    return `+56${digits}`;
  }
  if (digits.length === 8) {
    return `+569${digits}`;
  }
  return trimmed.startsWith('+') ? trimmed : `+${digits}`;
}

const GENDER_OPTIONS: ReadonlyArray<{
  value: GenderPref;
  label: string;
  description: string;
  icon: typeof Users;
}> = [
  {
    value: 'ANY',
    label: 'Mixto',
    description: 'Para estudiantes de cualquier género',
    icon: Users,
  },
  {
    value: 'FEMALE_ONLY',
    label: 'Solo Mujeres',
    description: 'Exclusivo para estudiantes mujeres',
    icon: User,
  },
  {
    value: 'MALE_ONLY',
    label: 'Solo Hombres',
    description: 'Exclusivo para estudiantes hombres',
    icon: User,
  },
];

export function LandlordPensionScreen({
  pension: initialPension = null,
  pensionId: propPensionId,
  onPensionUpdated,
  className,
}: LandlordPensionScreenProps) {
  const {
    openCreatePensionModal,
    togglePensionActive,
    deletePension,
    defaultContact,
    getPensionContact,
    updatePensionCustomContact,
    updatePensionInList,
    pendingProposalsCount,
    refetchProposals,
  } = useLandlord();

  const [activePension, setActivePension] = useState<PensionDetailDto | PensionItem | null>(
    initialPension,
  );
  const lastSyncedPensionIdRef = useRef<string | null>(initialPension?.id ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [isProposalsDrawerOpen, setIsProposalsDrawerOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    waterIncluded: true,
    electricityIncluded: true,
    gasIncluded: true,
    internetIncluded: true,
    selectedAmenitySlugs: [],
    guestsAllowed: false,
    smokingAllowed: false,
    petsAllowed: false,
    curfewTime: '',
    hasCurfew: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    genderPreference: 'ANY',
    useCustomContact: false,
    contactName: '',
    contactPhone: '',
  });

  const [amenitiesCatalog, setAmenitiesCatalog] = useState<PensionAmenityCatalogItemDto[]>([]);
  const [isLoadingAmenities, setIsLoadingAmenities] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadAmenities = async () => {
      setIsLoadingAmenities(true);
      const res = await pensionsService.fetchAmenitiesCatalog();
      if (isMounted && isApiSuccess(res) && Array.isArray(res.data)) {
        const cleanCatalog = res.data
          .filter((a) => !REDUNDANT_UTILITY_SLUGS.has(a.slug))
          .map((a) =>
            a.slug === 'agua-caliente' || a.slug === 'calefaccion'
              ? { ...a, category: 'ROOM_FEATURE' as const }
              : a,
          );
        setAmenitiesCatalog(cleanCatalog);
      }
      if (isMounted) {
        setIsLoadingAmenities(false);
      }
    };
    void loadAmenities();
    return () => {
      isMounted = false;
    };
  }, []);

  const effectivePensionId = propPensionId || activePension?.id || '';

  const syncFormFromPension = useCallback(
    (
      p: PensionDetailDto | PensionItem,
      customContactOverride?: { enabled: boolean; name: string; phone: string },
    ) => {
      const isPensionItemDto = 'waterIncluded' in p;
      const rawCurfew = isPensionItemDto ? p.curfewTime : undefined;
      const curfewVal = typeof rawCurfew === 'string' ? rawCurfew : '';
      const rawGender = p.genderPreference;
      const normalizedGender: GenderPref =
        rawGender === 'FEMALE_ONLY' || rawGender === 'MALE_ONLY' ? rawGender : 'ANY';

      const contactConfig = customContactOverride ?? getPensionContact(p.id);
      const isCustomContact =
        'isCustom' in contactConfig ? contactConfig.isCustom : Boolean(contactConfig.enabled);
      const pensionContactName =
        'contactName' in p && typeof p.contactName === 'string' ? p.contactName : '';
      const pensionContactPhone =
        'contactPhone' in p && typeof p.contactPhone === 'string' ? p.contactPhone : '';
      const resolvedName = isCustomContact
        ? contactConfig.name
        : pensionContactName || defaultContact.name;
      const resolvedPhone = isCustomContact
        ? contactConfig.phone
        : pensionContactPhone || defaultContact.phone;

      const rawAmenitySlugs: string[] = (
        Array.isArray(p.amenitySlugs)
          ? [...p.amenitySlugs]
          : Array.isArray(p.amenities)
            ? p.amenities
                .map((a) => (typeof a === 'string' ? a : a.slug))
                .filter((s): s is string => Boolean(s))
            : []
      ).filter((s) => !REDUNDANT_UTILITY_SLUGS.has(s));

      setForm({
        waterIncluded: Boolean(p.waterIncluded),
        electricityIncluded: Boolean(p.electricityIncluded),
        gasIncluded: Boolean(p.gasIncluded),
        internetIncluded: Boolean(p.internetIncluded),
        selectedAmenitySlugs: rawAmenitySlugs,
        guestsAllowed: Boolean(p.guestsAllowed),
        smokingAllowed: Boolean(p.smokingAllowed),
        petsAllowed: Boolean(p.petsAllowed),
        curfewTime: curfewVal,
        hasCurfew: Boolean(curfewVal && curfewVal.trim().length > 0),
        quietHoursStart: (isPensionItemDto && p.quietHoursStart) || '',
        quietHoursEnd: (isPensionItemDto && p.quietHoursEnd) || '',
        genderPreference: normalizedGender,
        useCustomContact: isCustomContact,
        contactName: resolvedName,
        contactPhone: normalizePhoneToDisplay(resolvedPhone),
      });
    },
    [defaultContact, getPensionContact],
  );

  const loadPensionData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    if (effectivePensionId) {
      const res = await pensionsService.fetchPensionDetail(effectivePensionId);
      if (isApiSuccess(res)) {
        lastSyncedPensionIdRef.current = res.data.id;
        setActivePension(res.data);
        syncFormFromPension(res.data);
      } else {
        setFetchError(res.message ?? 'No se pudo cargar la información de la pensión.');
      }
      setIsLoading(false);
      return;
    }

    const mineRes = await pensionsService.fetchMinePensions();
    if (isApiSuccess(mineRes)) {
      const list = mineRes.data;
      if (list.length > 0) {
        const first = list[0];
        const detailRes = await pensionsService.fetchPensionDetail(first.id);
        if (isApiSuccess(detailRes)) {
          lastSyncedPensionIdRef.current = detailRes.data.id;
          setActivePension(detailRes.data);
          syncFormFromPension(detailRes.data);
        } else {
          lastSyncedPensionIdRef.current = first.id;
          setActivePension(first);
          syncFormFromPension(first);
        }
      } else {
        setFetchError('No se encontró ninguna pensión asociada a tu cuenta.');
      }
    } else {
      setFetchError(mineRes.message ?? 'Error al buscar pensiones asociadas.');
    }
    setIsLoading(false);
  }, [effectivePensionId, syncFormFromPension]);

  useEffect(() => {
    if (initialPension) {
      if (lastSyncedPensionIdRef.current !== initialPension.id) {
        lastSyncedPensionIdRef.current = initialPension.id;
        setActivePension(initialPension);
        syncFormFromPension(initialPension);
      }
    } else if (propPensionId) {
      if (lastSyncedPensionIdRef.current !== propPensionId) {
        lastSyncedPensionIdRef.current = propPensionId;
        loadPensionData();
      }
    } else if (!activePension) {
      lastSyncedPensionIdRef.current = null;
      loadPensionData();
    }
  }, [propPensionId, initialPension, activePension, loadPensionData, syncFormFromPension]);

  const handleToggle = (field: keyof FormState) => {
    setForm((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleToggleAmenity = (slug: string) => {
    setForm((prev) => {
      const exists = prev.selectedAmenitySlugs.includes(slug);
      const nextAmenities = exists
        ? prev.selectedAmenitySlugs.filter((s) => s !== slug)
        : [...prev.selectedAmenitySlugs, slug];

      return {
        ...prev,
        selectedAmenitySlugs: nextAmenities,
      };
    });
  };

  const handleCurfewToggle = (enabled: boolean) => {
    setForm((prev) => ({
      ...prev,
      hasCurfew: enabled,
      curfewTime: enabled ? prev.curfewTime || '23:00' : '',
    }));
  };

  const handleGenderSelect = (gender: GenderPref) => {
    setForm((prev) => ({
      ...prev,
      genderPreference: gender,
    }));
  };

  const handlePhoneChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      contactPhone: formatChileanPhone(value),
    }));
  };

  const handleSave = async () => {
    if (!activePension?.id) {
      setSaveErrorMessage('No hay una pensión seleccionada para guardar.');
      return;
    }

    setIsSaving(true);
    setSaveSuccessMessage(null);
    setSaveErrorMessage(null);

    const updatePayload: UpdatePensionDto = {
      currency: 'CLP',
      waterIncluded: form.waterIncluded,
      electricityIncluded: form.electricityIncluded,
      gasIncluded: form.gasIncluded,
      internetIncluded: form.internetIncluded,
      amenitySlugs: form.selectedAmenitySlugs,
      guestsAllowed: form.guestsAllowed,
      smokingAllowed: form.smokingAllowed,
      petsAllowed: form.petsAllowed,
      genderPreference: form.genderPreference,
      curfewTime: form.hasCurfew && form.curfewTime.trim() ? form.curfewTime.trim() : undefined,
      quietHoursStart: form.quietHoursStart.trim() || undefined,
      quietHoursEnd: form.quietHoursEnd.trim() || undefined,
      contactName: form.useCustomContact ? form.contactName.trim() : defaultContact.name,
      contactPhone: form.useCustomContact ? form.contactPhone.trim() : defaultContact.phone,
    };

    const response = await pensionsService.update(activePension.id, updatePayload);

    setIsSaving(false);

    if (isApiSuccess(response)) {
      const customContact = {
        enabled: form.useCustomContact,
        name: form.useCustomContact ? form.contactName.trim() : defaultContact.name,
        phone: form.useCustomContact ? form.contactPhone.trim() : defaultContact.phone,
      };

      updatePensionCustomContact(activePension.id, customContact);

      lastSyncedPensionIdRef.current = response.data.id;
      setActivePension(response.data);
      syncFormFromPension(response.data, customContact);
      updatePensionInList?.(response.data);
      onPensionUpdated?.(response.data);

      setSaveSuccessMessage('¡Cambios guardados correctamente en la ficha de tu pensión!');
      setTimeout(() => {
        setSaveSuccessMessage(null);
      }, 4000);
    } else {
      setSaveErrorMessage(
        response.message ?? 'Hubo un error al guardar los cambios. Intenta nuevamente.',
      );
    }
  };

  const previewPensionItem: PensionItem | null = useMemo(() => {
    if (!activePension) return null;

    return {
      ...activePension,
      genderPreference: form.genderPreference,
      internetIncluded: form.internetIncluded,
      amenitySlugs: form.selectedAmenitySlugs,
      curfewTime: form.hasCurfew && form.curfewTime ? form.curfewTime : null,
      guestsAllowed: form.guestsAllowed,
    };
  }, [activePension, form]);

  const isPensionActive = activePension?.isActive ?? true;
  const [showConfirmActiveModal, setShowConfirmActiveModal] = useState<boolean>(false);
  const [isTogglingActive, setIsTogglingActive] = useState<boolean>(false);

  const handleConfirmToggleActive = async () => {
    if (!activePension || isTogglingActive) return;
    setIsTogglingActive(true);
    try {
      const nextState = !isPensionActive;
      await togglePensionActive(activePension.id, nextState);
      setActivePension((prev) => (prev ? { ...prev, isActive: nextState } : prev));
      setShowConfirmActiveModal(false);
    } finally {
      setIsTogglingActive(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!effectivePensionId || isDeleting) return;
    setIsDeleting(true);
    setDeleteErrorMessage(null);
    try {
      const success = await deletePension(effectivePensionId);
      if (success) {
        setIsDeleteModalOpen(false);
      } else {
        setDeleteErrorMessage('No se pudo eliminar la pensión. Inténtalo nuevamente.');
      }
    } catch {
      setDeleteErrorMessage('Ocurrió un error inesperado al eliminar la pensión.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-medium">Cargando datos de la pensión...</p>
      </div>
    );
  }

  if (fetchError && !activePension) {
    const isNoPensionFound =
      fetchError.includes('No se encontró ninguna pensión') ||
      fetchError.toLowerCase().includes('ninguna pensión');

    if (isNoPensionFound) {
      return (
        <div className="flex min-h-[55vh] flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-border/80 bg-card/60 my-4 max-w-md mx-auto">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
            <Building2 className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground tracking-tight">
            ¡Bienvenido a BuscaTuNido!
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 mb-6 max-w-sm leading-relaxed">
            Aún no tienes ninguna pensión registrada. Crea tu primera publicación de alojamiento
            para comenzar a registrar habitaciones y recibir postulaciones de estudiantes
            universitarios.
          </p>
          <Button
            type="button"
            onClick={openCreatePensionModal}
            className="min-h-12 px-6 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs gap-2 cursor-pointer shadow-sm active:scale-[0.98] transition"
          >
            <Plus className="h-4 w-4" />
            <span>Publicar mi primera pensión</span>
          </Button>
        </div>
      );
    }

    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-3">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-foreground">No pudimos cargar la pensión</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">{fetchError}</p>
        <Button
          type="button"
          variant="outline"
          onClick={loadPensionData}
          className="mt-4 min-h-[48px] px-6 text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-5 pb-28 text-left', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
            Perfil de la Pensión
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {activePension && (
            <button
              type="button"
              role="switch"
              aria-checked={isPensionActive}
              onClick={() => setShowConfirmActiveModal(true)}
              className="flex min-h-[40px] items-center gap-2.5 rounded-full border border-border/80 bg-card px-3.5 py-1.5 text-xs font-medium transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer shadow-2xs"
              aria-label={
                isPensionActive
                  ? 'Pensión activa para estudiantes. Clic para pausar.'
                  : 'Pensión pausada. Clic para activar.'
              }
            >
              <span className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full transition-colors',
                    isPensionActive
                      ? 'bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse'
                      : 'bg-muted-foreground/40',
                  )}
                />
                <span
                  className={cn(
                    'text-[11px] font-semibold leading-none',
                    isPensionActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-muted-foreground',
                  )}
                >
                  {isPensionActive ? 'Publicación Activa' : 'Publicación Pausada'}
                </span>
              </span>

              <span
                className={cn(
                  'relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                  isPensionActive ? 'bg-emerald-500' : 'bg-muted-foreground/30',
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                    isPensionActive ? 'translate-x-3.5' : 'translate-x-0',
                  )}
                />
              </span>
            </button>
          )}
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between gap-3 text-emerald-600 dark:text-emerald-400 animate-in fade-in">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessMessage(null)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-emerald-600/80 hover:text-emerald-600 cursor-pointer"
            aria-label="Cerrar notificación de éxito"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {saveErrorMessage && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3 text-destructive animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs font-medium leading-relaxed">
            <span className="font-bold block mb-0.5">Error al guardar</span>
            {saveErrorMessage}
          </div>
          <button
            type="button"
            onClick={() => setSaveErrorMessage(null)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-destructive/80 hover:text-destructive cursor-pointer"
            aria-label="Cerrar alerta de error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="md:hidden rounded-xl border border-border/70 bg-card p-4 shadow-none flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-foreground">
                Sugerencias de la Comunidad
              </span>
              {pendingProposalsCount > 0 && (
                <Badge
                  variant="outline"
                  className="border-border/80 bg-secondary text-muted-foreground text-[10px] font-medium px-1.5 py-0"
                >
                  {pendingProposalsCount} {pendingProposalsCount === 1 ? 'pendiente' : 'pendientes'}
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {pendingProposalsCount > 0
                ? 'Estudiantes han sugerido cambios para tu pensión.'
                : 'No hay cambios sugeridos pendientes.'}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsProposalsDrawerOpen(true)}
          className="shrink-0 min-h-[38px] px-3 text-xs font-semibold cursor-pointer border-border hover:bg-secondary"
        >
          <span>{pendingProposalsCount > 0 ? 'Revisar' : 'Ver'}</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        <Card className="xl:col-span-6 flex flex-col border-border/70 bg-card shadow-none rounded-xl overflow-hidden">
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <Zap className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
              <CardTitle className="text-sm font-semibold text-foreground">
                Servicios Básicos Incluidos
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-0 divide-y divide-border/40 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 select-none hover:bg-muted/15 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <Droplets className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-semibold text-foreground">Agua Potable</span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={form.waterIncluded}
                aria-label="Incluir agua potable"
                onClick={() => handleToggle('waterIncluded')}
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  form.waterIncluded ? 'bg-foreground' : 'bg-muted-foreground/30',
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-xs ring-0 transition duration-200 ease-in-out',
                    form.waterIncluded ? 'translate-x-4' : 'translate-x-0',
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 px-5 py-3.5 select-none hover:bg-muted/15 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <Zap className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-semibold text-foreground">Electricidad / Luz</span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={form.electricityIncluded}
                aria-label="Incluir electricidad"
                onClick={() => handleToggle('electricityIncluded')}
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  form.electricityIncluded ? 'bg-foreground' : 'bg-muted-foreground/30',
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-xs ring-0 transition duration-200 ease-in-out',
                    form.electricityIncluded ? 'translate-x-4' : 'translate-x-0',
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 px-5 py-3.5 select-none hover:bg-muted/15 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <Flame className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-semibold text-foreground">Gas / Calefón</span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={form.gasIncluded}
                aria-label="Incluir gas"
                onClick={() => handleToggle('gasIncluded')}
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  form.gasIncluded ? 'bg-foreground' : 'bg-muted-foreground/30',
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-xs ring-0 transition duration-200 ease-in-out',
                    form.gasIncluded ? 'translate-x-4' : 'translate-x-0',
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 px-5 py-3.5 select-none hover:bg-muted/15 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <Wifi className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-semibold text-foreground">Internet Wi-Fi</span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={form.internetIncluded}
                aria-label="Incluir internet WiFi"
                onClick={() => handleToggle('internetIncluded')}
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  form.internetIncluded ? 'bg-foreground' : 'bg-muted-foreground/30',
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-xs ring-0 transition duration-200 ease-in-out',
                    form.internetIncluded ? 'translate-x-4' : 'translate-x-0',
                  )}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-6 flex flex-col border-border/70 bg-card shadow-none rounded-xl overflow-hidden">
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <Users className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
              <CardTitle className="text-sm font-semibold text-foreground">
                Preferencia de Género
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
            <div className="flex flex-col gap-2">
              {GENDER_OPTIONS.map((option) => {
                const isSelected = form.genderPreference === option.value;
                const Icon = option.icon;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleGenderSelect(option.value)}
                    className={cn(
                      'flex min-h-[48px] items-center justify-between rounded-lg border px-3.5 py-2.5 text-left transition cursor-pointer select-none',
                      isSelected
                        ? 'border-foreground/30 bg-muted/40 text-foreground font-medium'
                        : 'border-border/60 bg-card hover:bg-muted/20 text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-colors',
                          isSelected ? 'text-foreground' : 'text-muted-foreground',
                        )}
                      />
                      <span className="text-xs font-medium text-foreground">{option.label}</span>
                    </div>
                    {isSelected ? (
                      <Check className="h-4 w-4 text-foreground shrink-0 ml-2" />
                    ) : (
                      <span className="h-4 w-4 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-5 flex flex-col border-border/70 bg-card shadow-none rounded-xl overflow-hidden">
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <MessageCircle className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                <CardTitle className="text-sm font-semibold text-foreground">
                  Contacto Directo y WhatsApp
                </CardTitle>
              </div>

              <div className="flex min-h-[44px] items-center gap-2 self-start sm:self-auto shrink-0 bg-muted/30 px-3 py-1.5 rounded-lg border border-border/60">
                <span className="text-xs font-medium text-foreground">Personalizar</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.useCustomContact}
                  aria-label="Personalizar datos de contacto para esta pensión"
                  onClick={() =>
                    setForm((prev) => {
                      const nextCustom = !prev.useCustomContact;
                      return {
                        ...prev,
                        useCustomContact: nextCustom,
                        contactName: nextCustom ? '' : defaultContact.name,
                        contactPhone: nextCustom
                          ? ''
                          : normalizePhoneToDisplay(defaultContact.phone),
                      };
                    })
                  }
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    form.useCustomContact ? 'bg-foreground' : 'bg-muted-foreground/30',
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-xs ring-0 transition duration-200 ease-in-out',
                      form.useCustomContact ? 'translate-x-5' : 'translate-x-0',
                    )}
                  />
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col justify-between">
            <div
              className={cn(
                'space-y-3.5 rounded-xl p-3.5 transition-all duration-200',
                form.useCustomContact
                  ? 'border border-primary/20 bg-primary/5'
                  : 'border border-border/40 bg-muted/20 opacity-80',
              )}
            >
              <div>
                <label
                  htmlFor="landlord-contact-name"
                  className="block text-xs font-medium text-foreground mb-1"
                >
                  Nombre del Anfitrión o Administrador
                </label>
                <input
                  id="landlord-contact-name"
                  type="text"
                  maxLength={70}
                  disabled={!form.useCustomContact}
                  value={form.useCustomContact ? form.contactName : defaultContact.name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      contactName: filterAlphabeticName(e.target.value),
                    }))
                  }
                  placeholder={defaultContact.name || 'Ej: Sra. Carmen Gloria'}
                  className={cn(
                    'min-h-[42px] w-full rounded-lg border border-border/70 px-3 text-xs placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none transition-colors',
                    form.useCustomContact
                      ? 'bg-background text-foreground'
                      : 'bg-muted/30 text-muted-foreground cursor-not-allowed',
                  )}
                />
              </div>

              <div>
                <label
                  htmlFor="landlord-contact-whatsapp"
                  className="block text-xs font-medium text-foreground mb-1"
                >
                  WhatsApp de Contacto (Chile)
                </label>

                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center text-muted-foreground pointer-events-none">
                    <Phone className="h-3.5 w-3.5" />
                  </div>

                  <input
                    id="landlord-contact-whatsapp"
                    type="tel"
                    inputMode="tel"
                    maxLength={16}
                    disabled={!form.useCustomContact}
                    value={
                      form.useCustomContact
                        ? form.contactPhone
                        : normalizePhoneToDisplay(defaultContact.phone)
                    }
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder={normalizePhoneToDisplay(defaultContact.phone) || '+56 9 1234 5678'}
                    className={cn(
                      'min-h-[42px] w-full rounded-lg border border-border/70 pl-8.5 pr-3 text-xs placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none transition-colors',
                      form.useCustomContact
                        ? 'bg-background text-foreground'
                        : 'bg-muted/30 text-muted-foreground cursor-not-allowed',
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-7 flex flex-col border-border/70 bg-card shadow-none rounded-xl overflow-hidden">
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
              <CardTitle className="text-sm font-semibold text-foreground">
                Reglas y Convivencia
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col justify-between">
            <div className="divide-y divide-border/40">
              <div className="flex items-center justify-between gap-3 px-5 py-3.5 select-none hover:bg-muted/15 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-semibold text-foreground">Visitas Permitidas</span>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={form.guestsAllowed}
                  aria-label="Permitir visitas"
                  onClick={() => handleToggle('guestsAllowed')}
                  className={cn(
                    'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    form.guestsAllowed ? 'bg-foreground' : 'bg-muted-foreground/30',
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-xs ring-0 transition duration-200 ease-in-out',
                      form.guestsAllowed ? 'translate-x-4' : 'translate-x-0',
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 px-5 py-3.5 select-none hover:bg-muted/15 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <Ban className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-semibold text-foreground">Permitido Fumar</span>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={form.smokingAllowed}
                  aria-label="Permitir fumar"
                  onClick={() => handleToggle('smokingAllowed')}
                  className={cn(
                    'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    form.smokingAllowed ? 'bg-foreground' : 'bg-muted-foreground/30',
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-xs ring-0 transition duration-200 ease-in-out',
                      form.smokingAllowed ? 'translate-x-4' : 'translate-x-0',
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 px-5 py-3.5 select-none hover:bg-muted/15 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <PawPrint className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-semibold text-foreground">Mascotas Permitidas</span>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={form.petsAllowed}
                  aria-label="Permitir mascotas"
                  onClick={() => handleToggle('petsAllowed')}
                  className={cn(
                    'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    form.petsAllowed ? 'bg-foreground' : 'bg-muted-foreground/30',
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-xs ring-0 transition duration-200 ease-in-out',
                      form.petsAllowed ? 'translate-x-4' : 'translate-x-0',
                    )}
                  />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5 pt-3 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/60 bg-muted/10 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">Toque de Queda</span>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.hasCurfew}
                    aria-label="Fijar toque de queda"
                    onClick={() => handleCurfewToggle(!form.hasCurfew)}
                    className={cn(
                      'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      form.hasCurfew ? 'bg-foreground' : 'bg-muted-foreground/30',
                    )}
                  >
                    <span
                      className={cn(
                        'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-xs ring-0 transition duration-200 ease-in-out',
                        form.hasCurfew ? 'translate-x-4' : 'translate-x-0',
                      )}
                    />
                  </button>
                </div>

                {form.hasCurfew && (
                  <div className="pt-0.5">
                    <label
                      htmlFor="curfew-time-input"
                      className="block text-[11px] text-muted-foreground mb-1"
                    >
                      Hora máxima de regreso:
                    </label>
                    <input
                      id="curfew-time-input"
                      type="time"
                      value={form.curfewTime}
                      onChange={(e) => setForm((prev) => ({ ...prev, curfewTime: e.target.value }))}
                      className="min-h-[38px] w-full rounded-lg border border-border/70 bg-background px-3 text-xs font-medium text-foreground focus:border-foreground/40 focus:outline-none transition-colors"
                    />
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/10 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Moon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">Horario de Silencio</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <div>
                    <label
                      htmlFor="quiet-start-input"
                      className="block text-[10px] text-muted-foreground mb-1"
                    >
                      Inicio:
                    </label>
                    <input
                      id="quiet-start-input"
                      type="time"
                      value={form.quietHoursStart}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, quietHoursStart: e.target.value }))
                      }
                      className="min-h-[38px] w-full rounded-lg border border-border/70 bg-background px-2.5 text-xs font-medium text-foreground focus:border-foreground/40 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="quiet-end-input"
                      className="block text-[10px] text-muted-foreground mb-1"
                    >
                      Fin:
                    </label>
                    <input
                      id="quiet-end-input"
                      type="time"
                      value={form.quietHoursEnd}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, quietHoursEnd: e.target.value }))
                      }
                      className="min-h-[38px] w-full rounded-lg border border-border/70 bg-background px-2.5 text-xs font-medium text-foreground focus:border-foreground/40 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-12 flex flex-col border-border/70 bg-card shadow-none rounded-xl overflow-hidden">
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <LayoutGrid className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                <CardTitle className="text-sm font-semibold text-foreground">
                  Comodidades y Equipamiento
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-xs font-semibold self-start sm:self-auto">
                {form.selectedAmenitySlugs.length} seleccionada
                {form.selectedAmenitySlugs.length === 1 ? '' : 's'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 flex-1 space-y-6">
            {isLoadingAmenities && amenitiesCatalog.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-xs text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cargando catálogo de comodidades...</span>
              </div>
            ) : (
              (Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>).map(
                (catKey) => {
                  const categoryAmenities = amenitiesCatalog.filter((a) => a.category === catKey);
                  if (categoryAmenities.length === 0) return null;

                  return (
                    <div key={catKey} className="space-y-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                        {CATEGORY_LABELS[catKey]}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {categoryAmenities.map((am) => {
                          const isSelected = form.selectedAmenitySlugs.includes(am.slug);
                          const Icon = (am.iconKey && AMENITY_ICON_MAP[am.iconKey]) || CheckCircle2;

                          return (
                            <button
                              key={am.slug}
                              type="button"
                              onClick={() => handleToggleAmenity(am.slug)}
                              className={cn(
                                'flex items-center justify-between gap-2.5 rounded-xl border p-3 text-left transition cursor-pointer select-none',
                                isSelected
                                  ? 'border-primary/50 bg-primary/10 text-foreground font-semibold shadow-2xs'
                                  : 'border-border/60 bg-card hover:bg-muted/20 text-muted-foreground hover:text-foreground',
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Icon
                                  className={cn(
                                    'h-4 w-4 shrink-0 transition-colors',
                                    isSelected ? 'text-primary' : 'text-muted-foreground',
                                  )}
                                />
                                <span className="text-xs truncate">{am.name}</span>
                              </div>
                              {isSelected ? (
                                <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-1" />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                },
              )
            )}
          </CardContent>
        </Card>
      </div>

      <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Zona de Peligro</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dar de baja esta pensión la ocultará inmediatamente de las búsquedas de estudiantes y
              la eliminará de tu panel de gestión.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setDeleteErrorMessage(null);
            setIsDeleteModalOpen(true);
          }}
          className="w-full sm:w-auto border-destructive/35 text-destructive hover:bg-destructive hover:text-white transition-colors text-xs font-bold cursor-pointer shrink-0"
        >
          <Trash2 className="h-4 w-4 mr-1.5" />
          Eliminar Pensión
        </Button>
      </div>

      <div className="sticky bottom-16 md:bottom-4 z-30 p-4 border border-border/80 bg-background/95 backdrop-blur-md rounded-2xl shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsPreviewModalOpen(true)}
          className="w-full sm:w-52 min-h-[48px] border-border text-foreground hover:bg-secondary text-xs font-bold cursor-pointer shrink-0"
        >
          <Eye className="h-4 w-4 mr-1.5 text-muted-foreground" />
          Vista Previa
        </Button>

        <Button
          type="button"
          variant="default"
          disabled={isSaving}
          onClick={handleSave}
          className="w-full sm:flex-1 min-h-[48px] bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Guardando cambios...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios en Ficha
            </>
          )}
        </Button>
      </div>

      {previewPensionItem && (
        <PensionDetailModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          pension={previewPensionItem}
          pensionId={previewPensionItem.id}
        />
      )}

      {effectivePensionId && (
        <LandlordProposalsDrawer
          isOpen={isProposalsDrawerOpen}
          onClose={() => setIsProposalsDrawerOpen(false)}
          pensionId={effectivePensionId}
          onProposalReviewed={refetchProposals}
        />
      )}

      <Dialog
        open={showConfirmActiveModal}
        onOpenChange={(open) => !open && !isTogglingActive && setShowConfirmActiveModal(false)}
      >
        <DialogContent className="max-w-md p-5 sm:p-6 bg-background rounded-2xl">
          <DialogHeader className="text-left space-y-1.5">
            <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
              {!isPensionActive
                ? '¿Activar publicación de pensión?'
                : '¿Pausar publicación de pensión?'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {!isPensionActive
                ? `La pensión "${activePension?.title}" volverá a ser visible para todos los estudiantes universitarios en el mapa y búsquedas.`
                : `La pensión "${activePension?.title}" quedará oculta temporalmente para los estudiantes. No recibirás nuevas solicitudes ni visitas mientras esté pausada.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              disabled={isTogglingActive}
              onClick={() => setShowConfirmActiveModal(false)}
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
                !isPensionActive
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-foreground text-background hover:opacity-90',
              )}
            >
              {isTogglingActive && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              <span>{!isPensionActive ? 'Activar Publicación' : 'Pausar Publicación'}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={(open) => !open && !isDeleting && setIsDeleteModalOpen(false)}
      >
        <DialogContent className="max-w-md p-5 sm:p-6 bg-background rounded-2xl">
          <DialogHeader className="text-left space-y-1.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-1">
              <Trash2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
              ¿Eliminar esta pensión?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              La pensión &ldquo;{activePension?.title}&rdquo; dejará de estar disponible para los
              estudiantes universitarios y se removerá de tu panel de gestión. Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {deleteErrorMessage && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium">
              {deleteErrorMessage}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setIsDeleteModalOpen(false)}
              className="w-full sm:w-auto text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="w-full sm:w-auto text-xs font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-none cursor-pointer"
            >
              {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              <span>{isDeleting ? 'Eliminando...' : 'Eliminar Definitivamente'}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
