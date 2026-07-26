import { Controller, Post, Body, UseGuards, Req, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { DatabaseService } from '../database/database.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly database: DatabaseService,
  ) {}

  @Post('google')
  async googleAuth(@Body('token') token: string) {
    return this.authService.validateGoogleToken(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req) {
    const userId = String(req.user?.sub || '');
    if (!userId) {
      throw new UnauthorizedException();
    }

    const user = await this.database.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, avatarUrl: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('sync')
  async syncUser(@Req() req) {
    return this.authService.syncUser(req.user);
  }
}
