# WarTracker

Painel web para acompanhar a Corrida Fluvial do clã no Clash Royale. O
WarTracker reúne dados de guerra, participação dos membros e alertas para
líderes e co-líderes.

## Recursos

- Consulta da guerra atual, dos ataques e do progresso diário dos membros.
- Histórico de guerras e participação individual.
- Alertas e tabela de advertências, com exportação dos dados exibidos.
- Registro de justificativas de presença.
- Login pela tag do jogador, com liberação VIP e validação do clã e do cargo na API do Clash Royale.
- Contato com o suporte pelo WhatsApp para solicitar a liberação de acesso VIP.
- Perfil e preferências do usuário.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS 4, Lucide React |
| Backend | Node.js 22, Express 5 |
| Dados | MongoDB, Mongoose |
| Integração | API do Clash Royale via Axios |
| Autenticação | JWT |
| Deploy da API | Fly.io |

## Estrutura do projeto

```text
backend/
  config/                 Conexão com MongoDB
  controllers/            Lógica das rotas do clã
  middleware/             Autenticação e validação do ambiente
  models/                 Modelos Mongoose de clã e usuário
  routes/                 Rotas de autenticação, clã e usuário
  services/               Análise e formatação dos dados de guerra
  utils/                  Cliente da API do Clash Royale
  server.js               Aplicação Express
  Dockerfile              Imagem da API para deploy
  fly.toml                Configuração da API no Fly.io

frontend/
  src/
    components/           Interface, dashboard e componentes da guerra
    pages/                Páginas da aplicação
    utils/                Cliente HTTP e regras de formatação da guerra
  vite.config.js          Configuração do Vite
```

## Pré-requisitos

- Node.js 22 ou compatível com as dependências.
- npm.
- MongoDB local ou MongoDB Atlas.
- Chave da API do Clash Royale/RoyaleAPI.

## Configuração do ambiente

Crie o arquivo local da API a partir do exemplo:

```bash
cp backend/.env.example backend/.env
```

Preencha as variáveis obrigatórias em `backend/.env`:

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `MONGODB_URI` | Sim | URI de conexão do MongoDB (`mongodb://` ou `mongodb+srv://`). |
| `JWT_SECRET` | Sim | Segredo para assinar tokens; use pelo menos 32 caracteres. |
| `CLASH_ROYALE_API_KEY` | Sim | Chave para consultar a API do Clash Royale. |
| `CLAN_TAG` | Sim | Tag do clã monitorado, com ou sem `#`. |
| `PORT` | Não | Porta do servidor; localmente, o padrão é `5000`. |
| `CLASH_ROYALE_BASE_URL` | Não | URL base da API; o cliente usa RoyaleAPI por padrão. |

O arquivo `.env` contém credenciais e não deve ser compartilhado ou
versionado. Nunca publique a URI do banco, o segredo JWT ou a chave da API.

## Execução local

Instale as dependências e inicie o backend:

```bash
cd backend
npm install
npm run dev
```

O backend inicia em `http://localhost:5000` por padrão e precisa acessar o
MongoDB e a API do Clash Royale.

Em outro terminal, inicie o frontend:

```bash
cd frontend
npm install
npm run dev
```

O Vite disponibiliza a aplicação em `http://localhost:5173`. A URL base da
API usada pelo frontend está definida em `frontend/src/utils/api.js`. Para
usar um backend local durante o desenvolvimento, ajuste `API_URL` nesse
arquivo para `http://localhost:5000`.

### Scripts

No diretório `backend`:

```bash
npm start       # inicia a API
npm run dev     # inicia a API com Nodemon
npm test        # executa os testes dos serviços
```

No diretório `frontend`:

```bash
npm run dev     # inicia o servidor de desenvolvimento
npm run build   # gera o build de produção em dist/
npm run preview # serve o build localmente
npm run lint    # verifica o código com ESLint
```

## API

