import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';
import { DatabaseService } from '../database/database.service';
import { AiService, type EditalExtraction } from '../ai/ai.service';
import { normalizeTaxonomyKey, resolveBoardAlias } from '../questions/taxonomy-aliases';

type StructuredSubject = {
  name: string;
  topics: Array<{
    name: string;
    subtopics: string[];
  }>;
};

type EditalSource = 'CATALOG' | 'TEXT' | 'PDF' | 'LINK';

type CatalogContest = {
  id: string;
  name: string;
  board: string;
  targetJob: string;
  examDate: string;
  description: string;
  subjects: StructuredSubject[];
};

const CONTEST_CATALOG: CatalogContest[] = [
  {
    id: 'pf-agente-administrativo',
    name: 'Policia Federal',
    board: 'Cebraspe',
    targetJob: 'Agente Administrativo',
    examDate: '2026-11-15',
    description: 'Base inicial para estudos administrativos com foco em rotina, revisao e questoes.',
    subjects: [
      {
        name: 'Língua Portuguesa',
        topics: [
          { name: 'Interpretação de Texto', subtopics: ['Tipologia textual', 'Inferência'] },
          { name: 'Gramática', subtopics: ['Concordância', 'Regência', 'Pontuação'] },
        ],
      },
      {
        name: 'Direito Administrativo',
        topics: [
          { name: 'Atos Administrativos', subtopics: ['Elementos', 'Atributos'] },
          { name: 'Poderes Administrativos', subtopics: ['Poder disciplinar', 'Poder regulamentar'] },
        ],
      },
      {
        name: 'Administração Pública',
        topics: [
          { name: 'Gestão de Processos', subtopics: ['Mapeamento', 'Melhoria contínua'] },
          { name: 'Atendimento ao Público', subtopics: ['Comunicação', 'Produtividade'] },
        ],
      },
    ],
  },
  {
    id: 'tjsp-escrevente',
    name: 'TJSP',
    board: 'Vunesp',
    targetJob: 'Escrevente Técnico Judiciário',
    examDate: '2026-09-20',
    description: 'Estrutura inicial voltada para alto volume de leitura, revisão e legislação.',
    subjects: [
      {
        name: 'Português',
        topics: [
          { name: 'Compreensão e Interpretação', subtopics: ['Ideia central', 'Coesão textual'] },
          { name: 'Ortografia e Crase', subtopics: ['Acentuação', 'Uso da crase'] },
        ],
      },
      {
        name: 'Direito Processual Civil',
        topics: [
          { name: 'Atos Processuais', subtopics: ['Prazos', 'Comunicação dos atos'] },
          { name: 'Procedimento Comum', subtopics: ['Petição inicial', 'Audiência'] },
        ],
      },
      {
        name: 'Direito Penal',
        topics: [
          { name: 'Parte Geral', subtopics: ['Aplicação da lei penal', 'Concurso de pessoas'] },
          { name: 'Crimes contra a Administração', subtopics: ['Peculato', 'Concussão'] },
        ],
      },
    ],
  },
  {
    id: 'inss-tecnico',
    name: 'INSS',
    board: 'Cebraspe',
    targetJob: 'Técnico do Seguro Social',
    examDate: '2026-10-25',
    description: 'Modelo inicial para rotina de médio prazo com foco em seguridade e atendimento.',
    subjects: [
      {
        name: 'Direito Previdenciário',
        topics: [
          { name: 'Segurados e Dependentes', subtopics: ['Filiação', 'Inscrição'] },
          { name: 'Benefícios', subtopics: ['Aposentadorias', 'Auxílios'] },
        ],
      },
      {
        name: 'Raciocínio Lógico',
        topics: [
          { name: 'Proposições', subtopics: ['Conectivos', 'Tabelas-verdade'] },
          { name: 'Argumentação', subtopics: ['Equivalências', 'Negação'] },
        ],
      },
      {
        name: 'Ética no Serviço Público',
        topics: [
          { name: 'Conduta do Servidor', subtopics: ['Deveres', 'Vedações'] },
          { name: 'Transparência', subtopics: ['Atendimento', 'Responsabilidade'] },
        ],
      },
    ],
  },
];

