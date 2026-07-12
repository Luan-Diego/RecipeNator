import { Router } from 'express';
import { categories } from '../config/categories.js';
import { Recipe } from '../models/Recipe.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// GET /api/categories -> categorias com a quantidade de receitas de cada uma
router.get('/', asyncHandler(async (_req, res) => {
  const counts = await Recipe.aggregate<{ _id: string; count: number }>([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const byCategory = new Map(counts.map((c) => [c._id, c.count]));
  res.json(categories.map((c) => ({ ...c, count: byCategory.get(c.slug) ?? 0 })));
}));

export default router;
