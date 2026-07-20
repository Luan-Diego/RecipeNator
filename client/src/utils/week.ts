import { monthName, parseDate, toIso } from '../data/events';

/** Segunda-feira da semana de `d`, no formato AAAA-MM-DD. */
export function mondayOf(d: Date = new Date()): string {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  copy.setDate(copy.getDate() - ((copy.getDay() + 6) % 7));
  return toIso(copy);
}

export function addDays(iso: string, n: number): string {
  const { year, month, day } = parseDate(iso);
  return toIso(new Date(year, month, day + n));
}

const short = (iso: string) => {
  const { month, day } = parseDate(iso);
  return `${day} ${monthName(month).slice(0, 3).toLowerCase()}`;
};

/** "9 nov a 15 nov" */
export function formatWeek(weekIso: string): string {
  return `${short(weekIso)} a ${short(addDays(weekIso, 6))}`;
}

export const dayLabel = (weekIso: string, index: number) => {
  const names = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  return { name: names[index], date: short(addDays(weekIso, index)) };
};
