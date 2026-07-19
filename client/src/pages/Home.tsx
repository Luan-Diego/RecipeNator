import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import { Wordmark } from '../components/Logo';
import { categories, dietFilters, plantBased as plantFallback, trending as trendingFallback } from '../data/sample';
import { eventParts, recipesLink, upcomingEvents } from '../data/events';
import { useRecipes } from '../hooks/useRecipes';

const container = 'mx-auto max-w-7xl px-5 sm:px-10';

function chipClass(label: string) {
  if (label === 'Todas') return 'border-espresso bg-espresso text-cream';
  if (label === 'Vegetariana' || label === 'Vegana') return 'border-herb bg-mint text-herb-deep';
  return 'border-[#C9AE8E]';
}

export default function Home() {
  const { items: trending } = useRecipes({ limit: 8 }, trendingFallback);
  const { items: plantBased } = useRecipes({ diet: 'vegana', limit: 3 }, plantFallback);
  // As 3 próximas datas a partir de hoje
  const events = upcomingEvents(3).map((e, i) => ({
    ...e,
    ...eventParts(e),
    color: i % 2 === 0 ? 'text-saffron' : 'text-paprika',
    to: recipesLink(e.filter),
  }));

  return (
    <>
      {/* HERO */}
      <section className="overflow-hidden">
        <div className={`${container} flex flex-wrap items-center gap-12 pb-16 pt-12 sm:pt-16`}>
          <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-7">
            <div className="eyebrow flex items-center gap-2.5">
              <span className="block h-2.5 w-2.5 rounded-full bg-paprika" />
              Explore. Prepare. Compartilhe.
            </div>
            <h1 className="text-[clamp(48px,7vw,92px)] leading-[0.98] tracking-[-0.035em]">
              O que vamos <span className="italic text-tomato">cozinhar</span> hoje?
            </h1>
            <p className="max-w-[520px] text-xl text-cacau">
              Descubra pratos do mundo todo, publique suas receitas e transforme o cardápio da semana em lista de
              compras.
            </p>
            <form
              role="search"
              className="flex max-w-[600px] flex-wrap items-center gap-3 rounded-full border-2 border-espresso bg-paper py-2 pl-6 pr-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <label htmlFor="ingredientes" className="sr-only">
                Ingredientes que você tem
              </label>
              <input
                id="ingredientes"
                type="text"
                placeholder="Tenho frango, arroz e tomate…"
                className="min-w-0 flex-[1_1_200px] bg-transparent py-2.5 text-lg outline-none placeholder:text-cacau/70"
              />
              <button type="submit" className="btn-primary">
                Buscar receitas
              </button>
            </form>
            <div className="flex flex-wrap items-center gap-2.5 text-[15px]">
              <span className="font-medium text-cacau">Comece por:</span>
              <Link to="/search?time=15" className="rounded-full border-[1.5px] border-espresso px-4 py-2 font-medium">
                Até 15 minutos
              </Link>
              <Link to="/search?cost=low" className="rounded-full border-[1.5px] border-espresso px-4 py-2 font-medium">
                Econômicas
              </Link>
              <Link to="/search?diet=vegana" className="rounded-full border-[1.5px] border-herb bg-mint px-4 py-2 font-semibold text-herb-deep">
                Veganas
              </Link>
            </div>
          </div>

          {/* MASCOTE + NOME */}
          <figure className="m-0 flex min-w-0 flex-[1_1_380px] flex-col items-center">
            <img
              src="/mascot.png"
              alt="Mascote do RecipeNator: um robô de chapéu de chef batendo uma massa em uma tigela"
              className="w-full max-w-[460px]"
            />
            <figcaption className="-mt-2 text-center">
              <Wordmark className="text-[clamp(40px,5vw,60px)]" />
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ESTILOS */}
      <section className="border-y border-line bg-paper">
        <div className={`${container} flex flex-wrap items-center gap-3 py-5`}>
          <span className="mr-2 text-[15px] font-semibold">Estilo alimentar</span>
          {dietFilters.map((label) => (
            <Link
              key={label}
              to={`/search?diet=${encodeURIComponent(label.toLowerCase())}`}
              className={`rounded-full border-[1.5px] px-[18px] py-2.5 text-[15px] font-semibold ${chipClass(label)}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* EM ALTA */}
      <section className={`${container} pb-10 pt-20`}>
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow">Para você</div>
            <h2 className="mt-1.5 text-5xl leading-[1.05] tracking-[-0.03em]">Em alta na cozinha</h2>
          </div>
          <Link to="/recipes" className="border-b-2 border-tomato pb-0.5 font-semibold">
            Ver todas as receitas
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-7">
          {trending.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      </section>

      {/* ANÚNCIO (exemplo) */}
      <section className={`${container} pb-16 pt-4`}>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[22px] border-[1.5px] border-dashed border-[#C9AE8E] px-6 py-4">
          <span className="rounded-md border border-[#C9AE8E] px-2 py-0.5 text-xs font-bold uppercase tracking-[0.12em] text-cacau">
            Patrocinado
          </span>
          <span className="min-w-0 flex-[1_1_320px] text-cacau">
            [NOME DO ANUNCIANTE] — [mensagem curta do anúncio, relacionada a utensílios ou produtos culinários]
          </span>
          <a href="#" className="border-b-2 border-espresso text-[15px] font-semibold">
            [Chamada]
          </a>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className={`${container} pb-20 pt-6`}>
        <div className="mb-9">
          <div className="eyebrow">Categorias</div>
          <h2 className="mt-1.5 text-5xl leading-[1.05] tracking-[-0.03em]">Por onde começar a mesa</h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-5">
          {categories.map((c) => (
            <Link
              key={c.name}
              to={'slug' in c ? `/recipes?category=${c.slug}` : '/recipes'}
              className={`relative flex min-h-[190px] flex-col justify-end overflow-hidden rounded-card p-6 ${c.cls}`}
            >
              <span className={`absolute -right-9 -top-9 h-[130px] w-[130px] rounded-full ${c.dot}`} />
              <span className="font-display text-3xl font-semibold leading-[1.05] tracking-tight">{c.name}</span>
              <span className="mt-1.5 opacity-90">{c.sub}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CALENDÁRIO */}
      <section className="bg-espresso text-cream">
        <div className={`${container} py-20`}>
          <div className="mb-11 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-saffron">Calendário gastronômico</div>
              <h2 className="mt-1.5 max-w-[640px] text-5xl leading-[1.05] tracking-[-0.03em]">
                Cada data tem um prato para contar
              </h2>
            </div>
            <Link to="/calendar" className="border-b-2 border-saffron pb-0.5 font-semibold">
              Abrir calendário completo
            </Link>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
            {events.map((v) => (
              <div key={v.id} className="flex flex-col gap-3.5 rounded-card border border-roast bg-[#3A2218] p-8">
                <div className="flex items-baseline gap-3">
                  <span className={`font-display text-[76px] font-semibold leading-[0.9] tracking-[-0.04em] ${v.color}`}>{v.day}</span>
                  <span className="text-base font-bold uppercase tracking-[0.14em] text-[#E9C9A5]">{v.monthShort}</span>
                </div>
                <h3 className="mt-2 text-[28px]">{v.title}</h3>
                <div className="text-sm font-semibold uppercase tracking-[0.08em] text-[#E9C9A5]">{v.origin}</div>
                <p className="text-[#E9C9A5]">{v.text}</p>
                <Link to={v.to} className="mt-2 font-semibold text-saffron">
                  Ver receitas da data →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COZINHA DAS PLANTAS: verde só aqui e nas etiquetas vegetarianas/veganas */}
      <section className="bg-mint text-herb-deep">
        <div className={`${container} flex flex-wrap gap-12 py-20`}>
          <div className="flex min-w-0 max-w-[420px] flex-[1_1_320px] flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-herb px-3.5 py-1.5 text-[13px] font-bold text-white">Vegetariana</span>
              <span className="rounded-full bg-herb-deep px-3.5 py-1.5 text-[13px] font-bold text-mint">Vegana</span>
            </div>
            <h2 className="text-5xl leading-[1.05] tracking-[-0.03em]">Cozinha das plantas</h2>
            <p className="text-lg">
              Receitas sem carne e sem nenhum ingrediente de origem animal, cada uma com os critérios da etiqueta
              explicados.
            </p>
            <Link to="/search?diet=vegana" className="btn-green mt-2 self-start">
              Ver receitas veganas
            </Link>
          </div>
          <div className="grid min-w-0 flex-[3_1_560px] grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
            {plantBased.map((r) => (
              <RecipeCard key={r.id} recipe={r} plant />
            ))}
          </div>
        </div>
      </section>

      {/* PLANEJAR */}
      <section className={`${container} py-20`}>
        <div className="mb-10 max-w-[680px]">
          <div className="eyebrow">Do prato à compra</div>
          <h2 className="mt-1.5 text-5xl leading-[1.05] tracking-[-0.03em]">
            Escolha a receita. O resto o RecipeNator organiza.
          </h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {[
            { n: '01', cls: 'bg-saffron text-espresso', num: 'text-chili', title: 'Planeje a semana', text: 'Arraste receitas para café, almoço e jantar e ajuste as porções de cada uma.' },
            { n: '02', cls: 'bg-paprika text-espresso', num: 'text-espresso', title: 'Gere a lista de compras', text: 'Os ingredientes repetidos se somam e os itens ficam separados por setor do mercado.' },
            { n: '03', cls: 'bg-tomato text-white', num: 'text-saffron', title: 'Saiba quanto custa', text: 'Veja o custo por porção e compare cardápios antes de ir às compras.' },
          ].map((p) => (
            <div key={p.n} className={`flex flex-col gap-3 rounded-card p-8 ${p.cls}`}>
              <div className={`font-display text-[56px] font-semibold leading-none tracking-[-0.04em] ${p.num}`}>{p.n}</div>
              <h3 className="text-[26px]">{p.title}</h3>
              <p className="opacity-95">{p.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
