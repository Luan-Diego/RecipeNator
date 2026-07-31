import { app } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { seedCuratedRecipes } from './services/seed.js';

async function main() {
  await connectDb();
  if (env.SEED_CURATED === 'true') {
    const total = await seedCuratedRecipes();
    console.log(`Receitas da casa disponíveis: ${total}`);
  }
  app.listen(env.PORT, () => {
    console.log(`API do RecipeNator em http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('Falha ao iniciar o servidor:', err);
  process.exit(1);
});
