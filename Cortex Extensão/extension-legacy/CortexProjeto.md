CORTEX

Product Requirements Document (PRD)

Versão 1.0

---

1. VISÃO DO PRODUTO

O que é a Cortex?

A Cortex é uma plataforma inteligente de planejamento, acompanhamento e otimização de estudos para concursos públicos.

Seu objetivo não é apenas organizar conteúdos, mas descobrir continuamente o melhor método de aprendizagem para cada candidato, adaptando cronogramas, revisões e estratégias conforme sua evolução.

---

Missão

Transformar editais complexos em caminhos claros, personalizados e executáveis para aprovação.

---

Proposta de Valor

A Cortex não vende:

- Cronogramas
- Flashcards
- Mapas mentais
- Anotações

A Cortex vende:

"Um sistema inteligente que constrói e adapta continuamente o melhor setup de estudo para cada candidato."

---

2. PÚBLICO-ALVO

Fase Inicial

Concurseiros:

- Polícia Federal
- PRF
- PCDF
- Polícia Penal
- Tribunais
- Receita Federal
- Banco do Brasil
- Caixa
- INSS
- Concursos estaduais
- Concursos municipais

---

3. FILOSOFIA DA PLATAFORMA

Todo usuário possui:

- Rotina diferente
- Tempo disponível diferente
- Capacidade de retenção diferente
- Dificuldades diferentes

Portanto:

Não existe um cronograma ideal universal.

Existe apenas o cronograma ideal para aquele usuário.

---

4. ARQUITETURA CONCEITUAL

O núcleo da Cortex não são documentos.

O núcleo da Cortex são Tópicos de Conhecimento.

Estrutura:

Concurso
↓
Disciplina
↓
Assunto
↓
Subassunto
↓
Conceito

Cada item torna-se um nó dentro do grafo de conhecimento.

---

5. FLUXO PRINCIPAL DA PLATAFORMA

Edital
↓
Knowledge Graph
↓
Workspace
↓
Cronograma
↓
Sessões de Estudo
↓
Flashcards
↓
Questões
↓
Revisões
↓
Índice Cortex
↓
Radar de Aprovação

---

6. ONBOARDING

Tela 1

Boas-vindas

Mensagem:

"Transforme seu edital em um plano de aprovação."

Botão:

Começar

---

Tela 2

Login Google

OAuth

Dados:

- Nome
- E-mail
- Foto

---

Tela 3

Objetivo

Campos:

- Concurso
- Cargo
- Banca

Exemplo:

PCDF
Agente
Cebraspe

---

Tela 4

Upload do Edital

Formatos:

- PDF

Opções:

- Enviar agora
- Enviar depois

---

Tela 5

Data da Prova

Opções:

- Possuo data
- Não possuo data

Caso não possua:

- Plano 30 dias
- Plano 60 dias
- Plano 90 dias
- Plano contínuo

---

Tela 6

Mapeamento da Rotina

Perguntas:

- Trabalha?
- Horário de trabalho?
- Tempo de deslocamento?
- Possui filhos?
- Outras atividades?
- Horário de maior energia?
- Dias livres?

Objetivo:

Entender a disponibilidade real.

---

Tela 7

Plano Inicial

A IA gera:

- Cronograma
- Matérias prioritárias
- Revisões iniciais

---

7. KNOWLEDGE GRAPH ENGINE

Objetivo

Transformar o edital em uma estrutura viva de conhecimento.

---

Exemplo

PCDF
└── Direito Constitucional
└── Direitos Fundamentais
└── Artigo 5º

---

Cada Nó Possui

- Anotações
- Flashcards
- Questões
- Revisões
- Estatísticas
- Mapas Mentais

---

Tipos de Nós

- Concurso
- Disciplina
- Assunto
- Subassunto
- Conceito

---

8. WORKSPACE ENGINE

Conceito

O Workspace será a principal tela de uso da Cortex.

---

Estrutura

Cabeçalho:

- Nome do tópico
- Domínio
- Retenção
- Revisão futura

---

Área Principal

Editor avançado de anotações.

Recursos:

- Markdown
- Tabelas
- Destaques
- Código
- Imagens
- Links

---

Painel Lateral

- Flashcards
- Questões
- Mapa Mental
- Revisões
- Histórico

---

Inteligência

Ao criar uma anotação:

A Cortex sugere:

- Flashcards
- Questões
- Revisões
- Ligações com outros tópicos

---

9. SISTEMA DE ANOTAÇÕES

Estrutura Automática

Após importar o edital:

A Cortex cria:

Disciplina
↓
Assunto
↓
Subassunto

Cada item recebe:

- Pasta virtual
- Documento de anotações

---

Organização

Tudo pode ser reorganizado pelo usuário.

O Knowledge Graph acompanha as alterações.

---

Conexão Inteligente

Uma anotação alimenta:

