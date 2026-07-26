import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { buildContentHash, buildContentText, normalizeImportedQuestion } from '../src/questions/question-import.utils';

type AuditArgs = {
  dir: string;
  maxFiles: number;
  maxQuestions: number;
  include: RegExp;
  outDir: string;
};

type IssueBucket = {
  count: number;
  samples: Array<{
    file: string;
    index: number;
    cortexId: string | null;
    cortexIdNum: number | null;
    message: string;
  }>;
};

type DatasetStats = {
  files: number;
  rows: number;
  valid: number;
  invalid: number;
  uniqueIdNum: number;
  duplicateIdNum: number;
  issues: Record<string, IssueBucket>;
};

function parseArgs(argv: string[]): AuditArgs {
  const args: AuditArgs = {
    dir: path.resolve(__dirname, '../../..', 'Cortex Scraper', 'crawler', 'exports'),
    maxFiles: 0,
    maxQuestions: 0,
    include: /_unique_\d+\.json$/i,
    outDir: path.resolve(__dirname, '..', 'reports'),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    const next = argv[i + 1];
    if (current === '--dir' && next) {
      args.dir = path.resolve(next);
      i += 1;
    } else if (current === '--max-files' && next) {
      args.maxFiles = Number(next) || 0;
      i += 1;
    } else if (current === '--max-questions' && next) {
      args.maxQuestions = Number(next) || 0;
      i += 1;
    } else if (current === '--include' && next) {
      args.include = new RegExp(next, 'i');
      i += 1;
    } else if (current === '--out-dir' && next) {
      args.outDir = path.resolve(next);
      i += 1;
    }
  }

  return args;
}

function ensureBucket(map: Record<string, IssueBucket>, key: string): IssueBucket {
  map[key] ??= { count: 0, samples: [] };
  return map[key];
}

function addIssue(
  issues: Record<string, IssueBucket>,
  key: string,
  sample: IssueBucket['samples'][number]
) {
  const bucket = ensureBucket(issues, key);
  bucket.count += 1;
  if (bucket.samples.length < 25) {
    bucket.samples.push(sample);
  }
}

function toDatasetKey(filename: string) {
  const base = path.basename(filename);
  const idx = base.indexOf('_unique_');
  if (idx >= 0) {
    return base.slice(0, idx);
  }
  return base.replace(/\.json$/i, '');
}

class BitsetCounter {
  private bytes: Uint8Array;
  private uniqueCount: number;
  private dupCount: number;

  constructor(initialMax = 1024) {
    const byteLen = Math.max(1, Math.ceil((initialMax + 1) / 8));
    this.bytes = new Uint8Array(byteLen);
    this.uniqueCount = 0;
    this.dupCount = 0;
  }

  get unique() {
    return this.uniqueCount;
  }

  get duplicates() {
    return this.dupCount;
  }

  has(idNum: number) {
    if (!Number.isInteger(idNum) || idNum < 0) {
      return false;
    }
    const byteIndex = idNum >> 3;
    if (byteIndex >= this.bytes.length) {
      return false;
    }
    const mask = 1 << (idNum & 7);
    return (this.bytes[byteIndex] & mask) !== 0;
  }

  add(idNum: number) {
    if (!Number.isInteger(idNum) || idNum < 0) {
      return { added: false, duplicated: false };
    }
    const byteIndex = idNum >> 3;
    if (byteIndex >= this.bytes.length) {
      const next = new Uint8Array(Math.max(byteIndex + 1, Math.ceil(this.bytes.length * 1.5)));
      next.set(this.bytes);
      this.bytes = next;
    }
    const mask = 1 << (idNum & 7);
    const already = (this.bytes[byteIndex] & mask) !== 0;
    if (already) {
      this.dupCount += 1;
      return { added: false, duplicated: true };
    }
    this.bytes[byteIndex] |= mask;
    this.uniqueCount += 1;
    return { added: true, duplicated: false };
  }
}

function normalizeIssueKey(message: string) {
  if (!message) {
    return 'unknown_error';
  }
  const msg = String(message);
  if (msg.includes('sem enunciado')) return 'missing_statement';
  if (msg.includes('cortex_id_num')) return 'missing_cortex_id_num';
  if (msg.includes('cortex_id')) return 'missing_cortex_id';
  if (msg.includes('gabarito inconsistente')) return 'official_answer_inconsistent';
  return 'normalize_error';
}

function isLikelyUrl(value: string) {
  return /^https?:\/\//i.test(value) || /^data:/i.test(value);
}

