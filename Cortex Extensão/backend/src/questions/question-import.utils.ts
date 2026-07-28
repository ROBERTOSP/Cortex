import { createHash } from 'crypto';
import { resolveBoardAlias } from './taxonomy-aliases';

export type RawQuestionOption = {
  letra?: string;
  texto?: string;
  correta?: boolean;
};

export type RawQuestion = {
  cortex_id_num?: number;
  cortex_id?: string;
  enunciado?: string;
  alternativas?: RawQuestionOption[];
  gabarito_oficial?: string | null;
  dificuldade?: string | null;
  dificuldade_num?: number | null;
  tipo?: string | null;
  anulada?: boolean;
  desatualizada?: boolean;
  ano?: string | number | null;
  prova?: string | null;
  banca?: string | null;
  materia?: string | null;
  topico?: string | null;
  subtopico?: string | null;
  texto_associado?: string | null;
  imagens_enunciado?: string[];
  imagens_itens?: string[];
  imagens_texto_associado?: string[];
  carreiras?: unknown[];
  areas_concurso?: unknown[];
  cargos?: unknown[];
  orgaos?: unknown[];
};

export type NormalizedQuestionOption = {
  letter: string;
  text: string;
  isCorrect: boolean;
  displayOrder: number;
};

export type NormalizedQuestion = {
  cortexIdNum: number;
  cortexId: string;
  statement: string;
  associatedText: string | null;
  officialAnswer: string | null;
  difficulty: string | null;
  difficultyNum: number | null;
  type: string | null;
  annulled: boolean;
  outdated: boolean;
  year: number | null;
  exam: string | null;
  boardName: string | null;
  sourceBoardName: string | null;
  canonicalBoardId: string | null;
  subjectName: string | null;
  topicName: string | null;
  subtopicName: string | null;
  statementImages: string[];
  itemImages: string[];
  associatedTextImages: string[];
  rawJson: Record<string, unknown> | null;
  contentText: string;
  contentHash: string;
  options: NormalizedQuestionOption[];
};

function cleanText(value: unknown): string {
  if (value == null) {
    return '';
  }
  return String(value).trim().replace(/\s+/g, ' ');
}

function nullableText(value: unknown): string | null {
  const cleaned = cleanText(value);
  if (!cleaned || cleaned === 'N/A') {
    return null;
  }
  return cleaned;
}

function cleanStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }
  return values
    .map((item) => cleanText(item))
    .filter((item) => item.length > 0);
}

function normalizeOptions(options: RawQuestionOption[] | undefined, officialAnswer: string | null): NormalizedQuestionOption[] {
  if (!Array.isArray(options)) {
    return [];
  }

  return options
    .map((item, index) => ({
      letter: cleanText(item?.letra).toUpperCase(),
      text: cleanText(item?.texto),
      isCorrect: Boolean(item?.correta),
      displayOrder: index,
    }))
    .filter((item) => item.letter || item.text)
    .map((item) => ({
      ...item,
      isCorrect: officialAnswer ? item.letter === officialAnswer : item.isCorrect,
    }));
}

export function buildContentText(question: Pick<NormalizedQuestion, 'statement' | 'associatedText' | 'options'>): string {
  const parts = [question.statement];

  if (question.associatedText) {
    parts.push(question.associatedText);
  }

  for (const option of question.options) {
    parts.push(`${option.letter}. ${option.text}`.trim());
  }

  return parts.filter(Boolean).join('\n\n').trim();
}

export function buildContentHash(question: Pick<NormalizedQuestion, 'statement' | 'associatedText' | 'officialAnswer' | 'options'>): string {
  const normalizedPayload = JSON.stringify({
    statement: question.statement,
    associatedText: question.associatedText,
    officialAnswer: question.officialAnswer,
    options: question.options.map((option) => ({
      letter: option.letter,
      text: option.text,
      isCorrect: option.isCorrect,
    })),
  });

  return createHash('sha256').update(normalizedPayload).digest('hex');
}

export function normalizeImportedQuestion(raw: RawQuestion): NormalizedQuestion {
  const cortexIdNum = Number(raw.cortex_id_num);
  const cortexId = nullableText(raw.cortex_id);
  const statement = cleanText(raw.enunciado);
  const officialAnswer = nullableText(raw.gabarito_oficial)?.toUpperCase() ?? null;
  const associatedText = nullableText(raw.texto_associado);
  const options = normalizeOptions(raw.alternativas, officialAnswer);
  const yearValue = raw.ano == null || raw.ano === '' ? null : Number(raw.ano);
  const year = Number.isFinite(yearValue) ? yearValue : null;

  if (!Number.isInteger(cortexIdNum) || cortexIdNum <= 0) {
    throw new Error('Questao sem cortex_id_num valido');
  }

  if (!cortexId) {
    throw new Error('Questao sem cortex_id valido');
  }

  if (!statement) {
    throw new Error(`Questao ${cortexId} sem enunciado`);
  }

  const sourceBoardName = nullableText(raw.banca);
  const boardAlias = resolveBoardAlias(sourceBoardName);
  const normalized: NormalizedQuestion = {
    cortexIdNum,
    cortexId,
    statement,
    associatedText,
    officialAnswer,
    difficulty: nullableText(raw.dificuldade),
    difficultyNum: raw.dificuldade_num == null ? null : Number(raw.dificuldade_num),
    type: nullableText(raw.tipo),
    annulled: Boolean(raw.anulada),
    outdated: Boolean(raw.desatualizada),
    year,
    exam: nullableText(raw.prova),
    boardName: boardAlias.canonical?.name || sourceBoardName,
    sourceBoardName,
    canonicalBoardId: boardAlias.canonical?.id || null,
    subjectName: nullableText(raw.materia),
    topicName: nullableText(raw.topico),
    subtopicName: nullableText(raw.subtopico),
    statementImages: cleanStringArray(raw.imagens_enunciado),
    itemImages: cleanStringArray(raw.imagens_itens),
    associatedTextImages: cleanStringArray(raw.imagens_texto_associado),
    rawJson: null,
    contentText: '',
    contentHash: '',
    options,
  };

  const rawJson: Record<string, unknown> = {};
  for (const [key, value] of Object.entries({
    carreiras: raw.carreiras,
    areas_concurso: raw.areas_concurso,
    cargos: raw.cargos,
    orgaos: raw.orgaos,
  })) {
    if (Array.isArray(value) && value.length > 0) {
      rawJson[key] = value;
    }
  }
  if (sourceBoardName) {
    rawJson.source_taxonomy = {
      board_name: sourceBoardName,
      canonical_board_id: boardAlias.canonical?.id || null,
      canonical_board_name: boardAlias.canonical?.name || null,
    };
  }
  normalized.rawJson = Object.keys(rawJson).length > 0 ? rawJson : null;

  normalized.contentText = buildContentText(normalized);
  normalized.contentHash = buildContentHash(normalized);

  return normalized;
}
