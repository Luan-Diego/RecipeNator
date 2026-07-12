# RecipeNator

Plataforma gastronômica: descubra, publique e organize receitas. **Explore. Prepare. Compartilhe.**

Stack: React + TypeScript + Vite + Tailwind CSS (client) · Node.js + Express + MongoDB/Mongoose + Zod (server).

## Como rodar

Em dois terminais, a partir da pasta do projeto:

```bash
# 1) API
cd server
cp .env.example .env     # ajuste MONGODB_URI se necessário
npm install
npm run dev              # http://localhost:4000/api/health

# 2) Site
cd client
npm install
npm run dev              # http://localhost:5173
```

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
