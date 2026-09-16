'use client';

import { useCallback, useState } from 'react';
import { isApiSuccess } from '@/lib/api-response';
import { submitPensionProposal } from '@/services/proposals.service';
import type { CreateProposalDto } from '@/types/api-contracts';

export function useSuggestEdit(pensionId: string) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<boolean>(false);

  const submitProposal = useCallback(
    async (
      submissionNotes: string,
      proposedChanges: Record<string, unknown>,
    ): Promise<boolean> => {
      if (submissionNotes.trim().length < 5) {
        setErrorMessage('Por favor incluye una breve explicación para el equipo de moderación.');
        return false;
      }

      setIsSubmitting(true);
      setErrorMessage(null);

      try {
        const res = await submitPensionProposal(pensionId, {
          type: 'FULL_UPDATE',
          proposedChanges: proposedChanges as CreateProposalDto['proposedChanges'],
          submissionNotes: submissionNotes.trim(),
        });

        if (isApiSuccess(res)) {
          setSuccessBanner(true);
          return true;
        }

        setErrorMessage(res.message || 'Error al enviar la sugerencia.');
        return false;
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Error inesperado al enviar la sugerencia.',
        );
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [pensionId],
  );

  const resetState = useCallback(() => {
    setIsSubmitting(false);
    setErrorMessage(null);
    setSuccessBanner(false);
  }, []);

  return {
    isSubmitting,
    errorMessage,
    successBanner,
    submitProposal,
    resetState,
  };
}
