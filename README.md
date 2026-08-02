# RecipeNator

Plataforma gastronômica: descubra, publique e organize receitas. **Explore. Prepare. Compartilhe.**

Stack: React + TypeScript + Vite + Tailwind CSS (client) · Node.js + Express + MongoDB/Mongoose + Zod (server).

## Como rodar

Em dois terminais, a partir da pasta do projeto:

```bash
# 1) API
cd server
cp .env.example .env     # ajuste MONGODB_URI e preencha JWT_SECRET (o comando para gerar está no arquivo)
npm install
npm run dev              # http://localhost:4000/api/health

# 2) Site
cd client
npm install
npm run dev              # http://localhost:5173
```

## Receitas da casa e destaques

- O site já nasce com receitas: 14 receitas em português (`server/src/data/curatedRecipes.ts`) entram no banco
  sozinhas quando o servidor inicia. Rodar de novo só atualiza o texto; não mexe em foto, destaque nem avaliações.
- Para carregar manualmente: `npm run seed` (em `server/`). Para desligar a carga automática: `SEED_CURATED=false` no `.env`.
- As 8 marcadas com `featured: true` formam a seção **Escolhas do RecipeNator** na Home (ordem em `featuredOrder`)
  e a lista `/recipes?featured=true`. A API aceita `?featured=true|false` e `?sort=title|recent|featured`.
- Receitas sem foto mostram um prato ilustrado (verde só para vegetarianas e veganas).
- Explicação do Cloudinary em linguagem simples: `docs/cloudinary.md`.
- Fotos reais para as receitas da casa (Pixabay + Cloudinary): `npm run photos`, veja `docs/fotos.md`.

## Coleções e compartilhamento

- `/collections` (exige login): crie coleções pessoais ("Jantares de semana", "Para o Natal") e abra cada uma em `/collections/:id`
  para renomear, excluir ou remover receitas. Limites: 30 coleções por pessoa e 200 receitas por coleção.
- Na página da receita: **Salvar em coleção** (marca e desmarca coleções, ou cria uma nova na hora) e **Compartilhar**
  (copiar link, WhatsApp, menu de compartilhamento do aparelho e impressão).
- API: `GET/POST /api/collections`, `GET/PATCH/DELETE /api/collections/:id`, `POST /api/collections/:id/recipes`,
  `DELETE /api/collections/:id/recipes/:recipeId`.

## Busca por ingredientes

- A barra da Home ("Tenho frango, arroz e tomate…") leva a `/search?ingredients=...`, que lista as receitas ordenadas pelos
  ingredientes que você já tem e mostra quantos itens faltam. Sal, água, óleo, azeite e pimenta não contam como faltando.
- API: `GET /api/recipes/by-ingredients?items=frango,arroz,tomate`. Ignora acentos e maiúsculas e aceita plural.
- Funciona melhor com as receitas em português (da casa e de usuários). As importadas da TheMealDB estão em inglês.

## Receitas da TheMealDB (API gratuita)

Com a API e o MongoDB rodando, importe algumas receitas por categoria:

```bash
cd server
npm run import:mealdb -- --limit 5      # 5 por categoria
npm run import:mealdb -- --limit 3 --category Vegan
```

Depois: `GET /api/recipes`, `/api/recipes?category=massas-e-pizzas&diet=vegetariana&q=tomate`,
`/api/recipes/:slug` e `/api/categories`.

Observações:
- A chave gratuita (`1`) da TheMealDB é para desenvolvimento e estudo. Antes de publicar de forma
  aberta, confira os termos em https://themealdb.com/documentation.
- As receitas importadas estão **em inglês** (`language: "en"`); categorias e culinárias já são mapeadas
  para o português (`server/src/config/categories.ts`).
- As fotos são usadas pela URL da origem (não copiadas para o Cloudinary).

