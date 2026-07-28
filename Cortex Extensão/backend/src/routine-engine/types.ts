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
import { RoutineEngineReasonCode } from './config';

export type PeakMatch = 'MATCHES_DECLARED_PEAK' | 'ADJACENT_TO_PEAK' | 'OUTSIDE_PEAK';

export type RoutineEngineConfidence = 'DECLARED_ONLY';

export type RoutinePreferences = {
  planMode: PlanMode;
  preferredSessionMinutes: number;
  maxSubjectsPerDay: number;
  badDayMinimumMinutes: number;
  missedDayStrategy: string;
  peakEnergyPeriod: EnergyPeriod;
};

export type AvailabilityWindowInput = {
  dayOfWeek: DayOfWeek;
  startMinute: number;
  endMinute: number;
  context: StudyContext;
  devices: DeviceType[];
  flexibility: WindowFlexibility;
  allowedActivities: AllowedActivity[];
};

export type RoutineCommitmentInput = {
  dayOfWeek: DayOfWeek;
  startMinute: number;
  endMinute: number;
  category: CommitmentCategory;
  flexibility: WindowFlexibility;
};

export type DailyCheckInInput = {
  dateKey: string;
  energy: number;
  focus: number;
  fatigue: number;
  availableMinutesOverride?: number | null;
};

export type Interval = {
  startMinute: number;
  endMinute: number;
  allowedActivities: AllowedActivity[];
  devices: DeviceType[];
  peakMatch: PeakMatch;
};

export type DiscardedMinutes = {
  minutes: number;
  reasonCode: RoutineEngineReasonCode;
};

export type Adjustment = {
  stage: string;
  minutesBefore: number;
  minutesAfter: number;
  reasonCode: RoutineEngineReasonCode;
};

export type DayCapacity = {
  dateKey: string;
  dayOfWeek: DayOfWeek;
  grossMinutes: number;
  netMinutes: number;
  sustainableMinutes: number;
  recommendedSessionMinutes: number;
  finalIntervals: Interval[];
  blocks: number[];
  discardedMinutes: DiscardedMinutes[];
  adjustments: Adjustment[];
};

export type RoutineEngineClassifications = {
  daysWithoutAvailability: DayOfWeek[];
  lowCapacityDays: DayOfWeek[];
  highConstraintDays: DayOfWeek[];
};

export type WeeklyCapacity = {
  engineVersion: string;
  confidence: RoutineEngineConfidence;
  timezone: string;
  weekStartDate: string;
  weekly: {
    grossMinutes: number;
    netMinutes: number;
    sustainableMinutes: number;
    maximumBlocks: number;
    maxSubjectsPerDay: number;
  };
  days: DayCapacity[];
  classifications: RoutineEngineClassifications;
};

export type WeeklyEngineInput = {
  timezone: string;
  weekStartDate: string;
  preferences: RoutinePreferences;
  availabilityWindows: AvailabilityWindowInput[];
  commitments: RoutineCommitmentInput[];
  checkIn?: DailyCheckInInput | null;
};