function auditNormalized(
  normalized: ReturnType<typeof normalizeImportedQuestion>,
  issues: Record<string, IssueBucket>,
  sample: IssueBucket['samples'][number]
) {
  if (normalized.statement.length < 8) {
    addIssue(issues, 'statement_too_short', { ...sample, message: 'Enunciado muito curto' });
  }

  if (normalized.year != null) {
    const maxYear = new Date().getFullYear() + 1;
    if (normalized.year < 1900 || normalized.year > maxYear) {
      addIssue(issues, 'year_out_of_range', { ...sample, message: `Ano fora do intervalo: ${normalized.year}` });
    }
  }

  if (normalized.difficultyNum != null) {
    const value = normalized.difficultyNum;
    if (!Number.isFinite(value) || value < 0 || value > 10) {
      addIssue(issues, 'difficulty_num_out_of_range', { ...sample, message: `difficulty_num fora do intervalo: ${value}` });
    }
  }

  if (normalized.options.length > 0) {
    const letters = normalized.options.map((opt) => opt.letter);
    const emptyLetters = letters.filter((letter) => !letter);
    if (emptyLetters.length > 0) {
      addIssue(issues, 'option_missing_letter', { ...sample, message: 'Alternativa sem letra' });
    }

    const uniqueLetters = new Set(letters);
    if (uniqueLetters.size !== letters.length) {
      addIssue(issues, 'option_duplicate_letter', { ...sample, message: 'Alternativas com letras duplicadas' });
    }

    const emptyTexts = normalized.options.filter((opt) => !opt.text);
    if (emptyTexts.length > 0) {
      addIssue(issues, 'option_missing_text', { ...sample, message: 'Alternativa sem texto' });
    }
  }

  if (normalized.officialAnswer) {
    const answer = normalized.officialAnswer;
    if (!/^[A-Z]$/.test(answer)) {
      addIssue(issues, 'official_answer_invalid_format', { ...sample, message: `Formato de gabarito invalido: ${answer}` });
    } else if (normalized.options.length > 0) {
      const hasOption = normalized.options.some((opt) => opt.letter === answer);
      if (!hasOption) {
        addIssue(issues, 'official_answer_not_in_options', { ...sample, message: `Gabarito ${answer} nao esta nas alternativas` });
      }
    }
  }

  if (normalized.options.length > 0 && normalized.officialAnswer && !normalized.annulled) {
    const correctCount = normalized.options.filter((opt) => opt.isCorrect).length;
    if (correctCount !== 1) {
      addIssue(issues, 'correct_option_count_invalid', { ...sample, message: `Quantidade de corretas diferente de 1: ${correctCount}` });
    }
  }

  const expectedText = buildContentText(normalized);
  if (expectedText !== normalized.contentText) {
    addIssue(issues, 'content_text_mismatch', { ...sample, message: 'contentText divergente do recalculo' });
  }

  const expectedHash = buildContentHash(normalized);
  if (expectedHash !== normalized.contentHash) {
    addIssue(issues, 'content_hash_mismatch', { ...sample, message: 'contentHash divergente do recalculo' });
  }

  const allImages = [
    ...normalized.statementImages.map((value) => ({ where: 'statementImages', value })),
    ...normalized.itemImages.map((value) => ({ where: 'itemImages', value })),
    ...normalized.associatedTextImages.map((value) => ({ where: 'associatedTextImages', value })),
  ];

  for (const image of allImages) {
    if (!image.value || image.value === 'undefined' || image.value === 'null') {
      addIssue(issues, 'image_invalid_value', { ...sample, message: `Imagem invalida em ${image.where}` });
      break;
    }
    if (!isLikelyUrl(image.value) && !image.value.includes('\\') && !image.value.includes('/')) {
      addIssue(issues, 'image_unexpected_format', { ...sample, message: `Imagem com formato inesperado em ${image.where}` });
      break;
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const files = fs
    .readdirSync(args.dir)
    .filter((entry) => args.include.test(entry))
    .sort()
    .slice(0, args.maxFiles > 0 ? args.maxFiles : undefined)
    .map((entry) => path.join(args.dir, entry));

  if (files.length === 0) {
    throw new Error(`Nenhum arquivo encontrado em ${args.dir} com include=${args.include.source}`);
  }

  fs.mkdirSync(args.outDir, { recursive: true });

  const startedAt = new Date();

  const datasetStats = new Map<string, DatasetStats>();
  const datasetBitsets = new Map<string, BitsetCounter>();
  const globalBitset = new BitsetCounter(2_800_000);

  let processed = 0;
  let valid = 0;
  let invalid = 0;
  let duplicateAcrossDatasets = 0;

  function ensureDataset(key: string) {
    if (!datasetStats.has(key)) {
      datasetStats.set(key, {
        files: 0,
        rows: 0,
        valid: 0,
        invalid: 0,
        uniqueIdNum: 0,
        duplicateIdNum: 0,
        issues: {},
      });
    }
    if (!datasetBitsets.has(key)) {
      datasetBitsets.set(key, new BitsetCounter(2_800_000));
    }
    return {
      stats: datasetStats.get(key)!,
      bitset: datasetBitsets.get(key)!,
    };
  }

  for (const filePath of files) {
    const datasetKey = toDatasetKey(filePath);
    const { stats, bitset } = ensureDataset(datasetKey);
    stats.files += 1;

    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    const rows: unknown[] = Array.isArray(parsed)
      ? parsed
      : parsed && Array.isArray((parsed as { questions?: unknown[] }).questions)
        ? (parsed as { questions: unknown[] }).questions
        : [];

    stats.rows += rows.length;

    for (let index = 0; index < rows.length; index += 1) {
      if (args.maxQuestions > 0 && processed >= args.maxQuestions) {
        break;
      }
      processed += 1;

      const row = rows[index] as Record<string, unknown> | null;
      const cortexId = row && typeof row.cortex_id === 'string' ? row.cortex_id : null;
      const cortexIdNumRaw = row && typeof row.cortex_id_num === 'number' ? row.cortex_id_num : null;
      const cortexIdNum = cortexIdNumRaw != null && Number.isInteger(cortexIdNumRaw) ? cortexIdNumRaw : null;

      const sample = {
        file: path.basename(filePath),
        index,
        cortexId,
        cortexIdNum,
        message: '',
      };

      if (cortexIdNum != null) {
        const within = bitset.add(cortexIdNum);
        if (within.duplicated) {
          stats.duplicateIdNum += 1;
          addIssue(stats.issues, 'duplicate_cortex_id_num_within_dataset', {
            ...sample,
            message: 'cortex_id_num duplicado dentro do dataset',
          });
        } else {
          stats.uniqueIdNum = bitset.unique;
        }

        const global = globalBitset.add(cortexIdNum);
        if (global.duplicated) {
          duplicateAcrossDatasets += 1;
        }
      } else {
        addIssue(stats.issues, 'missing_cortex_id_num_raw', {
          ...sample,
          message: 'cortex_id_num ausente ou invalido no raw',
        });
      }

      if (!cortexId) {
        addIssue(stats.issues, 'missing_cortex_id_raw', {
          ...sample,
          message: 'cortex_id ausente ou invalido no raw',
        });
      }

      let normalized: ReturnType<typeof normalizeImportedQuestion> | null = null;
      try {
        normalized = normalizeImportedQuestion(row as never);
      } catch (error) {
        invalid += 1;
        stats.invalid += 1;
        const message = error instanceof Error ? error.message : String(error);
        addIssue(stats.issues, normalizeIssueKey(message), { ...sample, message });
        continue;
      }

      valid += 1;
      stats.valid += 1;

      auditNormalized(normalized, stats.issues, sample);

      if (processed % 50_000 === 0) {
        process.stdout.write(
          `[AUDIT] processed=${processed} valid=${valid} invalid=${invalid} globalUnique=${globalBitset.unique}\n`
        );
      }
    }

    if (args.maxQuestions > 0 && processed >= args.maxQuestions) {
      break;
    }
  }

  const endedAt = new Date();
  const report = {
    meta: {
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      durationSeconds: Math.round((endedAt.getTime() - startedAt.getTime()) / 1000),
      args: {
        dir: args.dir,
        include: args.include.source,
        maxFiles: args.maxFiles,
        maxQuestions: args.maxQuestions,
        outDir: args.outDir,
      },
      filesScanned: files.map((file) => path.basename(file)),
    },
    totals: {
      processed,
      valid,
      invalid,
      globalUniqueCortexIdNum: globalBitset.unique,
      duplicateAcrossDatasetsByCortexIdNum: duplicateAcrossDatasets,
    },
    datasets: Object.fromEntries(datasetStats.entries()),
  };

  const filename = `question-audit-${startedAt.toISOString().replace(/[:.]/g, '-')}.json`;
  const outPath = path.join(args.outDir, filename);
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf-8');
  process.stdout.write(`[SUCCESS] report=${outPath}\n`);
}

main().catch((error) => {
  console.error('[ERROR]', error);
  process.exit(1);
});
