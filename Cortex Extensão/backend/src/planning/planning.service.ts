import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { computeWeeklyCapacity } from '../routine-engine/engine';

type TaskType = 'revision' | 'reading' | 'questions';
type PeakEnergyTime = 'MANHA' | 'TARDE' | 'NOITE';
type FatigueLevel = 'BAIXO' | 'MEDIO' | 'ALTO';

type PlanningProfile = {
  dailyStudyHours: number;
  peakEnergyTime: PeakEnergyTime;
  fatigueLevel: FatigueLevel;
  works: boolean;
};

type SubjectInsight = {
  subject: string;
  topic: string;
  attempts: number;
  accuracy: number;
  hesitationRate: number;
  avgLatencySeconds: number;
  daysSinceLastAttempt: number;
  priority: number;
  recommendedTaskType: TaskType;
  reason: string;
};

type ScheduleTask = {
  id: string;
  date: string;
  weekdayLabel: string;
  startsAt: string;
  subject: string;
  topic: string;
  type: TaskType;
  duration: number;
  priority: number;
  reason: string;
  status: 'pending';
};

type PlanningProfileInput = Partial<{
  dailyStudyHours: number;
  peakEnergyTime: PeakEnergyTime;
  fatigueLevel: FatigueLevel;
  works: boolean;
}>;

@Injectable()
export class PlanningService {
  constructor(private readonly database: DatabaseService) {}