- Flashcards
- Questões
- Mapas Mentais
- Revisões

---

10. PLANNING ENGINE

Entrada

- Edital
- Data da prova
- Rotina

---

Saída

- Cronograma diário
- Cronograma semanal
- Cronograma mensal

---

Replanejamento

Executado semanalmente.

Analisa:

- Horas realizadas
- Horas previstas
- Evolução

---

11. FLASHCARD ENGINE

Objetivo

Gerar flashcards automaticamente.

---

Fontes

- Anotações
- PDFs
- Vídeos
- Resumos

---

Níveis

- Fácil
- Médio
- Difícil

---

12. QUESTION ENGINE

Objetivo

Gerar questões personalizadas.

---

Modos

- Múltipla escolha
- Certo ou errado
- Estudo de caso

---

Perfis de Banca

- Cebraspe
- FGV
- FCC
- VUNESP
- AOCP
- IBFC
- Quadrix
- IADES

---

13. REVISION ENGINE

Primeira Versão

- 1 dia
- 7 dias
- 15 dias
- 30 dias
- 60 dias

---

Futuro

Revisões adaptativas baseadas na retenção.

---

14. PERFIL COGNITIVO

Objetivo

Descobrir:

- Melhor horário para estudar
- Tempo ideal de sessão
- Disciplinas mais difíceis
- Taxa de retenção
- Formato de aprendizagem mais eficiente

---

Dados Utilizados

- Horários
- Acertos
- Revisões
- Tempo estudado
- Frequência

---

15. ÍNDICE CORTEX™

Componentes

Consistência
25%

Execução
25%

Retenção
25%

Domínio
25%

---

Escala

0 a 100

---

16. RADAR DE APROVAÇÃO™

Objetivo

Exibir:

- Pontos fortes
- Pontos fracos
- Risco de esquecimento
- Probabilidade de desempenho

Por:

- Concurso
- Disciplina
- Assunto

---

17. ARQUITETURA DE IA

Filosofia

IA apenas onde gera valor.

---

IA Local

Responsável por:

- Classificação
- Organização
- Estatísticas
- Rastreamento de estudo
- Revisões

Meta:

80% das operações.

---

IA em Nuvem

Responsável por:

- Cronogramas
- Questões
- Flashcards avançados
- Tutor
- Perfil Cognitivo

Meta:

20% das operações.

---

18. MODELO DE NEGÓCIO

Trial:

7 dias

---

Plano Premium:

Assinatura mensal

Faixa inicial:

R$19,90 a R$39,90

---

19. ROADMAP MVP

Sprint 1

- Login Google
- Upload de edital

Sprint 2

- Edital Engine
- Knowledge Graph

Sprint 3

- Workspace
- Anotações

Sprint 4

- Planning Engine

Sprint 5

- Flashcards

Sprint 6

- Revisões

Sprint 7

- Questões

Sprint 8

- Índice Cortex

Sprint 9

- Radar de Aprovação

---

Fim do PRD v1.0

CORTEX

Software Architecture Document (SAD)

Versão 1.0

---

1. VISÃO GERAL DA ARQUITETURA

A Cortex será composta por cinco camadas principais:

1. Extensão do Navegador
2. API Backend
3. Banco de Dados
4. Motor de Inteligência Cortex
5. Infraestrutura de IA

---

2. ARQUITETURA GERAL

Usuário
↓
Extensão Cortex
↓
API Gateway
↓
Serviços Cortex
↓
Banco de Dados
↓
Motor de IA
↓
Sistema de Cache

---

3. FRONTEND

Tecnologia

- React
- TypeScript
- Vite
- TailwindCSS
- Zustand
- React Query

---

Compatibilidade

- Chrome
- Edge
- Brave
- Opera

---

Manifest

Manifest V3

---

4. ESTRUTURA DA EXTENSÃO

src/

background/

content/

popup/

dashboard/

components/

services/

hooks/

store/

utils/

---

5. MÓDULOS DA EXTENSÃO

Popup

Funções:

- Iniciar estudo
- Visualizar próximas tarefas
- Acessar Workspace

---

Dashboard

Funções:

- Cronograma
- Anotações
- Questões
- Flashcards
- Estatísticas

---

Content Script

Responsável por:

- Detectar páginas de estudo
- Detectar PDFs
- Detectar YouTube
- Capturar sessões

---

Background Service

Responsável por:

- Sincronização
- Alarmes
- Revisões
- Notificações

---

6. BACKEND

Tecnologia

NestJS

Arquitetura:

Clean Architecture

DDD (Domain Driven Design)

---

Estrutura

modules/

users/

contests/

knowledge/

notes/

flashcards/

questions/

revisions/

analytics/

cortex/

---

7. BANCO DE DADOS

Principal

PostgreSQL

---

Cache

Redis

---

Busca

OpenSearch (futuro)

---

