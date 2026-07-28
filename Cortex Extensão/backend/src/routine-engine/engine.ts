import { DayOfWeek, EnergyPeriod, MissedDayStrategy, PlanMode } from '@prisma/client';
import {
  ROUTINE_ENGINE_LIMITS,
  ROUTINE_ENGINE_REASON_CODES,
  ROUTINE_ENGINE_TIME_OF_DAY,
  ROUTINE_ENGINE_VERSION,
  RoutineEngineReasonCode,
} from './config';
import {
  Adjustment,
  AvailabilityWindowInput,
  DayCapacity,
  DiscardedMinutes,
  Interval,
  PeakMatch,
  RoutineCommitmentInput,
  WeeklyCapacity,
  WeeklyEngineInput,
} from './types';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function dayOfWeekFromDateKey(dateKey: string): DayOfWeek {
  const [y, m, d] = dateKey.split('-').map((v) => Number(v));
  const dt = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  const jsDay = dt.getUTCDay();
  const map: Record<number, DayOfWeek> = {
    0: DayOfWeek.SUN,
    1: DayOfWeek.MON,
    2: DayOfWeek.TUE,
    3: DayOfWeek.WED,
    4: DayOfWeek.THU,
    5: DayOfWeek.FRI,
    6: DayOfWeek.SAT,
  };
  return map[jsDay];
}

function addDaysDateKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map((v) => Number(v));
  const dt = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function energyPeriodForMinute(minute: number): EnergyPeriod {
  const m = ((minute % 1440) + 1440) % 1440;
  const ranges: Array<[EnergyPeriod, number, number]> = [
    [EnergyPeriod.MORNING, ROUTINE_ENGINE_TIME_OF_DAY.MORNING.startMinute, ROUTINE_ENGINE_TIME_OF_DAY.MORNING.endMinuteExclusive],
    [EnergyPeriod.AFTERNOON, ROUTINE_ENGINE_TIME_OF_DAY.AFTERNOON.startMinute, ROUTINE_ENGINE_TIME_OF_DAY.AFTERNOON.endMinuteExclusive],
    [EnergyPeriod.EVENING, ROUTINE_ENGINE_TIME_OF_DAY.EVENING.startMinute, ROUTINE_ENGINE_TIME_OF_DAY.EVENING.endMinuteExclusive],
  ];
  for (const [period, start, endExclusive] of ranges) {
    if (m >= start && m < endExclusive) return period;
  }
  return EnergyPeriod.NIGHT;
}

function peakMatchForInterval(startMinute: number, peakEnergyPeriod: EnergyPeriod): PeakMatch {
  const period = energyPeriodForMinute(startMinute);
  if (period === peakEnergyPeriod) return 'MATCHES_DECLARED_PEAK';

  const order: EnergyPeriod[] = [
    EnergyPeriod.MORNING,
    EnergyPeriod.AFTERNOON,
    EnergyPeriod.EVENING,
    EnergyPeriod.NIGHT,
  ];
  const idxA = order.indexOf(period);
  const idxB = order.indexOf(peakEnergyPeriod);
  const diff = Math.min(
    (idxA - idxB + order.length) % order.length,
    (idxB - idxA + order.length) % order.length,
  );
  if (diff === 1) return 'ADJACENT_TO_PEAK';
  return 'OUTSIDE_PEAK';
}

function subtractCommitmentFromInterval(
  interval: Interval,
  commitment: RoutineCommitmentInput,
): { intervals: Interval[]; removedMinutes: number } {
  const aStart = interval.startMinute;
  const aEnd = interval.endMinute;
  const bStart = commitment.startMinute;
  const bEnd = commitment.endMinute;

  const overlapStart = Math.max(aStart, bStart);
  const overlapEnd = Math.min(aEnd, bEnd);

  if (overlapEnd <= overlapStart) {
    return { intervals: [interval], removedMinutes: 0 };
  }

  const removedMinutes = overlapEnd - overlapStart;
  const result: Interval[] = [];

  if (aStart < overlapStart) {
    result.push({ ...interval, startMinute: aStart, endMinute: overlapStart });
  }
  if (overlapEnd < aEnd) {
    result.push({ ...interval, startMinute: overlapEnd, endMinute: aEnd });
  }

  return { intervals: result, removedMinutes };
}

