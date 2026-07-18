import type { RecipeCardData } from '../types';
import { mapCards } from './api';

export const favoritesApi = {
  async list(): Promise<RecipeCardData[]> {
    const res = await fetch('/api/favorites');
    if (!res.ok) throw new Error(`API respondeu ${res.status}`);
    const data = (await res.json()) as { items: Parameters<typeof mapCards>[0] };
    return mapCards(data.items);
  },
  async add(recipeId: string) {
    const res = await fetch(`/api/favorites/${recipeId}`, { method: 'POST' });
    if (!res.ok) throw new Error(`API respondeu ${res.status}`);
  },
  async remove(recipeId: string) {
    const res = await fetch(`/api/favorites/${recipeId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`API respondeu ${res.status}`);
  },
};
