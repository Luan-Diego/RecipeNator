import { env } from '../config/env.js';

export type StockPhoto = {
  /** Endereço da imagem (até 1280 px), usado só para enviar ao Cloudinary. */
  imageUrl: string;
  /** Crédito exibido na página da receita, ex.: "Maria Silva no Pixabay". */
  credit: string;
  /** Página da foto no Pixabay. */
  pageUrl: string;
};

type PixabayResponse = {
  hits?: { largeImageURL: string; user: string; pageURL: string }[];
};

/**
 * Busca fotos reais de comida no Pixabay (chave gratuita, fotos podem ser baixadas e guardadas
 * no nosso próprio servidor, mas não usadas direto do endereço deles; por isso vão para o Cloudinary).
 */
export async function searchPhotos(query: string, count = 5): Promise<StockPhoto[]> {
  if (!env.PIXABAY_API_KEY) throw new Error('Defina PIXABAY_API_KEY no server/.env (chave gratuita em pixabay.com).');

  const params = new URLSearchParams({
    key: env.PIXABAY_API_KEY,
    q: query.slice(0, 100),
    image_type: 'photo',
    orientation: 'horizontal',
    category: 'food',
    safesearch: 'true',
    per_page: String(Math.max(3, count)),
  });
  const res = await fetch(`https://pixabay.com/api/?${params}`);
  if (!res.ok) throw new Error(`Pixabay respondeu ${res.status}`);

  const data = (await res.json()) as PixabayResponse;
  return (data.hits ?? []).slice(0, count).map((h) => ({
    imageUrl: h.largeImageURL,
    credit: `${h.user} no Pixabay`,
    pageUrl: h.pageURL,
  }));
}
