import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth.js';
import { Collection } from '../models/Collection.js';
import { Recipe } from '../models/Recipe.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);

const MAX_COLLECTIONS = 30;
const MAX_RECIPES = 200;

const nameBody = z.object({
  name: z.string().trim().min(1, 'Dê um nome à coleção').max(60, 'O nome pode ter até 60 caracteres'),
});
const recipeBody = z.object({ recipeId: z.string() });

const notFound = (res: import('express').Response) => res.status(404).json({ message: 'Coleção não encontrada' });

// GET /api/collections -> coleções do usuário, com contagem e até 3 fotos de capa
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const collections = await Collection.find({ user: res.locals.userId }).sort({ updatedAt: -1 }).lean();

    const coverIds = collections.flatMap((c) => c.recipes.slice(0, 3));
    const covers = await Recipe.find({ _id: { $in: coverIds } })
      .select('imageUrl')
      .lean();
    const imageById = new Map(covers.map((r) => [String(r._id), r.imageUrl ?? '']));

    res.json({
      items: collections.map((c) => ({
        id: String(c._id),
        name: c.name,
        count: c.recipes.length,
        recipeIds: c.recipes.map(String),
        covers: c.recipes.slice(0, 3).map((id) => imageById.get(String(id)) ?? ''),
      })),
    });
  }),
);

// POST /api/collections { name }
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = nameBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Nome inválido' });

    if ((await Collection.countDocuments({ user: res.locals.userId })) >= MAX_COLLECTIONS) {
      return res.status(400).json({ message: `Você pode ter até ${MAX_COLLECTIONS} coleções.` });
    }
    const created = await Collection.create({ user: res.locals.userId, name: parsed.data.name });
    res.status(201).json({ id: String(created._id), name: created.name, count: 0, recipeIds: [], covers: [] });
  }),
);

// GET /api/collections/:id -> coleção com as receitas (na ordem em que foram salvas)
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
    const collection = await Collection.findOne({ _id: req.params.id, user: res.locals.userId })
      .populate({
        path: 'recipes',
        select: 'title slug category cuisine diets imageUrl source ratingAvg ratingCount',
      })
      .lean();
    if (!collection) return notFound(res);
    res.json({ id: String(collection._id), name: collection.name, items: collection.recipes });
  }),
);

// PATCH /api/collections/:id { name }
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
    const parsed = nameBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Nome inválido' });

    const updated = await Collection.findOneAndUpdate(
      { _id: req.params.id, user: res.locals.userId },
      { $set: { name: parsed.data.name } },
      { new: true },
    ).lean();
    if (!updated) return notFound(res);
    res.json({ id: String(updated._id), name: updated.name });
  }),
);

// DELETE /api/collections/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
    const result = await Collection.deleteOne({ _id: req.params.id, user: res.locals.userId });
    if (result.deletedCount === 0) return notFound(res);
    res.status(204).end();
  }),
);

// POST /api/collections/:id/recipes { recipeId }
router.post(
  '/:id/recipes',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
    const parsed = recipeBody.safeParse(req.body);
    if (!parsed.success || !mongoose.isValidObjectId(parsed.data.recipeId)) {
      return res.status(404).json({ message: 'Receita não encontrada' });
    }
    const { recipeId } = parsed.data;

    const collection = await Collection.findOne({ _id: req.params.id, user: res.locals.userId }).select('recipes').lean();
    if (!collection) return notFound(res);
    if (collection.recipes.length >= MAX_RECIPES) {
      return res.status(400).json({ message: `Cada coleção guarda até ${MAX_RECIPES} receitas.` });
    }
    if (!(await Recipe.exists({ _id: recipeId }))) return res.status(404).json({ message: 'Receita não encontrada' });

    await Collection.updateOne({ _id: req.params.id }, { $addToSet: { recipes: recipeId } });
    res.status(204).end();
  }),
);

// DELETE /api/collections/:id/recipes/:recipeId
router.delete(
  '/:id/recipes/:recipeId',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id) || !mongoose.isValidObjectId(req.params.recipeId)) return notFound(res);
    const result = await Collection.updateOne(
      { _id: req.params.id, user: res.locals.userId },
      { $pull: { recipes: req.params.recipeId } },
    );
    if (result.matchedCount === 0) return notFound(res);
    res.status(204).end();
  }),
);

export default router;
