import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import { categoryList, fetchRecipePage } from '../services/api';
import type { RecipePage } from '../types';

const LIMIT = 12;
const container = 'mx-auto max-w-7xl px-5 sm:px-10';

type DietParam = 'vegetariana' | 'vegana';
const isDiet = (v: string | null): v is DietParam => v === 'vegetariana' || v === 'vegana';

/** Biblioteca de receitas. Também atende /search; filtros ficam na URL (compartilháveis). */
export default function Recipes() {
  const [params, setParams] = useSearchParams();
  const category = categoryList.some((c) => c.slug === params.get('category')) ? params.get('category')! : undefined;
  const diet = isDiet(params.get('diet')) ? (params.get('diet') as DietParam) : undefined;
  const q = params.get('q')?.trim() || undefined;
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [data, setData] = useState<RecipePage | null>(null);
  const [error, setError] = useState(false);
  const [text, setText] = useState(q ?? '');

  useEffect(() => setText(q ?? ''), [q]);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(false);
    fetchRecipePage({ category, diet, q, page, limit: LIMIT })
      .then((r) => !cancelled && setData(r))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [category, diet, q, page]);

  function update(key: string, value: string | undefined) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next);
  }

  function goToPage(p: number) {
    const next = new URLSearchParams(params);
    next.set('page', String(p));
    setParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  const chip = 'rounded-full border-[1.5px] px-[18px] py-2.5 text-[15px] font-semibold transition-colors';

  return (
    <section className={`${container} py-14`}>
      <div className="eyebrow">Biblioteca</div>
      <h1 className="mt-1.5 text-5xl leading-[1.05] tracking-[-0.03em] sm:text-6xl">Receitas</h1>

      <form
        role="search"
        className="mt-8 flex max-w-xl flex-wrap items-center gap-3 rounded-full border-2 border-espresso bg-paper py-2 pl-6 pr-2"
        onSubmit={(e) => {
          e.preventDefault();
          update('q', text.trim() || undefined);
        }}
      >
        <label htmlFor="busca" className="sr-only">
          Buscar receitas
        </label>
        <input
          id="busca"
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nome, ingrediente ou hashtag…"
          className="min-w-0 flex-[1_1_200px] bg-transparent py-2.5 text-lg outline-none placeholder:text-cacau/70"
        />
        <button type="submit" className="btn-primary">
          Buscar
        </button>
      </form>

      <div className="mt-8 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="mr-2 text-[15px] font-semibold">Categoria</span>
          <button
            type="button"
            onClick={() => update('category', undefined)}
            className={`${chip} ${!category ? 'border-espresso bg-espresso text-cream' : 'border-[#C9AE8E]'}`}
          >
            Todas
          </button>
          {categoryList.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => update('category', c.slug)}
              className={`${chip} ${category === c.slug ? 'border-espresso bg-espresso text-cream' : 'border-[#C9AE8E]'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="mr-2 text-[15px] font-semibold">Estilo alimentar</span>
          {(['vegetariana', 'vegana'] as const).map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={diet === d}
              onClick={() => update('diet', diet === d ? undefined : d)}
              className={`${chip} ${
                diet === d ? 'border-herb-deep bg-herb text-white' : 'border-herb bg-mint text-herb-deep'
              }`}
            >
              {d === 'vegana' ? 'Vegana' : 'Vegetariana'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10" aria-live="polite">
        {error && (
          <p className="rounded-card bg-sand p-8 text-lg text-roast">
            Não consegui falar com a API. Confira se o servidor está rodando (<code>npm run dev</code> em{' '}
            <code>server/</code>).
          </p>
        )}
        {!error && !data && <p className="text-lg text-cacau">Carregando receitas…</p>}
        {data && data.items.length === 0 && (
          <p className="rounded-card bg-sand p-8 text-lg text-roast">
            Nenhuma receita encontrada com esses filtros. Se o banco está vazio, importe algumas com{' '}
            <code>npm run import:mealdb -- --limit 5</code>.
          </p>
        )}
        {data && data.items.length > 0 && (
          <>
            <p className="mb-6 text-cacau">
              {data.total} {data.total === 1 ? 'receita' : 'receitas'}
            </p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-7">
              {data.items.map((r) => (
                <RecipeCard key={r.id} recipe={r} />
              ))}
            </div>
            {totalPages > 1 && (
              <nav aria-label="Paginação" className="mt-12 flex items-center justify-center gap-4">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                  className="btn border-[1.5px] border-espresso disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="text-cacau">
                  Página {page} de {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => goToPage(page + 1)}
                  className="btn border-[1.5px] border-espresso disabled:opacity-40"
                >
                  Próxima
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  );
}
