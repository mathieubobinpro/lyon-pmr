import { useState, useCallback } from 'react';
import type { Favorite } from '../types';
import { storage } from '../lib/storage';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>(() => storage.getFavorites());

  const persist = useCallback((next: Favorite[]) => {
    setFavorites(next);
    storage.setFavorites(next);
  }, []);

  const addFavorite = useCallback((spotId: string, label: string, emoji = '📍') => {
    setFavorites((prev) => {
      if (prev.some((f) => f.spotId === spotId)) return prev;
      const next: Favorite[] = [
        ...prev,
        { id: `fav-${Date.now()}`, spotId, label, emoji, createdAt: Date.now() },
      ];
      storage.setFavorites(next);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((favId: string) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.id !== favId);
      storage.setFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (spotId: string) => favorites.some((f) => f.spotId === spotId),
    [favorites]
  );

  const renameFavorite = useCallback((favId: string, label: string) => {
    persist(favorites.map((f) => (f.id === favId ? { ...f, label } : f)));
  }, [favorites, persist]);

  return { favorites, addFavorite, removeFavorite, isFavorite, renameFavorite };
}
