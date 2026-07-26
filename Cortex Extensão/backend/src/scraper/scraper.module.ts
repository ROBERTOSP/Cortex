import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperGateway } from './scraper.gateway';

@Module({
  providers: [ScraperService, ScraperGateway],
  exports: [ScraperService],
})
export class ScraperModule {}
