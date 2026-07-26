import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/profile')
  getProfile(@Req() req) {
    const userId = String(req.user?.sub || '');
    if (!userId) {
      throw new UnauthorizedException();
    }
    return this.usersService.getProfile(userId);
  }

  @Patch('me/profile')
  updateProfile(@Req() req, @Body() body: Record<string, unknown>) {
    const userId = String(req.user?.sub || '');
    if (!userId) {
      throw new UnauthorizedException();
    }

    return this.usersService.updateProfile(userId, {
      studyLevel: typeof body.studyLevel === 'string' ? body.studyLevel : undefined,
      dailyStudyHours:
        typeof body.dailyStudyHours === 'number' ? body.dailyStudyHours : undefined,
      fatigueLevel:
        typeof body.fatigueLevel === 'string' ? body.fatigueLevel : undefined,
      peakEnergyTime:
        typeof body.peakEnergyTime === 'string' ? body.peakEnergyTime : undefined,
      works: typeof body.works === 'boolean' ? body.works : undefined,
    });
  }
}
