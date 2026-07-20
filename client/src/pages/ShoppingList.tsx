import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { mealPlanApi, type PlanEntry } from '../services/mealPlan';
import { aggregateIngredients } from '../utils/shopping';
import { addDays, formatWeek, mondayOf } from '../utils/week';

const storageKey = (week: string) => `recipenator:shopping:${week}`;

function loadChecked(week: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(week));
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export default function ShoppingList() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('week');
  const week = requested && /^\d{4}-\d{2}-\d{2}$/.test(requested) ? requested : mondayOf();

  const [entries, setEntries] = useState<PlanEntry[] | null>(null);
  const [error, setError] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(() => loadChecked(week));
  const [copied, setCopied] = useState('');

  useEffect(() => {
    let cancelled = false;
    setEntries(null);
    setError(false);
    setChecked(loadChecked(week));
    mealPlanApi
      .get(week)
      .then((e) => !cancelled && setEntries(e))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [week]);

  const items = useMemo(() => aggregateIngredients(entries ?? []), [entries]);

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      try {
        localStorage.setItem(storageKey(week), JSON.stringify([...next]));
      } catch {
        /* sem armazenamento local: a marcação vale só até recarregar */
      }
      return next;
    });
  }

  async function copyList() {
    const text = items.map((i) => `- ${i.name}${i.amounts.length ? `: ${i.amounts.join(' + ')}` : ''}`).join('\n');
    try {
      await navigator.clipboard.writeText(`Lista de compras (${formatWeek(week)})\n${text}`);
      setCopied('Lista copiada!');
    } catch {
      setCopied('Não consegui copiar. Use o botão de imprimir.');
    }
    setTimeout(() => setCopied(''), 3000);
  }

  const goWeek = (w: string) => setParams({ week: w });
  const remaining = items.filter((i) => !checked.has(i.key)).length;

  return (
    <section className="mx-auto max-w-3xl px-5 py-14">
      <div className="eyebrow print:hidden">Lista de compras</div>
      <h1 className="mt-1.5 text-5xl leading-[1.05] tracking-[-0.03em]">Semana de {formatWeek(week)}</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3 print:hidden">
        <button type="button" aria-label="Semana anterior" onClick={() => goWeek(addDays(week, -7))} className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-espresso text-xl">
          ‹
        </button>
        <button type="button" aria-label="Próxima semana" onClick={() => goWeek(addDays(week, 7))} className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-espresso text-xl">
          ›
        </button>
        <Link to={`/meal-planner`} className="font-semibold text-tomato underline">
          Voltar ao planejador
        </Link>
      </div>

      <div className="mt-8" aria-live="polite">
        {error && <p className="rounded-card bg-sand p-8 text-lg text-roast">Não consegui carregar o plano desta semana.</p>}
        {!error && entries === null && <p className="text-lg text-cacau">Carregando…</p>}
        {entries && items.length === 0 && (
          <div className="flex flex-col items-start gap-4 rounded-card bg-sand p-8">
            <p className="text-lg text-roast">Esta semana ainda não tem receitas no plano, então não há o que comprar.</p>
            <Link to="/meal-planner" className="btn-primary">
              Planejar a semana
            </Link>
          </div>
        )}
        {items.length > 0 && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
              <p className="text-cacau">
                {remaining === 0 ? 'Tudo no carrinho!' : `${remaining} ${remaining === 1 ? 'item falta' : 'itens faltam'} de ${items.length}`}
              </p>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => void copyList()} className="btn border-[1.5px] border-espresso">
                  Copiar lista
                </button>
                <button type="button" onClick={() => window.print()} className="btn-dark">
                  Imprimir
                </button>
              </div>
            </div>
            {copied && <p role="status" className="mt-2 text-sm text-cacau print:hidden">{copied}</p>}
            <ul className="mt-5 divide-y divide-line rounded-card border border-line bg-paper px-6">
              {items.map((i) => {
                const done = checked.has(i.key);
                return (
                  <li key={i.key}>
                    <label className="flex cursor-pointer items-start gap-4 py-4">
                      <input type="checkbox" checked={done} onChange={() => toggle(i.key)} className="mt-1 h-5 w-5 shrink-0 accent-tomato" />
                      <span className={`flex flex-1 flex-wrap items-baseline justify-between gap-x-4 ${done ? 'text-cacau line-through' : ''}`}>
                        <span className="font-semibold">{i.name}</span>
                        <span className="text-caramel">{i.amounts.join(' + ')}</span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-sm text-cacau">
              Quantidades somadas só quando a unidade é a mesma. Receitas importadas usam as medidas da fonte (em inglês).
            </p>
          </>
        )}
      </div>
    </section>
  );
}
