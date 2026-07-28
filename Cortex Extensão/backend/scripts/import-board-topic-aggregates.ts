import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { normalizeTaxonomyKey, resolveBoardAlias } from '../src/questions/taxonomy-aliases';

type RawAggregate = {
  board: string;
  subject: string;
  topic: string;
  subtopic: string;
  year: number | null;
  questionCount: number;
  activeQuestionCount: number;
  averageDifficulty: number | null;
  confidence: string;
};

type ProfileFile = { generatedAt?: string; sourceStatus?: string; aggregates?: RawAggregate[] };
type Args = { file: string; batchSize: number; maxRecords: number; betaOnly: boolean; confirmFullImport: boolean };

function parseArgs(argv: string[]): Args {
  const args: Args = {
    file: path.resolve(__dirname, '..', 'reports', 'board-topic-profile-2026-07-28T11-35-14-852Z.json'),
    batchSize: 1_000,
    maxRecords: 0,
    betaOnly: true,
    confirmFullImport: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index]; const next = argv[index + 1];
    if (current === '--file' && next) { args.file = path.resolve(next); index += 1; }
    else if (current === '--batch-size' && next) { args.batchSize = Math.max(1, Number(next) || 1_000); index += 1; }
    else if (current === '--max-records' && next) { args.maxRecords = Math.max(0, Number(next) || 0); index += 1; }
    else if (current === '--all-boards') args.betaOnly = false;
    else if (current === '--confirm-full-import') args.confirmFullImport = true;
  }
  if (!args.confirmFullImport && args.maxRecords <= 0) {
    throw new Error('Informe --max-records para um piloto. A carga completa exige --confirm-full-import.');
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const profile = JSON.parse(fs.readFileSync(args.file, 'utf8')) as ProfileFile;
  if (!Array.isArray(profile.aggregates)) throw new Error('Arquivo de agregados inválido');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool), log: ['warn', 'error'] });
  const generatedAt = profile.generatedAt ? new Date(profile.generatedAt) : null;
  const sourceStatus = profile.sourceStatus || 'THIRD_PARTY_DATASET_PENDING_RIGHTS_REVIEW';
  const selected = profile.aggregates.filter((item) => !args.betaOnly || Boolean(resolveBoardAlias(item.board).canonical));
  const limited = args.maxRecords > 0 ? selected.slice(0, args.maxRecords) : selected;

  try {
    await prisma.$connect();
    let inserted = 0;
    for (let start = 0; start < limited.length; start += args.batchSize) {
      const batch = limited.slice(start, start + args.batchSize).map((item) => {
        const alias = resolveBoardAlias(item.board).canonical;
        return {
          boardName: item.board,
          boardCanonicalKey: alias?.id || normalizeTaxonomyKey(item.board),
          subjectName: item.subject,
          subjectCanonicalKey: normalizeTaxonomyKey(item.subject),
          topicName: item.topic,
          topicCanonicalKey: normalizeTaxonomyKey(item.topic),
          subtopicName: item.subtopic,
          subtopicCanonicalKey: normalizeTaxonomyKey(item.subtopic),
          year: item.year,
          yearKey: item.year == null ? 'unknown' : String(item.year),
          questionCount: item.questionCount,
          activeQuestionCount: item.activeQuestionCount,
          averageDifficulty: item.averageDifficulty,
          confidence: item.confidence,
          sourceStatus,
          sourceGeneratedAt: generatedAt,
        };
      });
      const result = await prisma.boardTopicAggregate.createMany({ data: batch, skipDuplicates: true });
      inserted += result.count;
      console.log(`[AGGREGATES] processed=${Math.min(start + batch.length, limited.length)} inserted=${inserted}`);
    }
    console.log(`[SUCCESS] selected=${selected.length} imported=${limited.length} inserted=${inserted} betaOnly=${args.betaOnly}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => { console.error('[ERROR]', error); process.exit(1); });
