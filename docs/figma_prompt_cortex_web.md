# Prompt para Figma — Cortex Web (React + Vite + Tailwind + shadcn)

Crie um design UI completo e consistente para o produto “Cortex”, um Personal Trainer Cognitivo para preparação de concursos. O produto principal é um Web App (SPA) feito em React + Vite + TypeScript, com TailwindCSS e componentes no estilo shadcn/ui (visual limpo, moderno, alto contraste, com estados bem definidos).

## Objetivo do design
- Transformar um sistema complexo (planejamento, revisão, questões, analytics) em uma UX simples, “orientada a ação”, com foco no que fazer hoje.
- Priorizar leitura e execução (sessões de estudo), com baixa fricção.

## Identidade visual (direção)
- Estilo: minimalista, profissional, “produtividade”, confiável.
- Tipografia: Inter (ou similar), tamanhos confortáveis para leitura longa.
- Cores: tema claro e escuro (dark mode), com tokens: background, foreground, muted, accent, destructive, border.
- Layout: grid de 12 colunas para desktop; responsivo para tablet/mobile.
- Componentes com borda suave, sombras discretas, radius 10–14px.

## Páginas e fluxos (obrigatório)
1) Login
   - Login com Google (botão principal) + mensagens de erro/estado de carregamento.
   - Aviso de privacidade (texto curto) e link para termos/política.

2) Shell / App Layout (após login)
   - Sidebar fixa no desktop e drawer no mobile.
   - Itens: Dashboard, Deep Work (Study), Analytics, Cronograma.
   - Top bar no mobile com nome do produto e ações.

3) Dashboard (Home)
   - Card principal “Hoje” com lista de atividades (ex.: Revisões, Leitura, Questões) com duração estimada.
   - Card “Próximos 7 dias” (mini calendário/linha do tempo).
   - Card “Indicadores” (consistência, domínio, retenção).
   - CTA claro: “Iniciar sessão” (começar agora).

4) Deep Work (Study)
   - Modo “sessão” com:
     - timer/pomodoro opcional
     - objetivo da sessão
     - checklist de microtarefas
     - registro de resultado (feito/não feito, tempo, observações)
   - Estados: vazio (sem plano), carregando, erro.

5) Analytics
   - Visão semanal/mensal
   - Gráficos (linhas/barras) para: tempo de estudo, acertos/erros, revisões concluídas
   - Tabelas/resumos por matéria/tópico

6) Cronograma (Schedule)
   - Calendário e lista de tarefas
   - Replanejamento: UI para mover atividades e justificar “não consegui”

## Componentes (biblioteca)
Criar componentes e variações (normal/hover/active/disabled/loading):
- Buttons (primary/secondary/outline/ghost/destructive)
- Inputs, Selects, Switch, Tabs
- Cards, Badges, Alerts/Toasts
- Tables, Pagination
- Sidebar + Mobile Drawer/Sheet
- Skeleton loaders
- Empty states (bem desenhados)

## Regras de UX
- Cada tela deve ter “ação principal” única e clara.
- Mostrar feedback rápido (toasts, skeleton, estados vazios).
- Acessibilidade: contraste adequado, foco visível, tamanhos clicáveis.

## Entregáveis no Figma
- Design system (tokens + componentes) e exemplos de uso.
- Protótipo clicável do fluxo: Login → Dashboard → Iniciar sessão (Deep Work) → Analytics.
- Versões: Desktop (1440px) e Mobile (390px).

