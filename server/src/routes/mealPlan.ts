import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth.js';
import { MealPlan } from '../models/MealPlan.js';
import { Recipe } from '../models/Recipe.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);

const weekSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((s) => !Number.isNaN(Date.parse(s)), 'Data inválida');

const putSchema = z.object({
  entries: z
    .array(
      z.object({
        day: z.number().int().min(0).max(6),
        meal: z.enum(['cafe', 'almoco', 'jantar']),
        recipeId: z.string().refine((id) => mongoose.isValidObjectId(id), 'Receita inválida'),
        servings: z.number().int().min(1).max(50),
      }),
    )
    .max(70),
});

// GET /api/meal-plan?week=2026-11-09  -> plano da semana, com os ingredientes das receitas
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const week = weekSchema.safeParse(req.query.week);
    if (!week.success) return res.status(400).json({ message: 'Informe a semana no formato AAAA-MM-DD' });

    const plan = await MealPlan.findOne({ user: res.locals.userId, week: week.data })
      .populate({ path: 'entries.recipe', select: 'title slug imageUrl ingredients' })
      .lean();

    // Receitas apagadas desde então saem do plano
    const entries = (plan?.entries ?? []).filter((e) => e.recipe);
    res.json({ week: week.data, entries });
  }),
);

// PUT /api/meal-plan?week=2026-11-09  -> substitui o plano da semana
router.put(
  '/',
  asyncHandler(async (req, res) => {
    const week = weekSchema.safeParse(req.query.week);
    if (!week.success) return res.status(400).json({ message: 'Informe a semana no formato AAAA-MM-DD' });
    const body = putSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ message: 'Dados inválidos', errors: body.error.flatten().fieldErrors });
    }

    const ids = [...new Set(body.data.entries.map((e) => e.recipeId))];
    if (ids.length > 0 && (await Recipe.countDocuments({ _id: { $in: ids } })) !== ids.length) {
      return res.status(400).json({ message: 'Alguma receita do plano não existe mais' });
    }

    await MealPlan.updateOne(
      { user: res.locals.userId, week: week.data },
      {
        $set: {
          entries: body.data.entries.map((e) => ({ day: e.day, meal: e.meal, recipe: e.recipeId, servings: e.servings })),
        },
      },
      { upsert: true },
    );
    res.status(204).end();
  }),
);

export default router;
