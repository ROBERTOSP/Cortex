# Checklist do Projeto — Cortex Extensão

Última revisão: 2026-06-07

## 0.1) Arquitetura atual (após refatoração)
- Monorepo com npm workspaces (raiz em `e:\Cortex\package.json`)
- Apps/pacotes principais:
  - `@cortex/web` (Web App): `e:\Cortex\layout`
  - `@cortex/backend` (API NestJS + Prisma): `e:\Cortex\Cortex Extensão\backend`
  - `@cortex/extension` (Chrome MV3): `e:\Cortex\Cortex Extensão\extension`
  - `@cortex/scraper-backend` / `@cortex/scraper-extension` (legado operacional do scraper)
- Banco: Supabase (Postgres) como camada de dados; API de domínio no backend (NestJS).

## 0) Roadmap (Projeto Completo, sem “meia solução”)
Objetivo: construir a Cortex como um sistema completo (dados + engines + IA + UX) de forma incremental, evitando retrabalho e evitando depender do BD de questões para validar o core.

### Bloqueadores (faça antes de avançar)
- [ ] Segredos: remover do repositório qualquer token/chave (deixar só em `.env`)
- [ ] Migrações do banco aplicáveis e reproduzíveis (dev/stage/prod)
- [ ] Seed mínimo para dev (1 usuário + 1 contest + árvore base de nodes)
- [ ] Contratos de telemetria definidos (eventos e payloads) e persistidos no banco
- [ ] Idempotência na ingestão (upsert por `cortexIdNum`) antes de importar massa

### Incrementos (não bloqueiam o core)
- [ ] Layout/ajustes finos do side panel (desde que seja utilizável)
- [ ] CI/CD e publicação (pode entrar quando o core já estiver estável)
- [ ] Gamificação/comunidade (só depois que o método estiver validado)

### Sprint 1 — Fundamentos de execução (dev/prod)
- Entrega: repositório higienizado, builds e execução previsíveis, segredos protegidos.
- Critério de pronto:
  - backend sobe com `.env` aplicado e healthcheck
  - extensão abre no side panel sem layout quebrado
  - nenhum segredo sensível versionado
- Itens do checklist envolvidos: 1), 2) (UX), 7) (healthcheck), 9) (permissões)

### Sprint 2 — Core Data Model + Migrações + Seed (sem popular questões)
- Entrega: banco versionado (migrations), seed mínimo e entidades essenciais para telemetria e engines.
- Critério de pronto:
  - migrations aplicadas em dev/stage
  - seed cria um usuário/contest de exemplo
  - CRUD básico de Knowledge Node funcionando
- Itens do checklist envolvidos: 5), 4) (módulos), 6) (normalização base)

### Sprint 3 — Telemetria (a “fonte de verdade” das engines)
- Entrega: endpoints/eventos para registrar o comportamento real do usuário (o combustível das engines).
- Critério de pronto:
  - registrar sessão de estudo (início/fim)
  - registrar interação/revisão (acerto/erro/tempo)
  - dashboards básicos conseguem ler os dados gravados
- Itens do checklist envolvidos: 4) (API de domínio), 7) (observabilidade), 10) (bases para RE/ME/AE)

### Sprint 4 — KGE + Notes + Flashcards + SRS/RE (sem questões)
- Entrega: knowledge graph operacional + base de notas + flashcards + fila diária e agendamento.
- Critério de pronto:
  - usuário cria/edita nós e notas
  - gera flashcard a partir de nota (manual e/ou IA)
  - fila diária de revisões (SRS) com reagendamento
- Itens do checklist envolvidos: 4) (knowledge, flashcards), 10.3 (RE), 10.6 (KGE), 11) (IA opcional como “copiloto”)

### Sprint 5 — Scheduling Engine (SE) + “Hoje” replanejável
- Entrega: plano diário/semanal determinístico com replanejamento e prioridades por nó do conhecimento.
- Critério de pronto:
  - gerar “Hoje” (lista de atividades) com pesos, tempo disponível e prazo
  - replanejar após faltas/atrasos
  - explicar em linguagem humana “por que hoje isso?” (IA apenas explicando)
- Itens do checklist envolvidos: 10.2 (SE), 10.1 (LSE mínimo), 11.2 (explicações)

