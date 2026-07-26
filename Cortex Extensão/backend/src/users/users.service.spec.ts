import { UsersService } from './users.service';

describe('UsersService', () => {
  const database: any = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('monta o perfil com status de onboarding', async () => {
    database.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'user@test.com',
      name: 'User',
      avatarUrl: null,
      studyLevel: 'INTERMEDIARIO',
      dailyStudyHours: 3,
      fatigueLevel: 'MEDIO',
      peakEnergyTime: 'NOITE',
      works: true,
      contests: [
        {
          id: 'c1',
          name: 'TJSP',
          targetJob: 'Escrevente',
          board: 'Vunesp',
          examDate: null,
          status: 'ACTIVE',
        },
      ],
      _count: {
        contests: 1,
        questionAttempts: 12,
      },
    });

    const service = new UsersService(database);
    const result = await service.getProfile('u1');

    expect(result.onboarding.completed).toBe(true);
    expect(result.onboarding.contestCount).toBe(1);
    expect(result.profile.dailyStudyHours).toBe(3);
  });

  it('normaliza dados ao atualizar o perfil', async () => {
    database.user.update.mockResolvedValue({});
    database.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'user@test.com',
      name: 'User',
      avatarUrl: null,
      studyLevel: 'INICIANTE',
      dailyStudyHours: 8,
      fatigueLevel: 'ALTO',
      peakEnergyTime: 'MANHA',
      works: false,
      contests: [],
      _count: {
        contests: 0,
        questionAttempts: 0,
      },
    });

    const service = new UsersService(database);
    await service.updateProfile('u1', {
      studyLevel: ' INICIANTE ',
      dailyStudyHours: 12,
      fatigueLevel: 'ALTO',
      peakEnergyTime: 'MANHA',
      works: false,
    });

    expect(database.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: {
        studyLevel: 'INICIANTE',
        dailyStudyHours: 8,
        fatigueLevel: 'ALTO',
        peakEnergyTime: 'MANHA',
        works: false,
      },
    });
  });
});
