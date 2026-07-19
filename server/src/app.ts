import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import authRouter from './routes/auth.js';
import categoriesRouter from './routes/categories.js';
import favoritesRouter from './routes/favorites.js';
import healthRouter from './routes/health.js';
import recipesRouter from './routes/recipes.js';
import reviewsRouter from './routes/reviews.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/recipes', reviewsRouter); // /api/recipes/:slug/reviews
app.use('/api/recipes', recipesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/favorites', favoritesRouter);
// Próximas rotas: /api/tags, planejador ...

app.use((_req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Erro interno do servidor' });
});
