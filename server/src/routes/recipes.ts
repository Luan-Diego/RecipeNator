import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { z } from 'zod';
import { categories } from '../config/categories.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { Recipe } from '../models/Recipe.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { slugify } from '../utils/slugify.js';

const router = Router();

const categoryEnum = z.enum(categories.map((c) => c.slug) as [string, ...string[]]);

const listQuery = z.object({
  category: categoryEnum.optional(),
  diet: z.enum(['vegetariana', 'vegana']).optional(),
  q: z.string().trim().min(1).max(80).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

// GET /api/recipes?category=massas-e-pizzas&diet=vegetariana&q=tomate&page=1
router.get(
  '/',
  asyncHandler(async (req, res) => {
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
  }),
);

const createSchema = z.object({
  title: z.string().trim().min(3, 'O título precisa ter pelo menos 3 caracteres').max(120),
  category: categoryEnum,
  cuisine: z.string().trim().max(40).optional(),
  diets: z.array(z.enum(['vegetariana', 'vegana'])).max(2).default([]),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  ingredients: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'Preencha o nome do ingrediente').max(80),
        measure: z.string().trim().max(40).default(''),
      }),
    )
    .min(1, 'Adicione pelo menos um ingrediente')
    .max(40),
  steps: z.array(z.string().trim().min(1, 'Preencha todos os passos').max(1000)).min(1, 'Adicione pelo menos um passo').max(40),
});

// No máximo 20 receitas publicadas por hora por IP
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Muitas publicações em pouco tempo. Tente de novo mais tarde.' },
});

// POST /api/recipes  (exige login)
router.post(
  '/',
  requireAuth,
  createLimiter,
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Dados inválidos', errors: parsed.error.flatten().fieldErrors });
    }
    const data = parsed.data;

    // Receita vegana também é vegetariana
    const diets = [...new Set(data.diets.includes('vegana') ? [...data.diets, 'vegetariana'] : data.diets)];
    const tags = [...new Set(data.tags.map((t) => t.replace(/^#/, '').toLowerCase()).filter(Boolean))];

    const base = slugify(data.title) || 'receita';
    let slug = base;
    for (let i = 0; i < 5 && (await Recipe.exists({ slug })); i++) {
      slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const recipe = await Recipe.create({
      title: data.title,
      slug,
      category: data.category,
      cuisine: data.cuisine || undefined,
      diets,
      tags,
      ingredients: data.ingredients,
      steps: data.steps,
      language: 'pt',
      source: 'user',
      sourceId: new mongoose.Types.ObjectId().toString(),
      isImported: false,
      author: res.locals.userId,
    });

    res.status(201).json({ id: String(recipe._id), slug: recipe.slug });
  }),
);

// GET /api/recipes/:slug
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const recipe = await Recipe.findOne({ slug: req.params.slug }).populate('author', 'name').lean();
    if (!recipe) return res.status(404).json({ message: 'Receita não encontrada' });
    res.json(recipe);
  }),
);

export default router;
