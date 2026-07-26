import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { DatabaseModule } from '../database/database.module';
import { SupabaseStrategy } from './supabase.strategy';
import { JwtAuthStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'jwt_disabled',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SupabaseStrategy, JwtAuthStrategy],
  exports: [AuthService],
})
export class AuthModule {}
