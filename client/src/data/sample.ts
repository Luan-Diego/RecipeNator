import type { RecipeCardData } from '../types';

/** Dados de exemplo da Home: reserva usada quando a API está fora do ar ou sem receitas importadas. */
export type SampleRecipe = RecipeCardData;

export const trending: SampleRecipe[] = [
  { id: 'moqueca-de-peixe', title: 'Moqueca de peixe com dendê', meta: 'Brasileira · Almoço e jantar', time: '50 min', level: 'Médio', rating: '4,8', bg: '#F8DFB4', plate: { variant: 'mix', c1: '#E0702B', c2: '#F2B233', c3: '#5FA05A' } },
  { id: 'ramen-shoyu', title: 'Ramen caseiro de shoyu', meta: 'Japonesa · Sopas e caldos', time: '40 min', level: 'Médio', rating: '4,9', bg: '#F3C9B8', plate: { variant: 'bowl', c1: '#5B3420', c2: '#E9B04A', c3: '#FBF3E8' } },
  { id: 'pizza-tomate-manjericao', title: 'Pizza de tomate e manjericão', meta: 'Italiana · Massas e pizzas', time: '35 min', level: 'Fácil', rating: '4,7', diet: 'vegetariana', bg: '#F6D3C4', plate: { variant: 'pizza', c1: '#C98A3E', c2: '#E0702B', c3: '#2F6B3F' } },
  { id: 'bolo-de-cenoura', title: 'Bolo de cenoura com chocolate', meta: 'Brasileira · Doces e sobremesas', time: '60 min', level: 'Fácil', rating: '4,9', bg: '#F2D9B6', plate: { variant: 'mix', c1: '#7A3E1E', c2: '#E0702B', c3: '#FBF3E8' } },
  { id: 'costela-no-bafo', title: 'Costela no bafo', meta: 'Churrasco', time: '3 h', level: 'Difícil', rating: '4,8', bg: '#EFC9B0', plate: { variant: 'mix', c1: '#8F2415', c2: '#C98A3E', c3: '#F2B233' } },
  { id: 'pao-de-queijo', title: 'Pão de queijo mineiro', meta: 'Brasileira · Lanches e petiscos', time: '45 min', level: 'Fácil', rating: '4,8', diet: 'sem-gluten', bg: '#F7E1AE', plate: { variant: 'mix', c1: '#E9B04A', c2: '#F2B233', c3: '#FBF3E8' } },
  { id: 'pudim-de-leite', title: 'Pudim de leite condensado', meta: 'Brasileira · Doces e sobremesas', time: '1 h 30', level: 'Médio', rating: '4,9', bg: '#F4D7BD', plate: { variant: 'bowl', c1: '#B8321C', c2: '#F2B233', c3: '#FBF3E8' } },
  { id: 'risoto-de-cogumelos', title: 'Risoto cremoso de cogumelos', meta: 'Italiana · Almoço e jantar', time: '45 min', level: 'Médio', rating: '4,7', diet: 'vegetariana', bg: '#F3E0B5', plate: { variant: 'bowl', c1: '#C98A3E', c2: '#F6E3B0', c3: '#2F6B3F' } },
];

export const plantBased: SampleRecipe[] = [
  { id: 'curry-grao-de-bico', title: 'Curry de grão-de-bico e espinafre', meta: 'Indiana · 30 min · Fácil', time: '30 min', level: 'Fácil', rating: '4,8', diet: 'vegana', bg: '#CFE3BF', plate: { variant: 'bowl', c1: '#E0A22A', c2: '#F2B233', c3: '#2F6B3F' } },
  { id: 'tacos-de-cogumelos', title: 'Tacos de cogumelos', meta: 'Mexicana · 25 min · Fácil', time: '25 min', level: 'Fácil', rating: '4,7', diet: 'vegana', bg: '#CFE3BF', plate: { variant: 'mix', c1: '#8A5A3B', c2: '#5FA05A', c3: '#B8321C' } },
  { id: 'salada-de-lentilha', title: 'Salada morna de lentilha', meta: 'Mediterrânea · 20 min · Fácil', time: '20 min', level: 'Fácil', rating: '4,8', diet: 'vegetariana', bg: '#CFE3BF', plate: { variant: 'mix', c1: '#5FA05A', c2: '#2F6B3F', c3: '#F2B233' } },
];

export const categories = [
  { name: 'Doces e sobremesas', slug: 'doces-e-sobremesas', sub: 'Bolos, tortas, pudins', cls: 'bg-saffron text-espresso', dot: 'bg-paprika' },
  { name: 'Salgados', sub: 'Assados, fritos e petiscos', cls: 'bg-paprika text-espresso', dot: 'bg-saffron' },
  { name: 'Massas e pizzas', slug: 'massas-e-pizzas', sub: 'Frescas, recheadas, de forno', cls: 'bg-tomato text-white', dot: 'bg-chili' },
  { name: 'Sopas e caldos', sub: 'Cremes e ensopados', cls: 'bg-roast text-cream', dot: 'bg-caramel' },
  { name: 'Churrasco', sub: 'Carnes, marinadas, grelha', cls: 'bg-chili text-cream', dot: 'bg-tomato' },
  { name: 'Café da manhã', slug: 'cafe-da-manha-e-brunch', sub: 'Pães, ovos, panquecas', cls: 'bg-sand text-espresso', dot: 'bg-saffron' },
  { name: 'Bebidas e drinks', sub: 'Sucos, cafés, coquetéis', cls: 'bg-espresso text-saffron', dot: 'bg-roast' },
  { name: 'Pães e panificação', sub: 'Fermentação e forno', cls: 'bg-caramel text-white', dot: 'bg-paprika' },
];

export const events = [
  { day: '26', month: 'nov', title: 'Thanksgiving', origin: 'Estados Unidos', text: 'Peru assado, purê, torta de abóbora e o que mais couber na mesa.', color: 'text-saffron' },
  { day: '04', month: 'dez', title: 'Hanukkah', origin: 'Tradição judaica · começa ao anoitecer', text: 'Latkes, sufganiyot e outras receitas feitas no azeite.', color: 'text-paprika' },
  { day: '25', month: 'dez', title: 'Natal', origin: 'Em todo o mundo', text: 'Ceias de vários países lado a lado, para montar a sua.', color: 'text-saffron' },
];

export const dietFilters = ['Todas', 'Low carb', 'Keto', 'Vegetariana', 'Vegana', 'Sem glúten', 'Proteica'];
