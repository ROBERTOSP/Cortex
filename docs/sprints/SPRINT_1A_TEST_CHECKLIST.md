# Sprint 1A — Checklist de Testes (como testar cada funcionalidade)

Este checklist valida o estado atual do Cortex (NestJS + React/Vite + Prisma/Postgres) após as entregas da Sprint 1A (rotina v1 + onboarding v1 + engine determinístico).

## 0) Pré-requisitos
- Postgres local acessível e `DATABASE_URL` configurada no backend.
- Backend rodando em `http://localhost:3002`.
- Web rodando em `http://localhost:5173`.
- Para login Google local:
  - No Google Cloud Console, no OAuth Client ID do Web App usado no frontend, incluir `http://localhost:5173` em **Authorized JavaScript origins**.

## 1) Smoke test (infra)
### 1.1 Backend sobe
- Ação:
  - `cd "e:\Cortex\Cortex Extensão\backend"`
  - `npm run start:dev`
- Esperado:
  - Sem crash no boot.
  - `http://localhost:3002/auth/me` responde JSON (sem “site inacessível”).

### 1.2 Migrações aplicadas
- Ação (backend):
  - `npm run prisma:migrate:deploy`
  - `npm run prisma:generate`
- Esperado:
  - Sem erro.

### 1.3 Frontend sobe
- Ação:
  - `cd "e:\Cortex\layout"`
  - `npm run dev -- --port 5173`
- Esperado:
  - `http://localhost:5173/login` abre.

## 2) Login Google (Web)
### 2.0 Login alternativo (Dev Login) — recomendado para não travar a Sprint 1A
- Objetivo:
  - Conseguir testar o app mesmo quando o OAuth do Google estiver instável.
- Preparar (backend):
  - `DEV_LOGIN_ENABLED=1`
  - `DEV_LOGIN_SECRET=local-dev` (ou outro valor)
- Preparar (frontend):
  - `VITE_DEV_LOGIN_ENABLED=1`
  - `VITE_DEV_LOGIN_SECRET=local-dev` (mesmo valor do backend)
- Ação:
  - Abrir `http://localhost:5173/login`
  - Clicar “Entrar (dev)”
- Esperado:
  - `POST http://localhost:3002/auth/dev/login` → 201
  - Response contém `{ token, user }`
  - Navega para o app autenticado

### 2.1 Origem autorizada (Google OAuth)
- Ação:
  - Abrir `http://localhost:5173/login` no Chrome.
  - Abrir DevTools → Console.
- Esperado:
  - Não aparecer: `The given origin is not allowed for the given client ID`.
- Se falhar:
  - Ajustar o OAuth Client ID do Web App no Google Cloud Console (origens autorizadas).

### 2.2 API acessível
- Ação:
  - DevTools → Network → clicar no botão “Fazer Login com o Google”.
- Esperado:
  - `POST http://localhost:3002/auth/google` → 200.
  - Response contém `{ token, user }`.

### 2.3 Sessão persistida
- Ação:
  - Recarregar a página após login.
- Esperado:
  - Continua autenticado e entra no app (sem voltar pro `/login`).

## 3) Regressão: Onboarding legado (não quebrar)
### 3.1 Página acessível
- Ação:
  - Abrir `http://localhost:5173/onboarding`.
- Esperado:
  - Renderiza normalmente (sem crash/white screen).
- Observação:
  - O fluxo legado ainda usa `/users/me/profile`, `/contests/*`, `/planning/schedule`.

## 4) Rotina v1 — UI (Onboarding v1)
### 4.1 Acesso e estado
- Ação:
  - Abrir `http://localhost:5173/onboarding-v1`.
- Esperado:
  - Carrega sem erro.
  - Exibe `onboardingVersion` e “pendente/concluído”.

### 4.2 Salvar objetivo (StudyGoal)
- Ação:
  - Preencher: tipo, nível, fase, título, cargo.
  - Marcar **Data desconhecida** OU informar uma data válida.
  - “Salvar e continuar”.
