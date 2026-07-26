import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PlanningService } from './planning.service';
import { PlanningController } from './planning.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [PlanningController],
  providers: [PlanningService],
})
export class PlanningModule {}
