import { Module } from '@nestjs/common';
import { ContestsService } from './contests.service';
import { ContestsController } from './contests.controller';
import { AiModule } from '../ai/ai.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [AiModule, DatabaseModule],
  controllers: [ContestsController],
  providers: [ContestsService],
})
export class ContestsModule {}