8. MODELAGEM PRINCIPAL

USERS

id

name

email

avatar

created_at

updated_at

---

CONTESTS

id

user_id

name

board

exam_date

status

---

SUBJECTS

id

contest_id

name

weight

priority

---

TOPICS

id

subject_id

parent_id

name

difficulty

mastery

retention

---

NOTES

id

topic_id

content

created_at

updated_at

---

FLASHCARDS

id

topic_id

question

answer

difficulty

---

QUESTIONS

id

topic_id

statement

answer

board_profile

difficulty

---

REVISIONS

id

topic_id

scheduled_date

completed

score

---

9. KNOWLEDGE GRAPH

Conceito

Todo edital será transformado em um grafo.

---

Exemplo:

PCDF

↓

Direito Constitucional

↓

Direitos Fundamentais

↓

Artigo 5º

↓

Liberdade de Expressão

---

Estrutura

Node

id

name

type

parent_id

mastery

retention

---

Relacionamentos

Node

↓

Flashcards

↓

Questões

↓

Anotações

↓

Revisões

---

10. EVENTOS DA PLATAFORMA

Arquitetura orientada a eventos.

---

Exemplo

USER_STUDY_STARTED

↓

Tracking Engine

---

USER_NOTE_CREATED

↓

Flashcard Engine

↓

Question Engine

↓

Mindmap Engine

---

REVISION_COMPLETED

↓

Intelligence Engine

↓

Index Engine

---

11. PLANNING ENGINE

Entrada:

- Edital
- Rotina
- Data

Saída:

- Cronograma

---

Funções:

calculatePriority()

buildSchedule()

rebalanceSchedule()

predictCompletion()

---

12. TRACKING ENGINE

Responsável por detectar estudo.

---

Detecta:

- YouTube
- PDFs
- Sites

---

Métricas

study_time

idle_time

focus_score

switch_tabs

---

13. NOTE ENGINE

Responsável por:

- Editor
- Organização
- Versionamento

---

Recursos

Markdown

Rich Text

Tags

Links

---

14. FLASHCARD ENGINE

Pipeline

Anotação

↓

Extração de Conceitos

↓

Classificação

↓

Flashcards

---

Métodos

generate()

review()

rate()

archive()

---

15. QUESTION ENGINE

Responsável por:

- Questões IA
- Simulados
- Avaliações

---

Métodos

generateQuestion()

generateExam()

evaluate()

---

16. REVISION ENGINE

Modelo Inicial

1 dia

7 dias

15 dias

30 dias

60 dias

---

Métodos

schedule()

reschedule()

score()

---

17. MINDMAP ENGINE

Objetivo

Gerar mapas mentais automaticamente.

---

Fontes

- Anotações
- Flashcards
- Grafo

---

Formato

Tree Structure

JSON

SVG

---

18. PROFILE ENGINE

Responsável por descobrir:

- Melhor horário
- Melhor duração
- Melhor sequência

---

Entrada

Histórico

Questões

Revisões

---

Saída

Perfil Cognitivo

---

19. CORTEX INDEX ENGINE

Componentes

Consistência

Execução

Retenção

Domínio

---

Resultado

0 a 100

---

Atualização

Tempo real

---

20. RADAR ENGINE

Responsável por:

- Probabilidade de desempenho
- Risco de esquecimento
- Alertas

---

Exemplo

Português

Risco Médio

Domínio Alto

---

21. IA LOCAL

Objetivo

Executar tarefas sem consumir tokens.

---

Responsabilidades

Classificação

Tags

Organização

Estatísticas

Tracking

Revisões

---

Tecnologias

Transformers.js

ONNX Runtime

WebGPU

---

22. IA REMOTA

Objetivo

Tarefas complexas.

---

Responsabilidades

Cronogramas

Questões

Flashcards avançados

Tutor

Perfil Cognitivo

---

23. CACHE

Redis

---

Itens Cacheados

Editais

Perfis de bancas

Questões

Flashcards

Mapas mentais

---

24. AUTENTICAÇÃO

Google OAuth

JWT

Refresh Token

---

25. PAGAMENTOS

Stripe

Mercado Pago

---

Planos

Trial

Premium

---

26. OBSERVABILIDADE

Logs

Métricas

Tracing

Alertas

---

Ferramentas

Sentry

Grafana

Prometheus

---

27. ROADMAP TÉCNICO

MVP

- Login
- Edital
- Knowledge Graph
- Workspace

V1

- Flashcards
- Revisões
- Questões

V2

- Perfil Cognitivo
- Índice Cortex

V3

- Radar de Aprovação
- IA Adaptativa

---

Fim do SAD v1.0

CORTEX

Cortex Intelligence Engine Specification (CIES)

Versão 1.0

---

1. OBJETIVO

A Cortex não deve apenas organizar estudos.

A Cortex deve compreender:

