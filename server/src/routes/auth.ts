import bcrypt from 'bcryptjs';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { clearAuthCookie, setAuthCookie, signToken } from '../utils/auth.js';

const router = Router();

// Limite contra tentativas em massa de senha: 20 por 15 minutos por IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Muitas tentativas. Tente de novo em alguns minutos.' },
});

const email = z.string().trim().toLowerCase().email('E-mail inválido').max(254);

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome').max(60),
  email,
  // bcrypt só considera os primeiros 72 bytes da senha
  password: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres').max(72, 'A senha pode ter no máximo 72 caracteres'),
});

const loginSchema = z.object({ email, password: z.string().min(1).max(72) });

// Hash falso para gastar o mesmo tempo quando o e-mail não existe (evita revelar contas pelo tempo de resposta).
const DUMMY_HASH = bcrypt.hashSync('senha-que-nunca-sera-usada', 12);

const toPublic = (u: { _id: unknown; name: string; email: string; role: string }) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  role: u.role,
});

router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Dados inválidos', errors: parsed.error.flatten().fieldErrors });
    }
    const { name, email, password } = parsed.data;

    if (await User.exists({ email })) {
      return res.status(409).json({ message: 'Este e-mail já está em uso' });
    }

    try {
      const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
      setAuthCookie(res, signToken(String(user._id)));
      return res.status(201).json({ user: toPublic(user) });
    } catch (err) {
      // Dois cadastros simultâneos com o mesmo e-mail
      if ((err as { code?: number }).code === 11000) {
        return res.status(409).json({ message: 'Este e-mail já está em uso' });
      }
      throw err;
    }
  }),
);

router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: 'Informe e-mail e senha' });
    const { email, password } = parsed.data;

    const user = await User.findOne({ email }).select('+passwordHash');
    const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !ok) return res.status(401).json({ message: 'E-mail ou senha incorretos' });

    setAuthCookie(res, signToken(String(user._id)));
    return res.json({ user: toPublic(user) });
  }),
);

router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.status(204).end();
});

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const user = await User.findById(res.locals.userId).lean();
    if (!user) {
      clearAuthCookie(res);
      return res.status(401).json({ message: 'Sessão inválida' });
    }
    return res.json({ user: toPublic(user) });
  }),
);

export default router;
