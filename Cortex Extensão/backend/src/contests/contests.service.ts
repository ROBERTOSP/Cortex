import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
const pdf = require('pdf-parse');
import { DatabaseService } from '../database/database.service';
import { AiService } from '../ai/ai.service';

type StructuredSubject = {
  name: string;
  topics: Array<{
    name: string;
    subtopics: string[];
  }>;
};

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
    },
  ) {
    const name = (data.name || '').trim();
    const targetJob = (data.targetJob || '').trim();
    const board = (data.board || '').trim();
    const editalText = (data.editalText || '').trim();

    if (!targetJob) {
      throw new BadRequestException('Cargo pretendido é obrigatório');
    }

    const template = data.templateId
      ? CONTEST_CATALOG.find((item) => item.id === data.templateId)
      : null;

    const structure = editalText
      ? await this.ai.structureEdital(editalText)
      : template
      ? { subjects: template.subjects }
      : { subjects: [] };

    const resolvedName = name || template?.name || 'Plano Personalizado';
    const resolvedBoard = board || template?.board || 'Banca não informada';
    const resolvedExamDate = data.examDate || template?.examDate || null;

    const contest = await this.database.contest.create({
      data: {
        userId,
        name: resolvedName,
        targetJob,
        board: resolvedBoard,
        examDate: resolvedExamDate ? new Date(resolvedExamDate) : null,
      },
    });

    await this.createKnowledgeTree(contest.id, structure.subjects || []);

    return this.findOneForUser(userId, contest.id);
  }

  async parseAndCreateFromEdital(
    file: Express.Multer.File,
    userId: string,
    meta?: { name?: string; targetJob?: string; board?: string; examDate?: string },
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado');
    }

    try {
      const data = await pdf(file.buffer);
      const text = data.text;

      return this.createForUser(userId, {
        name: meta?.name,
        targetJob: meta?.targetJob,
        board: meta?.board,
        examDate: meta?.examDate,
        editalText: text,
      });
    } catch (error) {
      console.error('Erro ao processar edital:', error);
      throw new BadRequestException('Falha ao processar o edital');
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
}
