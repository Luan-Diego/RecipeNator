import { Router } from 'express';
import { Recipe } from '../models/Recipe.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// GET /api/discover -> culinárias e hashtags mais usadas, com a quantidade de receitas
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [cuisines, tags] = await Promise.all([
      Recipe.aggregate<{ _id: string; count: number }>([
        { $match: { cuisine: { $nin: [null, ''] } } },
        { $group: { _id: '$cuisine', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 40 },
      ]),
      Recipe.aggregate<{ _id: string; count: number }>([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 30 },
      ]),
    ]);

    res.json({
      cuisines: cuisines.map((c) => ({ name: c._id, count: c.count })),
      tags: tags.map((t) => ({ name: t._id, count: t.count })),
    });
  }),
);

export default router;
