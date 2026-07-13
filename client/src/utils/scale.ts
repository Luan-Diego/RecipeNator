const FRACTIONS: [number, string][] = [
  [0.25, '1/4'],
  [1 / 3, '1/3'],
  [0.5, '1/2'],
  [2 / 3, '2/3'],
  [0.75, '3/4'],
];

function formatNumber(n: number): string {
  const whole = Math.floor(n);
  const frac = n - whole;
  if (frac < 0.04) return String(whole);
  if (frac > 0.96) return String(whole + 1);
  const near = FRACTIONS.find(([v]) => Math.abs(v - frac) < 0.04);
  if (near) return whole > 0 ? `${whole} ${near[1]}` : near[1];
  return (Math.round(n * 10) / 10).toString().replace('.', ',');
}

/**
 * Multiplica a quantidade que abre o texto: "1 1/2 cups flour" x2 -> "3 cups flour".
 * Se o texto não começa com número (ex.: "to taste") ou é uma faixa ("1-2"), devolve igual.
 * Fórmula do documento: nova = original x (porções desejadas / porções originais).
 */
export function scaleMeasure(measure: string, factor: number): string {
  if (factor === 1) return measure;
  const m = measure.match(/^\s*(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?)(.*)$/s);
  if (!m) return measure;
  const [, rawNumber, rest] = m;
  if (/^\s*[-–]/.test(rest)) return measure;

  let value: number;
  if (rawNumber.includes('/')) {
    const parts = rawNumber.trim().split(/\s+/);
    const [a, b] = parts[parts.length - 1].split('/').map(Number);
    value = (parts.length === 2 ? Number(parts[0]) : 0) + a / b;
  } else {
    value = Number(rawNumber.replace(',', '.'));
  }
  return `${formatNumber(value * factor)}${rest}`;
}
