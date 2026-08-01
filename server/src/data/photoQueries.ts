/**
 * Termos de busca de foto para cada receita da casa (em inglês, porque o Pixabay acha mais resultados).
 * A chave é o título da receita, igual ao de curatedRecipes.ts.
 * Se uma foto não ficar boa, ajuste o termo aqui e rode: npm run photos -- --only <slug> --force
 */
export const photoQueries: Record<string, string> = {
  'Moqueca baiana de peixe': 'brazilian fish stew moqueca',
  'Pão de queijo mineiro': 'brazilian cheese bread pao de queijo',
  'Bolo de cenoura com cobertura de chocolate': 'carrot cake chocolate glaze',
  'Strogonoff de frango': 'chicken stroganoff with rice',
  'Pizza margherita caseira': 'margherita pizza',
  'Curry de grão-de-bico e espinafre': 'chickpea spinach curry',
  'Risoto cremoso de cogumelos': 'mushroom risotto',
  'Pudim de leite condensado': 'caramel flan pudding',
  'Brigadeiro de panela': 'brigadeiro chocolate truffles',
  'Macarrão ao molho de tomate fresco e manjericão': 'spaghetti tomato basil',
  'Tacos de cogumelos': 'mushroom tacos',
  'Panquecas americanas': 'fluffy pancakes',
  'Tapioca de queijo': 'tapioca crepe cheese',
  'Salada morna de lentilha': 'lentil salad',
};
