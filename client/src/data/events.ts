/**
 * Calendário gastronômico (datas fixas de 2026 a meados de 2027).
 * Datas móveis (Thanksgiving, Hanukkah, Páscoa, Dia das Mães) estão escritas já resolvidas:
 * revise esta lista a cada ano ou, mais adiante, mova-a para o banco com um painel de admin.
 */
export type EventFilter = { diet?: 'vegetariana' | 'vegana'; category?: string; q?: string };

export type FoodEvent = {
  id: string;
  /** AAAA-MM-DD */
  date: string;
  title: string;
  origin: string;
  text: string;
  note?: string;
  filter: EventFilter;
};

export const foodEvents: FoodEvent[] = [
  { id: 'vegetariano-2026', date: '2026-10-01', title: 'Dia Mundial do Vegetarianismo', origin: 'Em todo o mundo', text: 'Uma data para provar pratos sem carne que não deixam nada a desejar.', filter: { diet: 'vegetariana' } },
  { id: 'alimentacao-2026', date: '2026-10-16', title: 'Dia Mundial da Alimentação', origin: 'Em todo o mundo', text: 'Dia de pensar em como e o que comemos, e de aproveitar cada ingrediente.', filter: {} },
  { id: 'halloween-2026', date: '2026-10-31', title: 'Halloween', origin: 'Tradição anglo-saxã', text: 'Doces temáticos e receitas com abóbora para a noite das fantasias.', filter: { category: 'doces-e-sobremesas' } },
  { id: 'vegano-2026', date: '2026-11-01', title: 'Dia Mundial do Veganismo', origin: 'Em todo o mundo', text: 'Receitas sem nenhum ingrediente de origem animal, do prato principal à sobremesa.', filter: { diet: 'vegana' } },
  { id: 'thanksgiving-2026', date: '2026-11-26', title: 'Thanksgiving', origin: 'Estados Unidos', text: 'Peru assado, purê, torta de abóbora e o que mais couber na mesa.', filter: { q: 'pumpkin' } },
  { id: 'hanukkah-2026', date: '2026-12-04', title: 'Hanukkah', origin: 'Tradição judaica', text: 'Latkes, sufganiyot e outras receitas feitas no azeite.', note: 'Começa ao anoitecer e dura oito noites.', filter: {} },
  { id: 'natal-2026', date: '2026-12-25', title: 'Natal', origin: 'Em todo o mundo', text: 'Ceias de vários países lado a lado, para montar a sua.', filter: { category: 'almoco-e-jantar' } },
  { id: 'reveillon-2026', date: '2026-12-31', title: 'Réveillon', origin: 'Em todo o mundo', text: 'Pratos para a virada do ano e sobremesas para brindar.', filter: { category: 'doces-e-sobremesas' } },
  { id: 'pascoa-2027', date: '2027-03-28', title: 'Páscoa', origin: 'Tradição cristã', text: 'Chocolate, bolos e pratos de peixe para a mesa de Páscoa.', filter: { category: 'doces-e-sobremesas' } },
  { id: 'maes-2027', date: '2027-05-09', title: 'Dia das Mães', origin: 'Brasil', text: 'Café da manhã especial, bolos e sobremesas para homenagear quem cozinha com a gente.', filter: { category: 'cafe-da-manha-e-brunch' } },
  { id: 'namorados-2027', date: '2027-06-12', title: 'Dia dos Namorados', origin: 'Brasil', text: 'Jantares para dois e sobremesas para dividir.', filter: { category: 'almoco-e-jantar' } },
  { id: 'junina-2027', date: '2027-06-24', title: 'São João', origin: 'Brasil', text: 'Milho, canjica, pé de moleque e outros clássicos das festas juninas.', filter: { category: 'doces-e-sobremesas' } },
];

const MONTHS_LONG = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export const monthName = (m: number) => MONTHS_LONG[m];

/** Lê "AAAA-MM-DD" como data local (new Date("AAAA-MM-DD") usaria UTC e poderia voltar um dia). */
export function parseDate(iso: string): { year: number; month: number; day: number } {
  const [y, m, d] = iso.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

export function eventParts(e: FoodEvent) {
  const { month, day } = parseDate(e.date);
  return { day: String(day).padStart(2, '0'), monthShort: MONTHS_SHORT[month] };
}

export function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Próximas datas a partir de hoje (inclusive). */
export function upcomingEvents(count: number, today = new Date()): FoodEvent[] {
  const iso = toIso(today);
  return foodEvents.filter((e) => e.date >= iso).slice(0, count);
}

/** Converte o filtro do evento em link da biblioteca de receitas. */
export function recipesLink(filter: EventFilter): string {
  const params = new URLSearchParams();
  if (filter.diet) params.set('diet', filter.diet);
  if (filter.category) params.set('category', filter.category);
  if (filter.q) params.set('q', filter.q);
  const qs = params.toString();
  return qs ? `/recipes?${qs}` : '/recipes';
}
