# Checklist de Testes (Extremamente Detalhado)

Este guia explica passo a passo, como se fosse a primeira vez usando um celular, tudo que precisa para testar o App Cortex e os processos de coleta. Siga as instruções com calma. Se algo não aparecer, repita devagar.

## 1. Preparar o Ambiente
- Objetivo: Garantir que o telefone/computador tenha tudo para rodar o App.
- O que você precisa:
  - Um computador com Windows.
  - Internet funcionando.
  - Navegador Chrome instalado (para rodar o App em modo “web”).
  - Python instalado (para rodar os scripts).
  - Node/Flutter já configurado (se você já rodou o App antes, está pronto).
- Verificar:
  - Abra o navegador Chrome e acesse qualquer site (ex.: www.google.com). Se abrir, a internet está OK.

## 2. Abrir o Backend (Serviço do App)
- Objetivo: Ligar o “cérebro” do App (Backend).
- Passos:
  1. No Windows, clique no botão Iniciar.
  2. Digite “PowerShell” e aperte Enter para abrir a janela azul.
  3. Digite:
     - `cd E:\Cortex` e aperte Enter.
     - `python -m uvicorn cortex.api.main:app --reload` e aperte Enter.
  4. Espere aparecer uma mensagem com “Running on http://127.0.0.1:8000”.
- Verificar:
  - Abra o Chrome e digite `http://localhost:8000/` e aperte Enter.
  - Se aparecer “status: online”, o Backend está ligado.

## 3. Abrir o App (Modo Web com Chrome)
- Objetivo: Ver o App funcionando.
- Passos:
  1. Abra uma segunda janela do PowerShell (repita o passo 2.1 e 2.2).
  2. Digite:
     - `cd E:\Cortex\frontend_flutter`
     - `flutter run -d chrome`
  3. Espere carregar. O Chrome vai abrir com o App.
- Verificar:
  - Veja se a tela inicial aparece. Se demorar, aguarde. É normal na primeira vez.

## 4. Login do Usuário
- Objetivo: Entrar no App com um usuário.
- Passos:
  1. Na tela inicial, procure o botão de “Login” ou “Entrar”.
  2. Clique com o mouse uma vez.
  3. Preencha e confirme (se estiver usando mock, a tela pode pular direto para a próxima etapa).
- Verificar:
  - O App deve mostrar um cumprimento com o seu nome (ex.: “Bom dia, Roberto”) na tela do Dashboard.

## 5. Onboarding (Teste de Leitura e Memória)
- Objetivo: Medir sua velocidade e retenção.
- Passos:
  1. Leia o texto que aparece. Leia normalmente.
  2. Ao terminar, procure o botão “Continuar” e clique.
  3. Responda de 3 a 5 perguntas sobre o texto. Clique na alternativa desejada (A, B, C, D, E).
  4. Clique “Enviar” ou “Confirmar”.
- Verificar:
  - O App deve calcular um valor chamado “S” (estabilidade). Se aparecer um resultado, está OK.
  - Se a internet cair, repita os passos com calma.

## 6. Perfil de Estudo e Rotina
- Objetivo: Informar seu estilo e rotina.
- Passos:
  1. Selecione “Técnica/Exatas” ou “Textual/Literal”. Clique em uma opção.
  2. Informe sua qualidade de sono (ex.: Boa, Regular, Ruim).
  3. Informe o tempo de deslocamento (ex.: 30 minutos).
  4. Clique em “Salvar”.
- Verificar:
  - O App deve seguir para a tela principal (Dashboard).

## 7. Upload do Edital (PDF)
- Objetivo: Enviar o PDF do seu edital para o sistema entender suas matérias.
- Passos:
  1. Procure uma opção “Enviar Edital” ou “Upload”.
  2. Clique uma vez. Vai abrir uma janela para escolher o arquivo.
  3. Selecione o arquivo PDF do edital.
  4. Clique “Abrir”.
  5. Aguarde a análise (pode demorar alguns segundos).
- Verificar:
  - O App deve mostrar matérias e tópicos (ex.: Direito Constitucional > Direitos Fundamentais).
  - Se não aparecer, tente novamente com outro PDF.

## 8. Dashboard (Sugestões Inteligentes)
- Objetivo: Ver o que estudar hoje.
- Passos:
  1. Na tela principal, veja o card “Foco Sugerido”.
  2. Leia o nome do tópico sugerido.
  3. Se aparecer um alerta colorido “Risco de Esquecimento Alto”, significa que é importante revisar.
- Verificar:
  - Os alertas mudam de cor conforme o risco (Vermelho, Laranja, Azul).
  - Se usar dados de teste (mock), os valores são simulados e servem para validar a tela.

## 9. Sessão de Estudo (Deep Work)
- Objetivo: Registrar uma sessão de estudo.
- Passos:
  1. Clique no botão “Iniciar Sessão Deep Work”.
  2. Estude por alguns minutos (simulado ou real).
  3. Clique “Finalizar”.
- Verificar:
  - O App deve mostrar a duração e alguma métrica (ex.: foco, hesitação). Se estiver em modo mock, é simulado.

