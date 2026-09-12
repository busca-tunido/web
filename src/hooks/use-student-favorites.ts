'use client';

import { useCallback, useEffect, useState } from 'react';
import { isApiSuccess } from '@/lib/api-response';
import { favoritesService } from '@/services/favorites.service';
import type { PensionItemDto } from '@/types/api-contracts';

export function useStudentFavorites(initialFavorites?: string[]) {
  const [favorites, setFavorites] = useState<string[]>(initialFavorites ?? []);
  const [favoritePensions, setFavoritePensions] = useState<PensionItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await favoritesService.fetchStudentFavorites();
      if (isApiSuccess(res)) {
        setFavoritePensions(res.data);
        const ids = res.data.map((p) => p.id);
        setFavorites(ids);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('tunido_favs', JSON.stringify(ids));
            window.dispatchEvent(new CustomEvent('tunido_favs_updated', { detail: ids }));
          } catch {}
        }
      }
    } catch {
      setErrorMessage('No se pudo cargar la lista de favoritos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback(
    async (pensionId: string): Promise<boolean> => {
      const wasFav = favorites.includes(pensionId);
      const previousFavorites = [...favorites];
      const previousPensions = [...favoritePensions];

      setFavorites((prev) =>
        wasFav ? prev.filter((id) => id !== pensionId) : [...prev, pensionId],
      );
      if (wasFav) {
        setFavoritePensions((prev) => prev.filter((p) => p.id !== pensionId));
      }

      setErrorMessage(null);

      try {
        const res = await favoritesService.toggleFavorite(pensionId, wasFav);
        if (!isApiSuccess(res)) {
          setFavorites(previousFavorites);
          setFavoritePensions(previousPensions);
          setErrorMessage('No se pudo actualizar tu lista de favoritos. Reintentando...');
          return wasFav;
        }
        if (typeof window !== 'undefined') {
          try {
            const nextFavs = wasFav
              ? previousFavorites.filter((id) => id !== pensionId)
              : [...previousFavorites, pensionId];
            localStorage.setItem('tunido_favs', JSON.stringify(nextFavs));
            window.dispatchEvent(new CustomEvent('tunido_favs_updated', { detail: nextFavs }));
          } catch {}
        }
        return res.data.isFavorite;
      } catch {
        setFavorites(previousFavorites);
        setFavoritePensions(previousPensions);
        setErrorMessage('No se pudo actualizar tu lista de favoritos. Reintentando...');
        return wasFav;
      }
    },
    [favorites, favoritePensions],
  );

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    favorites,
    favoritePensions,
    isFavorite,
    toggleFavorite,
    isLoading,
    errorMessage,
    clearError,
    refreshFavorites: loadFavorites,
  };
}
