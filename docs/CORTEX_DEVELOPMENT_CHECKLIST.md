# Checklist de Desenvolvimento — Cortex

## Norte do produto

O Cortex não é um calendário automático nem uma cópia de plataformas de conteúdo. O ciclo que precisa ser validado é:

**edital → calibração → recomendação → execução → evidência de aprendizagem → replanejamento**

A personalização deve ser construída por comportamento observado — retenção, acerto, latência, confiança, fadiga e execução real — e não por rótulos fixos de “estilo de aprendizagem”.

## Regras de prioridade

- Não iniciar uma fase sem um teste verificável da anterior.
- A Engine calcula e decide; a IA interpreta, organiza e explica.
- Toda recomendação deve informar por que foi feita.
- O aluno pode alterar o plano, mas deve ver o impacto da alteração.
- Dados sensíveis não podem ser inferidos pela IA.
- “Concluído” significa funcional no backend, interface e persistência; menu ou layout isolado não conta.

## Fase 0 — Fundamentos e governança

- [x] Definir a promessa do produto e o fluxo essencial do estudante.
- [x] Auditar rotina, edital, questões e planejamento existentes.
- [x] Auditar integridade e taxonomia do dataset de questões.
- [x] Criar índice para cruzamento banca → disciplina → tópico → subtópico.
- [x] Criar aliases canônicos revisáveis para as 20 bancas do beta.
- [x] Criar camada de proveniência e status de direitos.
- [ ] Consolidar Supabase como banco operacional do produto.
- [ ] Isolar a VPS como guardiã do banco analítico de questões.
- [ ] Definir backups, restauração, monitoramento e ambientes.
- [ ] Definir política de retenção para editais, notas e telemetria de estudo.

**Aceite:** ambientes e responsabilidades de dados estão documentados, isolados e recuperáveis.

## Fase 1 — Painel Admin e catálogo confiável de editais

- [x] Separar a entrada administrativa do fluxo do aluno.
- [x] Restringir endpoints de editais ao papel `ADMIN`.
- [x] Importar PDF uma vez no painel administrativo.
- [x] Persistir a extração e publicar o edital no catálogo.
- [x] Permitir arquivar e republicar o edital.
- [ ] Criar dashboard administrativo real, separado do dashboard do aluno.
- [x] Permitir editar cargos, requisitos, matérias, tópicos e subtópicos extraídos.
- [ ] Exibir origem, versão, responsável, data e custo de cada análise.
- [x] Bloquear publicação enquanto houver campos críticos não revisados.
- [ ] Suportar retificação com versão, comparação e reprocessamento parcial.
- [ ] Resolver cada item confirmado contra a taxonomia de questões.
- [ ] Criar trilha de auditoria de alterações e publicação.

**Aceite:** um administrador importa, revisa, corrige e publica um edital; vários alunos o reutilizam sem nova chamada de IA.

## Fase 2 — Onboarding como calibração inicial

- [x] Pesquisar e filtrar editais publicados.
- [x] Selecionar edital e cargo/perfil.
- [x] Mostrar requisitos, matérias e regras relevantes do cargo.
- [x] Coletar disponibilidade, compromissos e duração confortável.
- [x] Persistir o progresso do onboarding.
- [x] Calcular capacidade semanal inicial.
- [x] Exibir diagnóstico estratégico inicial na etapa 5.
- [ ] Substituir autodeclaração isolada de nível por diagnóstico curto opcional.
- [x] Aplicar 8 questões autorizadas do cargo, cruzadas com taxonomia e incidência da banca, sem fallback genérico nem chamada de IA.
- [x] Registrar resposta, acerto, tempo, trocas e indício de hesitação no diagnóstico.
- [x] Explicar que o resultado define apenas o ponto de partida, não um rótulo.
- [ ] Transformar a etapa 5 em proposta do primeiro ciclo de sete dias.
- [ ] Levar o usuário diretamente à primeira ação executável.

