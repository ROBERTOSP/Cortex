# Checklist de Desenvolvimento — Cortex

## Regra de prioridade

Não iniciar uma fase enquanto a anterior não tiver um teste verificável. O objetivo é validar o ciclo: edital → decisão diária → execução → aprendizado → replanejamento.

## Fase 0 — Fundamentos e governança

- [x] Definir a promessa do produto e o fluxo do estudante.
- [x] Auditar rotina, edital, questões e planejamento existentes.
- [x] Auditar integridade e taxonomia do dataset de questões.
- [x] Criar índice para cruzamento banca → disciplina → tópico → subtópico.
- [x] Criar aliases canônicos revisáveis para as 20 bancas do beta; disciplina e tópico continuam na próxima iteração.
- [x] Criar camada de proveniência e status de direitos (schema e migration preparados; aplicação no banco fica para o piloto controlado).
- [ ] Definir ambiente de VPS, backups e carga-piloto.

**Aceite:** o sistema sabe quais dados pode usar internamente e consegue relacionar um item do edital à taxonomia do banco.

## Fase 1 — Edital confirmado

- [x] Importar edital por catálogo, PDF ou link.
- [x] Extrair mapa inicial de disciplinas, tópicos e subtópicos; pesos e data ainda exigem revisão.
- [x] Criar tela de revisão humana do mapa extraído antes de ativar o concurso.
- [ ] Permitir correção, inclusão, exclusão e confirmação dos itens.
- [ ] Resolver cada item confirmado contra a taxonomia de questões.

**Aceite:** existe um edital confirmado e cada item possui vínculo, ambiguidade registrada ou ausência de correspondência explícita.

## Fase 2 — Perfil da banca e mapa estratégico

- [x] Selecionar 20 bancas de alta cobertura do dataset.
- [x] Gerar dossiês iniciais por banca.
- [ ] Criar agregados persistidos por banca/cargo/órgão/tópico/ano.
- [ ] Calcular incidência, recência, dificuldade e confiança estatística.
- [ ] Cruzar incidência da banca com itens confirmados do edital.
- [ ] Calcular prioridade explicável por tópico/subtópico.

**Aceite:** para cada tópico do edital, o Cortex informa prioridade e evidências usadas.

## Fase 3 — Plano até a prova

- [ ] Criar entidades persistidas para plano, fases, metas e recomendações.
- [ ] Calcular capacidade sustentável até a data da prova.
- [ ] Dividir o percurso em cobertura, consolidação, revisão e reta final.
- [ ] Detectar risco de cobertura inviável e propor alternativas.
- [ ] Gerar visão semanal como consequência do plano, não como fonte de verdade.

**Aceite:** o estudante vê seu caminho até a prova, risco atual e próximos marcos.

## Fase 4 — Tela Hoje e execução

- [ ] Criar endpoint de próxima melhor ação.
- [ ] Mostrar matéria, tópico, duração, motivo e impacto esperado.
- [ ] Permitir iniciar, concluir, adiar, trocar ou rejeitar a ação.
- [ ] Registrar sessão, foco, fadiga, interrupções e resultado.
- [ ] Registrar check-in diário.

**Aceite:** após uma execução, o Cortex produz uma próxima ação atualizada e explicada.

## Fase 5 — Questões autorais de treino

- [ ] Criar modelo editorial de questão autoral e revisão.
- [ ] Criar catálogo-semente pequeno para os concursos do beta.
- [ ] Gerar rascunhos com IA a partir de especificação de habilidade, não de questão de terceiro.
- [ ] Revisar conteúdo, gabarito, explicação e fonte de referência.
- [ ] Publicar somente questões aprovadas.
- [ ] Usar respostas do aluno para atualizar domínio e prioridade.

**Aceite:** o aluno pode realizar um treino autorizado e o resultado altera a recomendação seguinte.

## Fase 6 — Beta fechado

- [ ] Selecionar 10–30 usuários e concursos-alvo.
- [ ] Medir chegada à primeira ação e conclusão da primeira sessão.
- [ ] Medir aceitação, adiamento e rejeição das recomendações.
- [ ] Comparar capacidade planejada versus executada.
- [ ] Corrigir o ciclo antes de expandir conteúdo e funcionalidades.

## O que fica depois do ciclo essencial

- [ ] Caderno de erros.
- [ ] Revisões adaptativas avançadas.
- [ ] Simulados autorais e adaptativos.
- [ ] Anotações e flashcards conectados.
- [ ] Extensão contextual.
- [ ] Relatórios avançados de prontidão.
