'use client';

import {
  AlertCircle,
  Bath,
  ChevronLeft,
  DollarSign,
  Home,
  Loader2,
  Minus,
  Plus,
  Save,
  Upload,
  User,
  Users,
  X,
} from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { RoomItem, RoomType } from '@/components/landlord/room-item-card';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useFormDraft } from '@/hooks/use-form-draft';
import { isApiSuccess } from '@/lib/api-response';
import { translateApiError } from '@/lib/error-translator';
import { clampNumber } from '@/lib/format-utils';
import type { CreateRoomDto, UpdateRoomDto } from '@/lib/types';
import { cn } from '@/lib/utils';
import { createPensionRoom, updateRoom } from '@/services/rooms.service';
import { uploadsService } from '@/services/uploads.service';

export type RoomEditorDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  pensionId: string;
  roomToEdit?: RoomItem | null;
  onSuccess: () => void;
  className?: string;
};

type RoomFormState = {
  title: string;
  roomNumber: string;
  description: string;
  type: RoomType;
  monthlyPrice: string;
  deposit: string;
  hasPrivateBathroom: boolean;
  totalBeds: number;
  isAvailable: boolean;
  images: string[];
};

const ROOM_TYPE_OPTIONS: Array<{
  type: RoomType;
  label: string;
  icon: typeof User;
  description: string;
}> = [
  {
    type: 'SINGLE',
    label: 'Individual',
    icon: User,
    description: '1 residente',
  },
  {
    type: 'SHARED',
    label: 'Compartida',
    icon: Users,
    description: '2+ residentes',
  },
  {
    type: 'STUDIO',
    label: 'Estudio',
    icon: Home,
    description: 'Monoambiente',
  },
];

const INITIAL_ROOM_STATE: RoomFormState = {
  title: '',
  roomNumber: '',
  description: '',
  type: 'SINGLE',
  monthlyPrice: '',
  deposit: '',
  hasPrivateBathroom: false,
  totalBeds: 1,
  isAvailable: true,
  images: [],
};