## 10. Analytics (Gráficos e Insights)
- Objetivo: Ver gráficos de desempenho.
- Passos:
  1. Procure “Analytics” no menu.
  2. Clique uma vez.
  3. Veja se os gráficos carregam sem travar.
- Verificar:
  - Se o gráfico aparece com linhas e legendas, está OK.

## 11. Anotações
- Objetivo: Criar uma anotação sobre um tópico.
- Passos:
  1. Procure “Anotações” no menu.
  2. Clique uma vez.
  3. Clique “Nova Anotação”.
  4. Escreva um texto simples (ex.: “Crase: regra principal…”).
  5. Clique “Salvar”.
- Verificar:
  - A anotação deve aparecer listada. Em modo mock, fica apenas no app até conectarmos ao banco real.

## 12. Scraper de Questões (Rodar Durante a Noite)
- Objetivo: Baixar questões do Qconcursos.
- Passos (no PowerShell, fora do Trae):
  1. Abra PowerShell.
  2. Digite: `cd E:\Cortex` e aperte Enter.
  3. Digite: `python crawler/qconcursos_scraper.py` e aperte Enter.
  4. Faça login no navegador que abrir e aplique filtros.
  5. Deixe rodando. Ele salva automaticamente.
- Verificar:
  - O arquivo [data/questoes_qconcursos.json](file:///e:/Cortex/data/questoes_qconcursos.json) cresce com novas questões.
  - Se parar, repita os passos. Ele continua da última página registrada em [data/scraper_state.json](file:///e:/Cortex/data/scraper_state.json).

## 13. Scraper de Gabaritos (Somente Gabaritos)
- Objetivo: Pegar apenas as letras corretas das questões.
- Passos (no PowerShell):
  1. Abra PowerShell.
  2. Digite: `cd E:\Cortex` e aperte Enter.
  3. Digite: `python crawler/qconcursos_gabaritos.py` e aperte Enter.
  4. Faça login (se pedir) e aplique o filtro.
  5. O script marca uma alternativa e clica “Responder” automaticamente.
- Verificar:
  - O arquivo [data/gabaritos_qconcursos.json](file:///e:/Cortex/data/gabaritos_qconcursos.json) mostra pares `{ "Q123456": "A" }`.
  - O estado para retomar está em [data/gabaritos_state.json](file:///e:/Cortex/data/gabaritos_state.json).
  - Para juntar com as questões: `python crawler/merge_gabaritos.py` e verifique [data/questoes_qconcursos_merged.json](file:///e:/Cortex/data/questoes_qconcursos_merged.json).

## 14. Teste sem Internet (Modo Offline)
- Objetivo: Garantir que o App não quebra sem conexão.
- Passos:
  1. Desligue o Wi‑Fi do computador.
  2. Abra o App.
- Verificar:
  - O App deve mostrar mensagens amigáveis e continuar com dados mock nas telas.
  - Religue o Wi‑Fi e tente novamente.

## 15. Desempenho e Aparência
- Objetivo: Checar se está suave e bonito.
- Passos:
  1. Navegue pelas telas sem pressa.
  2. Observe se há travamentos ao rolar listas.
  3. Troque entre tema claro/escuro (se disponível).
- Verificar:
  - As telas devem responder rápido e sem tremores.

## 16. Se Algo Der Errado
- Problema: O Backend não liga.
  - Verifique se o PowerShell está em `E:\Cortex`.
  - Tente `python -m uvicorn cortex.api.main:app --reload`.
- Problema: O App não abre no Chrome.
  - Rode `flutter run -d chrome` dentro de `E:\Cortex\frontend_flutter`.
- Problema: O scraper trava por “limite do plano”.
  - Feche o modal no navegador e rode novamente.
  - Deixe para rodar em horários diferentes para reduzir bloqueio.

## 17. Onde Ficam as Partes
- Backend: [cortex/api/main.py](file:///e:/Cortex/cortex/api/main.py)
- Motor de Priorização: [optimization_engine.py](file:///e:/Cortex/cortex/engines/optimization_engine.py)
- Engine SRS: [srs_engine.py](file:///e:/Cortex/cortex/engines/srs_engine.py)
- Scraper de Questões: [qconcursos_scraper.py](file:///e:/Cortex/crawler/qconcursos_scraper.py)
- Scraper de Gabaritos: [qconcursos_gabaritos.py](file:///e:/Cortex/crawler/qconcursos_gabaritos.py)
- Merge de Gabaritos: [merge_gabaritos.py](file:///e:/Cortex/crawler/merge_gabaritos.py)
- Dashboard Flutter: [dashboard_screen.dart](file:///e:/Cortex/frontend_flutter/lib/screens/dashboard_screen.dart)
- Serviço Flutter/API: [api_service.dart](file:///e:/Cortex/frontend_flutter/lib/services/api_service.dart)

---
Siga este checklist sempre que for testar uma versão. Se algo não funcionar, volte um passo e tente novamente com calma.*** End Patch
