'use client';

import {
  AlertCircle,
  Ban,
  Check,
  CheckCircle2,
  Clock,
  Droplets,
  Eye,
  Flame,
  Loader2,
  MessageCircle,
  Moon,
  PawPrint,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PensionDetailModal } from '@/components/pensions/pension-detail-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mapRawPensionToPensionItem } from '@/lib/api-client';
import { isApiSuccess } from '@/lib/api-response';
import { useAuth } from '@/lib/auth-context';
import type { PensionItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { pensionsService } from '@/services/pensions.service';
import type { PensionDetailDto, UpdatePensionDto } from '@/types/api-contracts';

export type LandlordPensionScreenProps = {
  pension?: PensionItem | PensionDetailDto | null;
  pensionId?: string;
  onPensionUpdated?: (updated: PensionDetailDto) => void;
  className?: string;
};

type GenderPref = 'ANY' | 'FEMALE_ONLY' | 'MALE_ONLY';

type FormState = {
  waterIncluded: boolean;
  electricityIncluded: boolean;
  gasIncluded: boolean;
  internetIncluded: boolean;
  guestsAllowed: boolean;
  smokingAllowed: boolean;
  petsAllowed: boolean;
  curfewTime: string;
  hasCurfew: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  genderPreference: GenderPref;
  contactName: string;
  contactPhone: string;
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
    icon: Sparkles,
  },
  {
    value: 'MALE_ONLY',
    label: 'Solo Hombres',
    description: 'Exclusivo para estudiantes hombres',
    icon: Users,
  },
];

