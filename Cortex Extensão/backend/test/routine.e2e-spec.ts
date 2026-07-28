import { INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DatabaseService } from './../src/database/database.service';
import { JwtAuthStrategy } from './../src/auth/jwt.strategy';
import { RoutineController } from './../src/routine/routine.controller';
import { RoutineService } from './../src/routine/routine.service';

describe('Routine (e2e)', () => {
  let app: INestApplication<App>;
  let database: any;
  let jwt: JwtService;

  beforeEach(async () => {
    database = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      studyGoal: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      userRoutine: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      availabilityWindow: {
        findMany: jest.fn(),
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
      routineCommitment: {
        findMany: jest.fn(),
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
      dailyCheckIn: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      $transaction: jest.fn(async (fn: any) => fn(database)),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: 'jwt_disabled',
          signOptions: { expiresIn: '7d' },
        }),
      ],
      controllers: [RoutineController],
      providers: [
        RoutineService,
        JwtAuthStrategy,
        {
          provide: DatabaseService,
          useValue: database,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwt = new JwtService({ secret: 'jwt_disabled' });
  });

  afterEach(async () => {
    await app.close();
  });

  it('bloqueia acesso sem autenticação', async () => {
    await request(app.getHttpServer()).get('/routine/me/state').expect(401);
  });

  it('usa exclusivamente o sub do token (ignora userId no payload)', async () => {
    database.studyGoal.upsert.mockImplementation(async (args: any) => ({
      id: 'g1',
      userId: args.where.userId,
      type: args.create.type,
      studyLevel: args.create.studyLevel,
      phase: args.create.phase,
      title: args.create.title,
      targetJob: args.create.targetJob,
      board: args.create.board,
      examDate: args.create.examDate,
      examDateUnknown: args.create.examDateUnknown,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const token = jwt.sign({ sub: 'u1', email: 'u1@example.com' });

    await request(app.getHttpServer())
      .put('/routine/me/goal')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: 'u2',
        type: 'APPROVAL',
        studyLevel: 'BEGINNER',
        phase: 'PRE_NOTICE',
        title: 'Polícia Federal',
        targetJob: 'Agente Administrativo',
        examDateUnknown: true,
      })
      .expect(200);

    expect(database.studyGoal.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'u1' },
      }),
    );
  });
});
