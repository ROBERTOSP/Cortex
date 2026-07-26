# Registro de Dados Mock (Ambiente de Desenvolvimento)

Este documento lista todos os dados MOCK criados para desenvolvimento e testes locais, até a conexão real com o banco de dados.

Estrutura de Registro
- Fonte/Contexto: (ex.: Prioridades de estudo, Telemetria SRS, Editais, Questões)
- Arquivo/local: (ex.: lib/mock/..., data/mock_....json)
- Campos principais: (ex.: topic_id, materia, retention_r, score)
- Observações: (ex.: como substituir por dados reais; endpoint/API que consumirá)

Itens Mock Planejados
- Dashboard: prioridades de estudo (Top 10) para o usuário id=1.
- Telemetria SRS: valores de retenção R(t) e estabilidade S por tópico.
- Editais e Árvore de Matérias: estrutura simplificada para UI.
- Sessão Deep Work: métricas simuladas (duração, foco, hesitação).

Política
- Todo mock deve ser removível por flag/ambiente.
- Quando houver dados reais, preencher este documento com o status “substituído” e referência da fonte real.

## Itens Mock Criados

- Fonte/Contexto: Prioridades de Estudo (Dashboard)
  - Arquivo/local: [study_priorities_mock.dart](file:///e:/Cortex/frontend_flutter/lib/mock/study_priorities_mock.dart)
  - Campos principais: topic_id, materia, topico, score, retention_r, priority_level, is_theory_done
  - Observações: Consumido via provider [study_provider.dart](file:///e:/Cortex/frontend_flutter/lib/providers/study_provider.dart) como fallback quando API indisponível.

- Fonte/Contexto: Telemetria SRS
  - Arquivo/local: [mock_telemetry.json](file:///e:/Cortex/data/mock_telemetry.json)
  - Campos principais: topic_id, estabilidade_s, last_review_date
  - Observações: Usado para testes de cálculo de R(t) e priorização.

- Fonte/Contexto: Edital/Árvore de Matérias
  - Arquivo/local: [mock_edital_tree.json](file:///e:/Cortex/data/mock_edital_tree.json)
  - Campos principais: banca, cargo, ano, disciplinas[topicos]
  - Observações: Alimenta UI de estrutura de matérias sem depender do parser real.

- Fonte/Contexto: Sessões de Estudo (Deep Work)
  - Arquivo/local: [mock_sessions.json](file:///e:/Cortex/data/mock_sessions.json)
  - Campos principais: usuario_id, topico_id, data_fim, duracao_segundos, tipo_sessao, nivel_foco
  - Observações: Valida telas de métricas e histórico de sessões.
