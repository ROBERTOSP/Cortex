import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { normalizeImportedQuestion, type NormalizedQuestion } from '../src/questions/question-import.utils';

type ImportArgs = {
  dir: string;
  prefix: string;
  importBatch: string;
  maxFiles: number;
  maxQuestions: number;
};

function parseArgs(argv: string[]): ImportArgs {
  const args: ImportArgs = {
    dir: path.resolve(__dirname, '../../..', 'Cortex Scraper', 'crawler', 'exports'),
    prefix: 'gran_2010_2026_unique_',
    importBatch: new Date().toISOString(),
    maxFiles: 0,
    maxQuestions: 0,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    const next = argv[i + 1];
    if (current === '--dir' && next) {
      args.dir = path.resolve(next);
      i += 1;
    } else if (current === '--prefix' && next) {
      args.prefix = next;
      i += 1;
    } else if (current === '--import-batch' && next) {
      args.importBatch = next;
      i += 1;
    } else if (current === '--max-files' && next) {
      args.maxFiles = Number(next) || 0;
      i += 1;
    } else if (current === '--max-questions' && next) {
      args.maxQuestions = Number(next) || 0;
      i += 1;
    }
  }

  return args;
}

function loadChunk(filePath: string): unknown[] {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (parsed && Array.isArray(parsed.questions)) {
    return parsed.questions;
  }
  return [];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  const prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
    log: ['error', 'warn'],
  });

  const files = fs
    .readdirSync(args.dir)
    .filter((entry) => entry.startsWith(args.prefix) && entry.endsWith('.json'))
    .sort()
    .slice(0, args.maxFiles > 0 ? args.maxFiles : undefined)
    .map((entry) => path.join(args.dir, entry));

  const boardCache = new Map<string, string>();
  const subjectCache = new Map<string, string>();
  const topicCache = new Map<string, string>();
  const subtopicCache = new Map<string, string>();

  let processed = 0;
  let imported = 0;
  let warnings = 0;

  async function ensureBoard(name: string | null): Promise<string | null> {
    if (!name) return null;
    const cached = boardCache.get(name);
    if (cached) return cached;
    const board = await prisma.questionBoard.upsert({
      where: { name },
      update: {},
      create: { name },
      select: { id: true },
    });
    boardCache.set(name, board.id);
    return board.id;
  }

  async function ensureSubject(name: string | null): Promise<string | null> {
    if (!name) return null;
    const cached = subjectCache.get(name);
    if (cached) return cached;
    const subject = await prisma.questionSubject.upsert({
      where: { name },
      update: {},
      create: { name },
      select: { id: true },
    });
    subjectCache.set(name, subject.id);
    return subject.id;
  }

  async function ensureTopic(name: string | null, subjectId: string | null): Promise<string | null> {
    if (!name) return null;
    const cacheKey = `${subjectId ?? 'root'}::${name}`;
    const cached = topicCache.get(cacheKey);
    if (cached) return cached;
    const existing = await prisma.questionTopic.findFirst({
      where: {
        name,
        subjectId: subjectId ?? undefined,
      },
      select: { id: true },
    });
    const topic =
      existing ??
      (await prisma.questionTopic.create({
        data: {
          name,
          ...(subjectId ? { subjectId } : {}),
        },
        select: { id: true },
      }));
    topicCache.set(cacheKey, topic.id);
    return topic.id;
  }

  async function ensureSubtopic(name: string | null, topicId: string | null): Promise<string | null> {
    if (!name) return null;
    const cacheKey = `${topicId ?? 'root'}::${name}`;
    const cached = subtopicCache.get(cacheKey);
    if (cached) return cached;
    const existing = await prisma.questionSubtopic.findFirst({
      where: {
        name,
        topicId: topicId ?? undefined,
      },
      select: { id: true },
    });
    const subtopic =
      existing ??
      (await prisma.questionSubtopic.create({
        data: {
          name,
          ...(topicId ? { topicId } : {}),
        },
        select: { id: true },
      }));
    subtopicCache.set(cacheKey, subtopic.id);
    return subtopic.id;
  }

  async function importQuestion(question: NormalizedQuestion) {
    const boardId = await ensureBoard(question.boardName);
    const subjectId = await ensureSubject(question.subjectName);
    const topicId = await ensureTopic(question.topicName, subjectId);
    const subtopicId = await ensureSubtopic(question.subtopicName, topicId);
    const rawJsonValue = question.rawJson
      ? (question.rawJson as Prisma.InputJsonValue)
      : Prisma.DbNull;

    if (
      question.officialAnswer &&
      question.options.length > 0 &&
      !question.options.some((option) => option.letter === question.officialAnswer && option.isCorrect)
    ) {
      warnings += 1;
      throw new Error(`Questao ${question.cortexId} com gabarito inconsistente`);
    }

    await prisma.$transaction(async (tx) => {
      const saved = await tx.question.upsert({
        where: { cortexIdNum: question.cortexIdNum },
        update: {
          cortexId: question.cortexId,
          statement: question.statement,
          associatedText: question.associatedText,
          officialAnswer: question.officialAnswer,
          difficulty: question.difficulty,
          difficultyNum: question.difficultyNum,
          type: question.type,
          annulled: question.annulled,
          outdated: question.outdated,
          year: question.year,
          exam: question.exam,
          contentText: question.contentText,
          contentHash: question.contentHash,
          rawJson: rawJsonValue,
          statementImages: question.statementImages,
          itemImages: question.itemImages,
          associatedTextImages: question.associatedTextImages,
          importBatch: args.importBatch,
          boardId,
          subjectId,
          topicId,
          subtopicId,
        },
        create: {
          cortexIdNum: question.cortexIdNum,
          cortexId: question.cortexId,
          statement: question.statement,
          associatedText: question.associatedText,
          officialAnswer: question.officialAnswer,
          difficulty: question.difficulty,
          difficultyNum: question.difficultyNum,
          type: question.type,
          annulled: question.annulled,
          outdated: question.outdated,
          year: question.year,
          exam: question.exam,
          contentText: question.contentText,
          contentHash: question.contentHash,
          rawJson: rawJsonValue,
          statementImages: question.statementImages,
          itemImages: question.itemImages,
          associatedTextImages: question.associatedTextImages,
          importBatch: args.importBatch,
          boardId,
          subjectId,
          topicId,
          subtopicId,
        },
        select: { id: true },
      });

      await tx.questionOption.deleteMany({
        where: { questionId: saved.id },
      });

      if (question.options.length > 0) {
        await tx.questionOption.createMany({
          data: question.options.map((option) => ({
            questionId: saved.id,
            letter: option.letter,
            text: option.text,
            isCorrect: option.isCorrect,
            displayOrder: option.displayOrder,
          })),
        });
      }
    });
  }

  try {
    await prisma.$connect();

    for (const filePath of files) {
      const rows = loadChunk(filePath);
      console.log(`[INFO] importando ${path.basename(filePath)} rows=${rows.length}`);

      for (const row of rows) {
        processed += 1;
        const normalized = normalizeImportedQuestion(row as never);
        await importQuestion(normalized);
        imported += 1;

        if (args.maxQuestions > 0 && imported >= args.maxQuestions) {
          break;
        }

        if (imported % 1000 === 0) {
          console.log(`[INFO] imported=${imported} processed=${processed} warnings=${warnings}`);
        }
      }

      if (args.maxQuestions > 0 && imported >= args.maxQuestions) {
        break;
      }
    }

    console.log(`[SUCCESS] import_batch=${args.importBatch} imported=${imported} processed=${processed} warnings=${warnings}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('[ERROR]', error);
  process.exit(1);
});
