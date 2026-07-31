# Cloudinary no RecipeNator, explicado

## Para que serve

Quando alguém publica uma receita com foto, a imagem precisa ficar guardada em algum lugar e ser entregue rápido
para quem visita o site. Nem o banco de dados (MongoDB) nem o servidor da API são bons para isso: imagens são
pesadas, e guardá-las lá deixaria tudo lento e caro.

O **Cloudinary** é um serviço que faz esse trabalho: guarda as fotos e as entrega já redimensionadas e leves
(por exemplo, o card da receita pede um recorte pequeno; a página da receita pede um maior). Tem um plano
gratuito, e você confere os limites atuais no site deles (cloudinary.com).

O banco guarda só o **endereço** da foto (um texto), não a foto.

## Preciso disso agora?

**Não.** O site funciona sem o Cloudinary:

- As receitas da casa (as "Escolhas do RecipeNator") usam pratos ilustrados no lugar da foto.
- As receitas importadas da TheMealDB trazem as fotos delas.
- Só o campo "Foto" do formulário de publicar receita fica escondido enquanto o Cloudinary não estiver ligado.

Ligue quando quiser que as pessoas possam enviar fotos das próprias receitas.

## Como ligar, passo a passo

1. Crie uma conta gratuita em cloudinary.com.
2. No painel (Dashboard), procure o bloco com os dados da conta: **Cloud name**, **API Key** e **API Secret**.
3. Abra o arquivo `server/.env` e preencha:

   ```
   CLOUDINARY_CLOUD_NAME=seu-cloud-name
   CLOUDINARY_API_KEY=sua-api-key
   CLOUDINARY_API_SECRET=seu-api-secret
   ```

4. Reinicie o servidor (`npm run dev`). A partir daí o campo "Foto" aparece em `/create-recipe`.

O **API Secret** é como uma senha da sua conta: fica só no `server/.env`, nunca vai para o navegador, nunca deve ser
colocado no GitHub (o `.gitignore` do projeto já ignora o `.env`) e não deve ser compartilhado.

## O que acontece quando alguém envia uma foto

1. A pessoa escolhe a foto no formulário (JPG, PNG ou WebP, até 5 MB).
2. Ao publicar, o site pede ao **nosso servidor** uma autorização de envio (só para quem está logado). O servidor
   usa o API Secret para gerar uma assinatura temporária e devolve apenas a assinatura, nunca o segredo.
3. O navegador envia a foto **direto ao Cloudinary** com essa assinatura. A foto não passa pelo nosso servidor.
4. O Cloudinary devolve o endereço da foto e o site o inclui na receita ao publicar.
5. O servidor só aceita receitas cuja foto esteja na **sua** conta do Cloudinary, então ninguém consegue
   pendurar imagens de outros sites nas receitas.

Essa assinatura vale só para a pasta `recipenator/recipes` e para os formatos JPG, PNG e WebP, e há um limite de 30
pedidos por hora por IP.

## Fotos nas receitas da casa

As receitas da casa estão com ilustrações. Quando você tiver fotos próprias delas, dá para enviá-las ao Cloudinary
(pelo painel deles, na pasta `recipenator/recipes`) e registrar o endereço no campo `imageUrl` de cada receita.
Um painel de admin, previsto para uma próxima etapa, vai tornar isso mais fácil.
