/**
 * Carrega (ou atualiza) as receitas da casa manualmente:  npm run seed
 * O servidor já faz isso sozinho ao iniciar, a menos que SEED_CURATED=false.
 */
import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { seedCuratedRecipes } from '../services/seed.js';

async function main() {
  await connectDb();
  const total = await seedCuratedRecipes();
  console.log(`Receitas da casa no banco: ${total}`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
