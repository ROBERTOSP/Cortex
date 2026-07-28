import * as fs from 'fs';
import * as path from 'path';
import { normalizeImportedQuestion } from '../src/questions/question-import.utils';

type Board = { id: string; name: string; sources: string[] };
type Counter = Map<string, number>;
type Stats = { total: number; valid: number; invalid: number; years: Counter; subjects: Counter; topics: Counter; difficulties: number[] };
const add = (counter: Counter, value: string | null | undefined) => { const key = (value || '[não informado]').trim() || '[não informado]'; counter.set(key, (counter.get(key) || 0) + 1); };
const top = (counter: Counter, max = 12) => [...counter.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR')).slice(0, max);
const pct = (value: number, total: number) => total ? `${((value / total) * 100).toFixed(1)}%` : '0.0%';

async function main() {
  const root = path.resolve(__dirname, '../../..');
  const boards: Board[] = JSON.parse(fs.readFileSync(path.join(root, 'data', 'beta_boards.json'), 'utf8'));
  const bySource = new Map<string, Board>(); for (const board of boards) for (const source of board.sources) bySource.set(source, board);
  const stats = new Map<string, Stats>(); for (const board of boards) stats.set(board.id, { total: 0, valid: 0, invalid: 0, years: new Map(), subjects: new Map(), topics: new Map(), difficulties: [] });
  const dir = path.join(root, 'Cortex Scraper', 'crawler', 'exports');
  const files = fs.readdirSync(dir).filter((name) => /^gran_2010_2026_unique_\d+\.json$/i.test(name)).sort();
  for (const file of files) {
    const parsed = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')); const rows: unknown[] = Array.isArray(parsed) ? parsed : parsed?.questions || [];
    for (const raw of rows) {
      const source = (raw as { banca?: string }).banca?.trim(); const board = source ? bySource.get(source) : undefined; if (!board) continue;
      const current = stats.get(board.id)!; current.total += 1;
      try { const item = normalizeImportedQuestion(raw as never); current.valid += 1; add(current.years, item.year?.toString()); add(current.subjects, item.subjectName); add(current.topics, `${item.subjectName || '[não informado]'} › ${item.topicName || '[não informado]'} › ${item.subtopicName || '[não informado]'}`); if (item.difficultyNum != null && Number.isFinite(item.difficultyNum)) current.difficulties.push(item.difficultyNum); } catch { current.invalid += 1; }
    }
    process.stdout.write(`[BOARDS] file=${file}\n`);
  }
  const output = path.join(root, 'docs', 'bank-profiles'); fs.mkdirSync(output, { recursive: true });
  const summary: Array<Record<string, unknown>> = [];
  for (const board of boards) {
    const current = stats.get(board.id)!; const averageDifficulty = current.difficulties.length ? Number((current.difficulties.reduce((sum, value) => sum + value, 0) / current.difficulties.length).toFixed(2)) : null;
    const confidence = current.valid >= 10000 ? 'ALTA' : current.valid >= 2000 ? 'MÉDIA' : 'BAIXA'; const years = top(current.years, 8); const subjects = top(current.subjects, 10); const topics = top(current.topics, 15);
    const markdown = `# Perfil de Banca — ${board.name}\n\n## Evidência disponível\n\n- Questões encontradas: **${current.total.toLocaleString('pt-BR')}**\n- Questões válidas para análise: **${current.valid.toLocaleString('pt-BR')}**\n- Confiança estatística: **${confidence}**\n- Dificuldade média registrada: **${averageDifficulty ?? 'não informada'}**\n- Fonte operacional: dataset de terceiro restrito; este perfil não autoriza exibição das questões.\n\n## Disciplinas mais presentes\n\n${subjects.map(([name, count]) => `- ${name}: ${count.toLocaleString('pt-BR')} (${pct(count, current.valid)})`).join('\n')}\n\n## Tópicos/subtópicos mais recorrentes\n\n${topics.map(([name, count]) => `- ${name}: ${count.toLocaleString('pt-BR')} (${pct(count, current.valid)})`).join('\n')}\n\n## Recorte temporal disponível\n\n${years.map(([year, count]) => `- ${year}: ${count.toLocaleString('pt-BR')}`).join('\n')}\n\n## Como usar no Cortex\n\nUse este perfil para ponderar a prioridade de itens confirmados no edital e para criar especificações de treino autoral. Não gerar nem publicar enunciados derivados de uma questão específica da fonte.\n`;
    fs.writeFileSync(path.join(output, `${board.id}.md`), markdown, 'utf8'); summary.push({ id: board.id, name: board.name, validQuestions: current.valid, confidence, averageDifficulty, topSubjects: subjects.slice(0, 3).map(([name]) => name), topTopics: topics.slice(0, 5).map(([name]) => name) });
  }
  fs.writeFileSync(path.join(output, 'index.json'), JSON.stringify({ generatedAt: new Date().toISOString(), boards: summary }, null, 2), 'utf8');
}
main().catch((error) => { console.error(error); process.exit(1); });
