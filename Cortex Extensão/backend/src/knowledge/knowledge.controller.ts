import {
  Controller,
  Get,
  Param,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KnowledgeService } from './knowledge.service';

@UseGuards(JwtAuthGuard)
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('graph/:contestId')
  getGraph(@Req() req, @Param('contestId') contestId: string) {
    const userId = String(req.user?.sub || '');
    if (!userId) {
      throw new UnauthorizedException();
    }

    return this.knowledgeService.getGraph(userId, contestId);
  }
}
