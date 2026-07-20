import { BASE_SERVINGS, formatNumber, parseQuantity } from './scale';

export type PlanIngredient = { name: string; measure: string };

export type ShoppingItem = {
  /** nome em minúsculas, usado como chave */
  key: string;
  name: string;
  /** ex.: ["3 cups", "1 tbsp", "to taste"] (unidades diferentes não são somadas) */
  amounts: string[];
};

type PlanLike = { servings: number; recipe: { ingredients?: PlanIngredient[] } };

/**
 * Junta os ingredientes de todas as receitas do plano. Cada receita é ajustada às porções escolhidas
 * e quantidades do mesmo ingrediente com a mesma unidade são somadas.
 */
export function aggregateIngredients(entries: PlanLike[]): ShoppingItem[] {
  const map = new Map<string, { name: string; qty: Map<string, number>; extras: Set<string> }>();

  for (const entry of entries) {
    const factor = entry.servings / BASE_SERVINGS;
    for (const ing of entry.recipe.ingredients ?? []) {
      const name = ing.name.trim();
      if (!name) continue;
      const key = name.toLowerCase();
      const item = map.get(key) ?? { name, qty: new Map<string, number>(), extras: new Set<string>() };

      const q = parseQuantity(ing.measure);
      if (q) {
        const unit = q.rest.trim().toLowerCase();
        item.qty.set(unit, (item.qty.get(unit) ?? 0) + q.value * factor);
      } else if (ing.measure.trim()) {
        item.extras.add(ing.measure.trim());
      }
      map.set(key, item);
    }
  }

  return [...map.entries()]
    .map(([key, item]) => ({
      key,
      name: item.name,
      amounts: [
        ...[...item.qty.entries()].map(([unit, v]) => (unit ? `${formatNumber(v)} ${unit}` : formatNumber(v))),
        ...item.extras,
      ],
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}