- Esperado:
  - 200 em `PUT /routine/me/goal`.
- Casos negativos:
  - Sem `examDate` e `examDateUnknown=false` → deve falhar.

### 4.3 Salvar preferências (UserRoutine)
- Ação:
  - Informar timezone IANA (ex.: `America/Sao_Paulo`)
  - Sessão: 20–60
  - “Salvar e continuar”
- Esperado:
  - 200 em `PUT /routine/me/routine`.
- Casos negativos:
  - timezone inválido → falha.
  - sessão fora de 20–60 → falha.

### 4.4 Salvar janelas (AvailabilityWindow)
- Ação:
  - Criar ao menos 1 janela.
  - Garantir ao menos 1 atividade por janela.
  - “Salvar e continuar”.
- Esperado:
  - 200 em `PUT /routine/me/windows`.
- Casos negativos:
  - Sobreposição no mesmo dia → falha.
  - `allowedActivities` vazio → falha.

### 4.5 Salvar compromissos (RoutineCommitment)
- Ação:
  - Criar 0+ compromissos.
  - “Salvar e continuar”.
- Esperado:
  - 200 em `PUT /routine/me/commitments`.
- Casos negativos:
  - Sobreposição no mesmo dia → falha.
  - `note` > 140 → falha.

### 4.6 Preview semanal (RoutineEngine)
- Ação:
  - Em “Preview”, clicar “Gerar preview”.
- Esperado:
  - 200 em `POST /routine/me/preview-week`.
  - Retorna:
    - `engineVersion`
    - `weekly.grossMinutes/netMinutes/sustainableMinutes`
    - `days[]` com `dateKey`, `dayOfWeek`, `blocks[]` (blocos por intervalo).

### 4.7 Concluir onboarding v1 (gating)
- Ação:
  - Clicar “Concluir onboarding v1”.
- Esperado:
  - 200 em `POST /routine/me/complete`.
  - `GET /routine/me/state` passa a retornar `isOnboardingV1Completed=true`.
  - Dashboard não mostra CTA de onboarding v1.

## 5) Rotina v1 — API (sem UI, opcional)
Use DevTools → Network ou Postman.

### 5.1 Estado
- Request:
  - `GET /routine/me/state` (Bearer token)
- Esperado:
  - `studyGoal`, `routine`, `availabilityWindows`, `commitments`.

### 5.2 Check-in diário
- Request:
  - `POST /routine/me/check-in`
  - Body:
    - `dateKey: "YYYY-MM-DD"`
    - `availableMinutesOverride` (opcional)
- Esperado:
  - Upsert por `userId+dateKey`.
- Casos negativos:
  - `dateKey` inválido → falha.
  - `dateKey` futuro além do limite → falha.

## 6) Segurança (mínimo)
### 6.1 Rotas protegidas
- Ação:
  - Abrir `GET /routine/me/state` sem token.
- Esperado:
  - 401.

### 6.2 Isolamento por token
- Ação:
  - Tentar enviar `userId` no payload (onde fizer sentido).
- Esperado:
  - Backend ignora e usa o `sub` do token.

## 7) Extensão (não interferir no web local)
### 7.1 Sem CSS “vazando”
- Ação:
  - Com a extensão instalada e habilitada no Chrome, abrir `http://localhost:5173/login`.
- Esperado:
  - Sem quebra de layout causada pela extensão.

## 8) Testes automatizados (projeto)
### 8.1 Backend unit tests
- Ação (backend):
  - `npm run test`
- Esperado:
  - Passa.

### 8.2 Backend e2e (mínimo)
- Ação (backend):
  - `npm run test:e2e`
- Esperado:
  - Passa.

### 8.3 Layout build
- Ação (layout):
  - `npm run build`
- Esperado:
  - Passa.
