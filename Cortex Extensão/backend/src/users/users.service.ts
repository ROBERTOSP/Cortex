import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}

  async getProfile(userId: string) {
    const user = await this.database.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        phone: true,
        selfDeclaredColor: true,
        hasDisability: true,
        birthDate: true,
        sex: true,
        city: true,
        availableOtherStates: true,
        studyLevel: true,
        dailyStudyHours: true,
        fatigueLevel: true,
        peakEnergyTime: true,
        works: true,
        contests: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            name: true,
            targetJob: true,
            board: true,
            examDate: true,
            status: true,
          },
        },
        _count: {
          select: {
            contests: true,
            questionAttempts: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const onboardingCompleted = Boolean(
      user.studyLevel &&
        user.dailyStudyHours &&
        user.peakEnergyTime &&
        user._count.contests > 0,
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      profile: {
        studyLevel: user.studyLevel,
        dailyStudyHours: user.dailyStudyHours,
        fatigueLevel: user.fatigueLevel,
        peakEnergyTime: user.peakEnergyTime,
        works: user.works,
        phone: user.phone,
        selfDeclaredColor: user.selfDeclaredColor,
        hasDisability: user.hasDisability,
        birthDate: user.birthDate,
        sex: user.sex,
        city: user.city,
        availableOtherStates: user.availableOtherStates,
      },
      onboarding: {
        completed: onboardingCompleted,
        contestCount: user._count.contests,
        questionAttemptCount: user._count.questionAttempts,
        activeContest: user.contests[0] || null,
      },
    };
  }

  async updateProfile(
    userId: string,
    data: Partial<{
      studyLevel: string;
      dailyStudyHours: number;
      fatigueLevel: string;
      peakEnergyTime: string;
      works: boolean;
    }>,
  ) {
    const normalized = {
      ...(typeof data.studyLevel === 'string'
        ? { studyLevel: data.studyLevel.trim() || null }
        : {}),
      ...(typeof data.dailyStudyHours === 'number' && Number.isFinite(data.dailyStudyHours)
        ? { dailyStudyHours: Math.min(8, Math.max(1, Math.round(data.dailyStudyHours))) }
        : {}),
      ...(typeof data.fatigueLevel === 'string'
        ? { fatigueLevel: data.fatigueLevel.trim() || null }
        : {}),
      ...(typeof data.peakEnergyTime === 'string'
        ? { peakEnergyTime: data.peakEnergyTime.trim() || null }
        : {}),
      ...(typeof data.works === 'boolean' ? { works: data.works } : {}),
    };

    await this.database.user.update({
      where: { id: userId },
      data: normalized,
    });

    return this.getProfile(userId);
  }
}