### Sprint 6 — Upload + análise de edital (pipeline completo)
- Entrega: upload de edital (PDF), extração de texto, estruturação em tópicos/pesos e vínculo no grafo.
- Critério de pronto:
  - guardar o PDF/texto e a estrutura derivada (versão do edital)
  - mapear tópicos do edital para Knowledge Nodes
  - “Hoje” e “Plano” passam a usar o edital como fonte de pesos
- Itens do checklist envolvidos: 4) (upload+análise), 10.6 (KGE), 11) (IA no parsing/estruturação)

### Sprint 7 — BD de questões + BIE + QE (quando o core já está pronto)
- Entrega: ingestão idempotente, normalização e perfil de banca (BIE), treino por lacuna (QE).
- Critério de pronto:
- upsert por `cortexIdNum` sem duplicação
  - métricas por banca/matéria/tópico
  - recomendações do SE/LSE passam a considerar “perfil de banca”
- Itens do checklist envolvidos: 5) (unicidade), 6) (idempotência/normalização), 10.5 (BIE), 11) (IA para insights)

### Sprint 8 — Radar (RAE) + Analytics (AE) + qualidade/CI/publicação
- Entrega: índice Cortex, prontidão/risco, CI estável e pacote pronto para Web Store.
- Critério de pronto:
  - dashboards com evolução, domínio e retenção
  - Radar de Aprovação e explicações
  - build/test automático e checklist de publicação completo
- Itens do checklist envolvidos: 8), 9), 10.7 (AE), 10.9 (RAE)

## 1) Repositório / Setup
- [x] Estrutura separada: extension/ (Chrome MV3) + backend/ (NestJS)
  - Objetivo: manter responsabilidades claras (UI/UX no client; regras de negócio, IA e dados no server).
  - Benefício: facilita evoluir para app Flutter no futuro (backend vira “fonte de verdade”).
- [x] Pastas de legados preservadas (extension-legacy/, backend-legacy/)
  - Objetivo: manter histórico/experimentos sem bloquear o MVP atual.
  - Atenção: evitar dependências cruzadas com o legado (não importar código “antigo” sem revisão).
- [x] Builds gerados (extension/dist, backend/dist)
  - Objetivo: permitir testes rápidos de entrega e empacotamento.
  - Atenção: builds em repositório geralmente aumentam ruído; ideal manter apenas em releases/artefatos de CI.
- [ ] Padronizar nomenclatura de pastas e caminhos (evitar espaço/acentos em paths críticos, quando possível)
  - Objetivo: reduzir problemas no Windows/Node/Python (paths com espaço/acentos quebram tooling e scripts).
  - Resultado esperado: execução consistente de scripts, build e deploy.
- [ ] Higienizar repositório (remover/ignorar arquivos sensíveis como client_secret*.json)
  - Objetivo: evitar vazamento de credenciais.
  - Resultado esperado: segredos apenas em `.env`/Vault/Secrets do deploy; repositório “publicável”.

## 2) Extensão (Chrome MV3)
- [x] Manifest MV3 com side_panel, background service worker e content_script
  - O que faz: define permissões, entrada do Side Panel, script de background (service worker) e script in-page.
  - Por que importa: o Side Panel é o “modo de estudo contínuo”; o content script habilita ações contextuais na página.
- [x] Side Panel configurado para abrir via ícone (openPanelOnActionClick + open no onClicked)
  - O que faz: clicar no ícone abre o painel, evitando o popup “fechar” ao trocar de aba.
  - Resultado esperado: UX consistente para sessões longas de estudo.
- [x] Stack frontend: Vite + React + TypeScript + Tailwind
  - O que faz: UI rápida, build eficiente, tipagem e design system básico via Tailwind.
  - Resultado esperado: componentes reutilizáveis e telas evolutivas (onboarding → “Hoje” → “Plano” etc.).
- [x] Content script com widget in-page (src/content/Widget.tsx)
  - O que faz: camada opcional de ações rápidas na página (ex.: “Salvar trecho”, “Resumir seleção”).
  - Resultado esperado: capturar conhecimento sem sair do contexto.
- [x] Onboarding em passos (components/onboarding/Step1..Step7)
  - O que faz: captura dados essenciais do usuário (perfil, rotina, prova, edital/estrutura).
  - Resultado esperado: após onboarding, a Cortex consegue gerar um “Hoje” acionável.
