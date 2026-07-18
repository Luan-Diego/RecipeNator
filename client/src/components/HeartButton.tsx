import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

type Props = {
  recipeId: string;
  /** false em receitas de exemplo (sem registro no banco): o botão aparece, mas não faz nada. */
  enabled?: boolean;
  className?: string;
  label?: string;
};

export default function HeartButton({ recipeId, enabled = true, className = '', label }: Props) {
  const { user } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();
  const active = enabled && isFavorite(recipeId);

  function onClick() {
    if (!enabled) return;
    if (!user) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    void toggle(recipeId);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
      className={className}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={active ? '#B8321C' : 'none'}
        stroke={active ? '#B8321C' : '#2A1710'}
        strokeWidth="2"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 20s-7-4.4-9-9.2C1.8 7.4 4 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3 0 5.2 2.9 4 6.3C19 15.6 12 20 12 20z" />
      </svg>
      {label && <span className="font-semibold">{active ? 'Nos favoritos' : label}</span>}
    </button>
  );
}