- Como o usuário aprende.
- Quando aprende melhor.
- O que aprende melhor.
- O que esquece mais rápido.
- O que precisa ser revisado.
- O que está próximo do domínio.

---

2. FILOSOFIA

A Cortex é baseada em um princípio:

Horas estudadas não significam aprendizado.

O objetivo da plataforma é medir aprendizado real.

---

3. ARQUITETURA DA INTELIGÊNCIA

Fontes de Dados

↓

Knowledge Graph

↓

Profile Engine

↓

Intelligence Engine

↓

Recommendations Engine

↓

Radar Engine

---

4. FONTES DE DADOS

A Cortex coleta:

Dados de Rotina

- Horário de trabalho
- Tempo livre
- Dias disponíveis
- Horários preferidos

---

Dados de Estudo

- Horas estudadas
- Sessões concluídas
- Tempo por disciplina
- Frequência

---

Dados de Retenção

- Revisões
- Acertos
- Erros

---

Dados de Domínio

- Questões
- Simulados
- Flashcards

---

5. PERFIL COGNITIVO

Objetivo:

Descobrir o melhor setup de aprendizagem.

---

6. DIMENSÕES ANALISADAS

Horário Ideal

Mede:

- Acertos por horário
- Retenção por horário

Exemplo:

06h às 09h → 87%

19h às 22h → 61%

Resultado:

Melhor horário:

Manhã

---

Tempo Ideal de Sessão

Mede:

- Produtividade
- Retenção

Exemplo:

30 min → 72%

60 min → 91%

120 min → 68%

Resultado:

Sessão ideal:

60 minutos

---

Sequência Ideal

Exemplo:

Português
↓
Direito
↓
Informática

Resultado:

Maior retenção.

---

7. PERFIL DE APRENDIZAGEM

A Cortex calcula:

Aprendiz Visual

Maior desempenho com:

- Mapas mentais
- Diagramas

---

Aprendiz Textual

Maior desempenho com:

- Leitura
- Resumos

---

Aprendiz Prático

Maior desempenho com:

- Questões
- Exercícios

---

Perfil Híbrido

Combina múltiplos formatos.

---

8. PERFIL DE DIFICULDADE

Cada disciplina recebe:

Fácil

Média

Difícil

Crítica

---

Exemplo:

Português → Fácil

Raciocínio Lógico → Crítica

---

9. ÍNDICE CORTEX™

Objetivo:

Medir evolução real.

---

Componentes

Consistência

Peso:

25%

Mede:

- Dias estudados
- Frequência

---

Execução

Peso:

25%

Mede:

- Cronograma cumprido

---

Retenção

Peso:

25%

Mede:

- Resultado das revisões

---

Domínio

Peso:

25%

Mede:

- Questões
- Simulados

---

Fórmula Inicial

Indice Cortex

=

(Consistência × 0.25)

+ 

(Execução × 0.25)

+ 

(Retenção × 0.25)

+ 

(Domínio × 0.25)

---

Escala

0 a 100

---

10. ÍNDICES SECUNDÁRIOS

Índice por Concurso

Exemplo:

PCDF

83

---

Índice por Disciplina

Português

72

---

Índice por Assunto

Crase

58

---

11. MEMORY DECAY ENGINE

Objetivo:

Calcular risco de esquecimento.

---

Modelo inicial

24h

7d

15d

30d

60d

---

Modelo futuro

Baseado em desempenho individual.

---

12. RETENTION SCORE

Mede:

Capacidade de lembrar.

---

Exemplo

Revisões realizadas

8

Acertos

7

Retention Score

87%

---

13. MASTERY SCORE

Mede:

Domínio do conteúdo.

---

Fontes

Questões

Simulados

Flashcards

---

Escala

0 a 100

---

14. FOCUS SCORE

Calculado por:

Tempo ativo

↓

Tempo ocioso

↓

Trocas de abas

↓

Interrupções

---

Resultado

0 a 100

---

15. FATIGUE DETECTION

Objetivo

Detectar queda de desempenho.

---

Sinais

- Erros aumentam
- Tempo aumenta
- Retenção cai

---

Ação

Sugere:

- Pausa
- Mudança de matéria

---

16. RECOMMENDATIONS ENGINE

Responsável por gerar recomendações.

---

Exemplo

Você está esquecendo:

Direito Administrativo

---

Sugestão

10 Questões

+ 

5 Flashcards

+ 

1 Revisão

---

17. PRIORITY ENGINE

Calcula prioridade.

---

Fatores

- Peso no edital
- Dificuldade
- Retenção
- Data da prova

---

Resultado

Prioridade

Baixa

Média

Alta

Crítica

---

18. RADAR DE APROVAÇÃO™

Objetivo

Estimar preparação atual.

---

Entradas

Índice Cortex

Retenção

Domínio

Execução

Tempo restante

---

Saídas

