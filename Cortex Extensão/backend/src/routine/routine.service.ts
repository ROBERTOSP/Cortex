import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  AllowedActivity,
  CommitmentCategory,
  DayOfWeek,
  DeviceType,
  EnergyPeriod,
  FatigueLevel,
  MissedDayStrategy,
  PlanMode,
  StudyContext,
  StudyGoalPhase,
  StudyGoalType,
  StudyLevel,
  UserRoutine,
  WindowFlexibility,
} from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { computeWeeklyCapacity } from '../routine-engine/engine';
import { ROUTINE_ENGINE_LIMITS } from '../routine-engine/config';
import {
  assertMinuteRange,
  assertNoOverlapByDayOfWeek,
  assertNotTooFutureDateKey,
  isValidTimezone,
  parseDateKey,
} from './routine.validators';

type UpsertStudyGoalPayload = {
  type: StudyGoalType;
  studyLevel: StudyLevel;
  phase: StudyGoalPhase;
  title: string;
  targetJob: string;
  board?: string | null;
  examDate?: string | null;
  examDateUnknown?: boolean | null;
};

type UpsertRoutinePayload = {
  timezone?: string | null;
  wakeTimeMinute?: number | null;
  sleepTimeMinute?: number | null;
  peakEnergyPeriod?: EnergyPeriod | null;
  habitualFatigueLevel?: FatigueLevel | null;
  preferredSessionMinutes?: number | null;
  planMode?: PlanMode | null;
  maxSubjectsPerDay?: number | null;
  wantsDayOff?: boolean | null;
  dayOffPreference?: DayOfWeek | null;
  badDayMinimumMinutes?: number | null;
  missedDayStrategy?: MissedDayStrategy | null;
};

type ReplaceWindowsPayload = {
  windows: Array<{
    dayOfWeek: DayOfWeek;
    startMinute: number;
    endMinute: number;
    context: StudyContext;
    devices: DeviceType[];
    flexibility: WindowFlexibility;
    allowedActivities: AllowedActivity[];
  }>;
};

type ReplaceCommitmentsPayload = {
  commitments: Array<{
    category: CommitmentCategory;
    dayOfWeek: DayOfWeek;
    startMinute: number;
    endMinute: number;
    flexibility: WindowFlexibility;
    note?: string | null;
  }>;
};

type UpsertCheckInPayload = {
  dateKey: string;
  energy: number;
  focus: number;
  fatigue: number;
  availableMinutesOverride?: number | null;
  note?: string | null;
};

type PreviewWeekPayload = {
  weekStartDate: string;
  checkInDateKey?: string | null;
};

@Injectable()
export class RoutineService {
  constructor(private readonly database: DatabaseService) {}

  private async ensureRoutineDraft(userId: string): Promise<UserRoutine> {
    const routine = await this.database.userRoutine.findUnique({ where: { userId } });
    if (routine) return routine;
    return this.database.userRoutine.create({
      data: {
        userId,
      },
    });
  }

