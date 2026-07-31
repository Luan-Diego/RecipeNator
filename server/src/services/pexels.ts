import { env } from '../config/env.js';

export type StockPhoto = {
  /** Endereço da imagem em boa resolução (usado só para enviar ao Cloudinary). */
  imageUrl: string;
  /** Nome do fotógrafo e página da foto no Pexels, para dar o crédito. */
  photographer: string;
  pageUrl: string;
};

type PexelsResponse = {
  photos?: {
    url: string;
    photographer: string;
    src: { large2x?: string; large?: string };
  }[];
};

/** Busca fotos reais no Pexels (gratuito, uso comercial liberado). Devolve até `count` resultados. */
export async function searchPexels(query: string, count = 5): Promise<StockPhoto[]> {
  if (!env.PEXELS_API_KEY) throw new Error('Defina PEXELS_API_KEY no server/.env (chave gratuita em pexels.com/api).');

  const params = new URLSearchParams({ query, per_page: String(count), orientation: 'landscape' });
  const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
    headers: { Authorization: env.PEXELS_API_KEY },
  });
  if (!res.ok) throw new Error(`Pexels respondeu ${res.status}`);

  const data = (await res.json()) as PexelsResponse;
  return (data.photos ?? [])
    .map((p) => ({
      imageUrl: p.src.large2x ?? p.src.large ?? '',
      photographer: p.photographer,
      pageUrl: p.url,
    }))
    .filter((p) => p.imageUrl);
}
