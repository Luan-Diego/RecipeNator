# Fotos reais nas receitas da casa

As receitas importadas da TheMealDB já trazem foto. Para as 14 receitas da casa, o comando `npm run photos`
busca uma foto real de cada prato no **Pexels** (banco gratuito, uso comercial liberado) e a guarda na **sua conta
do Cloudinary**. O nome do fotógrafo aparece como crédito na página da receita.

## O que você precisa (uma vez só)

Acrescente estas linhas ao `server/.env`. As que já existem não mudam:

```
PEXELS_API_KEY=sua-chave-do-pexels
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

- Chave do Pexels: pexels.com/api, botão "Get Started", e é gratuita.
- Dados do Cloudinary: painel em cloudinary.com (veja `docs/cloudinary.md`).

## Como usar (na pasta `server`)

```bash
npm run photos                   # só as receitas que ainda não têm foto
npm run photos -- --force        # refaz todas
npm run photos -- --only pudim-de-leite-condensado
npm run photos -- --only pudim-de-leite-condensado --pick 2 --force   # usa o 2º resultado da busca
```

Depois abra o site e confira as fotos. Se alguma não ficou boa:

1. Tente `--pick 2`, `--pick 3`... para escolher outro resultado da busca; ou
2. Ajuste o termo de busca em `server/src/data/photoQueries.ts` e rode de novo com `--only <slug> --force`.

O texto das receitas e as fotos não se misturam: rodar `npm run seed` ou reiniciar o servidor não apaga as fotos.

## Mais receitas já com foto

```bash
npm run import:mealdb -- --limit 10     # 10 por categoria, todas com foto
```
