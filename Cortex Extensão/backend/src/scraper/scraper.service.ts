import { Injectable } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import { Subject } from 'rxjs';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { normalizeImportedQuestion } from '../questions/question-import.utils';

@Injectable()
export class ScraperService {
  private scraperProcess: ChildProcess | null = null;
  public logs$ = new Subject<string>();

  constructor(private database: DatabaseService) {}

  startScraper(config: any = {}) {
    if (this.scraperProcess) {
      this.logs$.next('Scraper já está em execução.\n');
      return;
    }

    const scriptPath = 'e:\\Cortex\\Cortex Scraper\\crawler\\gran_scraper.py';
    const workingDir = 'e:\\Cortex\\Cortex Scraper\\crawler';
    
    // Converte config para argumentos de linha de comando
    const args = [scriptPath];
    if (config.stealth) args.push('--stealth');
    if (config.downloadImages) args.push('--download-images');
    if (config.syncSupabase) args.push('--sync-supabase');
    if (config.extractComments) args.push('--extract-comments');
    if (config.autoFilter) args.push('--auto-filter');
    if (config.reset) args.push('--reset');

    this.logs$.next(`Iniciando scraper com argumentos: ${args.slice(1).join(' ') || 'nenhum'}\n`);
    this.logs$.next(`> Pasta de trabalho: ${workingDir}\n`);
    this.logs$.next(`> Comando: python ${args.join(' ')}\n`);

    // Importante: não usar shell aqui. Com shell=true, caminhos com espaço (ex: "Cortex Scraper")
    // podem ser quebrados e o Python tenta executar "e:\\Cortex\\Cortex" como módulo.
    this.scraperProcess = spawn('python', args, {
      cwd: workingDir,
      env: { 
        ...process.env, 
        PYTHONIOENCODING: 'utf-8',
        SUPABASE_URL: process.env.SUPABASE_URL || '',
        SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''
      },
    });

    // Usa readline para lidar com streams grandes e evitar JSON incompleto
    const rl = readline.createInterface({
      input: this.scraperProcess.stdout!,
      terminal: false
    });

    rl.on('line', async (line) => {
      if (!line.trim()) return;

      // Intercepta dados de sincronização
      if (line.startsWith('SYNC_DATA:')) {
        const jsonData = line.replace('SYNC_DATA:', '').trim();
        try {
          const questions = JSON.parse(jsonData);
          await this.handleSyncData(questions);
        } catch (e) {
          this.logs$.next(`[ERROR] Falha ao processar dados de sincronização (JSON incompleto ou inválido): ${e.message}\n`);
        }
      } 
      // Encaminha PROGRESS e STATS
      else if (line.startsWith('PROGRESS:') || line.startsWith('STATS:')) {
        this.logs$.next(line + '\n');
      } 
      // Logs normais
      else {
        this.logs$.next(line + '\n');
      }
    });

    const rlErr = readline.createInterface({
      input: this.scraperProcess.stderr!,
      terminal: false
    });

    rlErr.on('line', (line) => {
      if (!line.trim()) return;
      // Filtra avisos comuns do chrome/playwright que não são erros reais
      if (line.includes('Debugger listening') || line.includes('DevTools listening') || line.includes('Extension')) {
        this.logs$.next(`[DEBUG] ${line}\n`);
      } else {
        this.logs$.next(`[ERROR] ${line}\n`);
      }
    });

    this.scraperProcess.on('error', (err) => {
      this.logs$.next(`[ERROR] Falha ao iniciar o processo Python: ${err.message}. Verifique se o Python está instalado e no PATH.\n`);
      this.scraperProcess = null;
    });

    this.scraperProcess.on('close', (code) => {
      this.logs$.next(`Scraper finalizado com código: ${code}\n`);
      this.scraperProcess = null;
    });
  }

