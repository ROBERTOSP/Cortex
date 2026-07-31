import { QuestionsService } from './questions.service';

describe('QuestionsService', () => {
  const database: any = {
    question: {
      count: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    questionAttempt: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };
  const ai: any = {
    explainQuestion: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('getNextQuestion mapeia alternativas', async () => {
    database.question.count.mockResolvedValue(1);
    database.question.findFirst.mockResolvedValue({
      id: 'q1',
      cortexIdNum: 1,
      statement: 'Enunciado',
      subject: { name: 'Matéria' },
      topic: { name: 'Tópico' },
      options: [
        { letter: 'A', text: 'Alt A', displayOrder: 0 },
        { letter: 'B', text: 'Alt B', displayOrder: 1 },
      ],
    });

    const service = new QuestionsService(database, ai);
    const res = await service.getNextQuestion();

    expect(res).toEqual({
      id: 'q1',
      subject: 'Matéria',
      topic: 'Tópico',
      statement: 'Enunciado',
      alternatives: [
        { id: 'A', text: 'Alt A' },
        { id: 'B', text: 'Alt B' },
      ],
    });
  });

  it('getDiagnosticQuestions distribui questões entre matérias e exclui as já respondidas', async () => {
    database.question.findMany = jest.fn().mockResolvedValue([
      {
        id: 'q1',
        cortexIdNum: 1,
        statement: 'Português 1',
        subject: { name: 'Português' },
        topic: { name: 'Interpretação' },
        options: [{ letter: 'A', text: 'A', displayOrder: 0 }],
      },
      {
        id: 'q2',
        cortexIdNum: 2,
        statement: 'Português 2',
        subject: { name: 'Português' },
        topic: { name: 'Gramática' },
        options: [{ letter: 'A', text: 'A', displayOrder: 0 }],
      },
      {
        id: 'q3',
        cortexIdNum: 3,
        statement: 'Lógica 1',
        subject: { name: 'Raciocínio Lógico' },
        topic: { name: 'Proposições' },
        options: [{ letter: 'B', text: 'B', displayOrder: 0 }],
      },
    ]);

    const service = new QuestionsService(database, ai);
    const res = await service.getDiagnosticQuestions('u1', 3);

    expect(database.question.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        annulled: false,
        outdated: false,
        attempts: { none: { userId: 'u1' } },
      }),
    }));
    expect(res.questions.map((question) => question.id)).toEqual(['q1', 'q3', 'q2']);
    expect(res.total).toBe(3);
  });

  it('getDiagnosticQuestions limita a quantidade solicitada', async () => {
    database.question.findMany = jest.fn().mockResolvedValue([]);
    const service = new QuestionsService(database, ai);

    await service.getDiagnosticQuestions('u1', 100);

    expect(database.question.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 60 }),
    );
  });

  it('submitAnswer calcula isCorrect e persiste attempt', async () => {
    database.question.findUnique.mockResolvedValue({
      id: 'q1',
      options: [
        { letter: 'A', isCorrect: true },
        { letter: 'B', isCorrect: false },
      ],
    });
    database.questionAttempt.create.mockResolvedValue({ id: 'a1' });

    const service = new QuestionsService(database, ai);
    const res = await service.submitAnswer('u1', {
      questionId: 'q1',
      selectedOption: 'A',
      latencyMs: 1234,
      switchesCount: 1,
      hesitationDetected: false,
    });

    expect(database.questionAttempt.create).toHaveBeenCalledWith({
      data: {
        userId: 'u1',
        questionId: 'q1',
        selectedOption: 'A',
        correctOption: 'A',
        isCorrect: true,
        latencyMs: 1234,
        switchesCount: 1,
        hesitationDetected: false,
      },
    });

    expect(res).toEqual({
      question_id: 'q1',
      selected_option: 'A',
      is_correct: true,
      correct_answer: 'A',
    });
  });

  it('explainQuestion usa cache quando já existe explanation', async () => {
    database.questionAttempt.findFirst.mockResolvedValue({
      id: 'a1',
      questionId: 'q1',
      selectedOption: 'A',
      correctOption: 'B',
      isCorrect: false,
      explanation: 'cached',
    });

    const service = new QuestionsService(database, ai);
    const res = await service.explainQuestion('u1', 'q1');

    expect(ai.explainQuestion).not.toHaveBeenCalled();
    expect(res.explanation).toBe('cached');
  });

  it('explainQuestion gera e persiste explanation', async () => {
    database.questionAttempt.findFirst.mockResolvedValue({
      id: 'a1',
      questionId: 'q1',
      selectedOption: 'A',
      correctOption: 'B',
      isCorrect: false,
      explanation: null,
    });
    database.question.findUnique.mockResolvedValue({
      id: 'q1',
      statement: 'Enunciado',
      subject: { name: 'Matéria' },
      topic: { name: 'Tópico' },
      options: [
        { letter: 'A', text: 'Alt A', isCorrect: false, displayOrder: 0 },
        { letter: 'B', text: 'Alt B', isCorrect: true, displayOrder: 1 },
      ],
    });
    ai.explainQuestion.mockResolvedValue('exp');
    database.questionAttempt.update.mockResolvedValue({ id: 'a1' });

    const service = new QuestionsService(database, ai);
    const res = await service.explainQuestion('u1', 'q1');

    expect(ai.explainQuestion).toHaveBeenCalled();
    expect(database.questionAttempt.update).toHaveBeenCalled();
    expect(res.explanation).toBe('exp');
    expect(res.correct_answer).toBe('B');
  });
});
