import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
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
  WindowFlexibility,
} from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoutineService } from './routine.service';

function enumValue<T extends Record<string, string>>(
  e: T,
  raw: unknown,
): T[keyof T] | null {
  if (typeof raw !== 'string') return null;
  const v = raw.trim();
  const values = Object.values(e) as string[];
  if (!values.includes(v)) return null;
  return v as T[keyof T];
}

@UseGuards(JwtAuthGuard)
@Controller('routine')
export class RoutineController {
  constructor(private readonly routineService: RoutineService) {}

  @Get('me/state')
  getState(@Req() req) {
    const userId = String(req.user?.sub || '');
    if (!userId) throw new UnauthorizedException();
    return this.routineService.getState(userId);
  }

  @Put('me/goal')
  upsertGoal(@Req() req, @Body() body: Record<string, unknown>) {
    const userId = String(req.user?.sub || '');
    if (!userId) throw new UnauthorizedException();

    const type = enumValue(StudyGoalType, body.type);
    const studyLevel = enumValue(StudyLevel, body.studyLevel);
    const phase = enumValue(StudyGoalPhase, body.phase);
    if (!type) throw new BadRequestException('type inválido.');
    if (!studyLevel) throw new BadRequestException('studyLevel inválido.');
    if (!phase) throw new BadRequestException('phase inválido.');

    return this.routineService.upsertStudyGoal(userId, {
      type,
      studyLevel,
      phase,
      title: typeof body.title === 'string' ? body.title : '',
      targetJob: typeof body.targetJob === 'string' ? body.targetJob : '',
      board: typeof body.board === 'string' ? body.board : null,
      examDate: typeof body.examDate === 'string' ? body.examDate : null,
      examDateUnknown:
        typeof body.examDateUnknown === 'boolean' ? body.examDateUnknown : null,
    });
  }

  @Put('me/routine')
  upsertRoutine(@Req() req, @Body() body: Record<string, unknown>) {
    const userId = String(req.user?.sub || '');
    if (!userId) throw new UnauthorizedException();

    return this.routineService.upsertRoutine(userId, {
      timezone:
        body.timezone === null
          ? null
          : typeof body.timezone === 'string'
            ? body.timezone
            : undefined,
      wakeTimeMinute:
        body.wakeTimeMinute === null
          ? null
          : typeof body.wakeTimeMinute === 'number'
            ? body.wakeTimeMinute
            : undefined,
      sleepTimeMinute:
        body.sleepTimeMinute === null
          ? null
          : typeof body.sleepTimeMinute === 'number'
            ? body.sleepTimeMinute
            : undefined,
      peakEnergyPeriod:
        body.peakEnergyPeriod === null
          ? null
          : (enumValue(EnergyPeriod, body.peakEnergyPeriod) as any) ?? undefined,
      habitualFatigueLevel:
        body.habitualFatigueLevel === null
          ? null
          : (enumValue(FatigueLevel, body.habitualFatigueLevel) as any) ?? undefined,
      preferredSessionMinutes:
        body.preferredSessionMinutes === null
          ? null
          : typeof body.preferredSessionMinutes === 'number'
            ? body.preferredSessionMinutes
            : undefined,
      planMode:
        body.planMode === null ? null : (enumValue(PlanMode, body.planMode) as any) ?? undefined,
      maxSubjectsPerDay:
        body.maxSubjectsPerDay === null
          ? null
          : typeof body.maxSubjectsPerDay === 'number'
            ? body.maxSubjectsPerDay
            : undefined,
      wantsDayOff:
        body.wantsDayOff === null
          ? null
          : typeof body.wantsDayOff === 'boolean'
            ? body.wantsDayOff
            : undefined,
      dayOffPreference:
        body.dayOffPreference === null
          ? null
          : (enumValue(DayOfWeek, body.dayOffPreference) as any) ?? undefined,
      badDayMinimumMinutes:
        body.badDayMinimumMinutes === null
          ? null
          : typeof body.badDayMinimumMinutes === 'number'
            ? body.badDayMinimumMinutes
            : undefined,
      missedDayStrategy:
        body.missedDayStrategy === null
          ? null
          : (enumValue(MissedDayStrategy, body.missedDayStrategy) as any) ?? undefined,
    });
  }