Preparação Alta

Preparação Média

Preparação Baixa

---

19. MOTOR ADAPTATIVO

A Cortex aprende continuamente.

---

Semana 1

Cronograma Inicial

↓

Semana 2

Ajustes

↓

Semana 3

Novo Perfil

↓

Semana 4

Cronograma Otimizado

---

20. EVOLUÇÃO FUTURA

Versão 2

Machine Learning próprio

---

Versão 3

Perfil Cognitivo avançado

---

Versão 4

Predição de desempenho por banca

---

Versão 5

Cortex AI Engine Proprietária

Capaz de:

- Planejar
- Adaptar
- Avaliar
- Recomendar

Sem depender integralmente de LLMs externos.

---

PRINCÍPIO FINAL

A Cortex não mede tempo.

A Cortex mede aprendizagem.

Toda decisão da plataforma deve ser tomada com base no aumento da probabilidade de aprovação do usuário.

---

Fim do CIES v1.0

CORTEX

User Experience Specification (UXS)

Versão 1.0

---

1. FILOSOFIA DE UX

Princípio Fundamental

O usuário nunca deve precisar decidir:

- Onde salvar
- Onde organizar
- Onde revisar
- Onde criar flashcards

A Cortex faz isso automaticamente.

---

Regra Principal

O usuário deve pensar apenas em estudar.

A Cortex pensa em todo o resto.

---

2. JORNADA DO USUÁRIO

Primeira Experiência

Usuário instala a extensão.

↓

Login Google.

↓

Importa edital.

↓

Responde perguntas sobre rotina.

↓

Recebe plano inicial.

↓

Começa a estudar.

---

Tempo de Ativação

Meta:

Menos de 5 minutos.

---

3. ESTRUTURA DE NAVEGAÇÃO

Menu Principal

Dashboard

Cronograma

Workspace

Revisões

Radar

Perfil

Configurações

---

4. DASHBOARD

Objetivo:

Mostrar exatamente o que fazer hoje.

---

Layout

┌─────────────────────────┐

Hoje

└─────────────────────────┘

Próxima Sessão

↓

Direito Constitucional

↓

Direitos Fundamentais

---

Indicadores

Índice Cortex

Radar de Aprovação

Horas da Semana

Sessões Concluídas

---

Blocos

Próximas Revisões

Próximas Questões

Próximos Simulados

---

5. CRONOGRAMA

Objetivo:

Executar.

Não planejar.

---

Tela

Hoje

09:00

Português

Crase

60 min

[Iniciar]

---

Ao clicar:

Workspace abre automaticamente.

---

6. WORKSPACE

Tela mais importante do sistema.

---

Estrutura

Cabeçalho

↓

Editor

↓

Painel Inteligente

---

Cabeçalho

Disciplina

Assunto

Subassunto

---

Indicadores

Domínio

Retenção

Próxima Revisão

---

Editor Principal

Modelo híbrido

Notion

+ 

Obsidian

---

Recursos

Títulos

Tabelas

Callouts

Código

Checklist

Imagens

Links

PDF Embutido

Vídeos Embutidos

---

Painel Direito

Flashcards

Questões

Mapa Mental

Revisões

Conexões

---

7. EXPERIÊNCIA DE ESTUDO

Usuário abre:

Direitos Fundamentais

---

Ao estudar

A Cortex monitora:

Tempo

Foco

Atividade

---

Sem interrupções.

---

Ao encerrar

Resumo rápido

"O quanto você domina este conteúdo?"

Escala

1 a 5

---

8. SISTEMA DE ANOTAÇÕES

Objetivo:

Zero organização manual.

---

Quando o edital é importado

A Cortex cria automaticamente:

Direito Constitucional

↓

Direitos Fundamentais

↓

Artigo 5°

↓

Documento de notas

---

Regra

Toda anotação nasce vinculada a um tópico.

---

9. FLASHCARDS

Nunca começam vazios.

---

Ao criar notas

A Cortex sugere:

"3 flashcards encontrados"

---

Botão

Adicionar

---

Fluxo

Nota

↓

Flashcard

↓

Revisão

↓

Métrica

---

10. MAPA MENTAL

Objetivo

Visualizar conhecimento.

---

Não é um documento.

É uma visualização do grafo.

---

Exemplo

Direitos Fundamentais

├── Direitos Individuais

├── Direitos Coletivos

├── Nacionalidade

└── Direitos Políticos

---

Atualiza automaticamente.

---

11. QUESTÕES

Sempre ligadas ao tópico atual.

---

Exemplo

Usuário estudando:

Crase

---

Painel:

10 Questões disponíveis

---

Botão

Resolver Agora

---

12. REVISÕES

Painel próprio.

---

Hoje

5 Revisões Pendentes

---

Abrir

↓

Executar

↓

Pontuar

↓

Atualizar retenção

---