- [x] Persistência de estado do onboarding (Zustand store com hidratação)
  - O que faz: mantém o passo e dados do onboarding mesmo após fechar/abrir navegador.
  - Resultado esperado: onboarding resiliente (sem frustração por perda de progresso).

### UX / Layout (pendências atuais)
- [ ] Ajustar largura/layout do Side Panel para não “quebrar” e caber bem em telas menores
  - O que fazer: revisar responsividade, overflow, tamanhos mínimos e padding.
  - Resultado esperado: painel confortável para leitura e ações (sem scroll horizontal e sem cortes).
- [ ] Validar comportamento do Side Panel ao trocar de aba/janela (manter aberto e consistente)
  - O que fazer: garantir que abrir em uma aba não “resete” estado quando muda de contexto; alinhar com APIs do Chrome.
  - Resultado esperado: o usuário sente que “o painel é o app”.
- [ ] Reduzir logs verbosos no console para build de produção (sem expor tokens)
  - O que fazer: remover logs com dados sensíveis e reduzir ruído.
  - Resultado esperado: segurança e melhor diagnóstico (logs úteis, sem vazamentos).

## 3) Auth (Extensão)
- [x] Login Google via Supabase (PKCE) usando chrome.identity.launchWebAuthFlow
  - O que faz: abre janela de login Google e troca `code` por sessão via Supabase.
  - Resultado esperado: login com baixo atrito e tokens gerenciados por PKCE.
- [x] Storage compatível com extensão (chrome.storage.local como storage do Supabase)
  - O que faz: substitui localStorage (incompatível/instável em extensão) por chrome.storage.local.
  - Resultado esperado: sessão persistente e auto-refresh funcionando.
- [x] Persistência de sessão + verificação de sessão no App.tsx
  - O que faz: ao abrir o painel, verifica sessão e pula o onboarding de login quando já autenticado.
  - Resultado esperado: abrir o Cortex é instantâneo (sem pedir login toda hora).
- [x] Sync do usuário com backend (POST /auth/sync)
  - O que faz: envia token Bearer do Supabase para o backend criar/atualizar o usuário no banco.
  - Resultado esperado: backend consegue associar dados (contests/nodes/sessões) ao usuário correto.
- [ ] UX de erros (mensagens amigáveis, retry, estados “carregando”, etc.)
  - O que fazer: mapear erros comuns (janela fechada, rede, token inválido) e dar feedback com ação (tentar novamente).
  - Resultado esperado: diminuir abandono do onboarding.
- [ ] Logout e limpeza de estado em todas as superfícies (side panel + popup/widget, se aplicável)
  - O que fazer: endpoint/ação clara de logout; limpar storage local e estados UI.
  - Resultado esperado: usuário consegue trocar de conta sem “lixo” de sessão.

## 4) Backend (NestJS)
- [x] Estrutura NestJS com módulos: auth, users, contests, knowledge, planning, ai, scraper, database
  - O que faz: separa domínio e infraestrutura; cada módulo vira uma “capacidade” do produto.
  - Resultado esperado: evoluir APIs sem virar um monolito confuso.
- [x] Guard de autenticação via Supabase (SupabaseAuthGuard + strategy)
  - O que faz: valida Bearer token e injeta usuário no request.
  - Resultado esperado: endpoints protegidos sem implementar auth do zero.
- [x] Prisma integrado (DatabaseService) e schema com entidades principais
  - O que faz: ORM tipado e migrações para Postgres/Supabase.
  - Resultado esperado: consistência de dados e facilidade de evoluir o schema.
- [x] Serviço de IA (Gemini) com fallback mock quando GEMINI_API_KEY não está configurada
  - O que faz: prova de conceito de IA (ex.: estruturar edital), com modo “mock” para dev/test.
  - Resultado esperado: desenvolvimento local sem depender de chave paga.
- [x] Módulo “scraper” para orquestrar o Python e opcionalmente sincronizar no banco (via linhas SYNC_DATA)
  - O que faz: inicia/para scraper e intercepta streaming de dados para persistir.
  - Resultado esperado: pipeline de ingestão automatizado (sem upload manual de JSON).

