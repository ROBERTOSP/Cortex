# Cortex Extensão — Agente Inteligente de Estudos (Spec)

## 1. Objetivo
Criar uma extensão de navegador que funcione como um agente auxiliar inteligente de estudos para concursos, com foco em:
- entender rotina e disponibilidade do usuário
- entender edital/cargo e data da prova (com opção de upload do edital)
- gerar e ajustar cronograma automaticamente
- oferecer notas, flashcards, mapas mentais e checklists
- disponibilizar IA sob demanda por tokens (mensalidade + franquia)

O produto não depende de “banco de questões” para existir.

## 2. Experiência do Usuário (primeiro uso)
### 2.1. Abertura e Contexto
A extensão deve funcionar em três superfícies:
- **Popup**: acesso rápido (ações pontuais).
- **Side Panel**: ambiente de estudo contínuo (principal).
- **Widget in-page (opcional)**: ações mínimas contextuais.

### 2.2. Fluxo 0 → 1 (Onboarding)
**Meta do onboarding:** sair com um cronograma inicial e o “Hoje” pronto.

Passo 1 — Perfil de prova
- Cargo pretendido
- Data da prova (ou “a definir”)
- Banca (se souber)
- Edital: escolher entre:
  - informar manualmente (matérias/pesos)
  - upload do edital (PDF)

Passo 2 — Rotina e disponibilidade
- Dias disponíveis por semana
- Horas por dia
- Restrições: trabalho/faculdade (opcional)
- Preferência de blocos: 25/50/90 minutos

Passo 3 — Diagnóstico rápido (aprendizagem)
- Autoavaliação por matéria (0–5)
- Preferências: leitura / vídeo / questões / revisão
- Dificuldades: foco, ansiedade, organização, procrastinação (checkbox)

Passo 4 — Geração do plano
- IA analisa o edital (se enviado) e gera:
  - árvore de matérias/tópicos (quando possível)
  - distribuição por semanas até a prova
  - revisão espaçada e simulados
- Usuário escolhe:
  - intensidade (leve/normal/agressiva)
  - ênfase (base / questões / revisões)

Saída do onboarding:
- “Plano Semanal”
- “Hoje” com 3 ações
- primeira rotina sugerida (“setup de estudo”)

## 3. Modelo Mental do Produto
O usuário sempre deve conseguir responder:
- o que fazer agora
- por que isso é o melhor agora
- como registrar o que foi feito
- como melhorar o plano automaticamente

## 4. Funcionalidades (Core)
### 4.1. Cronograma (sem IA)
- Calendário semanal com blocos
- Replanejar manualmente (drag-and-drop)
- Regras fixas:
  - revisões 1–7–15–30 (configurável)
  - simulado semanal (configurável)
- Registro de execução:
  - concluído / parcial / pulado
  - dificuldade percebida (1–5)

### 4.2. Notas (Knowledge Base)
- Hierarquia: Matéria → Tópico → Subtópico
- Templates:
  - Resumo
  - Pegadinhas
  - Lei seca
  - Erros comuns
- Captura rápida:
  - salvar trecho selecionado da página (texto + URL)

### 4.3. Flashcards + SRS
- Criar flashcard manualmente (frente/verso)
- Revisão por fila do dia
- Regras de repetição (mínimo viável):
  - acertei: adia
  - errei: volta para curto prazo

### 4.4. Mapas mentais (sem IA)
- Representação em árvore (outline) por tópico
- Exportação:
  - Markdown
  - texto estruturado

### 4.5. Setup de Estudo e Rotina
- Checklist inicial:
  - definir objetivo da sessão
  - desligar distrações
  - timer
  - material do dia
- Timer (Pomodoro) opcional integrado ao “Hoje”.

## 5. Funcionalidades com IA (Tokens)
### 5.1. Ações (botões) com consumo de tokens
- Resumir seleção (curto)
- Resumir PDF/editais (longo)
- Gerar mapa mental (outline)
- Gerar flashcards (N cards)
- Gerar plano/crono por edital e data da prova
- Ajustar cronograma após perda de dias
- Criar “revisão de véspera” de um tópico
- Explicar um tópico “como iniciante”

### 5.2. Regras de consumo
O consumo é debitado no backend por operação, com:
- custo por tipo de tarefa
- custo proporcional (por tamanho do texto/PDF)
- idempotência por request_id (evitar debitar duas vezes)

### 5.3. Guardrails
- A IA não roda no client.
- A extensão envia apenas o necessário (texto selecionado, PDF, parâmetros).
- Resultado pode ser salvo como:
  - nota
  - mapa mental
  - flashcards
  - itens do cronograma

## 6. Monetização (assinatura + tokens)
### 6.1. Planos
- Mensalidade inclui:
  - Core ilimitado
  - X tokens por mês
- Tokens extras:
  - compra avulsa (top-up)

### 6.2. Estados do usuário
- trial (opcional)
- ativo
- expirado
- bloqueado (fraude)

## 7. UX da Extensão (telas)
### 7.1. Popup (rápido)
- Status do dia: 1 próxima ação + timer (start/stop)
- Botões rápidos:
  - Registrar sessão
  - Criar nota do trecho selecionado
  - Gerar flashcards (IA)
  - Resumir seleção (IA)
- Atalho: “Abrir painel”

### 7.2. Side Panel (principal)
Abas:
- **Hoje**: 3 ações + timer + progresso
- **Plano**: semana atual + replanejar
- **Notas**: árvore + editor
- **Flashcards**: fila do dia
- **IA**: histórico de solicitações + consumo de tokens

### 7.3. Widget in-page (opcional)
- 2 ações:
  - “Salvar trecho”
  - “Resumir”

## 8. Dados que a extensão precisa armazenar localmente
Somente cache e UX:
- api_base_url
- auth token (curto) + refresh (se aplicável)
- modo ativo/desativo
- fila offline (eventos/solicitações pendentes)

## 9. Backend/API (alto nível)
### 9.1. Módulos
- Auth (login)
- Billing (assinatura)
- Tokens (saldo, consumo)
- Planner (cronograma)
- Notes (notas)
- Flashcards (SRS)
- AI Orchestrator (tarefas IA)

### 9.2. Endpoints mínimos (MVP)
- `POST /auth/login` (fluxo escolhido)
- `POST /auth/refresh`
- `GET /me` (status + tokens)
- `POST /v1/ai/jobs` (criar job IA)
- `GET /v1/ai/jobs/{id}` (resultado)
- `GET/POST /v1/planner/*`
- `GET/POST /v1/notes/*`
- `GET/POST /v1/flashcards/*`
- `POST /v1/uploads` (edital PDF)
- `POST /v1/edital/analyze` (gera estrutura do edital)

## 10. Segurança e Privacidade
- Tokens e assinatura validados no backend em cada operação IA.
- Logs sem dados sensíveis do usuário.
- PDF enviado deve ser armazenado com políticas:
  - criptografia em repouso (produção)
  - expiração opcional
  - escopo por usuário

## 11. MVP sugerido (primeira entrega pagável)
- Onboarding (rotina + edital upload)
- Geração de plano por IA (tokens)
- Hoje + Timer
- Notas com captura de seleção
- Flashcards (manual + geração por IA)
- Painel lateral (side panel)
- Login + assinatura + tokens (backend)

## 12. Evoluções (futuro)
- Telemetria avançada via integração com portais
- Diagnóstico de aprendizagem baseado em comportamento (sem banco de questões)
- Simulados guiados e pós-prova
- Comparativo de bancas e padrões (conteúdo gerado por IA e curadoria)

