# Núcleo do Produto — Cortex

## Promessa

Ao abrir o Cortex, o estudante sabe qual é a melhor próxima ação de estudo, por quanto tempo executá-la e por que ela é prioritária agora.

O produto não é um catálogo de conteúdo nem um cronograma estático. É um orientador de aprendizagem explicável que transforma rotina, edital, questões, execução e Notas Cortex em decisões diárias.

O Cortex não atribui ao aluno um estilo fixo de aprendizagem. Ele constrói um perfil dinâmico a partir de evidências: retenção, acerto, latência, confiança, fadiga, duração e execução real.

## Fluxo do usuário

1. O usuário conhece a proposta e cria a conta.
2. Define objetivo, cargo, banca e data da prova quando souber.
3. Pesquisa e escolhe um edital previamente analisado e publicado pela equipe no catálogo.
4. Seleciona o cargo/perfil e confere as informações relevantes; extração, correção e publicação pertencem ao painel administrativo.
5. Informa a rotina mínima: janelas disponíveis, compromissos, energia e duração confortável de sessão.
6. Realiza uma calibração curta opcional para gerar a primeira hipótese de domínio.
7. O Cortex cruza edital, histórico da banca, diagnóstico e capacidade até a prova para criar o primeiro ciclo de sete dias.
8. O usuário chega à Tela Hoje, cuja ação principal é iniciar a recomendação atual.
9. Executa uma sessão guiada, questões, revisão ou atividade ligada às Notas Cortex.
10. O Cortex registra evidências, atualiza o perfil de aprendizagem e recomenda a próxima ação.

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

O aluno pode mover, trocar, encurtar, adiar ou rejeitar uma sessão. Antes da alteração, o Cortex explica o impacto; depois, registra a decisão, recalcula somente o necessário e permite desfazer.

## Notas Cortex

Notas Cortex é o espaço de conhecimento pessoal conectado ao plano, não um editor genérico isolado.

Cada nota pode ser associada a concurso, matéria, tópico, subtópico, sessão e fonte. O usuário pode registrar conceitos, resumos, exemplos, dúvidas e erros; transformar trechos em flashcards, perguntas ou revisões; e recuperar o conteúdo pela busca.

A extensão do navegador complementa o módulo web ao capturar seleções por ação explícita, registrar fonte e tempo de uma sessão confirmada e sugerir vínculos com a taxonomia. A IA pode resumir e sugerir organização, mas o usuário confirma classificações incertas.

O tempo de estudo não pode ser inferido apenas porque uma aba permaneceu aberta. Inatividade, mudança de contexto e sessões duvidosas exigem pausa ou confirmação.

## Limites da primeira vertical validável

O primeiro ciclo não precisa conter extensão, Notas Cortex completa, flashcards, simulados completos ou previsão avançada. Deve conter:

1. edital confirmado e mapeado;
2. perfil estatístico inicial da banca por tópico;
3. rotina válida;
4. plano persistido até a prova;
5. uma recomendação diária explicável;
6. sessão ou bloco de questões com resultado registrado;
7. replanejamento da próxima recomendação.

Depois que esse ciclo estiver validado, o MVP web das Notas Cortex é a próxima vertical. A extensão vem depois da sincronização, taxonomia e privacidade das notas estarem estáveis.

## Métricas do beta

- percentual de usuários que chegam à primeira ação;
- percentual que conclui a primeira sessão;
- aceitação, troca, adiamento e rejeição de recomendações;
- execução prevista versus execução real;
- cobertura do edital projetada versus realizada;
- retorno semanal e percepção de clareza da recomendação.
