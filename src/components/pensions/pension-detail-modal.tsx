'use client';

import { Loader2 } from 'lucide-react';
import { NetworkErrorBanner, NetworkErrorState } from '@/components/common/network-error-state';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { usePensionDetail } from '@/hooks/use-pension-detail';
import type { FavoritePensionSummaryDto, PensionItem } from '@/lib/types';
import { PensionDetailContent, type PensionDetailMode } from './pension-detail-content';

type PensionDetailModalProps = {
  pension?: PensionItem | FavoritePensionSummaryDto | null;
  pensionId?: string | null;
  isOpen: boolean;
  onClose: () => void;
  mode?: PensionDetailMode;
};

export function PensionDetailModal({
  pension: initialPension = null,
  pensionId = null,
  isOpen,
  onClose,
  mode = 'detail',
}: PensionDetailModalProps) {
  const targetId = isOpen ? (initialPension?.id ?? pensionId ?? null) : null;

  const {
    activePension,
    isLoading: isLoadingDetail,
    error: detailError,
    refetch: loadLivePension,
  } = usePensionDetail(targetId, initialPension);

  if (!isOpen) return null;

  if (!activePension && isLoadingDetail) {
    return (
      <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <ResponsiveModalContent
          showClose={false}
          className="max-w-lg md:max-w-xl mx-auto md:rounded-3xl bg-card border-border p-6 flex flex-col items-center justify-center"
        >
          <ResponsiveModalTitle className="sr-only">
            Cargando detalles de la pensión
          </ResponsiveModalTitle>
          <div className="flex flex-col items-center gap-3 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Cargando detalles de la pensión...</p>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    );
  }

  if (!activePension && detailError) {
    return (
      <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <ResponsiveModalContent
          showClose={false}
          className="max-w-lg md:max-w-xl mx-auto md:rounded-3xl bg-card border-border p-6"
        >
          <ResponsiveModalTitle className="sr-only">
            Error al cargar detalles de la pensión
          </ResponsiveModalTitle>
          <NetworkErrorState
            message={detailError}
            onRetry={loadLivePension}
            isRetrying={isLoadingDetail}
          />
        </ResponsiveModalContent>
      </ResponsiveModal>
    );
  }

  if (!activePension) return null;

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveModalContent
        id="pension-detail-drawer"
        showClose={false}
        className="max-w-lg md:max-w-4xl md:max-h-[88vh] mx-auto bg-card border-border text-foreground overflow-hidden flex flex-col md:rounded-3xl"
      >
        <ResponsiveModalTitle className="sr-only">
          Detalle de {activePension.title}
        </ResponsiveModalTitle>

        <div className="overflow-y-auto scrollbar-subtle flex-1 min-h-0 px-4 md:px-8 pt-2 pb-[calc(2rem+env(safe-area-inset-bottom))] md:pb-6 md:pt-8">
          {detailError && (
            <NetworkErrorBanner
              message={detailError}
              onRetry={loadLivePension}
              isRetrying={isLoadingDetail}
              className="mb-3"
            />
          )}

          <PensionDetailContent
            pension={activePension}
            isLoadingDetail={isLoadingDetail}
            onBack={onClose}
            mode={mode}
          />
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
