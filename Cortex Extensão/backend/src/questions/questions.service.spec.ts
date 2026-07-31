import { QuestionsService } from './questions.service';

describe('QuestionsService', () => {
  const database: any = {
    contest: {
      findFirst: jest.fn(),
    },
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

  it('getDiagnosticQuestions cruza o cargo ativo, taxonomia, banca e direitos autorizados', async () => {
    database.contest.findFirst.mockResolvedValue({
      id: 'c1',
      name: 'Concurso',
      targetJob: 'Analista',
      selectedJob: 'Analista - TI',
      board: 'FGV',
      nodes: [
        {
          id: 's1',
          parentId: null,
          name: 'Português',
          type: 'SUBJECT',
          taxonomyStatus: 'MATCHED',
          taxonomyMatch: { candidates: [{ id: 'subject-pt', name: 'Português' }] },
          strategicPriority: 70,
        },
        {
          id: 't1',
          parentId: 's1',
          name: 'Interpretação',
          type: 'TOPIC',
          taxonomyStatus: 'MATCHED',
          taxonomyMatch: { candidates: [{ id: 'topic-interpretacao', name: 'Interpretação' }] },
          strategicPriority: 90,
        },
      ],
    });
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
        board: { canonicalKey: 'fgv' },
        provenance: { is: { rightsStatus: { in: ['AUTHORIZED', 'LICENSED'] } } },
        attempts: { none: { userId: 'u1' } },
      }),
    }));
    expect(res.questions.map((question) => question.id)).toEqual(['q1', 'q3', 'q2']);
    expect(res.total).toBe(3);
    expect(res.coverage.status).toBe('READY');
    expect(res.context).toEqual(expect.objectContaining({
      contestId: 'c1',
      targetJob: 'Analista - TI',
      board: 'FGV',
    }));
  });

  it('getDiagnosticQuestions não usa questões genéricas quando a taxonomia não tem correspondência', async () => {
    database.contest.findFirst.mockResolvedValue({
      id: 'c1',
      name: 'Concurso',
      targetJob: 'Analista',
      selectedJob: 'Analista',
      board: 'FGV',
      nodes: [{
        id: 's1',
        parentId: null,
        name: 'Disciplina inédita',
        type: 'SUBJECT',
        taxonomyStatus: 'UNMATCHED',
        taxonomyMatch: null,
        strategicPriority: 0,
      }],
    });
    database.question.findMany = jest.fn();
    const service = new QuestionsService(database, ai);

    const result = await service.getDiagnosticQuestions('u1', 8);

    expect(database.question.findMany).not.toHaveBeenCalled();
    expect(result.questions).toEqual([]);
    expect(result.coverage.status).toBe('INSUFFICIENT');
    expect(result.coverage.reason).toMatch(/taxonomia/i);
  });

  it('getDiagnosticQuestions não exibe acervo sem licença', async () => {
    database.contest.findFirst.mockResolvedValue({
      id: 'c1',
      name: 'Concurso',
      targetJob: 'Analista',
      selectedJob: 'Analista',
      board: 'FGV',
      nodes: [{
        id: 's1',
        parentId: null,
        name: 'Português',
        type: 'SUBJECT',
        taxonomyStatus: 'MATCHED',
        taxonomyMatch: { candidates: [{ id: 'subject-pt', name: 'Português' }] },
        strategicPriority: 50,
      }],
    });
    database.question.findMany = jest.fn().mockResolvedValue([]);
    const service = new QuestionsService(database, ai);

    const result = await service.getDiagnosticQuestions('u1', 8);

    expect(result.coverage.status).toBe('INSUFFICIENT');
    expect(result.coverage.reason).toMatch(/autorizadas/i);
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
