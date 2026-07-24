import { createHash } from 'node:crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ALLOWED_FORMATS, UPLOAD_FOLDER, cloudinary } from '../config/cloudinary.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/uploads/status -> o site usa para mostrar (ou esconder) o campo de foto
router.get('/status', (_req, res) => {
  res.json({ enabled: Boolean(cloudinary) });
});

const signatureLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Muitos envios de foto em pouco tempo. Tente de novo mais tarde.' },
});

/**
 * GET /api/uploads/signature (exige login)
 * Gera a assinatura para o navegador enviar a foto direto ao Cloudinary, sem passar pelo nosso servidor.
 * A assinatura vale só para esta pasta e estes formatos, e o segredo nunca sai daqui.
 */
router.get('/signature', requireAuth, signatureLimiter, (_req, res) => {
  if (!cloudinary) return res.status(503).json({ message: 'O envio de fotos não está configurado' });

  const timestamp = Math.floor(Date.now() / 1000);
  // Parâmetros assinados, em ordem alfabética (regra do Cloudinary), seguidos do segredo
  const toSign = `allowed_formats=${ALLOWED_FORMATS}&folder=${UPLOAD_FOLDER}&timestamp=${timestamp}${cloudinary.apiSecret}`;
  const signature = createHash('sha1').update(toSign).digest('hex');

  res.json({
    cloudName: cloudinary.cloudName,
    apiKey: cloudinary.apiKey,
    timestamp,
    folder: UPLOAD_FOLDER,
    allowedFormats: ALLOWED_FORMATS,
    signature,
  });
});

export default router;
