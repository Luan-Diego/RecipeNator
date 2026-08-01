import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import { collectionsApi } from '../services/collections';
import type { RecipeCardData } from '../types';
import { fieldClass } from './Login';
import NotFound from './NotFound';

export default function CollectionDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<{ name: string; items: RecipeCardData[] } | null | undefined>(undefined);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    let cancelled = false;
    setData(undefined);
    collectionsApi
      .get(id)
      .then((r) => !cancelled && setData({ name: r.name, items: r.items }))
      .catch(() => !cancelled && setData(null));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (data === undefined) {
    return <p className="mx-auto max-w-7xl px-5 py-20 text-lg text-cacau sm:px-10">Carregando…</p>;
  }
  if (data === null) return <NotFound />;

  async function rename(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    try {
      await collectionsApi.rename(id, name.trim());
      setData((d) => (d ? { ...d, name: name.trim() } : d));
      setEditing(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function removeCollection() {
    if (!window.confirm('Excluir esta coleção? As receitas continuam no site.')) return;
    try {
      await collectionsApi.remove(id);
      navigate('/collections');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function removeRecipe(recipeId: string) {
    setError('');
    try {
      await collectionsApi.removeRecipe(id, recipeId);
      setData((d) => (d ? { ...d, items: d.items.filter((r) => r.id !== recipeId) } : d));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-10">
      <nav aria-label="Você está em" className="mb-6 text-[15px] text-cacau">
        <Link to="/collections" className="hover:text-tomato">
          Coleções
        </Link>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4">
        {editing ? (
          <form onSubmit={rename} className="flex flex-wrap gap-3">
            <label htmlFor="renomear" className="sr-only">
              Novo nome da coleção
            </label>
            <input
              id="renomear"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              className={`${fieldClass} min-w-[240px]`}
            />
            <button type="submit" className="btn-primary">
              Salvar
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn border-[1.5px] border-espresso">
              Cancelar
            </button>
          </form>
        ) : (
          <h1 className="text-5xl leading-[1.05] tracking-[-0.03em] sm:text-6xl">{data.name}</h1>
        )}
        {!editing && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setName(data.name);
                setEditing(true);
              }}
              className="rounded-full border-[1.5px] border-espresso px-5 py-2.5 font-semibold"
            >
              Renomear
            </button>
            <button
              type="button"
              onClick={() => void removeCollection()}
              className="rounded-full border-[1.5px] border-chili px-5 py-2.5 font-semibold text-chili"
            >
              Excluir coleção
            </button>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-chili">
          {error}
        </p>
      )}

      <div className="mt-10" aria-live="polite">
        {data.items.length === 0 ? (
          <div className="flex flex-col items-start gap-4 rounded-card bg-sand p-8">
            <p className="text-lg text-roast">Esta coleção está vazia. Abra uma receita e use “Salvar em coleção”.</p>
            <Link to="/recipes" className="btn-primary">
              Explorar receitas
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-7">
            {data.items.map((r) => (
              <div key={r.id} className="flex flex-col gap-2">
                <RecipeCard recipe={r} />
                <button
                  type="button"
                  onClick={() => void removeRecipe(r.id)}
                  className="self-start px-2 py-1 text-[15px] font-semibold text-cacau underline hover:text-tomato"
                >
                  Remover da coleção
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
