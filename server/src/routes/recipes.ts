import { Router } from 'express';
import { z } from 'zod';
import { categories } from '../config/categories.js';
import { Recipe } from '../models/Recipe.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

const listQuery = z.object({
  category: z.enum(categories.map((c) => c.slug) as [string, ...string[]]).optional(),
  diet: z.enum(['vegetariana', 'vegana']).optional(),
  q: z.string().trim().min(1).max(80).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

// GET /api/recipes?category=massas-e-pizzas&diet=vegetariana&q=tomate&page=1
router.get('/', asyncHandler(async (req, res) => {
  const parsed = listQuery.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Parâmetros inválidos', errors: parsed.error.flatten().fieldErrors });
  }
  const { category, diet, q, page, limit } = parsed.data;

  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (diet) filter.diets = diet;
  if (q) filter.$text = { $search: q };

  const [items, total] = await Promise.all([
    Recipe.find(filter)
      .select('title slug category cuisine diets imageUrl source')
      .sort({ title: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Recipe.countDocuments(filter),
  ]);

  res.json({ items, page, limit, total });
}));

// GET /api/recipes/:slug
router.get('/:slug', asyncHandler(async (req, res) => {
  const recipe = await Recipe.findOne({ slug: req.params.slug }).lean();
  if (!recipe) return res.status(404).json({ message: 'Receita não encontrada' });
  res.json(recipe);
}));

export default router;
