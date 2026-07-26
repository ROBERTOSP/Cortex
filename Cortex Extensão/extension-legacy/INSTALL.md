# Instalação (modo desenvolvedor)

1. Abra o Chrome/Edge e acesse `chrome://extensions`.
2. Ative “Modo do desenvolvedor”.
3. Clique em “Carregar sem compactação”.
4. Selecione a pasta `e:\Cortex\Cortex Extensão\extension`.
5. (Opcional, para login Google) Abra os detalhes da extensão e copie o **ID da extensão**.
5. Abra o popup da extensão e configure:
   - API Base URL (padrão: `http://localhost:8000`)
   - Token (opcional)

Ao navegar em `questoes.grancursosonline.com.br`, a extensão passa a capturar eventos de visualização e respostas.

## Side Panel (Painel lateral)

No Chrome/Edge, abra o painel lateral da extensão “Cortex (Extension-First)” para acessar o onboarding e gerar o cronograma.

## Login com Google (MVP)

O login usa `chrome.identity.getAuthToken` (OAuth2).

1. No Google Cloud Console, crie um projeto e configure “OAuth consent screen”.
2. Crie uma credencial **OAuth Client ID** do tipo **Chrome Extension**:
   - Informe o **ID da extensão** (do `chrome://extensions`).
3. Copie o `client_id` gerado (formato `...apps.googleusercontent.com`).
4. No [manifest.json](file:///e:/Cortex/Cortex%20Extens%C3%A3o/extension/manifest.json), substitua:
   - `"client_id": "REPLACE_ME.apps.googleusercontent.com"`
5. Recarregue a extensão no `chrome://extensions`.
6. No popup da extensão, clique em **Login** e use **Entrar com Google**.
