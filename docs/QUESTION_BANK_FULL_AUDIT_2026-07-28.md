# Resultado da Auditoria Integral do Banco de Questões

## Escopo

- Fonte examinada: 38 arquivos `gran_2010_2026_unique_*.json`.
- Local: `Cortex Scraper/crawler/exports`.
- Total físico confirmado: **1.899.083 registros**.
- Alteração dos arquivos-fonte: nenhuma.

## Integridade e taxonomia

| Indicador | Resultado |
| --- | ---: |
| Questões válidas para normalização | 1.899.075 |
| Questões rejeitadas por validação | 8 |
| Duplicidades por `cortex_id_num` | 0 |
| Bancas canônicas candidatas | 610 |
| Disciplinas canônicas candidatas | 156 |
| Caminhos disciplina → tópico | 32.750 |
| Caminhos disciplina → tópico → subtópico | 32.763 |
| Cargos distintos de origem | 16.043 |
| Órgãos distintos de origem | 4.692 |
| Carreiras distintas de origem | 123 |

## Artefatos gerados

- `backend/reports/question-taxonomy-profile-2026-07-28T02-11-34-336Z.json`: distribuição de bancas, assuntos, cargos, órgãos e anos.
- `backend/reports/question-taxonomy-index-2026-07-28T02-13-04-286Z.json`: índice canônico de banca, disciplina, tópico e subtópico; mantém variantes textuais e proveniência por arquivo.
- `backend/reports/question-audit-2026-07-28T02-03-50-429Z.json`: relatório de integridade detalhado.

## Observação sobre o relatório de integridade

O relatório detalhado contém um erro no total serializado de `processed`/`invalid`, embora a execução, o perfil e a contagem física dos arquivos concordem em 1.899.083 registros, 1.899.075 válidos e 8 rejeitados. Esse arquivo não deve ser usado como fonte de totais até a correção do contador; os artefatos de perfil e índice são consistentes.

## Proveniência e direitos

O índice declara o conjunto como `gran_scraper_export` e `THIRD_PARTY_DATASET_PENDING_RIGHTS_REVIEW`. Isso identifica a origem operacional do dataset, não titularidade de direitos nem licença de publicação.

Os identificadores `cortex_id` e `cortex_id_num` devem ser preservados. Nomes de banca, disciplina, cargo e órgão poderão receber aliases de exibição, mas nunca substituem os valores brutos nem a trilha de proveniência.

## Próximo passo técnico

Usar o índice para criar aliases aprovados e o resolvedor edital ↔ taxonomia. A carga-piloto deverá importar somente itens com status de direitos compatível com o ambiente de teste definido, preservando fonte, lote e identificador externo.