export function RoomEditorDrawer({
  isOpen,
  onClose,
  pensionId,
  roomToEdit,
  onSuccess,
  className,
}: RoomEditorDrawerProps) {
  const isEditing = Boolean(roomToEdit);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<RoomFormState>(INITIAL_ROOM_STATE);

  const { hasDraft, restoreDraft, clearDraft } = useFormDraft<RoomFormState>(
    'landlord-new-room',
    form,
    INITIAL_ROOM_STATE,
    isOpen && !isEditing,
  );

  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRestoreDraft = () => {
    const draft = restoreDraft();
    if (draft) {
      setForm(draft);
      toast.success('Borrador restaurado');
    }
  };

  const handleMonthlyPriceChange = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (!digits) {
      setForm((prev) => ({ ...prev, monthlyPrice: '' }));
      return;
    }
    const num = Number.parseInt(digits, 10);
    const clamped = clampNumber(num, 0, 1200000);
    if (clamped.wasClamped && num > 1200000) {
      toast.info('El precio mensual máximo para una habitación es $1.200.000 CLP.');
    }
    setForm((prev) => ({ ...prev, monthlyPrice: clamped.value.toString() }));
  };

  const handleDepositChange = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (!digits) {
      setForm((prev) => ({ ...prev, deposit: '' }));
      return;
    }
    const num = Number.parseInt(digits, 10);
    const clamped = clampNumber(num, 0, 1200000);
    if (clamped.wasClamped && num > 1200000) {
      toast.info('La garantía máxima sugerida para una habitación es $1.200.000 CLP.');
    }
    setForm((prev) => ({ ...prev, deposit: clamped.value.toString() }));
  };

  useEffect(() => {
    if (isOpen) {
      if (roomToEdit) {
        const resolvedType: RoomType = roomToEdit.type ?? 'SINGLE';
        const existingImages = roomToEdit.images ? [...roomToEdit.images] : [];

        setForm({
          title: roomToEdit.title || roomToEdit.name || '',
          roomNumber: roomToEdit.roomNumber || '',
          description: roomToEdit.description || '',
          type: resolvedType,
          monthlyPrice:
            roomToEdit.monthlyPrice !== undefined ? String(roomToEdit.monthlyPrice) : '',
          deposit:
            roomToEdit.deposit !== undefined && roomToEdit.deposit !== null
              ? String(roomToEdit.deposit)
              : '',
          hasPrivateBathroom: Boolean(
            roomToEdit.hasPrivateBathroom ?? roomToEdit.bathType === 'PRIVATE',
          ),
          totalBeds: roomToEdit.totalBeds ?? 1,
          isAvailable: roomToEdit.isAvailable ?? true,
          images: existingImages,
        });
      } else {
        setForm({
          title: '',
          roomNumber: '',
          description: '',
          type: 'SINGLE',
          monthlyPrice: '',
          deposit: '',
          hasPrivateBathroom: false,
          totalBeds: 1,
          isAvailable: true,
          images: [],
        });
      }
      setNewImageFiles([]);
      setNewImagePreviews([]);
      setErrorMessage(null);
    }
  }, [isOpen, roomToEdit]);

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

  const handleBedCountChange = (delta: number) => {
    setForm((prev) => {
      const next = Math.max(1, Math.min(12, prev.totalBeds + delta));
      return { ...prev, totalBeds: next };
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedTitle = form.title.trim();
    const trimmedRoomNumber = form.roomNumber.trim();
    const parsedPrice = Number(form.monthlyPrice);

    if (trimmedTitle.length < 3) {
      setErrorMessage('El nombre de la habitación debe tener al menos 3 caracteres.');
      return;
    }

    if (trimmedTitle.length > 80) {
      setErrorMessage('El nombre de la habitación no puede superar los 80 caracteres.');
      return;
    }

    if (trimmedRoomNumber.length > 20) {
      setErrorMessage('El número o identificador no puede superar los 20 caracteres.');
      return;
    }

    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMessage('Ingresa un valor mensual de arriendo válido en CLP.');
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
            uploadRes.message || 'No fue posible subir las imágenes de la habitación.',
          );
          setErrorMessage(friendly);
          toast.error(friendly);
          setIsSubmitting(false);
          return;
        }
      }

      const allImages = [...form.images, ...uploadedUrls];
      const parsedDeposit = form.deposit.trim() ? Number(form.deposit) : undefined;
      const roomNumberVal = trimmedRoomNumber ? trimmedRoomNumber.slice(0, 20) : undefined;

      if (isEditing && roomToEdit) {
        const updatePayload: UpdateRoomDto = {
          title: trimmedTitle,
          roomNumber: roomNumberVal,
          description: form.description.trim() || undefined,
          type: form.type,
          monthlyPrice: parsedPrice,
          deposit: parsedDeposit,
          hasPrivateBathroom: form.hasPrivateBathroom,
          totalBeds: form.type === 'SHARED' ? form.totalBeds : 1,
          availableBeds: form.type === 'SHARED' ? form.totalBeds : 1,
          isAvailable: form.isAvailable,
          isActive: roomToEdit.isActive ?? true,
          images: allImages,
        };

        const res = await updateRoom(roomToEdit.id, updatePayload);
        if (!isApiSuccess(res)) {
          const friendly = translateApiError(
            res,
            res.message || 'No fue posible actualizar la habitación.',
          );
          setErrorMessage(friendly);
          toast.error(friendly);
          setIsSubmitting(false);
          return;
        }
      } else {
        const createPayload: CreateRoomDto = {
          title: trimmedTitle,
          roomNumber: roomNumberVal,
          description: form.description.trim() || undefined,
          type: form.type,
          monthlyPrice: parsedPrice,
          deposit: parsedDeposit,
          hasPrivateBathroom: form.hasPrivateBathroom,
          totalBeds: form.type === 'SHARED' ? form.totalBeds : 1,
          availableBeds: form.type === 'SHARED' ? form.totalBeds : 1,
          isAvailable: form.isAvailable,
          isActive: true,
          images: allImages,
        };

        const res = await createPensionRoom(pensionId, createPayload);
        if (!isApiSuccess(res)) {
          const friendly = translateApiError(
            res,
            res.message || 'No fue posible crear la habitación.',
          );
          setErrorMessage(friendly);
          toast.error(friendly);
          setIsSubmitting(false);
          return;
        }
      }

      clearDraft();
      toast.success(
        isEditing ? 'Habitación actualizada exitosamente' : 'Habitación creada exitosamente',
      );
      onSuccess();
      onClose();
    } catch (err) {
      const friendly = translateApiError(err);
      setErrorMessage(friendly);
      toast.error(friendly);
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewPrice = Number(form.monthlyPrice);
  const formattedClpPreview =
    !Number.isNaN(previewPrice) && previewPrice > 0
      ? `$${previewPrice.toLocaleString('es-CL')} CLP / mes`
      : null;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        id="room-editor-drawer"
        className={cn(
          'max-h-[92vh] max-w-lg md:max-w-2xl mx-auto md:rounded-3xl bg-card border-border text-foreground flex flex-col overflow-hidden',
          className,
        )}
      >
        <div className="mx-auto mt-2.5 mb-1 h-1.5 w-12 rounded-full bg-muted-foreground/30 shrink-0" />

        <div className="flex items-center justify-between px-4 py-2 border-b border-border/60">
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-12 min-w-12 items-center justify-center rounded-full hover:bg-secondary text-muted-foreground transition cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {isEditing ? 'Editar Habitación' : 'Nueva Habitación'}
          </span>
          <div className="w-12" />
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <div className="overflow-y-auto flex-1 px-4 py-4 space-y-5">
            <DrawerHeader className="p-0 text-left">
              <DrawerTitle className="text-lg font-bold text-foreground">
                {isEditing ? 'Detalles de la Habitación' : 'Configura tu nueva habitación'}
              </DrawerTitle>
              <DrawerDescription className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Define el tipo de estancia, valor mensual en pesos chilenos y condiciones de
                arriendo.
              </DrawerDescription>
            </DrawerHeader>

            {hasDraft && !isEditing && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 flex items-center justify-between gap-2 text-xs">
                <span className="text-foreground">
                  Tienes un borrador de habitación no guardado.
                </span>
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
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-start gap-2.5 text-rose-600 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-xs font-medium">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="room-name-input"
                  className="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Nombre de la Habitación <span className="text-destructive">*</span>
                </label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {form.title.length}/80
                </span>
              </div>
              <input
                id="room-name-input"
                type="text"
                maxLength={80}
                placeholder="Ej: Habitación Individual Luminosa"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full min-h-12 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="room-number-input"
                  className="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  N° o Código Corto{' '}
                  <span className="text-[10px] lowercase font-normal">(opcional)</span>
                </label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {form.roomNumber.length}/20
                </span>
              </div>
              <input
                id="room-number-input"
                type="text"
                maxLength={20}
                placeholder="Ej: 101, 2B, Hab 1"
                value={form.roomNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, roomNumber: e.target.value }))}
                className="w-full min-h-12 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tipo de Habitación
              </span>
              <div className="grid grid-cols-3 gap-2">
                {ROOM_TYPE_OPTIONS.map((opt) => {
                  const isSelected = form.type === opt.type;
                  const Icon = opt.icon;

                  return (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, type: opt.type }))}
                      className={cn(
                        'flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center min-h-16 cursor-pointer',
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                          : 'border-border bg-card hover:bg-secondary text-muted-foreground',
                      )}
                    >
                      <Icon className="h-5 w-5 mb-1 shrink-0" />
                      <span className="text-xs leading-tight">{opt.label}</span>
                      <span className="text-[10px] font-normal opacity-80 mt-0.5">
                        {opt.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label
                  htmlFor="room-price-input"
                  className="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Precio mensual (CLP) <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <input
                    id="room-price-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="260.000"
                    value={
                      form.monthlyPrice ? Number(form.monthlyPrice).toLocaleString('es-CL') : ''
                    }
                    onChange={(e) => handleMonthlyPriceChange(e.target.value)}
                    className="w-full min-h-12 pl-9 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  />
                </div>
                {formattedClpPreview && (
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 pl-1">
                    {formattedClpPreview}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="room-deposit-input"
                  className="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Garantía (CLP){' '}
                  <span className="text-[10px] lowercase font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <input
                    id="room-deposit-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="150.000"
                    value={form.deposit ? Number(form.deposit).toLocaleString('es-CL') : ''}
                    onChange={(e) => handleDepositChange(e.target.value)}
                    className="w-full min-h-12 pl-9 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/30 p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-left">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Bath className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Baño Privado</h4>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    {form.hasPrivateBathroom
                      ? 'De uso exclusivo en la pieza'
                      : 'Baño de uso compartido'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={form.hasPrivateBathroom}
                aria-label="Alternar baño privado"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    hasPrivateBathroom: !prev.hasPrivateBathroom,
                  }))
                }
                className="flex min-h-12 items-center justify-center px-1 cursor-pointer"
              >
                <span
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                    form.hasPrivateBathroom ? 'bg-primary' : 'bg-muted-foreground/30',
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                      form.hasPrivateBathroom ? 'translate-x-5' : 'translate-x-0',
                    )}
                  />
                </span>
              </button>
            </div>

            {form.type === 'SHARED' && (
              <div className="rounded-2xl border border-border/80 bg-muted/20 p-3.5 flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Camas en la Habitación</h4>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      Total de camas disponibles para compartir
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-background border border-border/80 rounded-xl p-1 shadow-2xs">
                  <button
                    type="button"
                    disabled={form.totalBeds <= 1}
                    onClick={() => handleBedCountChange(-1)}
                    className="flex min-h-10 min-w-10 items-center justify-center rounded-lg hover:bg-secondary text-foreground disabled:opacity-30 cursor-pointer transition"
                    aria-label="Reducir camas"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-foreground">
                    {form.totalBeds}
                  </span>
                  <button
                    type="button"
                    disabled={form.totalBeds >= 12}
                    onClick={() => handleBedCountChange(1)}
                    className="flex min-h-10 min-w-10 items-center justify-center rounded-lg hover:bg-secondary text-foreground disabled:opacity-30 cursor-pointer transition"
                    aria-label="Aumentar camas"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Fotos de la Habitación
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {form.images.length + newImagePreviews.length} seleccionadas
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {form.images.map((imgUrl, idx) => (
                  <div
                    key={imgUrl}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-muted border border-border/70"
                  >
                    <Image
                      src={imgUrl}
                      alt={`Habitación ${idx + 1}`}
                      fill
                      unoptimized
                      sizes="120px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(idx)}
                      className="absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-destructive transition cursor-pointer shadow-xs"
                      aria-label="Eliminar imagen"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {newImagePreviews.map((previewUrl, idx) => (
                  <div
                    key={previewUrl}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-muted border border-primary/40"
                  >
                    <Image
                      src={previewUrl}
                      alt={`Nueva foto ${idx + 1}`}
                      fill
                      unoptimized
                      sizes="120px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(idx)}
                      className="absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-destructive transition cursor-pointer shadow-xs"
                      aria-label="Eliminar nueva imagen"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <span className="absolute bottom-1 left-1 rounded-md bg-primary/90 text-primary-foreground px-1.5 py-0.5 text-[9px] font-bold">
                      Nueva
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

            <div className="space-y-1.5">
              <label
                htmlFor="room-desc-textarea"
                className="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Descripción y Equipamiento{' '}
                <span className="text-[10px] lowercase font-normal">(opcional)</span>
              </label>
              <textarea
                id="room-desc-textarea"
                rows={3}
                maxLength={800}
                placeholder="Ej: Incluye clóset amplio, escritorio de estudio ergonómico y ventana con luz natural..."
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none leading-relaxed"
              />
            </div>
          </div>

          <div className="border-t border-border/80 bg-card p-4 flex items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 min-h-12 rounded-xl border-border/80 hover:bg-secondary font-semibold text-xs cursor-pointer"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !form.title.trim() || !form.monthlyPrice}
              className="flex-2 min-h-12 bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs rounded-xl shadow-md active:scale-[0.98] transition cursor-pointer disabled:opacity-50 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditing ? 'Guardar Cambios' : 'Publicar Habitación'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
