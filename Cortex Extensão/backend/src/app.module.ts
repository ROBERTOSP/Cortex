import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ContestsModule } from './contests/contests.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { PlanningModule } from './planning/planning.module';
import { DatabaseModule } from './database/database.module';
import { AiModule } from './ai/ai.module';
import { ScraperModule } from './scraper/scraper.module';
import { QuestionsModule } from './questions/questions.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    ContestsModule,
    KnowledgeModule,
    PlanningModule,
    DatabaseModule,
    AiModule,
    ScraperModule,
    QuestionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
