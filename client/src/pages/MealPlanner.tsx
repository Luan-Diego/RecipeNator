import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { fetchRecipePage } from '../services/api';
import { mealPlanApi, type Meal, type PlanEntry } from '../services/mealPlan';
import type { RecipeCardData } from '../types';
import { addDays, dayLabel, formatWeek, mondayOf } from '../utils/week';

const MEALS: { id: Meal; label: string }[] = [
  { id: 'cafe', label: 'Café da manhã' },
  { id: 'almoco', label: 'Almoço' },
  { id: 'jantar', label: 'Jantar' },
];

type Status = 'loading' | 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export default function MealPlanner() {
  const [week, setWeek] = useState(() => mondayOf());
  const [entries, setEntries] = useState<PlanEntry[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const dirty = useRef(false);

  // Picker de receitas
  const [adding, setAdding] = useState<{ day: number; meal: Meal } | null>(null);
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RecipeCardData[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    dirty.current = false;
    setStatus('loading');
    setAdding(null);
    mealPlanApi
      .get(week)
      .then((e) => {
        if (cancelled) return;
        setEntries(e);
        setStatus('idle');
      })
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
    };
  }, [week]);

  // Salva sozinho 0,6 s depois da última mudança
  useEffect(() => {
    if (!dirty.current) return;
    setStatus('pending');
    const t = setTimeout(() => {
      setStatus('saving');
      mealPlanApi
        .save(week, entries)
        .then(() => {
          dirty.current = false;
          setStatus('saved');
        })
        .catch(() => setStatus('error'));
    }, 600);
    return () => clearTimeout(t);
  }, [entries, week]);

  useEffect(() => {
    if (!adding) return;
    let cancelled = false;
    setResults(null);
    fetchRecipePage({ q: query || undefined, limit: 8 })
      .then((r) => !cancelled && setResults(r.items))
      .catch(() => !cancelled && setResults([]));
    return () => {
      cancelled = true;
    };
  }, [adding, query]);

  function change(fn: (list: PlanEntry[]) => PlanEntry[]) {
    dirty.current = true;
    setEntries(fn);
  }

  function addRecipe(r: RecipeCardData) {
    if (!adding) return;
    const { day, meal } = adding;
    change((list) => [...list, { day, meal, servings: 4, recipe: { _id: r.id, title: r.title, slug: r.slug ?? '', imageUrl: r.imageUrl } }]);
    setAdding(null);
  }

  const busy = status === 'loading' || status === 'pending' || status === 'saving';
  const statusText: Record<Status, string> = {
    loading: 'Carregando…',
    idle: '',
    pending: 'Salvando…',
    saving: 'Salvando…',
    saved: 'Salvo',
    error: 'Não consegui falar com a API. Confira o servidor e tente de novo.',
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Planejador</div>
          <h1 className="mt-1.5 text-5xl leading-[1.05] tracking-[-0.03em] sm:text-6xl">Cardápio da semana</h1>
        </div>
        <Link to={`/shopping-list?week=${week}`} className="btn-primary">
          Ver lista de compras
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button type="button" aria-label="Semana anterior" disabled={busy} onClick={() => setWeek(addDays(week, -7))} className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-espresso text-xl disabled:opacity-40">
          ‹
        </button>
        <h2 className="min-w-44 text-center text-2xl tracking-[-0.02em]">{formatWeek(week)}</h2>
        <button type="button" aria-label="Próxima semana" disabled={busy} onClick={() => setWeek(addDays(week, 7))} className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-espresso text-xl disabled:opacity-40">
          ›
        </button>
        <button type="button" disabled={busy} onClick={() => setWeek(mondayOf())} className="font-semibold text-tomato underline disabled:opacity-40">
          Esta semana
        </button>
        <span role="status" aria-live="polite" className={`ml-auto text-sm ${status === 'error' ? 'text-chili' : 'text-cacau'}`}>
          {statusText[status]}
        </span>
      </div>

      {adding && (
        <div className="mt-8 rounded-card border-2 border-espresso bg-paper p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl tracking-[-0.02em]">
              Adicionar em {dayLabel(week, adding.day).name} · {MEALS.find((m) => m.id === adding.meal)?.label}
            </h2>
            <button type="button" onClick={() => setAdding(null)} className="font-semibold text-tomato underline">
              Cancelar
            </button>
          </div>
          <form
            role="search"
            className="mt-4 flex max-w-lg flex-wrap items-center gap-3 rounded-full border-2 border-espresso bg-white py-1.5 pl-5 pr-1.5"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              setQuery(text.trim());
            }}
          >
            <label htmlFor="picker-busca" className="sr-only">
              Buscar receita para o plano
            </label>
            <input
              id="picker-busca"
              type="search"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Buscar receita…"
              className="min-w-0 flex-[1_1_160px] bg-transparent py-2 text-lg outline-none"
            />
            <button type="submit" className="btn-primary min-h-11">
              Buscar
            </button>
          </form>
          <div className="mt-5" aria-live="polite">
            {results === null && <p className="text-cacau">Buscando…</p>}
            {results && results.length === 0 && <p className="text-cacau">Nenhuma receita encontrada.</p>}
            {results && results.length > 0 && (
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
                {results.map((r) => (
                  <li key={r.id}>
                    <button type="button" onClick={() => addRecipe(r)} className="flex w-full items-center gap-3 rounded-2xl border border-line bg-cream p-2.5 text-left hover:border-espresso">
                      {r.imageUrl ? (
                        <img src={r.imageUrl} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                      ) : (
                        <span className="h-14 w-14 shrink-0 rounded-xl bg-sand" aria-hidden="true" />
                      )}
                      <span className="font-semibold leading-tight">{r.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
        {Array.from({ length: 7 }, (_, day) => {
          const label = dayLabel(week, day);
          return (
            <section key={day} className="flex flex-col gap-4 rounded-card border border-line bg-paper p-5" aria-label={label.name}>
              <h3 className="flex items-baseline justify-between text-2xl tracking-[-0.02em]">
                {label.name}
                <span className="font-sans text-sm font-semibold text-cacau">{label.date}</span>
              </h3>
              {MEALS.map((m) => {
                const slot = entries.map((e, index) => ({ e, index })).filter(({ e }) => e.day === day && e.meal === m.id);
                return (
                  <div key={m.id} className="flex flex-col gap-2">
                    <div className="text-[13px] font-bold uppercase tracking-[0.1em] text-caramel">{m.label}</div>
                    {slot.map(({ e, index }) => (
                      <div key={`${e.recipe._id}-${index}`} className="flex flex-col gap-2 rounded-2xl bg-cream p-3">
                        {e.recipe.slug ? (
                          <Link to={`/recipes/${e.recipe.slug}`} className="font-semibold leading-tight hover:text-tomato">
                            {e.recipe.title}
                          </Link>
                        ) : (
                          <span className="font-semibold leading-tight">{e.recipe.title}</span>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2" role="group" aria-label={`Porções de ${e.recipe.title}`}>
                            <button type="button" aria-label="Diminuir porções" disabled={e.servings <= 1} onClick={() => change((l) => l.map((x, i) => (i === index ? { ...x, servings: x.servings - 1 } : x)))} className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-espresso disabled:opacity-40">
                              −
                            </button>
                            <output className="min-w-12 text-center text-sm font-semibold">{e.servings} porç.</output>
                            <button type="button" aria-label="Aumentar porções" disabled={e.servings >= 50} onClick={() => change((l) => l.map((x, i) => (i === index ? { ...x, servings: x.servings + 1 } : x)))} className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-espresso disabled:opacity-40">
                              +
                            </button>
                          </div>
                          <button type="button" aria-label={`Remover ${e.recipe.title}`} onClick={() => change((l) => l.filter((_, i) => i !== index))} className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-chili hover:bg-sand">
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      disabled={status === 'loading'}
                      onClick={() => {
                        setText('');
                        setQuery('');
                        setAdding({ day, meal: m.id });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-fit rounded-full border-[1.5px] border-dashed border-[#C9AE8E] px-4 py-2 text-sm font-semibold text-cacau hover:border-espresso hover:text-espresso"
                    >
                      + Adicionar receita
                    </button>
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    </section>
  );
}
