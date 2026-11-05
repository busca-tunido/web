'use client';

import { useCallback } from 'react';
import { useOptionalNavigation } from '@/contexts/navigation-context';
import { useAuth } from '@/lib/auth-context';

export type FavoriteButtonState = 'UNAUTHENTICATED' | 'AUTHENTICATED';

export type FavoriteActionMachine = {
  state: FavoriteButtonState;
  isFavorite: (pensionId: string) => boolean;
  onFavoriteClick: (pensionId: string, event?: React.MouseEvent) => void;
};

export function useFavoriteAction(): FavoriteActionMachine {
  const { user, isFavorite: checkAuthFavorite, toggleFavorite: authToggleFavorite } = useAuth();
  const navigation = useOptionalNavigation();
  const openAuthModal = navigation?.openAuthModal;

  const state: FavoriteButtonState = user ? 'AUTHENTICATED' : 'UNAUTHENTICATED';

  const isFavorite = useCallback(
    (pensionId: string): boolean => {
      if (state === 'UNAUTHENTICATED') {
        return false;
      }
      return checkAuthFavorite(pensionId);
    },
    [state, checkAuthFavorite],
  );

  const onFavoriteClick = useCallback(
    (pensionId: string, event?: React.MouseEvent): void => {
      event?.stopPropagation();
      event?.preventDefault();

      switch (state) {
        case 'UNAUTHENTICATED':
          openAuthModal?.();
          break;
        case 'AUTHENTICATED':
          authToggleFavorite(pensionId);
          break;
      }
    },
    [state, openAuthModal, authToggleFavorite],
  );

  return {
    state,
    isFavorite,
    onFavoriteClick,
  };
}
