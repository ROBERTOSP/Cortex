# Publicação (com testes) — Chrome Web Store

## Objetivo

Publicar a extensão já com login Google, mas liberar para testes controlados antes do público geral.

## Importante (monetização)

A Chrome Web Store não é mais um caminho confiável para “extensão paga” via pagamento nativo para novos projetos. O modelo recomendado é:

- Extensão gratuita na loja
- Assinatura/tokens cobrados no seu backend (ex.: Stripe)
- Login (Google) + controle de acesso no backend

## Fluxo recomendado de publicação com testes

1. Crie o item da extensão no **Chrome Web Store Developer Dashboard**.
2. Faça upload de um **ZIP** inicial (rascunho).
3. Defina a visibilidade como:
   - **Unlisted** (recomendado para testes: gera link compartilhável), ou
   - **Trusted testers** (restrito a contas específicas).
4. Após o item existir no dashboard, você terá um **ID fixo da extensão** (o mesmo que aparece em `chrome://extensions` para a versão instalada via loja).

## Login Google (OAuth) para extensão publicada

O login do MVP usa `chrome.identity.getAuthToken`, que exige um **OAuth Client ID do tipo Chrome Extension**, vinculado ao **ID da extensão**.

Passo a passo:

1. No Google Cloud Console:
   - Configure o **OAuth consent screen**
   - Crie credencial **OAuth Client ID → Chrome Extension**
   - Informe o **ID da extensão** obtido no dashboard/instalação via loja
2. Copie o `client_id` (`...apps.googleusercontent.com`)
3. No [manifest.json](file:///e:/Cortex/Cortex%20Extens%C3%A3o/extension/manifest.json), substitua:
   - `"client_id": "REPLACE_ME.apps.googleusercontent.com"`
4. Re-empacote e faça upload do ZIP atualizado no dashboard.

## Backend para produção

Para extensão publicada, o backend deve estar em **HTTPS** (ex.: `https://api.seudominio.com`), e o manifest precisa permitir chamadas para esse domínio.

Checklist:

- Definir uma URL de API de produção (HTTPS)
- Atualizar `host_permissions` no manifest para incluir o domínio de produção
- Endpoints relevantes:
  - `POST /v1/auth/google`
  - `GET /v1/me`
  - `POST /v1/edital/analyze`
  - `POST /v1/uploads`

## Checklist de revisão da loja (prático)

- Preencher “Privacy”/“Data usage” corretamente (login e tokens = dados de conta)
- Publicar uma **Privacy Policy** (mesmo simples)
- Evitar permissões amplas sem necessidade
- Garantir que não há segredos no código/manifest

