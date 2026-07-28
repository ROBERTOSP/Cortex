import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { normalizeImportedQuestion } from '../src/questions/question-import.utils';

type Args = { dir: string; outDir: string };
type Aggregate = { board: string; subject: string; topic: string; subtopic: string; year: number | null; questions: number; annulled: number; outdated: number; difficultyTotal: number; difficultyCount: number };
function parse(argv: string[]): Args { const result: Args = { dir: path.resolve(__dirname, '../../..', 'Cortex Scraper', 'crawler', 'exports'), outDir: path.resolve(__dirname, '..', 'reports') }; for (let i = 0; i < argv.length; i += 1) { if (argv[i] === '--dir' && argv[i + 1]) result.dir = path.resolve(argv[++i]); else if (argv[i] === '--out-dir' && argv[i + 1]) result.outDir = path.resolve(argv[++i]); } return result; }
function label(value: string | null | undefined) { return (value || '[não informado]').trim() || '[não informado]'; }
async function main() {
  const input = parse(process.argv.slice(2)); const files = fs.readdirSync(input.dir).filter((name) => /^gran_2010_2026_unique_\d+\.json$/i.test(name)).sort(); const rows = new Map<string, Aggregate>(); let processed = 0; let invalid = 0;
  for (const filename of files) {
    const parsed = JSON.parse(fs.readFileSync(path.join(input.dir, filename), 'utf8')); const source: unknown[] = Array.isArray(parsed) ? parsed : parsed?.questions || [];
    for (const raw of source) try {
      const item = normalizeImportedQuestion(raw as never); processed += 1;
      const board = label(item.boardName), subject = label(item.subjectName), topic = label(item.topicName), subtopic = label(item.subtopicName), year = item.year;
      const key = [board, subject, topic, subtopic, year ?? ''].join('\u001f'); const current = rows.get(key) || { board, subject, topic, subtopic, year, questions: 0, annulled: 0, outdated: 0, difficultyTotal: 0, difficultyCount: 0 };
      current.questions += 1; current.annulled += item.annulled ? 1 : 0; current.outdated += item.outdated ? 1 : 0; if (item.difficultyNum != null && Number.isFinite(item.difficultyNum)) { current.difficultyTotal += item.difficultyNum; current.difficultyCount += 1; } rows.set(key, current);
    } catch { invalid += 1; }
    process.stdout.write(`[PROFILE] file=${filename} valid=${processed} invalid=${invalid} aggregates=${rows.size}\n`);
  }
  fs.mkdirSync(input.outDir, { recursive: true });
  const aggregates = [...rows.values()].map((item) => ({ board: item.board, subject: item.subject, topic: item.topic, subtopic: item.subtopic, year: item.year, questionCount: item.questions, activeQuestionCount: item.questions - item.annulled - item.outdated, averageDifficulty: item.difficultyCount ? Number((item.difficultyTotal / item.difficultyCount).toFixed(2)) : null, confidence: item.questions >= 30 ? 'HIGH' : item.questions >= 10 ? 'MEDIUM' : 'LOW' })).sort((a, b) => b.questionCount - a.questionCount || a.board.localeCompare(b.board, 'pt-BR'));
  const output = path.join(input.outDir, `board-topic-profile-${new Date().toISOString().replace(/[:.]/g, '-')}.json`); fs.writeFileSync(output, JSON.stringify({ generatedAt: new Date().toISOString(), sourceStatus: 'THIRD_PARTY_DATASET_PENDING_RIGHTS_REVIEW', totals: { validQuestions: processed, invalidQuestions: invalid, aggregates: aggregates.length }, aggregates }, null, 2), 'utf8'); process.stdout.write(`[SUCCESS] report=${output}\n`);
}
main().catch((error) => { console.error(error); process.exit(1); });