  @Put('me/windows')
  replaceWindows(@Req() req, @Body() body: Record<string, unknown>) {
    const userId = String(req.user?.sub || '');
    if (!userId) throw new UnauthorizedException();

    const raw = Array.isArray(body.windows) ? body.windows : [];
    const windows = raw
      .map((w: any) => ({
        dayOfWeek: enumValue(DayOfWeek, w?.dayOfWeek),
        startMinute: typeof w?.startMinute === 'number' ? w.startMinute : NaN,
        endMinute: typeof w?.endMinute === 'number' ? w.endMinute : NaN,
        context: enumValue(StudyContext, w?.context),
        devices: Array.isArray(w?.devices)
          ? (w.devices
              .map((d: any) => enumValue(DeviceType, d))
              .filter(Boolean) as DeviceType[])
          : [],
        flexibility: enumValue(WindowFlexibility, w?.flexibility),
        allowedActivities: Array.isArray(w?.allowedActivities)
          ? (w.allowedActivities
              .map((a: any) => enumValue(AllowedActivity, a))
              .filter(Boolean) as AllowedActivity[])
          : [],
      }))
      .filter((w) => w.dayOfWeek && w.context && w.flexibility);

    return this.routineService.replaceAvailabilityWindows(userId, {
      windows: windows as any,
    });
  }

  @Put('me/commitments')
  replaceCommitments(@Req() req, @Body() body: Record<string, unknown>) {
    const userId = String(req.user?.sub || '');
    if (!userId) throw new UnauthorizedException();

    const raw = Array.isArray(body.commitments) ? body.commitments : [];
    const commitments = raw
      .map((c: any) => ({
        category: enumValue(CommitmentCategory, c?.category),
        dayOfWeek: enumValue(DayOfWeek, c?.dayOfWeek),
        startMinute: typeof c?.startMinute === 'number' ? c.startMinute : NaN,
        endMinute: typeof c?.endMinute === 'number' ? c.endMinute : NaN,
        flexibility: enumValue(WindowFlexibility, c?.flexibility),
        note: typeof c?.note === 'string' ? c.note : null,
      }))
      .filter((c) => c.category && c.dayOfWeek && c.flexibility);

    return this.routineService.replaceCommitments(userId, {
      commitments: commitments as any,
    });
  }

  @Post('me/check-in')
  upsertCheckIn(@Req() req, @Body() body: Record<string, unknown>) {
    const userId = String(req.user?.sub || '');
    if (!userId) throw new UnauthorizedException();

    return this.routineService.upsertDailyCheckIn(userId, {
      dateKey: typeof body.dateKey === 'string' ? body.dateKey : '',
      energy: typeof body.energy === 'number' ? body.energy : 0,
      focus: typeof body.focus === 'number' ? body.focus : 0,
      fatigue: typeof body.fatigue === 'number' ? body.fatigue : 0,
      availableMinutesOverride:
        body.availableMinutesOverride === null
          ? null
          : typeof body.availableMinutesOverride === 'number'
            ? body.availableMinutesOverride
            : undefined,
      note: typeof body.note === 'string' ? body.note : null,
    });
  }

  @Post('me/preview-week')
  previewWeek(@Req() req, @Body() body: Record<string, unknown>) {
    const userId = String(req.user?.sub || '');
    if (!userId) throw new UnauthorizedException();

    return this.routineService.previewWeek(userId, {
      weekStartDate: typeof body.weekStartDate === 'string' ? body.weekStartDate : '',
      checkInDateKey:
        typeof body.checkInDateKey === 'string' ? body.checkInDateKey : null,
    });
  }

  @Post('me/strategic-preview')
  strategicPreview(@Req() req, @Body() body: Record<string, unknown>) {
    const userId = String(req.user?.sub || '');
    if (!userId) throw new UnauthorizedException();

    return this.routineService.strategicPreview(userId, {
      weekStartDate: typeof body.weekStartDate === 'string' ? body.weekStartDate : '',
      checkInDateKey:
        typeof body.checkInDateKey === 'string' ? body.checkInDateKey : null,
    });
  }

  @Post('me/complete')
  complete(@Req() req) {
    const userId = String(req.user?.sub || '');
    if (!userId) throw new UnauthorizedException();
    return this.routineService.completeOnboarding(userId);
  }
}
