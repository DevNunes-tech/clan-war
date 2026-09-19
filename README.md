# WarTracker

Painel de acompanhamento de guerras de clãs para líderes e co-líderes do
Clash Royale.

O WarTracker combina uma interface React, uma API Node.js/Express, MongoDB e
a API oficial do Clash Royale para centralizar o acompanhamento da guerra
atual, o histórico de guerras, as medalhas e os ataques pendentes dos membros.

## Visão geral

- Autenticação por tag de jogador, sem senha de usuário.
- Acesso restrito a líderes e co-líderes do clã configurado.
- Dashboard com estatísticas da guerra atual e histórico.
- Registro de justificativas para ataques não realizados.
- Preferências e dados básicos do usuário.
- API protegida por tokens JWT com validade de 12 horas.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS, Lucide React |
| Backend | Node.js, Express 5, CommonJS |
| Dados | MongoDB, Mongoose |
| Integrações | API do Clash Royale via Axios |
| Autenticação | JSON Web Token (JWT) |
| Deploy | Render para a API e Vercel ou outro host para o frontend |

## Estrutura do projeto

```text
backend/
  api/server.js             Adaptador para execução serverless
  config/database.js        Conexão com MongoDB
  controllers/              Regras de negócio do clã
  middleware/               Autenticação e validação do ambiente
  models/                   Modelos Mongoose de usuário e clã
  routes/                   Rotas de autenticação, clã e usuário
  services/                 Serviços de análise e formatação de guerra
  utils/crApi.js            Cliente da API do Clash Royale
  server.js                 Aplicação Express local
  seed.js                   Carga de dados de exemplo

frontend/
  src/App.jsx               Controle da sessão e das telas
  src/components/           Componentes da interface
  src/pages/                Páginas da aplicação
  src/utils/api.js          Cliente HTTP do frontend
  vite.config.js            Configuração do Vite
```

## Pré-requisitos

- Node.js 22 ou versão compatível com as dependências do projeto.
- npm.
- Uma instância MongoDB local ou MongoDB Atlas.
- Uma chave da API do Clash Royale com o IP de origem autorizado.

## Configuração do ambiente

1. Copie o arquivo de exemplo:

   ```bash
   cp backend/.env.example backend/.env
   ```

2. Preencha `backend/.env`:

   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/wartracker
   JWT_SECRET=um-segredo-longo-e-aleatorio
   CLASH_ROYALE_API_KEY=sua-chave-da-api
   CLASH_ROYALE_BASE_URL=https://proxy.royaleapi.dev/v1
   CLAN_TAG=#GG9JYGCOP
   ```

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `PORT` | Não | Porta local da API. O padrão é `5000`. |
| `MONGODB_URI` | Sim | URI de conexão do MongoDB. |
| `JWT_SECRET` | Sim | Segredo usado para assinar os tokens. |
| `CLASH_ROYALE_API_KEY` | Sim | Chave de acesso à API do Clash Royale. |
| `CLASH_ROYALE_BASE_URL` | Não | URL base da API. Usa o proxy oficial por padrão. |
| `CLAN_TAG` | Sim | Tag do clã monitorado, com ou sem `#`. |

O arquivo `.env` contém credenciais e não deve ser versionado. Nunca publique
`MONGODB_URI`, `JWT_SECRET`, chaves de API ou tokens JWT.

## Execução local

Instale e inicie a API:

```bash
cd backend
npm install
npm run dev
```

A API ficará disponível em `http://localhost:5000`.

Em outro terminal, instale e inicie o frontend:

```bash
cd frontend
npm install
npm run dev
```

O Vite exibirá a URL local, normalmente `http://localhost:5173`. Para usar
uma API diferente, defina `VITE_API_URL` antes de iniciar ou gerar o build:

```bash
VITE_API_URL=https://sua-api.exemplo npm run build
```

O valor deve ser apenas a URL base da API, sem `/api` ao final.

### Scripts disponíveis

No diretório `backend`:

```bash
npm start       # inicia a API com Node.js
npm run dev     # inicia a API com Nodemon
npm test        # executa os testes dos serviços
```