  async generateScheduleForUser(userId: string, payload: unknown) {
    const profileInput = this.normalizeProfileInput(payload);

    const currentUser = await this.database.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        dailyStudyHours: true,
        peakEnergyTime: true,
        fatigueLevel: true,
        works: true,
      },
    });

    if (!currentUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const effectiveUser =
      Object.keys(profileInput).length > 0
        ? await this.database.user.update({
            where: { id: userId },
            data: profileInput,
            select: {
              id: true,
              dailyStudyHours: true,
              peakEnergyTime: true,
              fatigueLevel: true,
              works: true,
            },
          })
        : currentUser;

    const profile = this.buildProfile(effectiveUser);

    const attempts = await this.database.questionAttempt.findMany({
      where: { userId },
      take: 120,
      orderBy: { createdAt: 'desc' },
      include: {
        question: {
          select: {
            subject: { select: { name: true } },
            topic: { select: { name: true } },
          },
        },
      },
    });

    const [routine, contest] = await Promise.all([
      this.database.userRoutine.findUnique({
        where: { userId },
        include: { availabilityWindows: true, commitments: true },
      }),
      this.database.contest.findFirst({
        where: { userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        include: { nodes: { where: { type: 'SUBJECT' }, orderBy: { strategicPriority: 'desc' }, include: { children: { orderBy: { strategicPriority: 'desc' } } } } },
      }),
    ]);

    const adaptiveInsights = this.buildAdaptiveInsights(attempts);
    if (!contest) {
      throw new BadRequestException(
        'Confirme um edital e um cargo antes de gerar o primeiro ciclo.',
      );
    }
    if (!contest.nodes.length) {
      throw new BadRequestException(
        'O cargo selecionado ainda não possui matérias estruturadas e revisadas.',
      );
    }
    const editalInsights = (contest?.nodes || []).map((node) => {
      const topTopic = node.children[0];
      const priority = Math.round(node.strategicPriority || topTopic?.strategicPriority || 55);
      return {
      subject: node.name,
      topic: topTopic?.name || 'Fundamentos',
      attempts: 0, accuracy: 0, hesitationRate: 0, avgLatencySeconds: 0,
      daysSinceLastAttempt: 99, priority, recommendedTaskType: 'reading' as TaskType,
      reason: priority > 0 ? 'Prioridade calculada pela incidência e recência da banca no edital confirmado.' : 'Matéria do edital confirmado. Vamos construir sua base.',
    }; });
    const adaptiveBySubject = new Map(
      adaptiveInsights.map((item) => [item.subject, item]),
    );
    const insights = editalInsights.map((editalInsight) => {
      const observed = adaptiveBySubject.get(editalInsight.subject);
      return observed
        ? {
            ...editalInsight,
            attempts: observed.attempts,
            accuracy: observed.accuracy,
            hesitationRate: observed.hesitationRate,
            avgLatencySeconds: observed.avgLatencySeconds,
            daysSinceLastAttempt: observed.daysSinceLastAttempt,
            recommendedTaskType: observed.recommendedTaskType,
            reason: observed.reason,
            priority: Math.round(
              editalInsight.priority * 0.7 + observed.priority * 0.3,
            ),
          }
        : editalInsight;
    });
    const schedule = routine?.timezone && routine.availabilityWindows.length > 0
      ? this.buildScheduleFromRoutine(insights, routine)
      : this.buildSchedule(insights, profile);
    const sortedInsights = [...insights].sort((a, b) => b.priority - a.priority);
    const strongestSubject =
      sortedInsights.length > 0
        ? [...sortedInsights].sort((a, b) => b.accuracy - a.accuracy)[0]?.subject || null
        : null;
    const weakestSubject =
      sortedInsights.length > 0
        ? [...sortedInsights].sort((a, b) => a.accuracy - b.accuracy)[0]?.subject || null
        : null;

    return {
      generatedAt: new Date().toISOString(),
      profile,
      summary: {
        mode: attempts.length > 0 ? 'adaptativo' : 'inicial',
        totalAttempts: attempts.length,
        dailyMinutes: schedule.dailyMinutes,
        weeklyMinutes: schedule.dailyMinutes * 7,
        blockMinutes: schedule.blockMinutes,
        examDate: contest?.examDate?.toISOString().slice(0, 10) || null,
        daysUntilExam: contest?.examDate ? Math.max(0, Math.ceil((contest.examDate.getTime() - Date.now()) / 86_400_000)) : null,
        strongestSubject,
        weakestSubject,
        subjectsInFocus: sortedInsights.slice(0, 4).map((item) => item.subject),
      },
      insights: sortedInsights.slice(0, 6),
      schedule: schedule.tasks,
    };
  }

  private buildProfile(user: {
    dailyStudyHours: number | null;
    peakEnergyTime: string | null;
    fatigueLevel: string | null;
    works: boolean;
  }): PlanningProfile {
    return {
      dailyStudyHours: this.clamp(Math.round(user.dailyStudyHours ?? 2), 1, 8),
      peakEnergyTime: this.normalizePeakEnergyTime(user.peakEnergyTime),
      fatigueLevel: this.normalizeFatigueLevel(user.fatigueLevel),
      works: Boolean(user.works),
    };
  }

  private buildAdaptiveInsights(
    attempts: Array<{
      isCorrect: boolean;
      hesitationDetected: boolean | null;
      latencyMs: number | null;
      createdAt: Date;
      question: {
        subject: { name: string } | null;
        topic: { name: string } | null;
      } | null;
    }>,
  ): SubjectInsight[] {
    const grouped = new Map<
      string,
      {
        subject: string;
        attempts: number;
        correct: number;
        hesitation: number;
        totalLatencyMs: number;
        lastAttemptAt: Date;
        topics: Map<string, number>;
      }
    >();

    for (const attempt of attempts) {
      const subject = attempt.question?.subject?.name || 'Estudo Geral';
      const topic = attempt.question?.topic?.name || 'Tópico Livre';
      const current = grouped.get(subject) || {
        subject,
        attempts: 0,
        correct: 0,
        hesitation: 0,
        totalLatencyMs: 0,
        lastAttemptAt: attempt.createdAt,
        topics: new Map<string, number>(),
      };

      current.attempts += 1;
      current.correct += attempt.isCorrect ? 1 : 0;
      current.hesitation += attempt.hesitationDetected ? 1 : 0;
      current.totalLatencyMs += attempt.latencyMs || 0;
      if (attempt.createdAt > current.lastAttemptAt) {
        current.lastAttemptAt = attempt.createdAt;
      }
      current.topics.set(topic, (current.topics.get(topic) || 0) + 1);
      grouped.set(subject, current);
    }

    return [...grouped.values()].map((item) => {
      const accuracy = item.correct / item.attempts;
      const hesitationRate = item.hesitation / item.attempts;
      const avgLatencySeconds =
        item.totalLatencyMs > 0 ? item.totalLatencyMs / item.attempts / 1000 : 0;
      const daysSinceLastAttempt = this.getDaysSince(item.lastAttemptAt);
      const coveragePenalty = Math.max(0, 1 - item.attempts / 6);
      const stalenessBonus = Math.min(1, daysSinceLastAttempt / 7);
      const latencyPenalty = Math.min(1, avgLatencySeconds / 120);

      const priority = Math.round(
        45 * (1 - accuracy) +
          20 * hesitationRate +
          15 * coveragePenalty +
          10 * stalenessBonus +
          10 * latencyPenalty,
      );

      return {
        subject: item.subject,
        topic: this.getTopTopic(item.topics),
        attempts: item.attempts,
        accuracy: Number(accuracy.toFixed(2)),
        hesitationRate: Number(hesitationRate.toFixed(2)),
        avgLatencySeconds: Number(avgLatencySeconds.toFixed(1)),
        daysSinceLastAttempt,
        priority,
        recommendedTaskType: this.getRecommendedTaskType({
          attempts: item.attempts,
          accuracy,
          hesitationRate,
        }),
        reason: this.buildReason({
          accuracy,
          attempts: item.attempts,
          hesitationRate,
          daysSinceLastAttempt,
        }),
      };
    });
  }

  private buildSchedule(
    insights: SubjectInsight[],
    profile: PlanningProfile,
  ): { dailyMinutes: number; blockMinutes: number; tasks: ScheduleTask[] } {
    const dailyMinutes = this.getDailyMinutes(profile);
    const blockMinutes = this.getBlockMinutes(dailyMinutes);
    const blocksPerDay = Math.max(1, Math.min(4, Math.round(dailyMinutes / blockMinutes)));
    const totalBlocks = blocksPerDay * 7;
    const blockTargets = this.allocateBlocks(insights, totalBlocks);
    const taskQueue = this.buildTaskQueue(insights, blockTargets);
    const slots = this.getTimeSlots(profile.peakEnergyTime);
    const tasks: ScheduleTask[] = [];

    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
      for (let slotIndex = 0; slotIndex < blocksPerDay; slotIndex += 1) {
        const nextTask = taskQueue.shift();
        if (!nextTask) {
          break;
        }

        const date = this.addDays(new Date(), dayOffset);
        tasks.push({
          id: `task-${dayOffset + 1}-${slotIndex + 1}-${nextTask.subject}`,
          date: this.toDateKey(date),
          weekdayLabel: this.getWeekdayLabel(date),
          startsAt: slots[slotIndex] || slots[slots.length - 1],
          subject: nextTask.subject,
          topic: nextTask.topic,
          type: nextTask.type,
          duration: blockMinutes,
          priority: nextTask.priority,
          reason: nextTask.reason,
          status: 'pending',
        });
      }
    }

    return {
      dailyMinutes,
      blockMinutes,
      tasks,
    };
  }

  private buildScheduleFromRoutine(insights: SubjectInsight[], routine: any): { dailyMinutes: number; blockMinutes: number; tasks: ScheduleTask[] } {
    const capacity = computeWeeklyCapacity({
      timezone: routine.timezone,
      weekStartDate: this.toDateKey(new Date()),
      preferences: {
        planMode: routine.planMode || 'FLEXIBLE',
        preferredSessionMinutes: routine.preferredSessionMinutes || 40,
        maxSubjectsPerDay: routine.maxSubjectsPerDay || 3,
        badDayMinimumMinutes: routine.badDayMinimumMinutes || 20,
        missedDayStrategy: routine.missedDayStrategy || 'REDISTRIBUTE',
        peakEnergyPeriod: routine.peakEnergyPeriod || 'MORNING',
      },
      availabilityWindows: routine.availabilityWindows,
      commitments: routine.commitments,
      checkIn: null,
    } as any);
    const slots: Array<{ date: string; startsAt: string; duration: number }> = [];
    for (const day of capacity.days) {
      let blockIndex = 0;
      for (const interval of day.finalIntervals) {
        let cursor = interval.startMinute;
        while (blockIndex < day.blocks.length && cursor + day.blocks[blockIndex] <= interval.endMinute) {
          slots.push({ date: day.dateKey, startsAt: `${String(Math.floor(cursor / 60)).padStart(2, '0')}:${String(cursor % 60).padStart(2, '0')}`, duration: day.blocks[blockIndex] });
          cursor += day.blocks[blockIndex++];
        }
      }
    }
    const targets = this.allocateBlocks(insights, slots.length);
    const queue = this.buildTaskQueue(insights, targets);
    const tasks = slots.map((slot, index) => {
      const next = queue[index];
      const date = new Date(`${slot.date}T12:00:00`);
      return { id: `routine-${index + 1}-${next.subject}`, date: slot.date, weekdayLabel: this.getWeekdayLabel(date), startsAt: slot.startsAt, subject: next.subject, topic: next.topic, type: next.type, duration: slot.duration, priority: next.priority, reason: next.reason, status: 'pending' as const };
    });
    return { dailyMinutes: Math.round(capacity.weekly.sustainableMinutes / 7), blockMinutes: routine.preferredSessionMinutes || 40, tasks };
  }

  private buildTaskQueue(
    insights: SubjectInsight[],
    blockTargets: Map<string, number>,
  ): Array<{
    subject: string;
    topic: string;
    type: TaskType;
    priority: number;
    reason: string;
  }> {
    const queue: Array<{
      subject: string;
      topic: string;
      type: TaskType;
      priority: number;
      reason: string;
    }> = [];
    const repeats = new Map<string, number>();
    const orderedInsights = [...insights].sort((a, b) => b.priority - a.priority);
    let pending = [...blockTargets.values()].reduce((sum, value) => sum + value, 0);

    while (pending > 0) {
      let addedInRound = false;

      for (const insight of orderedInsights) {
        const remaining = blockTargets.get(insight.subject) || 0;
        const lastSubject = queue[queue.length - 1]?.subject;
        if (remaining <= 0) {
          continue;
        }
        if (lastSubject === insight.subject && orderedInsights.some((item) => (blockTargets.get(item.subject) || 0) > 0 && item.subject !== insight.subject)) {
          continue;
        }

        const repeatIndex = repeats.get(insight.subject) || 0;
        queue.push({
          subject: insight.subject,
          topic: insight.topic,
          type: this.getTaskTypeForRepeat(insight, repeatIndex),
          priority: insight.priority,
          reason: insight.reason,
        });
        repeats.set(insight.subject, repeatIndex + 1);
        blockTargets.set(insight.subject, remaining - 1);
        pending -= 1;
        addedInRound = true;
      }

      if (!addedInRound) {
        break;
      }
    }

    return queue;
  }

  private allocateBlocks(
    insights: SubjectInsight[],
    totalBlocks: number,
  ): Map<string, number> {
    const allocation = new Map<string, number>();
    const safeTotalBlocks = Math.max(0, Math.floor(totalBlocks));

    for (const insight of insights) {
      allocation.set(insight.subject, 0);
    }

    if (safeTotalBlocks === 0 || insights.length === 0) {
      return allocation;
    }

    const ordered = [...insights].sort((a, b) => b.priority - a.priority);
    let remaining = safeTotalBlocks;

    for (const insight of ordered) {
      if (remaining === 0) break;
      allocation.set(insight.subject, 1);
      remaining -= 1;
    }

    const totalPriority = ordered.reduce(
      (sum, item) => sum + Math.max(item.priority, 1),
      0,
    );

    while (remaining > 0) {
      for (const insight of ordered) {
        if (remaining === 0) break;
        const share = Math.max(insight.priority, 1) / totalPriority;
        const granted = Math.min(Math.max(1, Math.round(share * remaining)), remaining);
        allocation.set(insight.subject, (allocation.get(insight.subject) || 0) + granted);
        remaining -= granted;
      }
    }

    return allocation;
  }

  private getDailyMinutes(profile: PlanningProfile): number {
    let minutes = profile.dailyStudyHours * 60;

    if (profile.works) {
      minutes *= 0.8;
    }

    if (profile.fatigueLevel === 'ALTO') {
      minutes *= 0.75;
    } else if (profile.fatigueLevel === 'MEDIO') {
      minutes *= 0.9;
    }

    return this.clamp(Math.round(minutes), 45, 240);
  }

  private getBlockMinutes(dailyMinutes: number): number {
    if (dailyMinutes >= 180) {
      return 45;
    }
    if (dailyMinutes >= 120) {
      return 40;
    }
    return 30;
  }

  private getTimeSlots(peakEnergyTime: PeakEnergyTime): string[] {
    if (peakEnergyTime === 'MANHA') {
      return ['06:30', '07:20', '08:10', '09:00'];
    }
    if (peakEnergyTime === 'TARDE') {
      return ['13:30', '14:20', '15:10', '16:00'];
    }
    return ['19:00', '19:50', '20:40', '21:30'];
  }

  private getTaskTypeForRepeat(insight: SubjectInsight, repeatIndex: number): TaskType {
    if (insight.recommendedTaskType === 'reading') {
      return repeatIndex === 0 ? 'reading' : 'questions';
    }
    if (insight.recommendedTaskType === 'revision') {
      return repeatIndex % 2 === 0 ? 'revision' : 'questions';
    }
    return repeatIndex % 3 === 2 ? 'revision' : 'questions';
  }

  private getRecommendedTaskType(input: {
    attempts: number;
    accuracy: number;
    hesitationRate: number;
  }): TaskType {
    if (input.attempts < 3) {
      return 'questions';
    }
    if (input.accuracy < 0.55 || input.hesitationRate > 0.4) {
      return 'revision';
    }
    return 'questions';
  }

  private buildReason(input: {
    accuracy: number;
    attempts: number;
    hesitationRate: number;
    daysSinceLastAttempt: number;
  }): string {
    if (input.attempts < 3) {
      return 'Pouco histórico nesta matéria. Vamos usar mais blocos para calibrar seu desempenho.';
    }
    if (input.accuracy < 0.55) {
      return 'Baixa taxa de acerto recente. Priorizei revisão com reforço imediato.';
    }
    if (input.hesitationRate > 0.4) {
      return 'Você vem hesitando bastante nesta matéria. O plano reforça consolidação e confiança.';
    }
    if (input.daysSinceLastAttempt >= 5) {
      return 'Matéria sem contato recente. O cronograma adiciona revisão para evitar esquecimento.';
    }
    return 'Matéria mantida no foco para sustentar constância e ganho progressivo.';
  }

  private getTopTopic(topics: Map<string, number>): string {
    const ordered = [...topics.entries()].sort((a, b) => b[1] - a[1]);
    return ordered[0]?.[0] || 'Tópico Livre';
  }

  private getDaysSince(date: Date): number {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  private normalizeProfileInput(payload: unknown): PlanningProfileInput {
    const source =
      payload && typeof payload === 'object' && 'profile' in payload
        ? (payload as { profile?: unknown }).profile
        : payload;

    if (!source || typeof source !== 'object') {
      return {};
    }

    const input = source as Record<string, unknown>;
    const normalized: PlanningProfileInput = {};

    if (typeof input.dailyStudyHours === 'number' && Number.isFinite(input.dailyStudyHours)) {
      normalized.dailyStudyHours = this.clamp(Math.round(input.dailyStudyHours), 1, 8);
    }

    if (typeof input.works === 'boolean') {
      normalized.works = input.works;
    }

    if (typeof input.peakEnergyTime === 'string') {
      normalized.peakEnergyTime = this.normalizePeakEnergyTime(input.peakEnergyTime);
    }

    if (typeof input.fatigueLevel === 'string') {
      normalized.fatigueLevel = this.normalizeFatigueLevel(input.fatigueLevel);
    }

    return normalized;
  }

  private normalizePeakEnergyTime(value: string | null | undefined): PeakEnergyTime {
    const normalized = (value || '').toUpperCase();
    if (normalized.includes('TARD')) {
      return 'TARDE';
    }
    if (normalized.includes('NOIT')) {
      return 'NOITE';
    }
    return 'MANHA';
  }

  private normalizeFatigueLevel(value: string | null | undefined): FatigueLevel {
    const normalized = (value || '').toUpperCase();
    if (normalized.includes('ALT')) {
      return 'ALTO';
    }
    if (normalized.includes('BAIX')) {
      return 'BAIXO';
    }
    return 'MEDIO';
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  private addDays(base: Date, days: number): Date {
    const next = new Date(base);
    next.setDate(base.getDate() + days);
    return next;
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getWeekdayLabel(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date);
  }
}
