'use client';

import {
  AlertCircle,
  Building2,
  Check,
  ChevronLeft,
  Clock,
  DollarSign,
  Droplets,
  Flame,
  GraduationCap,
  Loader2,
  MapPin,
  Navigation,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { PensionLocationPickerMap } from '@/components/landlord/pension-location-picker-map';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { isApiSuccess } from '@/lib/api-response';
import { cn } from '@/lib/utils';
import { pensionsService } from '@/services/pensions.service';
import { fetchUniversities } from '@/services/universities.service';
import type { CreatePensionDto, PensionDetailDto, UniversityDto } from '@/types/api-contracts';

export type PensionEditorDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdPension: PensionDetailDto) => void;
  className?: string;
};

type GenderPref = 'ANY' | 'FEMALE_ONLY' | 'MALE_ONLY';

type CityCoordinate = {
  city: string;
  lat: number;
  lng: number;
  neighborhoodPlaceholder: string;
};

const CHILEAN_CITIES: readonly CityCoordinate[] = [
  {
    city: 'Santiago',
    lat: -33.4489,
    lng: -70.6693,
    neighborhoodPlaceholder: 'San Joaquín, Providencia, Barrio Universitario...',
  },
  {
    city: 'Valparaíso',
    lat: -33.0472,
    lng: -71.6127,
    neighborhoodPlaceholder: 'Cerro Alegre, Playa Ancha, Centro...',
  },
  {
    city: 'Viña del Mar',
    lat: -33.0245,
    lng: -71.5518,
    neighborhoodPlaceholder: 'Recreo, Miraflores, Centro...',
  },
  {
    city: 'Concepción',
    lat: -36.827,
    lng: -73.0503,
    neighborhoodPlaceholder: 'Barrio Universitario, Plaza Perú, Lomas de San Andrés...',
  },
  {
    city: 'Valdivia',
    lat: -39.8142,
    lng: -73.2459,
    neighborhoodPlaceholder: 'Isla Teja, Regional, Centro...',
  },
  {
    city: 'Temuco',
    lat: -38.7359,
    lng: -72.5904,
    neighborhoodPlaceholder: 'Avenida Alemania, Centro...',
  },
  {
    city: 'Antofagasta',
    lat: -23.6509,
    lng: -70.3975,
    neighborhoodPlaceholder: 'Sector Sur, Playa Blanca...',
  },
  {
    city: 'La Serena',
    lat: -29.9027,
    lng: -71.2519,
    neighborhoodPlaceholder: 'Colina El Pino, Centro...',
  },
];

const GENDER_OPTIONS: ReadonlyArray<{
  value: GenderPref;
  label: string;
  description: string;
  icon: typeof Users;
}> = [
  {
    value: 'ANY',
    label: 'Mixto',
    description: 'Cualquier estudiante',
    icon: Users,
  },
  {
    value: 'FEMALE_ONLY',
    label: 'Solo Mujeres',
    description: 'Exclusivo mujeres',
    icon: Sparkles,
  },
  {
    value: 'MALE_ONLY',
    label: 'Solo Hombres',
    description: 'Exclusivo hombres',
    icon: Users,
  },
];

const FREQUENT_AMENITIES: ReadonlyArray<{
  slug: string;
  name: string;
  icon: typeof Wifi;
}> = [
  { slug: 'wifi-alta-velocidad', name: 'Wi-Fi fibra óptica', icon: Wifi },
  { slug: 'cocina-equipada', name: 'Cocina equipada', icon: Flame },
  { slug: 'lavadora', name: 'Lavadora disponible', icon: Droplets },
  { slug: 'area-estudio', name: 'Sala de estudio', icon: Sparkles },
  { slug: 'calefaccion', name: 'Calefacción', icon: Zap },
  { slug: 'camaras-seguridad', name: 'Seguridad / Cámaras', icon: ShieldCheck },
];

