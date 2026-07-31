import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { DatabaseService } from '../database/database.service';

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
    const candidates = await this.database.question.findMany({
      where: {
        annulled: false,
        outdated: false,
        options: { some: { isCorrect: true } },
        attempts: { none: { userId } },
      },
      orderBy: { cortexIdNum: 'asc' },
      take: Math.min(limit * 5, 60),
      include: {
        subject: { select: { name: true } },
        topic: { select: { name: true } },
        options: { orderBy: { displayOrder: 'asc' } },
      },
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
