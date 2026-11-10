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
  Image as ImageIcon,
  Loader2,
  MapPin,
  ShieldCheck,
  Upload,
  User,
  Users,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { PensionLocationPickerMap } from '@/components/landlord/pension-location-picker-map';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useFormDraft } from '@/hooks/use-form-draft';
import { isApiSuccess } from '@/lib/api-response';
import { isSubstantivePensionDraft } from '@/lib/draft-validators';
import { translateApiError } from '@/lib/error-translator';
import { clampNumber } from '@/lib/format-utils';
import type { CityInfo, CreatePensionDto, PensionDetailDto } from '@/lib/types';
import { SANTIAGO_COORDINATES, useUserLocation } from '@/lib/use-user-location';
import { cn } from '@/lib/utils';
import {
  fetchCities,
  findClosestCity,
  forwardGeocode,
  normalizeCityName,
  reverseGeocode,
} from '@/services/locations.service';
import { pensionsService } from '@/services/pensions.service';
import { uploadsService } from '@/services/uploads.service';

export type PensionEditorDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdPension: PensionDetailDto) => void;
  className?: string;
};

type GenderPref = 'ANY' | 'FEMALE_ONLY' | 'MALE_ONLY';

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
    icon: User,
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
  { slug: 'agua-caliente', name: 'Agua caliente 24/7', icon: Droplets },
  { slug: 'cocina-equipada', name: 'Cocina equipada', icon: Flame },
  { slug: 'lavadora-secadora', name: 'Lavadora disponible', icon: Droplets },
  { slug: 'sala-estudio-cowork', name: 'Sala de estudio', icon: GraduationCap },
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
  images: string[];
};

const CHILE_CITY_COORDINATES: Readonly<Record<string, { latitude: number; longitude: number }>> = {
  santiago: { latitude: -33.4489, longitude: -70.6693 },
  concepcion: { latitude: -36.827, longitude: -73.0503 },
  valparaiso: { latitude: -33.0472, longitude: -71.6127 },
  'vina del mar': { latitude: -33.0245, longitude: -71.5518 },
  valdivia: { latitude: -39.8142, longitude: -73.2459 },
  antofagasta: { latitude: -23.6509, longitude: -70.3975 },
  temuco: { latitude: -38.7359, longitude: -72.5904 },
  'la serena': { latitude: -29.9027, longitude: -71.252 },
  coquimbo: { latitude: -29.9533, longitude: -71.3395 },
  talca: { latitude: -35.4264, longitude: -71.6554 },
  calama: { latitude: -22.456, longitude: -68.9295 },
  arica: { latitude: -18.4783, longitude: -70.3126 },
  iquique: { latitude: -20.2208, longitude: -70.1431 },
  copiapo: { latitude: -27.3668, longitude: -70.3323 },
  ovalle: { latitude: -30.5983, longitude: -71.2003 },
  'san antonio': { latitude: -33.5939, longitude: -71.6075 },
  rancagua: { latitude: -34.1708, longitude: -70.7444 },
  curico: { latitude: -34.9828, longitude: -71.2394 },
  linares: { latitude: -35.8454, longitude: -71.5979 },
  chillan: { latitude: -36.6063, longitude: -72.1034 },
  'los angeles': { latitude: -37.4697, longitude: -72.3537 },
  osorno: { latitude: -40.5739, longitude: -73.1335 },
  'puerto montt': { latitude: -41.4693, longitude: -72.9424 },
  'puerto varas': { latitude: -41.3195, longitude: -72.9854 },
  castro: { latitude: -42.4721, longitude: -73.7732 },
  ancud: { latitude: -41.8697, longitude: -73.8286 },
  coyhaique: { latitude: -45.5752, longitude: -72.0662 },
  'punta arenas': { latitude: -53.1638, longitude: -70.9171 },
  algarrobo: { latitude: -33.3688, longitude: -71.6685 },
  'alto hospicio': { latitude: -20.2747, longitude: -70.1047 },
  'alto del carmen': { latitude: -28.7592, longitude: -70.4856 },
  andacollo: { latitude: -30.2319, longitude: -71.085 },
  angol: { latitude: -37.7981, longitude: -72.7164 },
  arauco: { latitude: -37.2464, longitude: -73.3175 },
  buin: { latitude: -33.7328, longitude: -70.7431 },
  cabildo: { latitude: -32.4286, longitude: -71.0669 },
  cabrero: { latitude: -37.0336, longitude: -72.4042 },
};