type PensionFormState = {
  title: string;
  description: string;
  address: string;
  city: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  baseMonthlyPrice: string;
  deposit: string;
  waterIncluded: boolean;
  electricityIncluded: boolean;
  gasIncluded: boolean;
  internetIncluded: boolean;
  genderPreference: GenderPref;
  hasCurfew: boolean;
  curfewTime: string;
  quietHoursStart: string;
  quietHoursEnd: string;
  guestsAllowed: boolean;
  smokingAllowed: boolean;
  petsAllowed: boolean;
  selectedAmenitySlugs: string[];
  nearbyUniversityId: string;
};

const INITIAL_FORM_STATE: PensionFormState = {
  title: '',
  description: '',
  address: '',
  city: 'Santiago',
  neighborhood: '',
  latitude: -33.4489,
  longitude: -70.6693,
  baseMonthlyPrice: '',
  deposit: '',
  waterIncluded: true,
  electricityIncluded: true,
  gasIncluded: true,
  internetIncluded: true,
  genderPreference: 'ANY',
  hasCurfew: false,
  curfewTime: '23:00',
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  guestsAllowed: false,
  smokingAllowed: false,
  petsAllowed: false,
  selectedAmenitySlugs: ['wifi-alta-velocidad'],
  nearbyUniversityId: '',
};

