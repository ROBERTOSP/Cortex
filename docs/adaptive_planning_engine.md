# Adaptive Planning Engine

## Objetivo

Gerar um cronograma semanal adaptativo para o aluno com base em:

- perfil de estudo
- historico recente de tentativas
- sinais de hesitacao
- carga diaria disponivel

## Endpoint

`POST /planning/schedule`

## Perfil considerado

- `dailyStudyHours`
- `peakEnergyTime`
- `fatigueLevel`
- `works`

Quando enviado no corpo da requisicao, o perfil e salvo no usuario antes da geracao do plano.

## Sinais analisados

Para cada materia, a engine calcula:

- quantidade de tentativas
- taxa de acerto
- taxa de hesitacao
- latencia media
- dias desde a ultima tentativa

## Heuristica inicial

A prioridade da materia cresce quando ha:

- baixa taxa de acerto
- alta hesitacao
- pouco historico
- muito tempo sem contato
- latencia alta nas respostas

## Tipos de bloco

- `reading`
- `questions`
- `revision`

## Saida

A resposta inclui:

- perfil efetivo usado
- resumo da geracao
- insights por materia
- cronograma semanal com blocos diarios

## Modo inicial

Quando o aluno ainda nao possui tentativas suficientes, a engine entra em modo inicial e monta o plano com materias disponiveis no banco para comecar a calibragem.

## Limitacoes desta primeira versao

- o cronograma ainda nao persiste como entidade propria no banco
- remarcar tarefa ainda e local na interface
- o plano ainda nao usa `KnowledgeNode`, `Revision` e `StudySession`
- ainda nao existe aprendizado estatistico ou modelo preditivo

## Proxima iteracao recomendada

1. persistir agenda e conclusoes
2. registrar estudo concluido como `StudySession`
3. alimentar revisoes automaticas
4. usar `KnowledgeNode.mastery` e `retention`
5. integrar analytics reais com a engine
