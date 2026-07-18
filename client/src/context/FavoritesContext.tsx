import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { favoritesApi } from '../services/favorites';
import { useAuth } from './AuthContext';

type FavoritesState = {
  isFavorite: (recipeId: string) => boolean;
  /** Alterna o favorito. Atualiza a tela na hora e desfaz se o servidor recusar. */
  toggle: (recipeId: string) => Promise<void>;
  ids: Set<string>;
};

const FavoritesContext = createContext<FavoritesState | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setIds(new Set());
      return;
    }
    let cancelled = false;
    favoritesApi
      .list()
      .then((items) => !cancelled && setIds(new Set(items.map((i) => i.id))))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggle = useCallback(
    async (recipeId: string) => {
      const was = ids.has(recipeId);
      const apply = (add: boolean) =>
        setIds((prev) => {
          const next = new Set(prev);
          if (add) next.add(recipeId);
          else next.delete(recipeId);
          return next;
        });
      apply(!was);
      try {
        await (was ? favoritesApi.remove(recipeId) : favoritesApi.add(recipeId));
      } catch {
        apply(was); // desfaz
      }
    },
    [ids],
  );

  const value = useMemo(() => ({ ids, isFavorite: (id: string) => ids.has(id), toggle }), [ids, toggle]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesState {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites precisa estar dentro de <FavoritesProvider>');
  return ctx;
}
