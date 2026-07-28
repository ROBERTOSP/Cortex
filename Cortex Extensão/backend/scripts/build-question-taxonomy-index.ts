import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { normalizeImportedQuestion } from '../src/questions/question-import.utils';

type Args = { dir: string; outDir: string; maxQuestions: number };
type Labels = Map<string, number>;
type Index = Map<string, Labels>;

function parseArgs(argv: string[]): Args {
  const args: Args = {
    dir: path.resolve(__dirname, '../../..', 'Cortex Scraper', 'crawler', 'exports'),
    outDir: path.resolve(__dirname, '..', 'reports'),
    maxQuestions: 0,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i]; const value = argv[i + 1];
    if (key === '--dir' && value) { args.dir = path.resolve(value); i += 1; }
    else if (key === '--out-dir' && value) { args.outDir = path.resolve(value); i += 1; }
    else if (key === '--max-questions' && value) { args.maxQuestions = Number(value) || 0; i += 1; }
  }
  return args;
}

function canonical(value: string | null | undefined) {
  return (value || '[não informado]')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

function add(index: Index, key: string, label: string | null | undefined) {
  const labels = index.get(key) || new Map<string, number>();
  const raw = (label || '[não informado]').trim() || '[não informado]';
  labels.set(raw, (labels.get(raw) || 0) + 1);
  index.set(key, labels);
}

function serialize(index: Index) {
  return [...index.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
    .map(([key, labels]) => ({
      key,
      variants: [...labels.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))
        .map(([label, count]) => ({ label, count })),
    }));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const files = fs.readdirSync(args.dir)
    .filter((name) => /^gran_2010_2026_unique_\d+\.json$/i.test(name))
    .sort().map((name) => path.join(args.dir, name));
  if (!files.length) throw new Error('Nenhum arquivo de questões encontrado');

  const boards: Index = new Map(); const subjects: Index = new Map();
  const topics: Index = new Map(); const subtopics: Index = new Map();
  const provenanceFiles: Array<{ file: string; rows: number; valid: number; invalid: number }> = [];
  let processed = 0; let valid = 0; let invalid = 0;

  for (const file of files) {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    const rows: unknown[] = Array.isArray(parsed) ? parsed : parsed?.questions || [];
    let fileValid = 0; let fileInvalid = 0;
    for (const row of rows) {
      if (args.maxQuestions && processed >= args.maxQuestions) break;
      processed += 1;
      try {
        const item = normalizeImportedQuestion(row as never);
        const boardKey = canonical(item.boardName);
        const subjectKey = canonical(item.subjectName);
        const topicKey = `${subjectKey}::${canonical(item.topicName)}`;
        const subtopicKey = `${topicKey}::${canonical(item.subtopicName)}`;
        add(boards, boardKey, item.boardName); add(subjects, subjectKey, item.subjectName);
        add(topics, topicKey, item.topicName); add(subtopics, subtopicKey, item.subtopicName);
        valid += 1; fileValid += 1;
      } catch { invalid += 1; fileInvalid += 1; }
    }
    provenanceFiles.push({ file: path.basename(file), rows: rows.length, valid: fileValid, invalid: fileInvalid });
    process.stdout.write(`[INDEX] file=${path.basename(file)} processed=${processed} valid=${valid} invalid=${invalid}\n`);
    if (args.maxQuestions && processed >= args.maxQuestions) break;
  }

  fs.mkdirSync(args.outDir, { recursive: true });
  const report = {
    generatedAt: new Date().toISOString(),
    sourceSystem: 'gran_scraper_export',
    sourceStatus: 'THIRD_PARTY_DATASET_PENDING_RIGHTS_REVIEW',
    totals: { processed, valid, invalid, boards: boards.size, subjects: subjects.size, topics: topics.size, subtopics: subtopics.size },
    provenanceFiles,
    taxonomy: { boards: serialize(boards), subjects: serialize(subjects), topics: serialize(topics), subtopics: serialize(subtopics) },
  };
  const out = path.join(args.outDir, `question-taxonomy-index-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(out, JSON.stringify(report, null, 2), 'utf8');
  process.stdout.write(`[SUCCESS] report=${out}\n`);
}

main().catch((error) => { console.error(error); process.exit(1); });
