import {
  AllowedActivity,
  CommitmentCategory,
  DayOfWeek,
  DeviceType,
  EnergyPeriod,
  PlanMode,
  StudyContext,
  WindowFlexibility,
} from '@prisma/client';
import { computeWeeklyCapacity } from './engine';

function baseInput() {
  return {
    timezone: 'America/Sao_Paulo',
    weekStartDate: '1970-01-05',
    preferences: {
      planMode: PlanMode.RIGID,
      preferredSessionMinutes: 45,
      maxSubjectsPerDay: 3,
      badDayMinimumMinutes: 20,
      missedDayStrategy: 'REDISTRIBUTE',
      peakEnergyPeriod: EnergyPeriod.MORNING,
    },
    availabilityWindows: [],
    commitments: [],
    checkIn: null,
  } as const;
}

describe('RoutineEngine', () => {
  it('divide blocos por intervalo e aproveita residual >= 20', () => {
    const input = baseInput();
    const result = computeWeeklyCapacity({
      ...input,
      availabilityWindows: [
        {
          dayOfWeek: DayOfWeek.MON,
          startMinute: 0,
          endMinute: 70,
          context: StudyContext.HOME,
          devices: [DeviceType.LAPTOP],
          flexibility: WindowFlexibility.STRICT,
          allowedActivities: [AllowedActivity.THEORY],
        },
      ],
    });

    const day = result.days.find((d) => d.dayOfWeek === DayOfWeek.MON);
    expect(day).toBeTruthy();
    expect(day?.blocks).toEqual([45, 25]);
    expect(day?.discardedMinutes).toHaveLength(0);
  });

  it('descarta residual < 20 dentro do próprio intervalo', () => {
    const input = baseInput();
    const result = computeWeeklyCapacity({
      ...input,
      availabilityWindows: [
        {
          dayOfWeek: DayOfWeek.MON,
          startMinute: 0,
          endMinute: 64,
          context: StudyContext.HOME,
          devices: [DeviceType.LAPTOP],
          flexibility: WindowFlexibility.STRICT,
          allowedActivities: [AllowedActivity.THEORY],
        },
      ],
    });

    const day = result.days.find((d) => d.dayOfWeek === DayOfWeek.MON);
    expect(day).toBeTruthy();
    expect(day?.blocks).toEqual([45]);
    expect(day?.discardedMinutes).toEqual([
      { minutes: 19, reasonCode: 'RESIDUAL_BELOW_MIN_SESSION' },
    ]);
  });

  it('não soma intervalos separados para formar um bloco contínuo', () => {
    const input = baseInput();
    const result = computeWeeklyCapacity({
      ...input,
      preferences: { ...input.preferences, preferredSessionMinutes: 60 },
      availabilityWindows: [
        {
          dayOfWeek: DayOfWeek.MON,
          startMinute: 0,
          endMinute: 30,
          context: StudyContext.HOME,
          devices: [DeviceType.LAPTOP],
          flexibility: WindowFlexibility.STRICT,
          allowedActivities: [AllowedActivity.THEORY],
        },
        {
          dayOfWeek: DayOfWeek.MON,
          startMinute: 60,
          endMinute: 90,
          context: StudyContext.HOME,
          devices: [DeviceType.LAPTOP],
          flexibility: WindowFlexibility.STRICT,
          allowedActivities: [AllowedActivity.THEORY],
        },
      ],
    });

    const day = result.days.find((d) => d.dayOfWeek === DayOfWeek.MON);
    expect(day).toBeTruthy();
    expect(day?.blocks).toEqual([30, 30]);
  });

  it('subtrai compromissos apenas na interseção e divide intervalos', () => {
    const input = baseInput();
    const result = computeWeeklyCapacity({
      ...input,
      preferences: { ...input.preferences, preferredSessionMinutes: 60 },
      availabilityWindows: [
        {
          dayOfWeek: DayOfWeek.MON,
          startMinute: 0,
          endMinute: 120,
          context: StudyContext.HOME,
          devices: [DeviceType.LAPTOP],
          flexibility: WindowFlexibility.STRICT,
          allowedActivities: [AllowedActivity.THEORY],
        },
      ],
      commitments: [
        {
          dayOfWeek: DayOfWeek.MON,
          startMinute: 30,
          endMinute: 60,
          category: CommitmentCategory.WORK,
          flexibility: WindowFlexibility.STRICT,
        },
      ],
    });

    const day = result.days.find((d) => d.dayOfWeek === DayOfWeek.MON);
    expect(day).toBeTruthy();
    expect(day?.netMinutes).toBe(90);
    expect(day?.finalIntervals.map((i) => [i.startMinute, i.endMinute])).toEqual([
      [0, 30],
      [60, 120],
    ]);
    expect(day?.blocks).toEqual([30, 60]);
  });

  it('aplica check-in como teto de capacidade e remove primeiro intervalos fora do pico', () => {
    const input = baseInput();
    const result = computeWeeklyCapacity({
      ...input,
      preferences: { ...input.preferences, preferredSessionMinutes: 60 },
      availabilityWindows: [
        {
          dayOfWeek: DayOfWeek.MON,
          startMinute: 300,
          endMinute: 360,
          context: StudyContext.HOME,
          devices: [DeviceType.LAPTOP],
          flexibility: WindowFlexibility.STRICT,
          allowedActivities: [AllowedActivity.THEORY],
        },
        {
          dayOfWeek: DayOfWeek.MON,
          startMinute: 1020,
          endMinute: 1080,
          context: StudyContext.HOME,
          devices: [DeviceType.LAPTOP],
          flexibility: WindowFlexibility.STRICT,
          allowedActivities: [AllowedActivity.THEORY],
        },
      ],
      checkIn: {
        dateKey: '1970-01-05',
        energy: 3,
        focus: 3,
        fatigue: 3,
        availableMinutesOverride: 60,
      },
    });

    const day = result.days.find((d) => d.dayOfWeek === DayOfWeek.MON);
    expect(day).toBeTruthy();
    expect(day?.finalIntervals).toHaveLength(1);
    expect(day?.finalIntervals[0].startMinute).toBe(300);
    expect(day?.blocks).toEqual([60]);
    expect(day?.adjustments.some((a) => a.reasonCode === 'CHECKIN_CAP_APPLIED')).toBe(
      true,
    );
  });

  it('ignora check-in quando availableMinutesOverride excede a capacidade calculada', () => {
    const input = baseInput();
    const result = computeWeeklyCapacity({
      ...input,
      preferences: { ...input.preferences, preferredSessionMinutes: 60 },
      availabilityWindows: [
        {
          dayOfWeek: DayOfWeek.MON,
          startMinute: 300,
          endMinute: 360,
          context: StudyContext.HOME,
          devices: [DeviceType.LAPTOP],
          flexibility: WindowFlexibility.STRICT,
          allowedActivities: [AllowedActivity.THEORY],
        },
        {
          dayOfWeek: DayOfWeek.MON,
          startMinute: 1020,
          endMinute: 1080,
          context: StudyContext.HOME,
          devices: [DeviceType.LAPTOP],
          flexibility: WindowFlexibility.STRICT,
          allowedActivities: [AllowedActivity.THEORY],
        },
      ],
      checkIn: {
        dateKey: '1970-01-05',
        energy: 3,
        focus: 3,
        fatigue: 3,
        availableMinutesOverride: 999,
      },
    });

    const day = result.days.find((d) => d.dayOfWeek === DayOfWeek.MON);
    expect(day).toBeTruthy();
    expect(day?.finalIntervals).toHaveLength(2);
    expect(
      day?.adjustments.some(
        (a) => a.reasonCode === 'CHECKIN_OVERRIDE_IGNORED_EXCEEDS_CAPACITY',
      ),
    ).toBe(true);
  });
});
