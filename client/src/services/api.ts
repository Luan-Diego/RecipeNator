import type { Diet, RecipeCardData, RecipeDetail, RecipePage } from '../types';

export const categoryList = [
  { slug: 'doces-e-sobremesas', name: 'Doces e sobremesas' },
  { slug: 'almoco-e-jantar', name: 'Almoço e jantar' },
  { slug: 'cafe-da-manha-e-brunch', name: 'Café da manhã e brunch' },
  { slug: 'lanches-e-petiscos', name: 'Lanches e petiscos' },
  { slug: 'massas-e-pizzas', name: 'Massas e pizzas' },
];

export const categoryName = (slug: string) => categoryList.find((c) => c.slug === slug)?.name ?? slug;

const warmTints = ['#F8DFB4', '#F3C9B8', '#F6D3C4', '#F2D9B6', '#EFC9B0', '#F7E1AE', '#F4D7BD', '#F3E0B5'];
const greenTint = '#CFE3BF';

type ApiRecipe = {
  _id: string;
  slug: string;
  title: string;
  category: string;
  cuisine?: string;
  diets?: string[];
  imageUrl?: string;
};

type ApiList = { items: ApiRecipe[]; page: number; limit: number; total: number };

export type RecipeQuery = {
  category?: string;
  diet?: 'vegetariana' | 'vegana';
  q?: string;
  page?: number;
  limit?: number;
};

export function dietOf(diets: string[] = []): Diet | undefined {
  return diets.includes('vegana') ? 'vegana' : diets.includes('vegetariana') ? 'vegetariana' : undefined;
}

function toCard(r: ApiRecipe, index: number, plant: boolean): RecipeCardData {
  return {
    id: r._id,
    slug: r.slug,
    title: r.title,
    meta: [r.cuisine, categoryName(r.category)].filter(Boolean).join(' · '),
    diet: dietOf(r.diets),
    imageUrl: r.imageUrl || undefined,
    bg: plant ? greenTint : warmTints[index % warmTints.length],
  };
}

/** Converte itens da API em dados de card (usado também pelos favoritos). */
export function mapCards(items: ApiRecipe[], plant = false): RecipeCardData[] {
  return items.map((r, i) => toCard(r, i, plant));
}

export type NewRecipe = {
  title: string;
  category: string;
  cuisine?: string;
  diets: ('vegetariana' | 'vegana')[];
  tags: string[];
  ingredients: { name: string; measure: string }[];
  steps: string[];
};

/** Publica uma receita (exige login). Devolve o slug da nova receita. */
export async function createRecipe(recipe: NewRecipe): Promise<{ slug: string }> {
  const res = await fetch('/api/recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe),
  });
  const data = (await res.json().catch(() => ({}))) as {
    slug?: string;
    message?: string;
    errors?: Record<string, string[]>;
  };
  if (!res.ok || !data.slug) {
    const first = data.errors ? Object.values(data.errors).flat()[0] : undefined;
    throw new Error(first ?? data.message ?? 'Não foi possível publicar a receita.');
  }
  return { slug: data.slug };
}

export async function fetchRecipePage(query: RecipeQuery = {}): Promise<RecipePage> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.set(k, String(v));
  });
  const res = await fetch(`/api/recipes?${params.toString()}`);
  if (!res.ok) throw new Error(`API respondeu ${res.status}`);
  const data = (await res.json()) as ApiList;
  const plant = query.diet === 'vegana' || query.diet === 'vegetariana';
  return {
    items: data.items.map((r, i) => toCard(r, i, plant)),
    page: data.page,
    limit: data.limit,
    total: data.total,
  };
}

export async function fetchRecipes(query: RecipeQuery = {}): Promise<RecipeCardData[]> {
  return (await fetchRecipePage(query)).items;
}

/** Devolve a receita, ou null se não existir (404). */
export async function fetchRecipe(slug: string): Promise<RecipeDetail | null> {
  const res = await fetch(`/api/recipes/${encodeURIComponent(slug)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API respondeu ${res.status}`);
  return (await res.json()) as RecipeDetail;
}
