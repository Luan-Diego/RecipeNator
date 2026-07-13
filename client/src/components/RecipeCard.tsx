import { Link } from 'react-router-dom';
import type { Diet, RecipeCardData } from '../types';
import PlateIllustration from './PlateIllustration';

const dietBadge: Record<Diet, { label: string; cls: string }> = {
  vegetariana: { label: 'Vegetariana', cls: 'bg-herb text-white' },
  vegana: { label: 'Vegana', cls: 'bg-herb-deep text-mint' },
  'sem-gluten': { label: 'Sem glúten', cls: 'bg-espresso text-cream' },
};

type Props = {
  recipe: RecipeCardData;
  /** Variante verde usada na seção "Cozinha das plantas". */
  plant?: boolean;
};

export default function RecipeCard({ recipe, plant = false }: Props) {
  const badge = recipe.diet ? dietBadge[recipe.diet] : null;
  const hasStats = recipe.time || recipe.level || recipe.rating;

  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-card border ${
        plant ? 'border-[#C9DDB9] bg-white' : 'border-line bg-paper'
      }`}
    >
      <div
        className="relative flex aspect-[4/3] items-center justify-center overflow-hidden"
        style={{ backgroundColor: recipe.bg }}
      >
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          recipe.plate && (
            <div className="aspect-square w-[74%] rounded-full shadow-[0_16px_22px_-16px_rgba(42,23,16,0.55)]">
              <PlateIllustration {...recipe.plate} />
            </div>
          )
        )}
        {badge && (
          <span className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-[13px] font-bold ${badge.cls}`}>
            {badge.label}
          </span>
        )}
        {!plant && (
          <button
            type="button"
            aria-label="Salvar receita"
            className="absolute right-3.5 top-3.5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-paper"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2A1710" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20s-7-4.4-9-9.2C1.8 7.4 4 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3 0 5.2 2.9 4 6.3C19 15.6 12 20 12 20z" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2.5 px-5 pb-6 pt-5">
        {!plant && <div className="text-[13px] font-bold uppercase tracking-[0.1em] text-caramel">{recipe.meta}</div>}
        <h3 className={`text-[23px] leading-tight ${plant ? 'text-herb-deep' : ''}`}>
          {recipe.slug ? (
            // Link esticado: o card inteiro fica clicável
            <Link to={`/recipes/${recipe.slug}`} className="after:absolute after:inset-0 after:content-[''] hover:underline">
              {recipe.title}
            </Link>
          ) : (
            recipe.title
          )}
        </h3>
        {plant ? (
          <div className="text-[15px] font-medium text-herb">{recipe.meta}</div>
        ) : (
          hasStats && (
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[15px] text-cacau">
              {recipe.time && <span>{recipe.time}</span>}
              {recipe.level && <span>{recipe.level}</span>}
              {recipe.rating && (
                <span className="flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#E0702B" aria-hidden="true">
                    <path d="M12 2l3 6.5 7 .9-5.2 4.8 1.4 7L12 17.8 5.8 21.2l1.4-7L2 9.4l7-.9z" />
                  </svg>
                  {recipe.rating}
                </span>
              )}
            </div>
          )
        )}
      </div>
    </article>
  );
}
