import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QuestionsService } from './questions.service';

@UseGuards(JwtAuthGuard)
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questions: QuestionsService) {}

  @Get('next')
  async next() {
    return this.questions.getNextQuestion();
  }

  @Get('diagnostic')
  async diagnostic(@Req() req, @Query('limit') limit?: string) {
    const userId = String(req.user?.sub || '');
    return this.questions.getDiagnosticQuestions(userId, Number(limit || 8));
  }

  @Post('submit')
  async submit(@Req() req, @Body() body: any) {
    const userId = String(req.user?.sub || '');

    const questionId = String(body?.question_id || body?.questionId || '');
    const selectedOption = String(body?.selected_option || body?.selectedOption || '');

    const latencyMsRaw = body?.latency_ms ?? body?.latencyMs;
    const switchesCountRaw = body?.switches_count ?? body?.switchesCount;
    const hesitationDetectedRaw = body?.hesitation_detected ?? body?.hesitationDetected;

    const latencyMs =
      typeof latencyMsRaw === 'number'
        ? latencyMsRaw
        : typeof latencyMsRaw === 'string' && latencyMsRaw.trim()
          ? Number(latencyMsRaw)
          : undefined;

    const switchesCount =
      typeof switchesCountRaw === 'number'
        ? switchesCountRaw
        : typeof switchesCountRaw === 'string' && switchesCountRaw.trim()
          ? Number(switchesCountRaw)
          : undefined;

    const hesitationDetected =
      typeof hesitationDetectedRaw === 'boolean'
        ? hesitationDetectedRaw
        : typeof hesitationDetectedRaw === 'string'
          ? hesitationDetectedRaw === 'true'
          : undefined;

    return this.questions.submitAnswer(userId, {
      questionId,
      selectedOption,
      latencyMs,
      switchesCount,
      hesitationDetected,
    });
  }

  @Get(':id/explain')
  async explain(@Req() req, @Param('id') id: string) {
    const userId = String(req.user?.sub || '');
    return this.questions.explainQuestion(userId, id);
  }
}
