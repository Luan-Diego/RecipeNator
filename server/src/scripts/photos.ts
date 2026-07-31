/**
 * Coloca fotos reais nas receitas da casa: busca no Pexels e guarda no seu Cloudinary.
 *
 *   npm run photos                       só as receitas que ainda não têm foto
 *   npm run photos -- --force            refaz todas
 *   npm run photos -- --only <slug>      só uma receita
 *   npm run photos -- --pick 2           usa o 2º resultado da busca em vez do 1º (1 a 5)
 *
 * Precisa de PEXELS_API_KEY e das três CLOUDINARY_* no server/.env.
 */
import mongoose from 'mongoose';
import { cloudinary } from '../config/cloudinary.js';
import { connectDb } from '../config/db.js';
import { env } from '../config/env.js';
import { photoQueries } from '../data/photoQueries.js';
import { Recipe } from '../models/Recipe.js';
import { uploadFromUrl } from '../services/cloudinaryUpload.js';
import { searchPexels } from '../services/pexels.js';

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : undefined;
const pickArg = args.includes('--pick') ? Number(args[args.indexOf('--pick') + 1]) : 1;
const pick = Number.isInteger(pickArg) && pickArg >= 1 && pickArg <= 5 ? pickArg : 1;

async function main() {
  if (!env.PEXELS_API_KEY) throw new Error('Falta PEXELS_API_KEY no server/.env (chave gratuita em pexels.com/api).');
  if (!cloudinary) throw new Error('Faltam as variáveis CLOUDINARY_* no server/.env.');

  await connectDb();
  const filter: Record<string, unknown> = { source: 'recipenator' };
  if (only) filter.slug = only;
  const recipes = await Recipe.find(filter).select('title slug imageUrl');

  let done = 0;
  for (const recipe of recipes) {
    if (recipe.imageUrl && !force) {
      console.log(`- ${recipe.slug}: já tem foto (use --force para refazer)`);
      continue;
    }
    const query = photoQueries[recipe.title] ?? recipe.title;
    try {
      const results = await searchPexels(query, 5);
      const photo = results[Math.min(pick, results.length) - 1];
      if (!photo) {
        console.log(`- ${recipe.slug}: nenhuma foto encontrada para "${query}"`);
        continue;
      }
      const url = await uploadFromUrl(photo.imageUrl, recipe.slug);
      await Recipe.updateOne(
        { _id: recipe._id },
        { $set: { imageUrl: url, imageCredit: photo.photographer, imageCreditUrl: photo.pageUrl } },
      );
      done++;
      console.log(`✓ ${recipe.slug}: foto de ${photo.photographer}`);
    } catch (err) {
      console.error(`✗ ${recipe.slug}: ${(err as Error).message}`);
    }
  }
  console.log(`Fotos atualizadas: ${done}`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
