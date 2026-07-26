# Deep Work API (Web/Flutter)

Base URL (local):
- `http://localhost:3002`

Autenticação:
- `Authorization: Bearer <cortex_token>`

## GET /questions/next

Retorna uma questão para a próxima rodada do Deep Work.

Resposta:

```json
{
  "id": "uuid",
  "subject": "Direito Constitucional",
  "topic": "Princípios",
  "statement": "texto...",
  "alternatives": [
    { "id": "A", "text": "..." },
    { "id": "B", "text": "..." }
  ]
}
```

## POST /questions/submit

Registra a resposta do usuário para uma questão.

Body:

```json
{
  "question_id": "uuid",
  "selected_option": "A",
  "latency_ms": 42000,
  "switches_count": 0,
  "hesitation_detected": false
}
```

Resposta:

```json
{
  "question_id": "uuid",
  "selected_option": "A",
  "is_correct": true,
  "correct_answer": "A"
}
```

## GET /questions/:id/explain

Gera (ou retorna do cache) uma explicação em Markdown para a questão.

Regras:
- Requer que o usuário já tenha enviado ao menos uma tentativa para a questão.
- Faz cache por tentativa (salva a explicação na última tentativa).

Resposta:

```json
{
  "question_id": "uuid",
  "explanation": "markdown...",
  "correct_answer": "A",
  "selected_option": "B",
  "is_correct": false
}
```