function buildInitialIntervals(
  windows: AvailabilityWindowInput[],
  peakEnergyPeriod: EnergyPeriod,
): Interval[] {
  return windows.map((w) => ({
    startMinute: w.startMinute,
    endMinute: w.endMinute,
    allowedActivities: w.allowedActivities,
    devices: w.devices,
    peakMatch: peakMatchForInterval(w.startMinute, peakEnergyPeriod),
  }));
}

function buildBlocksForIntervals(
  intervals: Interval[],
  recommendedSessionMinutes: number,
): { blocks: number[]; discarded: DiscardedMinutes[] } {
  const blocks: number[] = [];
  const discarded: DiscardedMinutes[] = [];

  for (const it of intervals) {
    let remaining = it.endMinute - it.startMinute;
    while (remaining >= recommendedSessionMinutes) {
      blocks.push(recommendedSessionMinutes);
      remaining -= recommendedSessionMinutes;
    }
    if (remaining >= ROUTINE_ENGINE_LIMITS.sessionMinutes.min) {
      blocks.push(remaining);
    } else if (remaining > 0) {
      discarded.push({
        minutes: remaining,
        reasonCode: ROUTINE_ENGINE_REASON_CODES.RESIDUAL_BELOW_MIN_SESSION,
      });
    }
  }

  return { blocks, discarded };
}

function totalMinutes(intervals: Interval[]): number {
  return intervals.reduce((acc, it) => acc + (it.endMinute - it.startMinute), 0);
}

function applyCheckInCap(
  intervals: Interval[],
  capMinutes: number,
  peakEnergyPeriod: EnergyPeriod,
): { intervals: Interval[]; adjustments: Adjustment[] } {
  const before = totalMinutes(intervals);
  if (capMinutes >= before) {
    return {
      intervals,
      adjustments: [
        {
          stage: 'CHECKIN_CAP',
          minutesBefore: before,
          minutesAfter: before,
          reasonCode: ROUTINE_ENGINE_REASON_CODES.CHECKIN_OVERRIDE_IGNORED_EXCEEDS_CAPACITY,
        },
      ],
    };
  }

  let toRemove = before - capMinutes;

  const order: Record<PeakMatch, number> = {
    OUTSIDE_PEAK: 0,
    ADJACENT_TO_PEAK: 1,
    MATCHES_DECLARED_PEAK: 2,
  };

  const ranked = intervals
    .map((it, idx) => ({ it, idx }))
    .sort((a, b) => {
      const aa = order[a.it.peakMatch];
      const bb = order[b.it.peakMatch];
      if (aa !== bb) return aa - bb;
      return b.idx - a.idx;
    });

  const mutated = intervals.map((it) => ({ ...it }));

  for (const { it, idx } of ranked) {
    if (toRemove <= 0) break;
    const len = it.endMinute - it.startMinute;
    if (len <= toRemove) {
      mutated[idx] = { ...it, startMinute: 0, endMinute: 0, peakMatch: peakMatchForInterval(0, peakEnergyPeriod) };
      toRemove -= len;
      continue;
    }
    mutated[idx] = { ...it, endMinute: it.endMinute - toRemove };
    toRemove = 0;
  }

  const cleaned = mutated.filter((it) => it.endMinute > it.startMinute);
  const after = totalMinutes(cleaned);

  return {
    intervals: cleaned,
    adjustments: [
      {
        stage: 'CHECKIN_CAP',
        minutesBefore: before,
        minutesAfter: after,
        reasonCode: ROUTINE_ENGINE_REASON_CODES.CHECKIN_CAP_APPLIED,
      },
    ],
  };
}

function isHighConstraintDay(gross: number, net: number): boolean {
  const reduction = gross - net;
  if (reduction <= 0) return false;
  const ratio = reduction / gross;
  if (ratio >= ROUTINE_ENGINE_LIMITS.dayClassification.highConstraint.reductionRatioThreshold) return true;
  if (reduction >= ROUTINE_ENGINE_LIMITS.dayClassification.highConstraint.reductionMinutesThreshold) return true;
  return false;
}

