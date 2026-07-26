import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private jwtService: JwtService,
    private database: DatabaseService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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
