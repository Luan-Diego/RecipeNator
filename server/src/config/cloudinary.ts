import { env } from './env.js';

/** null enquanto as três variáveis CLOUDINARY_* não estiverem preenchidas: o upload fica desligado. */
export const cloudinary =
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
    ? {
        cloudName: env.CLOUDINARY_CLOUD_NAME,
        apiKey: env.CLOUDINARY_API_KEY,
        apiSecret: env.CLOUDINARY_API_SECRET,
      }
    : null;

export const UPLOAD_FOLDER = 'recipenator/recipes';
export const ALLOWED_FORMATS = 'jpg,jpeg,png,webp';

/** Só aceitamos fotos que estejam na nossa própria conta do Cloudinary (pasta de receitas). */
export function isAllowedImageUrl(url: string): boolean {
  if (!cloudinary) return false;
  return url.startsWith(`https://res.cloudinary.com/${cloudinary.cloudName}/image/upload/`);
}
