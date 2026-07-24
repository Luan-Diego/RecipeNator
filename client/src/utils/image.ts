const PRESETS = {
  card: 'c_fill,w_640,h_480,f_auto,q_auto',
  detail: 'c_fill,w_1000,h_750,f_auto,q_auto',
} as const;

/**
 * Pede ao Cloudinary uma versão recortada e leve da foto (formato e qualidade automáticos).
 * URLs de outras origens (ex.: TheMealDB) passam sem mudança.
 */
export function optimizeImage(url: string, preset: keyof typeof PRESETS = 'card'): string {
  if (!url.startsWith('https://res.cloudinary.com/') || !url.includes('/image/upload/')) return url;
  return url.replace('/image/upload/', `/image/upload/${PRESETS[preset]}/`);
}
