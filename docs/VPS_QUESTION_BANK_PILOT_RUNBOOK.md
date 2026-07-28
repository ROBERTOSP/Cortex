# Carga-piloto do banco de questões na VPS

## Objetivo

Validar a infraestrutura e o importador com um recorte pequeno antes de qualquer carga ampla. O pacote analítico pode ser usado para o cruzamento edital x banca; o acervo textual permanece interno e restrito enquanto a situação de direitos é revisada.

## Ordem obrigatória

1. Criar PostgreSQL gerenciado ou uma instância dedicada; não usar o banco da aplicação sem backup.
2. Criar usuário de aplicação sem permissão de superusuário.
3. Configurar `DATABASE_URL` e `DATABASE_SSL=true` apenas se o servidor exigir TLS.
4. Executar backup testável antes de migrations: `pg_dump --format=custom`.
5. Aplicar migrations em homologação e conferir `prisma migrate status`.
6. Executar somente um piloto limitado, por exemplo `--max-files 1 --max-questions 100`.
7. Conferir totais, relações taxonômicas, imagens referenciadas e registros de proveniência.
8. Restaurar o backup em uma base vazia para validar recuperação.
9. Liberar o lote seguinte apenas se os indicadores abaixo estiverem aprovados.

## Critérios de aprovação do piloto

- 100 questões importadas sem duplicidade por `cortex_id_num`.
- Todas possuem `question_provenance` com status `PENDING`.
- Taxonomia preenchida quando a origem fornece banca, disciplina, tópico ou subtópico.
- Nenhuma questão, imagem ou alternativa é exposta por endpoint público.
- Backup e restauração concluídos.
- Uso de disco, CPU, RAM e tempo por mil itens registrados.

## Segurança operacional

- Nunca copie `.env` para documentos, commits ou chat.
- Transfira arquivos por canal autenticado e mantenha checksum do pacote.
- O ZIP analítico não substitui o acervo: ele serve apenas para perfil estatístico e cruzamento.
- A carga completa só pode ocorrer após revisão de capacidade, backup e decisão documentada sobre direitos.

## Comandos permitidos no piloto

```powershell
npm run prisma:generate
npx prisma migrate deploy
npx ts-node scripts/import-questions.ts --max-files 1 --max-questions 100 --import-batch pilot-001
```

Não execute `--confirm-full-import` durante o piloto.
