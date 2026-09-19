# WarTracker

Painel web para lideres e co-lideres de clas do Clash Royale. O sistema
combina uma interface React, uma API Node.js/Express, MongoDB e a API oficial
do Clash Royale.

> Este documento foi escrito para facilitar a analise do projeto por outra
> pessoa ou por uma ferramenta de IA. Ele descreve o comportamento atual do
> codigo, incluindo problemas de configuracao e pontos que podem causar
> falhas.

## 1. Objetivo do sistema

O WarTracker tenta centralizar:

- login usando a tag de um jogador;
- verificacao do jogador na API oficial do Clash Royale;
- validacao de que o jogador e lider ou co-lider;
- validacao de que o jogador pertence ao cla configurado;
- exibicao da guerra atual, membros, medalhas e ataques pendentes;
- historico de guerras;
- preferencias do usuario;
- registro manual de justificativas de ataques nao realizados.

O projeto nao usa senha informada pelo usuario no login. A tag e enviada para
a API do Clash Royale e o resultado determina se o acesso e permitido.

## 2. Estrutura do repositorio

```text
backend/
  api/server.js             Adaptador serverless para a Vercel
  config/database.js        Conexao com MongoDB/Mongoose
  controllers/clanController.js
                            Regras de estatisticas, historico e presenca
  middleware/auth.js        Validacao do JWT
  middleware/validateEnv.js Validacao das variaveis de ambiente
  models/Clan.js             Modelo do cla e presenca de guerra
  models/User.js             Modelo do usuario
  routes/auth.js             POST /api/auth/login
  routes/clan.js             Endpoints de cla
  routes/user.js             Endpoints de perfil e preferencias
  utils/crApi.js             Cliente HTTP da API do Clash Royale
  server.js                 Aplicacao Express local e serverless
  seed.js                   Limpeza e carga de dados de exemplo
  .env.example              Modelo de configuracao sem credenciais

frontend/
  src/App.jsx                Controle das telas e sessao local
  src/components/
    LandingPage.jsx          Pagina inicial
    LoginPage.jsx            Formulario de login
    Dashboard.jsx            Painel principal
  src/utils/api.js           Montagem de URLs da API
  vite.config.js             Configuracao do Vite
```

## 3. Tecnologias

### Backend

- Node.js e CommonJS;
- Express;
- Mongoose/MongoDB;
- Axios;
- JSON Web Token (JWT);
- CORS;
- dotenv;
- serverless-http para deploy serverless.

### Frontend

- React 19;
- Vite;
- Tailwind CSS;
- Lucide React.

## 4. Fluxo completo da aplicacao

### 4.1 Inicializacao do backend

1. `backend/server.js` carrega o `.env`.
2. `ensureEnv()` verifica `MONGODB_URI`, `JWT_SECRET`,
   `CLASH_ROYALE_API_KEY` e `CLAN_TAG`.
3. O backend conecta no MongoDB antes de abrir a porta HTTP.
4. O Express configura CORS, JSON e as rotas.
5. Em execucao local, o servidor escuta a porta definida em `PORT`, por
   padrao `5000`.

Se a conexao com o MongoDB falhar, o servidor encerra. Portanto, a pagina
frontend pode abrir, mas nenhuma funcionalidade que dependa do backend vai
funcionar.

### 4.2 Fluxo de login

1. O usuario informa uma tag, por exemplo `#GG9JYGCOP`.
2. O frontend envia `POST /api/auth/login`.
3. O backend chama `GET /players/{tag}` na API do Clash Royale.
4. O backend verifica se o cargo retornado e `leader` ou `coleader`.
5. O backend compara o cla retornado com `CLAN_TAG`.
6. Se o usuario ainda nao existir, cria um registro em `User`.
7. O backend gera um JWT com validade de 12 horas.
8. O frontend salva `token` e `user` no `localStorage`.
9. A tela muda para o dashboard.

O token e enviado depois no header:

```http
Authorization: Bearer <token>
```

### 4.3 Carregamento do dashboard

Depois do login, o frontend faz chamadas para:

1. `/api/user/profile`;
2. `/api/user/preferences`;
3. `/api/clan/stats`;
4. `/api/clan/history`.

O endpoint de estatisticas chama a API oficial para buscar o cla e a guerra
atual, cruza os participantes da guerra com os membros atuais e salva uma
copia resumida no MongoDB.

## 5. Configuracao do ambiente

Crie `backend/.env` usando [backend/.env.example](./backend/.env.example):

```env
PORT=5000
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/wartracker
JWT_SECRET=um-segredo-longo-e-aleatorio
CLASH_ROYALE_API_KEY=sua-chave-da-api-do-clash-royale
CLASH_ROYALE_BASE_URL=https://proxy.royaleapi.dev/v1
CLAN_TAG=#GG9JYGCOP
```

Variaveis obrigatorias:

