# Análise do Dataset de Questões (Gran)

## Objetivo

Registrar os resultados das análises de integridade do dataset e as decisões de importação para referência futura.

## Decisão de Importação (dev agora, bulk depois)

- Manter as ~1500 questões já existentes no banco para desenvolvimento e testes do produto.
- Adiar a importação completa do dataset para quando:
  - as funcionalidades principais estiverem prontas (Deep Work, sessões, respostas, métricas)
  - a API estiver validada e com endpoints estáveis
  - houver um plano de execução em lote (evitar timeouts e reduzir impacto no Supabase)

## Auditoria de Integridade (dataset `gran_2010_2026_unique`)

Relatório completo (JSON):
- [question-audit-2026-06-10T20-49-06-566Z.json](file:///e:/Cortex/Cortex%20Extensão/backend/reports/question-audit-2026-06-10T20-49-06-566Z.json)

### Totais

- Processadas: `1.899.083`
- Válidas: `1.899.075`
- Inválidas: `8`
- Únicas por `cortex_id_num`: `1.899.083`
- Duplicadas entre arquivos do dataset (por `cortex_id_num`): `0`

### Inconsistências detectadas (contagem)

- `missing_statement`: `8`
- `statement_too_short`: `49`
- `option_missing_text`: `10`
- `option_missing_letter`: `3`
- `option_duplicate_letter`: `3`
- `correct_option_count_invalid`: `2`

### Inconsistências fatais (recomendado “pular e logar” no import)

Tipo: `missing_statement` (questão sem enunciado)

- `C566202` (gran_2010_2026_unique_0001.json, index 4201)
- `C566390` (gran_2010_2026_unique_0001.json, index 4389)
- `C566391` (gran_2010_2026_unique_0001.json, index 4390)
- `C566537` (gran_2010_2026_unique_0001.json, index 4536)
- `C1013068` (gran_2010_2026_unique_0010.json, index 1067)
- `C1057707` (gran_2010_2026_unique_0010.json, index 45706)
- `C1629114` (gran_2010_2026_unique_0022.json, index 17113)
- `C1748566` (gran_2010_2026_unique_0024.json, index 36565)

## Estimativa de Armazenamento (planejamento)

### Massa em disco (exports JSON)

- Diretório: `E:\Cortex\Cortex Scraper\crawler\exports`
- Dataset auditado: `gran_2010_2026_unique_*.json` (38 arquivos)

Observação: o tamanho no Postgres tende a ser maior que o JSON bruto por conta de índices, MVCC e overhead de linhas.

### Estimativa prática para o banco

Para planejamento, considere a base final em:
- **Faixa provável**: `~8,5 GB a ~10,5 GB`
- **Planejamento seguro**: `~10 GB`

## Próximo passo quando for importar o bulk

- Tornar o importador resiliente:
  - pular registros inválidos
  - registrar um log/relatório com `cortex_id` + motivo + arquivo + índice
- Importar em lotes por arquivo (`50.000` questões por arquivo), validando a contagem no banco a cada lote.