O health check está disponível em `GET /`, `GET /health`, `GET /api/health`
e `GET /api/ping`. A resposta inclui o status da API e do banco de dados.

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "playerTag": "#SUA_TAG"
}
```

O login segue estas verificações:

1. Confere se a tag está na lista VIP mantida em `backend/routes/auth.js`.
2. Consulta a API do Clash Royale e confirma que o jogador pertence ao clã
   definido por `CLAN_TAG`.
3. Confirma que o jogador é líder ou co-líder.

Tags fora da lista VIP recebem HTTP 403. Para liberar ou remover um cliente,
adicione ou remova sua tag normalizada (com `#` e em maiúsculas) da constante
`CLIENTES_VIP` em `backend/routes/auth.js` e publique a atualização do backend.
Não coloque a lista de clientes VIP no frontend ou em documentação pública.
Após as validações, o endpoint retorna um token JWT válido por 12 horas.

O CTA da Landing Page direciona novos clientes ao suporte pelo WhatsApp. A
liberação é manual; não há integração de pagamento ou checkout automático.

### Rotas do clã

| Método | Rota | Acesso | Finalidade |
| --- | --- | --- | --- |
| `GET` | `/api/clan/stats` | Público | Guerra atual e estatísticas do clã |
| `GET` | `/api/clan/history` | Público | Histórico de guerras |
| `POST` | `/api/clan/attendance` | JWT | Registra justificativa de presença |

### Rotas do usuário

As rotas abaixo, exceto `GET /api/user/`, exigem um token no cabeçalho
`Authorization: Bearer <token>`.

| Método | Rota | Finalidade |
| --- | --- | --- |
| `GET` | `/api/user/` | Informações básicas da API do usuário |
| `GET` | `/api/user/profile` | Consulta o perfil |
| `PUT` | `/api/user/profile` | Atualiza o nome do perfil |
| `GET` | `/api/user/preferences` | Consulta as preferências |
| `PUT` | `/api/user/preferences` | Atualiza notificações, alertas, idioma e tema |

## Deploy

### API no Fly.io

A configuração da aplicação fica em `backend/fly.toml`, e a imagem é
definida em `backend/Dockerfile`. Configure os segredos e a porta de acordo
com o `internal_port` definido no arquivo Fly:

```bash
cd backend
fly secrets set \
  MONGODB_URI="sua-uri-do-mongodb" \
  JWT_SECRET="seu-segredo-longo" \
  CLASH_ROYALE_API_KEY="sua-chave" \
  CLAN_TAG="#SUA_TAG" \
  PORT="8080"
fly deploy
```

Após o deploy, valide a API acessando `/health` no domínio da aplicação.

### Frontend

Gere o build de produção em `frontend/dist/` com `npm run build` e publique
essa pasta em um host de conteúdo estático. A URL da API do frontend está
definida em `frontend/src/utils/api.js`; atualize `API_URL` para o endereço
público da API antes de gerar o build, se necessário.

## Diagnóstico

### `accessDenied.invalidIp`

A chave da API não autoriza o IP de saída do servidor. Confira a lista de IPs
autorizados no provedor da chave; o IP local e o IP do Fly.io podem ser
diferentes.

### `querySrv ENOTFOUND`

Confira a URI, o status do cluster, as credenciais, o DNS e as regras de rede
do MongoDB Atlas. Caracteres especiais na senha precisam ser codificados na
URI.

### Variáveis de ambiente ausentes

Confirme os nomes e valores em `backend/.env` localmente ou nas configurações
de secrets do Fly.io. Reinicie ou faça novo deploy após alterar a
configuração.

### CORS

O backend permite origens locais do Vite e domínios configurados em
`backend/server.js`. Se publicar o frontend em outro domínio, adicione a
origem à lista permitida.

## Segurança

- Use um `JWT_SECRET` longo, aleatório e diferente em cada ambiente.
- Restrinja o acesso de rede do MongoDB e proteja a chave da API.
- O token JWT é armazenado no `localStorage` do navegador.
