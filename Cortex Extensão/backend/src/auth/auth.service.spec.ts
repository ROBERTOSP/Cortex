import { ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const jwt: any = { sign: jest.fn(() => 'token') };
  const database: any = {
    user: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('informa indisponibilidade quando o banco do login estiver offline', async () => {
    database.user.findUnique.mockRejectedValue({ code: 'P1001' });
    const service = new AuthService(jwt, database);

    await expect(
      service.loginWithPassword({
        email: 'admin@cortex.test',
        password: 'senha-segura',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('mantem credenciais invalidas como nao autorizadas', async () => {
    database.user.findUnique.mockResolvedValue(null);
    const service = new AuthService(jwt, database);

    await expect(
      service.loginWithPassword({
        email: 'admin@cortex.test',
        password: 'senha-incorreta',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('login de desenvolvimento cria ou restaura somente um usuário comum', async () => {
    database.user.upsert.mockResolvedValue({
      id: 'dev-user',
      email: 'dev@local.cortex',
      name: 'Usuário de teste',
      avatarUrl: null,
      role: 'USER',
    });
    const service = new AuthService(jwt, database);

    const result = await service.devLogin({
      email: 'dev@local.cortex',
      name: 'Usuário de teste',
    });

    expect(database.user.upsert).toHaveBeenCalledWith({
      where: { email: 'dev@local.cortex' },
      update: { name: 'Usuário de teste', role: 'USER' },
      create: {
        email: 'dev@local.cortex',
        name: 'Usuário de teste',
        role: 'USER',
      },
    });
    expect(result.user.role).toBe('USER');
  });
});