  private async handleSyncData(input: any) {
    if (!input) return;
    
    const items = Array.isArray(input) ? input : [input];

    let skippedWithoutCortexId = 0;

    for (const q of items) {
      if (!q) continue;

      try {
        if (!q.cortex_id_num || !q.cortex_id) {
          skippedWithoutCortexId += 1;
          continue;
        }

        const normalized = normalizeImportedQuestion(q);

        const board = normalized.boardName
          ? await this.database.questionBoard.upsert({
              where: { name: normalized.boardName },
              update: {},
              create: { name: normalized.boardName },
            })
          : null;

        const subject = normalized.subjectName
          ? await this.database.questionSubject.upsert({
              where: { name: normalized.subjectName },
              update: {},
              create: { name: normalized.subjectName },
            })
          : null;

        const topic = normalized.topicName
          ? (await this.database.questionTopic.findFirst({
              where: {
                name: normalized.topicName,
                subjectId: subject?.id ?? undefined,
              },
            })) ??
            (await this.database.questionTopic.create({
              data: {
                name: normalized.topicName,
                ...(subject?.id ? { subjectId: subject.id } : {}),
              },
            }))
          : null;

        const subtopic = normalized.subtopicName
          ? (await this.database.questionSubtopic.findFirst({
              where: {
                name: normalized.subtopicName,
                topicId: topic?.id ?? undefined,
              },
            })) ??
            (await this.database.questionSubtopic.create({
              data: {
                name: normalized.subtopicName,
                ...(topic?.id ? { topicId: topic.id } : {}),
              },
            }))
          : null;
        const rawJsonValue = normalized.rawJson
          ? (normalized.rawJson as Prisma.InputJsonValue)
          : Prisma.DbNull;

        await this.database.$transaction(async (tx) => {
          const saved = await tx.question.upsert({
            where: { cortexIdNum: normalized.cortexIdNum },
            update: {
              cortexId: normalized.cortexId,
              statement: normalized.statement,
              associatedText: normalized.associatedText,
              officialAnswer: normalized.officialAnswer,
              difficulty: normalized.difficulty,
              difficultyNum: normalized.difficultyNum,
              type: normalized.type,
              annulled: normalized.annulled,
              outdated: normalized.outdated,
              year: normalized.year,
              exam: normalized.exam,
              contentText: normalized.contentText,
              contentHash: normalized.contentHash,
              rawJson: rawJsonValue,
              statementImages: normalized.statementImages,
              itemImages: normalized.itemImages,
              associatedTextImages: normalized.associatedTextImages,
              boardId: board?.id ?? null,
              subjectId: subject?.id ?? null,
              topicId: topic?.id ?? null,
              subtopicId: subtopic?.id ?? null,
            },
            create: {
              cortexIdNum: normalized.cortexIdNum,
              cortexId: normalized.cortexId,
              statement: normalized.statement,
              associatedText: normalized.associatedText,
              officialAnswer: normalized.officialAnswer,
              difficulty: normalized.difficulty,
              difficultyNum: normalized.difficultyNum,
              type: normalized.type,
              annulled: normalized.annulled,
              outdated: normalized.outdated,
              year: normalized.year,
              exam: normalized.exam,
              contentText: normalized.contentText,
              contentHash: normalized.contentHash,
              rawJson: rawJsonValue,
              statementImages: normalized.statementImages,
              itemImages: normalized.itemImages,
              associatedTextImages: normalized.associatedTextImages,
              boardId: board?.id ?? null,
              subjectId: subject?.id ?? null,
              topicId: topic?.id ?? null,
              subtopicId: subtopic?.id ?? null,
            },
            select: { id: true },
          });

          await tx.questionOption.deleteMany({
            where: { questionId: saved.id },
          });

          if (normalized.options.length > 0) {
            await tx.questionOption.createMany({
              data: normalized.options.map((option) => ({
                questionId: saved.id,
                letter: option.letter,
                text: option.text,
                isCorrect: option.isCorrect,
                displayOrder: option.displayOrder,
              })),
            });
          }
        });
      } catch (err) {
        const label = q?.cortex_id || q?.id_portal || 'desconhecida';
        this.logs$.next(`Erro ao sincronizar questão ${label}: ${err.message}\n`);
      }
    }

    if (skippedWithoutCortexId > 0) {
      this.logs$.next(`[WARNING] ${skippedWithoutCortexId} questões ignoradas por não possuírem cortex_id/cortex_id_num. Use o dataset consolidado para importar no banco.\n`);
    }
  }

  private async getOrCreateNode(contestId: string, name: string, type: string, parentId: string | null) {
    const existing = await this.database.knowledgeNode.findFirst({
      where: {
        contestId,
        name,
        type,
        parentId
      }
    });

    if (existing) return existing;

    return await this.database.knowledgeNode.create({
      data: {
        contestId,
        name,
        type,
        parentId
      }
    });
  }

  stopScraper() {
    if (this.scraperProcess) {
      this.scraperProcess.kill();
      this.logs$.next('Comando de parada enviado ao scraper.\n');
      this.scraperProcess = null;
    } else {
      this.logs$.next('Nenhum scraper em execução.\n');
    }
  }

  isRunning() {
    return !!this.scraperProcess;
  }

  async getStats() {
    const totalQuestions = await this.database.question.count();
    const questionsByBoard = await this.database.questionBoard.findMany({
      select: {
        name: true,
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        questions: {
          _count: 'desc',
        },
      },
      take: 20,
    });

    const totalNodes = await this.database.knowledgeNode.count();
    const nodesByType = await this.database.knowledgeNode.groupBy({
      by: ['type'],
      _count: {
        _all: true,
      },
    });

    return {
      totalQuestions,
      questionsByBoard,
      totalNodes,
      nodesByType,
    };
  }

  async clearDatabase() {
    this.logs$.next('[WARNING] Iniciando limpeza completa do banco de dados e arquivos locais...\n');
    try {
      // 1. Limpa o banco de dados
      await this.database.questionOption.deleteMany({});
      await this.database.question.deleteMany({});
      await this.database.questionSubtopic.deleteMany({});
      await this.database.questionTopic.deleteMany({});
      await this.database.questionSubject.deleteMany({});
      await this.database.questionBoard.deleteMany({});
      await this.database.knowledgeNode.deleteMany({});
      await this.database.contest.deleteMany({});
      
      // 2. Limpa arquivos locais do scraper
      const scraperDir = path.join(process.cwd(), 'Cortex Scraper', 'crawler', 'data');
      const stateFile = path.join(scraperDir, 'gran_scraper_state.json');
      const outputFile = path.join(scraperDir, 'questoes_gran_scraper.json');

      if (fs.existsSync(stateFile)) fs.unlinkSync(stateFile);
      if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
      
      this.logs$.next('[SUCCESS] Banco de dados e cache local limpos com sucesso.\n');
      return { success: true };
    } catch (error) {
      this.logs$.next(`[ERROR] Falha ao limpar banco de dados: ${error.message}\n`);
      return { success: false, error: error.message };
    }
  }
}
