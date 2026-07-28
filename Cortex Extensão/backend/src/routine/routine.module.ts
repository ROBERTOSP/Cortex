import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RoutineController } from './routine.controller';
import { RoutineService } from './routine.service';

@Module({
  imports: [DatabaseModule],
  controllers: [RoutineController],
  providers: [RoutineService],
})
export class RoutineModule {}