13. RADAR DE APROVAÇÃO

Tela Premium.

---

Objetivo

Mostrar riscos.

---

Exemplo

Português

Preparação Alta

---

Informática

Preparação Média

---

Raciocínio Lógico

Preparação Baixa

---

14. PERFIL COGNITIVO

Descobertas da Cortex

---

Seu melhor horário

06h às 09h

---

Tempo ideal

60 min

---

Formato ideal

Questões + Flashcards

---

15. EXPERIÊNCIA NO YOUTUBE

Ao detectar vídeo educacional

Pequeno botão flutuante.

---

"Cortex detectou uma sessão de estudo"

---

Opções

Iniciar Sessão

Ignorar

---

Durante o vídeo

Ferramentas rápidas

Anotar

Salvar Trecho

Criar Flashcard

---

16. EXPERIÊNCIA EM PDF

Botão lateral.

---

Funções

Anotar

Destacar

Salvar trecho

Criar flashcard

---

Tudo vinculado ao tópico.

---

17. EXPERIÊNCIA MOBILE

Objetivo

Revisão.

Não produção.

---

Funções

Flashcards

Questões

Revisões

Radar

---

18. SISTEMA DE NOTIFICAÇÕES

Inteligente.

---

Nunca invasivo.

---

Exemplos

Você esqueceu Direito Administrativo.

---

Hoje existem 3 revisões pendentes.

---

Seu índice Cortex caiu 5%.

---

19. GAMIFICAÇÃO

Leve.

---

Sequência de estudos.

---

Meta semanal.

---

Conquistas.

---

Nunca infantil.

---

20. PRINCÍPIOS FINAIS

A Cortex deve parecer:

- Inteligente
- Organizada
- Automática

---

O usuário não gerencia conteúdos.

O usuário aprende.

A Cortex gerencia o conhecimento.

---

Fim do UXS v1.0

CORTEX

Knowledge Graph Specification (KGS)

Versão 1.0

---

1. OBJETIVO

O Knowledge Graph é o núcleo estrutural da Cortex.

Ele representa todo o conhecimento do usuário em formato de grafo.

Não armazenamos apenas arquivos.

Armazenamos relações entre conhecimentos.

---

2. PRINCÍPIO FUNDAMENTAL

Na Cortex:

Tudo é um nó.

---

Exemplo

PCDF
 ├── Português
 │    ├── Crase
 │    ├── Concordância
 │    └── Regência
 │
 ├── Direito Constitucional
 │    ├── Direitos Fundamentais
 │    ├── Organização do Estado
 │    └── Administração Pública
 │
 └── Informática

---

Cada item torna-se um nó do grafo.

---

3. ESTRUTURA DOS NÓS

Concurso

{
  "id": "",
  "type": "contest",
  "name": "PCDF"
}

---

Disciplina

{
  "id": "",
  "type": "subject",
  "name": "Direito Constitucional"
}

---

Assunto

{
  "id": "",
  "type": "topic",
  "name": "Direitos Fundamentais"
}

---

Subassunto

{
  "id": "",
  "type": "subtopic",
  "name": "Artigo 5º"
}

---

Conceito

{
  "id": "",
  "type": "concept",
  "name": "Liberdade de Expressão"
}

---

4. RELACIONAMENTOS

Parent

Direito Constitucional
↓
Direitos Fundamentais

---

Depends On

Concordância Verbal
↓
Depende de
↓
Classes Gramaticais

---

Related To

Controle de Constitucionalidade
↓
Relacionado
↓
Poder Judiciário

---

Reinforces

Questão
↓
Reforça
↓
Conceito

---

5. ENTIDADES VINCULADAS

Cada nó pode possuir:

---

Anotações

Node
↓
Notes

---

Flashcards

Node
↓
Flashcards

---

Questões

Node
↓
Questions

---

Mapas Mentais

Node
↓
Mindmaps

---

Revisões

Node
↓
Revisions

---

6. CRIAÇÃO AUTOMÁTICA

Quando o edital é importado:

---

Edital Engine

↓

Knowledge Graph Builder

↓

Criação da árvore

---

Exemplo

Português
 ├── Crase
 ├── Regência
 ├── Concordância

---

Cada tópico recebe automaticamente:

- Documento
- Flashcards
- Questões
- Estatísticas

---

7. KNOWLEDGE GRAPH BUILDER

Responsável por:

---

Extrair tópicos

---

Normalizar nomes

---

Remover duplicidades

---

Criar relacionamentos

---

8. KNOWLEDGE SCORING

Todo nó possui métricas.

---

Mastery Score

0-100

Domínio.

---

Retention Score

0-100

Memorização.

---

Difficulty Score

0-100

Dificuldade percebida.

---

Priority Score

0-100

Prioridade atual.

---

9. KNOWLEDGE HEALTH

Indicador geral do nó.

---

Exemplo

