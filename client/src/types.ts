import type { PlateVariant } from './components/PlateIllustration';

export type Diet = 'vegetariana' | 'vegana' | 'sem-gluten';

/** Dados que o card de receita precisa. Campos opcionais aparecem só quando existem. */
export type RecipeCardData = {
  id: string;
  slug?: string;
  title: string;
  meta: string;
  diet?: Diet;
  /** Foto real. Sem ela, o card mostra o prato ilustrado. */
  imageUrl?: string;
  bg: string;
  plate?: { variant: PlateVariant; c1: string; c2: string; c3: string };
  time?: string;
  level?: string;
  rating?: string;
};

export type RecipeDetail = {
  _id: string;
  slug: string;
  title: string;
  category: string;
  cuisine?: string;
  diets: string[];
  tags: string[];
  ingredients: { name: string; measure: string }[];
  steps: string[];
  imageUrl?: string;
  language: string;
  source: string;
  sourceUrl?: string;
};

export type RecipePage = {
  items: RecipeCardData[];
  page: number;
  limit: number;
  total: number;
};
