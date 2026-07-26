
# Concurso Questions Pipeline

Pipeline simples para:

1. Baixar provas e gabaritos
2. Extrair texto do PDF
3. Parsear questões
4. Salvar no banco

## Instalação

pip install -r requirements.txt

## Executar crawler
python crawler/download_provas.py

## Extrair texto
python parser/extract_text.py

## Parsear questões
python parser/parse_questoes.py

---

# 🧠 Motor Cortex - Inteligência Cognitiva

Após configurar seu **Supabase** e o arquivo `config.py`, execute os motores do Cortex:

### 1. Ingestão e Classificação por IA (Motor 4)
Este script lê as questões extraídas, usa IA para classificar disciplinas, tópicos e nível de dificuldade, e envia para o banco de dados final.
```bash
python cortex/ai_classifier.py
```

### 2. Simulação de Teste Cognitivo (Motor 1)
Simula o teste de onboarding que o usuário fará no App para medir latência e memória.
```bash
python cortex/cognitive_test_mock.py
```
