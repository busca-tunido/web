'use client';

import { Check, Home, Loader2, MapPin, X } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
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
import type { PensionItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import type { PensionDetailDto, ProposalDto } from '@/types/api-contracts';

export type ProposalPreviewComparisonModalProps = {
  isOpen: boolean;
  onClose: () => void;
  pension: PensionItem | PensionDetailDto | null;
  proposal: ProposalDto | null;
  onApprove?: (proposalId: string) => Promise<void>;
  onReject?: (proposalId: string) => Promise<void>;
  isProcessing?: boolean;
};

type PreviewPensionData = {
  title: string;
  description: string;
  address: string;
  neighborhood: string;
  city: string;
  monthlyPrice: number;
  deposit: number;
  waterIncluded: boolean;
  electricityIncluded: boolean;
  gasIncluded: boolean;
  internetIncluded: boolean;
  curfewTime: string;
  guestsAllowed: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  coverPhoto?: string;
  photos: string[];
};

function formatCurrency(val?: number): string {
  if (typeof val !== 'number' || val <= 0) return '$0 CLP';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(val);
}

function resolvePensionData(
  base: PensionItem | PensionDetailDto | null,
  changes?: Record<string, unknown>,
): PreviewPensionData {
  const p = base as Record<string, unknown> | null;
  const c = changes ?? {};

  const basePrice =
    (c.baseMonthlyPrice as number) ??
    (c.monthlyPrice as number) ??
    (c.priceMonthlyClp as number) ??
    (p?.baseMonthlyPrice as number) ??
    (p?.priceMonthlyClp as number) ??
    0;

  const deposit =
    (c.deposit as number) ??
    (c.depositClp as number) ??
    (p?.deposit as number) ??
    (p?.depositClp as number) ??
    0;

  const title = String(c.title ?? p?.title ?? 'Pensión Universitaria');
  const description = String(c.description ?? p?.description ?? '');
  const address = String(c.address ?? p?.address ?? '');
  const neighborhood = String(c.neighborhood ?? p?.neighborhood ?? '');
  const city = String(c.city ?? p?.city ?? 'Chile');

  const waterIncluded = Boolean(c.waterIncluded ?? p?.waterIncluded ?? false);
  const electricityIncluded = Boolean(c.electricityIncluded ?? p?.electricityIncluded ?? false);
  const gasIncluded = Boolean(c.gasIncluded ?? p?.gasIncluded ?? false);
  const internetIncluded = Boolean(c.internetIncluded ?? p?.internetIncluded ?? true);

  const curfewTime = String(
    c.curfewTime ?? c.curfewText ?? p?.curfewTime ?? 'Sin horario estricto',
  );
  const guestsAllowed = Boolean(c.guestsAllowed ?? p?.guestsAllowed ?? true);
  const petsAllowed = Boolean(c.petsAllowed ?? p?.petsAllowed ?? false);
  const smokingAllowed = Boolean(c.smokingAllowed ?? p?.smokingAllowed ?? false);

  const rawPhotos =
    (p?.photos as string[]) ?? (p?.images as Array<{ url: string }>)?.map((img) => img.url) ?? [];
  const cover = rawPhotos[0];

  return {
    title,
    description,
    address,
    neighborhood,
    city,
    monthlyPrice: Number(basePrice),
    deposit: Number(deposit),
    waterIncluded,
    electricityIncluded,
    gasIncluded,
    internetIncluded,
    curfewTime,
    guestsAllowed,
    petsAllowed,
    smokingAllowed,
    coverPhoto: cover,
    photos: rawPhotos,
  };
}

export function ProposalPreviewComparisonModal({
  isOpen,
  onClose,
  pension,
  proposal,
  onApprove,
  onReject,
  isProcessing = false,
}: ProposalPreviewComparisonModalProps) {
  const [mobileActiveTab, setMobileActiveTab] = useState<'BEFORE' | 'AFTER'>('AFTER');

  const beforeData = useMemo(() => resolvePensionData(pension), [pension]);
  const afterData = useMemo(
    () => resolvePensionData(pension, proposal?.proposedChanges),
    [pension, proposal?.proposedChanges],
  );

  const changedKeys = useMemo(() => {
    return new Set(Object.keys(proposal?.proposedChanges ?? {}));
  }, [proposal?.proposedChanges]);

  if (!proposal) return null;

  const renderPensionPreviewCard = (data: PreviewPensionData, isAfter: boolean) => {
    const isPriceChanged =
      isAfter &&
      (changedKeys.has('baseMonthlyPrice') ||
        changedKeys.has('monthlyPrice') ||
        changedKeys.has('priceMonthlyClp'));
    const isDepositChanged =
      isAfter && (changedKeys.has('deposit') || changedKeys.has('depositClp'));
    const isTitleChanged = isAfter && changedKeys.has('title');
    const isDescriptionChanged = isAfter && changedKeys.has('description');
    const isAddressChanged =
      isAfter &&
      (changedKeys.has('address') || changedKeys.has('neighborhood') || changedKeys.has('city'));
    const isCurfewChanged =
      isAfter && (changedKeys.has('curfewTime') || changedKeys.has('curfewText'));
    const isRulesChanged =
      isAfter &&
      (changedKeys.has('guestsAllowed') ||
        changedKeys.has('petsAllowed') ||
        changedKeys.has('smokingAllowed'));
    const isUtilitiesChanged =
      isAfter &&
      (changedKeys.has('waterIncluded') ||
        changedKeys.has('electricityIncluded') ||
        changedKeys.has('gasIncluded') ||
        changedKeys.has('internetIncluded'));

    return (
      <Card
        className={cn(
          'flex flex-col overflow-hidden rounded-xl border bg-card shadow-none transition-all',
          isAfter ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-border/70',
        )}
      >
        <div
          className={cn(
            'flex items-center justify-between px-4 py-2.5 border-b text-xs font-semibold',
            isAfter
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
              : 'bg-muted/40 border-border/60 text-muted-foreground',
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                isAfter ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/60',
              )}
            />
            <span>{isAfter ? 'Después (Sugerencia Aplicada)' : 'Antes (Estado Actual)'}</span>
          </div>
          <Badge
            variant={isAfter ? 'default' : 'outline'}
            className={cn(
              'text-[10px] py-0 px-2 font-medium',
              isAfter ? 'bg-emerald-600 text-white' : 'border-border/80 text-muted-foreground',
            )}
          >
            {isAfter ? 'Vista propuesta' : 'Publicación en vivo'}
          </Badge>
        </div>

        <CardContent className="p-4 sm:p-5 flex flex-col gap-4 text-left">
          <div className="relative aspect-16/9 w-full overflow-hidden rounded-lg bg-muted border border-border/60">
            {data.coverPhoto ? (
              <Image
                src={data.coverPhoto}
                alt={data.title}
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, 400px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Home className="h-8 w-8" />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={cn(
                  'text-base font-bold text-foreground leading-snug transition-colors',
                  isTitleChanged && 'text-emerald-600 dark:text-emerald-400',
                )}
              >
                {data.title}
              </h3>
              {isTitleChanged && (
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[9px] shrink-0">
                  Modificado
                </Badge>
              )}
            </div>

            <div
              className={cn(
                'flex items-center gap-1.5 text-xs text-muted-foreground',
                isAddressChanged && 'text-emerald-600 dark:text-emerald-400 font-medium',
              )}
            >
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {data.address ? `${data.address}, ` : ''}
                {data.neighborhood ? `${data.neighborhood}, ` : ''}
                {data.city}
              </span>
            </div>
          </div>

          <div
            className={cn(
              'rounded-lg border p-3 flex items-center justify-between gap-2',
              isPriceChanged || isDepositChanged
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : 'border-border/60 bg-muted/20',
            )}
          >
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Precio mensual
              </span>
              <span
                className={cn(
                  'text-base font-extrabold text-foreground',
                  isPriceChanged && 'text-emerald-600 dark:text-emerald-400',
                )}
              >
                {formatCurrency(data.monthlyPrice)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Garantía
              </span>
              <span
                className={cn(
                  'text-xs font-semibold text-foreground',
                  isDepositChanged && 'text-emerald-600 dark:text-emerald-400',
                )}
              >
                {data.deposit > 0 ? formatCurrency(data.deposit) : 'Sin garantía'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Servicios Básicos
              </span>
              {isUtilitiesChanged && (
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[9px]">
                  Cambios
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                className={cn(
                  'flex items-center gap-1.5 p-2 rounded-md border border-border/50 bg-background',
                  isAfter &&
                    changedKeys.has('waterIncluded') &&
                    'border-emerald-500/40 bg-emerald-500/5',
                )}
              >
                <span className={data.waterIncluded ? 'text-emerald-600' : 'text-muted-foreground'}>
                  {data.waterIncluded ? '✓' : '✗'}
                </span>
                <span className="text-foreground">
                  Agua {data.waterIncluded ? 'incluida' : 'no incluida'}
                </span>
              </div>

              <div
                className={cn(
                  'flex items-center gap-1.5 p-2 rounded-md border border-border/50 bg-background',
                  isAfter &&
                    changedKeys.has('electricityIncluded') &&
                    'border-emerald-500/40 bg-emerald-500/5',
                )}
              >
                <span
                  className={
                    data.electricityIncluded ? 'text-emerald-600' : 'text-muted-foreground'
                  }
                >
                  {data.electricityIncluded ? '✓' : '✗'}
                </span>
                <span className="text-foreground">
                  Luz {data.electricityIncluded ? 'incluida' : 'no incluida'}
                </span>
              </div>

              <div
                className={cn(
                  'flex items-center gap-1.5 p-2 rounded-md border border-border/50 bg-background',
                  isAfter &&
                    changedKeys.has('gasIncluded') &&
                    'border-emerald-500/40 bg-emerald-500/5',
                )}
              >
                <span className={data.gasIncluded ? 'text-emerald-600' : 'text-muted-foreground'}>
                  {data.gasIncluded ? '✓' : '✗'}
                </span>
                <span className="text-foreground">
                  Gas {data.gasIncluded ? 'incluido' : 'no incluido'}
                </span>
              </div>

              <div
                className={cn(
                  'flex items-center gap-1.5 p-2 rounded-md border border-border/50 bg-background',
                  isAfter &&
                    changedKeys.has('internetIncluded') &&
                    'border-emerald-500/40 bg-emerald-500/5',
                )}
              >
                <span
                  className={data.internetIncluded ? 'text-emerald-600' : 'text-muted-foreground'}
                >
                  {data.internetIncluded ? '✓' : '✗'}
                </span>
                <span className="text-foreground">
                  WiFi {data.internetIncluded ? 'incluido' : 'no incluido'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Reglas y Convivencia
              </span>
              {(isCurfewChanged || isRulesChanged) && (
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[9px]">
                  Cambios
                </Badge>
              )}
            </div>
            <div className="space-y-1.5 text-xs text-foreground bg-muted/20 p-2.5 rounded-lg border border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Horario de llegada:</span>
                <span
                  className={cn(
                    'font-medium',
                    isCurfewChanged && 'text-emerald-600 dark:text-emerald-400 font-bold',
                  )}
                >
                  {data.curfewTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Visitas:</span>
                <span
                  className={cn(
                    'font-medium',
                    isAfter &&
                      changedKeys.has('guestsAllowed') &&
                      'text-emerald-600 dark:text-emerald-400 font-bold',
                  )}
                >
                  {data.guestsAllowed ? 'Permitidas' : 'No permitidas'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Mascotas:</span>
                <span
                  className={cn(
                    'font-medium',
                    isAfter &&
                      changedKeys.has('petsAllowed') &&
                      'text-emerald-600 dark:text-emerald-400 font-bold',
                  )}
                >
                  {data.petsAllowed ? 'Permitidas' : 'No permitidas'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Fumar:</span>
                <span
                  className={cn(
                    'font-medium',
                    isAfter &&
                      changedKeys.has('smokingAllowed') &&
                      'text-emerald-600 dark:text-emerald-400 font-bold',
                  )}
                >
                  {data.smokingAllowed ? 'Permitido' : 'Prohibido'}
                </span>
              </div>
            </div>
          </div>

          {data.description && (
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Descripción
              </span>
              <p
                className={cn(
                  'text-xs text-muted-foreground leading-relaxed line-clamp-3',
                  isDescriptionChanged && 'text-foreground font-medium',
                )}
              >
                {data.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const isPending = proposal.status === 'PENDING';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-background rounded-2xl">
        <DialogHeader className="text-left space-y-1 pb-2 border-b border-border/50">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
              Comparativa de Vista Previa: Sugerencia #{proposal.id.slice(0, 8)}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Compara cómo se visualiza tu pensión actualmente frente a los cambios sugeridos por la
            comunidad estudiantil.
          </DialogDescription>
        </DialogHeader>

        {proposal.submissionNotes && (
          <div className="rounded-lg bg-secondary/50 p-3 text-xs text-foreground leading-relaxed border border-border/60">
            <span className="font-semibold text-muted-foreground block mb-0.5 text-[11px]">
              Comentario del estudiante postulante:
            </span>
            &ldquo;{proposal.submissionNotes}&rdquo;
          </div>
        )}

        <div className="flex md:hidden flex-col gap-3">
          <div className="flex rounded-lg bg-muted/60 p-1 border border-border/60">
            <button
              type="button"
              onClick={() => setMobileActiveTab('BEFORE')}
              className={cn(
                'flex-1 py-1.5 text-xs font-semibold rounded-md transition text-center cursor-pointer',
                mobileActiveTab === 'BEFORE'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              1. Estado Actual (Antes)
            </button>
            <button
              type="button"
              onClick={() => setMobileActiveTab('AFTER')}
              className={cn(
                'flex-1 py-1.5 text-xs font-semibold rounded-md transition text-center cursor-pointer',
                mobileActiveTab === 'AFTER'
                  ? 'bg-background text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              2. Con Sugerencia (Después)
            </button>
          </div>

          <div>
            {mobileActiveTab === 'BEFORE' && renderPensionPreviewCard(beforeData, false)}
            {mobileActiveTab === 'AFTER' && renderPensionPreviewCard(afterData, true)}
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-2 gap-4 items-start">
          {renderPensionPreviewCard(beforeData, false)}
          {renderPensionPreviewCard(afterData, true)}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/50">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full sm:w-auto text-xs font-semibold cursor-pointer"
          >
            Cerrar Vista Previa
          </Button>

          {isPending && onApprove && onReject && (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isProcessing}
                onClick={async () => {
                  await onReject(proposal.id);
                  onClose();
                }}
                className="flex-1 sm:flex-initial text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive border-border/80 cursor-pointer"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                <span>Rechazar Sugerencia</span>
              </Button>

              <Button
                type="button"
                disabled={isProcessing}
                onClick={async () => {
                  await onApprove(proposal.id);
                  onClose();
                }}
                className="flex-1 sm:flex-initial text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-none cursor-pointer"
              >
                {isProcessing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : (
                  <Check className="h-3.5 w-3.5 mr-1" />
                )}
                <span>Aprobar y Aplicar</span>
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
