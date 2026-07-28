import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  private readonly scrypt = promisify(scryptCallback);

  constructor(
    private jwtService: JwtService,
    private database: DatabaseService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async devLogin(payload: { email: string; name?: string | null }) {
    const email = (payload.email || '').trim().toLowerCase();
    if (!email) {
      throw new UnauthorizedException('Invalid dev login');
    }

    const user = await this.database.user.upsert({
      where: { email },
      update: {
        name: payload.name ?? undefined,
      },
      create: {
        email,
        name: payload.name ?? undefined,
      },
    });

    const jwtToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      user,
      token: jwtToken,
    };
  }

  private normalizeEmail(email: unknown) {
    return typeof email === 'string' ? email.trim().toLowerCase() : '';
  }

  private assertPassword(password: unknown): asserts password is string {
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      throw new UnauthorizedException('A senha deve ter entre 8 e 128 caracteres.');
    }
  }

  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const derived = (await this.scrypt(password, salt, 64)) as Buffer;
    return `${salt}:${derived.toString('hex')}`;
  }

  private async verifyPassword(password: string, storedHash: string) {
    const [salt, digest] = storedHash.split(':');
    if (!salt || !digest) return false;
    const derived = (await this.scrypt(password, salt, 64)) as Buffer;
    const saved = Buffer.from(digest, 'hex');
    return saved.length === derived.length && timingSafeEqual(saved, derived);
  }

  private issueSession(user: { id: string; email: string; name: string | null; avatarUrl: string | null }) {
    return {
      user,
      token: this.jwtService.sign({ sub: user.id, email: user.email }),
    };
  }

  async registerWithPassword(payload: {
    email?: string;
    password?: string;
    name?: string;
    phone?: string;
    selfDeclaredColor?: string;
    hasDisability?: boolean;
    birthDate?: string;
    sex?: string;
    city?: string;
    availableOtherStates?: boolean;
  }) {
    const email = this.normalizeEmail(payload?.email);
    this.assertPassword(payload?.password);
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new UnauthorizedException('Informe um e-mail válido.');
    }

    const existing = await this.database.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Já existe uma conta com este e-mail.');
    }

    const allowedColors = new Set(['AMARELA', 'BRANCA', 'INDIGENA', 'PARDA', 'PRETA', 'PREFIRO_NAO_INFORMAR']);
    const allowedSexes = new Set(['FEMININO', 'MASCULINO', 'NAO_BINARIO', 'PREFIRO_NAO_INFORMAR']);
    const selfDeclaredColor = typeof payload.selfDeclaredColor === 'string' ? payload.selfDeclaredColor.trim().toUpperCase() : '';
    const sex = typeof payload.sex === 'string' ? payload.sex.trim().toUpperCase() : '';
    const phone = typeof payload.phone === 'string' ? payload.phone.replace(/\D/g, '') : '';
    const city = typeof payload.city === 'string' ? payload.city.trim().slice(0, 120) : '';
    const birthDate = typeof payload.birthDate === 'string' ? new Date(`${payload.birthDate}T12:00:00`) : null;
    if (!phone || phone.length < 10 || phone.length > 15) throw new UnauthorizedException('Informe um telefone válido.');
    if (!allowedColors.has(selfDeclaredColor)) throw new UnauthorizedException('Informe sua cor ou raça.');
    if (!allowedSexes.has(sex)) throw new UnauthorizedException('Informe seu sexo.');
    if (!city) throw new UnauthorizedException('Informe a cidade onde você reside.');
    if (!birthDate || Number.isNaN(birthDate.getTime()) || birthDate >= new Date()) throw new UnauthorizedException('Informe uma data de nascimento válida.');
    if (typeof payload.hasDisability !== 'boolean') throw new UnauthorizedException('Informe se você é pessoa com deficiência.');
    if (typeof payload.availableOtherStates !== 'boolean') throw new UnauthorizedException('Informe sua disponibilidade para outros estados.');

    const user = await this.database.user.create({
      data: {
        email,
        name: typeof payload?.name === 'string' ? payload.name.trim().slice(0, 120) || null : null,
        passwordHash: await this.hashPassword(payload.password),
        phone,
        selfDeclaredColor,
        hasDisability: payload.hasDisability,
        birthDate,
        sex,
        city,
        availableOtherStates: payload.availableOtherStates,
      },
      select: { id: true, email: true, name: true, avatarUrl: true },
    });
    return this.issueSession(user);
  }

  async loginWithPassword(payload: { email?: string; password?: string }) {
    const email = this.normalizeEmail(payload?.email);
    this.assertPassword(payload?.password);
    const user = await this.database.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, avatarUrl: true, passwordHash: true },
    });
    if (!user?.passwordHash || !(await this.verifyPassword(payload.password, user.passwordHash))) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return this.issueSession(safeUser);
  }

  async validateGoogleToken(token: string) {
    try {
      let email: string;
      let googleId: string;
      let name: string | undefined;
      let avatarUrl: string | undefined;

      try {
        // Tenta validar como ID Token primeiro
        const ticket = await this.googleClient.verifyIdToken({
          idToken: token,
          // Aceita tanto o ID Web quanto o ID da Extensão como audiência
          audience: [
            process.env.GOOGLE_CLIENT_ID!,
            process.env.GOOGLE_EXTENSION_CLIENT_ID!
          ],
        });
        const payload = ticket.getPayload();
        if (payload) {
          email = payload.email!;
          googleId = payload.sub;
          name = payload.name;
          avatarUrl = payload.picture;
        } else {
          throw new Error('No payload');
        }
      } catch (e) {
        console.log('ID Token validation failed, trying Access Token...', e.message);
        // Se falhar, tenta como Access Token
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
        if (!response.ok) {
          console.error('Access Token validation failed:', await response.text());
          throw new UnauthorizedException('Invalid Google token');
        }
        const payload = await response.json();
        email = payload.email;
        googleId = payload.sub;
        name = payload.name;
        avatarUrl = payload.picture;
      }

      if (!email) {
        throw new UnauthorizedException('Email not found in Google token');
      }

      // Upsert user in database
      const user = await this.database.user.upsert({
        where: { email },
        update: {
          name,
          avatarUrl,
          googleId,
        },
        create: {
          email,
          name,
          avatarUrl,
          googleId,
        },
      });

      // Generate JWT
      const jwtToken = this.jwtService.sign({
        sub: user.id,
        email: user.email,
      });

      return {
        user,
        token: jwtToken,
      };
    } catch (error) {
      console.error('Google Auth Error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async syncUser(supabaseUser: any) {
    try {
      const { id, email, name, avatarUrl } = supabaseUser;

      if (!email) {
        throw new UnauthorizedException('Email not found in Supabase token');
      }

      // Upsert user in database
      const user = await this.database.user.upsert({
        where: { email },
        update: {
          name,
          avatarUrl,
          // googleId: id, // Opcional: podemos salvar o ID do Supabase aqui por enquanto
        },
        create: {
          email,
          name,
          avatarUrl,
          // googleId: id,
        },
      });

      return user;
    } catch (error) {
      console.error('User Sync Error:', error);
      throw new UnauthorizedException('Failed to sync user');
    }
  }
}
