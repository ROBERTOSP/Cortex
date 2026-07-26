import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlanningService } from './planning.service';

@UseGuards(JwtAuthGuard)
@Controller('planning')
export class PlanningController {
  constructor(private readonly planningService: PlanningService) {}

  @Post('schedule')
  generateSchedule(@Req() req, @Body() data: Record<string, unknown> = {}) {
    const userId = String(req.user?.sub || '');
    if (!userId) {
      throw new UnauthorizedException();
    }

    return this.planningService.generateScheduleForUser(userId, data);
  }
}
