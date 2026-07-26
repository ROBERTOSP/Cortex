# Plano de Criação Cortex - Checklist Passo a Passo

Este checklist foi gerado com base no `CortexProjeto.md` e `fluxo_usuario.md`. O objetivo é transformar a visão do "Digital Cognitive Twin" em um produto funcional (MVP).

---

## Phase 1: Infraestrutura & Core (Setup Inicial)
- [x] **Ambiente:** Reorganizar pastas (`backend-legacy`, `extension-legacy`).
- [x] **Backend:** Inicializar NestJS com TypeScript e Clean Architecture.
- [x] **Frontend:** Inicializar Extensão React + Vite + TS + Tailwind (Manifest V3).
- [x] **Widget Flutuante:** Implementar botão flutuante e popup arrastável (framer-motion).
- [x] **Estética:** Configurar tema Notion-style (Light/Dark mode) e tipografia.
- [x] **Banco de Dados:** Configurar PostgreSQL (Supabase) e esquemas iniciais (Prisma).
- [x] **Sincronização:** Criar Background Service e persistência de sessão (Side Panel).

---

## Phase 2: Onboarding & Identidade
- [x] **UI Onboarding:** Implementar as 7 telas (Boas-vindas, Login, Perfil, Edital, Data, Rotina, Plano).
- [x] **Auth Google:** Implementar OAuth2 real (Supabase Auth) e persistência de sessão.
- [ ] **Perfil Cognitivo (Base):** Criar endpoints para salvar dados de rotina e nível de cansaço.
- [x] **Gestão de Estado:** Finalizar Store (Zustand) com persistência no chrome.storage.

---

## Phase 3: Knowledge Graph & Edital Engine (O Coração)
- [ ] **Edital Parser:** Implementar serviço para extrair texto de PDF e estruturar em Grafo (Concurso -> Disciplina -> Tópico).
- [ ] **Grafo de Conhecimento:** Criar estrutura de dados em grafo no PostgreSQL.
- [ ] **Normalização:** IA para normalizar nomes de matérias entre editais diferentes.
- [ ] **Knowledge Scoring:** Implementar métricas de Mastery e Retention iniciais (zeradas).

---

## Phase 4: Workspace & Note Engine
- [ ] **Dashboard (Notion-style):** Criar o centro de comando com widgets (Retenção, Fadiga, Próxima Sessão).
- [ ] **Editor de Notas:** Implementar editor Markdown/Rich-text (TipTap/Slate) vinculado a tópicos.
- [ ] **Vínculo Automático:** Ao criar nota, vincular automaticamente ao ID do Tópico no Grafo.
- [ ] **Deep Work Mode:** Interface minimalista para sessões de estudo focadas.

---

## Phase 5: Study Engines (Engrenagens de Estudo)
- [ ] **Planning Engine:** Algoritmo que gera o cronograma dinâmico baseado na rotina e peso do edital.
- [ ] **Flashcard Engine:** Geração automática de cards a partir das anotações (IA).
- [ ] **Question Engine:** Integração com scraper legado para sugerir questões reais do tópico atual.
- [ ] **Revision Engine (SRS):** Implementar repetição espaçada (1d, 7d, 15d, 30d).

---

## Phase 6: Inteligência & Analytics
- [ ] **Cortex Index™:** Implementar cálculo de Consistência, Execução, Retenção e Domínio.
- [ ] **Radar de Aprovação™:** Visualização gráfica de pontos fortes e riscos de esquecimento.
- [ ] **Monitoramento de Fadiga:** IA para detectar queda de performance e sugerir pausas.
- [ ] **Insights Cognitivos:** Geração de relatórios de sessão ("Você está errando X por falta de atenção").

---

## Phase 7: Monetização & Produção
- [ ] **Billing:** Integrar Stripe para assinaturas (Plano Premium).
- [ ] **Store Listing:** Preparar assets (ícones, screenshots) e textos de privacidade.
- [ ] **Web Store:** Publicar como Unlisted para testes beta.

---

## Phase 8: Refinamento & Escala (Futuro)
- [ ] **IA Local:** Integrar Transformers.js para classificação offline.
- [ ] **Mobile App:** App de revisão rápida sincronizado (Flutter/React Native).
- [ ] **Predição de Desempenho:** IA treinada em padrões de bancas (FGV, Cebraspe).
