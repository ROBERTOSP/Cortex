import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { normalizeImportedQuestion } from '../src/questions/question-import.utils';

type Args = { dir: string; maxFiles: number; maxQuestions: number; outDir: string };
type Counter = Map<string, number>;

function parseArgs(argv: string[]): Args {
  const args: Args = {
    dir: path.resolve(__dirname, '../../..', 'Cortex Scraper', 'crawler', 'exports'),
    maxFiles: 0,
    maxQuestions: 0,
    outDir: path.resolve(__dirname, '..', 'reports'),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    const value = argv[index + 1];
    if (key === '--dir' && value) { args.dir = path.resolve(value); index += 1; }
    else if (key === '--max-files' && value) { args.maxFiles = Number(value) || 0; index += 1; }
    else if (key === '--max-questions' && value) { args.maxQuestions = Number(value) || 0; index += 1; }
    else if (key === '--out-dir' && value) { args.outDir = path.resolve(value); index += 1; }
  }
  return args;
}

function add(counter: Counter, value: unknown) {
  const normalized = String(value || '').trim() || '[não informado]';
  counter.set(normalized, (counter.get(normalized) || 0) + 1);
}

function labelFromMetadata(item: unknown): unknown {
  if (!item || typeof item !== 'object') return item;
  const source = item as Record<string, unknown>;
  return source.descricao || source.nome || source.sigla || JSON.stringify(source);
}

function addMany(counter: Counter, value: unknown) {
  if (!Array.isArray(value) || value.length === 0) { add(counter, null); return; }
  for (const item of value) add(counter, labelFromMetadata(item));
}

function serialize(counter: Counter, limit = 100) {
  return [...counter.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const files = fs.readdirSync(args.dir)
    .filter((name) => /^gran_2010_2026_unique_\d+\.json$/i.test(name))
    .sort()
    .slice(0, args.maxFiles || undefined)
    .map((name) => path.join(args.dir, name));
  if (!files.length) throw new Error('Nenhum arquivo de questões encontrado');

  const counters: Record<string, Counter> = {
    banca: new Map(), materia: new Map(), topico: new Map(), subtopico: new Map(),
    carreira: new Map(), cargo: new Map(), orgao: new Map(), ano: new Map(),
  };
  let processed = 0; let valid = 0; let invalid = 0;
  for (const file of files) {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    const rows: unknown[] = Array.isArray(parsed) ? parsed : parsed?.questions || [];
    for (const row of rows) {
      if (args.maxQuestions && processed >= args.maxQuestions) break;
      processed += 1;
      try {
        const question = normalizeImportedQuestion(row as never);
        valid += 1;
        add(counters.banca, question.boardName); add(counters.materia, question.subjectName);
        add(counters.topico, question.topicName); add(counters.subtopico, question.subtopicName); add(counters.ano, question.year);
        const raw = row as Record<string, unknown>;
        addMany(counters.carreira, raw.carreiras); addMany(counters.cargo, raw.cargos); addMany(counters.orgao, raw.orgaos);
      } catch { invalid += 1; }
    }
    if (args.maxQuestions && processed >= args.maxQuestions) break;
    process.stdout.write(`[PROFILE] processed=${processed} valid=${valid} invalid=${invalid}\n`);
  }
  fs.mkdirSync(args.outDir, { recursive: true });
  const report = {
    generatedAt: new Date().toISOString(), processed, valid, invalid,
    files: files.map((file) => path.basename(file)),
    distinct: Object.fromEntries(Object.entries(counters).map(([key, value]) => [key, value.size])),
    topValues: Object.fromEntries(Object.entries(counters).map(([key, value]) => [key, serialize(value)])),
  };
  const out = path.join(args.outDir, `question-taxonomy-profile-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(out, JSON.stringify(report, null, 2), 'utf8');
  process.stdout.write(`[SUCCESS] report=${out}\n`);
}

main().catch((error) => { console.error(error); process.exit(1); });