Crase

Domínio 82

Retenção 55

Saúde 68

---

10. LACUNAS DE CONHECIMENTO

Objetivo:

Descobrir buracos no aprendizado.

---

Exemplo

Classes Gramaticais
  ↓
Concordância

---

Usuário domina Concordância.

---

Usuário não domina Classes Gramaticais.

---

A Cortex detecta inconsistência.

---

Gera alerta.

---

11. KNOWLEDGE CONNECTIONS

Função:

Encontrar conexões ocultas.

---

Exemplo

Atos Administrativos
↓
Poderes Administrativos

---

Sugestão automática:

"Estude estes tópicos juntos."

---

12. EVOLUÇÃO DO GRAFO

O grafo nunca é estático.

---

Cada ação altera pesos.

---

Exemplo

Questão acertada.

↓

Domínio aumenta.

---

Revisão esquecida.

↓

Retenção diminui.

---

13. KNOWLEDGE TIMELINE

Cada nó possui histórico.

---

Exemplo

10/01

Domínio 20

15/02

Domínio 45

20/03

Domínio 72

---

14. KNOWLEDGE VISUALIZER

Representação gráfica.

---

Modo Árvore

Português
 ├── Crase
 ├── Regência
 └── Concordância

---

Modo Grafo

○──○──○
│  ╲ │
○──○──○

---

15. KNOWLEDGE INSIGHTS

A Cortex gera insights.

---

Exemplo

Você estudou muito.

Mas não consolidou.

---

Ou

Você revisa bem.

Mas pratica poucas questões.

---

16. KNOWLEDGE ENGINE API

Principais métodos.

---

CreateNode()

---

LinkNode()

---

UpdateMastery()

---

UpdateRetention()

---

FindWeakNodes()

---

GenerateInsights()

---

17. FUTURO

Versão 2

Detecção automática de conceitos.

---

Versão 3

Conexões entre disciplinas.

---

Versão 4

Predição de esquecimento.

---

Versão 5

Knowledge Graph Neural Engine.

---

PRINCÍPIO FINAL

A Cortex não organiza documentos.

A Cortex organiza conhecimento.

Todo o sistema deve operar sobre o grafo de conhecimento.

---

Fim do KGS v1.0

CORTEX
Board Profile System (BPS)
Versão 1.0
1. OBJETIVO
Criar uma base de conhecimento especializada em bancas de concursos.
Essa base será utilizada por:
Planning Engine
Question Engine
Radar de Aprovação
Intelligence Engine
Perfil Cognitivo
2. FILOSOFIA
O candidato não estuda apenas conteúdos.
O candidato estuda:

Conteúdo
+
Banca
+
Cargo
+
Concorrência
A Cortex precisa modelar esses fatores.
3. ESTRUTURA DA BANCA
Cada banca possui um perfil próprio.
Exemplo:
JSON
{
  "name": "FGV",
  "difficulty": 82,
  "question_style": "contextual",
  "text_length": "long",
  "trap_level": 85
}
4. PERFIL DE BANCA
Campos principais:

Nome

Dificuldade

Tamanho médio dos enunciados

Estilo de cobrança

Taxa de contextualização

Taxa de literalidade

Nível de pegadinhas