| Variavel | Funcao |
|---|---|
| `PORT` | Porta do backend local. O padrao e `5000`. |
| `MONGODB_URI` | URI completa do MongoDB Atlas ou MongoDB local. |
| `JWT_SECRET` | Segredo usado para assinar e validar tokens. |
| `CLASH_ROYALE_API_KEY` | Chave usada nas chamadas da API oficial. |
| `CLASH_ROYALE_BASE_URL` | Proxy configurado: `https://proxy.royaleapi.dev/v1`. |
| `CLAN_TAG` | Cla monitorado, com ou sem `#`. |

Nunca envie o `.env` para o Git, para um chat ou para uma ferramenta de IA.
Use placeholders ao pedir ajuda.

## 6. Como instalar e executar

### Backend

```bash
cd backend
npm install
npm run dev
```

Para executar sem Nodemon:

```bash
npm start
```

### Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Em desenvolvimento, o frontend usa `http://localhost:5000` quando
`VITE_API_URL` nao foi definido. Em producao, o fallback atual e:

```text
https://clan-war.onrender.com
```

Para apontar explicitamente para uma API:

```bash
VITE_API_URL=https://seu-backend.exemplo npm run build
```

Na Vercel, o valor deve ser somente a URL, sem Markdown, colchetes,
parênteses ou caminho de endpoint:

```text
https://clan-war.onrender.com
```

Não use valores como
`[https://clan-war.onrender.com](https://clan-war.onrender.com)` nem
`https://clan-war.onrender.com/api`.

Na Vercel, configure a variavel de ambiente do frontend:

```env
VITE_API_URL=https://clan-war.onrender.com
```

No Render, configure as variaveis do backend:

```text
MONGODB_URI
JWT_SECRET
CLASH_ROYALE_API_KEY
CLASH_ROYALE_BASE_URL=https://proxy.royaleapi.dev/v1
CLAN_TAG
```

### Render

O repositorio possui [render.yaml](./render.yaml) para publicar a API no
Render a partir da pasta `backend`.

Se configurar manualmente no painel do Render, use:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

O comando `npm` sozinho nao executa build nem instalacao e causa falha de
deploy.

## 7. Endpoints do backend

### Sistema

```http
GET /
```

Resposta esperada:

```text
WarTracker API is running...
```

### Autenticacao

```http
POST /api/auth/login
Content-Type: application/json

{
  "playerTag": "#GG9JYGCOP"
}
```

Sucesso retorna `success`, `token` e dados basicos do usuario.

Possiveis erros:

- `400`: tag ausente;
- `403`: jogador nao e lider/co-lider, ou pertence a outro cla;
- `404`: jogador nao encontrado na API oficial;
- `403`: chave da API invalida ou bloqueada por IP;
- `500`: erro de banco, ambiente ou comunicacao externa.

### Cla

```http
GET /api/clan/stats
GET /api/clan/history
POST /api/clan/attendance
```

Todas as rotas de clã exigem `Authorization: Bearer <token>`.
`/api/clan/stats` consulta o cla e a guerra atual. `/api/clan/history`
consulta o historico de guerras. `/api/clan/attendance` salva ou atualiza
uma justificativa por membro e data.

### Usuario

```http
GET /api/user
GET /api/user/profile
PUT /api/user/profile
GET /api/user/preferences
PUT /api/user/preferences
```

Os endpoints de perfil e preferencias usam JWT.

## 8. Problema conhecido da API do Clash Royale

Durante os testes, a chave configurada retornou:

```json
{
  "reason": "accessDenied.invalidIp",
  "message": "Invalid authorization: API key does not allow access from IP ..."
}
```

Isso significa que a chave existe, mas o IP de origem da chamada nao esta
autorizado no painel da API. O problema nao e resolvido alterando a tag do
jogador.

### Como corrigir

1. Abrir o painel onde a chave da API foi criada.
2. Editar a chave usada em `CLASH_ROYALE_API_KEY`.
3. Adicionar o IP publico da maquina local, se o backend roda localmente.
4. Se o backend roda na Vercel, autorizar os IPs de saida exigidos pelo
   provedor ou usar uma configuracao de chave compativel com serverless.
5. Salvar a chave e testar novamente.
6. Reiniciar o backend depois de alterar o `.env`.

Uma chave autorizada localmente pode continuar falhando na Vercel, porque a
origem da requisicao muda.

Teste manual sem revelar a chave:

```bash
curl --max-time 15 \
  -H "Authorization: Bearer $CLASH_ROYALE_API_KEY" \
  "$CLASH_ROYALE_BASE_URL/players/%23GG9JYGCOP"
```

## 9. Problema conhecido do MongoDB

O backend tambem apresentou:

```text
querySrv ENOTFOUND _mongodb._tcp....
```

Esse erro ocorre antes das rotas funcionarem e normalmente indica:

- hostname incorreto na `MONGODB_URI`;
- cluster removido, pausado ou renomeado;
- problema de DNS ou rede;
- URI copiada incompleta;
- senha com caracteres especiais sem URL encoding;
- IP nao autorizado no MongoDB Atlas.

No Atlas, verificar:

