import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'RecipeNator',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

export default router;
