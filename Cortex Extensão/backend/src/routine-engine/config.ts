export const ROUTINE_ENGINE_VERSION = 'routine-v1' as const;

export const ROUTINE_ENGINE_LIMITS = {
  sessionMinutes: {
    min: 20,
    max: 60,
  },
  dayClassification: {
    lowCapacityBelowMinutes: 20,
    highConstraint: {
      reductionRatioThreshold: 0.5,
      reductionMinutesThreshold: 60,
    },
  },
  checkIn: {
    ratingMin: 1,
    ratingMax: 5,
    noteMaxLength: 200,
    availableMinutesOverride: {
      min: 0,
      max: 600,
    },
    maxDaysInFutureAllowed: 0,
  },
} as const;

export const ROUTINE_ENGINE_TIME_OF_DAY = {
  MORNING: { startMinute: 300, endMinuteExclusive: 720 },
  AFTERNOON: { startMinute: 720, endMinuteExclusive: 1020 },
  EVENING: { startMinute: 1020, endMinuteExclusive: 1260 },
  NIGHT: { startMinute: 1260, endMinuteExclusive: 300 },
} as const;

export const ROUTINE_ENGINE_REASON_CODES = {
  COMMITMENT_INTERSECTION_REMOVED: 'COMMITMENT_INTERSECTION_REMOVED',
  RESIDUAL_BELOW_MIN_SESSION: 'RESIDUAL_BELOW_MIN_SESSION',
  DECLARED_ONLY_NO_MINUTE_REDUCTION: 'DECLARED_ONLY_NO_MINUTE_REDUCTION',
  MATCHES_DECLARED_PEAK: 'MATCHES_DECLARED_PEAK',
  ADJACENT_TO_PEAK: 'ADJACENT_TO_PEAK',
  OUTSIDE_PEAK: 'OUTSIDE_PEAK',
  CHECKIN_CAP_APPLIED: 'CHECKIN_CAP_APPLIED',
  CHECKIN_OVERRIDE_IGNORED_EXCEEDS_CAPACITY: 'CHECKIN_OVERRIDE_IGNORED_EXCEEDS_CAPACITY',
} as const;

export type RoutineEngineReasonCode =
  (typeof ROUTINE_ENGINE_REASON_CODES)[keyof typeof ROUTINE_ENGINE_REASON_CODES];
