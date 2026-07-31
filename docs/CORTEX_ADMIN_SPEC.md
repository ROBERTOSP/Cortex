# Painel Administrativo — Cortex

## Papel

O painel administrativo é uma aplicação operacional separada da experiência do aluno. Ele controla qualidade, publicação, custos, suporte e governança. Não deve reutilizar o menu do estudante nem expor dados privados sem necessidade e auditoria.

## Estrutura recomendada

### 1. Visão geral

- editais em revisão, publicados, desatualizados e com erro;
- usuários ativos, ativação e conclusão do onboarding;
- sessões iniciadas e concluídas;
- falhas de jobs, filas e integrações;
- consumo de IA por operação, modelo e período;
- alertas de custo, segurança e qualidade.

### 2. Editais

- importar PDF e registrar fonte;
- processar uma vez e reutilizar no catálogo;
- editar todos os campos extraídos;
- revisar cargos, requisitos, vagas, cotas, PCD, datas e prova;
- revisar matérias, tópicos, subtópicos, pesos e quantidade de questões;
- comparar retificações;
- validar contra taxonomia;
- publicar, despublicar, arquivar e versionar;
- visualizar quais alunos serão afetados por uma alteração.

Estados sugeridos:

`RASCUNHO → PROCESSANDO → REVISÃO → APROVADO → PUBLICADO → RETIFICADO/ARQUIVADO`

### 3. Usuários

- pesquisar por nome, e-mail e identificador;
- ver status de cadastro, onboarding e assinatura;
- bloquear, desbloquear e encerrar sessões;
- redefinir fluxo de onboarding sem apagar dados;
- conceder ou remover papéis;
- atender solicitações de exportação e exclusão;
- visualizar somente telemetria necessária ao suporte;
- exigir justificativa para acesso excepcional.

### 4. Assinaturas e financeiro

- planos, preços, limites e benefícios;
- assinatura ativa, vencida, cancelada ou em teste;
- concessões manuais e cupons;
- eventos do provedor de pagamento;
- falhas de cobrança e reprocessamentos;
- limites de IA e custo médio por usuário;
- receita recorrente, cancelamento e inadimplência.

O painel não deve armazenar dados completos de cartão.

### 5. Bancas e inteligência

- aliases e nomes canônicos;
- volume de questões por banca, ano, órgão e matéria;
- incidência e recência por tópico;
- confiança estatística e cobertura do dataset;
- divergências de taxonomia;
- recalcular agregados;
- aprovar ou rejeitar associações sugeridas.

### 6. Banco de questões

- status de proveniência e direitos;
- taxonomia, banca, cargo, ano e dificuldade;
- duplicatas, imagens órfãs e registros incompletos;
- fila editorial de questões autorais;
- revisão de enunciado, alternativas, gabarito e explicação;
- publicar, arquivar e invalidar;
- métricas agregadas, sem expor conteúdo de uso restrito.

### 7. Notas Cortex

O administrador gerencia o serviço, não o conteúdo privado do aluno:

- saúde da sincronização e armazenamento;
- limites de anexos e uso por conta;
- jobs de indexação e busca;
- denúncias de conteúdo compartilhado;
- políticas de retenção e exclusão;
- templates oficiais de notas;
- acesso excepcional somente com consentimento, motivo e auditoria.

### 8. Conteúdo e comunicação

- landing page, avisos e banners;
- mensagens segmentadas por concurso ou situação;
- central de ajuda e perguntas frequentes;
- templates de e-mail e notificações;
- manutenção programada;
- publicação com rascunho, revisão e agendamento.

### 9. IA e automações

- modelos habilitados por operação;
- prompt e schema versionados;
- tokens de entrada e saída;
- custo por edital e por usuário;
- cache e reaproveitamento de análises;
- taxa de sucesso e campos ausentes;
- tentativas, timeout e fallback;
- comparação entre extração e revisão humana;
- desligamento de emergência por operação.

### 10. Auditoria e segurança

- registro de login administrativo;
- ação, ator, alvo, antes/depois e horário;
- papéis separados: suporte, conteúdo, financeiro, analista e administrador;
- autenticação multifator;
- expiração de sessão;
- exportação de logs;
- alertas de ação sensível.

## Ordem de construção

1. Layout administrativo e autorização por papel.
2. Editais completos, porque alimentam o onboarding.
3. Usuários e suporte, porque desbloqueiam os testes.
4. Monitoramento de IA e custos.
5. Bancas, taxonomia e questões.
6. Assinaturas.
7. Conteúdo e comunicações.
8. Notas Cortex, auditoria avançada e relatórios.

## Limites importantes

- O Admin não deve ser uma página dentro do dashboard visual do aluno.
- Itens de menu não implementados devem aparecer como “Em desenvolvimento” ou não aparecer.
- Nenhuma publicação automática de edital sem revisão humana.
- Nenhum administrador deve ler notas privadas por conveniência.
- Toda ação destrutiva ou sensível deve pedir confirmação e gerar auditoria.
