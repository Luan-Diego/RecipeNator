import { useEffect, useState } from 'react';
import { fetchRecipes, type RecipeQuery } from '../services/api';
import type { RecipeCardData } from '../types';

/**
 * Busca receitas na API. Enquanto carrega, ou se a API estiver fora do ar ou
 * vazia, mostra os dados de exemplo (`fallback`) para o site nunca ficar em branco.
 */
export function useRecipes(query: RecipeQuery, fallback: RecipeCardData[]) {
  const [items, setItems] = useState<RecipeCardData[]>(fallback);
  const [live, setLive] = useState(false);
  const key = JSON.stringify(query);

  useEffect(() => {
    let cancelled = false;
    fetchRecipes(JSON.parse(key) as RecipeQuery)
      .then((result) => {
        if (!cancelled && result.length > 0) {
          setItems(result);
          setLive(true);
        }
      })
      .catch(() => {
        /* API indisponível: continua com os dados de exemplo */
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return { items, live };
}