export function PensionEditorDrawer({
  isOpen,
  onClose,
  onSuccess,
  className,
}: PensionEditorDrawerProps) {
  const [form, setForm] = useState<PensionFormState>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [universities, setUniversities] = useState<UniversityDto[]>([]);
  const [isLoadingUniversities, setIsLoadingUniversities] = useState<boolean>(false);

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM_STATE);
    setErrorMessage(null);
  }, []);

  const handleCityChange = (cityName: string) => {
    const foundCity = CHILEAN_CITIES.find((c) => c.city.toLowerCase() === cityName.toLowerCase());
    setForm((prev) => ({
      ...prev,
      city: cityName,
      latitude: foundCity ? foundCity.lat : prev.latitude,
      longitude: foundCity ? foundCity.lng : prev.longitude,
      nearbyUniversityId: '',
    }));
  };

  const handleDetectLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setErrorMessage('La geolocalización no está disponible en este navegador.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
        }));
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        setErrorMessage(
          error.code === error.PERMISSION_DENIED
            ? 'Permiso de ubicación denegado. Puedes continuar con las coordenadas por defecto.'
            : 'No fue posible obtener tu ubicación actual.',
        );
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingUniversities(true);

    fetchUniversities({ city: form.city })
      .then((res) => {
        if (!isMounted) return;
        if (isApiSuccess(res)) {
          setUniversities(res.data);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingUniversities(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, form.city]);

  const toggleAmenity = (slug: string) => {
    setForm((prev) => {
      const exists = prev.selectedAmenitySlugs.includes(slug);
      return {
        ...prev,
        selectedAmenitySlugs: exists
          ? prev.selectedAmenitySlugs.filter((s) => s !== slug)
          : [...prev.selectedAmenitySlugs, slug],
      };
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedTitle = form.title.trim();
    const trimmedDescription = form.description.trim();
    const trimmedAddress = form.address.trim();
    const trimmedCity = form.city.trim();
    const trimmedNeighborhood = form.neighborhood.trim();
    const parsedPrice = Number(form.baseMonthlyPrice);

    if (trimmedTitle.length < 3) {
      setErrorMessage('El título de la pensión debe tener al menos 3 caracteres.');
      return;
    }

    if (trimmedDescription.length < 10) {
      setErrorMessage('La descripción debe tener al menos 10 caracteres.');
      return;
    }

    if (trimmedAddress.length < 3) {
      setErrorMessage('Ingresa una dirección válida para la pensión.');
      return;
    }

    if (trimmedCity.length < 2) {
      setErrorMessage('Selecciona o ingresa la ciudad donde se ubica.');
      return;
    }

    if (trimmedNeighborhood.length < 2) {
      setErrorMessage('Ingresa la comuna o barrio (ej. San Joaquín, Centro).');
      return;
    }

    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMessage('Ingresa un valor mensual de arriendo base válido en pesos chilenos.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const parsedDeposit = form.deposit.trim() ? Number(form.deposit) : undefined;
      const formattedCurfew = form.hasCurfew && form.curfewTime ? form.curfewTime : undefined;

      const payload: CreatePensionDto = {
        title: trimmedTitle,
        description: trimmedDescription,
        address: trimmedAddress,
        city: trimmedCity,
        neighborhood: trimmedNeighborhood,
        latitude: form.latitude,
        longitude: form.longitude,
        baseMonthlyPrice: parsedPrice,
        deposit: parsedDeposit && !Number.isNaN(parsedDeposit) ? parsedDeposit : undefined,
        currency: 'CLP',
        waterIncluded: form.waterIncluded,
        electricityIncluded: form.electricityIncluded,
        gasIncluded: form.gasIncluded,
        internetIncluded: form.internetIncluded,
        genderPreference: form.genderPreference,
        guestsAllowed: form.guestsAllowed,
        smokingAllowed: form.smokingAllowed,
        petsAllowed: form.petsAllowed,
        curfewTime: formattedCurfew,
        quietHoursStart: form.quietHoursStart || undefined,
        quietHoursEnd: form.quietHoursEnd || undefined,
        amenitySlugs: form.selectedAmenitySlugs.length > 0 ? form.selectedAmenitySlugs : undefined,
        nearbyUniversityId: form.nearbyUniversityId || undefined,
      };

      const response = await pensionsService.createPension(payload);

      if (isApiSuccess(response)) {
        resetForm();
        onSuccess?.(response.data);
        onClose();
      } else {
        setErrorMessage(response.message || 'No fue posible registrar la pensión.');
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Ocurrió un error inesperado al publicar la pensión.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCityConfig = CHILEAN_CITIES.find(
    (c) => c.city.toLowerCase() === form.city.toLowerCase(),
  );

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        id="pension-editor-drawer"
        className={cn(
          'max-h-[94vh] max-w-xl md:max-w-2xl mx-auto md:rounded-3xl bg-card border-border text-foreground flex flex-col overflow-hidden',
          className,
        )}
      >
        <div className="mx-auto mt-2.5 mb-1 h-1.5 w-12 rounded-full bg-muted-foreground/30 shrink-0" />

        <div className="flex items-center justify-between px-4 py-2 border-b border-border/60">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Nueva Pensión
          </span>
          <div className="w-9" />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="overflow-y-auto flex-1 px-4 py-4 space-y-6">
            <DrawerHeader className="p-0 text-left">
              <DrawerTitle className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary shrink-0" />
                <span>Registra tu Pensión Universitaria</span>
              </DrawerTitle>
              <DrawerDescription className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Publica los datos de tu alojamiento para comenzar a agregar habitaciones y recibir
                solicitudes de estudiantes en BuscaTuNido.
              </DrawerDescription>
            </DrawerHeader>

            {errorMessage && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 flex items-start gap-2.5 text-destructive animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-xs font-medium leading-relaxed">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Building2 className="h-4 w-4 text-primary" />
                <span>1. Información General</span>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="pension-title-input"
                  className="block text-xs font-semibold text-foreground"
                >
                  Título de la Publicación <span className="text-destructive">*</span>
                </label>
                <input
                  id="pension-title-input"
                  type="text"
                  required
                  placeholder="Ej: Residencia Universitaria Los Leones"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full min-h-12 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="pension-description-input"
                  className="block text-xs font-semibold text-foreground"
                >
                  Descripción General <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="pension-description-input"
                  required
                  rows={3}
                  placeholder="Describe el ambiente, cercanía a campus universitarios, servicios cercanos y comodidades para estudiantes..."
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>2. Ubicación y Ciudad</span>
                </div>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline cursor-pointer disabled:opacity-50"
                >
                  {isLocating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Navigation className="h-3 w-3" />
                  )}
                  <span>Detectar GPS</span>
                </button>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="city-select"
                  className="block text-xs font-semibold text-foreground"
                >
                  Ciudad <span className="text-destructive">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CHILEAN_CITIES.map((c) => {
                    const isSelected = form.city.toLowerCase() === c.city.toLowerCase();
                    return (
                      <button
                        key={c.city}
                        type="button"
                        onClick={() => handleCityChange(c.city)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer',
                          isSelected
                            ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                            : 'bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/50',
                        )}
                      >
                        {c.city}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="pension-neighborhood-input"
                    className="block text-xs font-semibold text-foreground"
                  >
                    Comuna o Barrio <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="pension-neighborhood-input"
                    type="text"
                    required
                    placeholder={
                      selectedCityConfig?.neighborhoodPlaceholder ?? 'Ej: San Joaquín, Centro...'
                    }
                    value={form.neighborhood}
                    onChange={(e) => setForm((prev) => ({ ...prev, neighborhood: e.target.value }))}
                    className="w-full min-h-12 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="pension-address-input"
                    className="block text-xs font-semibold text-foreground"
                  >
                    Dirección Exacta <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="pension-address-input"
                    type="text"
                    required
                    placeholder="Ej: Av. Vicuña Mackenna 4860"
                    value={form.address}
                    onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                    className="w-full min-h-12 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  />
                </div>
              </div>

              {universities.length > 0 && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="university-select"
                    className="block text-xs font-semibold text-foreground flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-primary" />
                      Universidad Cercana (opcional)
                    </span>
                    {isLoadingUniversities && (
                      <span className="text-[10px] text-muted-foreground font-normal">
                        Cargando...
                      </span>
                    )}
                  </label>
                  <select
                    id="university-select"
                    value={form.nearbyUniversityId}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, nearbyUniversityId: e.target.value }))
                    }
                    className="w-full min-h-12 rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  >
                    <option value="">Selecciona universidad cercana si aplica...</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} {u.campus ? `(${u.campus})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>Ubicación en el Mapa</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Arrastra el marcador o haz clic en la calle exacta
                  </span>
                </div>
                <PensionLocationPickerMap
                  latitude={form.latitude}
                  longitude={form.longitude}
                  city={form.city}
                  neighborhood={form.neighborhood}
                  address={form.address}
                  onLocationChange={(lat, lng) =>
                    setForm((prev) => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <DollarSign className="h-4 w-4 text-primary" />
                <span>3. Precios y Valores</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="pension-price-input"
                    className="block text-xs font-semibold text-foreground"
                  >
                    Precio Base Mensual (CLP) <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                      $
                    </span>
                    <input
                      id="pension-price-input"
                      type="number"
                      required
                      min={0}
                      step={5000}
                      placeholder="250000"
                      value={form.baseMonthlyPrice}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, baseMonthlyPrice: e.target.value }))
                      }
                      className="w-full min-h-12 rounded-xl border border-border bg-background pl-8 pr-3.5 py-2.5 text-sm font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Valor referencial de la habitación más económica.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="pension-deposit-input"
                    className="block text-xs font-semibold text-foreground"
                  >
                    Mes de Garantía / Depósito (CLP)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                      $
                    </span>
                    <input
                      id="pension-deposit-input"
                      type="number"
                      min={0}
                      step={5000}
                      placeholder="250000 (opcional)"
                      value={form.deposit}
                      onChange={(e) => setForm((prev) => ({ ...prev, deposit: e.target.value }))}
                      className="w-full min-h-12 rounded-xl border border-border bg-background pl-8 pr-3.5 py-2.5 text-sm font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Opcional. Deja vacío si no solicitas garantía previa.
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Droplets className="h-4 w-4 text-primary" />
                <span>4. Servicios Básicos Incluidos</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  {
                    key: 'waterIncluded' as const,
                    label: 'Agua Potable',
                    icon: Droplets,
                    activeColor: 'text-sky-500',
                  },
                  {
                    key: 'electricityIncluded' as const,
                    label: 'Luz Eléctrica',
                    icon: Zap,
                    activeColor: 'text-amber-500',
                  },
                  {
                    key: 'gasIncluded' as const,
                    label: 'Gas / Calefont',
                    icon: Flame,
                    activeColor: 'text-orange-500',
                  },
                  {
                    key: 'internetIncluded' as const,
                    label: 'Internet Wi-Fi',
                    icon: Wifi,
                    activeColor: 'text-indigo-500',
                  },
                ].map((utility) => {
                  const isChecked = form[utility.key];
                  const Icon = utility.icon;

                  return (
                    <button
                      key={utility.key}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, [utility.key]: !prev[utility.key] }))
                      }
                      className={cn(
                        'flex flex-col items-center justify-center p-3 rounded-2xl border transition-all min-h-16 text-center cursor-pointer',
                        isChecked
                          ? 'border-primary/50 bg-primary/10 text-foreground font-semibold shadow-2xs'
                          : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40',
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4.5 w-4.5 mb-1 shrink-0',
                          isChecked ? utility.activeColor : 'text-muted-foreground',
                        )}
                      />
                      <span className="text-xs">{utility.label}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        {isChecked ? 'Incluido' : 'No incluido'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Users className="h-4 w-4 text-primary" />
                <span>5. Normas y Preferencia de Género</span>
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-semibold text-foreground">
                  Preferencia de Género
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {GENDER_OPTIONS.map((opt) => {
                    const isSelected = form.genderPreference === opt.value;
                    const Icon = opt.icon;

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, genderPreference: opt.value }))
                        }
                        className={cn(
                          'flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center min-h-16 cursor-pointer',
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs'
                            : 'border-border bg-card hover:bg-secondary text-muted-foreground',
                        )}
                      >
                        <Icon className="h-4.5 w-4.5 mb-1 shrink-0" />
                        <span className="text-xs leading-tight">{opt.label}</span>
                        <span className="text-[10px] font-normal opacity-80 mt-0.5">
                          {opt.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    key: 'guestsAllowed' as const,
                    label: 'Visitas Externas',
                    desc: 'Amigos / estudio',
                  },
                  {
                    key: 'smokingAllowed' as const,
                    label: 'Fumar Permitido',
                    desc: 'Zonas designadas',
                  },
                  {
                    key: 'petsAllowed' as const,
                    label: 'Acepta Mascotas',
                    desc: 'Pet-friendly',
                  },
                ].map((item) => {
                  const isChecked = form[item.key];
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-2xl border transition-all text-left min-h-12 cursor-pointer',
                        isChecked
                          ? 'border-primary/50 bg-primary/10 text-foreground'
                          : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40',
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">{item.label}</span>
                        <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                      </div>
                      <div
                        className={cn(
                          'h-4 w-4 rounded-full flex items-center justify-center shrink-0 border transition-colors',
                          isChecked
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-muted-foreground/40 bg-transparent',
                        )}
                      >
                        {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-border/80 bg-muted/20 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <div>
                      <span className="text-xs font-semibold text-foreground block">
                        Límite de Llegada / Toque de Queda
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        ¿Exiges una hora tope para entrar en la noche?
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.hasCurfew}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        hasCurfew: !prev.hasCurfew,
                      }))
                    }
                    className={cn(
                      'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                      form.hasCurfew ? 'bg-primary' : 'bg-muted-foreground/30',
                    )}
                  >
                    <span
                      className={cn(
                        'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                        form.hasCurfew ? 'translate-x-4' : 'translate-x-0',
                      )}
                    />
                  </button>
                </div>

                {form.hasCurfew && (
                  <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                    <label
                      htmlFor="curfew-time-select"
                      className="text-xs font-medium text-muted-foreground shrink-0"
                    >
                      Hora límite de acceso:
                    </label>
                    <input
                      id="curfew-time-select"
                      type="time"
                      value={form.curfewTime}
                      onChange={(e) => setForm((prev) => ({ ...prev, curfewTime: e.target.value }))}
                      className="min-h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>6. Comodidades Destacadas</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {FREQUENT_AMENITIES.map((am) => {
                  const isSelected = form.selectedAmenitySlugs.includes(am.slug);
                  const Icon = am.icon;

                  return (
                    <button
                      key={am.slug}
                      type="button"
                      onClick={() => toggleAmenity(am.slug)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition cursor-pointer',
                        isSelected
                          ? 'border-primary/60 bg-primary/10 text-primary font-semibold shadow-2xs'
                          : 'border-border/60 bg-card hover:bg-secondary text-muted-foreground',
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span>{am.name}</span>
                      {isSelected && <Check className="h-3 w-3 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-border/80 bg-background/95 backdrop-blur-md flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-12 px-5 rounded-xl border-border text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-h-12 px-6 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs gap-2 cursor-pointer shadow-sm active:scale-[0.98] transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Publicando pensión...</span>
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4" />
                  <span>Publicar Pensión</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
