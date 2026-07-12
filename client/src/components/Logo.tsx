import { Link } from 'react-router-dom';

type WordmarkProps = {
  className?: string;
  accent?: string;
};

/** Nome da marca: "Recipe" + "Nator" em itálico. */
export function Wordmark({ className = '', accent = 'text-tomato' }: WordmarkProps) {
  return (
    <span className={`font-display font-semibold tracking-tight ${className}`}>
      Recipe<span className={`italic ${accent}`}>Nator</span>
    </span>
  );
}

/** Versão compacta para a barra de navegação: mascote pequeno + nome. */
export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="RecipeNator, página inicial">
      <img src="/mascot.png" alt="" width={44} height={44} className="h-11 w-11 object-contain" />
      <Wordmark className="text-[27px]" />
    </Link>
  );
}
