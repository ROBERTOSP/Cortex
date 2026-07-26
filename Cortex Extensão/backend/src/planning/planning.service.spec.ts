import { PlanningService } from './planning.service';

describe('PlanningService', () => {
  const database: any = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    questionAttempt: {
      findMany: jest.fn(),
    },
    questionSubject: {
      findMany: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-07-26T10:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('gera cronograma adaptativo com base em desempenho e atualiza perfil', async () => {
    database.user.findUnique.mockResolvedValue({
      id: 'u1',
      dailyStudyHours: 2,
      peakEnergyTime: 'MANHA',
      fatigueLevel: 'MEDIO',
      works: false,
    });
    database.user.update.mockResolvedValue({
      id: 'u1',
      dailyStudyHours: 3,
      peakEnergyTime: 'NOITE',
      fatigueLevel: 'BAIXO',
      works: true,
    });
    database.questionAttempt.findMany.mockResolvedValue([
      {
        isCorrect: false,
        hesitationDetected: true,
        latencyMs: 120000,
        createdAt: new Date('2026-07-20T10:00:00Z'),
        question: {
          subject: { name: 'Direito Constitucional' },
          topic: { name: 'Direitos Fundamentais' },
        },
      },
      {
        isCorrect: false,
        hesitationDetected: false,
        latencyMs: 80000,
        createdAt: new Date('2026-07-19T10:00:00Z'),
        question: {
          subject: { name: 'Direito Constitucional' },
          topic: { name: 'Direitos Fundamentais' },
        },
      },
      {
        isCorrect: true,
        hesitationDetected: false,
        latencyMs: 20000,
        createdAt: new Date('2026-07-21T10:00:00Z'),
        question: {
          subject: { name: 'Português' },
          topic: { name: 'Sintaxe' },
        },
      },
    ]);
    database.questionSubject.findMany.mockResolvedValue([
      { name: 'Informática', topics: [{ name: 'Windows' }] },
      { name: 'Raciocínio Lógico', topics: [{ name: 'Proposições' }] },
    ]);

    const service = new PlanningService(database);
    const result = await service.generateScheduleForUser('u1', {
      profile: {
        dailyStudyHours: 3,
        peakEnergyTime: 'NOITE',
        fatigueLevel: 'BAIXO',
        works: true,
      },
    });

    expect(database.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: {
        dailyStudyHours: 3,
        peakEnergyTime: 'NOITE',
        fatigueLevel: 'BAIXO',
        works: true,
      },
      select: {
        id: true,
        dailyStudyHours: true,
        peakEnergyTime: true,
        fatigueLevel: true,
        works: true,
      },
    });

    expect(result.summary.mode).toBe('adaptativo');
    expect(result.summary.totalAttempts).toBe(3);
    expect(result.summary.dailyMinutes).toBe(144);
    expect(result.summary.weeklyMinutes).toBe(1008);
    expect(result.summary.blockMinutes).toBe(40);
    expect(result.profile.peakEnergyTime).toBe('NOITE');
    expect(result.schedule.length).toBeGreaterThan(0);
    expect(result.schedule[0].startsAt).toBe('19:00');
    expect(
      result.schedule.every((task: any) => task.status === 'pending'),
    ).toBe(true);
    expect(result.insights[0].reason.length).toBeGreaterThan(0);
    expect(result.insights[0].subject).toBe('Direito Constitucional');
  });

  it('gera cronograma inicial quando ainda não há tentativas', async () => {
    database.user.findUnique.mockResolvedValue({
      id: 'u1',
      dailyStudyHours: null,
      peakEnergyTime: null,
      fatigueLevel: null,
      works: false,
    });
    database.questionAttempt.findMany.mockResolvedValue([]);
    database.questionSubject.findMany.mockResolvedValue([
      {
        name: 'Direito Administrativo',
        topics: [{ name: 'Atos Administrativos' }],
      },
      { name: 'Português', topics: [{ name: 'Interpretação de Texto' }] },
      { name: 'Informática', topics: [{ name: 'Segurança da Informação' }] },
      { name: 'Raciocínio Lógico', topics: [{ name: 'Argumentação' }] },
    ]);

    const service = new PlanningService(database);
    const result = await service.generateScheduleForUser('u1', {});

    expect(database.user.update).not.toHaveBeenCalled();
    expect(result.summary.mode).toBe('inicial');
    expect(result.profile.dailyStudyHours).toBe(2);
    expect(result.summary.dailyMinutes).toBe(108);
    expect(result.summary.blockMinutes).toBe(30);
    expect(result.schedule.length).toBeGreaterThan(0);
    expect(result.schedule.some((task: any) => task.type === 'reading')).toBe(
      true,
    );
    expect(result.schedule[0].startsAt).toBe('06:30');
    expect(result.insights).toHaveLength(4);
  });
});
