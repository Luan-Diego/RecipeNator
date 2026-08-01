import type { RecipeCardData } from '../types';
import { mapCards } from './api';

export type CollectionSummary = {
  id: string;
  name: string;
  count: number;
  recipeIds: string[];
  /** Fotos de capa (pode haver textos vazios, que são receitas sem foto). */
  covers: string[];
};

async function call<T>(url: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(url, {
    method: init?.method,
    headers: init?.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as { message?: string };
  if (!res.ok) throw new Error(data.message ?? `API respondeu ${res.status}`);
  return data as T;
}

export const collectionsApi = {
  async list(): Promise<CollectionSummary[]> {
    return (await call<{ items: CollectionSummary[] }>('/api/collections')).items;
  },
  create(name: string): Promise<CollectionSummary> {
    return call<CollectionSummary>('/api/collections', { method: 'POST', body: { name } });
  },
  async get(id: string): Promise<{ id: string; name: string; items: RecipeCardData[] }> {
    const data = await call<{ id: string; name: string; items: Parameters<typeof mapCards>[0] }>(
      `/api/collections/${id}`,
    );
    return { id: data.id, name: data.name, items: mapCards(data.items) };
  },
  async rename(id: string, name: string): Promise<void> {
    await call(`/api/collections/${id}`, { method: 'PATCH', body: { name } });
  },
  async remove(id: string): Promise<void> {
    await call(`/api/collections/${id}`, { method: 'DELETE' });
  },
  async addRecipe(id: string, recipeId: string): Promise<void> {
    await call(`/api/collections/${id}/recipes`, { method: 'POST', body: { recipeId } });
  },
  async removeRecipe(id: string, recipeId: string): Promise<void> {
    await call(`/api/collections/${id}/recipes/${recipeId}`, { method: 'DELETE' });
  },
};
