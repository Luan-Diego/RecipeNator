import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import type { Types } from 'mongoose';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth.js';
import { Recipe } from '../models/Recipe.js';
import { Review } from '../models/Review.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { COOKIE_NAME, verifyToken } from '../utils/auth.js';

const router = Router();

const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Escolha uma nota de 1 a 5').max(5, 'Escolha uma nota de 1 a 5'),
  comment: z.string().trim().max(1000, 'O comentário pode ter no máximo 1000 caracteres').default(''),
});

// No máximo 30 avaliações por hora por IP
const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Muitas avaliações em pouco tempo. Tente de novo mais tarde.' },
});

async function recomputeSummary(recipeId: Types.ObjectId) {
  const [agg] = await Review.aggregate<{ avg: number; count: number }>([
    { $match: { recipe: recipeId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const summary = { avg: agg ? Math.round(agg.avg * 10) / 10 : 0, count: agg?.count ?? 0 };
  await Recipe.updateOne({ _id: recipeId }, { ratingAvg: summary.avg, ratingCount: summary.count });
  return summary;
}

// GET /api/recipes/:slug/reviews  (público; se houver login, marca a avaliação do próprio usuário)
router.get(
  '/:slug/reviews',
  asyncHandler(async (req, res) => {
    const recipe = await Recipe.findOne({ slug: req.params.slug }).select('_id ratingAvg ratingCount').lean();
    if (!recipe) return res.status(404).json({ message: 'Receita não encontrada' });

    const token = req.cookies?.[COOKIE_NAME];
    const viewerId = typeof token === 'string' ? verifyToken(token) : null;

    const reviews = await Review.find({ recipe: recipe._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user', 'name')
      .lean();

    res.json({
      items: reviews.map((r) => {
        const user = r.user as unknown as { _id: Types.ObjectId; name: string } | null;
        return {
          id: String(r._id),
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          user: { name: user?.name ?? 'Usuário' },
          mine: Boolean(viewerId && user && String(user._id) === viewerId),
        };
      }),
      summary: { avg: recipe.ratingAvg ?? 0, count: recipe.ratingCount ?? 0 },
    });
  }),
);

// PUT /api/recipes/:slug/reviews  (cria ou atualiza a avaliação do usuário logado)
router.put(
  '/:slug/reviews',
  requireAuth,
  writeLimiter,
  asyncHandler(async (req, res) => {
    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Dados inválidos', errors: parsed.error.flatten().fieldErrors });
    }
    const recipe = await Recipe.findOne({ slug: req.params.slug }).select('_id').lean();
    if (!recipe) return res.status(404).json({ message: 'Receita não encontrada' });

    await Review.findOneAndUpdate(
      { recipe: recipe._id, user: res.locals.userId },
      { $set: parsed.data },
      { upsert: true, setDefaultsOnInsert: true },
    );
    res.json({ summary: await recomputeSummary(recipe._id) });
  }),
);

// DELETE /api/recipes/:slug/reviews  (remove a avaliação do próprio usuário)
router.delete(
  '/:slug/reviews',
  requireAuth,
  asyncHandler(async (req, res) => {
    const recipe = await Recipe.findOne({ slug: req.params.slug }).select('_id').lean();
    if (!recipe) return res.status(404).json({ message: 'Receita não encontrada' });
    await Review.deleteOne({ recipe: recipe._id, user: res.locals.userId });
    await recomputeSummary(recipe._id);
    res.status(204).end();
  }),
);

export default router;
