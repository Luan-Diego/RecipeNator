import type { NextFunction, Request, Response } from 'express';
import { COOKIE_NAME, verifyToken } from '../utils/auth.js';

/** Protege uma rota: exige cookie de login válido. O id fica em res.locals.userId. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  const userId = typeof token === 'string' ? verifyToken(token) : null;
  if (!userId) return res.status(401).json({ message: 'Faça login para continuar' });
  res.locals.userId = userId;
  next();
}
