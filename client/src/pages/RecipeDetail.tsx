import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import HeartButton from '../components/HeartButton';
import { categoryName, dietOf, fetchRecipe } from '../services/api';
import type { RecipeDetail as Recipe } from '../types';
import { scaleMeasure } from '../utils/scale';
import NotFound from './NotFound';

const container = 'mx-auto max-w-7xl px-5 sm:px-10';
/** As receitas importadas não informam porções; partimos de 4 e o usuário ajusta. */
const BASE_SERVINGS = 4;

export default function RecipeDetail() {
  const { slug = '' } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null | undefined>(undefined); // undefined = carregando
  const [error, setError] = useState(false);
  const [servings, setServings] = useState(BASE_SERVINGS);
  const [done, setDone] = useState<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setRecipe(undefined);
    setError(false);
    setServings(BASE_SERVINGS);
    setDone(new Set());
    fetchRecipe(slug)
      .then((r) => !cancelled && setRecipe(r))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error) {
    return (
      <section className={`${container} py-20`}>
        <p className="rounded-card bg-sand p-8 text-lg text-roast">
          Não consegui falar com a API. Confira se o servidor está rodando.
        </p>
      </section>
    );
  }
  if (recipe === undefined) {
    return (
      <section className={`${container} py-20`}>
        <p className="text-lg text-cacau">Carregando receita…</p>
      </section>
    );
  }
  if (recipe === null) return <NotFound />;

  const diet = dietOf(recipe.diets);
  const factor = servings / BASE_SERVINGS;
  const toggle = (i: number) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <article className={`${container} py-12`}>
      <nav aria-label="Você está em" className="mb-8 text-[15px] text-cacau">
        <Link to="/recipes" className="hover:text-tomato">
          Receitas
        </Link>
        <span aria-hidden="true"> / </span>
        <Link to={`/recipes?category=${recipe.category}`} className="hover:text-tomato">
          {categoryName(recipe.category)}
        </Link>
      </nav>

      <header className="flex flex-wrap items-center gap-10">
        <div className="relative aspect-[4/3] min-w-0 flex-[1_1_420px] overflow-hidden rounded-card bg-sand">
          {recipe.imageUrl && (
            <img src={recipe.imageUrl} alt={recipe.title} className="absolute inset-0 h-full w-full object-cover" />
          )}
        </div>
        <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            {diet === 'vegana' && (
              <span className="rounded-full bg-herb-deep px-3.5 py-1.5 text-[13px] font-bold text-mint">Vegana</span>
            )}
            {(diet === 'vegana' || diet === 'vegetariana') && (
              <span className="rounded-full bg-herb px-3.5 py-1.5 text-[13px] font-bold text-white">Vegetariana</span>
            )}
          </div>
          <div className="eyebrow">
            {[recipe.cuisine, categoryName(recipe.category)].filter(Boolean).join(' · ')}
          </div>
          <h1 className="text-[clamp(36px,5vw,64px)] leading-[1.02] tracking-[-0.03em]">{recipe.title}</h1>
          {recipe.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2 text-[15px] text-cacau">
              {recipe.tags.map((t) => (
                <li key={t}>#{t.replace(/\s+/g, '')}</li>
              ))}
            </ul>
          )}
          <HeartButton
            recipeId={recipe._id}
            label="Salvar nos favoritos"
            className="flex w-fit items-center gap-2 rounded-full border-[1.5px] border-espresso px-5 py-2.5"
          />
          {recipe.author ? (
            <p className="text-cacau">
              Receita de <span className="font-semibold text-espresso">{recipe.author.name}</span>
            </p>
          ) : (
            <p className="max-w-md rounded-2xl bg-sand px-4 py-3 text-sm text-roast">
              Receita importada em inglês. Fonte:{' '}
              {recipe.sourceUrl ? (
                <a href={recipe.sourceUrl} target="_blank" rel="noreferrer" className="font-semibold underline">
                  TheMealDB
                </a>
              ) : (
                recipe.source
              )}
              .
            </p>
          )}
        </div>
      </header>

      <div className="mt-14 flex flex-wrap items-start gap-10">
        <section className="min-w-0 flex-[1_1_340px] rounded-card border border-line bg-paper p-7">
          <h2 className="text-3xl tracking-[-0.02em]">Ingredientes</h2>

          <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-sand px-4 py-3">
            <span id="porcoes-label" className="font-semibold">
              Porções
            </span>
            <div className="flex items-center gap-3" role="group" aria-labelledby="porcoes-label">
              <button
                type="button"
                aria-label="Diminuir porções"
                disabled={servings <= 1}
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-espresso text-xl font-semibold disabled:opacity-40"
              >
                −
              </button>
              <output className="min-w-8 text-center text-xl font-semibold" aria-live="polite">
                {servings}
              </output>
              <button
                type="button"
                aria-label="Aumentar porções"
                disabled={servings >= 50}
                onClick={() => setServings((s) => Math.min(50, s + 1))}
                className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-espresso text-xl font-semibold disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
          <p className="mt-2 text-[13px] text-cacau">
            Quantidades recalculadas a partir de {BASE_SERVINGS} porções (valor estimado).
          </p>

          <ul className="mt-5 divide-y divide-line">
            {recipe.ingredients.map((ing, i) => (
              <li key={`${ing.name}-${i}`} className="flex items-baseline justify-between gap-4 py-3">
                <span>{ing.name}</span>
                <span className="shrink-0 font-semibold text-caramel">{scaleMeasure(ing.measure, factor)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="min-w-0 flex-[2_1_480px]">
          <h2 className="text-3xl tracking-[-0.02em]">Modo de preparo</h2>
          <ol className="mt-5 flex flex-col gap-4">
            {recipe.steps.map((step, i) => {
              const checked = done.has(i);
              return (
                <li key={i} className="flex gap-4 rounded-card border border-line bg-paper p-5">
                  <span
                    aria-hidden="true"
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-lg font-semibold ${
                      checked ? 'bg-espresso text-cream' : 'bg-saffron text-espresso'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex min-w-0 flex-col gap-3">
                    <p className={checked ? 'text-cacau line-through' : ''}>{step}</p>
                    <label className="flex w-fit cursor-pointer items-center gap-2 text-[15px] font-medium text-cacau">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(i)}
                        className="h-5 w-5 accent-tomato"
                      />
                      Passo {i + 1} concluído
                    </label>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </article>
  );
}
