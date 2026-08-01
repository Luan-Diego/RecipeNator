import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI é obrigatório'),
  // Carrega as receitas da casa ao iniciar o servidor (use 'false' para desligar)
  SEED_CURATED: z.enum(['true', 'false']).default('true'),
  // Chave gratuita do Pixabay (pixabay.com), usada só pelo comando `npm run photos`
  PIXABAY_API_KEY: z.string().trim().optional(),
  // Upload de fotos (opcional): preencha os três para ligar
  CLOUDINARY_CLOUD_NAME: z.string().trim().optional(),
  CLOUDINARY_API_KEY: z.string().trim().optional(),
  CLOUDINARY_API_SECRET: z.string().trim().optional(),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET precisa ter 32+ caracteres. Gere um com: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Variáveis de ambiente inválidas:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
