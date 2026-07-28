# Organização do Banco de Questões

## Objetivo

Transformar o dataset auditado de aproximadamente 1,9 milhão de questões em uma base confiável para análise de incidência por banca, cargo, disciplina, tópico e subtópico — sem comprometer o banco transacional do produto.

## Diagnóstico atual

- O dataset já possui identificadores estáveis (`cortex_id_num` e `cortex_id`) e auditoria de integridade.
- A taxonomia básica já existe: banca, disciplina, tópico e subtópico.
- Carreiras, cargos e órgãos permanecem em `rawJson`, portanto não podem ser filtrados ou agregados eficientemente.
- O importador atual processa uma questão por transação e recria suas alternativas. Esse fluxo é adequado para desenvolvimento, não para 1,8 milhão de registros.

### Amostra de perfilamento — 100.000 questões

- Válidas: 99.996; inválidas: 4.
- Bancas distintas: 285.
- Disciplinas distintas: 137.
- Tópicos distintos: 8.776; subtópicos distintos: 8.779.
- Carreiras distintas: 86; cargos: 3.211; órgãos: 915.

Conclusão: a diversidade é suficiente para diferenciar recomendações, mas os nomes de cargo e órgão vêm como objetos de origem e precisam de extração/canonicalização. A base não deve ser carregada como texto livre se precisará responder consultas analíticas do motor.

## Organização-alvo

### Taxonomia canônica

Cada questão deve estar ligada, quando houver dado, a:

- banca;
- órgão;
- carreira;
- cargo;
- disciplina;
- tópico;
- subtópico;
- prova/ano;
- dificuldade e situação (anulada/desatualizada).

O edital deve ser associado a essa mesma taxonomia por meio de uma camada de correspondência revisável. Não se deve depender exclusivamente de igualdade textual entre o nome do edital e o nome vindo da questão.

### Camada analítica

Após a carga transacional, gerar agregados por combinação relevante:

- banca + cargo + disciplina + tópico + subtópico;
- banca + órgão + disciplina + tópico + subtópico;
- banca + ano + tópico/subtópico.

Cada agregado deve guardar volume, janela de anos, percentual relativo dentro da disciplina e um indicador de confiança da amostra. Esses dados alimentam prioridade, mas não substituem o edital.

## Pipeline seguro

1. Perfilamento: medir cardinalidade, preenchimento e variações textuais da taxonomia.
2. Canonicalização: definir aliases aprovados para bancas, cargos, órgãos e assuntos antes da carga.
3. Carga-piloto: importar 50 mil questões em banco isolado e medir tempo, espaço, índices e consultas.
4. Carga em lotes idempotentes: staging/`COPY` ou `createMany`, com checkpoint por arquivo e relatório de rejeições.
5. Pós-carga: criar índices concorrentes, validar contagens e gerar agregados analíticos.
6. Reconciliação edital ↔ banco: fila de correspondências automáticas com revisão humana para ambiguidades.

## Regras de qualidade

- Nunca descartar silenciosamente: registrar identificador, arquivo, lote e motivo.
- Questões anuladas/desatualizadas não entram na recomendação padrão.
- Agregados com amostra pequena devem exibir baixa confiança.
- A taxonomia original deve ser preservada para auditoria, mesmo após canonicalização.
- Reexecução do mesmo lote não pode duplicar questões ou alternativas.

## Critérios de aceite da carga completa

- Contagem importada e rejeitada reconciliada com o relatório de origem.
- Consulta por banca/tópico/subtópico em tempo aceitável no ambiente de produção.
- Amostra aleatória validada contra o arquivo-fonte.
- Agregados estatísticos reproduzíveis a partir da base transacional.
- Importação pode ser retomada após falha sem reiniciar todos os arquivos.

## Próxima decisão técnica

Não executar o bulk ainda. Primeiro concluir perfilamento e carga-piloto, então escolher entre staging + `COPY` e inserção em lotes conforme os limites reais do PostgreSQL/Supabase.