  async getState(userId: string) {
    const user = await this.database.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        onboardingVersion: true,
      },
    });
    if (!user) throw new NotFoundException();

    const goal = await this.database.studyGoal.findUnique({ where: { userId } });
    const routine = await this.database.userRoutine.findUnique({ where: { userId } });
    const windows = routine
      ? await this.database.availabilityWindow.findMany({
          where: { routineId: routine.id },
          orderBy: [{ dayOfWeek: 'asc' }, { startMinute: 'asc' }],
        })
      : [];
    const commitments = routine
      ? await this.database.routineCommitment.findMany({
          where: { routineId: routine.id },
          orderBy: [{ dayOfWeek: 'asc' }, { startMinute: 'asc' }],
        })
      : [];

    return {
      user,
      studyGoal: goal,
      routine,
      availabilityWindows: windows,
      commitments,
      isOnboardingV1Completed:
        user.onboardingVersion >= 1 && Boolean(routine?.routineOnboardingCompletedAt),
    };
  }

  async upsertStudyGoal(userId: string, payload: UpsertStudyGoalPayload) {
    const title = (payload.title || '').trim();
    const targetJob = (payload.targetJob || '').trim();
    const board = (payload.board || '').trim() || null;

    if (!title) throw new BadRequestException('title obrigatório.');
    if (!targetJob) throw new BadRequestException('targetJob obrigatório.');

    const examDateUnknown = Boolean(payload.examDateUnknown);
    const examDateStr = (payload.examDate || '').trim();

    let examDate: Date | null = null;
    if (examDateStr) {
      const dt = new Date(examDateStr);
      if (Number.isNaN(dt.getTime())) throw new BadRequestException('examDate inválida.');
      examDate = dt;
    }

    if (!examDate && !examDateUnknown) {
      throw new BadRequestException('Preencha examDate ou marque examDateUnknown.');
    }
    if (examDate && examDateUnknown) {
      throw new BadRequestException('examDate e examDateUnknown são mutuamente exclusivos.');
    }

    return this.database.studyGoal.upsert({
      where: { userId },
      update: {
        type: payload.type,
        studyLevel: payload.studyLevel,
        phase: payload.phase,
        title,
        targetJob,
        board,
        examDate,
        examDateUnknown,
      },
      create: {
        userId,
        type: payload.type,
        studyLevel: payload.studyLevel,
        phase: payload.phase,
        title,
        targetJob,
        board,
        examDate,
        examDateUnknown,
      },
    });
  }

  async upsertRoutine(userId: string, payload: UpsertRoutinePayload) {
    const routine = await this.ensureRoutineDraft(userId);

    const timezone =
      payload.timezone === undefined ? undefined : payload.timezone?.trim() || null;
    if (timezone != null && timezone !== '' && !isValidTimezone(timezone)) {
      throw new BadRequestException('timezone inválido.');
    }

    const wantsDayOff =
      payload.wantsDayOff === undefined ? undefined : Boolean(payload.wantsDayOff);
    const dayOffPreference =
      payload.dayOffPreference === undefined ? undefined : payload.dayOffPreference;
    if (wantsDayOff === true && !dayOffPreference) {
      throw new BadRequestException('dayOffPreference obrigatório quando wantsDayOff=true.');
    }
    if (wantsDayOff === false && dayOffPreference != null) {
      throw new BadRequestException('dayOffPreference deve ser null quando wantsDayOff=false.');
    }

    const preferredSessionMinutes = payload.preferredSessionMinutes ?? undefined;
    if (preferredSessionMinutes != null) {
      if (!Number.isInteger(preferredSessionMinutes)) {
        throw new BadRequestException('preferredSessionMinutes inválido.');
      }
      if (
        preferredSessionMinutes < ROUTINE_ENGINE_LIMITS.sessionMinutes.min ||
        preferredSessionMinutes > ROUTINE_ENGINE_LIMITS.sessionMinutes.max
      ) {
        throw new BadRequestException('preferredSessionMinutes fora do limite.');
      }
    }

    return this.database.userRoutine.update({
      where: { id: routine.id },
      data: {
        timezone,
        wakeTimeMinute:
          payload.wakeTimeMinute === undefined ? undefined : payload.wakeTimeMinute,
        sleepTimeMinute:
          payload.sleepTimeMinute === undefined ? undefined : payload.sleepTimeMinute,
        peakEnergyPeriod:
          payload.peakEnergyPeriod === undefined ? undefined : payload.peakEnergyPeriod,
        habitualFatigueLevel:
          payload.habitualFatigueLevel === undefined
            ? undefined
            : payload.habitualFatigueLevel,
        preferredSessionMinutes,
        planMode: payload.planMode === undefined ? undefined : payload.planMode,
        maxSubjectsPerDay:
          payload.maxSubjectsPerDay === undefined ? undefined : payload.maxSubjectsPerDay,
        wantsDayOff,
        dayOffPreference,
        badDayMinimumMinutes:
          payload.badDayMinimumMinutes === undefined
            ? undefined
            : payload.badDayMinimumMinutes,
        missedDayStrategy:
          payload.missedDayStrategy === undefined ? undefined : payload.missedDayStrategy,
      },
    });
  }

  async replaceAvailabilityWindows(userId: string, payload: ReplaceWindowsPayload) {
    const routine = await this.ensureRoutineDraft(userId);
    const windows = payload.windows ?? [];

    for (const w of windows) {
      assertMinuteRange(w.startMinute, w.endMinute);
      if (!w.allowedActivities || w.allowedActivities.length === 0) {
        throw new BadRequestException('allowedActivities obrigatório.');
      }
    }

    assertNoOverlapByDayOfWeek(windows);

    return this.database.$transaction(async (tx) => {
      await tx.availabilityWindow.deleteMany({ where: { routineId: routine.id } });
      if (windows.length === 0) return [];
      await tx.availabilityWindow.createMany({
        data: windows.map((w) => ({
          routineId: routine.id,
          dayOfWeek: w.dayOfWeek,
          startMinute: w.startMinute,
          endMinute: w.endMinute,
          context: w.context,
          devices: w.devices,
          flexibility: w.flexibility,
          allowedActivities: w.allowedActivities,
        })),
      });
      return tx.availabilityWindow.findMany({
        where: { routineId: routine.id },
        orderBy: [{ dayOfWeek: 'asc' }, { startMinute: 'asc' }],
      });
    });
  }

  async replaceCommitments(userId: string, payload: ReplaceCommitmentsPayload) {
    const routine = await this.ensureRoutineDraft(userId);
    const commitments = payload.commitments ?? [];

    for (const c of commitments) {
      assertMinuteRange(c.startMinute, c.endMinute);
      if (c.note != null && c.note.length > 140) {
        throw new BadRequestException('note do compromisso excede 140 caracteres.');
      }
    }

    assertNoOverlapByDayOfWeek(commitments);

    return this.database.$transaction(async (tx) => {
      await tx.routineCommitment.deleteMany({ where: { routineId: routine.id } });
      if (commitments.length === 0) return [];
      await tx.routineCommitment.createMany({
        data: commitments.map((c) => ({
          routineId: routine.id,
          category: c.category,
          dayOfWeek: c.dayOfWeek,
          startMinute: c.startMinute,
          endMinute: c.endMinute,
          flexibility: c.flexibility,
          note: (c.note || '').trim() || null,
        })),
      });
      return tx.routineCommitment.findMany({
        where: { routineId: routine.id },
        orderBy: [{ dayOfWeek: 'asc' }, { startMinute: 'asc' }],
      });
    });
  }

  async upsertDailyCheckIn(userId: string, payload: UpsertCheckInPayload) {
    const routine = await this.database.userRoutine.findUnique({ where: { userId } });
    if (!routine?.timezone) {
      throw new BadRequestException('timezone obrigatório para check-in.');
    }

    parseDateKey(payload.dateKey);
    assertNotTooFutureDateKey(
      payload.dateKey,
      routine.timezone,
      ROUTINE_ENGINE_LIMITS.checkIn.maxDaysInFutureAllowed,
    );

    const note = (payload.note || '').trim() || null;
    if (note && note.length > ROUTINE_ENGINE_LIMITS.checkIn.noteMaxLength) {
      throw new BadRequestException('note excede o limite.');
    }

    const clampRating = (v: number) =>
      Math.min(ROUTINE_ENGINE_LIMITS.checkIn.ratingMax, Math.max(ROUTINE_ENGINE_LIMITS.checkIn.ratingMin, v));

    const availableMinutesOverride =
      payload.availableMinutesOverride === undefined ? undefined : payload.availableMinutesOverride;

    return this.database.dailyCheckIn.upsert({
      where: {
        userId_dateKey: {
          userId,
          dateKey: payload.dateKey,
        },
      },
      update: {
        timezone: routine.timezone,
        energy: clampRating(payload.energy),
        focus: clampRating(payload.focus),
        fatigue: clampRating(payload.fatigue),
        availableMinutesOverride:
          availableMinutesOverride == null ? null : availableMinutesOverride,
        note,
        routineId: routine.id,
      },
      create: {
        userId,
        dateKey: payload.dateKey,
        timezone: routine.timezone,
        energy: clampRating(payload.energy),
        focus: clampRating(payload.focus),
        fatigue: clampRating(payload.fatigue),
        availableMinutesOverride:
          availableMinutesOverride == null ? null : availableMinutesOverride,
        note,
        routineId: routine.id,
      },
    });
  }

  async previewWeek(userId: string, payload: PreviewWeekPayload) {
    parseDateKey(payload.weekStartDate);
    const routine = await this.database.userRoutine.findUnique({
      where: { userId },
      include: {
        availabilityWindows: true,
        commitments: true,
      },
    });
    if (!routine) throw new NotFoundException();
    if (!routine.timezone) throw new BadRequestException('timezone obrigatório para preview.');

    const goal = await this.database.studyGoal.findUnique({ where: { userId } });

    const checkIn =
      payload.checkInDateKey && payload.checkInDateKey.trim()
        ? await this.database.dailyCheckIn.findUnique({
            where: {
              userId_dateKey: { userId, dateKey: payload.checkInDateKey.trim() },
            },
          })
        : null;

    const preferredSessionMinutes =
      routine.preferredSessionMinutes ?? ROUTINE_ENGINE_LIMITS.sessionMinutes.max;
    const planMode = routine.planMode ?? PlanMode.FLEXIBLE;
    const maxSubjectsPerDay = routine.maxSubjectsPerDay ?? 3;
    const badDayMinimumMinutes =
      routine.badDayMinimumMinutes ?? ROUTINE_ENGINE_LIMITS.dayClassification.lowCapacityBelowMinutes;
    const missedDayStrategy = routine.missedDayStrategy ?? MissedDayStrategy.REDISTRIBUTE;
    const peakEnergyPeriod = routine.peakEnergyPeriod ?? EnergyPeriod.MORNING;

    const engineInput = {
      timezone: routine.timezone,
      weekStartDate: payload.weekStartDate,
      preferences: {
        planMode,
        preferredSessionMinutes,
        maxSubjectsPerDay,
        badDayMinimumMinutes,
        missedDayStrategy,
        peakEnergyPeriod,
      },
      availabilityWindows: routine.availabilityWindows.map((w) => ({
        dayOfWeek: w.dayOfWeek,
        startMinute: w.startMinute,
        endMinute: w.endMinute,
        context: w.context,
        devices: w.devices,
        flexibility: w.flexibility,
        allowedActivities: w.allowedActivities,
      })),
      commitments: routine.commitments.map((c) => ({
        dayOfWeek: c.dayOfWeek,
        startMinute: c.startMinute,
        endMinute: c.endMinute,
        category: c.category,
        flexibility: c.flexibility,
      })),
      checkIn: checkIn
        ? {
            dateKey: checkIn.dateKey,
            energy: checkIn.energy,
            focus: checkIn.focus,
            fatigue: checkIn.fatigue,
            availableMinutesOverride: checkIn.availableMinutesOverride,
          }
        : null,
    };

    return {
      studyGoal: goal,
      routine,
      preview: computeWeeklyCapacity(engineInput),
    };
  }

  async strategicPreview(userId: string, payload: PreviewWeekPayload) {
    const capacity = await this.previewWeek(userId, payload);
    const contest = await this.database.contest.findFirst({
      where: { userId, status: { not: 'ARCHIVED' } },
      orderBy: { updatedAt: 'desc' },
      include: { nodes: true },
    });

    const preview = capacity.preview;
    const subjects = (contest?.nodes || []).filter((node) => node.type === 'SUBJECT');
    const topics = (contest?.nodes || []).filter((node) => node.type === 'TOPIC');
    const subtopics = (contest?.nodes || []).filter((node) => node.type === 'SUBTOPIC');
    const preferredSessionMinutes =
      capacity.routine.preferredSessionMinutes ?? ROUTINE_ENGINE_LIMITS.sessionMinutes.max;
    const weeklyMinutes = preview.weekly.sustainableMinutes;
    const examDate = contest?.examDate || capacity.studyGoal?.examDate || null;
    const now = new Date();
    const daysUntilExam = examDate
      ? Math.max(0, Math.ceil((examDate.getTime() - now.getTime()) / 86_400_000))
      : null;
    const weeksUntilExam =
      daysUntilExam == null ? null : Math.max(1, Math.ceil(daysUntilExam / 7));
    const studyUnits = Math.max(topics.length, subjects.length);
    const estimatedInitialPassMinutes = studyUnits * preferredSessionMinutes;
    const estimatedInitialPassWeeks =
      weeklyMinutes > 0 ? Math.max(1, Math.ceil(estimatedInitialPassMinutes / weeklyMinutes)) : null;

    let feasibilityStatus = 'NO_DATE';
    let feasibilityLabel = 'Defina a data da prova';
    let feasibilitySummary =
      'Com a data da prova, o Cortex consegue medir o ritmo necessário até o exame.';
    if (weeklyMinutes <= 0) {
      feasibilityStatus = 'NO_CAPACITY';
      feasibilityLabel = 'Capacidade ainda não calculada';
      feasibilitySummary = 'Revise os horários disponíveis para gerar uma base semanal.';
    } else if (weeksUntilExam != null && estimatedInitialPassWeeks != null) {
      if (estimatedInitialPassWeeks > weeksUntilExam) {
        feasibilityStatus = 'CRITICAL';
        feasibilityLabel = 'O prazo pede priorização';
        feasibilitySummary =
          'Não há espaço para tratar todo o conteúdo da mesma forma. O plano deve concentrar esforço no que tem maior impacto.';
      } else if (estimatedInitialPassWeeks > weeksUntilExam * 0.65) {
        feasibilityStatus = 'ATTENTION';
        feasibilityLabel = 'Plano viável com atenção';
        feasibilitySummary =
          'Há tempo para uma primeira cobertura, mas revisões e questões precisarão ser bem distribuídas.';
      } else {
        feasibilityStatus = 'VIABLE';
        feasibilityLabel = 'Você tem uma base viável';
        feasibilitySummary =
          'Sua capacidade atual permite cobrir o conteúdo e reservar espaço para revisão e prática.';
      }
    }

    const topicCountBySubject = new Map<string, number>();
    for (const topic of topics) {
      if (topic.parentId) {
        topicCountBySubject.set(
          topic.parentId,
          (topicCountBySubject.get(topic.parentId) || 0) + 1,
        );
      }
    }
    const weightedSubjects = subjects.map((subject) => {
      const topicCount = topicCountBySubject.get(subject.id) || 0;
      const hasBoardEvidence =
        subject.strategicPriority > 0 && subject.priorityCalculatedAt != null;
      return {
        subject,
        topicCount,
        hasBoardEvidence,
        weight: hasBoardEvidence ? subject.strategicPriority : Math.max(topicCount, 1),
      };
    });
    const totalWeight = weightedSubjects.reduce((sum, item) => sum + item.weight, 0);
    const recommendations = weightedSubjects
      .map((item) => {
        const recommendedWeeklyMinutes =
          totalWeight > 0 ? Math.round((weeklyMinutes * item.weight) / totalWeight) : 0;
        return {
          subjectId: item.subject.id,
          subject: item.subject.name,
          topicCount: item.topicCount,
          strategicPriority: Math.round(item.subject.strategicPriority),
          recommendedWeeklyMinutes,
          recommendedBlocks:
            recommendedWeeklyMinutes > 0
              ? Math.max(1, Math.round(recommendedWeeklyMinutes / preferredSessionMinutes))
              : 0,
          basis: item.hasBoardEvidence ? 'BOARD_INCIDENCE' : 'CONTENT_VOLUME',
          reason: item.hasBoardEvidence
            ? 'Prioridade calculada pelo perfil da banca e pela incidência disponível.'
            : 'Distribuição inicial pelo volume de tópicos; será refinada pelo seu desempenho.',
        };
      })
      .sort((a, b) => b.recommendedWeeklyMinutes - a.recommendedWeeklyMinutes);

    return {
      ...capacity,
      strategy: {
        contest: contest
          ? {
              id: contest.id,
              name: contest.name,
              targetJob: contest.selectedJob || contest.targetJob,
              board: contest.board,
            }
          : null,
        exam: {
          date: examDate,
          daysUntilExam,
          weeksUntilExam,
        },
        content: {
          subjectCount: subjects.length,
          topicCount: topics.length,
          subtopicCount: subtopics.length,
          estimatedInitialPassMinutes,
          estimatedInitialPassWeeks,
        },
        feasibility: {
          status: feasibilityStatus,
          label: feasibilityLabel,
          summary: feasibilitySummary,
          capacityUntilExamMinutes:
            weeksUntilExam == null ? null : weeklyMinutes * weeksUntilExam,
        },
        preferredSessionMinutes,
        recommendations,
        hasBoardEvidence: recommendations.some(
          (item) => item.basis === 'BOARD_INCIDENCE',
        ),
      },
    };
  }

  async completeOnboarding(userId: string) {
    const goal = await this.database.studyGoal.findUnique({ where: { userId } });
    if (!goal) throw new BadRequestException('StudyGoal obrigatório.');
    if (!goal.examDate && !goal.examDateUnknown) {
      throw new BadRequestException('StudyGoal inválido (examDate ou examDateUnknown).');
    }

    const routine = await this.database.userRoutine.findUnique({
      where: { userId },
      include: { availabilityWindows: true },
    });
    if (!routine) throw new BadRequestException('UserRoutine obrigatório.');

    const tz = (routine.timezone || '').trim();
    if (!tz || !isValidTimezone(tz)) {
      throw new BadRequestException('timezone obrigatório.');
    }

    if (routine.wantsDayOff && !routine.dayOffPreference) {
      throw new BadRequestException('dayOffPreference obrigatório quando wantsDayOff=true.');
    }
    if (!routine.wantsDayOff && routine.dayOffPreference != null) {
      throw new BadRequestException('dayOffPreference deve ser null quando wantsDayOff=false.');
    }

    if (!routine.preferredSessionMinutes) {
      throw new BadRequestException('preferredSessionMinutes obrigatório.');
    }
    if (!routine.planMode) throw new BadRequestException('planMode obrigatório.');
    if (!routine.maxSubjectsPerDay) throw new BadRequestException('maxSubjectsPerDay obrigatório.');
    if (!routine.badDayMinimumMinutes) {
      throw new BadRequestException('badDayMinimumMinutes obrigatório.');
    }
    if (!routine.missedDayStrategy) {
      throw new BadRequestException('missedDayStrategy obrigatório.');
    }
    if (!routine.peakEnergyPeriod) {
      throw new BadRequestException('peakEnergyPeriod obrigatório.');
    }

    if (!routine.availabilityWindows || routine.availabilityWindows.length === 0) {
      throw new BadRequestException('Pelo menos uma AvailabilityWindow é obrigatória.');
    }

    for (const w of routine.availabilityWindows) {
      assertMinuteRange(w.startMinute, w.endMinute);
      if (!w.allowedActivities || w.allowedActivities.length === 0) {
        throw new BadRequestException('allowedActivities obrigatório em cada janela.');
      }
    }
    assertNoOverlapByDayOfWeek(
      routine.availabilityWindows.map((w) => ({
        dayOfWeek: w.dayOfWeek,
        startMinute: w.startMinute,
        endMinute: w.endMinute,
      })),
    );

    const now = new Date();
    return this.database.$transaction(async (tx) => {
      const updatedRoutine = await tx.userRoutine.update({
        where: { id: routine.id },
        data: { routineOnboardingCompletedAt: now },
      });
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { onboardingVersion: 1 },
        select: { id: true, onboardingVersion: true },
      });
      return { user: updatedUser, routine: updatedRoutine };
    });
  }
}