No diretório `frontend`:

```bash
npm run dev     # servidor de desenvolvimento
npm run build   # build de produção
npm run preview # serve o build localmente
npm run lint    # verifica o código com ESLint
```

## API

O endpoint de verificação está disponível em `GET /` e responde:

```text
WarTracker API is running...
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "playerTag": "#GG9JYGCOP"
}
```

O login consulta o jogador na API do Clash Royale, valida o cargo de líder ou
co-líder e confirma a associação ao clã configurado. Em caso de sucesso,
retorna um JWT e os dados básicos do usuário.

### Rotas protegidas

Envie o token no cabeçalho abaixo:

```http
Authorization: Bearer <token>
```

| Método | Rota | Finalidade |
| --- | --- | --- |
| `GET` | `/api/clan/stats` | Estatísticas da guerra atual |
| `GET` | `/api/clan/history` | Histórico de guerras |
| `POST` | `/api/clan/attendance` | Salva uma justificativa de presença |
| `GET` | `/api/user/profile` | Consulta o perfil |
| `PUT` | `/api/user/profile` | Atualiza nome e e-mail |
| `GET` | `/api/user/preferences` | Consulta preferências |
| `PUT` | `/api/user/preferences` | Atualiza preferências |

`GET /api/user` é um endpoint público de informação da API do usuário.

## Deploy

### API no Render

O arquivo [render.yaml](./render.yaml) já define o serviço da API. Para uma
configuração manual, use:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Configure no Render as variáveis `MONGODB_URI`, `JWT_SECRET`,
`CLASH_ROYALE_API_KEY` e `CLAN_TAG`. A variável
`CLASH_ROYALE_BASE_URL` pode usar:

```text
https://proxy.royaleapi.dev/v1
```

Depois do deploy, valide a instalação acessando `GET /` na URL pública.

### Frontend

No provedor escolhido, configure `VITE_API_URL` com a URL pública da API, por
exemplo:

```text
https://wartracker-api.onrender.com
```

Não inclua Markdown, parênteses, colchetes ou o caminho `/api` nesse valor.

## Diagnóstico

### `accessDenied.invalidIp`

A chave do Clash Royale não autoriza o IP que está fazendo a requisição.
Atualize a lista de IPs autorizados no painel onde a chave foi criada. O IP
local e o IP de saída de um provedor de hospedagem podem ser diferentes.

### `querySrv ENOTFOUND`

O MongoDB não conseguiu resolver o endereço informado. Confira a URI, o
status do cluster, o usuário, a senha, o DNS e a liberação de rede no MongoDB
Atlas. Senhas com caracteres especiais precisam estar codificadas na URI.

### Variáveis de ambiente ausentes

Confirme que o arquivo está em `backend/.env`, que os nomes estão corretos e
que nenhum valor obrigatório está vazio. Reinicie a API após qualquer
alteração.

### CORS

O backend permite as origens locais mais comuns do Vite e os domínios
configurados no código. Se o frontend for publicado em outro domínio, essa
origem precisa ser adicionada à lista `allowedOrigins` em
`backend/server.js`.

### A aplicação fica carregando

O dashboard depende do MongoDB e da API do Clash Royale. A aplicação possui
limites de tempo para essas chamadas; verifique os logs do backend e teste
primeiro `GET /` para separar problemas de disponibilidade da API de erros de
integração.

## Segurança e operação

- Não execute `backend/seed.js` em produção: ele remove usuários e clãs antes
  de inserir dados de exemplo.
- Use um `JWT_SECRET` longo, aleatório e diferente em cada ambiente.
- Restrinja o acesso de rede do MongoDB e da chave do Clash Royale aos IPs
  necessários.
- O token é mantido no `localStorage` pelo frontend; mantenha a política de
  CORS e a proteção contra XSS atualizadas.
- A API externa é consultada durante o carregamento do dashboard. Em cenários
  de uso intenso, considere cache e tratamento de rate limit.

## Licença

O projeto ainda não define uma licença de distribuição. Consulte os
responsáveis pelo repositório antes de redistribuir o código.
