import { curatedRecipes } from '../data/curatedRecipes.js';
import { Recipe } from '../models/Recipe.js';
import { slugify } from '../utils/slugify.js';

/**
 * Garante que as receitas da casa existam no banco. Pode rodar quantas vezes quiser:
 * atualiza o conteúdo de cada receita, mas não mexe em foto, destaque e avaliações já registrados.
 * Devolve quantas receitas da casa existem.
 */
export async function seedCuratedRecipes(): Promise<number> {
  for (const r of curatedRecipes) {
    const baseSlug = slugify(r.title);
    const filter = { source: 'recipenator', sourceId: baseSlug };
    const content = {
      title: r.title,
      category: r.category,
      cuisine: r.cuisine,
      diets: r.diets,
      tags: r.tags,
      ingredients: r.ingredients,
      steps: r.steps,
      language: 'pt',
      isImported: false,
    };

    try {
      await Recipe.updateOne(
        filter,
        { $set: content, $setOnInsert: { slug: baseSlug, featured: r.featured, featuredOrder: r.featuredOrder } },
        { upsert: true },
      );
    } catch (err) {
      // Já existe uma receita de usuário com o mesmo endereço: a da casa usa um sufixo
      if ((err as { code?: number }).code !== 11000) throw err;
      await Recipe.updateOne(
        filter,
        { $set: content, $setOnInsert: { slug: `${baseSlug}-da-casa`, featured: r.featured, featuredOrder: r.featuredOrder } },
        { upsert: true },
      );
    }
  }
  return Recipe.countDocuments({ source: 'recipenator' });
}
