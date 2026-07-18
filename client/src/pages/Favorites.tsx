import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import { useFavorites } from '../context/FavoritesContext';
import { favoritesApi } from '../services/favorites';
import type { RecipeCardData } from '../types';

export default function Favorites() {
  const { ids } = useFavorites();
  const [items, setItems] = useState<RecipeCardData[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    favoritesApi
      .list()
      .then((r) => !cancelled && setItems(r))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  // Ao desfavoritar aqui, o card some na hora
  const visible = items?.filter((r) => ids.has(r.id)) ?? [];

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-10">
      <div className="eyebrow">Sua coleção</div>
      <h1 className="mt-1.5 text-5xl leading-[1.05] tracking-[-0.03em] sm:text-6xl">Favoritos</h1>

      <div className="mt-10" aria-live="polite">
        {error && <p className="rounded-card bg-sand p-8 text-lg text-roast">Não consegui carregar seus favoritos.</p>}
        {!error && items === null && <p className="text-lg text-cacau">Carregando…</p>}
        {items !== null && visible.length === 0 && (
          <div className="flex flex-col items-start gap-4 rounded-card bg-sand p-8">
            <p className="text-lg text-roast">Você ainda não salvou nenhuma receita. Toque no coração de uma receita para guardá-la aqui.</p>
            <Link to="/recipes" className="btn-primary">
              Explorar receitas
            </Link>
          </div>
        )}
        {visible.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-7">
            {visible.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
