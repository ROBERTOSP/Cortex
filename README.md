# Cortex

Monorepo principal da plataforma Cortex para concursos, com:

- `layout/`: Web App em React + Vite
- `Cortex Extensão/backend/`: API em NestJS + Prisma
- `Cortex Extensão/extension/`: extensão Chrome Manifest V3

O repositório também contém material legado e pipelines auxiliares em Python. Eles não fazem parte do bootstrap principal do monorepo e devem ser tratados como código isolado.

## Requisitos

- Node.js 20+
- npm 10+
- PostgreSQL acessível pela `DATABASE_URL`

## Setup local

Instale as dependências na raiz:

```bash
npm install
```

Crie os arquivos locais de ambiente sem sobrescrever arquivos existentes:

```bash
npm run setup:local
```

Preencha os arquivos gerados:

- `Cortex Extensão/backend/.env`
- `layout/.env.local`
- `Cortex Extensão/extension/.env`

## Variáveis mínimas

### Backend

Arquivo base: `Cortex Extensão/backend/.env.example`

Obrigatórias:

- `DATABASE_URL`
- `JWT_SECRET`

Opcionais:

- `SUPABASE_URL`
- `SUPABASE_JWT_SECRET`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_EXTENSION_CLIENT_ID`
- `GEMINI_API_KEY`

### Web App

Arquivo base: `layout/.env.example`

Obrigatórias:

- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`

### Extensão

Arquivo base: `Cortex Extensão/extension/.env.example`

Obrigatórias:

- `VITE_API_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Prisma

Gerar o client:

```bash
npm -w @cortex/backend run prisma:generate
```

Aplicar migrations:

```bash
npm -w @cortex/backend run prisma:migrate:deploy
```

Executar seed mínimo de desenvolvimento:

```bash
npm -w @cortex/backend run prisma:seed
```

## Rodando o monorepo

```bash
npm run dev:backend
npm run dev:web
npm run dev:extension
```

## Build, lint e testes

Executar tudo:

```bash
npm run build
npm run lint
npm test
```

Executar por workspace:

```bash
npm -w @cortex/backend run build
npm -w @cortex/web run build
npm -w @cortex/extension run build
```

## Observações

- O backend é a fonte de verdade das regras de negócio.
- O `PlanningService` atual permanece como está nesta fase de estabilização.
- Não use `prisma db push` como fluxo principal de produção.
- Não versionar credenciais reais em `.env.example`.