1. **Database Deployments**: o cluster existe e esta disponivel;
2. **Database Access**: usuario e senha estao corretos;
3. **Network Access**: o IP de desenvolvimento esta liberado;
4. copiar novamente a URI em **Connect > Drivers**.

## 10. Por que a tela ficava carregando indefinidamente

Havia uma cadeia de requisicoes externas sem limite adequado:

```text
Frontend -> Backend -> MongoDB/API do Clash Royale
```

Se o MongoDB ou a API externa nao respondessem, o frontend permanecia
aguardando. Foram adicionados limites:

- Axios para a API do Clash Royale: 10 segundos;
- conexao Mongoose: 10 segundos;
- login no frontend: 15 segundos com `AbortController`.

Agora o usuario deve receber uma mensagem de erro em vez de esperar
indefinidamente. Isso nao corrige credenciais ou rede: apenas torna a falha
visivel.

## 11. Principais erros e diagnostico

### `ENOENT ... package.json`

O comando foi executado na raiz do repositorio. Usar:

```bash
cd backend
npm install
npm run dev
```

### `Cannot find module 'mongoose'`

As dependencias do backend nao foram instaladas ou `node_modules` esta
incompleto:

```bash
cd backend
npm install
```

### `Variaveis de ambiente ausentes`

O `.env` nao existe, esta na pasta errada ou tem uma variavel vazia. Ele deve
ficar em `backend/.env`.

### `accessDenied.invalidIp`

A chave da API do Clash Royale nao permite o IP que esta fazendo a chamada.
Corrigir a lista de IPs autorizados no provedor da API.

### `Erro de Autenticacao (Verifique IP/Chave no .env)`

Mensagem gerada pelo backend quando a API externa retorna `403`. Conferir
chave, IP autorizado e se o backend esta rodando localmente ou na Vercel.

### `querySrv ENOTFOUND`

Falha de DNS ou hostname do MongoDB. Revalidar `MONGODB_URI`.

### CORS

O backend permite algumas origens fixas, incluindo portas comuns do Vite.
Se o frontend for executado em outra porta ou dominio, a origem precisa ser
adicionada na lista `allowedOrigins` de `backend/server.js`.

### API local e frontend publicado misturados

O frontend local e configurado para usar `localhost:5000` em modo dev. Se
`VITE_API_URL` for definido apontando para o Render, o login local continuara
dependente da infraestrutura publicada.

## 12. Estado da validacao atual

Validacoes realizadas durante a investigacao:

- dependencias do backend restauradas com `npm install`;
- sintaxe dos principais arquivos do backend validada;
- build de producao do frontend concluido com sucesso;
- endpoint publicado `GET /` respondeu `200`;
- login publicado com `#GG9JYGCOP` ficou sem resposta dentro do limite de
  teste;
- chamada direta da API oficial retornou `accessDenied.invalidIp`;
- lint do frontend ainda possui erros preexistentes em `App.jsx` e
  `Dashboard.jsx`, mas eles nao impedem o build de producao.

## 13. Pontos de atencao no codigo

Estes pontos podem causar problemas futuros e devem ser considerados na
proxima revisao:

1. `backend/seed.js` apaga todos os usuarios e clas antes de inserir dados de
   exemplo. Nao executar em producao.
2. O usuario criado durante o login recebe `password: 'no-password'`; a senha
   nao e usada no fluxo atual, mas nao deve ser tratada como mecanismo de
   seguranca.
3. O endpoint `PUT /api/user/profile` usa `Object.assign(user, req.body)`.
   Isso foi corrigido para permitir apenas campos editaveis de perfil, mas
   deve continuar sendo revisado quando novos campos forem adicionados.
4. O endpoint de presenca de guerra deve ser protegido por autorizacao se
   apenas lideres puderem registrar justificativas. As rotas do cla ja exigem
   JWT; uma regra de autorizacao por cargo ainda pode ser adicionada.
5. JWT em `localStorage` fica exposto a qualquer XSS executado na pagina.
6. A API oficial e chamada durante cada carregamento do dashboard, o que pode
   atingir limites de requisicao e aumentar a latencia. Cache e tratamento de
   rate limit podem ser necessarios.
7. O backend salva dados do cla localmente, mas ainda depende da API externa
   para responder estatisticas e historico.
8. Nao existem testes automatizados no script do backend:
   `npm test` atualmente termina com erro proposital.

## 14. Checklist para pedir ajuda a outra IA

Ao enviar este projeto para analise, incluir:

- a mensagem exata do erro;
- se o backend esta local, na Vercel ou em outro provedor;
- resultado de `GET /`;
- resultado do teste da API oficial sem incluir a chave;
- se o IP esta autorizado na API do Clash Royale;
- se o MongoDB Atlas esta acessivel e com o IP liberado;
- a porta e a URL usadas pelo frontend;
- versoes de Node e npm.

Nunca incluir:

- `backend/.env`;
- `CLASH_ROYALE_API_KEY`;
- `MONGODB_URI` com usuario e senha;
- `JWT_SECRET`;
- tokens JWT reais.
