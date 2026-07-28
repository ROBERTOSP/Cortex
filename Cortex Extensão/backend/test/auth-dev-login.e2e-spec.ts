import { INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthController } from './../src/auth/auth.controller';
import { AuthService } from './../src/auth/auth.service';
import { DatabaseService } from './../src/database/database.service';

describe('Auth Dev Login (e2e)', () => {
  let app: INestApplication<App>;
  let database: any;
  let jwt: JwtService;

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DEV_LOGIN_ENABLED = '1';
    process.env.DEV_LOGIN_SECRET = 'test-secret';

    database = {
      user: {
        upsert: jest.fn(async (args: any) => ({
          id: 'u1',
          email: args.where.email,
          name: args.create?.name ?? null,
          avatarUrl: null,
        })),
        findUnique: jest.fn(),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'jwt_test',
          signOptions: { expiresIn: '7d' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: DatabaseService,
          useValue: database,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwt = moduleFixture.get(JwtService);
    jest.spyOn(jwt, 'sign').mockReturnValue('jwt_mock');
  });

  afterEach(async () => {
    await app.close();
  });

  it('retorna 403 se secret não for enviado', async () => {
    await request(app.getHttpServer())
      .post('/auth/dev/login')
      .send({ email: 'dev@local.cortex' })
      .expect(403);
  });

  it('permite dev login quando habilitado e com secret correto', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/dev/login')
      .set('X-Dev-Login-Secret', 'test-secret')
      .send({ email: 'dev@local.cortex' })
      .expect(201);

    expect(res.body).toEqual({
      user: expect.objectContaining({ email: 'dev@local.cortex' }),
      token: 'jwt_mock',
    });
  });
});
