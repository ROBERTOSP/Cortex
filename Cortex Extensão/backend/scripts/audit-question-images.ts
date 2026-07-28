import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { normalizeImportedQuestion } from '../src/questions/question-import.utils';

type Args = { dir: string; outDir: string };
function args(argv: string[]): Args {
  const result: Args = { dir: path.resolve(__dirname, '../../..', 'Cortex Scraper', 'crawler', 'exports'), outDir: path.resolve(__dirname, '..', 'reports') };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--dir' && argv[i + 1]) { result.dir = path.resolve(argv[++i]); }
    if (argv[i] === '--out-dir' && argv[i + 1]) { result.outDir = path.resolve(argv[++i]); }
  }
  return result;
}
function kind(value: string) { return /^https?:\/\//i.test(value) ? 'remote_url' : /^data:/i.test(value) ? 'data_url' : value.includes('/') || value.includes('\\') ? 'path' : 'other'; }
async function main() {
  const input = args(process.argv.slice(2));
  const files = fs.readdirSync(input.dir).filter((name) => /^gran_2010_2026_unique_\d+\.json$/i.test(name)).sort();
  const totals = { questions: 0, valid: 0, invalid: 0, questionsWithAnyImage: 0, statementImages: 0, itemImages: 0, associatedTextImages: 0, imageReferences: 0 };
  const unique = new Set<string>(); const formats = new Map<string, number>(); const examples: Array<{ cortexId: string; field: string; reference: string }> = [];
  for (const filename of files) {
    const parsed = JSON.parse(fs.readFileSync(path.join(input.dir, filename), 'utf8'));
    const rows: unknown[] = Array.isArray(parsed) ? parsed : parsed?.questions || [];
    for (const row of rows) {
      totals.questions += 1;
      try {
        const question = normalizeImportedQuestion(row as never); totals.valid += 1;
        const fields = [['statementImages', question.statementImages], ['itemImages', question.itemImages], ['associatedTextImages', question.associatedTextImages]] as const;
        const count = question.statementImages.length + question.itemImages.length + question.associatedTextImages.length;
        if (count) totals.questionsWithAnyImage += 1;
        totals.statementImages += question.statementImages.length; totals.itemImages += question.itemImages.length; totals.associatedTextImages += question.associatedTextImages.length; totals.imageReferences += count;
        for (const [field, refs] of fields) for (const reference of refs) {
          unique.add(reference); const label = kind(reference); formats.set(label, (formats.get(label) || 0) + 1);
          if (examples.length < 20) examples.push({ cortexId: question.cortexId, field, reference });
        }
      } catch { totals.invalid += 1; }
    }
    process.stdout.write(`[IMAGES] file=${filename} questions=${totals.questions} refs=${totals.imageReferences}\n`);
  }
  fs.mkdirSync(input.outDir, { recursive: true });
  const report = { generatedAt: new Date().toISOString(), totals: { ...totals, uniqueImageReferences: unique.size }, formats: Object.fromEntries([...formats.entries()].sort()), connection: 'Cada referência está ligada à questão pelo cortexId e pelo campo de imagem correspondente; nenhum arquivo de imagem foi baixado.', examples };
  const output = path.join(input.outDir, `question-image-audit-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(output, JSON.stringify(report, null, 2), 'utf8');
  process.stdout.write(`[SUCCESS] report=${output}\n`);
}
main().catch((error) => { console.error(error); process.exit(1); });
