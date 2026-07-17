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
