export type Meal = 'cafe' | 'almoco' | 'jantar';

export type PlanEntry = {
  day: number; // 0 = segunda
  meal: Meal;
  servings: number;
  recipe: {
    _id: string;
    title: string;
    slug: string;
    imageUrl?: string;
    ingredients?: { name: string; measure: string }[];
  };
};

async function fail(res: Response): Promise<never> {
  const data = (await res.json().catch(() => ({}))) as { message?: string };
  throw new Error(data.message ?? `API respondeu ${res.status}`);
}

export const mealPlanApi = {
  async get(week: string): Promise<PlanEntry[]> {
    const res = await fetch(`/api/meal-plan?week=${week}`);
    if (!res.ok) return fail(res);
    return ((await res.json()) as { entries: PlanEntry[] }).entries;
  },
  async save(week: string, entries: PlanEntry[]): Promise<void> {
    const res = await fetch(`/api/meal-plan?week=${week}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entries: entries.map((e) => ({ day: e.day, meal: e.meal, recipeId: e.recipe._id, servings: e.servings })),
      }),
    });
    if (!res.ok) return fail(res);
  },
};