### API / Domínio (MVP pendente)
- [ ] Planejamento (cronograma): endpoints e regras de geração/replanejamento
  - O que é: motor determinístico que decide “o que estudar hoje/semana” com base em edital, tempo e progresso.
  - API típica: criar plano, listar semana, registrar execução, replanejar após faltas.
  - Resultado esperado: “Hoje” sempre acionável e atualizado.
- [ ] Knowledge Base (notas): CRUD + hierarquia (matéria/tópico/subtópico)
  - O que é: base de conhecimento do aluno (resumos, pegadinhas, lei seca, recortes com URL).
  - Resultado esperado: o conteúdo vira ativo do usuário e alimenta flashcards/IA.
- [ ] Flashcards/SRS: CRUD + fila diária + agendamento
  - O que é: motor de repetição espaçada (SRS) com fila do dia e histórico de reviews.
  - Resultado esperado: retenção aumenta sem depender de “força de vontade”.
- [ ] Upload de edital (PDF) + análise (pipeline e armazenamento)
  - O que é: endpoint de upload + extração de texto + estrutura (matérias/tópicos/pesos).
  - Resultado esperado: onboarding mais rápido e plano mais fiel ao edital.
- [ ] Tokens/consumo: ledger de consumo, idempotência por request_id, limites por plano
  - O que é: contabilidade de uso de IA (saldo, débito por operação, limites e antifraude).
  - Resultado esperado: monetização sustentável e previsível.

## 5) Banco de Dados (Prisma/Supabase)
- [x] Modelagem inicial (User, Contest, KnowledgeNode, Note, Flashcard, Question, StudySession, Revision)
  - O que cobre: usuários, concursos, árvore de conhecimento, notas, flashcards, questões, sessões e revisões.
  - Resultado esperado: base suficiente para o “sistema operacional” de aprendizagem.
- [ ] Configurar datasource (DATABASE_URL) e rodar migrações com histórico consistente
  - O que fazer: garantir `DATABASE_URL` correto, criar migrações e aplicar em dev/stage/prod.
  - Resultado esperado: banco versionado e reprodutível.
- [ ] Seed mínimo (usuário/contest padrão) para ambiente dev
  - O que fazer: script/seed que cria 1 usuário e 1 contest de exemplo.
  - Resultado esperado: testar UI e endpoints sem depender de login toda hora.
- [ ] Regras de unicidade/deduplicação para questões importadas (cortexIdNum)
  - O que fazer: usar `cortexIdNum` como chave única e upsert na ingestão.
  - Resultado esperado: reprocessar scraper sem “inchar” o banco.

## 6) Integração Scraper → Banco
- [x] Protocolo de streaming via stdout (linhas SYNC_DATA) já interpretado no backend
  - O que faz: o scraper “empurra” questão por questão; o backend salva sem precisar abrir JSON gigante.
  - Resultado esperado: ingestão contínua e tolerante a falhas.
- [x] Criação automática de “Global Scraper Pool” quando não há contest
  - O que faz: evita travar ingestão por ausência de contest configurado.
  - Resultado esperado: sempre existe um destino padrão para dados de ingestão.
- [ ] Garantir idempotência no upsert de questões (evitar duplicatas em reprocessamentos)
  - O que fazer: upsert por `cortexIdNum` e manter o identificador do portal apenas como metadado no `rawJson` (sem expor no produto).
  - Resultado esperado: rodar repair runs sem duplicar base.
- [ ] Estratégia de normalização (banca/ano/matéria/tópicos) antes de persistir
  - O que fazer: normalizar strings (trim/case), mapear entidades (board, subject, topic) e relacionar com KnowledgeNode.
  - Resultado esperado: consultas e analytics consistentes.

## 7) Observabilidade / Operação
- [ ] Painel/aba para acompanhar execução do scraper (progresso, status, últimos erros)
  - O que é: visão “job runner” (em tempo real) dentro do painel da extensão/admin.
  - Resultado esperado: saber o que está rodando e por que parou sem ir ao terminal.
- [ ] Persistir logs/execuções (job runs) no banco para auditoria
  - O que é: armazenar execuções do scraper e jobs de IA (início, fim, status, contadores).
  - Resultado esperado: rastreabilidade e depuração pós-incidente.