Histórico
5. BANCAS INICIAIS
Cebraspe
Características:
Certo ou Errado
Alto nível interpretativo
Penalização por erro
Pouca decoreba
Muito raciocínio
Perfil Cortex:
JSON
{
  "difficulty": 90,
  "contextualization": 80,
  "literality": 30,
  "trap_level": 95,
  "question_type": "certo_ou_errado"
}
FGV
Características:
Textos longos
Casos práticos
Interpretação profunda
Questões contextualizadas
Perfil Cortex:
JSON
{
  "difficulty": 85,
  "contextualization": 95,
  "literality": 25,
  "trap_level": 85,
  "question_type": "multipla_escolha"
}
FCC
Características:
Teórica
Literalidade moderada
Cobrança tradicional
Perfil Cortex:
JSON
{
  "difficulty": 70,
  "contextualization": 55,
  "literality": 70,
  "trap_level": 65,
  "question_type": "multipla_escolha"
}
VUNESP
Características:
Equilibrada
Média dificuldade
Bastante utilizada em concursos estaduais
Perfil Cortex:
JSON
{
  "difficulty": 65,
  "contextualization": 60,
  "literality": 60,
  "trap_level": 55,
  "question_type": "multipla_escolha"
}
AOCP
Características:
Objetiva
Questões médias
Crescente participação em concursos
Perfil Cortex:
JSON
{
  "difficulty": 60,
  "contextualization": 50,
  "literality": 70,
  "trap_level": 50,
  "question_type": "multipla_escolha"
}
IBFC
Características:
Cobrança direta
Menor contextualização
Perfil Cortex:
JSON
{
  "difficulty": 55,
  "contextualization": 40,
  "literality": 80,
  "trap_level": 45,
  "question_type": "multipla_escolha"
}
IADES
Características:
Forte presença no DF
Questões objetivas
Perfil Cortex:
JSON
{
  "difficulty": 60,
  "contextualization": 50,
  "literality": 75,
  "trap_level": 50,
  "question_type": "multipla_escolha"
}
Quadrix
Características:
Conselhos profissionais
Questões interpretativas
Perfil Cortex:
JSON
{
  "difficulty": 70,
  "contextualization": 75,
  "literality": 55,
  "trap_level": 70,
  "question_type": "multipla_escolha"
}
6. PERFIL DE DISCIPLINA POR BANCA
Nem todas as bancas cobram a mesma matéria da mesma forma.
Português
FGV
Foco:
Interpretação textual
Reescrita de frases
Semântica
Inferência
Cebraspe
Foco:
Interpretação
Coesão
Coerência
Julgamento de assertivas
FCC
Foco:
Gramática
Norma culta
Regência
Concordância
Direito Constitucional
Cebraspe
Casos práticos
Interpretação constitucional
Jurisprudência
FCC
Texto constitucional
Doutrina
Conceitos clássicos
FGV
Aplicação prática
Questões contextualizadas
7. PERFIL DE ASSUNTO
Cada tópico recebe uma frequência histórica.
Exemplo:
JSON
{
  "subject": "Crase",
  "board": "FGV",
  "frequency": 74
}
Outro exemplo:
JSON
{
  "subject": "Direitos Fundamentais",
  "board": "Cebraspe",
  "frequency": 92
}
8. BOARD SCORE
Pontuação da relevância do assunto.
Fatores:
Frequência histórica
Peso no edital
Recorrência recente
Dificuldade da banca
Resultado:

Baixa
Média
Alta
Crítica
9. BOARD PRIORITY ENGINE
Responsável por priorizar conteúdos.
Exemplo:

Direito Administrativo

Peso edital: Alto
Frequência FGV: Alta
Domínio usuário: Baixo

Prioridade: Crítica
10. QUESTION STYLE ENGINE
A Question Engine consulta o perfil da banca.
Exemplo:
FGV

Enunciado longo
↓
Contextualização
↓
Caso prático
↓
Alternativas próximas
Cebraspe

Afirmação
↓
Análise
↓
Certo ou Errado
FCC

Teoria
↓
Aplicação direta
↓
Múltipla escolha
11. BOARD INSIGHTS
Exemplos de insights gerados pela Cortex:

A FGV cobra mais interpretação do que memorização.

A Cebraspe penaliza erros.
Evite chutes.

A FCC costuma cobrar literalidade em Direito Administrativo.

A VUNESP costuma equilibrar teoria e prática.
12. PERFIL DE DESEMPENHO POR BANCA
A Cortex acompanha o desempenho do usuário por banca.
Exemplo:

FGV

Português: 68%
Direito Constitucional: 74%
Informática: 52%
Outro exemplo:

Cebraspe

Português: 81%
Direito Penal: 72%
Raciocínio Lógico: 49%
13. RADAR POR BANCA
Exemplo:

FGV

Preparação Geral: 76%

Pontos Fortes:
- Português
- Constitucional

Pontos Fracos:
- Informática
- Raciocínio Lógico

Risco Geral:
Médio
14. BOARD TRAINING MODE
Modo especial de treinamento.
O usuário estuda exclusivamente no estilo da banca.
Tudo é adaptado:
Questões
Simulados
Flashcards
Revisões
Cronograma
Exemplo:
Modo FGV

Mais interpretação
Mais casos práticos
Menos memorização pura
Exemplo:
Modo Cebraspe

Mais assertivas
Mais análise
Menos alternativas
15. BOARD DATABASE
Estrutura de banco:

Boards

BoardSubjects

BoardTopics

BoardPatterns

BoardStatistics

BoardInsights

BoardPredictions
16. IA DE PERFIL DE BANCA
Responsável por:
Identificar mudanças recentes
Detectar padrões
Atualizar estatísticas
Encontrar tendências
Funções:
TypeScript
analyzeBoard()

updateBoardProfile()

detectPattern()

generateInsight()

predictTopicRelevance()
17. EVOLUÇÃO FUTURA
Versão 2
Análise automática de provas.
Versão 3
Predição de cobrança.
Versão 4
Treinamento adaptativo por banca.
Versão 5
Board Intelligence Engine.
Capaz de prever:

Assuntos com maior probabilidade de cobrança.

Mudanças no perfil da banca.

Estratégias ideais para cada concurso.
PRINCÍPIO FINAL
O usuário não estuda apenas para um concurso.
Ele estuda para uma banca específica.
A Cortex deve ensinar o usuário a pensar como a banca cobra.
Fim do BPS v1.0
