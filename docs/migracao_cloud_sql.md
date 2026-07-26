# Migração do Cortex para Cloud SQL PostgreSQL

## Objetivo

Migrar o banco atual do Cortex de Supabase/PostgreSQL para **Google Cloud SQL for PostgreSQL**, mantendo a arquitetura:

- Frontend: React + Vite
- Backend: NestJS
- ORM: Prisma
- Auth: Google login + JWT próprio do backend

## Decisão adotada

- Banco alvo: **Cloud SQL for PostgreSQL**
- Estratégia: usar o banco **diretamente** com `NestJS + Prisma`
- Não usar `Firebase SQL Connect` como núcleo do backend neste momento
- Migração inicial: levar **todos os dados atuais**
- Importação massiva de `~1,9M` questões: **depois**, quando o produto estiver mais estável

## Por que essa abordagem

- O projeto já está em PostgreSQL, então a migração é tecnicamente simples
- Evita lock-in desnecessário em uma camada extra
- Mantém a API REST atual do backend
- Permite trocar o provedor do banco com pouco impacto no frontend

## Escopo da migração inicial

Levar para o banco novo:

- `users`
- `contests`
- `knowledge_nodes`
- `notes`
- `flashcards`
- `questions`
- `question_options`
- `question_boards`
- `question_subjects`
- `question_topics`
- `question_subtopics`
- `study_sessions`
- `revisions`
- `question_attempts`

## Estratégia recomendada

### Fase 1: Provisionar o Cloud SQL

Criar uma instância PostgreSQL com:

- Região: preferencialmente `southamerica-east1` ou a região principal do backend
- Banco: `cortex`
- Usuário de aplicação dedicado
- Senha forte
- Backups automáticos habilitados

Para ambiente inicial/dev:

- pode usar acesso por IP público temporariamente
- depois o ideal é restringir IPs ou usar conexão privada/Cloud Run

### Fase 2: Criar o schema no destino

No `backend`, apontar temporariamente o `DATABASE_URL` para o Cloud SQL e executar:

```bash
npm -w @cortex/backend run prisma:generate
npm -w @cortex/backend run prisma:push
```

Isso cria a estrutura do schema atual no banco novo.

### Fase 3: Exportar os dados do banco atual

Exportar o banco atual usando `pg_dump`.

Exemplo conceitual:

```bash
pg_dump --data-only --inserts --column-inserts --dbname "<DATABASE_URL_SUPABASE>" > supabase-data.sql
```

Observação:

- se preferirmos uma migração mais segura e íntegra, podemos usar:

```bash
pg_dump --format=custom --dbname "<DATABASE_URL_SUPABASE>" --file supabase.dump
```

### Fase 4: Importar no Cloud SQL

Importar usando `psql` ou `pg_restore`, dependendo do formato exportado.

Exemplos:

```bash
psql "<DATABASE_URL_CLOUDSQL>" -f supabase-data.sql
```

ou

```bash
pg_restore --no-owner --no-privileges --dbname "<DATABASE_URL_CLOUDSQL>" supabase.dump
```

### Fase 5: Apontar o backend para o banco novo

Atualizar `DATABASE_URL` no arquivo:

- `e:\Cortex\Cortex Extensão\backend\.env`

O restante do backend deve continuar praticamente igual, porque Prisma e NestJS continuam usando PostgreSQL.

### Fase 6: Validação funcional

Validar:

- `GET /health`
- login Google
- `GET /auth/me`
- `GET /questions/next`
- `POST /questions/submit`
- `GET /questions/:id/explain`

Também validar no frontend:

- login
- Dashboard
- Deep Work
- Schedule
- Analytics

## Ordem segura de execução

1. Criar o Cloud SQL
2. Criar banco, usuário e senha
3. Aplicar schema com Prisma
4. Exportar os dados do banco atual
5. Importar no Cloud SQL
6. Ajustar `DATABASE_URL`
7. Rodar backend local
8. Validar fluxos do produto
9. Só depois desligar a dependência do Supabase

## Cuidados importantes

- Não sobrescrever `.env` automaticamente
- Não apagar o banco atual antes da validação final
- Não importar ainda os `~1,9M` registros
- Fazer a troca primeiro com a base atual pequena
- Guardar a string antiga do Supabase para rollback rápido

## Rollback

Se algo falhar:

1. restaurar o `DATABASE_URL` anterior no backend
2. reiniciar o backend
3. validar `GET /health` e login

Como o backend continuará em PostgreSQL, o rollback é simples.

## Próximo passo prático

Agora precisamos criar a instância do Cloud SQL e obter:

- host
- porta
- nome do banco
- usuário
- senha
- string `DATABASE_URL`

Com isso em mãos, o restante da migração do projeto fica direto.

