# Direitos e Proveniência do Banco de Questões

> Documento técnico de governança. Não substitui parecer jurídico.

## Decisão imediata

O dataset extraído de portal de terceiros não será disponibilizado publicamente, vendido, redistribuído ou usado para treinamento/publicação até que haja uma base jurídica e contratual documentada para cada categoria de conteúdo.

## Evidência encontrada na amostra

Os arquivos de origem possuem:

- identificadores `cortex_id` e `cortex_id_num`;
- enunciado, alternativas, gabarito e taxonomia;
- dados factuais de prova, banca, cargo, carreira e órgão.

Não possuem URL de origem, licença, titular ou declaração de uso. Portanto, não é possível demonstrar apenas pelo arquivo que uma questão veio da fonte oficial, que é de domínio público ou que pode ser redistribuída.

## O que pode ser normalizado

É permitido tecnicamente normalizar dados factuais e nomes de exibição sem apagar o dado original:

- aliases de banca: por exemplo, nome extenso → sigla de exibição;
- acentuação, capitalização e grafia de disciplina/tópico;
- extração de `nome`, `sigla`, `UF` e `esfera` de órgão;
- extração de descrição de carreira e cargo;
- associação revisável entre edital e taxonomia.

Essas mudanças não resolvem direitos autorais; servem somente para qualidade de busca e análise.

## O que não deve ser feito

- Remover ou substituir `cortex_id` para ocultar a procedência do dataset.
- Reescrever texto, alternativas ou nomes apenas para aparentar autoria própria.
- Presumir que conteúdo disponível na internet é livre para cópia ou redistribuição.
- Classificar automaticamente uma questão como “livre” sem documentação da fonte primária ou licença.

## Modelo de proveniência obrigatório

Cada questão importada deve manter, em tabela ou campos próprios:

- `source_system`: sistema do qual o registro foi obtido;
- `source_record_id`: identificador externo original, imutável;
- `source_file` e lote de importação;
- `source_url` quando disponível;
- `primary_source_url` quando localizada (por exemplo, prova/gabarito oficial);
- `provenance_confidence`: não verificada, provável, confirmada;
- `rights_status`: pendente, uso interno restrito, autorizado/licenciado, domínio público confirmado, removido;
- `rights_basis` e `reviewed_at`;
- responsável e evidência documental da revisão.

O campo de exibição pode ser diferente do identificador original, mas a trilha de origem nunca deve ser apagada.

## Classificação operacional inicial

Enquanto a análise não for concluída:

| Classe | Uso permitido no Cortex |
| --- | --- |
| PENDENTE | Auditoria interna; não exibir ao usuário final. |
| USO_INTERNO_RESTRITO | Desenvolvimento e testes privados, sujeito à orientação jurídica. |
| AUTORIZADO_OU_LICENCIADO | Exibição conforme os termos da licença. |
| FONTE_OFICIAL_CONFIRMADA | Avaliação jurídica específica sobre a reprodução e apresentação. |
| REMOVIDO | Sem consulta ou distribuição. |

## Próximo processo de auditoria

1. Preservar o dataset bruto em armazenamento restrito e imutável.
2. Criar inventário por lote: identificador, arquivo, prova, banca, ano e status inicial.
3. Localizar fontes oficiais de prova e gabarito por amostragem e documentar a correspondência.
4. Ler e registrar termos/licenças dos fornecedores ou firmar licença comercial quando necessário.
5. Submeter a matriz de fontes e usos planejados a advogado especializado em propriedade intelectual/direito digital.
6. Só então promover itens para a camada publicada.

## Referências consultadas

- Lei nº 9.610/1998 (Lei de Direitos Autorais), especialmente a necessidade de interpretar restritivamente negócios de direitos autorais e as regras sobre utilização de obras.
- Termos de Uso e Condições de Serviço do Gran Cursos Online, que vedam distribuição/redistribuição dos produtos e transferência de acesso.