- [ ] Healthcheck do backend + status do processo do scraper
  - O que é: endpoint `/health` e status do processo do scraper (running/stopped/last_exit_code).
  - Resultado esperado: operação confiável e monitorável.

## 8) Qualidade (Tests / CI)
- [x] Estrutura de testes no backend (spec/e2e)
  - O que existe: base para unit e e2e.
  - Resultado esperado: conseguir adicionar testes incrementais por módulo.
- [ ] Testes de integração dos principais fluxos (auth, sync, scraper sync)
  - O que fazer: cobrir login+sync, ingestão de questão, criação de contest/nodes básicos.
  - Resultado esperado: reduzir regressões em deploys.
- [ ] Pipeline de build (CI) para extension + backend
  - O que fazer: build + lint + test em PR, e artefatos para release.
  - Resultado esperado: previsibilidade de entrega.

## 9) Publicação
- [x] Documentos auxiliares (PUBLISHING.md, STORE_LISTING_PTBR.md)
  - O que faz: prepara descrição, posicionamento e guia de publicação.
  - Resultado esperado: menos retrabalho na Chrome Web Store.
- [ ] Revisar permissões no manifest (mínimo necessário)
  - O que fazer: reduzir `host_permissions` e permissões gerais ao mínimo.
  - Resultado esperado: mais aprovação e confiança do usuário.
- [ ] Checklist de publicação na Chrome Web Store (privacidade, dados coletados, screenshots)
  - O que fazer: política de privacidade, termos, screenshots e descrições alinhadas ao comportamento real.
  - Resultado esperado: publicação sem rejeição.

## 10) Engines Cortex (Arquitetura do Produto)
Princípio: as engines tomam decisões por regras/matemática; a IA explica e gera artefatos quando necessário.

### 10.1) Learning Science Engine (LSE)
- [ ] Implementar LSE (regras de Active Recall, Spaced Repetition e Interleaving)
  - O que faz: transforma eventos de estudo (tempo, acertos/erros, revisões) em recomendações automáticas.
  - Saídas típicas: `review_date`, `priority`, técnica recomendada e carga sugerida.

### 10.2) Scheduling Engine (SE)
- [ ] Implementar SE (geração de cronograma e “Hoje”)
  - O que faz: calcula plano semanal/diário usando pesos do edital, disponibilidade, tempo até prova e déficit do aluno.
  - Resultado esperado: “o que estudar agora” sempre calculado e replanejável.

### 10.3) Retention Engine (RE)
- [ ] Implementar RE (retenção real)
  - O que faz: estima retenção por tópico combinando desempenho, revisões e tempo desde último contato.
  - Resultado esperado: priorizar revisões “onde mais dói” e reduzir esquecimento.

### 10.4) Mastery Engine (ME)
- [ ] Implementar ME (domínio por tópico)
  - O que faz: calcula domínio usando evidências (questões, revisões, tempo, simulados) com pesos configuráveis.
  - Resultado esperado: mapa de domínio 0–100 por nó do Knowledge Graph.

### 10.5) Board Intelligence Engine (BIE)
- [ ] Implementar BIE (perfil de banca)
  - O que faz: a partir da base de questões, calcula frequências por banca/matéria/tópico/dificuldade e padrões de cobrança.
  - Resultado esperado: “o que mais cai na FGV/Cebraspe” e ajuste do plano por banca.

### 10.6) Knowledge Graph Engine (KGE)
- [ ] Implementar KGE (grafo/árvore de conhecimento)
  - O que faz: estrutura Matéria → Tópico → Subtópico, conecta notas/flashcards/questões e mantém relações.
  - Resultado esperado: organização do conhecimento e base para personalização.

### 10.7) Analytics Engine (AE)
- [ ] Implementar AE (métricas e Índice Cortex)
  - O que faz: consolida execução, consistência, domínio e retenção em dashboards.
  - Resultado esperado: usuário enxerga evolução e gargalos com clareza.

### 10.8) Cognitive Profile Engine (CPE)
- [ ] Implementar CPE (perfil cognitivo)
  - O que faz: mede quais métodos funcionam melhor para o usuário (leitura/vídeo/questões/flashcards) com base em resultados.
  - Resultado esperado: adaptar o plano ao “jeito de aprender” do usuário.