export function computeWeeklyCapacity(input: WeeklyEngineInput): WeeklyCapacity {
  const recommendedSessionMinutes = clamp(
    input.preferences.preferredSessionMinutes,
    ROUTINE_ENGINE_LIMITS.sessionMinutes.min,
    ROUTINE_ENGINE_LIMITS.sessionMinutes.max,
  );

  const days: DayCapacity[] = [];

  for (let i = 0; i < 7; i++) {
    const dateKey = addDaysDateKey(input.weekStartDate, i);
    const dayOfWeek = dayOfWeekFromDateKey(dateKey);

    const windows = input.availabilityWindows.filter((w) => w.dayOfWeek === dayOfWeek);
    const commitments = input.commitments.filter((c) => c.dayOfWeek === dayOfWeek);

    const grossIntervals = buildInitialIntervals(windows, input.preferences.peakEnergyPeriod);
    const grossMinutes = totalMinutes(grossIntervals);

    let intervals = grossIntervals;
    let removedMinutes = 0;
    for (const c of commitments) {
      const next: Interval[] = [];
      for (const it of intervals) {
        const r = subtractCommitmentFromInterval(it, c);
        removedMinutes += r.removedMinutes;
        next.push(...r.intervals);
      }
      intervals = next;
    }

    const netMinutes = totalMinutes(intervals);
    const adjustments: Adjustment[] = [];
    if (removedMinutes > 0) {
      adjustments.push({
        stage: 'SUBTRACT_COMMITMENTS',
        minutesBefore: grossMinutes,
        minutesAfter: netMinutes,
        reasonCode: ROUTINE_ENGINE_REASON_CODES.COMMITMENT_INTERSECTION_REMOVED,
      });
    }

    adjustments.push({
      stage: 'DECLARED_ONLY',
      minutesBefore: netMinutes,
      minutesAfter: netMinutes,
      reasonCode: ROUTINE_ENGINE_REASON_CODES.DECLARED_ONLY_NO_MINUTE_REDUCTION,
    });

    let finalIntervals = intervals;

    const checkIn = input.checkIn && input.checkIn.dateKey === dateKey ? input.checkIn : null;
    if (checkIn?.availableMinutesOverride != null) {
      const cap = clamp(
        checkIn.availableMinutesOverride,
        ROUTINE_ENGINE_LIMITS.checkIn.availableMinutesOverride.min,
        ROUTINE_ENGINE_LIMITS.checkIn.availableMinutesOverride.max,
      );
      const applied = applyCheckInCap(finalIntervals, cap, input.preferences.peakEnergyPeriod);
      finalIntervals = applied.intervals;
      adjustments.push(...applied.adjustments);
    }

    const built = buildBlocksForIntervals(finalIntervals, recommendedSessionMinutes);

    const sustainableMinutes = netMinutes;

    days.push({
      dateKey,
      dayOfWeek,
      grossMinutes,
      netMinutes,
      sustainableMinutes,
      recommendedSessionMinutes,
      finalIntervals,
      blocks: built.blocks,
      discardedMinutes: built.discarded,
      adjustments,
    });
  }

  const weeklyGross = days.reduce((acc, d) => acc + d.grossMinutes, 0);
  const weeklyNet = days.reduce((acc, d) => acc + d.netMinutes, 0);
  const weeklySustainable = days.reduce((acc, d) => acc + d.sustainableMinutes, 0);
  const weeklyBlocks = days.reduce((acc, d) => acc + d.blocks.length, 0);

  const daysWithoutAvailability = days
    .filter((d) => d.netMinutes === 0)
    .map((d) => d.dayOfWeek);

  const lowCapacityDays = days
    .filter((d) => d.netMinutes > 0 && d.netMinutes < ROUTINE_ENGINE_LIMITS.dayClassification.lowCapacityBelowMinutes)
    .map((d) => d.dayOfWeek);

  const highConstraintDays = days
    .filter((d) => isHighConstraintDay(d.grossMinutes, d.netMinutes))
    .map((d) => d.dayOfWeek);

  return {
    engineVersion: ROUTINE_ENGINE_VERSION,
    confidence: 'DECLARED_ONLY',
    timezone: input.timezone,
    weekStartDate: input.weekStartDate,
    weekly: {
      grossMinutes: weeklyGross,
      netMinutes: weeklyNet,
      sustainableMinutes: weeklySustainable,
      maximumBlocks: weeklyBlocks,
      maxSubjectsPerDay: input.preferences.maxSubjectsPerDay,
    },
    days,
    classifications: {
      daysWithoutAvailability,
      lowCapacityDays,
      highConstraintDays,
    },
  };
}
