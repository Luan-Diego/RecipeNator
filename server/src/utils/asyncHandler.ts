import type { NextFunction, Request, Response } from 'express';

/** Express 4 não captura rejeições de rotas async; isto repassa o erro ao middleware de erro. */
export const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
