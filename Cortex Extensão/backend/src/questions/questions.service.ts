import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { DatabaseService } from '../database/database.service';
import { resolveBoardAlias } from './taxonomy-aliases';

export type NextQuestionAlternative = {
  id: string;
  text: string;
};

export type NextQuestionResponse = {
  id: string;
  subject: string | null;
  topic: string | null;
  statement: string;
  alternatives: NextQuestionAlternative[];
};

export type SubmitAnswerInput = {
  questionId: string;
  selectedOption: string;
  latencyMs?: number;
  switchesCount?: number;
  hesitationDetected?: boolean;
};

export type SubmitAnswerResponse = {
  question_id: string;
  selected_option: string;
  is_correct: boolean;
  correct_answer: string;
};

export type DiagnosticQuestionsResponse = {
  total: number;
  questions: NextQuestionResponse[];
  context: {
    contestId: string | null;
    contestName: string | null;
    targetJob: string | null;
    board: string | null;
  };
  coverage: {
    status: 'READY' | 'INSUFFICIENT';
    reason: string | null;
    matchedSubjects: number;
    matchedTopics: number;
    eligibleQuestions: number;
  };
};

@Injectable()
export class QuestionsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly ai: AiService
  ) {}

  async getNextQuestion(): Promise<NextQuestionResponse> {
    const total = await this.database.question.count({ where: { annulled: false } });
    if (!total) {
      throw new NotFoundException('Nenhuma questão disponível');
    }

    const skip = Math.floor(Math.random() * total);
    const question = await this.database.question.findFirst({
      where: { annulled: false },
      orderBy: { cortexIdNum: 'asc' },
      skip,
      include: {
        subject: { select: { name: true } },
        topic: { select: { name: true } },
        options: { orderBy: { displayOrder: 'asc' } },
      },
    });

    if (!question) {
      throw new NotFoundException('Nenhuma questão disponível');
    }

    return {
      id: question.id,
      subject: question.subject?.name ?? null,
      topic: question.topic?.name ?? null,
      statement: question.statement,
      alternatives: question.options.map((opt) => ({
        id: opt.letter,
        text: opt.text,
      })),
    };
  }

  async getDiagnosticQuestions(
    userId: string,
    requestedLimit = 8,
  ): Promise<DiagnosticQuestionsResponse> {
    const limit = Math.min(Math.max(Math.trunc(requestedLimit) || 8, 3), 12);
    const contest = await this.database.contest.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        targetJob: true,
        selectedJob: true,
        board: true,
        nodes: {
          select: {
            id: true,
            parentId: true,
            name: true,
            type: true,
            taxonomyStatus: true,
            taxonomyMatch: true,
            strategicPriority: true,
          },
        },
      },
    });
    const context = {
      contestId: contest?.id ?? null,
      contestName: contest?.name ?? null,
      targetJob: contest?.selectedJob || contest?.targetJob || null,
      board: contest?.board ?? null,
    };
    const insufficient = (
      reason: string,
      matchedSubjects = 0,
      matchedTopics = 0,
    ): DiagnosticQuestionsResponse => ({
      total: 0,
      questions: [],
      context,
      coverage: {
        status: 'INSUFFICIENT',
        reason,
        matchedSubjects,
        matchedTopics,
        eligibleQuestions: 0,
      },
    });

    if (!contest?.selectedJob) {
      return insufficient('Selecione e confirme um cargo do edital antes do diagnóstico.');
    }
    const board = resolveBoardAlias(contest.board).canonical;
    if (!board) {
      return insufficient('A banca do edital ainda não está vinculada ao perfil estatístico do Cortex.');
    }
    const matchedNodes = contest.nodes.filter(
      (node) => node.taxonomyStatus === 'MATCHED',
    );
    const readCandidateId = (value: unknown): string | null => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
      const candidates = (value as { candidates?: unknown }).candidates;
      if (!Array.isArray(candidates) || candidates.length !== 1) return null;
      const id = (candidates[0] as { id?: unknown })?.id;
      return typeof id === 'string' ? id : null;
    };
    const subjectNodes = matchedNodes
      .filter((node) => node.type === 'SUBJECT')
      .map((node) => ({ ...node, taxonomyId: readCandidateId(node.taxonomyMatch) }))
      .filter((node): node is typeof node & { taxonomyId: string } => Boolean(node.taxonomyId));
    const topicNodes = matchedNodes
      .filter((node) => node.type === 'TOPIC')
      .map((node) => ({ ...node, taxonomyId: readCandidateId(node.taxonomyMatch) }))
      .filter((node): node is typeof node & { taxonomyId: string } => Boolean(node.taxonomyId));
    if (!subjectNodes.length && !topicNodes.length) {
      return insufficient('As matérias e os tópicos deste cargo ainda não foram vinculados à taxonomia de questões.');
    }

    const candidates = await this.database.question.findMany({
      where: {
        annulled: false,
        outdated: false,
        options: { some: { isCorrect: true } },
        attempts: { none: { userId } },
        board: { canonicalKey: board.id },
        provenance: {
          is: { rightsStatus: { in: ['AUTHORIZED', 'LICENSED'] } },
        },
        OR: [
          { subjectId: { in: subjectNodes.map((node) => node.taxonomyId) } },
          { topicId: { in: topicNodes.map((node) => node.taxonomyId) } },
        ],
      },
      orderBy: [{ year: 'desc' }, { cortexIdNum: 'asc' }],
      take: Math.min(limit * 10, 120),
      include: {
        subject: { select: { name: true } },
        topic: { select: { name: true } },
        options: { orderBy: { displayOrder: 'asc' } },
      },
    });
    if (candidates.length < limit) {
      return insufficient(
        `Ainda não há ${limit} questões autorizadas suficientes para este cargo e esta banca.`,
        subjectNodes.length,
        topicNodes.length,
      );
    }

    const priorityByTaxonomyId = new Map<string, number>([
      ...subjectNodes.map((node) => [node.taxonomyId, node.strategicPriority] as const),
      ...topicNodes.map((node) => [node.taxonomyId, node.strategicPriority] as const),
    ]);
    candidates.sort((left, right) => {
      const leftPriority = Math.max(
        priorityByTaxonomyId.get(left.topicId || '') || 0,
        priorityByTaxonomyId.get(left.subjectId || '') || 0,
      );
      const rightPriority = Math.max(
        priorityByTaxonomyId.get(right.topicId || '') || 0,
        priorityByTaxonomyId.get(right.subjectId || '') || 0,
      );
      return rightPriority - leftPriority;
    });

    const bySubject = new Map<string, typeof candidates>();
    for (const question of candidates) {
      const key = question.subject?.name || 'Conhecimentos gerais';
      const bucket = bySubject.get(key) || [];
      bucket.push(question);
      bySubject.set(key, bucket);
    }

    const selected: typeof candidates = [];
    while (selected.length < limit && bySubject.size) {
      for (const [subject, bucket] of bySubject) {
        const question = bucket.shift();
        if (question) selected.push(question);
        if (!bucket.length) bySubject.delete(subject);
        if (selected.length === limit) break;
      }
    }

    return {
      total: selected.length,
      questions: selected.map((question) => ({
        id: question.id,
        subject: question.subject?.name ?? null,
        topic: question.topic?.name ?? null,
        statement: question.statement,
        alternatives: question.options.map((option) => ({
          id: option.letter,
          text: option.text,
        })),
      })),
      context,
      coverage: {
        status: 'READY',
        reason: null,
        matchedSubjects: subjectNodes.length,
        matchedTopics: topicNodes.length,
        eligibleQuestions: candidates.length,
      },
    };
  }

  async submitAnswer(userId: string, input: SubmitAnswerInput): Promise<SubmitAnswerResponse> {
    if (!input.questionId) {
      throw new BadRequestException('question_id é obrigatório');
    }
    if (!input.selectedOption) {
      throw new BadRequestException('selected_option é obrigatório');
    }

    const question = await this.database.question.findUnique({
      where: { id: input.questionId },
      include: { options: true },
    });

    if (!question) {
      throw new NotFoundException('Questão não encontrada');
    }

    const correct = question.options.find((o) => o.isCorrect)?.letter;
    if (!correct) {
      throw new BadRequestException('Questão sem gabarito');
    }

    const isCorrect = input.selectedOption === correct;

    await this.database.questionAttempt.create({
      data: {
        userId,
        questionId: question.id,
        selectedOption: input.selectedOption,
        correctOption: correct,
        isCorrect,
        latencyMs: input.latencyMs,
        switchesCount: input.switchesCount,
        hesitationDetected: input.hesitationDetected,
      },
    });

    return {
      question_id: question.id,
      selected_option: input.selectedOption,
      is_correct: isCorrect,
      correct_answer: correct,
    };
  }

  async explainQuestion(userId: string, questionId: string) {
    const attempt = await this.database.questionAttempt.findFirst({
      where: { userId, questionId },
      orderBy: { createdAt: 'desc' },
    });

    if (!attempt) {
      throw new ForbiddenException('Responda a questão antes de solicitar explicação');
    }

    if (attempt.explanation) {
      return {
        question_id: questionId,
        explanation: attempt.explanation,
        correct_answer: attempt.correctOption,
        selected_option: attempt.selectedOption,
        is_correct: attempt.isCorrect,
      };
    }

    const question = await this.database.question.findUnique({
      where: { id: questionId },
      include: {
        subject: { select: { name: true } },
        topic: { select: { name: true } },
        options: { orderBy: { displayOrder: 'asc' } },
      },
    });

    if (!question) {
      throw new NotFoundException('Questão não encontrada');
    }

    const correct = question.options.find((o) => o.isCorrect)?.letter;
    if (!correct) {
      throw new BadRequestException('Questão sem gabarito');
    }

    let explanation: string;
    try {
      explanation = await this.ai.explainQuestion({
        subject: question.subject?.name ?? null,
        topic: question.topic?.name ?? null,
        statement: question.statement,
        alternatives: question.options.map((o) => ({ id: o.letter, text: o.text })),
        correctAnswer: correct,
        selectedOption: attempt.selectedOption,
      });
    } catch {
      throw new BadRequestException('IA não configurada para explicações');
    }

    await this.database.questionAttempt.update({
      where: { id: attempt.id },
      data: { explanation, explainedAt: new Date() },
    });

    return {
      question_id: questionId,
      explanation,
      correct_answer: correct,
      selected_option: attempt.selectedOption,
      is_correct: attempt.isCorrect,
    };
  }
}
