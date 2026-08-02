import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import { fetchByIngredients, type IngredientMatch } from '../services/api';

const container = 'mx-auto max-w-7xl px-5 sm:px-10';

/** "O que dá para fazer com o que eu tenho": receitas ordenadas pelos ingredientes que você já tem. */
export default function IngredientSearch({ text }: { text: string }) {
  const [, setParams] = useSearchParams();
  const [value, setValue] = useState(text);
  const [data, setData] = useState<{ terms: string[]; items: IngredientMatch[] } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => setValue(text), [text]);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError('');
    fetchByIngredients(text)
      .then((r) => !cancelled && setData(r))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [text]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = value.trim();
    if (next) setParams({ ingredients: next });
    else setParams({});
  }

  return (
    <section className={`${container} py-14`}>
      <div className="eyebrow">Busca por ingredientes</div>
      <h1 className="mt-1.5 text-5xl leading-[1.05] tracking-[-0.03em] sm:text-6xl">O que dá para cozinhar</h1>

      <form
        role="search"
        onSubmit={submit}
        className="mt-8 flex max-w-xl flex-wrap items-center gap-3 rounded-full border-2 border-espresso bg-paper py-2 pl-6 pr-2"
      >
        <label htmlFor="busca-ingredientes" className="sr-only">
          Ingredientes que você tem
        </label>
        <input
          id="busca-ingredientes"
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="frango, arroz, tomate…"
          className="min-w-0 flex-[1_1_200px] bg-transparent py-2.5 text-lg outline-none placeholder:text-cacau/70"
        />
        <button type="submit" className="btn-primary">
          Buscar
        </button>
      </form>
      <p className="mt-3 text-[15px] text-cacau">Separe os ingredientes por vírgula. Sal, água, óleo e pimenta não contam como faltando.</p>

      <div className="mt-10" aria-live="polite">
        {error && <p className="rounded-card bg-sand p-8 text-lg text-roast">{error}</p>}
        {!error && !data && <p className="text-lg text-cacau">Procurando receitas…</p>}

        {data && (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-2.5">
              <span className="mr-1 text-[15px] font-semibold">Com</span>
              {data.terms.map((t) => (
                <span key={t} className="rounded-full bg-saffron px-4 py-2 text-[15px] font-semibold">
                  {t}
                </span>
              ))}
            </div>

            {data.items.length === 0 ? (
              <div className="flex flex-col items-start gap-4 rounded-card bg-sand p-8">
                <p className="text-lg text-roast">
                  Nenhuma receita usa esses ingredientes. Tente menos itens ou outros nomes (por exemplo, “frango” em
                  vez de “peito de frango”).
                </p>
                <Link to="/recipes" className="btn-primary">
                  Ver todas as receitas
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-7">
                {data.items.map(({ card, matched, missing }) => (
                  <div key={card.id} className="flex flex-col gap-2">
                    <RecipeCard recipe={card} />
                    <p className="px-1 text-[15px] text-cacau">
                      <span className="font-semibold text-espresso">Você tem:</span> {matched.join(', ')}
                      <br />
                      {missing === 0 ? (
                        <span className="font-semibold text-roast">Não falta nenhum ingrediente</span>
                      ) : (
                        <>
                          Faltam {missing} {missing === 1 ? 'ingrediente' : 'ingredientes'}
                        </>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