## Contas e login

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
- Senhas com hash (bcrypt) e sessão em cookie `httpOnly` (7 dias); o JavaScript da página não lê o token.
- Tentativas de login/cadastro limitadas a 20 a cada 15 minutos por IP.
- Em produção com site e API em domínios diferentes, será preciso ajustar o cookie (`sameSite`) e o CORS.
- Para proteger uma página no site, envolva-a em `<ProtectedRoute>`; para proteger uma rota da API, use `requireAuth`.

## Favoritos e publicação de receitas

- `GET /api/favorites`, `POST /api/favorites/:recipeId`, `DELETE /api/favorites/:recipeId` (exigem login).
- `POST /api/recipes` publica uma receita (exige login, limite de 20 por hora por IP). Sem foto por enquanto:
  o upload entra com o Cloudinary.
- No site: `/favorites` e `/create-recipe` (ambas protegidas), coração nos cards e na página da receita.

## Fotos das receitas (Cloudinary)

- Opcional: crie uma conta gratuita em cloudinary.com e preencha `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` e
  `CLOUDINARY_API_SECRET` no `server/.env`. Sem isso, o campo de foto some do formulário.
- O navegador envia a foto direto ao Cloudinary com uma assinatura temporária gerada em `GET /api/uploads/signature`
  (exige login; só JPG, PNG e WebP na pasta `recipenator/recipes`). O segredo nunca sai do servidor.
- `POST /api/recipes` só aceita fotos que estejam na sua conta do Cloudinary.
- Nos cards e na página, as fotos são servidas recortadas e otimizadas pelo próprio Cloudinary.

## Explorar

- `GET /api/discover` devolve culinárias e hashtags mais usadas (com contagem); `GET /api/recipes` aceita
  também `cuisine` e `tag`.
- Site: `/discover` (atalhos de estilo e categoria, culinárias do mundo, hashtags em alta) leva à biblioteca
  já filtrada.

## Planejador e lista de compras

- `GET/PUT /api/meal-plan?week=AAAA-MM-DD` (exigem login; a semana é identificada pela data da segunda-feira).
- Site: `/meal-planner` (7 dias x café, almoço e jantar, porções por receita, salva sozinho) e
  `/shopping-list` (soma os ingredientes do plano, marca itens comprados, copia e imprime).
- Quantidades só são somadas quando a unidade é a mesma; as receitas importadas trazem medidas em inglês.

## Avaliações e comentários

- `GET /api/recipes/:slug/reviews` (público), `PUT` (cria ou atualiza a sua avaliação) e `DELETE` (remove a sua), os dois últimos com login.
- Uma avaliação por usuário em cada receita (nota de 1 a 5 e comentário opcional).
- A média e a quantidade ficam guardadas na própria receita e aparecem nos cards.

## Calendário gastronômico

- Página `/calendar` (grade do mês + datas) e as 3 próximas datas na Home.
- Dados em `client/src/data/events.ts` (2026 a jun/2027). Datas móveis já estão resolvidas; revise a lista a cada ano.
  Mais adiante, a ideia é mover para o banco com um painel de admin.

## Identidade visual

- Cores definidas em `client/tailwind.config.js` (tomate, açafrão, páprica, café torrado, creme).
- **Verde (`herb`, `leaf`, `mint`) é reservado para vegetariano/vegano.** Não usar em outros contextos.
- Mascote: `client/public/mascot.png` (robô-chef). O nome aparece abaixo dele na Home, via `Wordmark`.
- Pratos ilustrados: `client/src/components/PlateIllustration.tsx` (até existir foto da receita).

## Estrutura

```
client/   React (páginas, componentes, dados de exemplo em src/data/sample.ts)
server/   Express (config, routes; health check em /api/health)
```

## Próximos passos (ordem do documento)

1. Autenticação e usuários (JWT + bcrypt)
2. CRUD de receitas, upload de fotos (Cloudinary), categorias e hashtags
3. Pesquisa, favoritos, comentários, planejador, lista de compras, calendário