export function LandlordPensionScreen({
  pension: initialPension = null,
  pensionId: propPensionId,
  onPensionUpdated,
  className,
}: LandlordPensionScreenProps) {
  const { user } = useAuth();

  const [activePension, setActivePension] = useState<PensionDetailDto | PensionItem | null>(
    initialPension,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);

  const [form, setForm] = useState<FormState>({
    waterIncluded: true,
    electricityIncluded: true,
    gasIncluded: true,
    internetIncluded: true,
    guestsAllowed: false,
    smokingAllowed: false,
    petsAllowed: false,
    curfewTime: '',
    hasCurfew: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    genderPreference: 'ANY',
    contactName: '',
    contactPhone: '',
  });

  const effectivePensionId = propPensionId || activePension?.id || '';

  const syncFormFromPension = useCallback(
    (p: PensionDetailDto | PensionItem) => {
      const isPensionItemDto = 'waterIncluded' in p;
      const rawCurfew = isPensionItemDto ? p.curfewTime : undefined;
      const curfewVal = typeof rawCurfew === 'string' ? rawCurfew : '';
      const rawGender = p.genderPreference;
      const normalizedGender: GenderPref =
        rawGender === 'FEMALE_ONLY' || rawGender === 'MALE_ONLY' ? rawGender : 'ANY';

      const phoneDefault =
        (p as unknown as { contactPhone?: string })?.contactPhone || user?.phone || '+56 9 ';
      const nameDefault =
        (p as unknown as { contactName?: string })?.contactName ||
        (user ? `${user.firstName} ${user.lastName}`.trim() : '');

      setForm({
        waterIncluded: isPensionItemDto ? Boolean(p.waterIncluded ?? true) : true,
        electricityIncluded: isPensionItemDto ? Boolean(p.electricityIncluded ?? true) : true,
        gasIncluded: isPensionItemDto ? Boolean(p.gasIncluded ?? true) : true,
        internetIncluded: isPensionItemDto
          ? Boolean(p.internetIncluded ?? true)
          : Boolean((p as PensionItem).includesWifi ?? true),
        guestsAllowed: isPensionItemDto ? Boolean(p.guestsAllowed) : false,
        smokingAllowed: isPensionItemDto ? Boolean(p.smokingAllowed) : false,
        petsAllowed: isPensionItemDto ? Boolean(p.petsAllowed) : false,
        curfewTime: curfewVal,
        hasCurfew: Boolean(curfewVal && curfewVal.trim().length > 0),
        quietHoursStart: (isPensionItemDto && p.quietHoursStart) || '22:00',
        quietHoursEnd: (isPensionItemDto && p.quietHoursEnd) || '08:00',
        genderPreference: normalizedGender,
        contactName: nameDefault,
        contactPhone: normalizePhoneToDisplay(phoneDefault),
      });
    },
    [user],
  );

  const loadPensionData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    if (effectivePensionId) {
      const res = await pensionsService.fetchPensionDetail(effectivePensionId);
      if (isApiSuccess(res)) {
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
          setActivePension(detailRes.data);
          syncFormFromPension(detailRes.data);
        } else {
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
      setActivePension(initialPension);
      syncFormFromPension(initialPension);
    } else {
      loadPensionData();
    }
  }, [initialPension, loadPensionData, syncFormFromPension]);

  const handleToggle = (field: keyof FormState) => {
    setForm((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
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
      contactPhone: value,
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
      guestsAllowed: form.guestsAllowed,
      smokingAllowed: form.smokingAllowed,
      petsAllowed: form.petsAllowed,
      genderPreference: form.genderPreference,
      curfewTime: form.hasCurfew && form.curfewTime.trim() ? form.curfewTime.trim() : undefined,
      quietHoursStart: form.quietHoursStart.trim() || undefined,
      quietHoursEnd: form.quietHoursEnd.trim() || undefined,
    };

    const response = await pensionsService.update(activePension.id, updatePayload);

    setIsSaving(false);

    if (isApiSuccess(response)) {
      setActivePension(response.data);
      setSaveSuccessMessage('¡Cambios guardados correctamente en la ficha de tu pensión!');
      onPensionUpdated?.(response.data);
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

    const mapped = mapRawPensionToPensionItem(activePension as Record<string, unknown>);
    return {
      ...mapped,
      genderPreference: form.genderPreference === 'ANY' ? 'MIXED' : form.genderPreference,
      includesWifi: form.internetIncluded,
      curfewDescription:
        form.hasCurfew && form.curfewTime
          ? `Llegada hasta las ${form.curfewTime}`
          : 'Sin horario límite de llegada',
      visitsPolicy: form.guestsAllowed ? 'Visitas permitidas' : 'No se permiten visitas externas',
    };
  }, [activePension, form]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-medium">Cargando datos de la pensión...</p>
      </div>
    );
  }

  if (fetchError && !activePension) {
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
          <p className="text-xs text-muted-foreground mt-0.5">
            Configura servicios incluidos, normas de convivencia y datos de contacto
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setIsPreviewModalOpen(true)}
          className="min-h-[48px] px-4 text-xs font-bold border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <Eye className="h-4 w-4 mr-1.5" />
          Vista Previa Estudiante
        </Button>
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

      <Card className="border-border/80 bg-card shadow-xs rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                Servicios Básicos Incluidos
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Indica qué cuentas básicas están cubiertas en el arriendo mensual
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex min-h-[52px] items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2.5 transition-colors hover:bg-muted/40 select-none">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
                <Droplets className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">Agua Potable</span>
                <span className="text-[11px] text-muted-foreground">
                  Consumo de agua fría y caliente incluido
                </span>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={form.waterIncluded}
              aria-label="Incluir agua potable"
              onClick={() => handleToggle('waterIncluded')}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                form.waterIncluded ? 'bg-primary' : 'bg-muted-foreground/30',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                  form.waterIncluded ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          </div>

          <div className="flex min-h-[52px] items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2.5 transition-colors hover:bg-muted/40 select-none">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Zap className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">Electricidad / Luz</span>
                <span className="text-[11px] text-muted-foreground">
                  Gasto eléctrico general y en habitaciones
                </span>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={form.electricityIncluded}
              aria-label="Incluir electricidad"
              onClick={() => handleToggle('electricityIncluded')}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                form.electricityIncluded ? 'bg-primary' : 'bg-muted-foreground/30',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                  form.electricityIncluded ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          </div>

          <div className="flex min-h-[52px] items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2.5 transition-colors hover:bg-muted/40 select-none">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                <Flame className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">Gas / Calefón</span>
                <span className="text-[11px] text-muted-foreground">
                  Gas para cocina y agua caliente
                </span>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={form.gasIncluded}
              aria-label="Incluir gas"
              onClick={() => handleToggle('gasIncluded')}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                form.gasIncluded ? 'bg-primary' : 'bg-muted-foreground/30',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                  form.gasIncluded ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          </div>

          <div className="flex min-h-[52px] items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2.5 transition-colors hover:bg-muted/40 select-none">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Wifi className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">Internet Wi-Fi</span>
                <span className="text-[11px] text-muted-foreground">
                  Conexión de alta velocidad para estudio
                </span>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={form.internetIncluded}
              aria-label="Incluir internet WiFi"
              onClick={() => handleToggle('internetIncluded')}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                form.internetIncluded ? 'bg-primary' : 'bg-muted-foreground/30',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                  form.internetIncluded ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card shadow-xs rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                Reglas y Convivencia
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Define normas claras para mantener un ambiente de estudio y descanso
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="space-y-3">
            <div className="flex min-h-[52px] items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2.5 transition-colors hover:bg-muted/40 select-none">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                  <Users className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">Visitas Permitidas</span>
                  <span className="text-[11px] text-muted-foreground">
                    Los residentes pueden recibir compañeros o familiares
                  </span>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={form.guestsAllowed}
                aria-label="Permitir visitas"
                onClick={() => handleToggle('guestsAllowed')}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  form.guestsAllowed ? 'bg-primary' : 'bg-muted-foreground/30',
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                    form.guestsAllowed ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </button>
            </div>

            <div className="flex min-h-[52px] items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2.5 transition-colors hover:bg-muted/40 select-none">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                  <Ban className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">Permitido Fumar</span>
                  <span className="text-[11px] text-muted-foreground">
                    En áreas designadas o patios abiertos
                  </span>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={form.smokingAllowed}
                aria-label="Permitir fumar"
                onClick={() => handleToggle('smokingAllowed')}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  form.smokingAllowed ? 'bg-primary' : 'bg-muted-foreground/30',
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                    form.smokingAllowed ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </button>
            </div>

            <div className="flex min-h-[52px] items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2.5 transition-colors hover:bg-muted/40 select-none">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-500">
                  <PawPrint className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">Mascotas Permitidas</span>
                  <span className="text-[11px] text-muted-foreground">
                    Acepta perros, gatos o mascotas pequeñas
                  </span>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={form.petsAllowed}
                aria-label="Permitir mascotas"
                onClick={() => handleToggle('petsAllowed')}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  form.petsAllowed ? 'bg-primary' : 'bg-muted-foreground/30',
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                    form.petsAllowed ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/15 p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground">
                  Horario Límite de Llegada (Toque de queda)
                </span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={form.hasCurfew}
                aria-label="Fijar toque de queda"
                onClick={() => handleCurfewToggle(!form.hasCurfew)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  form.hasCurfew ? 'bg-primary' : 'bg-muted-foreground/30',
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                    form.hasCurfew ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </button>
            </div>

            {form.hasCurfew ? (
              <div className="pt-1">
                <label
                  htmlFor="curfew-time-input"
                  className="block text-[11px] font-semibold text-muted-foreground mb-1"
                >
                  Hora máxima de regreso nocturno:
                </label>
                <input
                  id="curfew-time-input"
                  type="time"
                  value={form.curfewTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, curfewTime: e.target.value }))}
                  className="min-h-[48px] w-full rounded-xl border border-border bg-background px-3.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground italic">
                Sin horario límite: los estudiantes cuentan con llave / acceso independiente 24/7.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/15 p-3.5 space-y-3">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">
                Horario de Silencio y Estudio
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Franja horaria para evitar ruidos fuertes y favorecer la concentración y el descanso.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label
                  htmlFor="quiet-start-input"
                  className="block text-[11px] font-semibold text-muted-foreground mb-1"
                >
                  Inicio silencio:
                </label>
                <input
                  id="quiet-start-input"
                  type="time"
                  value={form.quietHoursStart}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, quietHoursStart: e.target.value }))
                  }
                  className="min-h-[48px] w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label
                  htmlFor="quiet-end-input"
                  className="block text-[11px] font-semibold text-muted-foreground mb-1"
                >
                  Fin silencio:
                </label>
                <input
                  id="quiet-end-input"
                  type="time"
                  value={form.quietHoursEnd}
                  onChange={(e) => setForm((prev) => ({ ...prev, quietHoursEnd: e.target.value }))}
                  className="min-h-[48px] w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card shadow-xs rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                Preferencia de Género
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Especifica a qué público universitario está dirigida la residencia
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {GENDER_OPTIONS.map((option) => {
              const isSelected = form.genderPreference === option.value;
              const Icon = option.icon;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleGenderSelect(option.value)}
                  className={cn(
                    'flex min-h-[64px] flex-col items-start justify-center rounded-xl border p-3.5 text-left transition cursor-pointer select-none',
                    isSelected
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                      : 'border-border/70 bg-muted/20 hover:bg-muted/40 text-foreground',
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-2">
                      <Icon
                        className={cn(
                          'h-4 w-4',
                          isSelected ? 'text-primary' : 'text-muted-foreground',
                        )}
                      />
                      <span className="text-xs font-bold text-foreground">{option.label}</span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </div>
                  <span className="text-[10px] text-muted-foreground leading-tight">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card shadow-xs rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                Contacto Directo y WhatsApp
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Canal oficial para que estudiantes interesados consulten disponibilidad
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-4">
          <div>
            <label
              htmlFor="landlord-contact-name"
              className="block text-xs font-bold text-foreground mb-1.5"
            >
              Nombre del Anfitrión o Administrador
            </label>
            <input
              id="landlord-contact-name"
              type="text"
              value={form.contactName}
              onChange={(e) => setForm((prev) => ({ ...prev, contactName: e.target.value }))}
              placeholder="Ej: Sra. Carmen Gloria"
              className="min-h-[48px] w-full rounded-xl border border-border bg-background px-4 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="landlord-contact-whatsapp"
                className="block text-xs font-bold text-foreground"
              >
                WhatsApp de Contacto (Chile)
              </label>
              <Badge
                variant="outline"
                className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]"
              >
                🇨🇱 Formato +56 9
              </Badge>
            </div>

            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center gap-1 text-xs font-bold text-muted-foreground pointer-events-none">
                <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>

              <input
                id="landlord-contact-whatsapp"
                type="tel"
                value={form.contactPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+56 9 1234 5678"
                className="min-h-[48px] w-full rounded-xl border border-border bg-background pl-9 pr-4 text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Permite a los estudiantes contactarte con 1 toque desde la ficha pública.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-16 md:bottom-4 z-30 -mx-4 md:mx-0 p-4 border-t md:border border-border/80 bg-background/95 backdrop-blur-md md:rounded-2xl shadow-lg flex flex-col sm:flex-row items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsPreviewModalOpen(true)}
          className="w-full sm:w-1/3 min-h-[48px] border-border text-foreground hover:bg-secondary text-xs font-bold cursor-pointer"
        >
          <Eye className="h-4 w-4 mr-1.5 text-muted-foreground" />
          Vista Previa
        </Button>

        <Button
          type="button"
          variant="default"
          disabled={isSaving}
          onClick={handleSave}
          className="w-full sm:w-2/3 min-h-[48px] bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
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
    </div>
  );
}