**Aceite:** o aluno termina o onboarding com uma primeira sessão concreta, e não apenas com um cronograma.

## Fase 3 — Perfil da banca e mapa estratégico

- [x] Selecionar 20 bancas de alta cobertura do dataset.
- [x] Gerar dossiês iniciais por banca.
- [ ] Criar agregados persistidos por banca/cargo/órgão/tópico/ano.
- [ ] Calcular incidência, recência, dificuldade e confiança estatística.
- [ ] Cruzar incidência da banca com itens confirmados do edital.
- [ ] Calcular prioridade explicável por tópico e subtópico.
- [ ] Exibir insuficiência de evidência sem inventar prioridade.

**Aceite:** para cada tópico do edital, o Cortex informa prioridade, confiança e evidências usadas.

## Fase 4 — Plano adaptativo até a prova

- [x] Bloquear geração sem edital, cargo e matérias confirmados; não usar matérias genéricas como fallback.
- [ ] Criar entidades persistidas para plano, fases, metas e recomendações.
- [ ] Calcular capacidade sustentável até a data da prova.
- [ ] Dividir o percurso em cobertura, consolidação, revisão e reta final.
- [ ] Detectar risco de cobertura inviável e propor alternativas.
- [ ] Gerar visão semanal como consequência do plano.
- [ ] Permitir mover, trocar, encurtar, adiar e rejeitar sessões.
- [ ] Mostrar o impacto antes de aplicar alterações do aluno.
- [ ] Registrar histórico, motivo e autoria de cada mudança.
- [ ] Permitir desfazer e voltar à recomendação do Cortex.

**Aceite:** o aluno personaliza o plano sem perder a lógica estratégica e consegue entender cada replanejamento.

## Fase 5 — Tela Hoje, execução e perfil de aprendizagem

- [ ] Criar endpoint de próxima melhor ação.
- [ ] Mostrar matéria, tópico, técnica, duração, motivo e impacto esperado.
- [ ] Permitir iniciar, concluir, pausar, adiar, trocar ou rejeitar.
- [ ] Registrar tempo ativo, pausas, interrupções, foco e fadiga.
- [ ] Registrar desempenho, latência e confiança em questões.
- [ ] Estimar domínio e retenção por tópico.
- [ ] Programar recuperação espaçada e intercalação.
- [ ] Detectar queda de desempenho em sessões longas.
- [ ] Gerar o primeiro Perfil de Aprendizagem Cortex após dados suficientes.
- [ ] Mostrar o perfil como algo dinâmico, com evidências e grau de confiança.
- [ ] Recalcular a próxima ação após cada evidência relevante.

**Aceite:** uma sessão concluída altera domínio, revisão e próxima recomendação.

## Fase 6 — Notas Cortex

- [ ] Criar editor web em blocos.
- [ ] Organizar notas por concurso → matéria → tópico → subtópico.
- [ ] Criar blocos de conceito, resumo, exemplo, dúvida, erro e referência.
- [ ] Permitir tags, links internos, anexos e busca textual.
- [ ] Vincular nota ao nó da taxonomia e à sessão de estudo.
- [ ] Transformar trecho em flashcard, pergunta ou revisão.
- [ ] Criar busca semântica somente sobre conteúdo autorizado do usuário.
- [ ] Usar IA para resumir, explicar e sugerir vínculos, sempre com confirmação.
- [ ] Incorporar notas relevantes à Tela Hoje e às revisões.
- [ ] Implementar exportação e exclusão dos dados do usuário.

**Aceite:** uma nota criada durante o estudo fica vinculada ao conteúdo e pode gerar uma ação futura de recuperação.

## Fase 7 — Extensão contextual do Notas Cortex

