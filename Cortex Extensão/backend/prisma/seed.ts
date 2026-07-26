import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

type SeedOption = {
  letter: string;
  text: string;
  isCorrect: boolean;
  displayOrder: number;
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL não configurada para o seed.');
}

function shouldUseSsl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const host = (url.hostname || '').toLowerCase();
    const sslmode = (url.searchParams.get('sslmode') || '').toLowerCase();

    if (host === 'localhost' || host === '127.0.0.1') return false;
    if (sslmode === 'disable') return false;
    if (sslmode === 'require' || sslmode === 'verify-ca' || sslmode === 'verify-full')
      return true;

    return true;
  } catch {
    return false;
  }
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: shouldUseSsl(databaseUrl) ? { rejectUnauthorized: false } : undefined,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function upsertOptions(questionId: string, options: SeedOption[]) {
  for (const option of options) {
    await prisma.questionOption.upsert({
      where: {
        questionId_letter: {
          questionId,
          letter: option.letter,
        },
      },
      update: {
        text: option.text,
        isCorrect: option.isCorrect,
        displayOrder: option.displayOrder,
      },
      create: {
        questionId,
        letter: option.letter,
        text: option.text,
        isCorrect: option.isCorrect,
        displayOrder: option.displayOrder,
      },
    });
  }
}

async function main() {
  const board = await prisma.questionBoard.upsert({
    where: { name: 'CESPE / Cebraspe' },
    update: {},
    create: { name: 'CESPE / Cebraspe' },
  });

  const constitutionalLaw = await prisma.questionSubject.upsert({
    where: { name: 'Direito Constitucional' },
    update: {},
    create: { name: 'Direito Constitucional' },
  });

  const constitutionalTopic = await prisma.questionTopic.upsert({
    where: {
      name_subjectId: {
        name: 'Direitos e Garantias Fundamentais',
        subjectId: constitutionalLaw.id,
      },
    },
    update: {},
    create: {
      name: 'Direitos e Garantias Fundamentais',
      subjectId: constitutionalLaw.id,
    },
  });

  const portuguese = await prisma.questionSubject.upsert({
    where: { name: 'Português' },
    update: {},
    create: { name: 'Português' },
  });

  const portugueseTopic = await prisma.questionTopic.upsert({
    where: {
      name_subjectId: {
        name: 'Interpretação de Texto',
        subjectId: portuguese.id,
      },
    },
    update: {},
    create: {
      name: 'Interpretação de Texto',
      subjectId: portuguese.id,
    },
  });

  const questionOne = await prisma.question.upsert({
    where: { cortexIdNum: 900001 },
    update: {
      statement:
        'Os direitos e garantias fundamentais previstos na Constituição Federal possuem aplicação imediata, salvo disposição expressa em contrário.',
      officialAnswer: 'C',
      boardId: board.id,
      subjectId: constitutionalLaw.id,
      topicId: constitutionalTopic.id,
      contentText:
        'Os direitos e garantias fundamentais previstos na Constituição Federal possuem aplicação imediata, salvo disposição expressa em contrário.',
      contentHash: 'seed-question-900001',
      importBatch: 'seed-sprint-0',
    },
    create: {
      cortexIdNum: 900001,
      cortexId: 'CORTEX-SEED-900001',
      statement:
        'Os direitos e garantias fundamentais previstos na Constituição Federal possuem aplicação imediata, salvo disposição expressa em contrário.',
      officialAnswer: 'C',
      difficulty: 'media',
      difficultyNum: 2,
      type: 'multiple_choice',
      year: 2026,
      exam: 'Sprint 0 Seed',
      contentText:
        'Os direitos e garantias fundamentais previstos na Constituição Federal possuem aplicação imediata, salvo disposição expressa em contrário.',
      contentHash: 'seed-question-900001',
      importBatch: 'seed-sprint-0',
      boardId: board.id,
      subjectId: constitutionalLaw.id,
      topicId: constitutionalTopic.id,
    },
  });

  await upsertOptions(questionOne.id, [
    {
      letter: 'A',
      text: 'Errado, pois dependem sempre de lei complementar para produzir efeitos.',
      isCorrect: false,
      displayOrder: 0,
    },
    {
      letter: 'B',
      text: 'Errado, pois só se aplicam após regulamentação do Congresso Nacional.',
      isCorrect: false,
      displayOrder: 1,
    },
    {
      letter: 'C',
      text: 'Certo, porque a Constituição determina a aplicação imediata dessas normas.',
      isCorrect: true,
      displayOrder: 2,
    },
    {
      letter: 'D',
      text: 'Errado, pois valem apenas para cidadãos brasileiros natos.',
      isCorrect: false,
      displayOrder: 3,
    },
  ]);

  const questionTwo = await prisma.question.upsert({
    where: { cortexIdNum: 900002 },
    update: {
      statement:
        'A interpretação de texto exige considerar informações explícitas e implícitas do enunciado para identificar a ideia central.',
      officialAnswer: 'A',
      boardId: board.id,
      subjectId: portuguese.id,
      topicId: portugueseTopic.id,
      contentText:
        'A interpretação de texto exige considerar informações explícitas e implícitas do enunciado para identificar a ideia central.',
      contentHash: 'seed-question-900002',
      importBatch: 'seed-sprint-0',
    },
    create: {
      cortexIdNum: 900002,
      cortexId: 'CORTEX-SEED-900002',
      statement:
        'A interpretação de texto exige considerar informações explícitas e implícitas do enunciado para identificar a ideia central.',
      officialAnswer: 'A',
      difficulty: 'facil',
      difficultyNum: 1,
      type: 'multiple_choice',
      year: 2026,
      exam: 'Sprint 0 Seed',
      contentText:
        'A interpretação de texto exige considerar informações explícitas e implícitas do enunciado para identificar a ideia central.',
      contentHash: 'seed-question-900002',
      importBatch: 'seed-sprint-0',
      boardId: board.id,
      subjectId: portuguese.id,
      topicId: portugueseTopic.id,
    },
  });

  await upsertOptions(questionTwo.id, [
    {
      letter: 'A',
      text: 'Certo, porque interpretar um texto envolve sentidos literais e inferidos.',
      isCorrect: true,
      displayOrder: 0,
    },
    {
      letter: 'B',
      text: 'Errado, porque apenas informações implícitas importam na compreensão textual.',
      isCorrect: false,
      displayOrder: 1,
    },
    {
      letter: 'C',
      text: 'Errado, porque a ideia central depende somente do título do texto.',
      isCorrect: false,
      displayOrder: 2,
    },
    {
      letter: 'D',
      text: 'Errado, porque o contexto do enunciado não interfere na interpretação.',
      isCorrect: false,
      displayOrder: 3,
    },
  ]);

  process.stdout.write('Seed de desenvolvimento aplicado com sucesso.\n');
}

main()
  .catch((error) => {
    console.error('Falha ao executar seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