### 10.9) Radar de Aprovação Engine (RAE)
- [ ] Implementar RAE (prontidão/risco)
  - O que faz: calcula preparo provável combinando edital, tempo restante, domínio e retenção.
  - Resultado esperado: indicador simples (0–100) e risco (baixo/médio/alto) para orientar estratégia.

## 11) IA (copiloto das engines)
### 11.1) AI Gateway (camada única)
- [ ] Implementar AI Gateway (jobs assíncronos + idempotência + custos)
  - O que faz: todas as chamadas a modelos passam por um gateway com `request_id`, logs e custo por operação.
  - Resultado esperado: trocar provedor sem alterar engines, e controlar gasto de tokens.

### 11.2) IA aplicada (onde agrega)
- [ ] Geração de flashcards, resumos e explicações
  - O que faz: cria artefatos (cards, resumos, mapas) e explica decisões das engines em linguagem humana.
  - Resultado esperado: mais valor percebido com menos custo do que “IA decidindo tudo”.

## 12) Produção (Web + API + Supabase) — passo a passo
Objetivo: publicar `@cortex/web` e `@cortex/backend` com segurança e previsibilidade (projeto solo), mantendo Supabase como Postgres.

### 12.1) Pré-requisitos
- [ ] Domínio e DNS definidos (recomendado):
  - `app.seudominio.com` (Web)
  - `api.seudominio.com` (Backend)
- [ ] Separar ambientes: `dev` (local), `stage` (opcional), `prod`.
- [ ] Todos os segredos apenas em variáveis de ambiente (nunca no frontend).

### 12.2) Banco (Supabase)
- [ ] Criar projeto Supabase de produção
- [ ] Configurar:
  - `DATABASE_URL` (conexão do Prisma)
  - Pooler/connection pooling (para evitar estourar conexões com crescimento)
- [ ] Rodar migrações por histórico (produção):
  - gerar migrações em dev com `prisma migrate dev`
  - aplicar em prod com `prisma migrate deploy`
- [ ] Backups e retenção habilitados (no plano adequado)

### 12.3) Backend (NestJS)
- [ ] Garantir endpoints mínimos:
  - `/health` (liveness/readiness)
  - `/auth/google` (login web) e/ou `/auth/sync` (extensão)
  - `/auth/me` (validar sessão do cliente)
- [ ] Configurar variáveis (prod):
  - `DATABASE_URL`
  - `SUPABASE_URL`, `SUPABASE_JWT_SECRET` (ou mecanismo equivalente já usado no guard)
  - `GOOGLE_CLIENT_ID`/config OAuth (se usar Google no web)
  - `CORS_ORIGINS=https://app.seudominio.com`
- [ ] Deploy (opções seguras e simples):
  - Cloud Run / Render / Fly.io (recomendado para projeto solo)
  - Sempre com HTTPS e logs centralizados
- [ ] Segurança:
  - rate limit em rotas públicas (auth)
  - validação de input (DTOs)
  - não logar tokens/PII

### 12.4) Web App (React + Vite)
- [ ] Configurar variáveis no host do frontend:
  - `VITE_API_URL=https://api.seudominio.com`
  - `VITE_GOOGLE_CLIENT_ID=...`
- [ ] Deploy do `@cortex/web` como SPA:
  - build: `npm -w @cortex/web run build`
  - publicar pasta `layout/dist`
  - configurar fallback de rotas para `index.html` (React Router)
- [ ] Headers recomendados:
  - CSP (mínimo para scripts do Google Identity)
  - HSTS, X-Content-Type-Options, Referrer-Policy, frame-ancestors

### 12.5) Observabilidade e operação (50k usuários/ano)
- [ ] Índices e paginação obrigatórios em endpoints de lista (questões, sessões, revisões)
- [ ] Cache para telas “quentes” (Dashboard/Hoje) quando necessário
- [ ] Monitorar:
  - latência p95/p99 do backend
  - erros por rota
  - consumo de conexões Postgres e tamanho do banco

### 12.6) Design/UI
- [ ] Gerar layout no Figma e design system
  - Prompt pronto: [figma_prompt_cortex_web.md](file:///e:/Cortex/docs/figma_prompt_cortex_web.md)
