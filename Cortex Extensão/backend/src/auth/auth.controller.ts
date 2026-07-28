import { Controller, Post, Body, UseGuards, Req, Get, UnauthorizedException, ForbiddenException } from '@nestjs/common';
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

  @Post('dev/login')
  async devLogin(@Req() req, @Body() body: { email?: string; name?: string }) {
    const enabled = (process.env.DEV_LOGIN_ENABLED || '').trim() === '1';
    const nodeEnv = (process.env.NODE_ENV || '').trim();
    if (!enabled || nodeEnv === 'production') {
      throw new ForbiddenException();
    }

    const secret = (process.env.DEV_LOGIN_SECRET || '').trim();
    if (secret) {
      const provided = String(req.headers['x-dev-login-secret'] || '').trim();
      if (!provided || provided !== secret) {
        throw new ForbiddenException();
      }
    }

    const email =
      (body?.email || '').trim() ||
      (process.env.DEV_LOGIN_EMAIL || '').trim() ||
      'dev@local.cortex';
    const name = (body?.name || '').trim() || 'Dev User';
    return this.authService.devLogin({ email, name });
  }

  @Post('register')
  async register(@Body() body: {
    email?: string;
    password?: string;
    name?: string;
    phone?: string;
    selfDeclaredColor?: string;
    hasDisability?: boolean;
    birthDate?: string;
    sex?: string;
    city?: string;
    availableOtherStates?: boolean;
  }) {
    return this.authService.registerWithPassword(body);
  }

  @Post('login')
  async login(@Body() body: { email?: string; password?: string }) {
    return this.authService.loginWithPassword(body);
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
