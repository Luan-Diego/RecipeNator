import { Link } from 'react-router-dom';
import { Wordmark } from './Logo';

const columns = [
  { title: 'Cozinhar', items: [['Explorar', '/discover'], ['Categorias', '/recipes'], ['Calendário', '/calendar']] },
  { title: 'Organizar', items: [['Planejador', '/meal-planner'], ['Lista de compras', '/shopping-list'], ['Custos', '/costs']] },
  { title: 'Conta', items: [['Entrar', '/login'], ['Criar conta', '/register'], ['Publicar receita', '/create-recipe']] },
];

export default function Footer() {
  return (
    <footer className="bg-roast text-cream">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-5 pb-10 pt-16 sm:px-10">
        <div className="flex flex-wrap justify-between gap-10">
          <div className="flex max-w-xs flex-col items-start gap-3">
            <img src="/mascot.png" alt="" width={96} height={96} className="h-24 w-24 object-contain" />
            <Wordmark className="text-[27px]" accent="text-saffron" />
            <p className="text-[#E9C9A5]">Explore. Prepare. Compartilhe.</p>
          </div>
          <div className="flex flex-wrap gap-12">
            {columns.map((c) => (
              <div key={c.title} className="flex flex-col gap-2.5">
                <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-saffron">{c.title}</span>
                {c.items.map(([label, to]) => (
                  <Link key={to} to={to} className="hover:text-saffron">
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <p className="max-w-3xl border-t border-[#7A4A30] pt-6 text-sm text-[#E9C9A5]">
          O RecipeNator é um projeto de portfólio. Contas, receitas e interações criadas por visitantes são
          temporárias e podem ser apagadas diariamente.
        </p>
      </div>
    </footer>
  );
}
