# Checklist de Desenvolvimento - Projeto Cortex

Este checklist foi consolidado com base na análise do documento [Perfil Cognitivo.md](file:///e:/Crawler/questoes_pipeline/Perfil%20Cognitivo.md) (Linhas 1200+) e foca na transformação do App em uma plataforma de inteligência de estudo adaptativa.

## 🧠 Fase 1: Diagnóstico Cognitivo (Prioridade Atual)
- [x] **Teste de Velocidade de Leitura:** Implementar no fluxo de Onboarding um cronômetro invisível enquanto o usuário lê um texto padrão.
- [x] **Teste de Retenção de Memória:** Realizar 3 a 5 perguntas sobre o texto lido para medir a capacidade de retenção imediata.
- [x] **Cálculo de Parâmetro 'S' Inicial:** Definir a força da memória inicial do usuário para alimentar a fórmula `R(t) = e^(-t/S)`.

## 📄 Fase 2: Inteligência de Editais
- [x] **Upload e Parser de PDF:** Criar serviço para receber o PDF do edital e usar o Gemini para extrair Disciplinas, Tópicos e Pesos.
- [x] **Estruturação Automática:** Gerar a árvore de matérias (Matéria -> Tópico) no banco de dados a partir do edital processado.
- [x] **Vínculo Questão-Edital:** Automatizar a marcação das questões coletadas com os tópicos específicos do edital do usuário.

## 📊 Fase 3: Telemetria e Comportamento
- [x] **Dataset de Estudo:** Expandir a coleta de dados para registrar se houve estudo teórico prévio a uma questão (Teoria vs. Prática).
- [x] **Monitoramento de Risco de Esquecimento:** Criar alerta visual no Dashboard para tópicos com baixo `R(t)` (Risco de Esquecimento alto).

## 📅 Fase 4: Cronograma e Priorização

- [x] **Algoritmo de Prioridade:** Implementar a fórmula `Peso x Frequência_Banca x Risco_Esquecimento`.
- [x] **Dashboard Preditivo:** Substituir a lista estática de estudos por uma sugestão dinâmica baseada no score de prioridade.

## 🎯 Fase 5: Predição de Aprovação

- [x] **Base Estatística de Bancas:** Popular dados históricos de bancas (FGV, CESPE, etc) no banco de dados.
- [x] **Modelo Preditivo:** Criar função que calcula a probabilidade real de aprovação cruzando o desempenho do usuário com o perfil da prova.
- [x] **Simulador de Cenários:** Implementar interface para o usuário testar: "E se eu estudar mais X horas da matéria Y?".

***

## 📚 Recursos de Coleta (Scraping de Materiais)
- Constituição Federal, Constituições Estaduais, Códigos (CC, CP, CPC, CPP, CLT, CDC, CTN), Estatutos (ECA, Idoso, Servidor), LAI, LRF, Lei 14.133/2021, 8.666/93, Improbidade
- Normas/Resoluções: CNJ, TCU/CGU, Conselhos setoriais (Contran, ANVISA, ANS)
- Jurisprudência/Súmulas: STF/STJ (Súmulas, Vinculantes, Informativos), Tribunais Estaduais (ex.: TJ-RJ)
- Provas/Editais: Cebraspe, FGV, Vunesp, FCC, PCI Concursos, Diários Oficiais
- Dados/Estatísticas: IBGE, IPEA, dados.gov.br, Portal da Transparência
- Legislação Local: Câmaras/Assembleias (Leis Orgânicas, Estatutos, Planos Diretores)
- Materiais Didáticos Públicos: ENAP, CGU, TCU (guias/cartilhas)
- Documento de referência: [scraping_sources.md](file:///e:/Cortex/docs/scraping_sources.md)

## 🧾 Política de Dados Mock (Ambiente de Desenvolvimento)
- Sempre que um fluxo depender de dados do BD, criar mocks e registrar em [mock_data_registry.md](file:///e:/Cortex/docs/mock_data_registry.md)
- Mocks devem ser removíveis por flag/ambiente; serão substituídos após conexão real ao BD
- Itens mock previstos:
  - Dashboard: Top 10 prioridades (user_id=1)
  - Telemetria SRS: R(t) e estabilidade S por tópico
  - Editais/Árvore de Matérias simplificados
  - Sessões Deep Work: métricas simuladas (duração, foco, hesitação)

## 🧩 Coleta Operacional (Qconcursos)
- Scraper de Questões: [crawler/qconcursos_scraper.py](file:///e:/Cortex/crawler/qconcursos_scraper.py)
  - Retoma pela página via [data/scraper_state.json](file:///e:/Cortex/data/scraper_state.json)
  - Execução recomendada fora do Trae (PowerShell): `python crawler/qconcursos_scraper.py`
  - Saída incremental: [data/questoes_qconcursos.json](file:///e:/Cortex/data/questoes_qconcursos.json)
- Scraper de Gabaritos (apenas gabaritos): [crawler/qconcursos_gabaritos.py](file:///e:/Cortex/crawler/qconcursos_gabaritos.py)
  - Marca alternativa e clica “Responder” por questão, removendo modais de bloqueio
  - Estado independente: [data/gabaritos_state.json](file:///e:/Cortex/data/gabaritos_state.json)
  - Saída: [data/gabaritos_qconcursos.json](file:///e:/Cortex/data/gabaritos_qconcursos.json)
  - Merge: `python crawler/merge_gabaritos.py` → [data/questoes_qconcursos_merged.json](file:///e:/Cortex/data/questoes_qconcursos_merged.json)

*Este documento deve ser atualizado conforme o progresso das sprints.*

## ✅ Checklist de Testes (Fluxo do Usuário)

- Pré-requisitos
  - Backend online em `http://localhost:8000` (ou usar dados mock conforme [mock_data_registry.md](file:///e:/Cortex/docs/mock_data_registry.md))
  - App Flutter rodando (Android/Chrome), rede estável

- Login
  - Como testar: Abrir o aplicativo e realizar login (mock ou real)
  - Esperado: Redireciona para Onboarding; nome do usuário disponível para personalização

- Onboarding
  - Como testar (Velocidade de leitura): Iniciar leitura do texto; confirmar término
  - Como testar (Retenção): Responder 3–5 perguntas; verificar cálculo de ‘S’ inicial
  - Como testar (Perfil/Rotina): Selecionar “Técnica/Exatas” ou “Textual/Literal”; preencher sono e deslocamento
  - Visual: Verificar GridBackgroundPainter (opacidade/linhas suaves)
  - Backend: Endpoint `/analytics/calibrate` ([cortex/api/main.py](file:///e:/Cortex/cortex/api/main.py)) retorna `initial_stability_s`

- Upload/Edital
  - Como testar: Enviar PDF; aguardar parser; verificar árvore de matérias gerada (mock se necessário)
  - Esperado: Disciplinas e tópicos estruturados; vínculo disponível para questões futuras

- Dashboard
  - Como testar (Prioridades): Consumir `/study/prioritize/{user_id}`; se BD indisponível, usar provider com mock ([api_service.dart](file:///e:/Cortex/frontend_flutter/lib/services/api_service.dart))
  - Visual: Verificar `_ForgetRiskAlert` variando cor por `retentionScore`; cards “Meta” e “Streak”

- Sessão Deep Work
  - Como testar: Iniciar/pausar/finalizar; verificar métricas simuladas (latência/hesitação) e registro (mock)

- Analytics
  - Como testar: Abrir gráficos e cards de insights; validar renderização de linhas e dados mock

- Anotações
  - Como testar: Criar/editar nota de tópico; confirmar persistência mock local

- Scrapers
  - Questões: `python crawler/qconcursos_scraper.py`
    - Confirmar atualização de [data/questoes_qconcursos.json](file:///e:/Cortex/data/questoes_qconcursos.json)
    - Confirmar retomada por [data/scraper_state.json](file:///e:/Cortex/data/scraper_state.json)
  - Gabaritos: `python crawler/qconcursos_gabaritos.py`
    - Confirmar captura incremental em [data/gabaritos_qconcursos.json](file:///e:/Cortex/data/gabaritos_qconcursos.json)
    - Executar merge: `python crawler/merge_gabaritos.py` → [data/questoes_qconcursos_merged.json](file:///e:/Cortex/data/questoes_qconcursos_merged.json)

- Erros e Offline
  - Como testar: Desligar backend (ou bloquear rede) e confirmar fallback via mocks; checar mensagens de erro amigáveis

- Performance e Visual
  - Como testar: Alternar tema claro/escuro; validar FPS estável; evitar travamentos em scroll/listas
