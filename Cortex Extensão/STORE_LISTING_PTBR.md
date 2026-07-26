# Textos para Chrome Web Store (pt-BR)

Use este arquivo como “copiar e colar” para preencher os campos do item na Chrome Web Store.

## Descrição curta (até ~132 caracteres)

Assistente de estudos para concursos: rotina, cronograma por edital (PDF opcional), tokens de IA e painel lateral no navegador.

## Descrição detalhada (mínimo 25 caracteres)

O Cortex é um assistente de estudos para concursos dentro do navegador. Ele ajuda você a configurar sua rotina (horas por dia e dias por semana), informar cargo e data da prova e gerar um cronograma inicial. Opcionalmente, você pode enviar um edital em PDF para ajudar na análise e na criação do plano. A extensão também pode registrar eventos de estudo em portais compatíveis para melhorar seus insights e acompanhamento. O acesso pode ser feito via Login com Google para sincronizar sua assinatura e saldo de tokens.

## Único propósito (Single purpose)

O único propósito desta extensão é ajudar o usuário a planejar e acompanhar seus estudos para concursos dentro do navegador (cronograma, rotina e telemetria de estudo), com login para sincronização de conta e tokens.

## Práticas de privacidade (resumo objetivo)

- Dados coletados: e-mail/nome/foto (opcional) via Login Google; configurações locais; eventos de estudo (ex.: “questão visualizada/resposta”); arquivos enviados (PDF do edital, opcional).
- Finalidade: autenticação e sincronização de conta; geração de cronograma; registro/diagnóstico de estudo; exibição de saldo de tokens.
- Compartilhamento: não vendemos dados; dados podem ser enviados apenas para o backend do Cortex configurado pelo usuário.
- Retenção: sessões/tokens e eventos são mantidos para histórico do usuário; o usuário pode solicitar exclusão.
- Segurança: comunicação via HTTPS em produção; tokens de sessão não são expostos publicamente.

## Justificativas de permissões (para “Práticas de privacidade”)

### identity

Usada exclusivamente para permitir Login com Google via `chrome.identity.getAuthToken`, necessário para autenticar o usuário e sincronizar saldo de tokens/assinatura no backend.

### storage

Usada para salvar localmente configurações (URL da API), preferências, perfil de rotina, cronograma gerado, fila offline de eventos e o token de sessão do usuário para manter o login.

### host permissions

- `https://questoes.grancursosonline.com.br/*`: ler eventos de interação de estudo nas páginas compatíveis para telemetria (ex.: questão visualizada e resultado).
- `https://www.qconcursos.com/*` (se habilitado): compatibilidade futura/telemetria em páginas do portal.
- Domínio da API (ex.: `https://api.seudominio.com/*`): enviar eventos/arquivos e obter cronograma/tokens.

## Justificativa “código remoto”

Esta extensão **não executa código remoto** (não baixa/roda JavaScript de servidores). Ela apenas realiza chamadas HTTP para a API do Cortex para enviar eventos e solicitar cronogramas/validações. Toda a lógica da extensão está empacotada no pacote publicado.

## Checklist de itens obrigatórios no dashboard

- Pelo menos 1 captura de tela ou vídeo (ideal: 3–5 imagens do popup, side panel e fluxo de login)
- Ícone do item (upload na loja): 128×128 (PNG)
- E-mail de contato do publisher cadastrado e verificado (página “Configurações” do dashboard)
- Confirmação de conformidade de uso de dados em “Práticas de privacidade”

