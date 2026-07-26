# Setup Local — Cortex (Monorepo)

## 1) Gerar arquivos de ambiente (automático)
Na raiz do projeto (`e:\Cortex`), rode:

```bash
npm run setup:local
```

Isso cria:
- `Cortex Extensão/backend/.env` a partir de `.env.example` (se não existir)
- `layout/.env.local` a partir de `.env.example` (se não existir)

## 2) Preencher variáveis (obrigatório)

### 2.1) Backend (`Cortex Extensão/backend/.env`)
Preencher no mínimo:
- `DATABASE_URL` (Postgres/Supabase)
- `JWT_SECRET` (string forte)

Para login com Google no Web:
- `GOOGLE_CLIENT_ID`

### 2.2) Web (`layout/.env.local`)
Preencher:
- `VITE_API_URL` (padrão local: `http://localhost:3002`)
- `VITE_GOOGLE_CLIENT_ID`

## 3) Instalar dependências
Na raiz (`e:\Cortex`):

```bash
npm install
```

## 4) Subir o backend

```bash
npm run dev:backend
```

Teste:
- `http://localhost:3002/health`

## 5) Subir o Web App

```bash
npm run dev:web
```

Abrir:
- `http://localhost:5173`

## 6) Fluxo Offline (Scraper → Arquivo → Import)
Objetivo: gerar JSON de questões (offline) e importar de forma idempotente para o Postgres (Supabase).

### 6.1) Gerar export (scraper offline)
Rodar o scraper Python no diretório do crawler:
```bash
python e:\Cortex\Cortex Scraper\crawler\gran_scraper.py
```

O output é controlado por variáveis no `.env` do backend (que são reaproveitadas pelo ambiente quando você roda os comandos no Windows), como:
- `CORTEX_OUT_DIR`
- `CORTEX_FILE_PREFIX`
- `CORTEX_CHUNK_SIZE`

### 6.2) Importar para o banco (idempotente)
Na raiz (`e:\Cortex`):
```bash
npm -w @cortex/backend run import:questions -- --dir "e:\Cortex\Cortex Scraper\crawler\exports" --prefix "gran_"
```

Observações:
- O import faz upsert por `cortexIdNum`, então você pode reexecutar sem duplicar.
- Para evitar “travar” o banco, rode por lotes (prefixos/anos) e monitore.
