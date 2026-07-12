/**
 * Importa receitas da TheMealDB para o MongoDB.
 *
 *   npm run import:mealdb -- --limit 5            (5 receitas por categoria)
 *   npm run import:mealdb -- --limit 3 --category Vegan
 *
 * É seguro rodar mais de uma vez: receitas já importadas são atualizadas, não duplicadas.
 */
import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { Recipe } from '../models/Recipe.js';
import { listCategoryNames, listMealIdsByCategory, lookupMeal, normalizeMeal } from '../services/themealdb.js';
import { slugify } from '../utils/slugify.js';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const limit = Math.max(1, Number(arg('limit') ?? 5));
  const only = arg('category');

  await connectDb();

  const all = await listCategoryNames();
  const names = only ? all.filter((c) => c.toLowerCase() === only.toLowerCase()) : all;
  if (names.length === 0) throw new Error(`Categoria não encontrada. Disponíveis: ${all.join(', ')}`);

  let saved = 0;
  for (const name of names) {
    const ids = (await listMealIdsByCategory(name)).slice(0, limit);
    for (const id of ids) {
      await sleep(250); // sem pressa: a API gratuita não deve ser sobrecarregada
      const raw = await lookupMeal(id);
      const recipe = raw ? normalizeMeal(raw) : null;
      if (!recipe) continue;

      const baseSlug = slugify(recipe.title);
      const filter = { source: recipe.source, sourceId: recipe.sourceId };
      try {
        await Recipe.updateOne(filter, { $set: recipe, $setOnInsert: { slug: baseSlug } }, { upsert: true });
      } catch (err) {
        // Títulos iguais de receitas diferentes: desambigua com o id da origem.
        if ((err as { code?: number }).code !== 11000) throw err;
        await Recipe.updateOne(
          filter,
          { $set: recipe, $setOnInsert: { slug: `${baseSlug}-${recipe.sourceId}` } },
          { upsert: true },
        );
      }
      saved++;
    }
    console.log(`${name}: ${ids.length} receita(s) processada(s)`);
  }

  console.log(`Concluído: ${saved} receita(s) salvas/atualizadas.`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
