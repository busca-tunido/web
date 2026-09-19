'use client';

import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  User,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { isApiSuccess } from '@/lib/api-response';
import { pensionsService } from '@/services/pensions.service';
import { proposalsService } from '@/services/proposals.service';
import type { PensionDetailDto, ProposalDto } from '@/types/api-contracts';

export type LandlordProposalsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  pensionId: string;
  onProposalReviewed?: () => void;
};

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

function getCurrentValue(key: string, pension: PensionDetailDto | null): unknown {
  if (!pension) return undefined;
  switch (key) {
    case 'baseMonthlyPrice':
    case 'monthlyPrice':
    case 'priceMonthlyClp':
      return pension.baseMonthlyPrice;
    case 'deposit':
    case 'depositClp':
      return pension.deposit;
    case 'waterIncluded':
      return pension.waterIncluded;
    case 'electricityIncluded':
      return pension.electricityIncluded;
    case 'gasIncluded':
      return pension.gasIncluded;
    case 'internetIncluded':
      return pension.internetIncluded;
    case 'curfewTime':
    case 'curfewText':
      return pension.curfewTime;
    case 'guestsAllowed':
      return pension.guestsAllowed;
    case 'petsAllowed':
      return pension.petsAllowed;
    case 'smokingAllowed':
      return pension.smokingAllowed;
    case 'title':
      return pension.title;
    case 'description':
      return pension.description;
    case 'address':
      return pension.address;
    case 'neighborhood':
      return pension.neighborhood;
    case 'city':
      return pension.city;
    default:
      return (pension as Record<string, unknown>)[key];
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function LandlordProposalsDrawer({
  isOpen,
  onClose,
  pensionId,
  onProposalReviewed,
}: LandlordProposalsDrawerProps) {
  const [proposals, setProposals] = useState<ProposalDto[]>([]);
  const [pension, setPension] = useState<PensionDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    if (!pensionId) return;
    setIsLoading(true);
    setFetchError(null);
    setActionError(null);

    const [proposalsRes, pensionRes] = await Promise.all([
      proposalsService.fetchPensionProposals(pensionId),
      pensionsService.fetchPensionDetail(pensionId),
    ]);

    if (isApiSuccess(proposalsRes)) {
      const pendingItems = proposalsRes.data.filter((p) => !p.status || p.status === 'PENDING');
      setProposals(pendingItems);
    } else {
      setFetchError(proposalsRes.message ?? 'Error al cargar las sugerencias de la pensión.');
    }

    if (isApiSuccess(pensionRes)) {
      setPension(pensionRes.data);
    }

    setIsLoading(false);
  }, [pensionId]);

  useEffect(() => {
    if (isOpen && pensionId) {
      loadData();
    }
  }, [isOpen, pensionId, loadData]);

  const handleReview = async (proposalId: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessingIds((prev) => new Set(prev).add(proposalId));
    setActionError(null);

    const response = await proposalsService.reviewProposal(proposalId, {
      action: status === 'APPROVED' ? 'APPROVE' : 'REJECT',
    });

    setProcessingIds((prev) => {
      const updated = new Set(prev);
      updated.delete(proposalId);
      return updated;
    });

    if (isApiSuccess(response)) {
      setProposals((prev) => prev.filter((item) => item.id !== proposalId));
      setFeedbackMessage(
        status === 'APPROVED' ? 'Sugerencia aprobada exitosamente.' : 'Sugerencia descartada.',
      );
      onProposalReviewed?.();
    } else {
      setActionError(
        response.message ?? 'No se pudo completar la acción. Por favor intenta nuevamente.',
      );
    }
  };

  const pendingCount = proposals.length;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        id="landlord-proposals-drawer"
        className="max-h-[92vh] max-w-lg md:max-w-2xl mx-auto md:rounded-3xl bg-card border-border text-foreground flex flex-col overflow-hidden"
      >
        <div className="mx-auto mt-2.5 mb-1 h-1.5 w-12 rounded-full bg-muted-foreground/30 shrink-0" />

        <DrawerHeader className="text-left px-4 pt-3 pb-3 border-b border-border/60">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <DrawerTitle className="text-base font-bold text-foreground">
                Sugerencias de la Comunidad
              </DrawerTitle>
              {pendingCount > 0 && (
                <Badge
                  variant="outline"
                  className="border-primary/40 bg-primary/10 text-primary text-[11px] font-semibold"
                >
                  {pendingCount} {pendingCount === 1 ? 'pendiente' : 'pendientes'}
                </Badge>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition cursor-pointer"
              aria-label="Cerrar sugerencias"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <DrawerDescription className="text-xs text-muted-foreground mt-0.5">
            Revisa y aprueba mejoras propuestas por estudiantes que conocen tu alojamiento
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-4">
          {feedbackMessage && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center justify-between gap-2 text-emerald-600 dark:text-emerald-400 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{feedbackMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackMessage(null)}
                className="text-emerald-600/70 hover:text-emerald-600 p-1"
                aria-label="Cerrar aviso"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {actionError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 flex items-start gap-2 text-destructive animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-xs font-medium flex-1">{actionError}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs font-medium">Cargando sugerencias de la comunidad...</p>
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-xs text-muted-foreground">{fetchError}</p>
              <Button
                type="button"
                variant="outline"
                onClick={loadData}
                className="min-h-[48px] px-4 text-xs font-semibold"
              >
                <RefreshCw className="h-4 w-4 mr-1.5" />
                Reintentar
              </Button>
            </div>
          ) : proposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-foreground">¡Tu ficha está al día!</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                No hay sugerencias de la comunidad pendientes de revisión para este alojamiento.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="mt-6 min-h-[48px] px-6 text-xs font-semibold"
              >
                Entendido
              </Button>
            </div>
          ) : (
            proposals.map((proposal) => {
              const isProcessing = processingIds.has(proposal.id);
              const changesEntries = Object.entries(proposal.proposedChanges ?? {});

              return (
                <Card
                  key={proposal.id}
                  className="border-border/80 bg-card shadow-xs overflow-hidden"
                >
                  <CardHeader className="p-3.5 pb-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1.5 font-medium">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Estudiante de la comunidad</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{formatDate(proposal.createdAt)}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-3.5 pt-0 space-y-3">
                    {proposal.submissionNotes && (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-start gap-2.5">
                        <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div className="flex-1 text-xs">
                          <span className="font-semibold text-foreground block mb-0.5">
                            Motivo de la sugerencia:
                          </span>
                          <p className="text-muted-foreground leading-relaxed italic">
                            "{proposal.submissionNotes}"
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Comparativa de Cambios
                      </span>

                      {changesEntries.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">
                          Sin modificaciones directas en campos catalogados.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {changesEntries.map(([key, val]) => {
                            if (key === 'amenitiesToAdd' && Array.isArray(val) && val.length > 0) {
                              return (
                                <div
                                  key={key}
                                  className="rounded-xl border border-border/60 bg-muted/20 p-2.5 space-y-1.5"
                                >
                                  <span className="text-[11px] font-semibold text-muted-foreground block">
                                    Servicios a incorporar:
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {val.map((amenitySlug) => (
                                      <span
                                        key={String(amenitySlug)}
                                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                                      >
                                        <Plus className="h-3 w-3" />
                                        {getAmenityLabel(String(amenitySlug))}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            }

                            if (
                              key === 'amenitiesToRemove' &&
                              Array.isArray(val) &&
                              val.length > 0
                            ) {
                              return (
                                <div
                                  key={key}
                                  className="rounded-xl border border-border/60 bg-muted/20 p-2.5 space-y-1.5"
                                >
                                  <span className="text-[11px] font-semibold text-muted-foreground block">
                                    Servicios a remover:
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {val.map((amenitySlug) => (
                                      <span
                                        key={String(amenitySlug)}
                                        className="inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive line-through"
                                      >
                                        <X className="h-3 w-3" />
                                        {getAmenityLabel(String(amenitySlug))}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            }

                            const currentVal = getCurrentValue(key, pension);
                            const hasCurrentVal = currentVal !== undefined && currentVal !== null;

                            return (
                              <div
                                key={key}
                                className="rounded-xl border border-border/60 bg-muted/20 p-2.5 space-y-1"
                              >
                                <span className="text-[11px] font-semibold text-muted-foreground block">
                                  {FIELD_LABELS[key] ?? key}
                                </span>
                                <div className="flex items-center gap-2 text-xs flex-wrap">
                                  {hasCurrentVal ? (
                                    <>
                                      <span className="inline-flex items-center rounded-md bg-destructive/10 px-2 py-0.5 text-destructive font-medium line-through">
                                        {formatValue(key, currentVal)}
                                      </span>
                                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                      <span className="inline-flex items-center rounded-md bg-emerald-500/15 px-2 py-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                                        {formatValue(key, val)}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="inline-flex items-center rounded-md bg-emerald-500/15 px-2 py-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                                      {formatValue(key, val)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border/60">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isProcessing}
                        onClick={() => handleReview(proposal.id, 'REJECTED')}
                        className="flex-1 min-h-[48px] border-border text-destructive hover:bg-destructive/10 hover:text-destructive text-xs font-semibold cursor-pointer"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        ) : (
                          <X className="h-4 w-4 mr-1.5" />
                        )}
                        Descartar
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        disabled={isProcessing}
                        onClick={() => handleReview(proposal.id, 'APPROVED')}
                        className="flex-1 min-h-[48px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        ) : (
                          <Check className="h-4 w-4 mr-1.5" />
                        )}
                        Aprobar Sugerencia
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