function getKnownCityCoordinates(cityName: string): { latitude: number; longitude: number } | null {
  const normalized = normalizeCityName(cityName);
  return CHILE_CITY_COORDINATES[normalized] ?? null;
}

const INITIAL_FORM_STATE: PensionFormState = {
  title: '',
  description: '',
  address: '',
  city: '',
  neighborhood: '',
  latitude: SANTIAGO_COORDINATES.latitude,
  longitude: SANTIAGO_COORDINATES.longitude,
  baseMonthlyPrice: '',
  deposit: '',
  waterIncluded: false,
  electricityIncluded: false,
  gasIncluded: false,
  internetIncluded: false,
  genderPreference: 'ANY',
  hasCurfew: false,
  curfewTime: '',
  quietHoursStart: '',
  quietHoursEnd: '',
  guestsAllowed: false,
  smokingAllowed: false,
  petsAllowed: false,
  selectedAmenitySlugs: [],
  images: [],
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
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState<boolean>(false);
  const [isForwardGeocoding, setIsForwardGeocoding] = useState<boolean>(false);
  const [cities, setCities] = useState<CityInfo[]>([]);

  const previewsRef = useRef<string[]>([]);
  previewsRef.current = newImagePreviews;

  useEffect(() => {
    return () => {
      for (const url of previewsRef.current) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const newPreviews = fileArray.map((file) => URL.createObjectURL(file));

    setNewImageFiles((prev) => [...prev, ...fileArray]);
    setNewImagePreviews((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveExistingImage = (indexToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleRemoveNewImage = (indexToRemove: number) => {
    setNewImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setNewImagePreviews((prev) => {
      const urlToRevoke = prev[indexToRemove];
      if (urlToRevoke) {
        URL.revokeObjectURL(urlToRevoke);
      }
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  const { userLocation, currentCity } = useUserLocation(cities);
  const hasUserSelectedLocationRef = useRef<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadCities() {
      const res = await fetchCities();
      if (isMounted && isApiSuccess(res) && res.data.length > 0) {
        setCities(res.data);
      }
    }
    void loadCities();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isOpen || hasUserSelectedLocationRef.current) return;
    if (userLocation && (userLocation.latitude !== 0 || userLocation.longitude !== 0)) {
      setForm((prev) => {
        const isDefault =
          (prev.latitude === 0 && prev.longitude === 0) ||
          (prev.latitude === SANTIAGO_COORDINATES.latitude &&
            prev.longitude === SANTIAGO_COORDINATES.longitude);
        if (!isDefault) return prev;
        return {
          ...prev,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          city: prev.city || currentCity?.name || 'Santiago',
        };
      });
    }
  }, [isOpen, userLocation, currentCity]);

  const { isBannerVisible, restoreDraft, clearDraft } = useFormDraft<PensionFormState>({
    storageKey: 'landlord-new-pension',
    currentValues: form,
    initialValues: INITIAL_FORM_STATE,
    isEnabled: isOpen,
    isSubstantive: isSubstantivePensionDraft,
  });

  const isUpdatingFromMapRef = useRef<boolean>(false);
  const reverseAbortRef = useRef<AbortController | null>(null);
  const forwardAbortRef = useRef<AbortController | null>(null);

  const resetForm = useCallback(() => {
    for (const url of previewsRef.current) {
      URL.revokeObjectURL(url);
    }
    setNewImageFiles([]);
    setNewImagePreviews([]);
    hasUserSelectedLocationRef.current = false;
    setForm({
      ...INITIAL_FORM_STATE,
      latitude: userLocation.latitude || SANTIAGO_COORDINATES.latitude,
      longitude: userLocation.longitude || SANTIAGO_COORDINATES.longitude,
      city: currentCity?.name || '',
    });
    setErrorMessage(null);
  }, [userLocation, currentCity]);

  const handleCancel = () => {
    clearDraft();
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleRestoreDraft = () => {
    const draft = restoreDraft();
    if (draft) {
      const hasValidDraftCoords =
        typeof draft.latitude === 'number' &&
        typeof draft.longitude === 'number' &&
        !Number.isNaN(draft.latitude) &&
        !Number.isNaN(draft.longitude) &&
        (draft.latitude !== 0 || draft.longitude !== 0);

      const sanitizedDraft: PensionFormState = {
        ...INITIAL_FORM_STATE,
        ...draft,
        images: Array.isArray(draft.images) ? draft.images : [],
        latitude: hasValidDraftCoords
          ? draft.latitude
          : userLocation.latitude || SANTIAGO_COORDINATES.latitude,
        longitude: hasValidDraftCoords
          ? draft.longitude
          : userLocation.longitude || SANTIAGO_COORDINATES.longitude,
      };
      hasUserSelectedLocationRef.current = true;
      setForm(sanitizedDraft);
      toast.success('Borrador restaurado');
    }
  };

  const handlePriceChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) {
      setForm((prev) => ({ ...prev, baseMonthlyPrice: '' }));
      return;
    }
    const num = Number.parseInt(digits, 10);
    const clamped = clampNumber(num, 0, 2000000);
    if (clamped.wasClamped && num > 2000000) {
      toast.info('El precio base mensual máximo permitido es $2.000.000 CLP.');
    }
    setForm((prev) => ({ ...prev, baseMonthlyPrice: clamped.value.toString() }));
  };

  const handleDepositChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) {
      setForm((prev) => ({ ...prev, deposit: '' }));
      return;
    }
    const num = Number.parseInt(digits, 10);
    const clamped = clampNumber(num, 0, 1500000);
    if (clamped.wasClamped && num > 1500000) {
      toast.info('El mes de garantía máximo permitido es $1.500.000 CLP.');
    }
    setForm((prev) => ({ ...prev, deposit: clamped.value.toString() }));
  };

  const handleCityChange = async (cityName: string) => {
    hasUserSelectedLocationRef.current = true;
    const foundCity = cities.find((c) => c.name.toLowerCase() === cityName.toLowerCase());
    const hasValidCoords =
      foundCity &&
      typeof foundCity.latitude === 'number' &&
      typeof foundCity.longitude === 'number' &&
      !Number.isNaN(foundCity.latitude) &&
      !Number.isNaN(foundCity.longitude) &&
      (foundCity.latitude !== 0 || foundCity.longitude !== 0);

    if (hasValidCoords) {
      setForm((prev) => ({
        ...prev,
        city: cityName,
        latitude: foundCity.latitude,
        longitude: foundCity.longitude,
      }));
      return;
    }

    const knownCoords = getKnownCityCoordinates(cityName);
    if (knownCoords) {
      setForm((prev) => ({
        ...prev,
        city: cityName,
        latitude: knownCoords.latitude,
        longitude: knownCoords.longitude,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        city: cityName,
      }));
    }

    try {
      const geo = await forwardGeocode(`${cityName}, Chile`);
      if (geo && (geo.lat !== 0 || geo.lng !== 0)) {
        setForm((prev) => {
          if (prev.city.toLowerCase() !== cityName.toLowerCase()) return prev;
          return {
            ...prev,
            latitude: geo.lat,
            longitude: geo.lng,
          };
        });
      }
    } catch {
      // Retain existing coordinates
    }
  };

  const handleLocationChange = useCallback(
    async (lat: number, lng: number) => {
      hasUserSelectedLocationRef.current = true;
      isUpdatingFromMapRef.current = true;
      setForm((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));

      if (reverseAbortRef.current) {
        reverseAbortRef.current.abort();
      }
      const controller = new AbortController();
      reverseAbortRef.current = controller;

      setIsReverseGeocoding(true);
      try {
        const result = await reverseGeocode(lat, lng, controller.signal);
        if (result && !controller.signal.aborted) {
          const matchedCity = cities.find(
            (c) => normalizeCityName(c.name) === normalizeCityName(result.city),
          );
          const resolvedCity = matchedCity
            ? matchedCity.name
            : cities.length > 0
              ? findClosestCity(
                  lat,
                  lng,
                  cities.map((c) => ({ lat: c.latitude, lng: c.longitude, name: c.name })),
                ).name
              : result.city;

          setForm((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            city: resolvedCity,
            neighborhood: result.neighborhood || prev.neighborhood,
            address: result.address || prev.address,
          }));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsReverseGeocoding(false);
        }
      }
    },
    [cities],
  );

  useEffect(() => {
    if (isUpdatingFromMapRef.current) {
      isUpdatingFromMapRef.current = false;
      return;
    }

    const trimmedAddress = form.address.trim();
    const trimmedNeighborhood = form.neighborhood.trim();

    if (trimmedAddress.length < 3 && trimmedNeighborhood.length < 2) {
      return;
    }

    if (forwardAbortRef.current) {
      forwardAbortRef.current.abort();
    }
    const controller = new AbortController();
    forwardAbortRef.current = controller;

    const timer = setTimeout(async () => {
      setIsForwardGeocoding(true);
      try {
        let result = null;
        if (trimmedAddress.length >= 3 && trimmedNeighborhood.length >= 2) {
          const fullQuery = `${trimmedAddress}, ${trimmedNeighborhood}, ${form.city}, Chile`;
          result = await forwardGeocode(fullQuery, controller.signal);
        }

        if (!result && trimmedAddress.length >= 3 && !controller.signal.aborted) {
          const addressQuery = `${trimmedAddress}, ${form.city}, Chile`;
          result = await forwardGeocode(addressQuery, controller.signal);
        }

        if (
          !result &&
          !trimmedAddress &&
          trimmedNeighborhood.length >= 2 &&
          !controller.signal.aborted
        ) {
          const neighborhoodQuery = `${trimmedNeighborhood}, ${form.city}, Chile`;
          result = await forwardGeocode(neighborhoodQuery, controller.signal);
        }

        if (result && !controller.signal.aborted) {
          setForm((prev) => ({
            ...prev,
            latitude: result.lat,
            longitude: result.lng,
          }));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsForwardGeocoding(false);
        }
      }
    }, 700);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [form.address, form.neighborhood, form.city]);

  const toggleAmenity = (slug: string) => {
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
      let uploadedUrls: string[] = [];

      if (newImageFiles.length > 0) {
        const uploadRes = await uploadsService.uploadMultipleFiles(newImageFiles);
        if (isApiSuccess(uploadRes) && uploadRes.data?.urls) {
          uploadedUrls = uploadRes.data.urls;
        } else if (!isApiSuccess(uploadRes)) {
          const friendly = translateApiError(
            uploadRes,
            uploadRes.message || 'No fue posible subir las fotos de la pensión.',
          );
          setErrorMessage(friendly);
          toast.error(friendly);
          setIsSubmitting(false);
          return;
        }
      }

      const allImages = [...form.images, ...uploadedUrls];
      const parsedDeposit = form.deposit.trim() ? Number(form.deposit) : undefined;
      const formattedCurfew = form.hasCurfew && form.curfewTime ? form.curfewTime : undefined;

      const safeLat =
        typeof form.latitude === 'number' &&
        !Number.isNaN(form.latitude) &&
        (form.latitude !== 0 || form.longitude !== 0)
          ? form.latitude
          : userLocation.latitude || SANTIAGO_COORDINATES.latitude;
      const safeLng =
        typeof form.longitude === 'number' &&
        !Number.isNaN(form.longitude) &&
        (form.latitude !== 0 || form.longitude !== 0)
          ? form.longitude
          : userLocation.longitude || SANTIAGO_COORDINATES.longitude;

      const REDUNDANT_UTILITY_SLUGS = new Set([
        'wifi-alta-velocidad',
        'luz-incluida',
        'gas-incluido',
      ]);
      const cleanAmenities = form.selectedAmenitySlugs.filter(
        (s) => !REDUNDANT_UTILITY_SLUGS.has(s),
      );

      const payload: CreatePensionDto = {
        title: trimmedTitle,
        description: trimmedDescription,
        address: trimmedAddress,
        city: trimmedCity,
        neighborhood: trimmedNeighborhood,
        latitude: safeLat,
        longitude: safeLng,
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
        amenitySlugs: cleanAmenities.length > 0 ? cleanAmenities : undefined,
        images: allImages.length > 0 ? allImages : undefined,
      };

      const response = await pensionsService.createPension(payload);

      if (isApiSuccess(response)) {
        for (const url of previewsRef.current) {
          URL.revokeObjectURL(url);
        }
        setNewImageFiles([]);
        setNewImagePreviews([]);
        clearDraft();
        resetForm();
        toast.success('Pensión registrada exitosamente');
        onSuccess?.(response.data);
        onClose();
      } else {
        const friendly = translateApiError(
          response,
          response.message || 'No fue posible registrar la pensión.',
        );
        setErrorMessage(friendly);
        toast.error(friendly);
      }
    } catch (err) {
      const friendly = translateApiError(err);
      setErrorMessage(friendly);
      toast.error(friendly);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()}>
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
            onClick={handleClose}
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

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <div className="overflow-y-auto flex-1 px-4 py-4 space-y-6">
            <DrawerHeader className="p-0 text-center">
              <DrawerTitle className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight text-center text-balance">
                Registra tu Pensión Universitaria
              </DrawerTitle>
            </DrawerHeader>

            {isBannerVisible && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 flex items-center justify-between gap-2 text-xs">
                <span className="text-foreground">Tienes un borrador previo no publicado.</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleRestoreDraft}
                    className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition cursor-pointer"
                  >
                    Restaurar
                  </button>
                  <button
                    type="button"
                    onClick={clearDraft}
                    className="px-2 py-1 rounded-lg border border-border text-muted-foreground hover:bg-muted transition cursor-pointer"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            )}

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
                  maxLength={100}
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
                  rows={3}
                  maxLength={1500}
                  placeholder="Describe el ambiente, cercanía a campus universitarios, servicios cercanos y comodidades para estudiantes..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  <span>2. Fotos de la Pensión</span>
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {form.images.length + newImagePreviews.length} seleccionadas
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Sube fotos de la fachada, áreas comunes o espacios compartidos. La primera imagen
                será la foto principal destacada.
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {form.images.map((imgUrl, idx) => (
                  <div
                    key={imgUrl}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-muted border border-border/70 shadow-2xs"
                  >
                    <Image
                      src={imgUrl}
                      alt={`Foto pensión ${idx + 1}`}
                      fill
                      unoptimized
                      sizes="120px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(idx)}
                      className="absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-destructive transition cursor-pointer shadow-xs"
                      aria-label="Eliminar foto"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 rounded-md bg-primary text-primary-foreground px-1.5 py-0.5 text-[9px] font-bold shadow-xs">
                        Principal
                      </span>
                    )}
                  </div>
                ))}

                {newImagePreviews.map((previewUrl, idx) => (
                  <div
                    key={previewUrl}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-muted border border-primary/40 shadow-2xs"
                  >
                    <Image
                      src={previewUrl}
                      alt={`Nueva foto pensión ${idx + 1}`}
                      fill
                      unoptimized
                      sizes="120px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(idx)}
                      className="absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-destructive transition cursor-pointer shadow-xs"
                      aria-label="Eliminar nueva foto"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <span className="absolute bottom-1 left-1 rounded-md bg-primary/90 text-primary-foreground px-1.5 py-0.5 text-[9px] font-bold shadow-xs">
                      {form.images.length === 0 && idx === 0 ? 'Principal' : 'Nueva'}
                    </span>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-secondary/60 text-muted-foreground hover:text-primary transition cursor-pointer min-h-20"
                >
                  <Upload className="h-5 w-5 mb-1 shrink-0" />
                  <span className="text-[10px] font-semibold">Subir foto</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>3. Ubicación y Ciudad</span>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="city-select"
                  className="block text-xs font-semibold text-foreground"
                >
                  Ciudad <span className="text-destructive">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {cities.map((c) => {
                    const isSelected = form.city.toLowerCase() === c.name.toLowerCase();
                    return (
                      <button
                        key={c.id || c.name}
                        type="button"
                        onClick={() => handleCityChange(c.name)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer',
                          isSelected
                            ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                            : 'bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/50',
                        )}
                      >
                        {c.name}
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
                    maxLength={60}
                    placeholder="Ej: San Joaquín, Centro..."
                    value={form.neighborhood}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        neighborhood: e.target.value,
                      }))
                    }
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
                    maxLength={120}
                    placeholder="Ej: Av. Vicuña Mackenna 4860"
                    value={form.address}
                    onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                    className="w-full min-h-12 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>Ubicación en el Mapa</span>
                    {(isReverseGeocoding || isForwardGeocoding) && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-primary font-normal animate-in fade-in">
                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        <span>
                          {isReverseGeocoding ? 'Obteniendo dirección...' : 'Buscando en mapa...'}
                        </span>
                      </span>
                    )}
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
                  onLocationChange={handleLocationChange}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <DollarSign className="h-4 w-4 text-primary" />
                <span>4. Precios y Valores</span>
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
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="250.000"
                      value={
                        form.baseMonthlyPrice
                          ? Number(form.baseMonthlyPrice).toLocaleString('es-CL')
                          : ''
                      }
                      onChange={(e) => handlePriceChange(e.target.value)}
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
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="250.000 (opcional)"
                      value={form.deposit ? Number(form.deposit).toLocaleString('es-CL') : ''}
                      onChange={(e) => handleDepositChange(e.target.value)}
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
                <span>5. Servicios Básicos Incluidos</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  {
                    key: 'waterIncluded' as const,
                    label: 'Agua Potable',
                    icon: Droplets,
                    activeColor: 'text-primary',
                  },
                  {
                    key: 'electricityIncluded' as const,
                    label: 'Luz Eléctrica',
                    icon: Zap,
                    activeColor: 'text-primary',
                  },
                  {
                    key: 'gasIncluded' as const,
                    label: 'Gas / Calefont',
                    icon: Flame,
                    activeColor: 'text-primary',
                  },
                  {
                    key: 'internetIncluded' as const,
                    label: 'Internet Wi-Fi',
                    icon: Wifi,
                    activeColor: 'text-primary',
                  },
                ].map((utility) => {
                  const isChecked = form[utility.key];
                  const Icon = utility.icon;

                  return (
                    <button
                      key={utility.key}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          [utility.key]: !prev[utility.key],
                        }))
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
                <span>6. Normas y Preferencia de Género</span>
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
                          setForm((prev) => ({
                            ...prev,
                            genderPreference: opt.value,
                          }))
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
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key],
                        }))
                      }
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
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          curfewTime: e.target.value,
                        }))
                      }
                      className="min-h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Check className="h-4 w-4 text-primary" />
                <span>7. Comodidades Destacadas</span>
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
              onClick={handleCancel}
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
