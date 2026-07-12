import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo';

const links = [
  { to: '/discover', label: 'Explorar' },
  { to: '/recipes', label: 'Receitas' },
  { to: '/calendar', label: 'Calendário' },
  { to: '/meal-planner', label: 'Planejador' },
];

export default function Navbar() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-9 gap-y-3 px-5 py-3 sm:px-10">
        <Logo />
        <nav aria-label="Principal" className="flex grow flex-wrap gap-x-7 gap-y-2 font-medium">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => (isActive ? 'text-tomato' : 'hover:text-tomato')}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="px-2 py-3 font-semibold hover:text-tomato">
            Entrar
          </Link>
          <Link to="/create-recipe" className="btn-dark">
            Publicar receita
          </Link>
        </div>
      </div>
    </header>
  );
}
