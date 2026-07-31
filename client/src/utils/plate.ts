import type { PlateVariant } from '../components/PlateIllustration';
import type { Diet } from '../types';

type Plate = { variant: PlateVariant; c1: string; c2: string; c3: string };

const WARM: Omit<Plate, 'variant'>[] = [
  { c1: '#E0702B', c2: '#F2B233', c3: '#5FA05A' },
  { c1: '#7A3E1E', c2: '#E0702B', c3: '#FBF3E8' },
  { c1: '#B8321C', c2: '#F2B233', c3: '#FBF3E8' },
  { c1: '#C98A3E', c2: '#E0702B', c3: '#8F2415' },
  { c1: '#8F2415', c2: '#C98A3E', c3: '#F2B233' },
  { c1: '#E9B04A', c2: '#F6E3B0', c3: '#B8321C' },
];

// Verde só para receitas vegetarianas e veganas
const GREEN: Omit<Plate, 'variant'>[] = [
  { c1: '#5FA05A', c2: '#2F6B3F', c3: '#F2B233' },
  { c1: '#2F6B3F', c2: '#CFE3BF', c3: '#E0702B' },
  { c1: '#8A5A3B', c2: '#5FA05A', c3: '#B8321C' },
];

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Prato ilustrado para receitas sem foto. É sempre o mesmo para a mesma receita
 * (calculado a partir do endereço dela), então os cards não "mudam" a cada visita.
 */
export function plateFor(key: string, diet?: Diet, category?: string): Plate {
  const h = hash(key);
  const palettes = diet === 'vegana' || diet === 'vegetariana' ? GREEN : WARM;
  const variants: PlateVariant[] = category === 'massas-e-pizzas' ? ['pizza', 'bowl'] : ['mix', 'bowl', 'mix'];
  return { variant: variants[h % variants.length], ...palettes[(h >> 3) % palettes.length] };
}
