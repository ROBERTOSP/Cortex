# Auditoria do Núcleo do Cortex — 27/07/2026

## Conclusão

O repositório possui boa parte dos dados e blocos técnicos necessários. O principal desvio é que o planejamento atual gera uma agenda semanal transitória, enquanto a proposta exige um plano persistente até a prova e uma próxima ação diária explicável.

## Componentes reaproveitáveis

| Área | Estado atual | Direção |
| --- | --- | --- |
| Rotina e capacidade | `routine-engine` calcula janelas, compromissos, blocos e check-in. | Reaproveitar como fonte de capacidade. |
| Objetivo e data | `StudyGoal` registra objetivo, banca, cargo e data. | Reaproveitar; ligar ao plano até a prova. |
| Edital | `Contest` e `KnowledgeNode` representam o mapa extraído de catálogo/PDF. | Adicionar confirmação humana, vínculo e métricas de cobrança. |
| Banco de questões | Há banca, disciplina, tópico, subtópico, ano, dificuldade e tentativas. | Criar agregados de incidência e cobertura por nó. |
| Desempenho | `QuestionAttempt` registra acerto, latência e hesitação. | Alimentar o modelo por tópico/subtópico, não só por matéria. |
| Sessões/revisões | Schema possui `StudySession` e `Revision`. | Implementar serviços e ligar à recomendação; hoje não alimentam o planejamento. |
| Planejamento | Serviço já cruza rotina e edital ativo para gerar blocos. | Substituir agenda efêmera por plano persistido e recomendação diária. |

## Lacunas críticas

1. Não existe entidade persistida para plano, fases, tarefas/recomendações ou execução de tarefa.
2. Não existe ligação confiável entre `KnowledgeNode` do edital e a taxonomia das questões.
3. Não existe análise agregada da banca por disciplina/tópico/subtópico, cargo e recência.
4. A prioridade atual é por matéria e tentativa recente; ainda não considera edital, peso, prazo, cobertura ou incidência da banca.
5. A data da prova não orienta o planejamento atual até o fim do percurso.
6. `StudySession`, `Revision` e `DailyCheckIn` não fecham um ciclo automático de replanejamento.
7. Não existe endpoint nem tela de “próxima melhor ação” (Tela Hoje).
8. O cronograma da interface ainda é local/transitório em parte do fluxo.
9. A revisão do edital extraído pelo usuário e retificações ainda não têm fluxo definido.

## Riscos a tratar antes do beta

- Um cronograma pode parecer preciso sem ser viável até a prova; o motor deve expor risco de cobertura.
- A IA não pode ser a única autoridade para classificar edital; o usuário precisa revisar o mapa.
- Estatística de banca deve exigir quantidade mínima de questões e informar baixa confiança quando a amostra for pequena.
- A importação por link de PDF deve manter limites de tamanho, tipo e proteção contra destinos internos.

## Vertical mínima recomendada

1. Criar o modelo persistido de plano até a prova e de recomendação diária.
2. Criar o agregador de incidência da banca por tópico/subtópico.
3. Criar o resolvedor edital ↔ taxonomia de questões com revisão do usuário.
4. Criar o gerador de fases e metas até a prova usando capacidade sustentável.
5. Criar `GET /today` e o fluxo de iniciar/concluir/adiar recomendação.
6. Registrar sessão/resultado e recalcular a próxima recomendação.
7. Expor a Tela Hoje; manter cronograma como visão secundária.

## Ordem de implementação

1. Contratos e schema do plano/recomendação.
2. Dados de edital e análise da banca.
3. Motor de plano até a prova.
4. Sessões e eventos de execução.
5. Motor da próxima ação e replanejamento.
6. Tela Hoje e visão “Meu caminho até a prova”.
7. Beta fechado com dados e métricas reais.
