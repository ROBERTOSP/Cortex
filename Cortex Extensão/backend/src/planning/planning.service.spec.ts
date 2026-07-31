import { BadRequestException } from '@nestjs/common';
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
    userRoutine: {
      findUnique: jest.fn(),
    },
    contest: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-07-26T10:00:00Z'));
    database.userRoutine.findUnique.mockResolvedValue(null);
    database.contest.findFirst.mockResolvedValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('gera cronograma adaptativo com base em desempenho e atualiza perfil', async () => {
    database.contest.findFirst.mockResolvedValue({
      examDate: new Date('2026-12-01T12:00:00Z'),
      nodes: [
        { name: 'Direito Constitucional', strategicPriority: 90, children: [{ name: 'Direitos Fundamentais', strategicPriority: 90 }] },
        { name: 'Português', strategicPriority: 60, children: [{ name: 'Sintaxe', strategicPriority: 60 }] },
      ],
    });
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

  it('bloqueia cronograma sem edital e cargo confirmados', async () => {
    database.user.findUnique.mockResolvedValue({
      id: 'u1',
      dailyStudyHours: null,
      peakEnergyTime: null,
      fatigueLevel: null,
      works: false,
    });
    database.questionAttempt.findMany.mockResolvedValue([]);
    const service = new PlanningService(database);
    await expect(service.generateScheduleForUser('u1', {}))
      .rejects.toBeInstanceOf(BadRequestException);
    expect(database.questionSubject.findMany).not.toHaveBeenCalled();
  });

  it('usa a capacidade e os horários reais da rotina quando ela existe', async () => {
    database.user.findUnique.mockResolvedValue({
      id: 'u1', dailyStudyHours: 2, peakEnergyTime: 'MANHA', fatigueLevel: 'MEDIO', works: false,
    });
    database.questionAttempt.findMany.mockResolvedValue([]);
    database.questionSubject.findMany.mockResolvedValue([]);
    database.contest.findFirst.mockResolvedValue({
      nodes: [{ name: 'Direito Penal', children: [{ name: 'Teoria do Crime' }] }],
    });
    database.userRoutine.findUnique.mockResolvedValue({
      timezone: 'America/Sao_Paulo', planMode: 'FLEXIBLE', preferredSessionMinutes: 40,
      maxSubjectsPerDay: 3, badDayMinimumMinutes: 20, missedDayStrategy: 'REDISTRIBUTE',
      peakEnergyPeriod: 'MORNING', commitments: [],
      availabilityWindows: [{ dayOfWeek: 'SUN', startMinute: 480, endMinute: 600, flexibility: 'FIXED', context: 'HOME', devices: ['COMPUTER'], allowedActivities: ['STUDY'] }],
    });

    const service = new PlanningService(database);
    const result = await service.generateScheduleForUser('u1', {});

    expect(result.insights[0]).toMatchObject({ subject: 'Direito Penal', topic: 'Teoria do Crime' });
    expect(result.schedule).toHaveLength(3);
    expect(result.schedule.every((task: any) => task.startsAt >= '08:00' && task.startsAt < '10:00')).toBe(true);
    expect(result.schedule.every((task: any) => task.duration === 40)).toBe(true);
  });
});
