import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryList, fetchDiscover, type Facet } from '../services/api';

const container = 'mx-auto max-w-7xl px-5 sm:px-10';

const tileStyles = [
  { cls: 'bg-saffron text-espresso', dot: 'bg-paprika' },
  { cls: 'bg-paprika text-espresso', dot: 'bg-saffron' },
  { cls: 'bg-tomato text-white', dot: 'bg-chili' },
  { cls: 'bg-roast text-cream', dot: 'bg-caramel' },
  { cls: 'bg-chili text-cream', dot: 'bg-tomato' },
  { cls: 'bg-sand text-espresso', dot: 'bg-saffron' },
  { cls: 'bg-caramel text-white', dot: 'bg-paprika' },
  { cls: 'bg-espresso text-saffron', dot: 'bg-roast' },
];

export default function Discover() {
  const [data, setData] = useState<{ cuisines: Facet[]; tags: Facet[] } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchDiscover()
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className={`${container} py-14`}>
      <div className="eyebrow">Explorar</div>
      <h1 className="mt-1.5 text-5xl leading-[1.05] tracking-[-0.03em] sm:text-6xl">Vá pelo caminho que der fome</h1>

      {/* ESTILOS E CATEGORIAS (não dependem de dados do banco) */}
      <div className="mt-10 flex flex-wrap gap-4">
        <Link to="/recipes?diet=vegana" className="rounded-card bg-mint px-6 py-5 text-herb-deep">
          <span className="block font-display text-2xl font-semibold tracking-tight">Veganas</span>
          <span className="text-sm font-medium">Sem nenhum ingrediente animal</span>
        </Link>
        <Link to="/recipes?diet=vegetariana" className="rounded-card bg-mint px-6 py-5 text-herb-deep">
          <span className="block font-display text-2xl font-semibold tracking-tight">Vegetarianas</span>
          <span className="text-sm font-medium">Sem carne</span>
        </Link>
        {categoryList.map((c) => (
          <Link key={c.slug} to={`/recipes?category=${c.slug}`} className="rounded-card border border-line bg-paper px-6 py-5">
            <span className="block font-display text-2xl font-semibold tracking-tight">{c.name}</span>
            <span className="text-sm font-medium text-cacau">Categoria</span>
          </Link>
        ))}
      </div>

      {/* CULINÁRIAS */}
      <div className="mt-16">
        <h2 className="text-4xl tracking-[-0.03em]">Culinárias do mundo</h2>
        <div className="mt-6" aria-live="polite">
          {error && <p className="rounded-card bg-sand p-8 text-lg text-roast">Não consegui falar com a API. Confira se o servidor está rodando.</p>}
          {!error && !data && <p className="text-lg text-cacau">Carregando…</p>}
          {data && data.cuisines.length === 0 && (
            <p className="rounded-card bg-sand p-8 text-lg text-roast">
              Ainda não há receitas no banco. Importe algumas com <code>npm run import:mealdb -- --limit 5</code>.
            </p>
          )}
          {data && data.cuisines.length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {data.cuisines.map((c, i) => {
                const s = tileStyles[i % tileStyles.length];
                return (
                  <Link
                    key={c.name}
                    to={`/recipes?cuisine=${encodeURIComponent(c.name)}`}
                    className={`relative flex min-h-[150px] flex-col justify-end overflow-hidden rounded-card p-5 ${s.cls}`}
                  >
                    <span className={`absolute -right-7 -top-7 h-24 w-24 rounded-full ${s.dot}`} />
                    <span className="font-display text-2xl font-semibold leading-tight tracking-tight">{c.name}</span>
                    <span className="mt-1 text-sm opacity-90">
                      {c.count} {c.count === 1 ? 'receita' : 'receitas'}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* HASHTAGS */}
      {data && data.tags.length > 0 && (
        <div className="mt-16">
          <h2 className="text-4xl tracking-[-0.03em]">Hashtags em alta</h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {data.tags.map((t) => (
              <li key={t.name}>
                <Link
                  to={`/recipes?tag=${encodeURIComponent(t.name)}`}
                  className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#C9AE8E] px-4 py-2.5 font-semibold hover:border-espresso"
                >
                  #{t.name.replace(/\s+/g, '')}
                  <span className="rounded-full bg-sand px-2 py-0.5 text-xs text-roast">{t.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
