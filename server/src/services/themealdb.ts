import { z } from 'zod';
import { areaToCuisine, defaultCategoryRule, mealDbCategoryMap } from '../config/categories.js';

/**
 * Cliente da TheMealDB. A chave gratuita ("1") é para desenvolvimento e estudo;
 * antes de um lançamento público, confira os termos e a chave de apoiador em
 * https://themealdb.com/documentation
 */
const BASE_URL = 'https://www.themealdb.com/api/json/v1';
const API_KEY = process.env.THEMEALDB_KEY ?? '1';

const rawMeal = z.record(z.string(), z.string().nullable());
const mealsResponse = z.object({ meals: z.array(rawMeal).nullable() });
const categoriesResponse = z.object({
  categories: z.array(z.object({ strCategory: z.string() })),
});

async function get<T extends z.ZodTypeAny>(path: string, schema: T): Promise<z.infer<T>> {
  const res = await fetch(`${BASE_URL}/${API_KEY}/${path}`);
  if (!res.ok) throw new Error(`TheMealDB respondeu ${res.status} em ${path}`);
  return schema.parse(await res.json());
}

export async function listCategoryNames(): Promise<string[]> {
  const data = await get('categories.php', categoriesResponse);
  return data.categories.map((c) => c.strCategory);
}

export async function listMealIdsByCategory(category: string): Promise<string[]> {
  const data = await get(`filter.php?c=${encodeURIComponent(category)}`, mealsResponse);
  return (data.meals ?? []).map((m) => m.idMeal).filter((id): id is string => Boolean(id));
}

export async function lookupMeal(id: string) {
  const data = await get(`lookup.php?i=${encodeURIComponent(id)}`, mealsResponse);
  return data.meals?.[0] ?? null;
}

export type NormalizedRecipe = {
  title: string;
  category: string;
  cuisine: string;
  diets: string[];
  tags: string[];
  ingredients: { name: string; measure: string }[];
  steps: string[];
  imageUrl: string;
  language: 'en';
  source: 'themealdb';
  sourceId: string;
  sourceUrl: string;
  isImported: true;
};

function cleanSteps(instructions: string): string[] {
  return instructions
    .split(/\r?\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !/^step\s*\d+\s*$/i.test(s) && !/^\d+\.?$/.test(s));
}

export function normalizeMeal(raw: Record<string, string | null>): NormalizedRecipe | null {
  const id = raw.idMeal;
  const title = raw.strMeal?.trim();
  if (!id || !title) return null;

  const ingredients: { name: string; measure: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = raw[`strIngredient${i}`]?.trim();
    if (name) ingredients.push({ name, measure: raw[`strMeasure${i}`]?.trim() ?? '' });
  }

  const rule = mealDbCategoryMap[raw.strCategory ?? ''] ?? defaultCategoryRule;
  const thumb = raw.strMealThumb ?? '';

  return {
    title,
    category: rule.category,
    cuisine: areaToCuisine[raw.strArea ?? ''] ?? 'Internacional',
    diets: rule.diets,
    tags: (raw.strTags ?? '')
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean),
    ingredients,
    steps: cleanSteps(raw.strInstructions ?? ''),
    // Variante média da imagem (a API documenta /small, /medium e /large).
    imageUrl: thumb ? `${thumb}/medium` : '',
    language: 'en',
    source: 'themealdb',
    sourceId: id,
    sourceUrl: `https://www.themealdb.com/meal/${id}`,
    isImported: true,
  };
}
