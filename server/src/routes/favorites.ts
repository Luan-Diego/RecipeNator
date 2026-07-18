import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/requireAuth.js';
import { Recipe } from '../models/Recipe.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);

// GET /api/favorites -> receitas favoritas do usuário logado
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const user = await User.findById(res.locals.userId)
      .populate({ path: 'favorites', select: 'title slug category cuisine diets imageUrl' })
      .lean();
    res.json({ items: user?.favorites ?? [] });
  }),
);

// POST /api/favorites/:recipeId
router.post(
  '/:recipeId',
  asyncHandler(async (req, res) => {
    const { recipeId } = req.params;
    if (!mongoose.isValidObjectId(recipeId) || !(await Recipe.exists({ _id: recipeId }))) {
      return res.status(404).json({ message: 'Receita não encontrada' });
    }
    await User.updateOne({ _id: res.locals.userId }, { $addToSet: { favorites: recipeId } });
    res.status(204).end();
  }),
);

// DELETE /api/favorites/:recipeId
router.delete(
  '/:recipeId',
  asyncHandler(async (req, res) => {
    const { recipeId } = req.params;
    if (!mongoose.isValidObjectId(recipeId)) return res.status(404).json({ message: 'Receita não encontrada' });
    await User.updateOne({ _id: res.locals.userId }, { $pull: { favorites: recipeId } });
    res.status(204).end();
  }),
);

export default router;
