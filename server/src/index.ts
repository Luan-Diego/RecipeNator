import { app } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';

async function main() {
  await connectDb();
  app.listen(env.PORT, () => {
    console.log(`API do RecipeNator em http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('Falha ao iniciar o servidor:', err);
  process.exit(1);
});
