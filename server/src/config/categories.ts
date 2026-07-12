/**
 * Categorias do RecipeNator (subconjunto do documento, seção 2.1) e o mapeamento
 * das categorias/áreas da TheMealDB para elas.
 */
export type Diet = 'vegetariana' | 'vegana';

export const categories = [
  { slug: 'doces-e-sobremesas', name: 'Doces e sobremesas' },
  { slug: 'almoco-e-jantar', name: 'Almoço e jantar' },
  { slug: 'cafe-da-manha-e-brunch', name: 'Café da manhã e brunch' },
  { slug: 'lanches-e-petiscos', name: 'Lanches e petiscos' },
  { slug: 'massas-e-pizzas', name: 'Massas e pizzas' },
] as const;

export type CategorySlug = (typeof categories)[number]['slug'];

type MealDbCategoryRule = { category: CategorySlug; diets: Diet[] };

/** Categoria da TheMealDB -> categoria do RecipeNator (+ estilo alimentar quando houver). */
export const mealDbCategoryMap: Record<string, MealDbCategoryRule> = {
  Beef: { category: 'almoco-e-jantar', diets: [] },
  Chicken: { category: 'almoco-e-jantar', diets: [] },
  Lamb: { category: 'almoco-e-jantar', diets: [] },
  Pork: { category: 'almoco-e-jantar', diets: [] },
  Goat: { category: 'almoco-e-jantar', diets: [] },
  Seafood: { category: 'almoco-e-jantar', diets: [] },
  Side: { category: 'almoco-e-jantar', diets: [] },
  Miscellaneous: { category: 'almoco-e-jantar', diets: [] },
  Pasta: { category: 'massas-e-pizzas', diets: [] },
  Dessert: { category: 'doces-e-sobremesas', diets: [] },
  Breakfast: { category: 'cafe-da-manha-e-brunch', diets: [] },
  Starter: { category: 'lanches-e-petiscos', diets: [] },
  Vegetarian: { category: 'almoco-e-jantar', diets: ['vegetariana'] },
  // Receita vegana também é vegetariana.
  Vegan: { category: 'almoco-e-jantar', diets: ['vegana', 'vegetariana'] },
};

export const defaultCategoryRule: MealDbCategoryRule = { category: 'almoco-e-jantar', diets: [] };

/** Área da TheMealDB -> culinária em português. */
export const areaToCuisine: Record<string, string> = {
  American: 'Americana',
  British: 'Britânica',
  Canadian: 'Canadense',
  Chinese: 'Chinesa',
  Croatian: 'Croata',
  Dutch: 'Holandesa',
  Egyptian: 'Egípcia',
  Filipino: 'Filipina',
  French: 'Francesa',
  Greek: 'Grega',
  Indian: 'Indiana',
  Irish: 'Irlandesa',
  Italian: 'Italiana',
  Jamaican: 'Jamaicana',
  Japanese: 'Japonesa',
  Kenyan: 'Queniana',
  Malaysian: 'Malaia',
  Mexican: 'Mexicana',
  Moroccan: 'Marroquina',
  Polish: 'Polonesa',
  Portuguese: 'Portuguesa',
  Russian: 'Russa',
  Spanish: 'Espanhola',
  Thai: 'Tailandesa',
  Tunisian: 'Tunisiana',
  Turkish: 'Turca',
  Ukrainian: 'Ucraniana',
  Vietnamese: 'Vietnamita',
};
