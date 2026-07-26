import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContestsService } from './contests.service';

@UseGuards(JwtAuthGuard)
@Controller('contests')
export class ContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  @Get('catalog')
  listCatalog() {
    return this.contestsService.listCatalog();
  }

  @Post()
  create(@Req() req, @Body() data: Record<string, unknown>) {
    const userId = String(req.user?.sub || '');
    if (!userId) {
      throw new UnauthorizedException();
    }

    return this.contestsService.createForUser(userId, {
      name: typeof data.name === 'string' ? data.name : undefined,
      targetJob: typeof data.targetJob === 'string' ? data.targetJob : undefined,
      board: typeof data.board === 'string' ? data.board : undefined,
      examDate: typeof data.examDate === 'string' ? data.examDate : undefined,
      templateId: typeof data.templateId === 'string' ? data.templateId : undefined,
      editalText: typeof data.editalText === 'string' ? data.editalText : undefined,
    });
  }

  @Post('upload-edital')
  @UseInterceptors(FileInterceptor('file'))
  async uploadEdital(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: Record<string, string>,
  ) {
    const userId = String(req.user?.sub || '');
    if (!userId) {
      throw new UnauthorizedException();
    }

    return this.contestsService.parseAndCreateFromEdital(file, userId, {
      name: body.name,
      targetJob: body.targetJob,
      board: body.board,
      examDate: body.examDate,
    });
  }

  @Get()
  findAll(@Req() req) {
    const userId = String(req.user?.sub || '');
    if (!userId) {
      throw new UnauthorizedException();
    }
    return this.contestsService.findAllForUser(userId);
  }

  @Get(':contestId')
  findOne(@Req() req, @Param('contestId') contestId: string) {
    const userId = String(req.user?.sub || '');
    if (!userId) {
      throw new UnauthorizedException();
    }
    return this.contestsService.findOneForUser(userId, contestId);
  }
}
