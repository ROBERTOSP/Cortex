# Núcleo do Produto — Cortex

## Promessa

Ao abrir o Cortex, o estudante sabe qual é a melhor próxima ação de estudo, por quanto tempo executá-la e por que ela é prioritária agora.

O produto não é um catálogo de conteúdo nem um cronograma estático. É um orientador de aprendizagem explicável que transforma rotina, edital, questões e comportamento em decisões diárias.

## Fluxo do usuário

1. O usuário conhece a proposta e cria a conta.
2. Define objetivo, cargo, banca e data da prova quando souber.
3. Escolhe um edital do catálogo ou envia PDF/link direto.
4. O Cortex extrai e monta o mapa de disciplinas, tópicos e subtópicos; o usuário revisa e confirma esse mapa.
5. Informa a rotina mínima: janelas disponíveis, compromissos, energia e duração confortável de sessão.
6. O Cortex cruza edital, histórico da banca, banco de questões e capacidade até a prova para criar o plano estratégico.
7. O usuário chega à Tela Hoje, cuja ação principal é iniciar a recomendação atual.
8. Executa uma sessão guiada, questões ou revisão.
9. Registra resultado e check-in; o Cortex atualiza o modelo do estudante e recomenda a próxima ação.

## Plano até a prova

O plano é calculado da data atual até a data da prova. A visão semanal é uma projeção operacional, não a fonte principal de decisão.

O motor deve:

- calcular dias e capacidade sustentável até a prova;
- estimar esforço e cobertura por tópico/subtópico;
- reservar margem para revisões, dias ruins e replanejamento;
- organizar o percurso em base/cobertura, consolidação, revisão dirigida e reta final;
- sinalizar cedo quando a cobertura completa for inviável na capacidade declarada;
- oferecer alternativas explícitas: ampliar capacidade, priorizar alto impacto ou alterar estratégia.

## Prioridade de conhecimento

Cada nó do edital recebe uma prioridade explicável. A composição inicial deve considerar:

- presença e peso declarado no edital;
- frequência, recência e padrão histórico de cobrança da banca;
- cargo/órgão quando o dado estiver disponível;
- dificuldade e volume de questões qualificadas;
- domínio, retenção, erros, latência e confiança do usuário;
- risco de esquecimento;
- dias restantes até a prova;
- disponibilidade real e contexto da rotina.

O edital define o universo de estudo. O banco de questões define evidências de cobrança. O comportamento do estudante define a intervenção adequada.

## Tela Hoje

A Tela Hoje é a interface principal. Ela apresenta uma ação principal com:

- matéria, tópico/subtópico e tipo de atividade;
- duração e horário sugeridos;
- material ou conjunto de questões;
- motivo da recomendação;
- impacto esperado e alternativa caso o usuário não possa executá-la.

O cronograma completo é uma visão secundária de transparência e planejamento.

## Sessão, questões e check-in

Uma recomendação só se torna aprendizado se gerar evidência. Cada execução deve registrar, na medida aplicável:

- início, fim, tempo ativo, pausas e interrupções;
- nó do conhecimento, atividade e origem da recomendação;
- resultado, dificuldade percebida, foco e fadiga;
- respostas, acertos, tempo e hesitação nas questões;
- check-in diário de energia, foco e tempo realmente disponível.

Esses dados atualizam domínio, retenção, risco e prioridade. O usuário deve poder aceitar, adiar, trocar ou rejeitar uma recomendação, sempre com consequência explicada.

## Replanejamento

O replanejamento é contínuo: após uma sessão, questões, check-in, compromisso novo ou ausência. Ele não deve apenas mover blocos; deve preservar cobertura relevante, revisões e o limite sustentável da rotina.

Toda alteração material deve responder: “o que mudou, por que mudou e qual é o próximo passo?”.

## Limites da primeira vertical validável

O primeiro ciclo não precisa conter extensão, anotações, flashcards, simulados completos ou previsão avançada. Deve conter:

1. edital confirmado e mapeado;
2. perfil estatístico inicial da banca por tópico;
3. rotina válida;
4. plano persistido até a prova;
5. uma recomendação diária explicável;
6. sessão ou bloco de questões com resultado registrado;
7. replanejamento da próxima recomendação.

## Métricas do beta

- percentual de usuários que chegam à primeira ação;
- percentual que conclui a primeira sessão;
- aceitação, troca, adiamento e rejeição de recomendações;
- execução prevista versus execução real;
- cobertura do edital projetada versus realizada;
- retorno semanal e percepção de clareza da recomendação.
