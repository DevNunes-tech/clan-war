# WarTracker

O **WarTracker** é um painel para liderança de clãs do **Clash Royale**. Ele centraliza login, visão de guerra, histórico, membros, preferências de usuário e informações do clã em uma interface única, com foco em organizar o time e reduzir ruído visual no acompanhamento das guerras.

## Finalidade

O objetivo do projeto é ajudar líderes e co-líderes a:

1. acompanhar a guerra atual e os ataques pendentes;
2. visualizar membros ativos e desempenho do clã;
3. consultar histórico de guerras sem poluir a tela com dados irrelevantes;
4. controlar preferências do usuário e acesso ao painel;
5. usar uma interface simples para consulta rápida no dia a dia do clã.

## Como o projeto é desenvolvido

O projeto é dividido em duas partes:

- `backend/`: API em Node.js com Express e MongoDB/Mongoose.
- `frontend/`: aplicação em React com Vite, Tailwind CSS e Lucide Icons.

O fluxo funciona assim:

1. o usuário acessa a landing page;
2. faz login informando a tag do jogador;
3. o backend consulta a API do Clash Royale;
4. se o jogador for líder ou co-líder do clã monitorado, um JWT é gerado;
5. o frontend salva o token e carrega o dashboard;
6. o dashboard busca dados do perfil, preferências, estatísticas do clã e histórico de guerras.

## Funcionalidades

### Landing page

- Hero principal com chamada para o painel.
- Seção **O Projeto** explicando a proposta do WarTracker.
- Seção **Recursos** apresentando os blocos principais do sistema.
- Menu responsivo para desktop e mobile.

### Autenticação

- Login por tag do jogador.
- Validação de cargo via API oficial do Clash Royale.
- Restrição de acesso para líderes e co-líderes.
- Geração de token JWT para manter a sessão.

### Dashboard

- Visão da guerra atual do clã.
- Total de medalhas do clã.
- Quantidade de ataques pendentes.
- Quantidade de membros participando.
- Lista de membros com status formatado.
- Histórico de guerra com dados normalizados.
- Preferências do usuário.
- Busca visual por membro.
- Ações de imprimir e compartilhar ranking.

### Limpeza de dados e organização

- Normalização de respostas entre frontend e backend.
- Filtragem de ex-membros para reduzir poluição no histórico.
- Tratamento de tags com padronização para evitar diferenças de formatação.

## Stack utilizada

### Frontend

- React 19
- Vite
- Tailwind CSS
- Lucide React

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- CORS
- Axios
- bcryptjs

## Estrutura do projeto

```text
backend/
    config/
        database.js
    controllers/
        clanController.js
    middleware/
        auth.js
    models/
        Clan.js
        User.js
    routes/
        auth.js
        clan.js
        user.js
    utils/
        crApi.js
    seed.js
    server.js

frontend/
    src/
        components/
            Dashboard.jsx
            LandingPage.jsx
            LoginPage.jsx
        App.jsx
        main.jsx
        App.css
        index.css
```

## API do backend

### Autenticação

- `POST /api/auth/login`

### Clã

- `GET /api/clan/stats`
- `GET /api/clan/history`

### Usuário

- `GET /api/user/profile`
- `PUT /api/user/profile`
- `GET /api/user/preferences`
- `PUT /api/user/preferences`

## Variáveis de ambiente

Crie o arquivo `backend/.env` com algo neste formato:

```env
PORT=5000
MONGODB_URI=sua_string_de_conexao_do_mongodb
JWT_SECRET=seu_segredo_jwt
CLAN_TAG=#SUA_TAG_AQUI
```

Se você for rodar o frontend localmente, o endereço padrão da API é `http://localhost:5000`.

## Como executar

### 1. Instalar dependências

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Rodar o backend

```bash
cd backend
npm run dev
```

### 3. Rodar o frontend

```bash
cd frontend
npm run dev
```

## Observações importantes

- O backend se conecta ao MongoDB antes de subir o servidor.
- O frontend foi preparado para consumir respostas com formatos diferentes de `_id`, `id`, `tag` e `clanTag`.
- O CORS do backend inclui portas comuns do Vite, como `5173` e `4173`.

## Para quem este projeto foi feito

Este projeto foi pensado para pessoas que administram clãs e precisam de um painel direto para acompanhar guerra, membros e histórico sem depender de planilhas ou conferência manual constante.

## Aviso legal

Este projeto é uma ferramenta de fã e não é afiliado à Supercell. Os nomes, marcas e ativos do jogo pertencem aos seus respectivos donos.
