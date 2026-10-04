'use client';

import { Loader2 } from 'lucide-react';
import { NetworkErrorBanner, NetworkErrorState } from '@/components/common/network-error-state';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { usePensionDetail } from '@/hooks/use-pension-detail';
import type { PensionItem } from '@/lib/types';
import { PensionDetailContent } from './pension-detail-content';

type PensionDetailModalProps = {
  pension?: PensionItem | null;
  pensionId?: string | null;
  isOpen: boolean;
  onClose: () => void;
};

export function PensionDetailModal({
  pension: initialPension = null,
  pensionId = null,
  isOpen,
  onClose,
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
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[92vh] max-w-lg md:max-w-xl mx-auto md:rounded-3xl bg-card border-border p-6 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-3 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Cargando detalles de la pensión...</p>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  if (!activePension && detailError) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[92vh] max-w-lg md:max-w-xl mx-auto md:rounded-3xl bg-card border-border p-6">
          <NetworkErrorState
            message={detailError}
            onRetry={loadLivePension}
            isRetrying={isLoadingDetail}
          />
        </DrawerContent>
      </Drawer>
    );
  }

  if (!activePension) return null;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        id="pension-detail-drawer"
        className="max-h-[92vh] max-w-lg md:max-w-4xl mx-auto bg-card border-border text-foreground overflow-hidden flex flex-col md:rounded-3xl"
      >
        <div className="mx-auto mt-2.5 mb-1 h-1.5 w-12 rounded-full bg-muted-foreground/30 shrink-0 md:hidden" />

        <div className="overflow-y-auto flex-1 px-4 md:px-8 pt-2 pb-6">
          {detailError && (
            <NetworkErrorBanner
              message={detailError}
              onRetry={loadLivePension}
              isRetrying={isLoadingDetail}
              className="mb-3"
            />
          )}

          <PensionDetailContent pension={activePension} onBack={onClose} showBackButton />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
