import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
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

  @Get('published-catalog')
  listPublishedCatalog() {
    return this.contestsService.listPublishedCatalog();
  }

  @Get('admin/editals')
  async listAdminEditals(@Req() req) {
    const userId = String(req.user?.sub || '');
    if (!userId) throw new UnauthorizedException();
    const user = await this.contestsService.getUserRole(userId);
    if (user.role !== 'ADMIN') throw new UnauthorizedException('Acesso administrativo necessário');
    return this.contestsService.listAdminEditals();
  }

  @Post('admin/editals')
  async createAdminEdital(@Req() req, @Body() body: Record<string, string>) {
    const userId = String(req.user?.sub || '');
    if (!userId || (await this.contestsService.getUserRole(userId)).role !== 'ADMIN') throw new UnauthorizedException('Acesso administrativo necessário');
    if (!body.title?.trim()) throw new BadRequestException('Informe o nome do edital');
    return this.contestsService.createAdminEdital({
      title: body.title,
      board: body.board,
      examDate: body.examDate,
    });
  }

  @Post('admin/editals/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAdminEdital(@Req() req, @UploadedFile() file: Express.Multer.File) {
    const userId = String(req.user?.sub || '');
    await this.contestsService.assertAdmin(userId);
    return this.contestsService.analyzeSharedEdital(file, userId);
  }

  @Get('admin/editals/:editalId')
  async getAdminEdital(@Req() req, @Param('editalId') editalId: string) {
    await this.contestsService.assertAdmin(String(req.user?.sub || ''));
    return this.contestsService.getAdminEdital(editalId);
  }

  @Patch('admin/editals/:editalId')
  async updateAdminEdital(
    @Req() req,
    @Param('editalId') editalId: string,
    @Body() body: Record<string, unknown>,
  ) {
    await this.contestsService.assertAdmin(String(req.user?.sub || ''));
    return this.contestsService.updateAdminEdital(editalId, body);
  }

  @Post('admin/editals/:editalId/publish')
  async publishAdminEdital(@Req() req, @Param('editalId') editalId: string) {
    await this.contestsService.assertAdmin(String(req.user?.sub || ''));
    return this.contestsService.setAdminEditalStatus(editalId, 'PUBLISHED');
  }

  @Post('admin/editals/:editalId/archive')
  async archiveAdminEdital(@Req() req, @Param('editalId') editalId: string) {
    await this.contestsService.assertAdmin(String(req.user?.sub || ''));
    return this.contestsService.setAdminEditalStatus(editalId, 'ARCHIVED');
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
      participationMode: typeof data.participationMode === 'string' ? data.participationMode : undefined,
      highlightPcdRules: typeof data.highlightPcdRules === 'boolean' ? data.highlightPcdRules : undefined,
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
    await this.contestsService.assertAdmin(userId);

    return this.contestsService.parseAndCreateFromEdital(file, userId, {
      name: body.name,
      targetJob: body.targetJob,
      board: body.board,
      examDate: body.examDate,
    });
  }

  @Post('import-edital-link')
  async importEditalLink(@Req() req, @Body() body: Record<string, string>) {
    const userId = String(req.user?.sub || '');
    if (!userId) {
      throw new UnauthorizedException();
    }
    await this.contestsService.assertAdmin(userId);

    return this.contestsService.parseAndCreateFromEditalLink(body.url, userId, {
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

  @Get(':contestId/edital-review')
  getEditalReview(@Req() req, @Param('contestId') contestId: string) {
    const userId = String(req.user?.sub || '');
    if (!userId) throw new UnauthorizedException();
    return this.contestsService.getEditalReviewForUser(userId, contestId);
  }

  @Post(':contestId/reanalyze-edital')
  async reanalyzeEdital(@Req() req, @Param('contestId') contestId: string) {
    const userId = String(req.user?.sub || '');
    if (!userId) throw new UnauthorizedException();
    await this.contestsService.assertAdmin(userId);
    return this.contestsService.reanalyzeEditalForUser(userId, contestId);
  }

  @Post(':contestId/discard-edital')
  discardEdital(@Req() req, @Param('contestId') contestId: string) {
    const userId = String(req.user?.sub || '');
    if (!userId) throw new UnauthorizedException();
    return this.contestsService.discardEditalDraftForUser(userId, contestId);
  }

  @Post(':contestId/confirm-edital')
  confirmEdital(@Req() req, @Param('contestId') contestId: string, @Body() body: Record<string, unknown>) {
    const userId = String(req.user?.sub || '');
    if (!userId) throw new UnauthorizedException();
    return this.contestsService.confirmEditalForUser(userId, contestId, {
      name: typeof body.name === 'string' ? body.name : undefined,
      targetJob: typeof body.targetJob === 'string' ? body.targetJob : undefined,
      selectedJob: typeof body.selectedJob === 'string' ? body.selectedJob : undefined,
      board: typeof body.board === 'string' ? body.board : undefined,
      examDate: typeof body.examDate === 'string' ? body.examDate : undefined,
      participationMode: typeof body.participationMode === 'string' ? body.participationMode : undefined,
      highlightPcdRules: typeof body.highlightPcdRules === 'boolean' ? body.highlightPcdRules : undefined,
      subjects: body.subjects,
    });
  }
}