@Injectable()
export class ContestsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly ai: AiService,
  ) {}

  listCatalog() {
    return CONTEST_CATALOG;
  }

  async listPublishedCatalog() {
    return this.database.sharedEdital.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, title: true, board: true, examDate: true, extraction: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async listAdminEditals() {
    return this.database.sharedEdital.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async createAdminEdital(data: { title: string; board?: string; examDate?: string }) {
    return this.database.sharedEdital.create({ data: { title: data.title.trim(), board: data.board?.trim() || null, examDate: data.examDate ? new Date(data.examDate) : null } });
  }

  async getUserRole(userId: string) {
    const user = await this.database.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async assertAdmin(userId: string) {
    if (!userId || (await this.getUserRole(userId)).role !== 'ADMIN') {
      throw new BadRequestException('Acesso administrativo necessário');
    }
  }

  async analyzeSharedEdital(file: Express.Multer.File, userId: string) {
    await this.assertAdmin(userId);
    if (!file) throw new BadRequestException('Selecione um PDF');
    if (file.size > 20 * 1024 * 1024) throw new BadRequestException('O PDF deve ter no máximo 20 MB');

    try {
      const parser = new PDFParse({ data: file.buffer });
      const parsed = await parser.getText();
      await parser.destroy();
      const sourceText = parsed.text?.trim();
      if (!sourceText || sourceText.length < 500) {
        throw new BadRequestException('Não foi possível extrair texto suficiente deste PDF');
      }
      const extraction = await this.ai.extractEditalDetails(sourceText);
      const title = extraction.organization?.trim() || file.originalname.replace(/\.pdf$/i, '');
      const board = extraction.board?.trim() || null;
      const examDate = extraction.examDate && !Number.isNaN(new Date(extraction.examDate).getTime())
        ? new Date(extraction.examDate)
        : null;
      return this.database.sharedEdital.create({
        data: {
          title,
          board,
          examDate,
          status: 'REVIEW',
          extraction: extraction as object,
          sourceText,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Erro ao analisar edital compartilhado:', error);
      throw new BadRequestException('Não foi possível analisar este edital');
    }
  }

  async getAdminEdital(editalId: string) {
    const edital = await this.database.sharedEdital.findUnique({ where: { id: editalId } });
    if (!edital) throw new NotFoundException('Edital não encontrado');
    return edital;
  }

  async updateAdminEdital(editalId: string, body: Record<string, unknown>) {
    await this.getAdminEdital(editalId);
    const data: Record<string, unknown> = {};
    if (typeof body.title === 'string' && body.title.trim()) data.title = body.title.trim();
    if (typeof body.board === 'string') data.board = body.board.trim() || null;
    if (typeof body.examDate === 'string') {
      const parsed = body.examDate ? new Date(body.examDate) : null;
      if (parsed && Number.isNaN(parsed.getTime())) throw new BadRequestException('Data da prova inválida');
      data.examDate = parsed;
    }
    if (body.extraction && typeof body.extraction === 'object') data.extraction = body.extraction;
    return this.database.sharedEdital.update({ where: { id: editalId }, data });
  }

  async setAdminEditalStatus(editalId: string, status: 'PUBLISHED' | 'ARCHIVED') {
    const edital = await this.getAdminEdital(editalId);
    if (status === 'PUBLISHED') {
      const extraction = edital.extraction as unknown as EditalExtraction | null;
      if (!extraction?.jobs?.length) {
        throw new BadRequestException('Revise o edital: é necessário ter ao menos um cargo antes de publicar');
      }
    }
    return this.database.sharedEdital.update({ where: { id: editalId }, data: { status } });
  }

  async findAllForUser(userId: string) {
    return this.database.contest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        nodes: {
          include: {
            children: {
              include: {
                children: true,
              },
            },
          },
        },
      },
    });
  }

  async createForUser(
    userId: string,
    data: {
      name?: string;
      targetJob?: string;
      board?: string;
      examDate?: string;
      templateId?: string;
      editalText?: string;
      editalSource?: EditalSource;
      editalSourceUrl?: string;
      extraction?: EditalExtraction;
    },
  ) {
    const name = (data.name || '').trim();
    const targetJob = (data.targetJob || '').trim();
    const board = (data.board || '').trim();
    const editalText = (data.editalText || '').trim();

    if (!targetJob && !editalText && !data.templateId) {
      throw new BadRequestException('Cargo pretendido é obrigatório');
    }

    const sharedTemplate = data.templateId
      ? await this.database.sharedEdital.findFirst({
          where: { id: data.templateId, status: 'PUBLISHED' },
        })
      : null;
    if (data.templateId && !sharedTemplate) {
      throw new NotFoundException('Edital não encontrado no catálogo publicado');
    }
    const templateExtraction = sharedTemplate?.extraction as unknown as EditalExtraction | null;

    const extraction = data.extraction || templateExtraction || (editalText ? await this.ai.extractEditalDetails(editalText) : null);
    const structure = { subjects: [] as StructuredSubject[] };

    const resolvedName = name || sharedTemplate?.title || 'Plano Personalizado';
    const resolvedBoard = board || extraction?.board || sharedTemplate?.board || 'Banca não informada';
    const resolvedExamDate = data.examDate || extraction?.examDate || sharedTemplate?.examDate?.toISOString() || null;

    const source = data.editalSource || (editalText ? 'TEXT' : sharedTemplate ? 'CATALOG' : undefined);
    const needsReview = Boolean(extraction?.jobs?.length) && !targetJob;
    const contest = await this.database.contest.create({
      data: {
        userId,
        name: resolvedName,
        targetJob: targetJob || 'Cargo a selecionar',
        board: resolvedBoard,
        examDate: resolvedExamDate ? new Date(resolvedExamDate) : null,
        status: needsReview ? 'DRAFT' : 'ACTIVE',
        editalSource: source,
        editalSourceUrl: data.editalSourceUrl || null,
        editalDraft: needsReview && extraction ? extraction : undefined,
        editalExtractedAt: needsReview ? new Date() : null,
        editalConfirmedAt: needsReview ? null : new Date(),
      },
    });

    if (!needsReview) {
      await this.createKnowledgeTree(contest.id, structure.subjects || []);
    }
    if (needsReview && extraction) {
      await this.database.editalVersion.create({ data: { contestId: contest.id, sequence: 1, sourceType: source || 'PDF', sourceUrl: data.editalSourceUrl || null, sourceText: editalText || null, extraction } });
    }

    return this.findOneForUser(userId, contest.id);
  }

  async parseAndCreateFromEdital(
    file: Express.Multer.File,
    userId: string,
    meta?: { name?: string; targetJob?: string; board?: string; examDate?: string; sourceUrl?: string },
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado');
    }

    try {
      const parser = new PDFParse({ data: file.buffer });
      const data = await parser.getText();
      await parser.destroy();
      const text = data.text;

      return this.createForUser(userId, {
        name: meta?.name,
        targetJob: meta?.targetJob,
        board: meta?.board,
        examDate: meta?.examDate,
        editalText: text,
        editalSource: meta?.sourceUrl ? 'LINK' : 'PDF',
        editalSourceUrl: meta?.sourceUrl,
      });
    } catch (error) {
      console.error('Erro ao processar edital:', error);
      if (error instanceof HttpException) throw error;
      throw new BadRequestException('Falha ao processar o edital');
    }
  }

  private selectRelevantEditalText(pages: Array<{ text?: string }> | undefined, fallback: string) {
    if (!Array.isArray(pages) || pages.length === 0) return fallback;
    const normalized = pages.map((page) => page.text || '');
    const signals = [
      /ANEXO|CONTE[ÚU]DO\s+PROGRAM|CONHECIMENTOS\s+ESPEC[IÍ]FICOS|DISCIPLINA|MAT[ÉE]RIA/i,
      /CARGO|EMPREGO|FUN[CÇ][AÃ]O|PERFIL|VAGAS|LOCALIDADE/i,
      /PROVA|QUEST[ÕO]ES|PESO|PONTUA[CÇ][AÃ]O|DURA[CÇ][AÃ]O/i,
      /REQUISITO|ESCOLARIDADE|FORMA[CÇ][AÃ]O|GRADUA[CÇ][AÃ]O|PCD|DEFICI[ÊE]NCIA|COTA/i,
      /CRONOGRAMA|INSCRI[CÇ][AÃ]O|DATA|RESULTADO|RECURSO/i,
    ];
    const ranked = normalized
      .map((page, index) => {
        const score = signals.reduce((total, signal) => total + (signal.test(page) ? 1 : 0), 0);
        const profileSection = /CARGO.{0,160}PERFIL|PERFIL\s*\d+|REQUISITOS\s*:/is.test(page);
        return { index, score: score + (profileSection ? 8 : 0), profileSection };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index);
    if (ranked.length < 2) return fallback;
    const selected = new Set<number>();
    ranked.slice(0, 20).forEach(({ index }) => {
      for (let page = Math.max(0, index - 1); page <= Math.min(normalized.length - 1, index + 2); page += 1) selected.add(page);
    });
    const profileIndexes = new Set(ranked.filter((item) => item.profileSection).map((item) => item.index));
    const text = [
      ...[...profileIndexes].sort((a, b) => a - b).map((index) => normalized[index]),
      ...[...selected].sort((a, b) => a - b).filter((index) => !profileIndexes.has(index)).map((index) => normalized[index]),
    ].join('\n\n');
    return text.length >= 4000 ? text.slice(0, 60000) : fallback;
  }

  async parseAndCreateFromEditalLink(
    url: string | undefined,
    userId: string,
    meta?: { name?: string; targetJob?: string; board?: string; examDate?: string; sourceUrl?: string },
  ) {
    const source = (url || '').trim();
    if (!source) {
      throw new BadRequestException('Informe o link direto do PDF do edital');
    }

    let parsed: URL;
    try {
      parsed = new URL(source);
    } catch {
      throw new BadRequestException('Informe um link vÃ¡lido');
    }

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new BadRequestException('O link deve usar http ou https');
    }
    if (this.isPrivateHost(parsed.hostname)) {
      throw new BadRequestException('O link informado nÃ£o Ã© permitido');
    }

    try {
      const response = await fetch(parsed, {
        redirect: 'error',
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const bytes = Buffer.from(await response.arrayBuffer());
      const isPdf = contentType.includes('pdf') || bytes.subarray(0, 4).toString() === '%PDF';
      if (!isPdf) {
        throw new BadRequestException('O link precisa apontar diretamente para um arquivo PDF');
      }
      if (bytes.length === 0 || bytes.length > 20 * 1024 * 1024) {
        throw new BadRequestException('O PDF deve ter no mÃ¡ximo 20 MB');
      }

      return this.parseAndCreateFromEdital(
        { buffer: bytes } as Express.Multer.File,
        userId,
        { ...meta, sourceUrl: source },
      );
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('NÃ£o foi possÃ­vel baixar ou processar este edital');
    }
  }

  async findOneForUser(userId: string, contestId: string) {
    const contest = await this.database.contest.findFirst({
      where: { id: contestId, userId },
      include: {
        nodes: {
          include: {
            children: {
              include: {
                children: true,
              },
            },
          },
        },
      },
    });

    if (!contest) {
      throw new NotFoundException('Concurso não encontrado');
    }

    return contest;
  }

  async getEditalReviewForUser(userId: string, contestId: string) {
    const contest = await this.database.contest.findFirst({
      where: { id: contestId, userId },
      select: {
        id: true, name: true, targetJob: true, board: true, examDate: true, status: true,
        editalSource: true, editalSourceUrl: true, editalDraft: true, editalExtractedAt: true,
      },
    });
    if (!contest) throw new NotFoundException('Concurso não encontrado');
    if (contest.status !== 'DRAFT') throw new BadRequestException('Este edital não está aguardando revisão');
    return contest;
  }

  async reanalyzeEditalForUser(userId: string, contestId: string) {
    const contest = await this.database.contest.findFirst({
      where: { id: contestId, userId },
      include: { editalVersions: { orderBy: { sequence: 'desc' }, take: 1 } },
    });
    if (!contest) throw new NotFoundException('Concurso não encontrado');
    const latest = contest.editalVersions[0];
    if (!latest?.sourceText) {
      throw new BadRequestException('A fonte deste edital não foi preservada. Envie o PDF uma última vez para habilitar novas análises sem reupload.');
    }
    const extraction = await this.ai.extractEditalDetails(latest.sourceText);
    const sequence = latest.sequence + 1;
    await this.database.$transaction([
      this.database.contest.update({
        where: { id: contestId },
        data: { status: 'DRAFT', editalDraft: extraction, editalExtractedAt: new Date(), editalConfirmedAt: null },
      }),
      this.database.editalVersion.create({
        data: {
          contestId,
          sequence,
          sourceType: latest.sourceType,
          sourceUrl: latest.sourceUrl,
          fileName: latest.fileName,
          contentHash: latest.contentHash,
          sourceText: latest.sourceText,
          extraction,
        },
      }),
    ]);
    return this.findOneForUser(userId, contestId);
  }

  async discardEditalDraftForUser(userId: string, contestId: string) {
    const contest = await this.database.contest.findFirst({
      where: { id: contestId, userId },
      select: { id: true, status: true },
    });
    if (!contest) throw new NotFoundException('Concurso não encontrado');
    if (contest.status !== 'DRAFT') throw new BadRequestException('Somente um edital em revisão pode ser substituído');

    // Conserva o registro para auditoria, mas impede que o onboarding restaure esta análise antiga.
    await this.database.contest.update({ where: { id: contestId }, data: { status: 'ARCHIVED' } });
    return { discarded: true };
  }

  async confirmEditalForUser(
    userId: string,
    contestId: string,
    data: { name?: string; targetJob?: string; selectedJob?: string; board?: string; examDate?: string; subjects?: unknown },
  ) {
    const contest = await this.database.contest.findFirst({ where: { id: contestId, userId } });
    if (!contest) throw new NotFoundException('Concurso não encontrado');
    if (contest.status !== 'DRAFT') throw new BadRequestException('Este edital não está aguardando confirmação');

    const selectedJob = (data.selectedJob || data.targetJob || contest.selectedJob || contest.targetJob).trim();
    const extractedJobs = this.readExtractedJobs(contest.editalDraft);
    const selectedExtraction = extractedJobs.find((job) => job.name === selectedJob);
    const draft = this.normalizeStructure(data.subjects ?? selectedExtraction?.subjects ?? contest.editalDraft);
    if (draft.subjects.length === 0) {
      throw new BadRequestException('Confirme ao menos uma disciplina antes de criar a rotina');
    }

    await this.database.knowledgeNode.deleteMany({ where: { contestId } });
    await this.createKnowledgeTree(contestId, draft.subjects);
    await this.resolveTaxonomyForContest(contestId, (data.board || contest.board).trim());
    await this.database.contest.update({
      where: { id: contestId },
      data: {
        name: (data.name || contest.name).trim(),
        targetJob: (data.targetJob || selectedJob || contest.targetJob).trim(),
        selectedJob,
        board: (data.board || contest.board).trim(),
        examDate: data.examDate ? new Date(data.examDate) : contest.examDate,
        status: 'ACTIVE',
        editalDraft: draft,
        editalConfirmedAt: new Date(),
      },
    });
    return this.findOneForUser(userId, contestId);
  }

  private readExtractedJobs(value: unknown): EditalExtraction['jobs'] {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
    const jobs = (value as { jobs?: unknown }).jobs;
    return Array.isArray(jobs) ? jobs as EditalExtraction['jobs'] : [];
  }

  private normalizeStructure(value: unknown): { subjects: StructuredSubject[] } {
    const source = value && typeof value === 'object' && !Array.isArray(value)
      ? (value as { subjects?: unknown }).subjects
      : value;
    if (!Array.isArray(source)) return { subjects: [] };
    return {
      subjects: source
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
        .map((subject) => ({
          name: String(subject.name || '').trim(),
          topics: Array.isArray(subject.topics)
            ? subject.topics
                .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
                .map((topic) => ({
                  name: String(topic.name || '').trim(),
                  subtopics: Array.isArray(topic.subtopics)
                    ? topic.subtopics.map((item) => String(item).trim()).filter(Boolean)
                    : [],
                }))
                .filter((topic) => topic.name)
            : [],
        }))
        .filter((subject) => subject.name),
    };
  }

  private async resolveTaxonomyForContest(contestId: string, boardName: string) {
    const nodes = await this.database.knowledgeNode.findMany({
      where: { contestId },
      select: { id: true, parentId: true, name: true, type: true },
      orderBy: { createdAt: 'asc' },
    });
    const matchedTaxonomyByNode = new Map<string, string>();

    for (const node of nodes) {
      const key = normalizeTaxonomyKey(node.name);
      const parentTaxonomyId = node.parentId ? matchedTaxonomyByNode.get(node.parentId) : undefined;
      let candidates: Array<{ id: string; name: string }> = [];
      if (node.type === 'SUBJECT') {
        candidates = await this.database.questionSubject.findMany({
          where: { OR: [{ canonicalKey: key }, { name: { equals: node.name, mode: 'insensitive' } }] },
          select: { id: true, name: true }, take: 3,
        });
      } else if (node.type === 'TOPIC' && parentTaxonomyId) {
        candidates = await this.database.questionTopic.findMany({
          where: { subjectId: parentTaxonomyId, OR: [{ canonicalKey: key }, { name: { equals: node.name, mode: 'insensitive' } }] },
          select: { id: true, name: true }, take: 3,
        });
      } else if (node.type === 'SUBTOPIC' && parentTaxonomyId) {
        candidates = await this.database.questionSubtopic.findMany({
          where: { topicId: parentTaxonomyId, OR: [{ canonicalKey: key }, { name: { equals: node.name, mode: 'insensitive' } }] },
          select: { id: true, name: true }, take: 3,
        });
      }

      const status = candidates.length === 1 ? 'MATCHED' : candidates.length > 1 ? 'AMBIGUOUS' : 'UNMATCHED';
      if (status === 'MATCHED') matchedTaxonomyByNode.set(node.id, candidates[0].id);
      await this.database.knowledgeNode.update({
        where: { id: node.id },
        data: {
          taxonomyStatus: status,
          taxonomyMatch: { canonicalKey: key, candidates },
          taxonomyMatchedAt: new Date(),
        },
      });
    }

    await this.calculateTopicPriorities(contestId, boardName, nodes);
  }

  private async calculateTopicPriorities(
    contestId: string,
    boardName: string,
    nodes: Array<{ id: string; parentId: string | null; name: string; type: string }>,
  ) {
    const board = resolveBoardAlias(boardName).canonical;
    const subjects = new Map(nodes.filter((node) => node.type === 'SUBJECT').map((node) => [node.id, node]));
    const topics = nodes.filter((node) => node.type === 'TOPIC' && node.parentId && subjects.has(node.parentId));
    const evidence = await Promise.all(topics.map(async (topic) => {
      const subject = subjects.get(topic.parentId as string)!;
      const stats = board ? await this.database.boardTopicAggregate.aggregate({
        where: { boardCanonicalKey: board.id, subjectCanonicalKey: normalizeTaxonomyKey(subject.name), topicCanonicalKey: normalizeTaxonomyKey(topic.name) },
        _sum: { questionCount: true, activeQuestionCount: true }, _max: { year: true }, _avg: { averageDifficulty: true },
      }) : null;
      return { topic, subject, count: stats?._sum.questionCount || 0, active: stats?._sum.activeQuestionCount || 0, recentYear: stats?._max.year || null, difficulty: stats?._avg.averageDifficulty || null };
    }));
    const maxCount = Math.max(1, ...evidence.map((item) => item.count));
    const now = new Date();
    for (const item of evidence) {
      const incidence = item.count / maxCount;
      const recency = item.recentYear ? Math.max(0, Math.min(1, 1 - (new Date().getFullYear() - item.recentYear) / 10)) : 0;
      const priority = item.count > 0 ? Math.round((incidence * 0.75 + recency * 0.25) * 100) : 0;
      await this.database.knowledgeNode.update({ where: { id: item.topic.id }, data: { strategicPriority: priority, priorityCalculatedAt: now, priorityEvidence: { board: board?.id || null, questionCount: item.count, activeQuestionCount: item.active, mostRecentYear: item.recentYear, averageDifficulty: item.difficulty, incidenceScore: Number(incidence.toFixed(4)), recencyScore: Number(recency.toFixed(4)) } } });
    }
    for (const subject of subjects.values()) {
      const values = evidence.filter((item) => item.subject.id === subject.id).map((item) => item.count > 0 ? Math.round(((item.count / maxCount) * 0.75 + (item.recentYear ? Math.max(0, Math.min(1, 1 - (new Date().getFullYear() - item.recentYear) / 10)) : 0) * 0.25) * 100) : 0);
      const priority = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
      await this.database.knowledgeNode.update({ where: { id: subject.id }, data: { strategicPriority: priority, priorityCalculatedAt: now, priorityEvidence: { board: board?.id || null, topicCount: values.length, method: 'mean_topic_incidence_and_recency' } } });
    }
  }

  private async createKnowledgeTree(contestId: string, subjects: StructuredSubject[]) {
    for (const subject of subjects) {
      const subjectNode = await this.database.knowledgeNode.create({
        data: {
          contestId,
          name: subject.name,
          type: 'SUBJECT',
        },
      });

      for (const topic of subject.topics || []) {
        const topicNode = await this.database.knowledgeNode.create({
          data: {
            contestId,
            parentId: subjectNode.id,
            name: topic.name,
            type: 'TOPIC',
          },
        });

        for (const subtopic of topic.subtopics || []) {
          await this.database.knowledgeNode.create({
            data: {
              contestId,
              parentId: topicNode.id,
              name: subtopic,
              type: 'SUBTOPIC',
            },
          });
        }
      }
    }
  }

  private isPrivateHost(hostname: string) {
    const host = hostname.toLowerCase();
    if (host === 'localhost' || host.endsWith('.local')) return true;
    if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return false;
    const octets = host.split('.').map(Number);
    return (
      octets.some((part) => part > 255) ||
      octets[0] === 10 ||
      octets[0] === 127 ||
      (octets[0] === 169 && octets[1] === 254) ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168) ||
      octets[0] === 0
    );
  }
}