- [ ] Autenticar a extensão com sessão segura e revogável.
- [ ] Capturar seleção de texto com URL, título, data e contexto.
- [ ] Permitir salvar como nota, dúvida, conceito ou erro.
- [ ] Sugerir matéria/tópico sem classificar silenciosamente.
- [ ] Registrar cronômetro por sessão, não apenas por aba aberta.
- [ ] Pausar após inatividade e pedir confirmação em sessões duvidosas.
- [ ] Sincronizar captura com Notas Cortex e Tela Hoje.
- [ ] Criar controles de privacidade por domínio e lista de bloqueio.
- [ ] Não capturar campos sensíveis, páginas privadas ou conteúdo sem ação explícita.

**Aceite:** uma seleção no navegador chega às Notas Cortex com fonte e vínculo revisável, sem registrar navegação indevida.

## Fase 8 — Questões de treino e caderno de erros

> **Política atual:** exibir ao usuário somente questões com direitos `AUTHORIZED` ou `LICENSED`. Questões com qualquer outro status permanecem restritas e não podem participar do diagnóstico ou dos treinos.
>
> **Evolução futura:** criar um acervo próprio do Cortex. A IA poderá gerar rascunhos de questões alinhados ao edital, cargo, tópico e perfil da banca, mas nenhuma questão será publicada automaticamente: conteúdo, alternativas, gabarito, explicação e originalidade deverão passar por revisão humana e aprovação administrativa.

- [x] Restringir diagnóstico e treino a questões `AUTHORIZED` ou `LICENSED`.
- [ ] Criar modelo editorial de questão autoral e revisão.
- [ ] Criar catálogo-semente pequeno para concursos do beta.
- [ ] Gerar rascunhos por habilidade, sem reproduzir questão de terceiro.
- [ ] Revisar conteúdo, gabarito, explicação e fonte.
- [ ] Publicar somente questões aprovadas.
- [ ] Criar caderno de erros conectado aos tópicos.
- [ ] Usar respostas e erros para atualizar domínio e prioridade.

**Aceite:** um treino autorizado produz evidência que altera a recomendação seguinte.

## Fase 9 — Operação administrativa completa

- [ ] Gerenciar usuários, situação da conta e papéis.
- [ ] Gerenciar planos, assinaturas, pagamentos e concessões.
- [ ] Gerenciar editais, retificações e catálogo público.
- [ ] Gerenciar taxonomia, aliases, bancas e evidências estatísticas.
- [ ] Gerenciar questões, direitos, revisão e publicação.
- [ ] Moderar conteúdo compartilhado sem acessar notas privadas por padrão.
- [ ] Gerenciar banners, avisos, páginas e comunicações.
- [ ] Acompanhar jobs de IA, tokens, custos, falhas e tentativas.
- [ ] Exibir métricas de ativação, estudo, retenção e abandono.
- [ ] Manter logs de auditoria e permissões administrativas granulares.
- [ ] Implementar ferramentas de suporte com acesso temporário e auditado.

**Aceite:** cada módulo administrativo executa operações reais, possui autorização, auditoria e estados de erro.

## Fase 10 — Beta fechado

- [ ] Selecionar 10–30 usuários e concursos-alvo.
- [ ] Medir chegada à primeira ação e conclusão da primeira sessão.
- [ ] Medir aceitação, alteração, adiamento e rejeição.
- [ ] Comparar capacidade planejada versus executada.
- [ ] Medir retenção após revisões espaçadas.
- [ ] Medir uso e utilidade das Notas Cortex.
- [ ] Entrevistar usuários sobre clareza, sobrecarga e confiança.
- [ ] Corrigir o ciclo antes de expandir conteúdo.

## Próxima vertical obrigatória

1. Finalizar revisão editorial do edital no Admin.
2. [x] Criar diagnóstico curto do onboarding.
3. Persistir plano de sete dias.
4. Entregar uma ação na Tela Hoje.
5. Registrar uma sessão e recalcular a próxima ação.
6. Só então iniciar o MVP web das Notas Cortex.
