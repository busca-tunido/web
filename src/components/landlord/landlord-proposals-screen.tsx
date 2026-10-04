'use client';

import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  RefreshCw,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLandlord } from '@/contexts/landlord-context';
import { isApiSuccess } from '@/lib/api-response';
import type { PensionItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { proposalsService } from '@/services/proposals.service';
import type { PensionDetailDto, ProposalDto } from '@/types/api-contracts';

export type LandlordProposalsScreenProps = {
  pensionId?: string;
  pension?: PensionItem | PensionDetailDto | null;
  className?: string;
};

type ProposalFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

const FIELD_LABELS: Record<string, string> = {
  baseMonthlyPrice: 'Precio mensual',
  monthlyPrice: 'Precio mensual',
  priceMonthlyClp: 'Precio mensual',
  deposit: 'Garantía requerida',
  depositClp: 'Garantía requerida',
  waterIncluded: 'Agua potable incluida',
  electricityIncluded: 'Electricidad incluida',
  gasIncluded: 'Gas incluido',
  internetIncluded: 'Internet / WiFi incluido',
  curfewTime: 'Horario límite / Llegada',
  curfewText: 'Horario límite / Llegada',
  guestsAllowed: 'Visitas permitidas',
  petsAllowed: 'Mascotas permitidas',
  smokingAllowed: 'Permite fumar',
  title: 'Título de la pensión',
  description: 'Descripción',
  address: 'Dirección',
  neighborhood: 'Barrio / Comuna',
  city: 'Ciudad',
  amenitiesToAdd: 'Servicios a incorporar',
  amenitiesToRemove: 'Servicios a remover',
};

const AMENITY_LABELS: Record<string, string> = {
  'wifi-alta-velocidad': 'WiFi Alta Velocidad',
  'comida-incluida': 'Comida Incluida',
  lavanderia: 'Lavandería',
  'sala-estudio': 'Sala de Estudio',
  'bano-privado': 'Baño Privado',
  'cocina-equipada': 'Cocina Equipada',
  calefaccion: 'Calefacción',
  estacionamiento: 'Estacionamiento',
  'limpieza-incluida': 'Aseo / Limpieza',
};

function getAmenityLabel(slug: string): string {
  return AMENITY_LABELS[slug] ?? slug;
}

function formatValue(key: string, val: unknown): string {
  if (val === null || val === undefined) return 'No especificado';
  if (typeof val === 'boolean') return val ? 'Sí' : 'No';
  if (typeof val === 'number') {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('price') ||
      lowerKey.includes('deposit') ||
      lowerKey.includes('precio') ||
      lowerKey.includes('garantia')
    ) {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
      }).format(val);
    }
    return String(val);
  }
  if (Array.isArray(val)) {
    return val.map((item) => getAmenityLabel(String(item))).join(', ');
  }
  return String(val);
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function LandlordProposalsScreen({
  pensionId: propPensionId,
  pension: propPension,
  className,
}: LandlordProposalsScreenProps) {
  const landlordContext = useLandlord();
  const selectedPension = propPension ?? landlordContext.selectedPension;
  const effectivePensionId = propPensionId ?? selectedPension?.id ?? '';

  const [proposals, setProposals] = useState<ProposalDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ProposalFilter>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadProposals = useCallback(async () => {
    if (!effectivePensionId) {
      setProposals([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await proposalsService.fetchPensionProposals(effectivePensionId);
      if (isApiSuccess(response)) {
        setProposals(response.data ?? []);
      } else {
        setErrorMessage(response.message || 'No fue posible cargar las sugerencias.');
      }
    } catch {
      setErrorMessage('Ocurrió un error al cargar las sugerencias comunitarias.');
    } finally {
      setIsLoading(false);
    }
  }, [effectivePensionId]);

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  const handleReview = async (proposalId: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessingId(proposalId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await proposalsService.reviewProposal(proposalId, {
        action: status === 'APPROVED' ? 'APPROVE' : 'REJECT',
        reviewNotes:
          status === 'APPROVED' ? 'Aprobada por el propietario' : 'Rechazada por el propietario',
      });

      if (isApiSuccess(response)) {
        setSuccessMessage(
          status === 'APPROVED'
            ? 'Sugerencia aprobada. Los cambios han sido aplicados a tu pensión.'
            : 'Sugerencia rechazada correctamente.',
        );
        await Promise.all([
          loadProposals(),
          landlordContext.refetchProposals(),
          status === 'APPROVED' && effectivePensionId
            ? landlordContext.refetchPensions(effectivePensionId)
            : Promise.resolve(),
        ]);
      } else {
        setErrorMessage(response.message || 'No fue posible procesar la sugerencia.');
      }
    } catch {
      setErrorMessage('Error de red al actualizar la sugerencia.');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredProposals = useMemo(() => {
    if (activeFilter === 'ALL') return proposals;
    return proposals.filter((p) => p.status === activeFilter);
  }, [proposals, activeFilter]);

  const pendingCount = useMemo(
    () => proposals.filter((p) => p.status === 'PENDING').length,
    [proposals],
  );

  return (
    <div className={cn('space-y-6 w-full text-left', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Sugerencias de la Comunidad
            </h1>
            {pendingCount > 0 && (
              <Badge
                variant="outline"
                className="border-border/80 bg-secondary text-muted-foreground text-xs font-semibold"
              >
                {pendingCount} {pendingCount === 1 ? 'pendiente' : 'pendientes'}
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Revisa, aprueba o rechaza actualizaciones de servicios y datos sugeridos por estudiantes
            universitarios
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={loadProposals}
          disabled={isLoading}
          className="self-start sm:self-auto min-h-[40px] px-3.5 text-xs font-semibold border-border/80 hover:bg-secondary cursor-pointer"
        >
          <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', isLoading && 'animate-spin')} />
          <span>Actualizar</span>
        </Button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(
          [
            { id: 'ALL', label: 'Todas', count: proposals.length },
            { id: 'PENDING', label: 'Pendientes', count: pendingCount },
            {
              id: 'APPROVED',
              label: 'Aprobadas',
              count: proposals.filter((p) => p.status === 'APPROVED').length,
            },
            {
              id: 'REJECTED',
              label: 'Rechazadas',
              count: proposals.filter((p) => p.status === 'REJECTED').length,
            },
          ] as const
        ).map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setActiveFilter(filter.id)}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border cursor-pointer',
              activeFilter === filter.id
                ? 'bg-foreground text-background border-foreground shadow-2xs'
                : 'border-border/70 bg-card text-muted-foreground hover:bg-secondary hover:text-foreground',
            )}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="p-1 hover:opacity-75 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 flex items-center justify-between text-destructive text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:opacity-75 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 w-full rounded-2xl bg-muted/40" />
          <div className="h-32 w-full rounded-2xl bg-muted/40" />
        </div>
      ) : filteredProposals.length === 0 ? (
        <Card className="border-border/60 bg-card/60 p-8 text-center rounded-2xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mx-auto mb-3">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-foreground">
            No hay sugerencias en esta sección
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {activeFilter === 'PENDING'
              ? 'Estás al día. No hay sugerencias pendientes de revisión para esta pensión.'
              : 'No se encontraron sugerencias comunitarias con el filtro seleccionado.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => {
            const isPending = proposal.status === 'PENDING';
            const isApproved = proposal.status === 'APPROVED';
            const isProcessing = processingId === proposal.id;
            const changes = proposal.proposedChanges ?? {};

            return (
              <Card
                key={proposal.id}
                className={cn(
                  'rounded-xl border transition-all shadow-none overflow-hidden bg-card',
                  isPending ? 'border-border/80' : 'border-border/50 opacity-90',
                )}
              >
                <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-2 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        Sugerencia #{proposal.id.slice(0, 8)}
                      </span>
                      <span className="text-border">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(proposal.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <Badge
                          variant="outline"
                          className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-semibold"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Pendiente de Revisión
                        </Badge>
                      )}
                      {isApproved && (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Aprobada
                        </Badge>
                      )}
                      {proposal.status === 'REJECTED' && (
                        <Badge
                          variant="outline"
                          className="border-destructive/30 bg-destructive/10 text-destructive text-[10px] font-semibold"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Rechazada
                        </Badge>
                      )}
                    </div>
                  </div>

                  {proposal.submissionNotes && (
                    <div className="rounded-lg bg-secondary/50 p-3 text-xs text-foreground leading-relaxed border border-border/60">
                      <span className="font-semibold text-muted-foreground block mb-0.5 text-[11px]">
                        Comentario del estudiante:
                      </span>
                      &ldquo;{proposal.submissionNotes}&rdquo;
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Cambios propuestos:
                    </span>
                    <div className="grid grid-cols-1 divide-y divide-border/40 rounded-lg border border-border/60 overflow-hidden bg-background">
                      {Object.entries(changes).map(([key, val]) => (
                        <div
                          key={key}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 text-xs"
                        >
                          <span className="font-medium text-foreground sm:w-1/3">
                            {FIELD_LABELS[key] ?? key}
                          </span>
                          <div className="flex items-center gap-2 text-muted-foreground flex-1">
                            <span className="line-through text-muted-foreground/80">
                              {formatValue(
                                key,
                                selectedPension
                                  ? (selectedPension as unknown as Record<string, unknown>)[key]
                                  : undefined,
                              )}
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="font-semibold text-foreground">
                              {formatValue(key, val)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isPending && (
                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/40">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => handleReview(proposal.id, 'REJECTED')}
                        className="min-h-[38px] px-4 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive border-border/80 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5 mr-1.5" />
                        <span>Rechazar</span>
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => handleReview(proposal.id, 'APPROVED')}
                        className="min-h-[38px] px-4 text-xs font-semibold bg-foreground text-background hover:opacity-90 shadow-none cursor-pointer"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        ) : (
                          <Check className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        <span>Aprobar Cambios</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
